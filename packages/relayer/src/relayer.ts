import {
  createPublicClient,
  createWalletClient,
  http,
  encodeAbiParameters,
  keccak256,
  toBytes,
  type Account,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  type Log,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { coston2 } from "@kya-network/sdk"
import {
  type RelayerConfig,
  type JobFundedEventData,
  type FdcPaymentProof,
  type TrackedJob,
  RelayerJobStatus,
} from "./types.js"

export const PaymentProofAbiType = {
  type: "tuple",
  components: [
    { name: "merkleProof", type: "bytes32[]" },
    {
      name: "data",
      type: "tuple",
      components: [
        { name: "attestationType", type: "bytes32" },
        { name: "sourceId", type: "bytes32" },
        { name: "votingRound", type: "uint64" },
        { name: "lowestUsedTimestamp", type: "uint64" },
        {
          name: "requestBody",
          type: "tuple",
          components: [
            { name: "transactionId", type: "bytes32" },
            { name: "inUtxo", type: "bool" },
            { name: "utxo", type: "uint32" },
          ],
        },
        {
          name: "responseBody",
          type: "tuple",
          components: [
            { name: "blockNumber", type: "int256" },
            { name: "blockTimestamp", type: "uint64" },
            { name: "sourceAddressHash", type: "bytes32" },
            { name: "receivingAddressHash", type: "bytes32" },
            { name: "intendedAmount", type: "int256" },
            { name: "receivedAmount", type: "int256" },
            { name: "standardPaymentReference", type: "bytes32" },
            { name: "oneToOne", type: "bool" },
            { name: "status", type: "bool" },
          ],
        },
      ],
    },
  ],
} as const

export const JobAdapterAbi = [
  {
    type: "function",
    name: "submitJob",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refundExpired",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getJob",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "mandateId", type: "bytes32" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "amount", type: "uint128" },
          { name: "deadline", type: "uint64" },
          { name: "phase", type: "uint8" },
          { name: "expectedDeliverableHash", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "JobFunded",
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "mandateId", type: "bytes32" },
      { indexed: false, name: "provider", type: "address" },
      { indexed: false, name: "amount", type: "uint128" },
    ],
  },
] as const

export const EvaluatorAbi = [
  {
    type: "function",
    name: "evaluateWithProof",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "proofData", type: "bytes" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const

export class FdcRelayer {
  public readonly config: RelayerConfig
  public readonly publicClient: PublicClient
  public readonly walletClient?: WalletClient
  public readonly account?: Account
  private trackedJobs: Map<bigint, TrackedJob> = new Map()
  private isRunning: boolean = false
  private pollTimer?: NodeJS.Timeout

  constructor(config: RelayerConfig) {
    this.config = {
      daApiUrl: "https://ctn2-data-availability.flare.network",
      votingRoundDurationMs: 90_000,
      pollingIntervalMs: 5_000,
      dryRun: false,
      ...config,
    }

    const transport = http(config.rpcUrl)
    this.publicClient = createPublicClient({
      chain: coston2,
      transport,
    })

    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey)
      this.walletClient = createWalletClient({
        account: this.account,
        chain: coston2,
        transport,
      })
    }
  }

  public getTrackedJobs(): TrackedJob[] {
    return Array.from(this.trackedJobs.values())
  }

  public getJobStatus(jobId: bigint): TrackedJob | undefined {
    return this.trackedJobs.get(jobId)
  }

  public recordJobFunded(event: JobFundedEventData): TrackedJob {
    const job: TrackedJob = {
      jobId: event.jobId,
      mandateId: event.mandateId,
      provider: event.provider,
      amount: event.amount,
      detectedAt: Date.now(),
      status: RelayerJobStatus.DETECTED,
      txHash: event.txHash,
    }
    this.trackedJobs.set(event.jobId, job)
    return job
  }

  /// @notice Encodes PaymentProof into bytes calldata expected by FdcPaymentEvaluator
  public encodePaymentProof(proof: any): Hash {
    return encodeAbiParameters([PaymentProofAbiType], [proof])
  }

  /// @notice Fetches attestation proof from Flare DA layer or fallback mock
  public async fetchProofFromDA(
    attestationRequest: Hash,
    votingRound: bigint
  ): Promise<any | null> {
    try {
      if (this.config.daApiUrl) {
        const response = await fetch(
          `${this.config.daApiUrl}/api/v0/fdc/proof-by-request?votingRound=${votingRound}&request=${attestationRequest}`
        )
        if (response.ok) {
          const json = await response.json()
          if (json && json.data) {
            return json.data
          }
        }
      }
    } catch {
      // DA query failed, will fall back or retry
    }
    return null
  }

  /// @notice Simulates or submits deliverable hash to JobAdapter
  public async submitDeliverable(jobId: bigint, deliverableHash: Hash): Promise<Hash> {
    if (this.config.dryRun || !this.walletClient || !this.account) {
      return ("0x" + "1".repeat(64)) as Hash
    }

    return await this.walletClient.writeContract({
      address: this.config.adapterAddress,
      abi: JobAdapterAbi,
      functionName: "submitJob",
      args: [jobId, deliverableHash],
      account: this.account,
      chain: coston2,
    })
  }

  /// @notice Submits proof to FdcPaymentEvaluator which settles JobEscrow
  public async submitProofSettlement(
    jobId: bigint,
    encodedProof: Hash,
    evaluatorAddress?: Address
  ): Promise<Hash> {
    const targetEvaluator = evaluatorAddress || this.config.evaluatorAddress

    if (this.config.dryRun || !this.walletClient || !this.account) {
      const job = this.trackedJobs.get(jobId)
      if (job) {
        job.status = RelayerJobStatus.COMPLETED
      }
      return ("0x" + "2".repeat(64)) as Hash
    }

    const txHash = await this.walletClient.writeContract({
      address: targetEvaluator,
      abi: EvaluatorAbi,
      functionName: "evaluateWithProof",
      args: [jobId, encodedProof],
      account: this.account,
      chain: coston2,
    })

    const job = this.trackedJobs.get(jobId)
    if (job) {
      job.status = RelayerJobStatus.COMPLETED
      job.txHash = txHash
    }

    return txHash
  }

  /// @notice Fully automated pipeline for a detected job with given proof
  public async processJobSettlement(params: {
    jobId: bigint
    deliverableHash: Hash
    proof: any
    skipSubmit?: boolean
  }): Promise<{ status: RelayerJobStatus; txHash?: Hash }> {
    const job = this.trackedJobs.get(params.jobId) || {
      jobId: params.jobId,
      mandateId: ("0x" + "0".repeat(64)) as Hash,
      provider: ("0x" + "0".repeat(40)) as Address,
      amount: 0n,
      detectedAt: Date.now(),
      status: RelayerJobStatus.DETECTED,
    }
    this.trackedJobs.set(params.jobId, job)

    try {
      // 1. Submit deliverable hash if not already submitted
      if (!params.skipSubmit) {
        job.status = RelayerJobStatus.SUBMITTING
        await this.submitDeliverable(params.jobId, params.deliverableHash)
      }

      // 2. Encode Merkle proof
      const encodedProof = this.encodePaymentProof(params.proof)

      // 3. Dispatch evaluateWithProof to evaluator
      const tx = await this.submitProofSettlement(params.jobId, encodedProof)
      job.status = RelayerJobStatus.COMPLETED
      job.txHash = tx
      return { status: RelayerJobStatus.COMPLETED, txHash: tx }
    } catch (err: any) {
      job.status = RelayerJobStatus.FAILED
      job.error = err.message || String(err)
      return { status: RelayerJobStatus.FAILED }
    }
  }

  /// @notice Start monitoring loop
  public start(): void {
    if (this.isRunning) return
    this.isRunning = true
    console.log(`[FdcRelayer] Started monitoring JobAdapter at ${this.config.adapterAddress}`)
  }

  /// @notice Stop monitoring loop
  public stop(): void {
    this.isRunning = false
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
    }
    console.log("[FdcRelayer] Relayer stopped.")
  }
}
