import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"

export function Hero() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-rose-200/60 bg-[linear-gradient(135deg,#fffcfc_0%,#fff2f4_45%,#ffe8ec_100%)] px-6 py-14 shadow-[0_18px_50px_rgba(225,65,66,0.08)] sm:py-18 md:py-20">
      {/* Subtle background grid & ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(225,65,66,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(225,65,66,.05)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Top Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/95 px-3.5 py-1 text-xs font-semibold text-zinc-900 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#E84142]" /> BUILT ON FLARE EVM
          </span>
          {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">
            ORACLE-ENFORCED CAPITAL
          </span> */}
        </div>

        {/* Clean, Balanced Headline */}
        <h1 className="text-balance text-4xl font-extrabold tracking-[-0.035em] text-zinc-950 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] max-w-4xl mx-auto">
          The Financial Firewall
          <br className="hidden sm:inline" />
          {" "}for Autonomous AI
        </h1>

        {/* Highlighted Oracle Enforcement Tag */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/90 bg-white/95 px-4 py-1.5 text-xs sm:text-sm font-semibold text-rose-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#E84142] animate-pulse" />
            <span>Enforced by Flare&apos;s Oracle Infrastructure</span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm sm:text-base md:text-lg leading-relaxed text-zinc-600">
          KYA gives autonomous AI agents bounded capital and programmable spending authority. FTSOv2 enforces real-time USD limits. FDC verifies task completion before payout. Rogue models never touch your treasury.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full bg-zinc-950 px-6 py-5 text-white shadow-sm hover:bg-zinc-800">
            <Link href="/dashboard">
              Launch Operator App <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-zinc-200/90 bg-white/90 px-6 py-5 text-zinc-900 hover:bg-white shadow-sm"
          >
            <Link href="#architecture">Explore the Protocol</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-zinc-700 hover:bg-white/60 hover:text-zinc-950">
            <Link href="#developers">
              <BookOpen className="mr-2 h-4 w-4" /> Read the Docs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
