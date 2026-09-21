"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { MandateNodeComponent, MandateNodeData } from "@/components/demo/dag-node"
import { InspectorDrawer } from "@/components/demo/inspector-drawer"
import { EventStream, EventLogItem } from "@/components/demo/event-stream"
import { IntegrityModal } from "@/components/demo/integrity-modal"
import { FdcProofModal } from "@/components/demo/fdc-proof-modal"
import { WalletButton } from "@/components/wallet/wallet-button"
import { FtsoHeaderBadge } from "@/components/oracle/ftso-telemetry"
import { ContractHubButton } from "@/components/contracts/contract-hub-modal"
import { NetworkBadge } from "@/components/navigation/network-badge"
import {
  Shield,
  ShieldCheck,
  FileCode2,
  ArrowLeft,
  Play,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ExternalLink,
  Terminal,
} from "lucide-react"

const nodeTypes = {
  mandateNode: MandateNodeComponent,
}

export default function DemoPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [rootNodeData, setRootNodeData] = useState<any>(null)
  const [isConserved, setIsConserved] = useState<boolean>(true)
  const [logs, setLogs] = useState<EventLogItem[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false)
  const [isFdcModalOpen, setIsFdcModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")

  // Fetch demo state from API
  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/demo")
      const data = await res.json()
      if (data.success && data.graph) {
        setNodes(data.graph.nodes)
        setEdges(data.graph.edges)
        setRootNodeData(data.graph.rootNode)
        setIsConserved(data.graph.isConserved)
        if (data.events) {
          setLogs(data.events)
        }
      }
    } catch (err) {
      console.error("Failed to load demo state:", err)
    }
  }, [])

  useEffect(() => {
    refreshState()
  }, [refreshState])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNodeId(node.id)
  }

  const handleExecuteScenario = async (path: "path1" | "path2" | "path3" | "path4" | "path5") => {
    setIsLoading(true)
    setActiveScenario(path)
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: path }),
      })
      const data = await res.json()
      if (data.success) {
        setStatusMessage(data.result.message)
        if (data.graph) {
          setNodes(data.graph.nodes)
          setEdges(data.graph.edges)
          setRootNodeData(data.graph.rootNode)
          setIsConserved(data.graph.isConserved)
          setLogs(data.graph.events)
        }
        if (path === "path4") {
          setIsFdcModalOpen(true)
        }
      }
    } catch (err: any) {
      console.error("Execution failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsLoading(true)
    setActiveScenario(null)
    setStatusMessage("")
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      })
      const data = await res.json()
      if (data.success && data.graph) {
        setNodes(data.graph.nodes)
        setEdges(data.graph.edges)
        setRootNodeData(data.graph.rootNode)
        setIsConserved(data.graph.isConserved)
        setLogs(data.graph.events)
      }
    } catch (err) {
      console.error("Reset failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeNode = async (nodeId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revokeNode", nodeId }),
      })
      const data = await res.json()
      if (data.success) {
        setStatusMessage(data.result.message)
        if (data.graph) {
          setNodes(data.graph.nodes)
          setEdges(data.graph.edges)
          setRootNodeData(data.graph.rootNode)
          setLogs(data.graph.events)
        }
      }
    } catch (err) {
      console.error("Revoke failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedNode = (nodes.find((n) => n.id === selectedNodeId)?.data as unknown as MandateNodeData) || null

  return (
    <div className="flex h-screen w-screen flex-col bg-[#fff8f7] text-zinc-900 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header className="flex h-16 items-center justify-between border-b border-rose-100/80 bg-white/90 px-4 sm:px-6 shrink-0 shadow-2xs z-20 gap-4">
        {/* Left: Brand & Navigation Mode Switcher */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white font-bold text-xs shadow-sm">
              ✺
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-zinc-950 text-base">KYA</span>
              <span className="text-xs font-medium text-zinc-500">by Mandant</span>
            </div>
          </Link>

          <span className="text-zinc-300 hidden sm:inline select-none">/</span>

          {/* View Switcher: Dashboard & DAG Visualizer */}
          <nav className="flex items-center p-0.5 rounded-full bg-zinc-100/90 border border-zinc-200/70 text-xs shadow-2xs">
            <Link
              href="/dashboard"
              className="px-3 py-1 rounded-full text-zinc-600 hover:text-zinc-950 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <span className="px-3 py-1 rounded-full bg-white text-zinc-950 font-semibold shadow-xs flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-rose-500" />
              <span className="hidden sm:inline">DAG Visualizer</span>
              <span className="sm:hidden">DAG</span>
            </span>
          </nav>
        </div>

        {/* Right: Telemetry, Tools & Web3 State */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Live FTSOv2 Oracle Ticker Badge */}
          <FtsoHeaderBadge />

          {/* Verified Coston2 Contracts Hub */}
          <ContractHubButton />

          {/* FDC Attestation Proof Inspector Button */}
          <button
            onClick={() => setIsFdcModalOpen(true)}
            className="flex items-center gap-1.5 h-8.5 rounded-full border border-purple-200/90 bg-purple-50/80 hover:bg-purple-100 text-purple-800 px-3 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all hover:border-purple-300 active:scale-95"
            title="Inspect Flare Data Connector (FDC) cryptographic Merkle proof, voting round & XRPL settlement verification"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden md:inline">FDC Proof</span>
          </button>

          {/* Integrity Pack Modal Button */}
          <button
            onClick={() => setIsIntegrityModalOpen(true)}
            className="flex items-center gap-1.5 h-8.5 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-700 px-3 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all hover:border-zinc-300 active:scale-95"
            title="Download cryptographic audit pack and state proof bundle"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden md:inline">Integrity Pack</span>
          </button>

          {/* Reset DAG Tree */}
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center justify-center h-8.5 w-8.5 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition shadow-2xs active:scale-95"
            title="Reset DAG Tree to initial state"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <div className="h-4 w-px bg-zinc-200/80 hidden sm:block mx-0.5" />

          {/* Flare Coston2 Network Badge with Popover */}
          <NetworkBadge />

          {/* Web3 Wallet Integration */}
          <WalletButton />
        </div>
      </header>

      {/* Scenario Switcher Toolbar */}
      <div className="flex items-center justify-between border-b border-rose-100 bg-[#fffafa] px-4 py-2 shrink-0 z-10 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">
            Scenarios:
          </span>

          <button
            onClick={() => handleExecuteScenario("path1")}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition border text-xs ${
              activeScenario === "path1"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Play className="h-3 w-3" />
            <span>Path 1: HashMatch</span>
          </button>

          <button
            onClick={() => handleExecuteScenario("path2")}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition border text-xs ${
              activeScenario === "path2"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Path 2: FTSOv2 Revert</span>
          </button>

          <button
            onClick={() => handleExecuteScenario("path3")}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition border text-xs ${
              activeScenario === "path3"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            <span>Path 3: 1-Tx Kill</span>
          </button>

          <button
            onClick={() => handleExecuteScenario("path4")}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition border text-xs ${
              activeScenario === "path4"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
            }`}
          >
            <Shield className="h-3 w-3 text-purple-600" />
            <span>Path 4: FDC XRPL Settlement</span>
          </button>

          <button
            onClick={() => handleExecuteScenario("path5")}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition border text-xs ${
              activeScenario === "path5"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100"
            }`}
          >
            <Lock className="h-3 w-3 text-indigo-600" />
            <span>Path 5: FDC Mismatch & Refund</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeScenario === "path4" && (
            <button
              onClick={() => setIsFdcModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 transition shadow-2xs"
              title="Inspect Flare Data Connector Merkle Proof and Consensus Round"
            >
              <FileCode2 className="h-3.5 w-3.5 text-purple-700" />
              <span>Inspect FDC Merkle Proof</span>
            </button>
          )}

          {statusMessage && (
            <span className="hidden lg:inline text-xs font-medium text-slate-600 truncate max-w-md bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            maxZoom={1.5}
          >
            <Background color="#cbd5e1" gap={24} size={1} />
            <Controls className="!bg-white !border !border-slate-200 !shadow-sm !rounded-xl overflow-hidden" />
          </ReactFlow>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <InspectorDrawer
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onRevoke={handleRevokeNode}
          />
        )}
      </div>

      {/* Real-time Event Stream Footer */}
      <EventStream logs={logs} onInspectFdcProof={() => setIsFdcModalOpen(true)} />

      {/* Cryptographic Integrity Pack Modal */}
      <IntegrityModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
        rootId={rootNodeData?.mandateId || "0x8f7c114a...0001"}
        rootGranted={rootNodeData?.granted || 65000}
        rootIdle={rootNodeData?.idle || 45000}
        childGranted={20000}
        jobLocked={rootNodeData?.locked || 0}
        isConserved={isConserved}
      />

      {/* Flare Data Connector (FDC) Attestation Proof Modal */}
      <FdcProofModal
        isOpen={isFdcModalOpen}
        onClose={() => setIsFdcModalOpen(false)}
      />
    </div>
  )
}
