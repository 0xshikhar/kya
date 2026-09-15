"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { Shield, ArrowRight, Wallet, KeyRound, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
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
        title: "Authenticated as Operator",
        description: "Welcome to KYA by Mandant Operator Console.",
      })
      router.push("/dashboard")
    }, 600)
  }

  const { connect: connectWallet } = useWallet()

  const onWalletConnect = async () => {
    setLoading(true)
    try {
      const connectedAddr = await connectWallet()
      if (connectedAddr) {
        toast({
          title: "Wallet Connected",
          description: `Authenticated on Coston2 (${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)}).`,
        })
        router.push("/dashboard")
      }
    } finally {
      setLoading(false)
    }
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
          Operator Console
        </h1>
        <p className="mt-2 text-sm text-zinc-600 max-w-sm mx-auto">
          Manage bounded agent mandates, USD velocity policies, and FDC settlement on Flare.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="rounded-3xl border border-rose-200/80 bg-white/95 p-6 sm:p-8 shadow-xl shadow-rose-950/[0.04] backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 font-mono">
                Operator Email / Handle
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 font-mono">
                  Access Key / Password
                </label>
                <a href="#" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
                  Forgot?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="rounded-xl border-zinc-200 bg-[#faf8f7] focus:bg-white text-zinc-900 text-sm py-2.5"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-5 shadow-sm text-sm"
            >
              <span>{loading ? "Authenticating..." : "Sign In with Credentials"}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-rose-100" />
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Or Web3 Auth
            </span>
            <div className="flex-1 h-[1px] bg-rose-100" />
          </div>

          <button
            onClick={onWalletConnect}
            type="button"
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-950 font-semibold py-3 text-xs sm:text-sm transition-colors shadow-xs"
          >
            <Wallet className="h-4 w-4 text-rose-600" />
            <span>Connect Flare Operator Wallet</span>
          </button>

          <div className="mt-6 pt-5 border-t border-rose-100/80 text-center">
            <p className="text-xs text-zinc-500">
              Need a bounded mandate for your agent?{" "}
              <Link href="/signup" className="font-semibold text-rose-600 hover:text-rose-700 underline">
                Register Operator
              </Link>
            </p>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500 space-y-1">
          <p className="font-mono text-[11px]">
            Enforced by Mathematical Conservation · Non-Custodial
          </p>
          <p className="text-zinc-400 text-[10px]">
            Flare Coston2 Testnet (114) · Flare Mainnet (Disabled)
          </p>
        </div>
      </div>
    </main>
  )
}
