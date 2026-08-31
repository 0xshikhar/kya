import type { Address, Hash } from "viem"

export enum NodeStatus {
  ACTIVE = 0,
  REVOKED = 1,
  EXPIRED = 2,
}

export enum JobPhase {
  UNINITIALIZED = 0,
  FUNDED = 1,
  SUBMITTED = 2,
  COMPLETED = 3,
  REJECTED = 4,
  REFUNDED = 5,
}

export interface MandateNode {
  parentId: Hash
  owner: Address
  agent: Address
  watchdog: Address
  asset: Address
  granted: bigint
  idle: bigint
  childGranted: bigint
  jobLocked: bigint
  expiry: bigint
  subtreeEpoch: number
  seenParentEpoch: number
  childCount: number
  depth: number
  status: NodeStatus
  allowlistHash: Hash
  policyHash: Hash
}

export interface OpenJob {
  jobId: bigint
  mandateId: Hash
  provider: Address
  evaluator: Address
  amount: bigint
  deadline: bigint
  phase: JobPhase
  expectedDeliverableHash: Hash
}

export interface KyaAddresses {
  hub: Address
  tree: Address
  adapter: Address
  policyEngine: Address
  credentialRegistry: Address
  hashMatchEvaluator: Address
  fdcPaymentEvaluator?: Address
  fdcEvmTxEvaluator?: Address
}

export interface CreateRootParams {
  owner: Address
  agent: Address
  watchdog: Address
  asset: Address
  granted: bigint
  expiry: bigint
  allowlist?: Address[]
  policyHash?: Hash
}

export interface SpawnParams {
  parentId: Hash
  agent: Address
  watchdog: Address
  granted: bigint
  expiry: bigint
  allowlist?: Address[]
  policyHash?: Hash
}

export interface FundJobParams {
  mandateId: Hash
  provider: Address
  evaluator: Address
  amount: bigint
  deadline: bigint
  expectedHash?: Hash
}

export interface IntegrityPack {
  protocol: string
  version: string
  network: string
  chainId: number
  timestamp: string
  rootMandate: {
    id: Hash
    granted: string
    idle: string
    childAllocated: string
    jobLocked: string
    isConserved: boolean
  }
}
