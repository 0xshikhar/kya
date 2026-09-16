import { type Account, type Address, type Hash, type PublicClient, type WalletClient } from "viem";
import { type RelayerConfig, type JobFundedEventData, type TrackedJob, RelayerJobStatus } from "./types.js";
export declare const PaymentProofAbiType: {
    readonly type: "tuple";
    readonly components: readonly [{
        readonly name: "merkleProof";
        readonly type: "bytes32[]";
    }, {
        readonly name: "data";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "attestationType";
            readonly type: "bytes32";
        }, {
            readonly name: "sourceId";
            readonly type: "bytes32";
        }, {
            readonly name: "votingRound";
            readonly type: "uint64";
        }, {
            readonly name: "lowestUsedTimestamp";
            readonly type: "uint64";
        }, {
            readonly name: "requestBody";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly name: "transactionId";
                readonly type: "bytes32";
            }, {
                readonly name: "inUtxo";
                readonly type: "bool";
            }, {
                readonly name: "utxo";
                readonly type: "uint32";
            }];
        }, {
            readonly name: "responseBody";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly name: "blockNumber";
                readonly type: "int256";
            }, {
                readonly name: "blockTimestamp";
                readonly type: "uint64";
            }, {
                readonly name: "sourceAddressHash";
                readonly type: "bytes32";
            }, {
                readonly name: "receivingAddressHash";
                readonly type: "bytes32";
            }, {
                readonly name: "intendedAmount";
                readonly type: "int256";
            }, {
                readonly name: "receivedAmount";
                readonly type: "int256";
            }, {
                readonly name: "standardPaymentReference";
                readonly type: "bytes32";
            }, {
                readonly name: "oneToOne";
                readonly type: "bool";
            }, {
                readonly name: "status";
                readonly type: "bool";
            }];
        }];
    }];
};
export declare const JobAdapterAbi: readonly [{
    readonly type: "function";
    readonly name: "submitJob";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
    }, {
        readonly name: "deliverableHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "refundExpired";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getJob";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "jobId";
            readonly type: "uint256";
        }, {
            readonly name: "mandateId";
            readonly type: "bytes32";
        }, {
            readonly name: "provider";
            readonly type: "address";
        }, {
            readonly name: "evaluator";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint128";
        }, {
            readonly name: "deadline";
            readonly type: "uint64";
        }, {
            readonly name: "phase";
            readonly type: "uint8";
        }, {
            readonly name: "expectedDeliverableHash";
            readonly type: "bytes32";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "JobFunded";
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "jobId";
        readonly type: "uint256";
    }, {
        readonly indexed: true;
        readonly name: "mandateId";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly name: "provider";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "amount";
        readonly type: "uint128";
    }];
}];
export declare const EvaluatorAbi: readonly [{
    readonly type: "function";
    readonly name: "evaluateWithProof";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
    }, {
        readonly name: "proofData";
        readonly type: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
}];
export declare class FdcRelayer {
    readonly config: RelayerConfig;
    readonly publicClient: PublicClient;
    readonly walletClient?: WalletClient;
    readonly account?: Account;
    private trackedJobs;
    private isRunning;
    private pollTimer?;
    constructor(config: RelayerConfig);
    getTrackedJobs(): TrackedJob[];
    getJobStatus(jobId: bigint): TrackedJob | undefined;
    recordJobFunded(event: JobFundedEventData): TrackedJob;
    encodePaymentProof(proof: any): Hash;
    fetchProofFromDA(attestationRequest: Hash, votingRound: bigint): Promise<any | null>;
    submitDeliverable(jobId: bigint, deliverableHash: Hash): Promise<Hash>;
    submitProofSettlement(jobId: bigint, encodedProof: Hash, evaluatorAddress?: Address): Promise<Hash>;
    processJobSettlement(params: {
        jobId: bigint;
        deliverableHash: Hash;
        proof: any;
        skipSubmit?: boolean;
    }): Promise<{
        status: RelayerJobStatus;
        txHash?: Hash;
    }>;
    start(): void;
    stop(): void;
}
