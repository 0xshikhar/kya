"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShieldCheck, Wallet, Zap, XCircle } from "lucide-react"

export function DashboardPreview() {
  const [revoked, setRevoked] = useState(false)
  return <section className="-mt-10" id="simulator">
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6"><div className="flex items-center gap-2"><div className="grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white"><ShieldCheck className="h-3.5 w-3.5" /></div><span className="font-semibold text-zinc-950">KYA Operator</span></div><span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide", revoked ? "border-rose-200 bg-rose-50 text-rose-700" : "border-rose-200 bg-rose-50 text-rose-700")}>{revoked ? "SUBTREE REVOKED" : "FTSO USD POLICY LIVE"}</span></div>
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="rounded-2xl bg-slate-900 p-5 text-white"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">Master Vault</p><p className="mt-1 text-3xl font-semibold">$65,000</p><p className="text-sm text-slate-400">FXRP · <span className="text-emerald-400">ACTIVE</span></p></div><Wallet className="h-8 w-8 text-rose-300" /></div><div className="ml-5 border-l border-rose-400/50 pl-5"><div className="rounded-xl border border-rose-200 border-l-4 border-l-rose-500 bg-white p-3 text-zinc-950"><div className="flex items-center justify-between"><span className="font-medium">FAssets Vault Sentinel</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div><p className="mt-2 text-xs text-slate-500">$50 / call · $500 / day</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-700">FTSO USD POLICY</span><span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">INVARIANT GREEN</span></div></div><div className="mt-3 rounded-xl border border-slate-700 bg-slate-800 p-3"><div className="flex items-center justify-between"><span className="font-medium">Worker Agent B</span><span className={cn("text-xs", revoked ? "text-rose-300" : "text-amber-300")}>{revoked ? "REVOKED" : "PENDING"}</span></div><p className="mt-1 text-xs text-slate-400">Child allocation · subtree protected</p></div></div></div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Containment engine</p><h3 className="mt-2 text-xl font-semibold text-zinc-950">Capital → Agent → Policy → Action → Verification</h3><div className="mt-6 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-3"><Zap className="h-4 w-4 text-rose-600" /><p className="mt-2 text-sm font-medium text-zinc-950">ESCROW ENABLED</p><p className="text-xs text-slate-500">Conditional release</p></div><div className="rounded-xl border border-slate-200 bg-white p-3"><ShieldCheck className="h-4 w-4 text-emerald-600" /><p className="mt-2 text-sm font-medium text-zinc-950">FDC VERIFIED</p><p className="text-xs text-slate-500">Proof-gated payout</p></div></div></div><Button onClick={() => setRevoked(true)} className="mt-6 w-full rounded-full bg-rose-600 text-white hover:bg-rose-700"><XCircle className="mr-2 h-4 w-4" /> Emergency Subtree Kill</Button></div>
      </div>
    </div>
  </section>
}
