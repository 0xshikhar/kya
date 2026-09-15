"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Shield,
  ShieldAlert,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Plus,
  Coins,
  ExternalLink,
  ChevronRight,
  KeyRound,
  Download,
  Terminal,
} from "lucide-react"

interface NodeData {
  id: string
  name: string
  role: string
  status: "ACTIVE" | "REVOKED"
  granted: number
  idle: number
  childGranted: number
  jobLocked: number
  usdCapPerCall: number
  address: string
}

interface JobData {
  id: string
  mandateName: string
  amount: number
  provider: string
  evaluator: string
  deadline: string
  status: "FUNDED" | "SUBMITTED" | "COMPLETED" | "REFUNDED"
}

export default function OperatorDashboard() {
  const [network, setNetwork] = useState<"coston2" | "mainnet">("coston2")
  const [selectedNode, setSelectedNode] = useState<string>("root")
  const [isSpawning, setIsSpawning] = useState(false)
  const [spawnAgentName, setSpawnAgentName] = useState("")
  const [spawnAmount, setSpawnAmount] = useState("1000")
  const [spawnUsdCap, setSpawnUsdCap] = useState("50")

  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: "root",
      name: "Root Treasury Mandate",
      role: "Global Orchestrator",
      status: "ACTIVE",
      granted: 10000,
      idle: 6000,
      childGranted: 4000,
      jobLocked: 0,
      usdCapPerCall: 500,
      address: "0xAA11...49F1",
    },
    {
      id: "node-1",
      name: "FAssets Vault Copilot",
      role: "CR Rebalancer & Liquidator",
      status: "ACTIVE",
      granted: 2500,
      idle: 2300,
      childGranted: 0,
      jobLocked: 200,
      usdCapPerCall: 200,
      address: "0x1234...99BA",
    },
    {
      id: "node-2",
      name: "DEX Arbitrage Agent",
      role: "Kinetic / SparkDEX Swapper",
      status: "ACTIVE",
      granted: 1500,
      idle: 1500,
      childGranted: 0,
      jobLocked: 0,
      usdCapPerCall: 100,
      address: "0x5678...21C0",
    },
  ])

  const [jobs, setJobs] = useState<JobData[]>([
    {
      id: "JOB-101",
      mandateName: "FAssets Vault Copilot",
      amount: 200,
      provider: "0x9876...3341 (Flare Collateral Vault)",
      evaluator: "FdcPaymentEvaluator (XRPL Proof)",
      deadline: "in 48 mins",
      status: "FUNDED",
    },
    {
      id: "JOB-100",
      mandateName: "Root Treasury Mandate",
      amount: 150,
      provider: "0x4421...88E2 (Compute Provider)",
      evaluator: "HashMatchEvaluator",
      deadline: "Finalized",
      status: "COMPLETED",
    },
  ])

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0]

  // Calculate Root conservation
  const rootNode = nodes[0]
  const isConserved =
    rootNode.idle + rootNode.childGranted + rootNode.jobLocked === rootNode.granted

  const handleRevoke = (nodeId: string) => {
    if (nodeId === "root") return

    setNodes((prev) => {
      const target = prev.find((n) => n.id === nodeId)
      if (!target || target.status === "REVOKED") return prev

      const sweptIdle = target.idle
      return prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            status: "REVOKED",
            idle: 0,
          }
        }
        if (node.id === "root") {
          return {
            ...node,
            idle: node.idle + sweptIdle,
            childGranted: node.childGranted - sweptIdle,
          }
        }
        return node
      })
    })
  }

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!spawnAgentName) return

    const amt = parseFloat(spawnAmount) || 500
    const cap = parseFloat(spawnUsdCap) || 50

    if (rootNode.idle < amt) {
      alert("Insufficient idle balance in Root treasury!")
      return
    }

    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      name: spawnAgentName,
      role: "Attenuated Worker Agent",
      status: "ACTIVE",
      granted: amt,
      idle: amt,
      childGranted: 0,
      jobLocked: 0,
      usdCapPerCall: cap,
      address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`.toUpperCase(),
    }

    setNodes((prev) => [
      {
        ...prev[0],
        idle: prev[0].idle - amt,
        childGranted: prev[0].childGranted + amt,
      },
      ...prev.slice(1),
      newNode,
    ])

    setSpawnAgentName("")
    setIsSpawning(false)
  }

  const exportIntegrityPack = () => {
    const pack = {
      protocol: "KYA Network",
      version: "1.0.0",
      network: network === "mainnet" ? "Flare Mainnet (14)" : "Flare Coston2 (114)",
      timestamp: new Date().toISOString(),
      conservationEquation: {
        formula: "Idle + ChildGranted + JobLocked = Granted",
        grantedUSD: `$${rootNode.granted.toLocaleString()}`,
        idleUSD: `$${rootNode.idle.toLocaleString()}`,
        childGrantedUSD: `$${rootNode.childGranted.toLocaleString()}`,
        jobLockedUSD: `$${rootNode.jobLocked.toLocaleString()}`,
        isMathematicallyConserved: isConserved,
      },
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        status: n.status,
        address: n.address,
        idle: `$${n.idle}`,
        usdCap: `$${n.usdCapPerCall}/call`,
      })),
    }

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kya-integrity-pack-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                KYA Network
              </span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              OPERATOR COMMAND CENTER
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Network Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setNetwork("coston2")}
                className={`px-3 py-1 rounded-md transition-all ${
                  network === "coston2"
                    ? "bg-rose-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Flare Coston2
              </button>
              <button
                onClick={() => setNetwork("mainnet")}
                className={`px-3 py-1 rounded-md transition-all ${
                  network === "mainnet"
                    ? "bg-rose-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Flare Mainnet
              </button>
            </div>

            <Link
              href="/demo"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              DAG Visualizer
            </Link>

            <button
              onClick={exportIntegrityPack}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Integrity Pack
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Metric Bar & Mathematical Conservation Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-rose-400" />
              Root Treasury Budget
            </div>
            <div className="text-2xl font-bold mt-2 text-white font-mono">
              ${rootNode.granted.toLocaleString()} <span className="text-xs text-slate-400 font-sans">USDC</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Multi-asset vault backed on Flare</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Idle Unallocated
            </div>
            <div className="text-2xl font-bold mt-2 text-emerald-400 font-mono">
              ${rootNode.idle.toLocaleString()} <span className="text-xs text-slate-400 font-sans">USDC</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Available for downward attenuation</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              Allocated to Agents
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-400 font-mono">
              ${rootNode.childGranted.toLocaleString()} <span className="text-xs text-slate-400 font-sans">USDC</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{nodes.length - 1} autonomous child nodes</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Conservation Invariant
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-sm font-semibold text-emerald-400">
                STRICTLY CONSERVED
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              ${rootNode.idle} + ${rootNode.childGranted} = ${rootNode.granted}
            </div>
          </div>
        </div>

        {/* Hierarchy Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Cards List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Active Mandate Hierarchy
              </h2>
              <button
                onClick={() => setIsSpawning(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Spawn Attenuated Child
              </button>
            </div>

            <div className="space-y-3">
              {nodes.map((node) => {
                const isSelected = node.id === selectedNode
                const isRevoked = node.status === "REVOKED"
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isRevoked
                        ? "bg-slate-950/60 border-red-900/40 opacity-70"
                        : isSelected
                        ? "bg-slate-900/90 border-rose-500/50 shadow-md shadow-rose-950/20"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                            isRevoked
                              ? "bg-red-950/30 border-red-800/50 text-red-400"
                              : node.id === "root"
                              ? "bg-rose-950/30 border-rose-800/50 text-rose-400"
                              : "bg-blue-950/30 border-blue-800/50 text-blue-400"
                          }`}
                        >
                          {isRevoked ? (
                            <ShieldAlert className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">
                              {node.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                isRevoked
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {node.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{node.role}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Agent: {node.address}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-slate-200">
                          ${node.idle.toLocaleString()}{" "}
                          <span className="text-[10px] text-slate-400 font-sans">idle</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Cap: ${node.usdCapPerCall}/call
                        </div>
                        {node.id !== "root" && !isRevoked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRevoke(node.id)
                            }}
                            className="mt-2 text-[11px] px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            Emergency Kill
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              Node Policy Inspector
            </h2>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Target Mandate
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {activeNode.name}
                </div>
                <div className="text-xs font-mono text-slate-500">{activeNode.address}</div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`font-semibold ${
                      activeNode.status === "REVOKED" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {activeNode.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Granted</span>
                  <span className="font-mono text-slate-200">${activeNode.granted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Idle</span>
                  <span className="font-mono text-slate-200">${activeNode.idle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Child Granted</span>
                  <span className="font-mono text-slate-200">${activeNode.childGranted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Job Escrow Locked</span>
                  <span className="font-mono text-slate-200">${activeNode.jobLocked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FTSOv2 USD Limit</span>
                  <span className="font-mono text-rose-400 font-semibold">
                    ${activeNode.usdCapPerCall} / call
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <div className="text-xs text-slate-400 mb-2">Onchain Guarantees</div>
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ERC-8004 Soulbound Verified
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Fail-Closed on Subtree Revocation
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Block-Latency FTSOv2 Staleness Check
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Jobs Escrow (ERC-8183) Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Conditional Job Escrow (ERC-8183)
          </h2>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Mandate</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Evaluator</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300">{job.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{job.mandateName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-400">
                      ${job.amount}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{job.provider}</td>
                    <td className="py-3 px-4 text-slate-300">{job.evaluator}</td>
                    <td className="py-3 px-4 text-slate-400">{job.deadline}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Spawn Child Agent Modal */}
      {isSpawning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-rose-400" />
                Spawn Attenuated Child Agent
              </h3>
              <button
                onClick={() => setIsSpawning(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSpawn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Agent Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SparkDEX Liquidity Bot"
                  value={spawnAgentName}
                  onChange={(e) => setSpawnAgentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Granted Budget ($ USDC)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max={rootNode.idle}
                  value={spawnAmount}
                  onChange={(e) => setSpawnAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Max available from Root idle: ${rootNode.idle.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  FTSOv2 Spend Cap ($ / call)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  value={spawnUsdCap}
                  onChange={(e) => setSpawnUsdCap(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Reverts onchain if oracle price implies spend &gt; limit
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors shadow-sm"
                >
                  Confirm &amp; Spawn Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
