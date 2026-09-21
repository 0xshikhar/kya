"use client"

import React, { useRef, useEffect } from "react"
import { Terminal, Shield, ArrowUpRight, CheckCircle2, AlertTriangle, Lock, Zap } from "lucide-react"

export interface EventLogItem {
  id: string
  type: "ROOT_CREATED" | "SPAWN" | "FTSO_CHECK" | "JOB_FUNDED" | "JOB_COMPLETED" | "POLICY_REVERT" | "REVOKE" | "REFUND"
  title: string
  details: string
  txHash: string
  timestamp: string
}

export function EventStream({
  logs,
  onInspectFdcProof,
}: {
  logs: EventLogItem[]
  onInspectFdcProof?: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="h-44 border-t border-slate-200 bg-slate-50/90 flex flex-col">
      {/* Bar Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Terminal className="h-3.5 w-3.5 text-rose-600" />
          <span>Protocol Event Stream (Flare Coston2 Testnet · Chain ID: 114)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FtsoV2 Feeds Live (FLR/USD · XRP/USD)</span>
        </div>
      </div>

      {/* Stream Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px]">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start justify-between rounded-lg bg-white border border-slate-200/80 px-3 py-1.5 shadow-xs hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  log.type === "REVOKE"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : log.type === "POLICY_REVERT"
                    ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                    : log.type === "JOB_COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : log.type === "FTSO_CHECK"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : log.type === "JOB_FUNDED"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-50 text-slate-700 border border-slate-200"
                }`}
              >
                {log.type}
              </span>
              <span className="font-semibold text-slate-900">{log.title}</span>
              <span className="text-slate-500 text-[10px]">{log.details}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onInspectFdcProof &&
                (log.title.includes("FDC") ||
                  log.details.includes("FDC") ||
                  log.title.includes("XRPL") ||
                  log.details.includes("XRPL")) && (
                  <button
                    onClick={onInspectFdcProof}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-sans font-medium flex items-center gap-1 transition"
                    title="Inspect Flare Data Connector (FDC) cryptographic Merkle proof and voting round"
                  >
                    <Shield className="h-2.5 w-2.5 text-purple-600" />
                    <span>Inspect FDC Proof</span>
                  </button>
                )}
              <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
              <a
                href={`https://coston2-explorer.flare.network/tx/${log.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 hover:text-rose-800 flex items-center gap-0.5 text-[10px] font-mono hover:underline"
              >
                <span>{log.txHash.slice(0, 8)}...</span>
                <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
