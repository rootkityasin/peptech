"use client"

import React, { useState } from "react"
import Link from "next/link"
import catalog from "@/data/catalog.json"
import { useCart } from "@/components/cart/CartContext"

export default function RefillsPage() {
  const { addItem } = useCart()
  const [subscriptionState, setSubscriptionState] = useState<Record<string, boolean>>({
    "refill-retatrutide-10": true,
    "refill-tirzepatide-15": true,
  })

  const toggleSub = (id: string, isSub: boolean) => {
    setSubscriptionState((prev) => ({ ...prev, [id]: isSub }))
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Category Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] uppercase tracking-wider">
            Category 2 • Existing Pen Owners
          </span>
          <span className="text-xs text-zinc-500 font-mono">Subscribe &amp; Save 10% (28 Days)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Refill Cartridges
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          High-purity prefilled replacement cartridges designed exclusively for the reusable PEPTECH precision pen system. Order single replacements or choose <strong>Subscribe &amp; Save every 28 days</strong> for automated dispatch and 10% savings.
        </p>
      </div>

      {/* Cross-Link Banner for First-Time Customers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖊️</span>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">Do you need the reusable PEPTECH pen?</h4>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">These cartridges require the PEPTECH precision pen to operate. If you do not own the pen, purchase the Complete Pen Set first.</p>
          </div>
        </div>
        <Link
          href="/pen-sets"
          className="px-4 py-2 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
        >
          View Complete Pen Sets →
        </Link>
      </div>

      {/* Refill Cartridges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {catalog.sampleRefills.map((refill) => {
          const isSub = subscriptionState[refill.id] ?? true
          const currentPrice = isSub ? refill.priceSubscription : refill.priceOneTime

          return (
            <div
              key={refill.id}
              className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header & Badge */}
              <div className="p-6 pb-0 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] border border-[var(--color-brand-teal)]/20 uppercase tracking-wide">
                    {refill.compatibility}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">{refill.sku}</span>
                </div>

                <h3 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100">{refill.title}</h3>
                
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <span>Strength: <strong className="text-zinc-800 dark:text-zinc-200">{refill.strength}</strong></span>
                  <span>•</span>
                  <span>Batch: <strong className="text-zinc-800 dark:text-zinc-200">{refill.batch}</strong></span>
                </div>
              </div>

              {/* Purchase Selector: One-Time vs 28-Day Subscription */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => toggleSub(refill.id, false)}
                    className={`py-2 px-2 rounded-lg text-center transition-all ${
                      !isSub
                        ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    One-Time (£{refill.priceOneTime.toFixed(2)})
                  </button>
                  <button
                    onClick={() => toggleSub(refill.id, true)}
                    className={`py-2 px-2 rounded-lg text-center transition-all relative ${
                      isSub
                        ? "bg-[var(--color-brand-teal)] text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <span>Subscribe -10%</span>
                    <span className="block text-[10px] font-mono opacity-90">£{refill.priceSubscription.toFixed(2)} / 28d</span>
                  </button>
                </div>

                {isSub && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <span>✓</span> <span>28-Day Subscribe &amp; Save Active</span>
                    </div>
                    <p className="text-[10px] opacity-90">
                      Save 10% automatically. Change delivery date, pause, skip, or cancel anytime in your account without contacting support.
                    </p>
                  </div>
                )}

                {/* Pricing & Add to Cart */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                        £{currentPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 ml-1">GBP</span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {isSub ? "Every 28 Days" : "One-Time"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      addItem({
                        id: refill.id,
                        title: refill.title,
                        format: "refill",
                        strength: refill.strength,
                        price: refill.priceOneTime,
                        isSubscription: isSub,
                        subscriptionIntervalDays: isSub ? 28 : undefined,
                        discountPercent: isSub ? 10 : undefined,
                        sku: refill.sku,
                        batch: refill.batch,
                      })
                    }
                    className="w-full py-3 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{isSub ? "Subscribe & Save (Every 28 Days)" : "Add Refill Cartridge to Order"}</span>
                    <span>+</span>
                  </button>

                  <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
                    <Link href="/pen-sets" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      Need the Pen? View Set ↗
                    </Link>
                    <Link href="/lab-reports" className="text-[var(--color-brand-teal)] hover:underline">
                      View Verified COA ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </main>
  )
}
