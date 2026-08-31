export const MandateHubABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "rootId", type: "bytes32" },
      { name: "amount", type: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "paySettlement",
    inputs: [
      { name: "mandateId", type: "bytes32" },
      { name: "jobId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const MandateTreeABI = [
  {
    type: "function",
    name: "createRoot",
    inputs: [
      { name: "owner", type: "address" },
      { name: "agent", type: "address" },
      { name: "watchdog", type: "address" },
      { name: "asset", type: "address" },
      { name: "granted", type: "uint128" },
      { name: "expiry", type: "uint64" },
      { name: "allowlist", type: "address[]" },
      { name: "policyHash", type: "bytes32" },
    ],
    outputs: [{ name: "rootId", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "spawn",
    inputs: [
      { name: "parentId", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "watchdog", type: "address" },
      { name: "grant", type: "uint128" },
      { name: "expiry", type: "uint64" },
      { name: "allowlist", type: "address[]" },
      { name: "policyHash", type: "bytes32" },
    ],
    outputs: [{ name: "childId", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeSubtree",
    inputs: [{ name: "mandateId", type: "bytes32" }],
    outputs: [{ name: "unspentIdleSwept", type: "uint128" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getNode",
    inputs: [{ name: "nodeId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "parentId", type: "bytes32" },
          { name: "owner", type: "address" },
          { name: "agent", type: "address" },
          { name: "watchdog", type: "address" },
          { name: "asset", type: "address" },
          { name: "granted", type: "uint128" },
          { name: "idle", type: "uint128" },
          { name: "childGranted", type: "uint128" },
          { name: "jobLocked", type: "uint128" },
          { name: "expiry", type: "uint64" },
          { name: "subtreeEpoch", type: "uint32" },
          { name: "seenParentEpoch", type: "uint32" },
          { name: "childCount", type: "uint16" },
          { name: "depth", type: "uint8" },
          { name: "status", type: "uint8" },
          { name: "allowlistHash", type: "bytes32" },
          { name: "policyHash", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const

export const JobAdapterABI = [
  {
    type: "function",
    name: "fundJob",
    inputs: [
      { name: "mandateId", type: "bytes32" },
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "amount", type: "uint128" },
      { name: "deadline", type: "uint64" },
      { name: "expectedDeliverableHash", type: "bytes32" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitJob",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "complete",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refundExpired",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const PolicyEngineABI = [
  {
    type: "function",
    name: "setPolicy",
    inputs: [
      { name: "nodeId", type: "bytes32" },
      { name: "maxSpendPerCallUSD", type: "uint128" },
      { name: "maxSpendPerHourUSD", type: "uint128" },
      { name: "maxSpendPerDayUSD", type: "uint128" },
      { name: "cooldownSeconds", type: "uint32" },
      { name: "allowedTargets", type: "address[]" },
      { name: "allowedSelectors", type: "bytes4[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAssetValueUSD",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "assetDecimals", type: "uint8" },
    ],
    outputs: [{ name: "valueUSD", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validateAndRecordSpend",
    inputs: [
      { name: "nodeId", type: "bytes32" },
      { name: "target", type: "address" },
      { name: "selector", type: "bytes4" },
      { name: "spendUSD", type: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

export const CredentialRegistryABI = [
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "agentAddress", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyAgent",
    inputs: [{ name: "agentId", type: "bytes32" }],
    outputs: [
      { name: "status", type: "uint8" },
      { name: "agentAddress", type: "address" },
      { name: "operatorAddress", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
    stateMutability: "view",
  },
] as const
