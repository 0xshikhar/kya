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
  ArrowLeft,
  X,
  Wallet,
} from "lucide-react"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useWallet } from "@/hooks/use-wallet"

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
  const { address: connectedAddress, isConnected, balance: walletBalance } = useWallet()
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
      protocol: "KYA by Mandant",
      version: "1.0.0",
      network: "Flare Coston2 Testnet (Chain ID: 114)",
      flareMainnetStatus: "DISABLED_PENDING_AUDIT",
      operatorAddress: connectedAddress || "0xAA11...49F1",
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
        address: n.id === "root" && connectedAddress ? connectedAddress : n.address,
        idle: `$${n.idle}`,
        usdCap: `$${n.usdCapPerCall}/call`,
      })),
    }

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kya-mandant-integrity-pack-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#fff8f7] text-zinc-950 font-sans selection:bg-rose-500/20">
      {/* Top Navigation */}
      <header className="border-b border-rose-100 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white text-xs font-semibold shadow-sm">
                {"✺"}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold tracking-tight text-zinc-950 text-base">KYA</span>
                <span className="text-xs font-medium text-zinc-500">by Mandant</span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              OPERATOR COMMAND CENTER
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Network Indicator - Coston2 Live, Flare Mainnet Disabled */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Flare Coston2 (114)</span>
              </div>

              <div
                className="hidden md:flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full border border-zinc-200/80 bg-zinc-100/70 text-zinc-400 cursor-not-allowed select-none"
                title="Flare Mainnet is disabled pending final security audit"
              >
                <Lock className="w-2.5 h-2.5 text-zinc-400" />
                <span>Flare Main: Disabled</span>
              </div>
            </div>

            {/* Live Web3 Wallet Connection */}
            <WalletButton />

            <Link
              href="/demo"
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors flex items-center gap-1.5 shadow-xs font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">DAG Visualizer</span>
            </Link>

            <button
              onClick={exportIntegrityPack}
              className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 transition-all flex items-center gap-1.5 font-medium shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Integrity Pack</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Metric Bar & Mathematical Conservation Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-rose-100/90 bg-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Coins className="w-3.5 h-3.5 text-rose-600" />
              Root Treasury Budget
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-zinc-950 font-mono tracking-tight">
              ${rootNode.granted.toLocaleString()} <span className="text-xs text-zinc-500 font-sans font-normal">USDC</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">Multi-asset vault backed on Flare</div>
          </div>

          <div className="rounded-2xl border border-rose-100/90 bg-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Idle Unallocated
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-emerald-600 font-mono tracking-tight">
              ${rootNode.idle.toLocaleString()} <span className="text-xs text-zinc-500 font-sans font-normal">USDC</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">Available for downward attenuation</div>
          </div>

          <div className="rounded-2xl border border-rose-100/90 bg-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              Allocated to Agents
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-zinc-950 font-mono tracking-tight">
              ${rootNode.childGranted.toLocaleString()} <span className="text-xs text-zinc-500 font-sans font-normal">USDC</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">{nodes.length - 1} autonomous child nodes</div>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 flex flex-col justify-between shadow-sm">
            <div className="text-[11px] text-emerald-900 font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              Conservation Invariant
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-sm font-bold text-emerald-800">
                STRICTLY CONSERVED (L0)
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-700 mt-1 font-medium">
              ${rootNode.idle} + ${rootNode.childGranted} = ${rootNode.granted}
            </div>
          </div>
        </div>

        {/* Hierarchy Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Cards List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                Active Mandate Hierarchy
              </h2>
              <button
                onClick={() => setIsSpawning(true)}
                className="px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isRevoked
                        ? "bg-rose-50/50 border-rose-200 text-rose-950 opacity-80"
                        : isSelected
                        ? "bg-[#fffafa] border-rose-400 ring-2 ring-rose-100 shadow-md"
                        : "bg-white border-rose-100 hover:border-rose-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${
                            isRevoked
                              ? "bg-rose-100 border-rose-300 text-rose-700"
                              : node.id === "root"
                              ? "bg-zinc-950 border-zinc-900 text-white"
                              : "bg-rose-50 border-rose-200 text-rose-600"
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
                            <span className="font-bold text-sm text-zinc-950">
                              {node.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                                isRevoked
                                  ? "bg-rose-100 text-rose-800 border-rose-300"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {node.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
                            <span>Address:</span>
                            <span className="font-semibold text-zinc-800">
                              {node.id === "root" && connectedAddress
                                ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)} (Operator)`
                                : node.address}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-zinc-950">
                          ${node.idle.toLocaleString()}{" "}
                          <span className="text-[10px] text-zinc-500 font-sans font-normal">idle</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Cap: ${node.usdCapPerCall}/call
                        </div>
                        {node.id !== "root" && !isRevoked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRevoke(node.id)
                            }}
                            className="mt-2 text-[11px] px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 transition-colors flex items-center gap-1 ml-auto font-medium"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            Quarantine (1-Tx)
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
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-600" />
              Node Policy Inspector
            </h2>

            <div className="rounded-2xl border border-rose-100/90 bg-white/95 p-5 space-y-4 shadow-sm">
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
                  Target Mandate
                </div>
                <div className="text-base font-bold text-zinc-950 mt-1">
                  {activeNode.name}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">{activeNode.address}</div>
              </div>

              <div className="border-t border-rose-100/80 pt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-50">
                  <span className="text-zinc-600">Status</span>
                  <span
                    className={`font-semibold font-mono ${
                      activeNode.status === "REVOKED" ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {activeNode.status}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-50">
                  <span className="text-zinc-600">Total Granted</span>
                  <span className="font-mono text-zinc-900 font-semibold">${activeNode.granted}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-50">
                  <span className="text-zinc-600">Current Idle</span>
                  <span className="font-mono text-zinc-900 font-semibold">${activeNode.idle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-50">
                  <span className="text-zinc-600">Child Granted</span>
                  <span className="font-mono text-zinc-900 font-semibold">${activeNode.childGranted}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-50">
                  <span className="text-zinc-600">Job Escrow Locked</span>
                  <span className="font-mono text-zinc-900 font-semibold">${activeNode.jobLocked}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-600">FTSOv2 USD Limit</span>
                  <span className="font-mono text-rose-700 font-bold">
                    ${activeNode.usdCapPerCall} / call
                  </span>
                </div>
              </div>

              <div className="border-t border-rose-100/80 pt-4">
                <div className="text-xs font-semibold text-zinc-700 mb-2 font-mono uppercase tracking-wider">
                  Onchain Guarantees
                </div>
                <div className="rounded-xl border border-rose-100 bg-[#fffbfc] p-3 space-y-2 text-xs text-zinc-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ERC-8004 Machine Credential Bound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fail-Closed on Subtree Quarantine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sub-Second FTSOv2 Staleness Check</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Jobs Escrow (ERC-8183) Section */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            Conditional Job Escrow (ERC-8183 Rails)
          </h2>

          <div className="rounded-2xl border border-rose-100/90 bg-white/95 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fffafa] text-zinc-600 uppercase tracking-wider font-mono border-b border-rose-100">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Job ID</th>
                  <th className="py-3.5 px-4 font-semibold">Mandate</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Provider</th>
                  <th className="py-3.5 px-4 font-semibold">Evaluator</th>
                  <th className="py-3.5 px-4 font-semibold">Deadline</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 font-sans">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-700">{job.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-950">{job.mandateName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                      ${job.amount}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono">{job.provider}</td>
                    <td className="py-3.5 px-4 text-zinc-700">{job.evaluator}</td>
                    <td className="py-3.5 px-4 text-zinc-500">{job.deadline}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Bot className="w-5 h-5 text-rose-600" />
                Spawn Attenuated Child Agent
              </h3>
              <button
                onClick={() => setIsSpawning(false)}
                className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSpawn} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
                  Agent Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SparkDEX Liquidity Bot"
                  value={spawnAgentName}
                  onChange={(e) => setSpawnAgentName(e.target.value)}
                  className="w-full bg-[#faf8f7] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
                  Granted Budget ($ USDC)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max={rootNode.idle}
                  value={spawnAmount}
                  onChange={(e) => setSpawnAmount(e.target.value)}
                  className="w-full bg-[#faf8f7] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 font-mono focus:outline-none focus:border-rose-500"
                />
                <div className="text-[11px] text-zinc-500 mt-1">
                  Max available from Root idle: ${rootNode.idle.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1 font-mono uppercase tracking-wider text-[11px]">
                  FTSOv2 Spend Cap ($ / call)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  value={spawnUsdCap}
                  onChange={(e) => setSpawnUsdCap(e.target.value)}
                  className="w-full bg-[#faf8f7] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 font-mono focus:outline-none focus:border-rose-500"
                />
                <div className="text-[11px] text-zinc-500 mt-1">
                  Reverts onchain if oracle price implies spend &gt; limit
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold transition-colors shadow-sm text-xs"
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
