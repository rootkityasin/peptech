import React from "react"
import Link from "next/link"
import { HeroProductCard } from "@/components/home/HeroProductCard"
import { CategoryTabsSection } from "@/components/home/CategoryTabsSection"
import { CompoundSpecCard } from "@/components/home/CompoundSpecCard"
import { ResearchFaqSection } from "@/components/home/ResearchFaqSection"

export default function HomePage() {
  return (
    <main className="space-y-16 sm:space-y-24 pb-24">
      
      {/* 1. Clinical Headline & Hero Introduction */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-surface)] via-white to-transparent dark:from-[var(--color-brand-surface)] dark:via-[#061224] dark:to-transparent pt-10 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal-dark)] dark:text-[var(--color-brand-teal)] border border-[var(--color-brand-teal)]/20 text-[11px] font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-teal)] animate-pulse" />
            <span>LABORATORY RESEARCH USE ONLY • STRICTLY 18+ AGE RESTRICTED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Quality. Safety. Precision.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            High-purity research compounds and the <strong>PEPTECH® Reusable Precision Pen System</strong>. Engineered for zero plastic waste, verifiable HPLC purity, and automated 28-day reordering.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <Link
              href="/pen-sets"
              className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>1. Complete Pen Sets</span>
              <span>→</span>
            </Link>
            <Link
              href="/refills"
              className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>2. Refill Cartridges</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">-10%</span>
            </Link>
            <Link
              href="/vials"
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold transition-all"
            >
              <span>3. Freeze-Dried Vials</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Mobile-First Featured Hero Product Card & Tier Selector (Screenshot 1 Layout) */}
      <HeroProductCard />

      {/* 3. The 3-Step Lifecycle Visual Journey (Screenshot 2 Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1 mb-8">
          <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
            Reusable Pen System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            The 3-Step Reusable Journey
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
            Designed to replace wasteful disposable plastic pens with a medical-grade aluminum precision asset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                STEP 1
              </span>
              <span className="text-[10px] font-mono text-zinc-400">First Purchase Only</span>
            </div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Buy Your Complete Pen Set Once
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              First-time researchers purchase the Complete Pen Set. Includes the reusable precision aluminum pen, prefilled cartridge, device passport, 31G 5mm sterile needles, and alcohol pads.
            </p>
            <div className="pt-2">
              <Link href="/pen-sets" className="text-xs font-bold text-[var(--color-brand-navy)] dark:text-indigo-400 hover:underline">
                Shop Pen Sets →
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]">
                STEP 2
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Reusable Asset</span>
            </div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Keep The Precision Pen
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Crafted from aerospace-grade aluminum with high micro-dial accuracy. Keep your precision pen safely stored in your laboratory for long-term experimental use.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Zero Discarded Hardware
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                STEP 3
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Subscribe &amp; Save 10%</span>
            </div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Return to Reorder Refills
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Never re-buy the pen. Simply reorder compatible sealed cartridges. Choose one-time purchase or <strong>Subscribe &amp; Save 10% every 28 days</strong> with full pause/skip control.
            </p>
            <div className="pt-2">
              <Link href="/refills" className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline">
                Shop Refill Cartridges →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Interactive Category Tabs & Live Medusa Catalog (Screenshot 2 Structure) */}
      <CategoryTabsSection />

      {/* 5. Compound Technical Specifications Passport (Screenshot 2 Architecture) */}
      <CompoundSpecCard />

      {/* 6. Central COA & Batch Verification Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              Scientific Transparency
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Search Any Batch Certificate of Analysis (COA)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every compound is accompanied by an independent HPLC and Mass Spectrometry purity report. Enter the batch number printed on your vial or pen box to download your verified certificate.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/lab-reports"
                className="px-6 py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                Search COA Library →
              </Link>
              <Link
                href="/verify"
                className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-800 dark:text-zinc-200"
              >
                Scan Packaging QR Code
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span>Sample Batch: RT-2609A</span>
              <span className="text-emerald-600 font-bold">VERIFIED 99.4%</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Compound:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Retatrutide 10mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Testing Lab:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Alliance Analytical Services UK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Analysis Method:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">HPLC / MS ESI+</span>
              </div>
            </div>
            <Link
              href="/lab-reports"
              className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs text-center block transition-colors"
            >
              Inspect Sample Report PDF ↗
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Laboratory Research FAQ Accordion (Screenshot 2 Architecture) */}
      <ResearchFaqSection />

    </main>
  )
}
