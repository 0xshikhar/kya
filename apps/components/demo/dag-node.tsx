"use client"

import React from "react"
import { Handle, Position } from "@xyflow/react"
import { Shield, Cpu, AlertTriangle, CheckCircle2, Lock, Zap } from "lucide-react"

export interface MandateNodeData {
  label: string
  role: "root" | "orchestrator" | "worker" | "escrow" | "watchdog"
  granted: number
  idle: number
  locked: number
  depth: number
  status: "ACTIVE" | "REVOKED" | "SETTLED" | "FUNDED"
  asset?: "FXRP" | "FLR" | "USDC"
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

export function MandateNodeComponent({ data, selected }: { data: MandateNodeData; selected?: boolean }) {
  const isRevoked = data.status === "REVOKED"
  const isSettled = data.status === "SETTLED"
  const isFunded = data.status === "FUNDED"
  const asset = data.asset || "USDC"

  return (
    <div
      className={`relative w-[280px] rounded-xl border bg-white p-3.5 shadow-sm transition-all duration-300 ${
        selected ? "ring-2 ring-rose-500 border-rose-400 shadow-md" : "border-slate-200/90 hover:border-slate-300 hover:shadow"
      } ${isRevoked ? "border-rose-300 bg-rose-50/40" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-2.5 !h-2.5" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              data.role === "root"
                ? "bg-slate-900 border-slate-800 text-white"
                : data.role === "orchestrator"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : data.role === "escrow"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : isRevoked
                ? "bg-rose-100 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {data.role === "root" && <Shield className="h-3.5 w-3.5" />}
            {data.role === "orchestrator" && <Zap className="h-3.5 w-3.5" />}
            {data.role === "worker" && !isRevoked && <Cpu className="h-3.5 w-3.5" />}
            {data.role === "worker" && isRevoked && <AlertTriangle className="h-3.5 w-3.5" />}
            {data.role === "escrow" && <Lock className="h-3.5 w-3.5" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 tracking-tight leading-none">{data.label}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {data.agentAddress ? `${data.agentAddress.slice(0, 6)}...${data.agentAddress.slice(-4)}` : "0x0000...0000"}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
            isRevoked
              ? "border-rose-300 bg-rose-50 text-rose-800 font-semibold"
              : isFunded
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : isSettled
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isRevoked ? "bg-rose-600 animate-pulse" : isFunded ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          {data.status}
        </span>
      </div>

      {/* Financial Accounting Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50/80 rounded-lg p-2 border border-slate-100 text-[11px]">
        <div>
          <span className="text-[10px] text-slate-600 block uppercase tracking-wider font-semibold">Idle Balance</span>
          <span className={`font-mono font-semibold ${isRevoked ? "text-slate-400 line-through" : "text-slate-900"}`}>
            ${data.idle.toLocaleString()} {asset}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-600 block uppercase tracking-wider font-semibold">Granted</span>
          <span className="font-mono text-slate-700 font-medium">${data.granted.toLocaleString()} {asset}</span>
        </div>
      </div>

      {/* FTSOv2 USD Policy Limit Tag if present */}
      {data.ftsoCapUSD !== undefined && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-rose-50/70 border border-rose-100 px-2 py-0.5 text-[10px] text-rose-800">
          <span className="font-medium">FTSOv2 USD Cap:</span>
          <span className="font-mono font-semibold">${data.ftsoCapUSD} / call</span>
        </div>
      )}

      {/* Active Job Escrow Badge if applicable */}
      {data.locked > 0 && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-amber-50/90 border border-amber-200/80 px-2 py-1 text-[10px] text-amber-800">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="font-medium">Escrow Job #{data.activeJob?.id || 1}</span>
          </div>
          <span className="font-mono font-semibold">${data.locked} Locked</span>
        </div>
      )}

      {/* Subtree Revocation Alert Banner */}
      {isRevoked && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-rose-100/90 border border-rose-300 px-2 py-1 text-[10px] text-rose-800 font-medium">
          <AlertTriangle className="h-3 w-3 text-rose-700 shrink-0" />
          <span>Halted in 1-Tx • Unspent swept to parent</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-2.5 !h-2.5" />
    </div>
  )
}
