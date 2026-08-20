import { Navbar } from "@/components/flowai/navbar"
import { Hero } from "@/components/flowai/hero"
import { DashboardPreview } from "@/components/flowai/dashboard-preview"
import FeaturesSection from "@/components/flowai/sections/features"
import HowItWorksSection from "@/components/flowai/sections/how-it-works"
import PricingSection from "@/components/flowai/sections/pricing"

export default function Page() {
  return (
    <main className="min-h-dvh bg-[#fff8f7]">
      <div className="relative border-b border-rose-100 bg-[#fff8f7]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8"><Navbar /><Hero /><DashboardPreview /></div>
      </div>
      <FeaturesSection /><HowItWorksSection /><PricingSection />
    </main>
  )
}
