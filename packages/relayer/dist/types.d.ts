import type { Address, Hash } from "viem";
export interface RelayerConfig {
    rpcUrl: string;
    adapterAddress: Address;
    evaluatorAddress: Address;
    privateKey?: `0x${string}`;
    daApiUrl?: string;
    votingRoundDurationMs?: number;
    pollingIntervalMs?: number;
    dryRun?: boolean;
}
export interface JobFundedEventData {
    jobId: bigint;
    mandateId: Hash;
    provider: Address;
    amount: bigint;
    blockNumber: bigint;
    txHash: Hash;
}
export interface PaymentResponseBody {
    blockNumber: bigint;
    blockTimestamp: bigint;
    sourceAddressHash: Hash;
    receivingAddressHash: Hash;
    standardPaymentReference: Hash;
    spentAmount: bigint;
    receivedAmount: bigint;
    oneToOne: boolean;
    status: boolean;
}
export interface PaymentRequestBody {
    transactionId: Hash;
    inUtxo: bigint;
    utxo: bigint;
}
export interface FdcPaymentProof {
    merkleProof: Hash[];
    data: {
        attestationType: Hash;
        sourceId: Hash;
        votingRound: bigint;
        lowestUsedTimestamp: bigint;
        requestBody: PaymentRequestBody;
        responseBody: PaymentResponseBody;
    };
}
export declare enum RelayerJobStatus {
    DETECTED = "DETECTED",
    WAITING_ROUND = "WAITING_ROUND",
    PROOF_READY = "PROOF_READY",
    SUBMITTING = "SUBMITTING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    FAILED = "FAILED"
}
export interface TrackedJob {
    jobId: bigint;
    mandateId: Hash;
    provider: Address;
    amount: bigint;
    detectedAt: number;
    status: RelayerJobStatus;
    votingRound?: bigint;
    txHash?: Hash;
    error?: string;
}
