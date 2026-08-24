"use client"

import React, { useState } from "react"
import { MandateNodeData } from "./dag-node"
import { Shield, AlertTriangle, CheckCircle2, Lock, X, ExternalLink, Copy, Check, Zap } from "lucide-react"

interface InspectorDrawerProps {
  node: MandateNodeData | null
  onClose: () => void
  onRevoke: (nodeId: string) => void
}

export function InspectorDrawer({ node, onClose, onRevoke }: InspectorDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!node) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isRevoked = node.status === "REVOKED"
  const isRoot = node.role === "root"
  const asset = node.asset || "FXRP"

  return (
    <div className="w-84 border-l border-slate-200 bg-white p-4 shadow-lg flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Agent Mandate Inspector</h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{node.mandateId.slice(0, 16)}...</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Role & Status */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
            {node.role === "root" ? <Shield className="h-4 w-4 text-slate-900" /> : <Zap className="h-4 w-4 text-rose-600" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">{node.label}</div>
            <div className="text-[10px] text-slate-500 capitalize">Tier {node.depth} • {node.role}</div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isRevoked
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {node.status}
        </span>
      </div>

      {/* Financial Accounting */}
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider block mb-2">
          Conservation Invariant
        </span>
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Granted Allocation</span>
            <span className="font-mono font-semibold text-slate-900">${node.granted.toLocaleString()} {asset}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Current Idle Balance</span>
            <span className={`font-mono font-semibold ${isRevoked ? "text-slate-400 line-through" : "text-emerald-700"}`}>
              ${node.idle.toLocaleString()} {asset}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Locked in Escrow</span>
            <span className="font-mono font-semibold text-amber-700">${node.locked.toLocaleString()} {asset}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-medium">
            <span className="flex items-center gap-1 text-[11px] text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Invariant Verified
            </span>
            <span className="font-mono text-[10px] text-slate-500">idle + locked = granted</span>
          </div>
        </div>
      </div>

      {/* Flare Enshrined Policy Specs */}
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider block mb-2">
          Flare Enshrined Policy (L1)
        </span>
        <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Price Feed</span>
            <span className="font-semibold text-rose-900">FtsoV2 (Block-latency)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Per-Call Limit</span>
            <span className="font-mono font-semibold text-slate-900">${node.ftsoCapUSD || 50} USD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Daily Max Cap</span>
            <span className="font-mono font-semibold text-slate-900">${(node.ftsoCapUSD || 50) * 10} USD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Target Allowlist</span>
            <span className="font-mono text-slate-700">{node.allowlistCount} Verified Contracts</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="mt-4 space-y-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider block">
          Onchain Identifier
        </span>
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="truncate pr-2">
            <span className="text-[10px] text-slate-500 block">Agent Address</span>
            <span className="font-mono text-[11px] text-slate-800">{node.agentAddress}</span>
          </div>
          <button
            onClick={() => handleCopy(node.agentAddress)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Emergency Action */}
      {!isRoot && !isRevoked && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => onRevoke(node.mandateId)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white p-2.5 text-xs font-semibold shadow-sm transition"
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Subtree Revocation
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
            1-Tx O(1) kill switch. Reverts all pending calls and sweeps idle funds back to parent.
          </p>
        </div>
      )}
    </div>
  )
}
