"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShieldCheck, Wallet, Zap, ShieldAlert, RotateCcw, ArrowRight } from "lucide-react"

export function DashboardPreview() {
  const [revoked, setRevoked] = useState(false)

  return (
    <section className="-mt-10" id="simulator">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-rose-200/80 bg-white/95 shadow-xl shadow-rose-950/[0.05] backdrop-blur">
        {/* Console Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-[#fffafa] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-zinc-950 text-sm">
              KYA Agent Containment Console
            </span>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              revoked
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {revoked ? "✕ SUBTREE QUARANTINED (1-TX)" : "● FTSO USD POLICIES ACTIVE"}
          </span>
        </div>

        {/* Console Body - Unified Studio Grid */}
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Left Column: Vault & Agent Hierarchy */}
          <div className="rounded-2xl border border-rose-100 bg-[#fcf9f9] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-medium">
                  Master Mandate Vault
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-950">$65,000</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  FXRP · <span className="text-emerald-600 font-semibold">Active on Coston2</span>
                </p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-sm text-rose-500">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            {/* Mandate Tree Hierarchy */}
            <div className="ml-3 sm:ml-4 border-l-2 border-rose-200 pl-4 sm:pl-5 space-y-3">
              {/* Parent Agent Card */}
              <div className="rounded-xl border border-rose-100/90 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-zinc-900">
                    FAssets Sentinel Agent (Parent)
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 font-mono">$50 / call · $500 / day</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded border border-rose-200/80 bg-rose-50/70 px-2 py-0.5 text-[10px] font-medium text-rose-700 font-mono">
                    FTSOv2 USD BOUNDED
                  </span>
                  <span className="rounded border border-emerald-200/80 bg-emerald-50/70 px-2 py-0.5 text-[10px] font-medium text-emerald-700 font-mono">
                    INVARIANT: GREEN
                  </span>
                </div>
              </div>

              {/* Child Sub-Agent Card */}
              <div
                className={cn(
                  "rounded-xl border p-3.5 transition-all duration-300",
                  revoked
                    ? "border-rose-300 bg-rose-50/70 text-rose-950 shadow-sm"
                    : "border-zinc-200/80 bg-white text-zinc-800 shadow-sm",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">
                    Cross-Chain Arb Worker (Sub-Agent)
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono",
                      revoked
                        ? "bg-rose-100 text-rose-700 border border-rose-300"
                        : "bg-amber-50 text-amber-700 border border-amber-200",
                    )}
                  >
                    {revoked ? "QUARANTINED (LEAF DISCONNECTED)" : "ALLOCATED $5,000"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                  {revoked
                    ? "Subtree severed atomically. Root vault completely protected from leakage."
                    : "Child mandate bounded — cannot spend outside assigned allocation."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Containment Pipeline & Emergency Quarantine */}
          <div className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 font-mono">
                The Containment Pipeline
              </p>
              <h3 className="mt-2 text-sm sm:text-base font-bold text-zinc-950 leading-snug">
                Vault → Mandate Tree → Policy Engine → Escrow → FDC
              </h3>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-100/80 bg-[#fffcfc] p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <Zap className="h-4 w-4" />
                    <p className="text-xs font-bold text-zinc-950">ERC-8183 ESCROW</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    Job-locked capital released only upon verified milestone delivery.
                  </p>
                </div>
                <div className="rounded-xl border border-rose-100/80 bg-[#fffcfc] p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-xs font-bold text-zinc-950">FDC VERIFIED</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    External state &amp; XRPL/EVM payments verified trustlessly on Flare.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100">
              {revoked ? (
                <div className="space-y-2.5">
                  <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3 text-center font-medium leading-relaxed">
                    Subtree quarantined in 1 onchain transaction. Unspent capital swept to root vault.
                  </div>
                  <Button
                    onClick={() => setRevoked(false)}
                    variant="outline"
                    className="w-full rounded-full border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 py-4.5 font-medium shadow-sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-zinc-500" /> Reset Simulator
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setRevoked(true)}
                  className="w-full rounded-full bg-zinc-950 text-white hover:bg-zinc-800 py-5 font-semibold shadow-sm transition-all"
                >
                  <ShieldAlert className="mr-2 h-4 w-4 text-rose-400" />
                  Emergency Subtree Quarantine (1-Tx)
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

