import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const problemCards = [
  {
    title: "The Hot-Key Trap",
    label: "UNBOUNDED EXPOSURE",
    body: "An autonomous agent holding a standard private key controls the entire wallet balance. A single poisoned context, compromised dependency, or bad model output can drain the whole treasury in a single transaction.",
  },
  {
    title: "The Swarm Cascading Risk",
    label: "RECURSIVE DELEGATION",
    body: "Multi-agent swarms spawn child sub-agents dynamically. Without strict hierarchical capital boundaries, a hallucinating worker can recursively consume balances intended for other jobs across the organization.",
  },
  {
    title: "The Unverified Payout Problem",
    label: "UNBOUNDED SETTLEMENT",
    body: "When an AI agent hires another agent or pays for an external API/service, paying upfront invites default, while paying after invites counterparty disputes. Capital must be locked in conditional escrow and released only upon cryptographic proof of delivery.",
  },
]

const pillars = [
  {
    title: "Bounded Capital Isolation (Mandate Tree)",
    desc: "Every agent and sub-agent operates within a strictly isolated branch of a capital DAG. Funds are partitioned cryptographically: idle + childGranted + jobLocked = totalGranted.",
    highlight: "Mathematical Invariant: Zero cross-agent capital leakage",
  },
  {
    title: "FTSOv2 USD-Denominated Policy Engine",
    desc: "Never set static crypto limits that break during market volatility. FTSOv2 supplies sub-second onchain feeds to enforce limits in human-readable USD terms across FXRP, FLR, and stablecoins.",
    highlight: "Max Spend / Call: $50 USD · 24h Rolling Window: $500 USD",
  },
  {
    title: "ERC-8183 Conditional Escrow",
    desc: "Agents hire other agents safely. Capital enters a rigorous state machine: FUNDED → LOCKED → EVALUATED → SETTLED. Funds never leave escrow unless explicit execution parameters are satisfied.",
    highlight: "Trustless Payment Rails for Agent-to-Agent Commerce",
  },
  {
    title: "FDC Proof-Gated Settlement",
    desc: "Flare Data Connector cryptographically verifies external offchain events, Web2 API receipts, XRPL payments, and foreign EVM transactions before releasing escrowed agent capital.",
    highlight: "XRPL Payment · Web2 API Proof · EVM Finality Verification",
  },
]

export default function FeaturesSection() {
  return (
    <>
      {/* Part 1: The Risk Vector */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 font-mono">
            THE RISK VECTOR
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl leading-tight">
            AI agents can execute financial transactions.
            <br />
            <span className="text-slate-500 font-normal">They were never designed to hold unrestricted private keys.</span>
          </h2>
          <p className="mt-5 text-slate-600 text-sm sm:text-base leading-relaxed">
            Modern autonomous swarms monitor oracles, rebalance liquidity, trade perpetuals, and commission sub-agents. Giving them raw private keys turns single prompt injections or hallucinations into instant treasury drains. KYA places an inviolable mathematical policy barrier between agent intelligence and treasury execution.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problemCards.map((card) => (
            <Card key={card.title} className="rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <p className="text-[11px] font-bold tracking-widest text-rose-600 font-mono">
                  {card.label}
                </p>
                <CardTitle className="mt-1 text-lg font-bold text-zinc-950">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-600">
                {card.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Part 2: Contained Statement Banner */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950 px-6 py-16 sm:py-20 text-center text-white shadow-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
          />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-balance leading-tight">
              KYA transforms unrestricted AI wallets into mathematically contained economic actors.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every autonomous agent operates with explicit, USD-denominated spending limits, isolated sub-allocations, and proof-gated settlement. Nothing more.
            </p>
          </div>
        </div>
      </section>

      {/* Part 3: The Enforcement Layer */}
      <section id="protocol" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 font-mono">
            NATIVE FLARE ENFORCEMENT
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Capital, Policies, and Settlement in One Integrated Layer.
          </h2>
          <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
            KYA combines programmable mandate trees with Flare&apos;s native data primitives so autonomous agents can operate against real capital without financial catastrophe.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="rounded-3xl border border-rose-100 bg-white/95 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-rose-200 transition-all p-2"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-zinc-950">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-zinc-600">
                  {pillar.desc}
                </p>
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 font-mono text-xs text-rose-900 font-medium">
                  {pillar.highlight}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}

