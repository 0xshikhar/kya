"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Shield, ArrowRight, Wallet, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [operatorName, setOperatorName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast({
        title: "Operator Account Created",
        description: "Your master treasury mandate is ready on Flare Coston2.",
      })
      router.push("/dashboard")
    }, 600)
  }

  return (
    <main className="min-h-screen bg-[#fff8f7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-200/20 blur-[100px] rounded-full" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white font-bold text-sm shadow-sm">
            {"✺"}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold tracking-tight text-zinc-950 text-xl">KYA</span>
            <span className="text-xs font-medium text-zinc-500">by Mandant</span>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          Create Operator Mandate
        </h1>
        <p className="mt-2 text-sm text-zinc-600 max-w-sm mx-auto">
          Deploy your first policy-bounded agent vault on Flare EVM with mathematical capital isolation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="rounded-3xl border border-rose-200/80 bg-white/95 p-6 sm:p-8 shadow-xl shadow-rose-950/[0.04] backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 font-mono">
                Organization / Operator Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Apex DeFi Labs"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                required
                className="rounded-xl border-zinc-200 bg-[#faf8f7] focus:bg-white text-zinc-900 text-sm py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 font-mono">
                Work Email
              </label>
              <Input
                type="email"
                placeholder="operator@mandant.xyz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-zinc-200 bg-[#faf8f7] focus:bg-white text-zinc-900 text-sm py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 font-mono">
                Create Password / Passkey
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="rounded-xl border-zinc-200 bg-[#faf8f7] focus:bg-white text-zinc-900 text-sm py-2.5"
              />
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 space-y-1.5 text-xs text-zinc-600">
              <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero Private-Key Risk for AI Agents</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>1-Tx Emergency Subtree Quarantine</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-5 shadow-sm text-sm"
            >
              <span>{loading ? "Initializing Mandate..." : "Initialize Root Mandate"}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-rose-100/80 text-center">
            <p className="text-xs text-zinc-500">
              Already have an operator vault?{" "}
              <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700 underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500 space-y-1">
          <p className="font-mono text-[11px]">
            Flare Coston2 Testnet (114) · Flare Mainnet (Disabled)
          </p>
          <p className="text-zinc-400 text-[10px]">
            © 2026 KYA by Mandant. Non-Custodial Security Infrastructure.
          </p>
        </div>
      </div>
    </main>
  )
}
