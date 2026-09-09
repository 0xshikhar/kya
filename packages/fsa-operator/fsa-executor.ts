import { encodeFunctionData, type Hash, type Address } from "viem"
import { MandateTreeABI } from "@kya-network/sdk"

export interface XrplInstruction {
  action: "REVOKE" | "CREATE_ROOT"
  chainId: number
  targetId?: Hash
  agent?: Address
  watchdog?: Address
  granted?: bigint
}

export interface ExecutionPayload {
  to: Address
  data: Hash
  estimatedGas: bigint
  executorFeeFLR: number
}

export class FsaInstructionParser {
  public static parseMemo(memo: string): XrplInstruction {
    const parts = memo.trim().split(":")
    if (parts[0] !== "KYA") {
      throw new Error(`Invalid memo prefix: expected 'KYA', got '${parts[0]}'`)
    }

    const action = parts[1]
    const chainId = parseInt(parts[2], 10)

    if (action === "REVOKE") {
      const targetId = parts[3] as Hash
      if (!targetId || !targetId.startsWith("0x")) {
        throw new Error("Invalid targetId for REVOKE instruction")
      }
      return { action: "REVOKE", chainId, targetId }
    }

    if (action === "CREATE_ROOT") {
      const agent = parts[3] as Address
      const watchdog = parts[4] as Address
      const granted = BigInt(parts[5])
      return { action: "CREATE_ROOT", chainId, agent, watchdog, granted }
    }

    throw new Error(`Unknown FSA action: ${action}`)
  }

  public static buildEvmExecution(
    instruction: XrplInstruction,
    treeAddress: Address
  ): ExecutionPayload {
    if (instruction.action === "REVOKE") {
      const data = encodeFunctionData({
        abi: MandateTreeABI,
        functionName: "revokeSubtree",
        args: [instruction.targetId!],
      })
      return {
        to: treeAddress,
        data,
        estimatedGas: 150_000n,
        executorFeeFLR: 0.15, // ~150k gas @ 25-50 gwei on Flare + 0.1 FLR margin
      }
    }

    throw new Error(`Execution payload generation not implemented for ${instruction.action}`)
  }
}
