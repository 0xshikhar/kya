"use client"

import { useState } from "react"
import { Cpu, Terminal, Shield, Check, Copy } from "lucide-react"

const benefits = [
  {
    icon: Cpu,
    title: "Framework Agnostic",
    desc: "Drop-in support for LangChain, CrewAI, AutoGen, Coinbase AgentKit, and ElizaOS.",
  },
  {
    icon: Terminal,
    title: "Model Context Protocol (MCP)",
    desc: "Connect Claude Desktop or Cursor directly to KYA tools (kya_allocate_mandate, kya_check_policy, kya_settle_escrow).",
  },
  {
    icon: Shield,
    title: "100% Non-Custodial",
    desc: "Master keys and withdrawal controls always remain with the human treasury operator.",
  },
]

export default function PricingSection() {
  const [copied, setCopied] = useState(false)

  const codeSnippet = `import { KyaClient } from "@kya-network/sdk";

// Initialize client on Flare Coston2 / Flare Mainnet
const kya = new KyaClient({
  chain: "coston2",
  operatorKey: process.env.OPERATOR_PRIVATE_KEY!,
});

// Create a mathematically bounded mandate for an autonomous trading agent
const { agentId, mandateAddress } = await kya.createMandate({
  name: "FAssets-Rebalance-Agent",
  vaultAsset: "FXRP",
  maxSpendPerCallUSD: 50,       // Enforced in real-time via FTSOv2
  maxSpendPerDayUSD: 500,       // Rolling 24-hour rate limit
  targetAllowlist: ["0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2"],
  expiryHours: 72,
  allowSubDelegation: true,     // Can spawn child workers up to $100 cap
});

console.log(\`Agent \${agentId} bound to Mandate \${mandateAddress}\`);`

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="developers" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 font-mono">
            DEVELOPER &amp; AGENT FRAMEWORKS
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Give your AI agents an onchain execution boundary in 3 lines of code.
          </h2>
          <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
            Seamlessly integrate KYA into ElizaOS, Coinbase AgentKit, LangChain, Autonolas, or custom Python/TypeScript agent swarms via our lightweight SDK and native Model Context Protocol (MCP) server.
          </p>
        </div>

        {/* Code Block Card - Cohesive Warm Studio Aesthetic */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-rose-200/80 bg-white/95 shadow-xl shadow-rose-950/[0.04] backdrop-blur">
          {/* Header Bar */}
          <div className="flex flex-row items-center justify-between border-b border-rose-100 bg-[#fffafa] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-3 font-mono text-xs font-medium text-zinc-600">
                kya-agent-setup.ts
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-rose-200 bg-rose-50/70 px-3 py-1 font-mono text-[11px] font-medium text-rose-700">
                @kya-network/sdk · Coston2 &amp; Mainnet
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Body with High-Legibility Modern Light Syntax */}
          <div className="p-6 overflow-x-auto bg-[#faf8f7]/60">
            <pre className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-800">
              <code>
                <span className="text-rose-600 font-semibold">import</span> &#123; KyaClient &#125;{" "}
                <span className="text-rose-600 font-semibold">from</span>{" "}
                <span className="text-emerald-700 font-medium">&quot;@kya-network/sdk&quot;</span>;{"\n\n"}
                <span className="text-zinc-400 italic">// Initialize client on Flare Coston2 / Flare Mainnet</span>{"\n"}
                <span className="text-rose-600 font-semibold">const</span> kya ={" "}
                <span className="text-rose-600 font-semibold">new</span>{" "}
                <span className="text-indigo-600 font-semibold">KyaClient</span>(&#123;{"\n"}
                {"  "}chain: <span className="text-emerald-700 font-medium">&quot;coston2&quot;</span>,{"\n"}
                {"  "}operatorKey: process.env.<span className="text-amber-700 font-medium">OPERATOR_PRIVATE_KEY</span>!,{"\n"}
                &#125;);{"\n\n"}
                <span className="text-zinc-400 italic">// Create a mathematically bounded mandate for an autonomous trading agent</span>{"\n"}
                <span className="text-rose-600 font-semibold">const</span> &#123; agentId, mandateAddress &#125; ={" "}
                <span className="text-rose-600 font-semibold">await</span> kya.
                <span className="text-indigo-600 font-semibold">createMandate</span>(&#123;{"\n"}
                {"  "}name: <span className="text-emerald-700 font-medium">&quot;FAssets-Rebalance-Agent&quot;</span>,{"\n"}
                {"  "}vaultAsset: <span className="text-emerald-700 font-medium">&quot;FXRP&quot;</span>,{"\n"}
                {"  "}maxSpendPerCallUSD: <span className="text-amber-700 font-semibold">50</span>,       <span className="text-zinc-400 italic">// Enforced in real-time via FTSOv2</span>{"\n"}
                {"  "}maxSpendPerDayUSD: <span className="text-amber-700 font-semibold">500</span>,       <span className="text-zinc-400 italic">// Rolling 24-hour rate limit</span>{"\n"}
                {"  "}targetAllowlist: [<span className="text-emerald-700 font-medium">&quot;0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2&quot;</span>],{"\n"}
                {"  "}expiryHours: <span className="text-amber-700 font-semibold">72</span>,{"\n"}
                {"  "}allowSubDelegation: <span className="text-rose-600 font-semibold">true</span>,     <span className="text-zinc-400 italic">// Can spawn child workers up to $100 cap</span>{"\n"}
                &#125;);{"\n\n"}
                console.<span className="text-indigo-600 font-semibold">log</span>(
                <span className="text-emerald-700 font-medium">`Agent $&#123;agentId&#125; bound to Mandate $&#123;mandateAddress&#125;`</span>
                );
              </code>
            </pre>

            {/* Bottom Info Bar */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-rose-100/90 pt-4 text-xs font-mono">
              <span className="text-rose-700 font-medium">
                Define the policy once. Enforced onchain via Flare FTSOv2 &amp; FDC.
              </span>
              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-zinc-700 shadow-sm">
                <span className="text-zinc-400">$</span>
                <span>pnpm add @kya-network/sdk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Benefits Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all"
              >
                <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-950">{b.title}</h3>
                <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

