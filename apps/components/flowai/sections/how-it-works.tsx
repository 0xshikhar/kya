"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Cpu, Key, ArrowRight, CheckCircle2, Lock, Sparkles, RefreshCw } from "lucide-react"

export default function HowItWorksSection() {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)

  return (
    <section id="architecture" className="mx-auto max-w-6xl px-4 py-20">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-600 font-mono">
          PROTOCOL ARCHITECTURE
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl leading-tight">
          Five cryptographic layers between the agent and the treasury.
        </h2>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          KYA separates autonomous reasoning, authorization, capital custody, external verification, and settlement into an explicit, modular onchain stack.
        </p>
      </div>

      {/* 2x2 Grid for Core Execution Layers (L0 to L3) */}
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {/* Layer 0: Mandate Tree */}
        <div
          onMouseEnter={() => setHoveredLayer("L0")}
          onMouseLeave={() => setHoveredLayer(null)}
          className="group relative flex flex-col justify-between rounded-3xl border border-rose-100/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <Badge className="h-7 px-3 rounded-lg bg-rose-600 text-white font-mono font-bold text-xs shadow-sm">
                L0
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">
                DAG Isolation · O(1) Revoke
              </span>
            </div>

            <p className="mt-4 text-xs font-bold tracking-widest text-rose-600 font-mono">
              MANDATE TREE (CAPITAL ISOLATION)
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-zinc-950">
              Mathematical DAG Accounting &amp; Subtree Containment
            </h3>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Manages hierarchical capital boundaries. Every child agent inherits strict spending ceilings from its parent. If a child agent is compromised, a 1-Tx emergency quarantine severs the sub-branch instantly without halting the protocol.
            </p>
          </div>

          {/* Bespoke L0 Animated SVG */}
          <div className="mt-6 rounded-2xl bg-gradient-to-b from-rose-50/40 via-white to-slate-50/60 p-4 border border-rose-100/60">
            <svg viewBox="0 0 340 120" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="l0-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Connecting Tree Edges */}
              <path
                d="M170 24 L85 70"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path
                d="M170 24 L255 70"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path d="M85 70 L45 105" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M85 70 L125 105" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M255 70 L255 105" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="2 2" />

              {/* Root Vault Node */}
              <circle cx="170" cy="24" r="16" fill="#fff" stroke="#e11d48" strokeWidth="3" className="drop-shadow-sm" />
              <text x="170" y="28" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                ROOT
              </text>

              {/* Sub-Agent 1 (Active) */}
              <circle cx="85" cy="70" r="14" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
              <text x="85" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#047857" fontFamily="monospace">
                SUB-A
              </text>

              {/* Sub-Agent 2 (Quarantined) */}
              <circle cx="255" cy="70" r="14" fill="#fff1f2" stroke="#e11d48" strokeWidth="2" strokeDasharray="3 2" />
              <text x="255" y="73" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#be123c" fontFamily="monospace">
                REVOKED
              </text>

              {/* Leaves */}
              <circle cx="45" cy="105" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="125" cy="105" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="235" y="96" width="40" height="18" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1" />
              <text x="255" y="108" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                1-Tx CUT
              </text>
            </svg>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-rose-100/50">
              <span className="text-emerald-600 font-medium">idle + childGranted = granted</span>
              <span className="text-rose-600 font-medium">Invariant: Preserved</span>
            </div>
          </div>
        </div>

        {/* Layer 1: Policy Engine */}
        <div
          onMouseEnter={() => setHoveredLayer("L1")}
          onMouseLeave={() => setHoveredLayer(null)}
          className="group relative flex flex-col justify-between rounded-3xl border border-rose-100/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <Badge className="h-7 px-3 rounded-lg bg-rose-600 text-white font-mono font-bold text-xs shadow-sm">
                L1
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">
                FTSOv2 ~1.8s Feed · USD Velocity
              </span>
            </div>

            <p className="mt-4 text-xs font-bold tracking-widest text-rose-600 font-mono">
              POLICY ENGINE (REAL-TIME USD LIMITS)
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-zinc-950">
              Sub-Second FTSOv2 Price-Gated Enforcement
            </h3>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Enforces per-call caps, 24-hour rolling velocity limits, target contract whitelists, and expiry timestamps denominated in USD via Flare’s sub-second FTSOv2 oracle feeds.
            </p>
          </div>

          {/* Bespoke L1 Animated SVG */}
          <div className="mt-6 rounded-2xl bg-gradient-to-b from-rose-50/40 via-white to-slate-50/60 p-4 border border-rose-100/60">
            <svg viewBox="0 0 340 120" className="w-full h-28 overflow-visible">
              {/* Grid Background Lines */}
              <line x1="20" y1="30" x2="320" y2="30" stroke="#fecdd3" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <line x1="20" y1="70" x2="320" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="100" x2="320" y2="100" stroke="#f1f5f9" strokeWidth="1" />

              {/* USD Spend Limit Ceiling */}
              <text x="250" y="24" fontSize="8" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                MAX USD CAP: $50
              </text>

              {/* Dynamic Price Curve */}
              <path
                d="M 20 85 Q 70 45, 120 65 T 220 40 T 320 55"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Oracle Pulse Point */}
              <circle cx="220" cy="40" r="5" fill="#e11d48" className="animate-ping" opacity="0.75" />
              <circle cx="220" cy="40" r="5" fill="#e11d48" />

              {/* Floating Tooltip */}
              <g transform="translate(180, 52)">
                <rect width="80" height="24" rx="6" fill="#0f172a" className="drop-shadow-md" />
                <text x="40" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#34d399" fontFamily="monospace">
                  $34.20 ALLOWED
                </text>
              </g>

              {/* Target Allowlist Tag */}
              <rect x="25" y="45" width="70" height="18" rx="4" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="60" y="57" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748b" fontFamily="monospace">
                TARGET WHITELIST
              </text>
            </svg>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-rose-100/50">
              <span className="text-zinc-600 font-medium">Feed: FLR / FXRP / USD</span>
              <span className="text-emerald-600 font-medium">● Sub-Second Enforced</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Conditional Escrow */}
        <div
          onMouseEnter={() => setHoveredLayer("L2")}
          onMouseLeave={() => setHoveredLayer(null)}
          className="group relative flex flex-col justify-between rounded-3xl border border-rose-100/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <Badge className="h-7 px-3 rounded-lg bg-rose-600 text-white font-mono font-bold text-xs shadow-sm">
                L2
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">
                ERC-8183 Rails · Atomic Escrow
              </span>
            </div>

            <p className="mt-4 text-xs font-bold tracking-widest text-rose-600 font-mono">
              CONDITIONAL ESCROW (ERC-8183 RAILS)
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-zinc-950">
              Autonomous Job Payout State Machine
            </h3>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Standardizes agent-to-agent hiring. Escrows capital in job contracts that transition strictly through verifiable execution phases: FUNDED → LOCKED → EVALUATED → SETTLED.
            </p>
          </div>

          {/* Bespoke L2 Animated SVG */}
          <div className="mt-6 rounded-2xl bg-gradient-to-b from-rose-50/40 via-white to-slate-50/60 p-4 border border-rose-100/60">
            <svg viewBox="0 0 340 120" className="w-full h-28 overflow-visible">
              {/* Connector Pipeline Lines */}
              <line x1="50" y1="60" x2="120" y2="60" stroke="#fda4af" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="130" y1="60" x2="200" y2="60" stroke="#fda4af" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="210" y1="60" x2="280" y2="60" stroke="#10b981" strokeWidth="2.5" />

              {/* State 1: FUNDED */}
              <g transform="translate(45, 60)">
                <circle r="18" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
                <text y="4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#475569" fontFamily="monospace">
                  FUNDED
                </text>
              </g>

              {/* State 2: LOCKED */}
              <g transform="translate(125, 60)">
                <circle r="18" fill="#fff1f2" stroke="#e11d48" strokeWidth="2.5" />
                <text y="4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                  LOCKED
                </text>
              </g>

              {/* State 3: EVALUATED */}
              <g transform="translate(205, 60)">
                <circle r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                <text y="4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1d4ed8" fontFamily="monospace">
                  VERIFIED
                </text>
              </g>

              {/* State 4: SETTLED */}
              <g transform="translate(285, 60)">
                <circle r="20" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" className="drop-shadow-sm" />
                <text y="4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#047857" fontFamily="monospace">
                  SETTLED
                </text>
              </g>

              {/* Lock Badge */}
              <rect x="95" y="16" width="60" height="18" rx="4" fill="#fff" stroke="#f43f5e" strokeWidth="1" />
              <text x="125" y="28" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                JOB ESCROW
              </text>
            </svg>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-rose-100/50">
              <span className="text-zinc-600 font-medium">Standard: ERC-8183 Core</span>
              <span className="text-emerald-600 font-medium">Zero Counterparty Risk</span>
            </div>
          </div>
        </div>

        {/* Layer 3: FDC Verification */}
        <div
          onMouseEnter={() => setHoveredLayer("L3")}
          onMouseLeave={() => setHoveredLayer(null)}
          className="group relative flex flex-col justify-between rounded-3xl border border-rose-100/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <Badge className="h-7 px-3 rounded-lg bg-rose-600 text-white font-mono font-bold text-xs shadow-sm">
                L3
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">
                Consensus Attestation · Merkle Proofs
              </span>
            </div>

            <p className="mt-4 text-xs font-bold tracking-widest text-rose-600 font-mono">
              FDC VERIFICATION (DATA CONNECTOR PROOFS)
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-zinc-950">
              Cross-Chain &amp; Web2 Attestation
            </h3>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Verifies external deliverables—including XRPL payments, BTC/DOGE state, and Web2 JSON attestations—directly through Flare Data Connector consensus before unlocking funds.
            </p>
          </div>

          {/* Bespoke L3 Animated SVG */}
          <div className="mt-6 rounded-2xl bg-gradient-to-b from-rose-50/40 via-white to-slate-50/60 p-4 border border-rose-100/60">
            <svg viewBox="0 0 340 120" className="w-full h-28 overflow-visible">
              {/* Chain Ingress Lines to Hub */}
              <line x1="55" y1="28" x2="165" y2="60" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="55" y1="60" x2="165" y2="60" stroke="#f43f5e" strokeWidth="2" />
              <line x1="55" y1="92" x2="165" y2="60" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />

              {/* Source Chains */}
              <rect x="15" y="18" width="50" height="20" rx="5" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="40" y="31" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748b" fontFamily="monospace">
                XRPL
              </text>

              <rect x="15" y="50" width="50" height="20" rx="5" fill="#fff1f2" stroke="#fecdd3" />
              <text x="40" y="63" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#e11d48" fontFamily="monospace">
                EVM Tx
              </text>

              <rect x="15" y="82" width="50" height="20" rx="5" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="40" y="95" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748b" fontFamily="monospace">
                Web2 API
              </text>

              {/* FDC Central Consensus Hub */}
              <circle cx="165" cy="60" r="22" fill="#0f172a" stroke="#e11d48" strokeWidth="2.5" className="drop-shadow-md" />
              <text x="165" y="57" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff" fontFamily="monospace">
                FDC
              </text>
              <text x="165" y="68" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#fb7185" fontFamily="monospace">
                PROOF
              </text>

              {/* Attestation Output to Flare */}
              <line x1="187" y1="60" x2="265" y2="60" stroke="#10b981" strokeWidth="2.5" />
              <circle cx="285" cy="60" r="16" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
              <text x="285" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#059669">
                ✓
              </text>
            </svg>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-rose-100/50">
              <span className="text-zinc-600 font-medium">Consensus: 100+ Flare Validators</span>
              <span className="text-emerald-600 font-medium">Cryptographic Finality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Featured Machine Credentials Card */}
      <div className="mt-6 rounded-3xl border border-rose-100/90 bg-gradient-to-br from-white via-rose-50/20 to-slate-50/60 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <Badge className="h-7 px-3 rounded-lg bg-zinc-950 text-white font-mono font-bold text-xs shadow-sm">
                L4
              </Badge>
              <span className="text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full font-semibold">
                ERC-8004 / ERC-5192 Soulbound
              </span>
            </div>

            <p className="mt-4 text-xs font-bold tracking-widest text-rose-600 font-mono">
              AGENT IDENTITY &amp; MACHINE CREDENTIALS
            </p>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-zinc-950">
              Portable Policy State &amp; Authority Certificates
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Binds agent operator keys, execution mandates, historical compliance scores, and permission scopes into an onchain, machine-readable credential. Any counterparty agent can verify spending caps and authorization before transacting.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Operator Key Binding
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Exportable Audit Proofs
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> ERC-8004 Schema
              </span>
            </div>
          </div>

          {/* Credential Visual Pill Box */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-slate-950 p-5 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">
                  ✺
                </div>
                <span className="font-mono text-xs font-semibold text-slate-300">
                  ERC-8004 Machine Certificate
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                COMPLIANT
              </span>
            </div>

            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Agent ID:</span>
                <span className="text-slate-200 font-semibold">kya-coston2-8183</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Operator:</span>
                <span className="text-rose-400">0x9f18...5f1</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>USD Policy:</span>
                <span className="text-emerald-400">$500/day · FTSOv2</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Invariant Check:</span>
                <span className="text-emerald-400">Passed (isConserved: true)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Soulbound Token #114</span>
              <span className="text-slate-400">Flare Coston2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quote Callout */}
      <div className="mt-16 text-center rounded-3xl border border-rose-100 bg-[#fff1f3]/60 p-8 sm:p-12 max-w-3xl mx-auto shadow-sm">
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          The AI agent decides <span className="italic font-serif">what</span> to do.
        </p>
        <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600">
          KYA and Flare enforce <span className="underline decoration-rose-400">what the agent is allowed</span> to do.
        </p>
      </div>
    </section>
  )
}
