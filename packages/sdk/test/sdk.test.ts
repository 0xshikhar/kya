import { describe, expect, it } from "bun:test"
import { KyaClient } from "../src/client"
import { coston2, flare } from "../src/chains"
import { NodeStatus, JobPhase } from "../src/types"
import type { Address, Hash } from "viem"

const MOCK_ADDRESSES = {
  hub: "0x1111111111111111111111111111111111111111" as Address,
  tree: "0x2222222222222222222222222222222222222222" as Address,
  adapter: "0x3333333333333333333333333333333333333333" as Address,
  policyEngine: "0x4444444444444444444444444444444444444444" as Address,
  credentialRegistry: "0x5555555555555555555555555555555555555555" as Address,
  hashMatchEvaluator: "0x6666666666666666666666666666666666666666" as Address,
}

describe("KYA Network SDK", () => {
  it("initializes KyaClient with Coston2 chain by default", () => {
    const client = new KyaClient({
      addresses: MOCK_ADDRESSES,
    })

    expect(client.chain.id).toBe(114)
    expect(client.chain.name).toBe("Flare Coston2 Testnet")
    expect(client.addresses.hub).toBe(MOCK_ADDRESSES.hub)
  })

  it("supports Flare Mainnet chain configuration", () => {
    const client = new KyaClient({
      chain: flare,
      addresses: MOCK_ADDRESSES,
    })

    expect(client.chain.id).toBe(14)
    expect(client.chain.name).toBe("Flare Mainnet")
  })

  it("throws descriptive error when write operation attempted without wallet account", async () => {
    const client = new KyaClient({
      addresses: MOCK_ADDRESSES,
    })

    expect(
      client.createRoot({
        owner: MOCK_ADDRESSES.hub,
        agent: MOCK_ADDRESSES.hub,
        watchdog: MOCK_ADDRESSES.hub,
        asset: MOCK_ADDRESSES.hub,
        granted: 1000n,
        expiry: 999999n,
      })
    ).rejects.toThrow("WalletClient with an account is required")
  })

  it("exports valid protocol enums", () => {
    expect(NodeStatus.ACTIVE).toBe(0)
    expect(NodeStatus.REVOKED).toBe(1)
    expect(NodeStatus.EXPIRED).toBe(2)

    expect(JobPhase.UNINITIALIZED).toBe(0)
    expect(JobPhase.FUNDED).toBe(1)
    expect(JobPhase.COMPLETED).toBe(3)
  })
})
