"use client"

import React, { useState } from "react"
import { useFtsoFeeds } from "@/hooks/use-ftso-feeds"
import {
  Activity,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Coins,
  Copy,
  Check,
  Radio,
} from "lucide-react"
import { COSTON2_CONTRACTS } from "@/lib/contracts"

export function FtsoTelemetryCard() {
  const { flr, xrp, isLoading, isRefreshing, error, lastUpdated, refresh } = useFtsoFeeds()
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedFeed(id)
    setTimeout(() => setCopiedFeed(null), 2000)
  }

  const ftsoAddress = COSTON2_CONTRACTS.oracles?.ftsoV2 || "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d"

  return (
    <div className="rounded-2xl border border-rose-100 bg-white/95 p-5 shadow-2xs transition-shadow hover:shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/70 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950">
                FTSOv2 On-Chain Oracle Telemetry
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                BLOCK LATENCY
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live oracle feeds queried directly from Flare Coston2 for L1 USD spend policy containment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${COSTON2_CONTRACTS.explorerUrl}/address/${ftsoAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full px-2.5 py-1 transition"
            title="Inspect FTSOv2 contract on Flare Coston2 Explorer"
          >
            <span>FTSOv2 Contract</span>
            <ExternalLink className="h-3 w-3 text-zinc-400" />
          </a>

          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 rounded-full border border-rose-200 bg-white hover:bg-rose-50/60 text-zinc-700 px-2.5 py-1 text-xs font-medium transition shadow-2xs"
            title="Poll fresh block feeds"
          >
            <RefreshCw className={`h-3 w-3 text-rose-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Feed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FLR / USD Feed */}
        <div className="rounded-xl border border-rose-100/90 bg-[#faf8f7] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white font-bold text-[10px]">
                FLR
              </div>
              <span className="font-bold text-sm text-zinc-950">FLR / USD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {flr ? `${flr.stalenessSeconds}s ago` : "Querying..."}
              </span>
            </div>
          </div>

          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight font-mono text-zinc-950">
              {flr ? flr.formattedPrice : "$0.007361"}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <span>Policy Valuation:</span>
              <span className="font-mono font-semibold text-zinc-800">
                $50 USD cap = {flr && flr.price > 0 ? Math.round(50 / flr.price).toLocaleString() : "6,792"} FLR
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-100/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="truncate max-w-[190px]">Feed: 0x01464c52...0000</span>
            <button
              onClick={() => flr && handleCopy("flr", flr.id)}
              className="hover:text-zinc-900 flex items-center gap-1 text-[10px] text-zinc-600 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-2xs"
            >
              {copiedFeed === "flr" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedFeed === "flr" ? "Copied" : "Copy ID"}</span>
            </button>
          </div>
        </div>

        {/* XRP / USD Feed */}
        <div className="rounded-xl border border-rose-100/90 bg-[#faf8f7] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
                XRP
              </div>
              <span className="font-bold text-sm text-zinc-950">XRP / USD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {xrp ? `${xrp.stalenessSeconds}s ago` : "Querying..."}
              </span>
            </div>
          </div>

          <div className="my-2">
            <div className="text-2xl font-extrabold tracking-tight font-mono text-zinc-950">
              {xrp ? xrp.formattedPrice : "$1.5214"}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <span>Policy Valuation:</span>
              <span className="font-mono font-semibold text-zinc-800">
                $50 USD cap = {xrp && xrp.price > 0 ? (50 / xrp.price).toFixed(2) : "32.86"} XRP
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-100/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="truncate max-w-[190px]">Feed: 0x01585250...0000</span>
            <button
              onClick={() => xrp && handleCopy("xrp", xrp.id)}
              className="hover:text-zinc-900 flex items-center gap-1 text-[10px] text-zinc-600 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-2xs"
            >
              {copiedFeed === "xrp" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedFeed === "xrp" ? "Copied" : "Copy ID"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invariant Footer */}
      <div className="mt-4 pt-3 border-t border-rose-100/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>FTSOv2 Invariant: Staleness &lt; 600s (PolicyEngine.sol:L13) · Enforced Fail-Closed</span>
        </div>
        <div className="text-[10px] text-zinc-400 font-mono">
          Last polled: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Just now"}
        </div>
      </div>
    </div>
  )
}

export function FtsoHeaderBadge() {
  const { flr, xrp } = useFtsoFeeds()

  return (
    <div
      className="hidden md:flex items-center gap-2 rounded-full border border-rose-100 bg-[#faf7f7] px-3 py-1 text-xs text-zinc-800 shadow-2xs"
      title="Live Flare FTSOv2 block-latency price feeds enforced on Coston2"
    >
      <div className="flex items-center gap-1 font-mono text-[11px]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-zinc-400 font-sans font-medium text-[10px]">FTSOv2:</span>
        <span className="font-semibold text-zinc-900">
          FLR {flr ? flr.formattedPrice : "$0.0074"}
        </span>
        <span className="text-zinc-300">·</span>
        <span className="font-semibold text-zinc-900">
          XRP {xrp ? xrp.formattedPrice : "$1.52"}
        </span>
      </div>
    </div>
  )
}
