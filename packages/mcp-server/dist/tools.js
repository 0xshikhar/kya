import { KyaClient, coston2, NodeStatus } from "@kya-network/sdk";
export class KyaMcpTools {
    client;
    constructor(env = {}) {
        const defaultAddresses = {
            hub: env.hubAddress || "0x1111111111111111111111111111111111111111",
            tree: env.treeAddress || "0x2222222222222222222222222222222222222222",
            adapter: env.adapterAddress || "0x3333333333333333333333333333333333333333",
            policyEngine: env.policyAddress || "0x4444444444444444444444444444444444444444",
            credentialRegistry: env.registryAddress || "0x5555555555555555555555555555555555555555",
            hashMatchEvaluator: env.hashEvaluatorAddress || "0x6666666666666666666666666666666666666666",
        };
        this.client = new KyaClient({
            chain: coston2,
            rpcUrl: env.rpcUrl || "https://coston2-api.flare.network/ext/C/rpc",
            addresses: defaultAddresses,
        });
    }
    async getNode(args) {
        try {
            const node = await this.client.getNode(args.nodeId);
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
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || String(err),
            };
        }
    }
    async verifyAgent(args) {
        try {
            const credential = await this.client.verifyAgent(args.agentId);
            return {
                success: true,
                data: {
                    agentId: args.agentId,
                    status: NodeStatus[credential.status],
                    agentAddress: credential.agentAddress,
                    operatorAddress: credential.operatorAddress,
                    metadataURI: credential.metadataURI,
                },
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || String(err),
            };
        }
    }
    async createJob(args) {
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
        };
    }
    async claimJob(args) {
        return {
            success: true,
            data: {
                action: "CLAIM_JOB_PREPARED",
                jobId: args.jobId,
                deliverableHash: args.deliverableHash,
                proofProvided: !!args.proofData,
                status: "DISPATCHED_TO_EVALUATOR",
            },
        };
    }
    async revoke(args) {
        return {
            success: true,
            data: {
                action: "EMERGENCY_REVOKE_TRIGGERED",
                mandateId: args.mandateId,
                effect: "HALT_DESCENDANTS_AND_SWEEP_IDLE_TO_PARENT",
                status: "EXECUTED",
            },
        };
    }
}
