import React from "react"
import Link from "next/link"
import catalog from "@/data/catalog.json"

export default function HomePage() {
  return (
    <main className="space-y-16 pb-20">
      
      {/* 1. Clinical Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-surface)] to-transparent pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] border border-[var(--color-brand-teal)]/20 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-teal)] animate-pulse" />
            <span>IN-VITRO LABORATORY RESEARCH ONLY • STRICTLY 18+</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Quality. Safety. Precision.
          </h1>

          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            High-purity research compounds engineered for laboratory scientific inquiry. Introducing the 
            <strong> PEPTECH® Reusable Precision Pen System</strong> alongside batch-verified lyophilised vials.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pen-sets"
              className="px-6 py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>1. Complete Pen Sets</span>
              <span>→</span>
            </Link>
            <Link
              href="/refills"
              className="px-6 py-3 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>2. Refill Cartridges</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">-10% Sub</span>
            </Link>
            <Link
              href="/vials"
              className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <span>3. Freeze-Dried Vials</span>
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> HPLC &amp; Mass Spec Verified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> Royal Mail Tracked (£4.95 UK / £15 Worldwide)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> 100% Discreet Outer Packaging
            </span>
          </div>
        </div>
      </section>

      {/* 2. Mandatory 3-Step Lifecycle Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
            How The PEPTECH System Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The 3-Step Reusable Pen Journey</h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
            Engineered to eliminate disposable single-use plastic waste while maintaining medical-grade trial precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                STEP 1
              </span>
              <span className="text-xs text-zinc-400 font-mono">First Purchase</span>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Buy Complete Pen Set</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              First-time researchers receive the durable PEPTECH precision pen, prefilled cartridge, device passport, 31G 5mm sterile needles, and alcohol prep pads.
            </p>
            <div className="pt-2">
              <Link href="/pen-sets" className="text-xs font-bold text-[var(--color-brand-navy)] dark:text-indigo-400 hover:underline">
                Shop Pen Sets →
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]">
                STEP 2
              </span>
              <span className="text-xs text-zinc-400 font-mono">Reusable Asset</span>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Keep The Reusable Pen</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Constructed from aerospace-grade aluminum. Keep your precision pen safely stored in your laboratory for long-term repeated research trials.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Zero Discard • Eco-friendly
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                STEP 3
              </span>
              <span className="text-xs text-zinc-400 font-mono">Subscribe &amp; Save</span>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Reorder Refill Cartridges</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Order fresh compatible cartridges as needed. Choose one-time purchase or <strong>Subscribe &amp; Save 10% every 28 days</strong> with flexible pause/skip.
            </p>
            <div className="pt-2">
              <Link href="/refills" className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline">
                Shop Refill Cartridges →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Clearly Separated Category Portals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Pen Sets */}
          <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-5 flex flex-col justify-between border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
                Category 1 • One-Time Only
              </span>
              <h3 className="text-2xl font-black">Complete Pen Sets</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The all-in-one starter solution for scientific laboratories. Reusable precision pen, prefilled cartridge, 31G needles, alcohol pads, and authenticity passport.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                Starting from <strong className="text-white text-base">£42.00</strong>
              </div>
              <Link
                href="/pen-sets"
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs text-center block transition-colors"
              >
                Browse All Pen Sets →
              </Link>
            </div>
          </div>

          {/* Card 2: Refills */}
          <div className="p-8 rounded-3xl bg-[var(--color-brand-slate)] text-white space-y-5 flex flex-col justify-between border border-zinc-700 shadow-lg relative overflow-hidden">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/20 text-[var(--color-brand-teal)] text-[11px] font-bold uppercase tracking-wider border border-[var(--color-brand-teal)]/30">
                Category 2 • 28-Day Subscriptions
              </span>
              <h3 className="text-2xl font-black">Refill Cartridges</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Compatible prefilled cartridges designed exclusively for the reusable PEPTECH pen. Available as one-time orders or Subscribe &amp; Save 10% every 28 days.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-700">
              <div className="text-xs text-zinc-300">
                Starting from <strong className="text-white text-base">£21.60</strong> <span className="text-[10px] text-zinc-400">(-10% sub)</span>
              </div>
              <Link
                href="/refills"
                className="w-full py-2.5 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold text-xs text-center block transition-colors"
              >
                Browse Refill Cartridges →
              </Link>
            </div>
          </div>

          {/* Card 3: Freeze-Dried Vials */}
          <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-5 flex flex-col justify-between border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider border border-cyan-500/30">
                Category 3 • Master Price List
              </span>
              <h3 className="text-2xl font-black">Freeze-Dried Vials</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our complete 6-page price list of traditional lyophilised research vials (Retatrutide, Tirzepatide, Semaglutide, BPC-157, TB-500, GHK-CU, etc.).
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                Starting from <strong className="text-white text-base">£2.40</strong> <span className="text-[10px] text-zinc-400">per vial</span>
              </div>
              <Link
                href="/vials"
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs text-center block transition-colors"
              >
                Browse All 50+ Vials →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Featured Compounds Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
              Research Grade Formulations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Popular Research Compounds</h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Manufactured under strict ISO/cGMP conditions. Verified purity &gt;99% via HPLC.
            </p>
          </div>
          <Link href="/vials" className="text-xs font-bold text-[var(--color-brand-navy)] dark:text-zinc-200 hover:underline">
            View All 50+ Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catalog.featuredVials.slice(0, 8).map((vial, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                    {vial.code}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                    In Stock
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{vial.name}</h3>
                <div className="text-xs text-zinc-500 font-mono">
                  Specification: <strong className="text-zinc-800 dark:text-zinc-200">{vial.strength} x 1 vial</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-base font-black text-[var(--color-brand-navy)] dark:text-zinc-100">
                    £{vial.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-400">GBP • Single Vial</div>
                </div>
                <Link
                  href="/vials"
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white text-xs font-bold transition-colors"
                >
                  Configure
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Central COA & Batch Verification Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
                className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
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
                <span className="font-semibold">Retatrutide 10mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Testing Lab:</span>
                <span className="font-semibold">Alliance Analytical Services</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Analysis Method:</span>
                <span className="font-semibold">HPLC / MS ESI+</span>
              </div>
            </div>
            <Link
              href="/lab-reports"
              className="w-full py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs text-center block transition-colors"
            >
              Inspect Sample Report PDF ↗
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
