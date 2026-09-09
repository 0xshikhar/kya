import { describe, expect, it } from "bun:test"
import { FsaInstructionParser } from "../fsa-executor.js"
import type { Address, Hash } from "viem"

describe("KYA Network — FSA Operator Instruction Parser", () => {
  const treeAddress = "0x5555555555555555555555555555555555555555" as Address
  const sampleMandateId = ("0x" + "a".repeat(64)) as Hash

  it("parses valid XRPL REVOKE memo correctly", () => {
    const memo = `KYA:REVOKE:14:${sampleMandateId}`
    const parsed = FsaInstructionParser.parseMemo(memo)

    expect(parsed.action).toBe("REVOKE")
    expect(parsed.chainId).toBe(14)
    expect(parsed.targetId).toBe(sampleMandateId)
  })

  it("builds valid EVM execution payload with explicit executor fee", () => {
    const memo = `KYA:REVOKE:14:${sampleMandateId}`
    const parsed = FsaInstructionParser.parseMemo(memo)
    const payload = FsaInstructionParser.buildEvmExecution(parsed, treeAddress)

    expect(payload.to).toBe(treeAddress)
    expect(payload.data.startsWith("0x")).toBe(true)
    expect(payload.executorFeeFLR).toBeGreaterThan(0) // Explicit non-zero gas model
  })

  it("rejects invalid memo formats", () => {
    expect(() => FsaInstructionParser.parseMemo("INVALID:REVOKE:14:0x123")).toThrow("Invalid memo prefix")
    expect(() => FsaInstructionParser.parseMemo("KYA:UNKNOWN_ACTION:14")).toThrow("Unknown FSA action")
  })
})
