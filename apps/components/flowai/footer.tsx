import Link from "next/link"
import { ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-rose-100/80 bg-white/70 backdrop-blur-sm text-zinc-600 text-sm">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white text-xs font-semibold shadow-sm">
                {"✺"}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold tracking-tight text-zinc-950 text-base">KYA</span>
                <span className="text-xs font-medium text-zinc-500">by Mandant</span>
              </div>
            </Link>

            <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
              The financial firewall for autonomous AI. Enforcing real-time USD spending policies, capital isolation, and proof-verified settlement on Flare.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200/80 px-3 py-1.5 rounded-full shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Coston2 Testnet Live · Verified Contracts</span>
              </div>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Platform
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li>
                <Link href="#features" className="hover:text-zinc-950 transition-colors">
                  Risk Containment
                </Link>
              </li>
              <li>
                <Link href="#protocol" className="hover:text-zinc-950 transition-colors">
                  Mandate Architecture
                </Link>
              </li>
              <li>
                <Link href="#simulator" className="hover:text-zinc-950 transition-colors">
                  Simulator Console
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">
                  Operator App
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Developers
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li>
                <Link href="#developers" className="hover:text-zinc-950 transition-colors">
                  TypeScript SDK
                </Link>
              </li>
              <li>
                <Link href="#developers" className="hover:text-zinc-950 transition-colors">
                  Model Context Protocol
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
                >
                  GitHub <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://coston2-explorer.flare.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
                >
                  Contract Explorer <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Flare Ecosystem */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Ecosystem
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li>
                <a
                  href="https://flare.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
                >
                  Flare Network <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">FTSOv2 Price Oracles</span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs">Flare Data Connector</span>
              </li>
              <li>
                <a
                  href="https://mandant.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors font-medium"
                >
                  Mandant Protocol <ExternalLink className="h-3 w-3 text-rose-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-rose-100/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 KYA by Mandant. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>Built on Flare EVM</span>
            <span>·</span>
            <span>Non-Custodial</span>
            <span>·</span>
            <span>ERC-8183 Native</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

