import { describe, expect, it } from "bun:test"
import { KyaMcpTools } from "../src/tools.js"
import type { Hash, Address } from "viem"

describe("KYA Network — MCP Tools", () => {
  const tools = new KyaMcpTools()
  const sampleMandateId = ("0x" + "a".repeat(64)) as Hash

  it("prepares createJob payload correctly with ERC-8183 params", async () => {
    const res = await tools.createJob({
      mandateId: sampleMandateId,
      provider: "0x1111111111111111111111111111111111111111" as Address,
      evaluator: "0x2222222222222222222222222222222222222222" as Address,
      amount: "50000000",
      deadline: 1800000000,
    })

    expect(res.success).toBe(true)
    expect(res.data.action).toBe("CREATE_JOB_PREPARED")
    expect(res.data.mandateId).toBe(sampleMandateId)
    expect(res.data.amount).toBe("50000000")
  })

  it("prepares emergency revoke payload with fail-closed sweeping semantics", async () => {
    const res = await tools.revoke({ mandateId: sampleMandateId })

    expect(res.success).toBe(true)
    expect(res.data.action).toBe("EMERGENCY_REVOKE_TRIGGERED")
    expect(res.data.effect).toContain("SWEEP_IDLE_TO_PARENT")
  })

  it("prepares claimJob with deliverable hash", async () => {
    const deliverable = ("0x" + "c".repeat(64)) as Hash
    const res = await tools.claimJob({
      jobId: "42",
      deliverableHash: deliverable,
    })

    expect(res.success).toBe(true)
    expect(res.data.action).toBe("CLAIM_JOB_PREPARED")
    expect(res.data.jobId).toBe("42")
    expect(res.data.deliverableHash).toBe(deliverable)
  })
})
