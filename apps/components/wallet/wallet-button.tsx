"use client"

import React, { useState, useRef, useEffect } from "react"
import { useWallet, FLARE_COSTON2_FAUCET_URL } from "@/hooks/use-wallet"
import {
  Wallet,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  RefreshCw,
  Coins,
  Lock,
  X,
  Droplets,
} from "lucide-react"
import { COSTON2_CONTRACTS } from "@/lib/contracts"

export function WalletButton() {
  const {
    address,
    isConnected,
    isConnecting,
    isSwitchingChain,
    isCoston2,
    isInstalled,
    walletName,
    balance,
    usdcBalance,
    connect,
    disconnect,
    switchToCoston2,
    refreshBalance,
  } = useWallet()

  const [copied, setCopied] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false)
        setShowInstallModal(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [dropdownOpen])

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleConnectClick = () => {
    if (!isInstalled) {
      setShowInstallModal(true)
    } else {
      connect()
    }
  }

  // State 1: Not connected
  if (!isConnected) {
    return (
      <>
        <button
          onClick={handleConnectClick}
          disabled={isConnecting}
          className="group flex items-center gap-2 h-8.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white px-3.5 text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95"
        >
          <Wallet className="h-3.5 w-3.5 text-rose-400 transition-transform group-hover:scale-110" />
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </button>

        {/* Wallet Install Guidance Modal */}
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl relative">
              <button
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Web3 Wallet Required</h3>
                  <p className="text-[11px] text-zinc-500">Flare Coston2 Testnet (Chain 114)</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                KYA interacts directly with Flare smart contracts. Please install a compatible Web3 browser extension to authenticate as an operator:
              </p>

              <div className="space-y-2 mb-4">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-[#faf8f7] hover:bg-white hover:border-rose-300 transition text-xs font-medium text-zinc-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>MetaMask</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>

                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-[#faf8f7] hover:bg-white hover:border-rose-300 transition text-xs font-medium text-zinc-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Rabby Wallet</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>

                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-[#faf8f7] hover:bg-white hover:border-rose-300 transition text-xs font-medium text-zinc-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Coinbase Wallet</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-2.5 text-[11px] text-amber-800 leading-normal">
                <strong>Note:</strong> Flare Mainnet is currently disabled. All mandates settle on Flare Coston2 Testnet.
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // State 2: Connected but Wrong Network (Not Coston2)
  if (!isCoston2) {
    return (
      <button
        onClick={switchToCoston2}
        disabled={isSwitchingChain}
        className="flex items-center gap-1.5 h-8.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 text-xs font-semibold shadow-xs transition-colors animate-pulse"
        title="KYA requires Flare Coston2 Testnet (Chain ID 114). Flare Mainnet is disabled."
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        <span>{isSwitchingChain ? "Switching..." : "Switch to Coston2"}</span>
      </button>
    )
  }

  // State 3: Connected & on Flare Coston2
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 h-8.5 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50 px-3 text-xs font-semibold text-zinc-900 shadow-2xs hover:shadow-xs transition-all"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        {balance && (
          <span className="hidden sm:inline font-mono text-zinc-500 text-[11px] font-normal border-r border-zinc-200 pr-2">
            {balance}
          </span>
        )}

        <span className="font-mono text-zinc-900">{shortAddr}</span>
        <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Account Info Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-50 pb-2.5 mb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {walletName}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Coston2 (114)
            </span>
          </div>

          {/* Full Address */}
          <div className="rounded-xl bg-[#faf8f7] border border-rose-100/60 p-2.5 font-mono text-[11px] text-zinc-800 break-all select-all flex items-center justify-between gap-1">
            <span className="truncate">{address}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-900 shrink-0"
              title="Copy Address"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Balances Section */}
          <div className="mt-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-zinc-600">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Coins className="h-3 w-3 text-rose-500" />
                <span>Gas Balance:</span>
              </span>
              <span className="font-mono font-semibold text-zinc-900 text-[11px]">
                {balance || "0.00 C2FLR"}
              </span>
            </div>

            {usdcBalance && (
              <div className="flex items-center justify-between text-zinc-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-3 w-3 rounded-full bg-blue-500/20 text-blue-700 font-bold text-[9px] grid place-items-center">
                    $
                  </span>
                  <span>MockUSDC Collateral:</span>
                </span>
                <span className="font-mono font-semibold text-zinc-900 text-[11px]">
                  {usdcBalance}
                </span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="text-[10px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-mono transition"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRefreshing ? "animate-spin text-rose-600" : ""}`} />
                <span>Refresh Balances</span>
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-2.5 space-y-1 text-xs">
            <a
              href={`${COSTON2_CONTRACTS.explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                <span>View on Coston2 Explorer</span>
              </span>
            </a>

            <a
              href={FLARE_COSTON2_FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-rose-50/50 text-rose-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Droplets className="h-3.5 w-3.5 text-rose-600" />
                <span>Get Free C2FLR (Faucet)</span>
              </span>
              <ExternalLink className="h-3 w-3 text-rose-400" />
            </a>

            {/* Flare Mainnet status note */}
            <div className="p-2 rounded-lg bg-zinc-100/60 border border-zinc-200/50 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-zinc-400" />
                <span>Flare Mainnet (14)</span>
              </span>
              <span className="bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded font-sans text-[9px] uppercase">
                Disabled
              </span>
            </div>

            <button
              onClick={() => {
                disconnect()
                setDropdownOpen(false)
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-rose-50 text-rose-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Disconnect Wallet</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

