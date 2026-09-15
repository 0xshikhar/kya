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
  Coins,
  ExternalLink,
  ChevronRight,
  KeyRound,
  Terminal,
  Zap,
  Play,
  Copy,
  Check,
  Cpu,
  Flame,
  Globe,
  FileCheck,
  TrendingUp,
  Server,
  Network,
} from "lucide-react"

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [heroAttackSimulated, setHeroAttackSimulated] = useState(false)
  const [heroRevoked, setHeroRevoked] = useState(false)
  const [activeArchTab, setActiveArchTab] = useState<"l0" | "l1" | "l2" | "l3" | "l4">("l0")
  const [activeCodeTab, setActiveCodeTab] = useState<"sdk" | "solidity" | "mcp">("sdk")
  const [simStep, setSimStep] = useState<"idle" | "allowed" | "unauthorized" | "overlimit" | "killed">("idle")

  const copyInstall = () => {
    navigator.clipboard.writeText("pnpm add @kya-network/sdk viem")
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-[#e84142]/30 selection:text-[#ff8a8c]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#e84142]/15 via-[#8b5cf6]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-[#8b5cf6]/10 blur-[140px] rounded-full" />
        <div className="absolute top-[65%] -right-48 w-[600px] h-[600px] bg-[#e84142]/10 blur-[140px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 kya-glass border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e84142] to-[#8b5cf6] p-0.5 flex items-center justify-center shadow-lg shadow-[#e84142]/20">
              <div className="w-full h-full bg-[#0e0e11] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#e84142]" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white/90 to-zinc-400 bg-clip-text text-transparent">
                KYA Network
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#e84142]/10 text-[#ff7173] border border-[#e84142]/20">
                Flare Native
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <a href="#protocol" className="hover:text-white transition-colors">Protocol</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            <a href="#sdk" className="hover:text-white transition-colors">SDK</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-900/60 text-zinc-300 hover:text-white transition-all"
            >
              <Play className="w-3 h-3 text-[#ff7173]" />
              Interactive Demo
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg kya-coral-gradient text-white shadow-lg shadow-[#e84142]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Operator App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-xs text-zinc-300 backdrop-blur-md mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-400">LIVE ON COSTON2 TESTNET</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">Mathematical Conservation Invariant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Give AI Agents Capital.{" "}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#e84142] via-[#ff6b6c] to-[#8b5cf6] bg-clip-text text-transparent">
              Keep The Treasury.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-normal">
            The on-chain authorization and settlement protocol for autonomous agents on Flare.
            Enforce block-latency USD spend limits via <strong className="text-zinc-200">FTSOv2</strong>,
            isolate swarms with <strong className="text-zinc-200">mathematical tree invariants</strong>, and
            settle payouts only when delivery is verified by <strong className="text-zinc-200">Flare Data Connector (FDC)</strong>.
          </p>

          {/* Action CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl kya-coral-gradient text-white text-sm font-semibold shadow-xl shadow-[#e84142]/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Launch Operator App</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <Link
              href="/demo"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-white/15 text-white text-sm font-semibold hover:border-white/30 active:scale-95 transition-all shadow-sm"
            >
              <Play className="w-4 h-4 text-[#ff7173]" />
              <span>View Coston2 Demo</span>
            </Link>

            {/* Copy Install Command */}
            <button
              onClick={copyInstall}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-zinc-950/80 border border-white/10 font-mono text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ff7173]" />
              <span>pnpm add @kya-network/sdk viem</span>
              {copiedSnippet ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Interactive Mandate Tree Visualizer Card */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
            <div className="rounded-[14px] bg-[#0c0c10]/95 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#e84142] animate-ping" />
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    Live Protocol Simulator · Coston2 Testnet
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-md border border-white/5">
                  Invariant: <span className="text-emerald-400">Idle + Child + Job = Granted</span>
                </div>
              </div>

              {/* Mandate Hierarchy Demo Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Connecting arrow line on desktop */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-900 border border-white/15 items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>

                {/* Root Treasury Node */}
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#ff7173] font-semibold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Root Treasury Node
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">Master FAssets Operator</div>
                  <div className="text-xs text-zinc-400 mb-4 font-mono">0xAA11...49F1</div>

                  <div className="space-y-1.5 text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vault Backing:</span>
                      <span className="text-white font-semibold">50,000 FXRP (~$32,500)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Idle Liquidity:</span>
                      <span className="text-emerald-400">{heroRevoked ? "50,000 FXRP" : "45,000 FXRP"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Child Granted:</span>
                      <span className="text-zinc-300">{heroRevoked ? "0 FXRP" : "5,000 FXRP"}</span>
                    </div>
                  </div>
                </div>

                {/* Child Worker Node */}
                <div
                  className={`p-5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    heroRevoked
                      ? "bg-red-950/20 border-red-500/40"
                      : heroAttackSimulated
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-zinc-900/60 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-violet-400 font-semibold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> Child Agent (Gen 1)
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        heroRevoked
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {heroRevoked ? "REVOKED & SWEPT" : "ACTIVE"}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">FAssets Collateral Copilot</div>
                  <div className="text-xs text-zinc-400 mb-4 font-mono">0x1234...99BA</div>

                  <div className="space-y-1.5 text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Policy Spend Cap:</span>
                      <span className="text-white font-semibold">Max $50 / Call (FTSOv2)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Agent Balance:</span>
                      <span className={heroRevoked ? "text-zinc-500" : "text-zinc-200"}>
                        {heroRevoked ? "0 FXRP (Swept)" : "5,000 FXRP"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tree Depth:</span>
                      <span className="text-zinc-300">Level 1 (Attenuated)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Result Banner */}
              {heroAttackSimulated && !heroRevoked && (
                <div className="mt-5 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-red-300">
                      REVERT ONCHAIN: Policy__PerCallUSDExceeded ($120.00 &gt; $50.00 Limit)
                    </div>
                    <div className="mt-1 text-zinc-300 text-[11px]">
                      Prompt-injected payload was blocked by KYA PolicyEngine at EVM bytecode level before touching the vault.
                    </div>
                  </div>
                </div>
              )}

              {heroRevoked && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-300">
                      O(1) SUBTREE QUARANTINED: 5,000 FXRP Swept to Parent Root
                    </div>
                    <div className="mt-1 text-zinc-300 text-[11px]">
                      Generational tag incremented in 1 transaction. Rogue child fails closed permanently. Sibling agents unaffected.
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
                {!heroAttackSimulated && !heroRevoked && (
                  <button
                    onClick={() => setHeroAttackSimulated(true)}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Simulate Rogue $120 Call
                  </button>
                )}

                {heroAttackSimulated && !heroRevoked && (
                  <button
                    onClick={() => setHeroRevoked(true)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Trigger O(1) Kill-Switch
                  </button>
                )}

                {(heroAttackSimulated || heroRevoked) && (
                  <button
                    onClick={() => {
                      setHeroAttackSimulated(false)
                      setHeroRevoked(false)
                    }}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Simulator
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof & Ecosystem Metrics Ticker */}
      <section className="relative z-10 border-y border-white/5 bg-zinc-950/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs font-mono uppercase tracking-widest text-zinc-500 mb-8">
            Engineered for Autonomous Agents on Flare Network
          </div>

          {/* 4 Core Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl kya-glass text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$0.00</div>
              <div className="mt-2 text-xs text-zinc-400 font-medium">Treasury Lost by Construction</div>
              <div className="mt-1 text-[11px] text-emerald-400 font-mono">Mathematical Conservation</div>
            </div>

            <div className="p-6 rounded-xl kya-glass text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">~1.8s</div>
              <div className="mt-2 text-xs text-zinc-400 font-medium">Enshrined FTSOv2 Pricing</div>
              <div className="mt-1 text-[#ff7173] font-mono">Zero External Oracle Lag</div>
            </div>

            <div className="p-6 rounded-xl kya-glass text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">O(1)</div>
              <div className="mt-2 text-xs text-zinc-400 font-medium">Instant Subtree Revocation</div>
              <div className="mt-1 text-violet-400 font-mono">1-Tx Swarm Quarantine</div>
            </div>

            <div className="p-6 rounded-xl kya-glass text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">100%</div>
              <div className="mt-2 text-xs text-zinc-400 font-medium">FDC Cryptographic Payouts</div>
              <div className="mt-1 text-emerald-400 font-mono">Consensus Merkle Proofs</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="protocol" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff7173] font-semibold">
            The Autonomous Agent Dilemma
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Why Raw Private Keys Kill Autonomous Swarms
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Autonomous bots manage hundreds of millions in collateral, yet Web3 tooling was designed for humans
            confirming browser popups, not non-deterministic LLMs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Prompt Injection Black Swan</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              If an agent holds raw keys, one adversarial injection or unconstrained tool call can instruct the model
              to drain your entire vault to an attacker's address in a single transaction.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs font-mono text-[#ff7173]">
              KYA Solution: Hard EVM bytecode policy limits. The contract reverts regardless of model hallucinations.
            </div>
          </div>

          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <Network className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">The Cascading Swarm Drain</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Swarm architectures delegate tasks across multiple sub-agents. When a sub-worker enters an infinite
              retry loop or fails, it siphons budget from siblings and bankrupts the root parent.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs font-mono text-amber-400">
              KYA Solution: Monotonic Attenuation. Child budgets are strict subsets subtracted directly from parent idle.
            </div>
          </div>

          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">The Blind Payout Trap</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When hiring external agents across XRPL, Bitcoin, or Ethereum, paying upfront risks non-delivery,
              while paying afterwards risks non-payment. Off-chain APIs cannot be trusted with escrow.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs font-mono text-violet-400">
              KYA Solution: FDC Consensus Escrow. Smart contract releases funds ONLY when Flare verifies Merkle proof.
            </div>
          </div>
        </div>
      </section>

      {/* 4-Layer Architecture Tabs */}
      <section id="architecture" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff7173] font-semibold">
            The 4-Layer Security Stack
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Military-Grade Containment. Zero Trust Required.
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Every layer enforces strict mathematical invariants at the EVM level to guarantee complete capital safety.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "l0", label: "L0: Mandate Tree Vault", icon: Shield },
            { id: "l1", label: "L1: FTSOv2 USD Policy", icon: TrendingUp },
            { id: "l2", label: "L2: Conditional Escrow", icon: Lock },
            { id: "l3", label: "L3: FDC Settlement", icon: FileCheck },
            { id: "l4", label: "L4: ERC-8004 Identity", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeArchTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveArchTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-lg shadow-white/10"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Display */}
        <div className="p-8 sm:p-10 rounded-2xl kya-glass max-w-4xl mx-auto">
          {activeArchTab === "l0" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7173] font-bold">L0 · MANDATE HUB & TREE</span>
                <span className="text-xs font-mono text-zinc-400">MandateHub.sol · MandateTree.sol</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Mathematical Conservation & Subtree Revocation</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                The vault holds FLR, FXRP, and tokens while strictly accounting for capital in three discrete buckets:
                <code className="mx-1 text-[#ff7173]">Idle + ChildGranted + JobLocked = Granted</code>.
                Child nodes can never be granted more than their parent's idle balance. When an emergency occurs,
                a single transaction increments generational tags in $O(1)$ storage operations, instantly failing closed
                the rogue subtree and sweeping unspent funds back upward.
              </p>
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
                128,000 invariant fuzzing runs passed with 0 mathematical conservation errors.
              </div>
            </div>
          )}

          {activeArchTab === "l1" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7173] font-bold">L1 · FTSOV2 POLICY ENGINE</span>
                <span className="text-xs font-mono text-zinc-400">PolicyEngine.sol</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Real-Time Decentralized USD Caps</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Dynamically resolves <code className="text-zinc-200">FtsoV2</code> via the canonical{" "}
                <code className="text-zinc-200">FlareContractRegistry</code> (0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019).
                Enforces exact USD spend limits (e.g. Max $50/call, $500/day) on FLR and FXRP with block-latency pricing.
                Feeds older than 10 minutes fail closed immediately to prevent price exploitation.
              </p>
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
                Supports allowlists, function selector restrictions, and configurable cooldown intervals.
              </div>
            </div>
          )}

          {activeArchTab === "l2" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7173] font-bold">L2 · CONDITIONAL JOB ESCROW</span>
                <span className="text-xs font-mono text-zinc-400">JobAdapter.sol (ERC-8183)</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Trustless Pay-On-Delivery</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Escrow is the <strong className="text-white">only exit gate</strong> for capital out of the Mandate Tree.
                When a job is funded, funds transition from <code className="text-zinc-200">idle</code> to{" "}
                <code className="text-zinc-200">jobLocked</code>. The funds cannot be released until an authorized evaluator
                contract explicitly verifies deliverable fulfillment.
              </p>
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
                Expired deadlines allow automatic refunds back to the agent's idle balance.
              </div>
            </div>
          )}

          {activeArchTab === "l3" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7173] font-bold">L3 · FDC CONSENSUS SETTLEMENT</span>
                <span className="text-xs font-mono text-zinc-400">FdcPaymentEvaluator.sol · FdcEvmTxEvaluator.sol</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Cross-Chain Proof Verification</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Evaluates Flare Data Connector (FDC) Merkle proofs directly on Coston2 and Flare Mainnet.
                Payouts unlock only when Flare state validators certify that an XRPL Payment or external EVM transaction
                matching the exact amount, destination tag, and memo has achieved consensus finality.
              </p>
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
                Relayer worker polls Flare DA layer to assemble proofs with zero human overhead.
              </div>
            </div>
          )}

          {activeArchTab === "l4" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ff7173] font-bold">L4 · CREDENTIAL REGISTRY</span>
                <span className="text-xs font-mono text-zinc-400">CredentialRegistry.sol (ERC-8004 & ERC-5192)</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Soulbound Agent Reputation & Identity</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Mints an ERC-8004 compatible onchain registry record and an ERC-5192 Soulbound NFT credential
                upon agent creation. Other smart contracts or agents can call <code className="text-zinc-200">verifyAgent(agentId)</code>{" "}
                to check real-time ACTIVE, REVOKED, or EXPIRED status across Web3 swarms.
              </p>
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
                Non-transferable by design; status flips to revoked immediately upon kill-switch trigger.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Developer Quickstart Section */}
      <section id="sdk" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff7173] font-semibold">
            Developer Experience
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for TypeScript, Foundry & MCP
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Lightweight Viem SDK, robust Solidity contracts, and standard Model Context Protocol servers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl">
          {/* Code Window Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCodeTab("sdk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCodeTab === "sdk"
                    ? "bg-white/10 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                @kya-network/sdk (Viem)
              </button>
              <button
                onClick={() => setActiveCodeTab("solidity")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCodeTab === "solidity"
                    ? "bg-white/10 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Solidity Interface
              </button>
              <button
                onClick={() => setActiveCodeTab("mcp")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCodeTab === "mcp"
                    ? "bg-white/10 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                MCP Agent Server
              </button>
            </div>
          </div>

          {/* Code Block Content */}
          <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto leading-relaxed">
            {activeCodeTab === "sdk" && (
              <pre className="text-zinc-300">
                <span className="text-purple-400">import</span> &#123; KyaClient &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@kya-network/sdk&apos;</span>;{"\n\n"}
                <span className="text-zinc-500">// Initialize client on Flare Coston2 or Mainnet</span>{"\n"}
                <span className="text-purple-400">const</span> kya = <span className="text-blue-400">new</span> KyaClient(&#123; chain: <span className="text-emerald-300">&apos;coston2&apos;</span>, privateKey: process.env.OPERATOR_KEY &#125;);{"\n\n"}
                <span className="text-zinc-500">// 1. Register an Agent with real-time FTSOv2 USD spend limits</span>{"\n"}
                <span className="text-purple-400">const</span> &#123; agentId &#125; = <span className="text-purple-400">await</span> kya.registerAgent(&#123;{"\n"}
                {"  "}name: <span className="text-emerald-300">&apos;FAssetsVaultGuard&apos;</span>,{"\n"}
                {"  "}maxSpendPerCallUSD: <span className="text-amber-400">50</span>,  <span className="text-zinc-500">// Bounded via FTSOv2 feed</span>{"\n"}
                {"  "}maxSpendPerDayUSD: <span className="text-amber-400">500</span>,{"\n"}
                {"  "}allowedContracts: [<span className="text-emerald-300">&apos;0xTargetVault...&apos;</span>]{"\n"}
                &#125;);{"\n\n"}
                <span className="text-zinc-500">// 2. Fund an FDC conditional cross-chain escrow</span>{"\n"}
                <span className="text-purple-400">const</span> escrow = <span className="text-purple-400">await</span> kya.createEscrow(&#123;{"\n"}
                {"  "}asset: <span className="text-emerald-300">&apos;FXRP&apos;</span>,{"\n"}
                {"  "}amount: <span className="text-emerald-300">&apos;25.0&apos;</span>,{"\n"}
                {"  "}evaluator: <span className="text-emerald-300">&apos;FdcPaymentEvaluator&apos;</span>,{"\n"}
                {"  "}condition: &#123; destinationTag: <span className="text-amber-400">10492</span>, targetAddress: <span className="text-emerald-300">&apos;rXrpAddress...&apos;</span> &#125;{"\n"}
                &#125;);
              </pre>
            )}

            {activeCodeTab === "solidity" && (
              <pre className="text-zinc-300">
                <span className="text-purple-400">interface</span> <span className="text-blue-400">IMandateHub</span> &#123;{"\n"}
                {"  "}<span className="text-purple-400">function</span> createRoot(<span className="text-blue-400">uint256</span> amount, <span className="text-blue-400">bytes32</span> policyHash, <span className="text-blue-400">uint256</span> expiry) <span className="text-purple-400">external returns</span> (<span className="text-blue-400">bytes32</span>);{"\n"}
                {"  "}<span className="text-purple-400">function</span> spawn(<span className="text-blue-400">bytes32</span> parentId, <span className="text-blue-400">address</span> worker, <span className="text-blue-400">uint256</span> grant, <span className="text-blue-400">bytes32</span> policyHash, <span className="text-blue-400">uint256</span> expiry) <span className="text-purple-400">external returns</span> (<span className="text-blue-400">bytes32</span>);{"\n"}
                {"  "}<span className="text-purple-400">function</span> revokeSubtree(<span className="text-blue-400">bytes32</span> mandateId) <span className="text-purple-400">external</span>;{"\n"}
                {"  "}<span className="text-purple-400">function</span> fundJob(<span className="text-blue-400">bytes32</span> mandateId, <span className="text-blue-400">address</span> provider, <span className="text-blue-400">address</span> evaluator, <span className="text-blue-400">uint256</span> amount, <span className="text-blue-400">uint256</span> deadline) <span className="text-purple-400">external returns</span> (<span className="text-blue-400">bytes32</span>);{"\n"}
                &#125;
              </pre>
            )}

            {activeCodeTab === "mcp" && (
              <pre className="text-zinc-300">
                <span className="text-zinc-500">// Connect Claude Desktop or Cursor to @kya-network/mcp-server & flario</span>{"\n"}
                &#123;{"\n"}
                {"  "}<span className="text-emerald-300">&quot;mcpServers&quot;</span>: &#123;{"\n"}
                {"    "}<span className="text-emerald-300">&quot;kya-network&quot;</span>: &#123;{"\n"}
                {"      "}<span className="text-emerald-300">&quot;command&quot;</span>: <span className="text-emerald-300">&quot;bunx&quot;</span>,{"\n"}
                {"      "}<span className="text-emerald-300">&quot;args&quot;</span>: [<span className="text-emerald-300">&quot;@kya-network/mcp-server&quot;</span>]{"\n"}
                {"    "}&#125;,{"\n"}
                {"    "}<span className="text-emerald-300">&quot;flario&quot;</span>: &#123;{"\n"}
                {"      "}<span className="text-emerald-300">&quot;command&quot;</span>: <span className="text-emerald-300">&quot;bunx&quot;</span>,{"\n"}
                {"      "}<span className="text-emerald-300">&quot;args&quot;</span>: [<span className="text-emerald-300">&quot;flario&quot;</span>]{"\n"}
                {"    "}&#125;{"\n"}
                {"  "}&#125;{"\n"}
                &#125;
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* Target Use Cases */}
      <section id="use-cases" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff7173] font-semibold">
            Flare Ecosystem Wedges
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Tailored for High-Value Flare Operations
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Immediate market fit across the most critical collateralized protocols on Flare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-10 h-10 rounded-xl bg-[#e84142]/10 border border-[#e84142]/20 flex items-center justify-center text-[#ff7173] mb-5">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">FAssets Vault Copilot</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Autonomous collateral health monitoring and auto-rebalancing for the 6 live FAssets agents backing ~146M FXRP.
              Eliminates liquidation risk while guaranteeing the bot cannot over-spend collateral or drain assets.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#ff7173]">
              <span>Template ready in repo</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">SparkDEX & Kinetic Bots</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              High-frequency arbitrage and market-making bots operating on concentrated DEX pools with bounded latency.
              Enforces hourly stop-loss limits dynamically priced in USD via FTSOv2.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-violet-400">
              <span>Zero infinite-loop risk</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="p-8 rounded-2xl kya-glass kya-glass-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cross-Chain Labor Escrow</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Autonomous agents hiring other agents on XRPL, Bitcoin, or Ethereum.
              Escrows multi-asset payments that unlock trustlessly when Flare Data Connector consensus proves delivery.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span>Full FDC proof validation</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff7173] font-semibold">
            Competitive Edge
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How KYA Compares
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 kya-glass">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/60 font-mono text-zinc-400">
                <th className="p-4 sm:p-5">Security Feature</th>
                <th className="p-4 sm:p-5 text-[#ff7173] font-bold">KYA Network</th>
                <th className="p-4 sm:p-5">Raw Private Keys</th>
                <th className="p-4 sm:p-5">ERC-4337 Session Keys</th>
                <th className="p-4 sm:p-5">Centralized Agent Wallets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr>
                <td className="p-4 sm:p-5 font-sans font-medium text-white">Mathematical Tree Conservation</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Yes (L0 Invariant)</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-sans font-medium text-white">Enshrined USD Spend Limits</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Yes (FTSOv2 ~1.8s)</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-400">Requires Chainlink ($$$)</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-sans font-medium text-white">Consensus Delivery Settlement</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Yes (Flare Data Connector)</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-400">Web2 Webhooks</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-sans font-medium text-white">1-Tx Instant Swarm Kill-Switch</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Yes (O(1) Storage)</td>
                <td className="p-4 sm:p-5 text-zinc-500">Key Compromised</td>
                <td className="p-4 sm:p-5 text-zinc-400">Per-key Revocation</td>
                <td className="p-4 sm:p-5 text-zinc-400">API Blacklist</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-sans font-medium text-white">XRPL Native Control (FSA)</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Yes (Xaman Signatures)</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
                <td className="p-4 sm:p-5 text-zinc-500">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Banner & Footer */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#e84142]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8b5cf6]/15 blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Contain Your Agents?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Deploy your first policy-constrained agent vault on Flare Coston2 testnet in under 5 minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl kya-coral-gradient text-white text-sm font-semibold shadow-xl shadow-[#e84142]/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Operator App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold border border-white/10 transition-all"
            >
              <span>View Interactive Demo</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
          <div>
            © 2026 KYA Network. Built on Flare EVM. Enforced by Mathematical Conservation.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/demo" className="hover:text-zinc-300 transition-colors">/demo</Link>
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">/dashboard</Link>
            <a href="https://coston2-explorer.flare.network" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Coston2 Explorer</a>
            <a href="https://flare.network" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Flare Network</a>
          </div>
        </footer>
      </section>
    </div>
  )
}
