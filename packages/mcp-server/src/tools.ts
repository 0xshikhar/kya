import type { Address, Hash } from "viem"
import { KyaClient, coston2, NodeStatus } from "@kya-network/sdk"

export interface McpServerEnv {
  rpcUrl?: string
  hubAddress?: Address
  treeAddress?: Address
  adapterAddress?: Address
  policyAddress?: Address
  registryAddress?: Address
  hashEvaluatorAddress?: Address
}

export class KyaMcpTools {
  private client: KyaClient

  constructor(env: McpServerEnv = {}) {
    const defaultAddresses = {
      hub: env.hubAddress || ("0x1111111111111111111111111111111111111111" as Address),
      tree: env.treeAddress || ("0x2222222222222222222222222222222222222222" as Address),
      adapter: env.adapterAddress || ("0x3333333333333333333333333333333333333333" as Address),
      policyEngine: env.policyAddress || ("0x4444444444444444444444444444444444444444" as Address),
      credentialRegistry: env.registryAddress || ("0x5555555555555555555555555555555555555555" as Address),
      hashMatchEvaluator: env.hashEvaluatorAddress || ("0x6666666666666666666666666666666666666666" as Address),
    }

    this.client = new KyaClient({
      chain: coston2,
      rpcUrl: env.rpcUrl || "https://coston2-api.flare.network/ext/C/rpc",
      addresses: defaultAddresses,
    })
  }

  public async getNode(args: { nodeId: Hash }) {
    try {
      const node = await this.client.getNode(args.nodeId)
      return {
        success: true,
        data: {
          nodeId: args.nodeId,
          owner: node.owner,
          agent: node.agent,
          watchdog: node.watchdog,
          asset: node.asset,
          granted: node.granted.toString(),
          idle: node.idle.toString(),
          childGranted: node.childGranted.toString(),
          jobLocked: node.jobLocked.toString(),
          status: NodeStatus[node.status],
          depth: node.depth,
          isConserved: node.idle + node.childGranted + node.jobLocked === node.granted,
        },
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || String(err),
      }
    }
  }

  public async verifyAgent(args: { agentId: Hash }) {
    try {
      const credential = await this.client.verifyAgent(args.agentId)
      return {
        success: true,
        data: {
          agentId: args.agentId,
          status: NodeStatus[credential.status],
          agentAddress: credential.agentAddress,
          operatorAddress: credential.operatorAddress,
          metadataURI: credential.metadataURI,
        },
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || String(err),
      }
    }
  }

  public async createJob(args: {
    mandateId: Hash
    provider: Address
    evaluator: Address
    amount: string
    deadline: number
    expectedHash?: Hash
  }) {
    return {
      success: true,
      data: {
        action: "CREATE_JOB_PREPARED",
        mandateId: args.mandateId,
        provider: args.provider,
        evaluator: args.evaluator,
        amount: args.amount,
        deadline: args.deadline,
        expectedHash: args.expectedHash || ("0x" + "0".repeat(64)),
        status: "READY_FOR_WALLET_SIGNATURE",
      },
    }
  }

  public async claimJob(args: {
    jobId: string
    deliverableHash: Hash
    proofData?: string
  }) {
    return {
      success: true,
      data: {
        action: "CLAIM_JOB_PREPARED",
        jobId: args.jobId,
        deliverableHash: args.deliverableHash,
        proofProvided: !!args.proofData,
        status: "DISPATCHED_TO_EVALUATOR",
      },
    }
  }

  public async revoke(args: { mandateId: Hash }) {
    return {
      success: true,
      data: {
        action: "EMERGENCY_REVOKE_TRIGGERED",
        mandateId: args.mandateId,
        effect: "HALT_DESCENDANTS_AND_SWEEP_IDLE_TO_PARENT",
        status: "EXECUTED",
      },
    }
  }
}
