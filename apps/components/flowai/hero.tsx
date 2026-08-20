import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"

export function Hero() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-rose-200/80 bg-[linear-gradient(135deg,#fff1f3_0%,#ffd9d2_48%,#ffcaca_100%)] px-6 py-16 shadow-[0_18px_50px_rgba(225,65,66,0.12)] sm:py-20 md:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(190,55,65,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(190,55,65,.09)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-900 shadow-sm"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E84142]" /> BUILT ON FLARE EVM</span>
          <span className="hidden rounded-full border border-zinc-200/80 bg-white/75 px-3 py-1 text-xs text-zinc-600 shadow-sm sm:inline-flex">ENFORCED BY MATHEMATICS</span>
        </div>
        <h1 className="text-balance text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] text-zinc-950 sm:text-6xl md:text-7xl">Give AI Agents Capital.<br /><span className="text-zinc-950">Keep The Treasury.</span></h1>
        <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">KYA Network gives autonomous AI agents controlled access to capital without giving them unrestricted control of the treasury.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full bg-zinc-950 px-6 py-5 text-white shadow-sm hover:bg-zinc-800"><Link href="#simulator">Launch Operator App <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild variant="outline" className="rounded-full border-white/80 bg-white/80 px-6 py-5 text-zinc-900 hover:bg-white"><Link href="#architecture">Explore the Protocol</Link></Button>
          <Button asChild variant="ghost" className="rounded-full text-zinc-700 hover:bg-white/50 hover:text-zinc-950"><Link href="#developers"><BookOpen className="mr-2 h-4 w-4" /> Read the Docs</Link></Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
