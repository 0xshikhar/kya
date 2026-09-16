import type { Address, Hash } from "viem";
export interface McpServerEnv {
    rpcUrl?: string;
    hubAddress?: Address;
    treeAddress?: Address;
    adapterAddress?: Address;
    policyAddress?: Address;
    registryAddress?: Address;
    hashEvaluatorAddress?: Address;
}
export declare class KyaMcpTools {
    private client;
    constructor(env?: McpServerEnv);
    getNode(args: {
        nodeId: Hash;
    }): Promise<{
        success: boolean;
        data: {
            nodeId: `0x${string}`;
            owner: `0x${string}`;
            agent: `0x${string}`;
            watchdog: `0x${string}`;
            asset: `0x${string}`;
            granted: string;
            idle: string;
            childGranted: string;
            jobLocked: string;
            status: string;
            depth: number;
            isConserved: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    verifyAgent(args: {
        agentId: Hash;
    }): Promise<{
        success: boolean;
        data: {
            agentId: `0x${string}`;
            status: string;
            agentAddress: `0x${string}`;
            operatorAddress: `0x${string}`;
            metadataURI: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    createJob(args: {
        mandateId: Hash;
        provider: Address;
        evaluator: Address;
        amount: string;
        deadline: number;
        expectedHash?: Hash;
    }): Promise<{
        success: boolean;
        data: {
            action: string;
            mandateId: `0x${string}`;
            provider: `0x${string}`;
            evaluator: `0x${string}`;
            amount: string;
            deadline: number;
            expectedHash: string;
            status: string;
        };
    }>;
    claimJob(args: {
        jobId: string;
        deliverableHash: Hash;
        proofData?: string;
    }): Promise<{
        success: boolean;
        data: {
            action: string;
            jobId: string;
            deliverableHash: `0x${string}`;
            proofProvided: boolean;
            status: string;
        };
    }>;
    revoke(args: {
        mandateId: Hash;
    }): Promise<{
        success: boolean;
        data: {
            action: string;
            mandateId: `0x${string}`;
            effect: string;
            status: string;
        };
    }>;
}
