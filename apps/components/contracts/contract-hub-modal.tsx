"use client"

import React, { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  FileCode2,
  ExternalLink,
  Copy,
  Check,
  X,
  Search,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react"
import { COSTON2_CONTRACTS } from "@/lib/contracts"

export interface ContractInfo {
  name: string
  address: string
  layer: "L0" | "L1" | "L2" | "L3" | "L4" | "Flare Core"
  category: "Accounting" | "Policy" | "Settlement" | "Identity" | "Flare Infrastructure"
  description: string
  standards?: string
}

export const VERIFIED_CONTRACTS: ContractInfo[] = [
  {
    name: "MandateHub",
    address: COSTON2_CONTRACTS.addresses.hub,
    layer: "L0",
    category: "Accounting",
    description: "Multi-asset vault holding capital. Enforces mathematical conservation (Idle + Child + Locked = Granted).",
    standards: "KYA Vault",
  },
  {
    name: "MandateTree",
    address: COSTON2_CONTRACTS.addresses.tree,
    layer: "L0",
    category: "Accounting",
    description: "Hierarchical O(1) downward attenuation graph. Manages atomic subtree quarantine and upward capital sweeps.",
    standards: "DAG Accounting",
  },
  {
    name: "JobAdapter",
    address: COSTON2_CONTRACTS.addresses.adapter,
    layer: "L2",
    category: "Settlement",
    description: "Conditional job escrow exit gate. Payouts require cryptographic evaluator completion before funds can leave.",
    standards: "ERC-8183",
  },
  {
    name: "PolicyEngine",
    address: COSTON2_CONTRACTS.addresses.policyEngine,
    layer: "L1",
    category: "Policy",
    description: "Real-time spend firewall. Resolves live FTSOv2 price feeds (FLR/USD, XRP/USD) to enforce per-call USD limits.",
    standards: "FTSOv2 Feeds",
  },
  {
    name: "CredentialRegistry",
    address: COSTON2_CONTRACTS.addresses.credentialRegistry,
    layer: "L4",
    category: "Identity",
    description: "Mints non-transferable Soulbound NFTs for agent nodes; records ERC-8004 machine credentials on-chain.",
    standards: "ERC-8004 · ERC-5192",
  },
  {
    name: "HashMatchEvaluator",
    address: COSTON2_CONTRACTS.addresses.hashMatchEvaluator,
    layer: "L3",
    category: "Settlement",
    description: "Validates keccak256 deliverable hashes matching client job requirements before escrow release.",
    standards: "Hash-Match L3",
  },
  {
    name: "FdcPaymentEvaluator",
    address: COSTON2_CONTRACTS.addresses.fdcPaymentEvaluator,
    layer: "L3",
    category: "Settlement",
    description: "Proves XRPL cross-chain payments using Flare Data Connector (FDC) Merkle attestation proofs.",
    standards: "FDC XRPL Proofs",
  },
  {
    name: "FdcEvmTxEvaluator",
    address: COSTON2_CONTRACTS.addresses.fdcEvmTxEvaluator,
    layer: "L3",
    category: "Settlement",
    description: "Verifies EVM transaction inclusion on external blockchains through FDC state connector attestations.",
    standards: "FDC EVM Proofs",
  },
  {
    name: "MandateLog",
    address: COSTON2_CONTRACTS.addresses.mandateLog,
    layer: "L0",
    category: "Accounting",
    description: "Immutable on-chain audit log capturing mandate initialization, delegations, and emergency kill-switches.",
    standards: "Audit Trail",
  },
  {
    name: "MockUSDC",
    address: COSTON2_CONTRACTS.addresses.mockUSDC,
    layer: "L0",
    category: "Accounting",
    description: "Testnet 6-decimal collateral currency simulating real institutional treasury assets on Coston2.",
    standards: "ERC-20",
  },
]

interface ContractHubModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContractHubModal({ isOpen, onClose }: ContractHubModalProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const filteredContracts = useMemo(() => {
    return VERIFIED_CONTRACTS.filter((c) => {
      const matchesLayer = selectedLayer === "ALL" || c.layer === selectedLayer
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesLayer && matchesSearch
    })
  }, [selectedLayer, searchQuery])

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleCopyAllJson = () => {
    const jsonStr = JSON.stringify(
      {
        network: "Flare Coston2 Testnet (Chain ID: 114)",
        rpcUrl: COSTON2_CONTRACTS.rpcUrl,
        explorerUrl: COSTON2_CONTRACTS.explorerUrl,
        contracts: VERIFIED_CONTRACTS.reduce(
          (acc, c) => ({ ...acc, [c.name]: c.address }),
          {}
        ),
      },
      null,
      2
    )
    navigator.clipboard.writeText(jsonStr)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 px-6 py-4 bg-[#fffafa] shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
              <FileCode2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-950">
                  Verified Flare Coston2 Contracts
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  10 VERIFIED (CHAIN 114)
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                On-chain authorization, containment, and settlement bytecode deployed on Flare Coston2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllJson}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition shadow-2xs"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
              <span>{copiedAll ? "JSON Copied!" : "Export Addresses"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-rose-100/60 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Layer Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            {["ALL", "L0", "L1", "L2", "L3", "L4"].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition ${
                  selectedLayer === layer
                    ? "bg-zinc-950 text-white shadow-2xs"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80"
                }`}
              >
                {layer === "ALL" ? "All (10)" : layer}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search contracts or standards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-zinc-200 bg-[#faf8f7] focus:bg-white focus:border-rose-300 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-mono">
              No verified contracts match your filter.
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const isCopied = copiedAddress === contract.address
              return (
                <div
                  key={contract.name}
                  className="rounded-2xl border border-rose-100/90 bg-[#faf8f7] hover:bg-white p-4 transition-all hover:shadow-xs group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-950">
                        {contract.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {contract.layer}
                      </span>
                      {contract.standards && (
                        <span className="font-mono text-[10px] text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full">
                          {contract.standards}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleCopy(contract.address)}
                        className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg px-2 py-1 transition shadow-2xs"
                        title="Copy contract address"
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-zinc-400" />
                        )}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>

                      <a
                        href={`${COSTON2_CONTRACTS.explorerUrl}/address/${contract.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg px-2.5 py-1 transition shadow-2xs"
                        title="View verified source code on Flare Coston2 Explorer"
                      >
                        <span>Explorer</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 mb-2 leading-relaxed">
                    {contract.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 bg-white/70 border border-zinc-200/60 rounded-xl px-3 py-1.5">
                    <span className="truncate select-all">{contract.address}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded shrink-0 ml-2">
                      Verified Bytecode
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-rose-100 bg-[#fffafa] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deployed with Foundry · FTSOv2 &amp; FDC Verified</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            Flare Coston2 RPC: https://coston2-api.flare.network/ext/C/rpc
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContractHubButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-rose-200/90 bg-white hover:bg-rose-50/70 text-zinc-800 px-3 py-1.5 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all hover:border-rose-300"
        title="View all 10 verified smart contracts on Flare Coston2"
      >
        <FileCode2 className="h-3.5 w-3.5 text-rose-600" />
        <span className="hidden sm:inline">Contracts</span>
        <span className="text-[10px] bg-rose-50 text-rose-700 font-mono px-1 rounded font-bold">10</span>
      </button>

      <ContractHubModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
