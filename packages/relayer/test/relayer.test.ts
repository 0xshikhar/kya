import { describe, expect, it } from "bun:test"
import { FdcRelayer } from "../src/relayer.js"
import { RelayerJobStatus } from "../src/types.js"
import { type Hash, type Address, decodeAbiParameters } from "viem"
import { PaymentProofAbiType } from "../src/relayer.js"

describe("KYA Network — FdcRelayer", () => {
  const dummyConfig = {
    rpcUrl: "https://coston2-api.flare.network/ext/C/rpc",
    adapterAddress: "0x1111111111111111111111111111111111111111" as Address,
    evaluatorAddress: "0x2222222222222222222222222222222222222222" as Address,
    dryRun: true,
  }

  const sampleProof = {
    merkleProof: [
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hash,
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hash,
    ],
    data: {
      attestationType: ("0x" + "1".repeat(64)) as Hash,
      sourceId: ("0x" + "2".repeat(64)) as Hash,
      votingRound: 4200n,
      lowestUsedTimestamp: 1726000000n,
      requestBody: {
        transactionId: ("0x" + "3".repeat(64)) as Hash,
        inUtxo: false,
        utxo: 0,
      },
      responseBody: {
        blockNumber: 123456n,
        blockTimestamp: 1726000050n,
        sourceAddressHash: ("0x" + "4".repeat(64)) as Hash,
        receivingAddressHash: ("0x" + "5".repeat(64)) as Hash,
        intendedAmount: 50_000_000n,
        receivedAmount: 50_000_000n,
        standardPaymentReference: ("0x" + "6".repeat(64)) as Hash,
        oneToOne: true,
        status: true,
      },
    },
  }

  it("encodes and roundtrips FDC PaymentProof conforming to Solidity IFdcVerification", () => {
    const relayer = new FdcRelayer(dummyConfig)
    const encoded = relayer.encodePaymentProof(sampleProof)

    expect(encoded.startsWith("0x")).toBe(true)
    expect(encoded.length).toBeGreaterThan(100)

    const [decoded] = decodeAbiParameters([PaymentProofAbiType], encoded) as [any]
    expect(decoded.merkleProof.length).toBe(2)
    expect(decoded.data.votingRound).toBe(4200n)
    expect(decoded.data.responseBody.receivedAmount).toBe(50_000_000n)
    expect(decoded.data.responseBody.status).toBe(true)
  })

  it("records detected JobFunded events into tracked job state", () => {
    const relayer = new FdcRelayer(dummyConfig)
    const tracked = relayer.recordJobFunded({
      jobId: 101n,
      mandateId: ("0x" + "a".repeat(64)) as Hash,
      provider: "0x3333333333333333333333333333333333333333" as Address,
      amount: 100_000_000n,
      blockNumber: 5000n,
      txHash: ("0x" + "b".repeat(64)) as Hash,
    })

    expect(tracked.jobId).toBe(101n)
    expect(tracked.status).toBe(RelayerJobStatus.DETECTED)
    expect(relayer.getJobStatus(101n)?.amount).toBe(100_000_000n)
  })

  it("executes simulated end-to-end settlement pipeline in dry-run mode", async () => {
    const relayer = new FdcRelayer(dummyConfig)
    const deliverableHash = ("0x" + "9".repeat(64)) as Hash

    const result = await relayer.processJobSettlement({
      jobId: 77n,
      deliverableHash,
      proof: sampleProof,
    })

    expect(result.status).toBe(RelayerJobStatus.COMPLETED)
    expect(result.txHash).toBeDefined()
    expect(relayer.getJobStatus(77n)?.status).toBe(RelayerJobStatus.COMPLETED)
  })
})
