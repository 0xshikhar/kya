import { type Hash } from "viem"

export interface DemoNodeData {
  id: string
  label: string
  role: "root" | "orchestrator" | "worker" | "escrow" | "watchdog"
  granted: number
  idle: number
  locked: number
  depth: number
  status: "ACTIVE" | "REVOKED" | "SETTLED" | "FUNDED"
  asset: "FXRP" | "FLR" | "USDC"
  ftsoCapUSD?: number
  allowlistCount: number
  agentAddress: string
  mandateId: string
  activeJob?: {
    id: number
    provider: string
    amount: number
    status: string
  }
}

export interface DemoGraphState {
  nodes: any[]
  edges: any[]
  rootNode: DemoNodeData
  isConserved: boolean
  events: any[]
}

const ROOT_ID = "0x8f7c114a00000000000000000000000000000000000000000000000000000001" as Hash
const SENTINEL_ID = "0x8f7c114a00000000000000000000000000000000000000000000000000000002" as Hash
const ALPHA_ID = "0x8f7c114a00000000000000000000000000000000000000000000000000000003" as Hash
const BETA_ID = "0x8f7c114a00000000000000000000000000000000000000000000000000000004" as Hash

// In-memory simulation state for the interactive operator dashboard
let currentState = getInitialState()

export function getInitialState(): DemoGraphState {
  const rootNode: DemoNodeData = {
    id: ROOT_ID,
    label: "Master Treasury Mandate",
    role: "root",
    granted: 65000,
    idle: 45000,
    locked: 0,
    depth: 0,
    status: "ACTIVE",
    asset: "FXRP",
    allowlistCount: 8,
    agentAddress: "0x1111111111111111111111111111111111111111",
    mandateId: ROOT_ID,
  }

  const sentinelNode: DemoNodeData = {
    id: SENTINEL_ID,
    label: "FAssets Vault Sentinel",
    role: "orchestrator",
    granted: 20000,
    idle: 15000,
    locked: 0,
    depth: 1,
    status: "ACTIVE",
    asset: "FXRP",
    ftsoCapUSD: 50,
    allowlistCount: 4,
    agentAddress: "0x2222222222222222222222222222222222222222",
    mandateId: SENTINEL_ID,
  }

  const alphaNode: DemoNodeData = {
    id: ALPHA_ID,
    label: "Worker Agent Alpha",
    role: "worker",
    granted: 3500,
    idle: 3500,
    locked: 0,
    depth: 2,
    status: "ACTIVE",
    asset: "FXRP",
    ftsoCapUSD: 25,
    allowlistCount: 2,
    agentAddress: "0x3333333333333333333333333333333333333333",
    mandateId: ALPHA_ID,
  }

  const betaNode: DemoNodeData = {
    id: BETA_ID,
    label: "Worker Agent Beta",
    role: "worker",
    granted: 1500,
    idle: 1500,
    locked: 0,
    depth: 2,
    status: "ACTIVE",
    asset: "FXRP",
    ftsoCapUSD: 25,
    allowlistCount: 1,
    agentAddress: "0x4444444444444444444444444444444444444444",
    mandateId: BETA_ID,
  }

  const nodes = [
    { id: ROOT_ID, type: "mandateNode", position: { x: 380, y: 20 }, data: rootNode },
    { id: SENTINEL_ID, type: "mandateNode", position: { x: 380, y: 190 }, data: sentinelNode },
    { id: ALPHA_ID, type: "mandateNode", position: { x: 180, y: 380 }, data: alphaNode },
    { id: BETA_ID, type: "mandateNode", position: { x: 580, y: 380 }, data: betaNode },
  ]

  const edges = [
    { id: "e-root-sentinel", source: ROOT_ID, target: SENTINEL_ID, animated: true, style: { stroke: "#E84142", strokeWidth: 2 } },
    { id: "e-sentinel-alpha", source: SENTINEL_ID, target: ALPHA_ID, animated: true, style: { stroke: "#10b981", strokeWidth: 2 } },
    { id: "e-sentinel-beta", source: SENTINEL_ID, target: BETA_ID, animated: true, style: { stroke: "#64748b", strokeWidth: 2 } },
  ]

  const events = [
    {
      id: "ev-0",
      type: "ROOT_CREATED",
      title: "Root Mandate Initialized",
      details: "Treasury deposited $65,000 FXRP with FtsoV2 USD containment.",
      txHash: "0x3f8a9201948274aefb1901847120485918237491028374910283749102837491",
      timestamp: "Block #1048201",
    },
    {
      id: "ev-1",
      type: "SPAWN",
      title: "Sentinel Spawned",
      details: "Granted $20,000 FXRP. Subtree policy $50/call FTSOv2 limit.",
      txHash: "0x7a2f819038274619028374619283746192837461928374619283746192837461",
      timestamp: "Block #1048205",
    },
    {
      id: "ev-2",
      type: "SPAWN",
      title: "Worker Swarm Initialized",
      details: "Worker Alpha ($3,500) and Worker Beta ($1,500) live on Coston2.",
      txHash: "0x8920192837461928374619283746192837461928374619283746192837461928",
      timestamp: "Block #1048210",
    },
  ]

  return {
    nodes,
    edges,
    rootNode,
    isConserved: true,
    events,
  }
}

export function fetchCurrentState(): DemoGraphState {
  return currentState
}

export function executePath1_Happy(): { success: boolean; message: string } {
  // Scenario 1: Worker Alpha funds $25 FXRP job -> Valid deliverable -> Hash matched -> Released
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState

  const alpha = state.nodes.find((n) => n.id === ALPHA_ID)
  if (alpha) {
    alpha.data.idle = 3475
    alpha.data.locked = 0
    alpha.data.status = "SETTLED"
    alpha.data.activeJob = {
      id: 101,
      provider: "0x92db14e4...62de0",
      amount: 25,
      status: "COMPLETED",
    }
  }

  state.events.push(
    {
      id: `ev-${Date.now()}-1`,
      type: "JOB_FUNDED",
      title: "Escrow Job #101 Funded",
      details: "Worker Alpha locked $25 FXRP for verifiable inference batch.",
      txHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
      timestamp: "Block #1048240",
    },
    {
      id: `ev-${Date.now()}-2`,
      type: "FTSO_CHECK",
      title: "FTSOv2 Price Feed Query",
      details: "FXRP/USD = $0.58. Spend $25 FXRP ($14.50 USD) within $25 USD limit.",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      timestamp: "Block #1048240",
    },
    {
      id: `ev-${Date.now()}-3`,
      type: "JOB_COMPLETED",
      title: "HashMatch Evaluator Passed",
      details: "Deliverable keccak256 hash verified. $25 FXRP released to provider.",
      txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      timestamp: "Block #1048242",
    }
  )

  currentState = state
  return {
    success: true,
    message: "Path 1 executed: Job #101 verified via HashMatch and settled successfully.",
  }
}

export function executePath2_LimitBreach(): { success: boolean; message: string } {
  // Scenario 2: Worker Alpha attempts $60 USD call against $25 USD limit
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState

  state.events.push(
    {
      id: `ev-${Date.now()}-1`,
      type: "FTSO_CHECK",
      title: "FTSOv2 Price Evaluation",
      details: "Evaluating spend: 104 FXRP @ $0.58 = $60.32 USD against $25 limit.",
      txHash: "0x4455667788990011223344556677889900112233445566778899001122334455",
      timestamp: "Block #1048250",
    },
    {
      id: `ev-${Date.now()}-2`,
      type: "POLICY_REVERT",
      title: "Policy Engine Revert: ExceedsPerCallUSDLimit",
      details: "Attempted spend $60.32 USD exceeds per-call limit ($25.00 USD). Transaction reverted. 0 funds moved.",
      txHash: "0x99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa",
      timestamp: "Block #1048250",
    }
  )

  currentState = state
  return {
    success: true,
    message: "Path 2 executed: PolicyEngine rejected $60 USD spend with ExceedsPerCallUSDLimit.",
  }
}

export function executePath3_RevokeAndSibling(): { success: boolean; message: string } {
  // Scenario 3: Worker Beta attacked -> Revoked -> $1,500 swept to Sentinel -> Sibling Alpha stays intact
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState

  const beta = state.nodes.find((n) => n.id === BETA_ID)
  const sentinel = state.nodes.find((n) => n.id === SENTINEL_ID)

  if (beta && sentinel) {
    const unspentSwept = beta.data.idle
    beta.data.idle = 0
    beta.data.status = "REVOKED"
    sentinel.data.idle += unspentSwept
  }

  // Update edge to Beta to red
  const betaEdge = state.edges.find((e) => e.target === BETA_ID)
  if (betaEdge) {
    betaEdge.style = { stroke: "#f43f5e", strokeWidth: 2 }
    betaEdge.animated = false
  }

  state.events.push(
    {
      id: `ev-${Date.now()}-1`,
      type: "REVOKE",
      title: "Emergency Subtree Revocation (1-Tx)",
      details: "Sentinel executed revokeSubtree(WorkerBeta). WorkerBeta halted immediately.",
      txHash: "0xccddeeff00112233445566778899aabbccddeeff00112233445566778899aabb",
      timestamp: "Block #1048260",
    },
    {
      id: `ev-${Date.now()}-2`,
      type: "REFUND",
      title: "Subtree Balance Swept",
      details: "$1,500 FXRP swept from Worker Beta to FAssets Vault Sentinel idle balance.",
      txHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      timestamp: "Block #1048260",
    },
    {
      id: `ev-${Date.now()}-3`,
      type: "FTSO_CHECK",
      title: "Sibling Isolation Verified",
      details: "Worker Alpha unaffected. Continues active execution with intact $3,500 FXRP budget.",
      txHash: "0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899",
      timestamp: "Block #1048262",
    }
  )

  currentState = state
  return {
    success: true,
    message: "Path 3 executed: Worker Beta revoked in 1-Tx, $1,500 swept, Worker Alpha isolated & live.",
  }
}

export function executePath4_FdcXrplPayment(): { success: boolean; message: string } {
  // Scenario 4: Worker Alpha funds $50 FXRP job -> Valid XRPL Payment -> FDC Round -> Merkle Proof -> Settled
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState

  const alpha = state.nodes.find((n) => n.id === ALPHA_ID)
  if (alpha) {
    alpha.data.idle = 3450
    alpha.data.locked = 0
    alpha.data.status = "SETTLED"
    alpha.data.activeJob = {
      id: 204,
      provider: "0x92db14e4...62de0",
      amount: 50,
      status: "FDC_XRPL_SETTLED",
    }
  }

  state.events.push(
    {
      id: `ev-${Date.now()}-1`,
      type: "JOB_FUNDED",
      title: "Escrow Job #204: XRPL Payment Condition",
      details: "Locked $50 FXRP. Required destination: rHb9CJAWy...bwdtyTh, Memo: KYA-XRPL-FDC-SETTLE-778.",
      txHash: "0xaa11223344556677889900aabbccddeeffaa11223344556677889900aabbccddee",
      timestamp: "Block #1048280",
    },
    {
      id: `ev-${Date.now()}-2`,
      type: "FTSO_CHECK",
      title: "FDC Voting Epoch Wait (~90s)",
      details: "Attestation requested on Coston2. Flare consensus round 10420 achieved finality.",
      txHash: "0xbb223344556677889900aabbccddeeffbb223344556677889900aabbccddeeff11",
      timestamp: "Block #1048285",
    },
    {
      id: `ev-${Date.now()}-3`,
      type: "JOB_COMPLETED",
      title: "FDC Payment Verified & Settled",
      details: "DA layer Merkle proof verified against IFdcVerification. $50 FXRP paid to XRPL bridge operator.",
      txHash: "0xcc3344556677889900aabbccddeeffcc3344556677889900aabbccddeeff223344",
      timestamp: "Block #1048288",
    }
  )

  currentState = state
  return {
    success: true,
    message: "Path 4 executed: FDC XRPL Payment attested on Coston2 and escrow settled via Merkle proof.",
  }
}

export function executePath5_FdcDeadlineRefund(): { success: boolean; message: string } {
  // Scenario 5: Worker Alpha funds $50 FXRP job -> Wrong memo provided -> FDC rejects -> Deadline expires -> Refunded
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState

  const alpha = state.nodes.find((n) => n.id === ALPHA_ID)
  if (alpha) {
    alpha.data.idle = 3500
    alpha.data.locked = 0
    alpha.data.status = "ACTIVE"
    alpha.data.activeJob = undefined
  }

  state.events.push(
    {
      id: `ev-${Date.now()}-1`,
      type: "JOB_FUNDED",
      title: "Escrow Job #205 Funded ($50 FXRP)",
      details: "Locked $50 FXRP awaiting FDC XRPL Payment delivery.",
      txHash: "0xdd44556677889900aabbccddeeffdd44556677889900aabbccddeeff3344556677",
      timestamp: "Block #1048290",
    },
    {
      id: `ev-${Date.now()}-2`,
      type: "POLICY_REVERT",
      title: "FDC Verification Revert: Mismatched Memo",
      details: "Submitted XRPL proof carried forged memo 'KYA-BAD-MEMO'. FdcPaymentEvaluator reverted.",
      txHash: "0xee556677889900aabbccddeeffee556677889900aabbccddeeff44556677889900",
      timestamp: "Block #1048292",
    },
    {
      id: `ev-${Date.now()}-3`,
      type: "REFUND",
      title: "Deadline Passed: Escrow Refunded",
      details: "Provider failed to provide valid proof before deadline. $50 FXRP refunded to Alpha idle balance.",
      txHash: "0xff6677889900aabbccddeeffff6677889900aabbccddeeff556677889900aabbcc",
      timestamp: "Block #1048295",
    }
  )

  currentState = state
  return {
    success: true,
    message: "Path 5 executed: Mismatched FDC proof rejected; deadline expired and $50 FXRP refunded.",
  }
}

export function revokeSpecificNode(nodeId: string): { success: boolean; message: string } {
  const state = JSON.parse(JSON.stringify(currentState)) as DemoGraphState
  const targetNode = state.nodes.find((n) => n.id === nodeId || n.data.mandateId === nodeId)
  const sentinel = state.nodes.find((n) => n.id === SENTINEL_ID)

  if (!targetNode || targetNode.data.role === "root") {
    return { success: false, message: "Cannot revoke root mandate." }
  }

  const unspent = targetNode.data.idle
  targetNode.data.idle = 0
  targetNode.data.status = "REVOKED"

  if (sentinel && targetNode.id !== SENTINEL_ID) {
    sentinel.data.idle += unspent
  }

  const edge = state.edges.find((e) => e.target === targetNode.id)
  if (edge) {
    edge.style = { stroke: "#f43f5e", strokeWidth: 2 }
    edge.animated = false
  }

  state.events.push({
    id: `ev-${Date.now()}`,
    type: "REVOKE",
    title: `Subtree Revoked: ${targetNode.data.label}`,
    details: `O(1) kill switch triggered. ${unspent > 0 ? `$${unspent} swept to parent.` : "Node deactivated."}`,
    txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    timestamp: "Block #1048270",
  })

  currentState = state
  return { success: true, message: `Node ${targetNode.data.label} revoked in 1-Tx.` }
}

export function resetDemoState(): { success: boolean; message: string } {
  currentState = getInitialState()
  return { success: true, message: "Demo tree state reset to initial setup." }
}
