import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "KYA Network | On-chain authorization for AI agents",
  description: "Give autonomous AI agents controlled access to capital without unrestricted treasury control.",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-[#e84142]/30 selection:text-[#ff8a8c]">{children}</body>
    </html>
  )
}
