"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, Lock, ExternalLink, ShieldCheck, Flame } from "lucide-react"

export function NetworkBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Network Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8.5 px-3 rounded-full border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/70 text-xs font-semibold text-emerald-950 shadow-2xs hover:shadow-xs transition-all"
        title="Flare Coston2 Testnet (Chain ID: 114) · Click to view network status"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="tracking-tight">Flare Coston2</span>
        <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded-full hidden sm:inline">
          114
        </span>
        <ChevronDown
          className={`h-3 w-3 text-emerald-700 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Network Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Network Telemetry
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Flare EVM</span>
          </div>

          <div className="space-y-2">
            {/* Active Network: Flare Coston2 */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-zinc-900">Flare Coston2 Testnet</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                  <Check className="h-2.5 w-2.5" />
                  Active
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                <span>Chain ID: 114</span>
                <span>·</span>
                <span className="text-emerald-700">10 Contracts Verified</span>
              </div>
            </div>

            {/* Inactive / Guarded Network: Flare Mainnet */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-2.5 opacity-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Lock className="h-3 w-3 text-zinc-400" />
                  <span className="text-xs font-semibold">Flare Mainnet (14)</span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/80 px-2 py-0.5 rounded-full font-mono">
                  Disabled
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 leading-snug">
                Disabled in UI until completion of external smart contract security audit.
              </p>
            </div>
          </div>

          {/* Quick Explorer & Faucet Links */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
            <a
              href="https://coston2-explorer.flare.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[11px] font-medium transition"
            >
              <span>Explorer</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>
            <a
              href="https://faucet.flare.network/coston2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[11px] font-medium transition"
            >
              <span>Faucet</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
