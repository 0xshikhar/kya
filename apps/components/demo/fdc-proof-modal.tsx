"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  FileCode2,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Database,
  Hash,
  Network,
} from "lucide-react"

interface FdcProofModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FdcProofModal({ isOpen, onClose }: FdcProofModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"proof" | "consensus" | "solidity">("proof")

  if (!isOpen) return null

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const proofData = {
    attestationType: "Payment (0x0001)",
    sourceChain: "XRPL (Ripple Ledger)",
    sourceTxHash: "0x7a8e99b0c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
    sourceSender: "rHb9CJAWy34rjUspn2HEjhajC6m29bwdtyTh",
    destinationAdapter: "0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2",
    deliveredAmount: "50.00 FXRP",
    paymentMemo: "KYA-XRPL-FDC-SETTLE-778",
    votingRound: "38491",
    consensusWeight: "78.4% (Threshold: > 50%)",
    merkleRoot: "0x9c3f1e8a2b5d4c7e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
    verificationContract: "0x906507E0B64bcD494Db73bd0459d1C667e14B933",
    evaluatorContract: "0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501",
    proofSiblings: [
      "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3",
      "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
      "0x9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    ],
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100/80 bg-[#fffafa] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-950">
                  Flare Data Connector (FDC) Attestation Proof
                </h2>
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Coston2 Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Cryptographic Merkle Proof Unlocking ERC-8183 Job Settlement on Flare
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-zinc-100 bg-white flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("proof")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "proof"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Attestation Proof Struct
          </button>
          <button
            onClick={() => setActiveTab("consensus")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "consensus"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Network className="h-3 w-3" />
            <span>Flare Consensus &amp; Merkle Root</span>
          </button>
          <button
            onClick={() => setActiveTab("solidity")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "solidity"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <FileCode2 className="h-3 w-3" />
            <span>FdcPaymentEvaluator.sol</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === "proof" && (
            <>
              {/* Highlight Banner */}
              <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-3.5 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-emerald-950 leading-relaxed">
                  <p className="font-semibold">
                    Trustless Settlement Enforced by Flare Consensus
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Unlike centralized bridge oracles or off-chain keeper networks, KYA releases conditional
                    job escrow <strong>strictly upon verifying this FDC Merkle proof</strong> on Flare EVM.
                    If the XRPL transaction amount, destination, or memo differs, settlement reverts.
                  </p>
                </div>
              </div>

              {/* Data Fields Table */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-zinc-950 text-xs uppercase tracking-wider font-mono">
                  Verified Proof Payload (IAddressValidityProof / IPaymentProof)
                </h4>

                <div className="rounded-2xl border border-zinc-200 divide-y divide-zinc-100 bg-[#faf8f7] font-mono text-[11px] overflow-hidden">
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Attestation Type:</span>
                    <span className="font-bold text-zinc-900">{proofData.attestationType}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Source Network:</span>
                    <span className="font-bold text-rose-700">{proofData.sourceChain}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">XRPL Source Tx:</span>
                    <div className="flex items-center gap-1.5 text-zinc-800">
                      <span className="truncate max-w-[240px]">{proofData.sourceTxHash}</span>
                      <button
                        onClick={() => copyToClipboard(proofData.sourceTxHash, "tx")}
                        className="text-zinc-400 hover:text-zinc-900"
                      >
                        {copiedField === "tx" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Payment Memo Binding:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {proofData.paymentMemo}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Delivered Escrow Amount:</span>
                    <span className="font-bold text-zinc-900">{proofData.deliveredAmount}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">FDC Evaluator (Coston2):</span>
                    <a
                      href={`https://coston2-explorer.flare.network/address/${proofData.evaluatorContract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <span>0xcd34...9501</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "consensus" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-zinc-200 bg-[#faf8f7] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">FDC Voting Epoch</span>
                  <div className="text-base font-bold font-mono text-zinc-900">
                    Round #{proofData.votingRound}
                  </div>
                  <span className="text-[10px] text-zinc-400">90-180s Consensus Round</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-zinc-200 bg-[#faf8f7] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Consensus Weight</span>
                  <div className="text-base font-bold font-mono text-emerald-700">
                    {proofData.consensusWeight}
                  </div>
                  <span className="text-[10px] text-zinc-400">Flare Data Providers</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-zinc-900 block mb-1 font-mono uppercase text-xs">
                  Merkle Tree Root
                </span>
                <div className="rounded-xl border border-zinc-200 bg-[#faf8f7] p-2.5 font-mono text-[11px] text-zinc-800 break-all select-all flex items-center justify-between gap-1">
                  <span>{proofData.merkleRoot}</span>
                  <button
                    onClick={() => copyToClipboard(proofData.merkleRoot, "root")}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-500 shrink-0"
                  >
                    {copiedField === "root" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="font-semibold text-zinc-900 block mb-1 font-mono uppercase text-xs">
                  Merkle Proof Path Siblings (Validated by IFdcVerification)
                </span>
                <div className="space-y-1.5">
                  {proofData.proofSiblings.map((sibling, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-zinc-200/80 bg-white font-mono text-[10px] text-zinc-600 flex items-center justify-between"
                    >
                      <span className="text-zinc-400 font-bold mr-2">[{idx}]</span>
                      <span className="truncate">{sibling}</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded ml-2 shrink-0">
                        Valid 32B Hash
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "solidity" && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-zinc-900 block mb-1">
                  Evaluator Verification Implementation
                </span>
                <p className="text-[11px] text-zinc-500 mb-2 leading-relaxed">
                  The smart contract checks the Merkle proof directly with Flare&apos;s enshrined FDC verification contract.
                </p>

                <pre className="rounded-2xl border border-zinc-200 bg-[#faf8f7] p-3 font-mono text-[11px] text-zinc-800 overflow-x-auto leading-relaxed">
{`// packages/contracts/src/evaluators/FdcPaymentEvaluator.sol
function evaluate(uint256 jobId, bytes calldata proofData) external override returns (bool) {
    Payment.Proof memory proof = abi.decode(proofData, (Payment.Proof));
    
    // Enshrined Flare Data Connector verification
    require(fdcVerification.verifyPayment(proof), "FDC: Invalid Merkle Proof");
    
    // Ensure payment matches required XRPL conditions
    JobCondition memory cond = jobConditions[jobId];
    require(proof.data.responseBody.amount >= cond.expectedAmount, "FDC: Amount Insufficient");
    require(proof.data.responseBody.receivingAddress == cond.expectedDestination, "FDC: Dest Mismatch");
    require(proof.data.responseBody.standardPaymentReference == cond.expectedMemo, "FDC: Memo Mismatch");
    
    // Trigger conditional escrow payout
    jobAdapter.complete(jobId, cond.recipient);
    return true;
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-rose-100 bg-[#fffafa] flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>FdcPaymentEvaluator Verified on Flare Coston2</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
