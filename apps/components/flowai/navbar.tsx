"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
    <header>
      <nav
        className={cn(
          "mx-auto mt-2 flex items-center justify-between gap-3",
          "rounded-full border border-rose-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md",
        )}
        aria-label="Primary"
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white text-xs font-semibold shadow-sm">
            {"✺"}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold tracking-tight text-zinc-950">KYA</span>
            <span className="text-[11px] font-medium text-zinc-500">by Mandant</span>
          </div>
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-zinc-600 md:flex font-medium">
          <li>
            <Link href="#features" className="transition-colors hover:text-zinc-950">
              Protocol
            </Link>
          </li>
          <li>
            <Link href="#architecture" className="transition-colors hover:text-zinc-950">
              Architecture
            </Link>
          </li>
          <li>
            <Link href="#developers" className="transition-colors hover:text-zinc-950">
              Developers
            </Link>
          </li>
          <li>
            <Link href="#developers" className="transition-colors hover:text-zinc-950">
              Docs
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 md:inline px-3 py-1.5 rounded-full hover:bg-zinc-100"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 md:inline px-3 py-1.5 rounded-full hover:bg-zinc-100"
          >
            DAG Demo
          </Link>
          <Button
            asChild
            size="sm"
            className={cn(
              "rounded-full px-4 text-xs sm:text-sm font-medium",
              "bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm",
            )}
          >
            <Link href="/dashboard" aria-label="Launch Operator App">
              <span className="mr-1">Launch Operator App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
