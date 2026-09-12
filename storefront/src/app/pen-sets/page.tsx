"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import catalog from "@/data/catalog.json"
import { useCart } from "@/components/cart/CartContext"
import { getProductsByCategory, getProductPrice, StoreProduct } from "@/lib/medusa"

export default function PenSetsPage() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [medusaProducts, setMedusaProducts] = useState<StoreProduct[]>([])
  const [isLive, setIsLive] = useState(false)
  const [selectedTiers, setSelectedTiers] = useState<Record<string, 1 | 2 | 3>>({})

  useEffect(() => {
    getProductsByCategory("complete-pen-sets")
      .then((products) => {
        if (products && products.length > 0) {
          setMedusaProducts(products)
          setIsLive(true)
        }
      })
      .catch((err) => console.error("Error fetching pen sets from Medusa:", err))
  }, [])

  const defaultIncluded = [
    "1x Premium Reusable PEPTECH Aluminum Pen",
    "1x Prefilled Certified Research Cartridge (HPLC 99%+)",
    "1x Official Device Passport & Serialized Authenticity Card",
    "5x Sterile 31G 5mm Ultra-Fine Needles",
    "10x Medical-Grade Alcohol Prep Pads",
    "1x Quick-Start Assembly & Storage Guide",
  ]

  const penSets =
    isLive && medusaProducts.length > 0
      ? medusaProducts.map((p) => {
          const v = p.variants?.[0]
          const price = getProductPrice(v, "gbp")
          const meta = p.metadata || {}
          return {
            id: p.id,
            title: p.title,
            strength: (meta.strength as string) || v?.title || "Standard Cartridge",
            price: price > 0 ? price : 45.0,
            currency: "GBP",
            sku: v?.sku || "PEN-RT-10",
            batch: (meta.batch as string) || "RT-2609A",
            labReportUrl: (meta.labReportUrl as string) || "/lab-reports",
            included: defaultIncluded,
            compatibleRefillSku: (meta.compatibleRefillSku as string) || "REF-RT-10",
          }
        })
      : catalog.samplePenSets

  const setTier = (id: string, tier: 1 | 2 | 3) => {
    setSelectedTiers((prev) => ({ ...prev, [id]: tier }))
  }

  const handleAddToCart = (pen: any) => {
    const tier = selectedTiers[pen.id] || 1
    const qty = tier === 1 ? 1 : tier === 2 ? 2 : 3
    const discountMultiplier = tier === 1 ? 1 : tier === 2 ? 0.9 : 0.85
    const unitPrice = Number((pen.price * discountMultiplier).toFixed(2))

    for (let i = 0; i < qty; i++) {
      addItem({
        id: pen.id,
        title: pen.title,
        format: "pen-set",
        strength: pen.strength,
        price: unitPrice,
        isSubscription: false,
        sku: pen.sku,
        batch: pen.batch,
      })
    }
    setIsDrawerOpen(true)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Category Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Category 1 • First-Time Purchase
          </span>
          <span className="text-xs text-zinc-500 font-mono">One-Time Only</span>
          {isLive && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ● Live Medusa 2.0 Catalog
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Complete Pen Sets
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          The all-in-one starter solution for scientific laboratories. Each set includes our medical-grade reusable precision aluminum pen, prefilled certified cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads.
        </p>
      </div>

      {/* Cross-Link Banner for Returning Customers */}
      <div className="p-5 rounded-3xl bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl">🔄</span>
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Already own the reusable PEPTECH pen?</h4>
            <p className="text-xs text-zinc-500">You do not need another pen. Order compatible refill cartridges with 10% 28-day auto-savings.</p>
          </div>
        </div>
        <Link
          href="/refills"
          className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
        >
          Shop Compatible Refills →
        </Link>
      </div>

      {/* Pen Set Product Grid (Mobile-First Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {penSets.map((pen) => {
          const tier = selectedTiers[pen.id] || 2 // default to tier 2 (Most Popular)
          const qty = tier === 1 ? 1 : tier === 2 ? 2 : 3
          const discountMultiplier = tier === 1 ? 1 : tier === 2 ? 0.9 : 0.85
          const totalPrice = Number((pen.price * qty * discountMultiplier).toFixed(2))

          return (
            <div
              key={pen.id}
              className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Product Visual Top */}
              <div className="aspect-16/10 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200/60 dark:from-zinc-800/80 dark:to-zinc-900 flex flex-col items-center justify-center p-6 border-b border-zinc-100 dark:border-zinc-800 text-center relative">
                <span className="text-5xl mb-1">🖊️</span>
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">PEPTECH Aluminum Pen System</span>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5">31G 5mm Needles Included</span>
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white font-mono">
                  {pen.sku}
                </span>
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-teal)] text-white shadow-xs">
                  HPLC ≥ 99%
                </span>
              </div>

              {/* Product Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pen.strength}</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">✓ In Stock (Royal Mail)</span>
                  </div>

                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 leading-snug">{pen.title}</h3>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-amber-500 font-bold">★★★★★</span>
                    <span className="text-zinc-500 text-[11px] font-semibold">(148 reviews)</span>
                  </div>

                  {/* Included Items */}
                  <div className="pt-1 space-y-1.5">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">What's In The Box:</div>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                      {pen.included.slice(0, 4).map((inc: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[var(--color-brand-teal)] text-[10px]">●</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quantity Tier Selector (Screenshot 1 Pattern) */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Choose Quantity:</div>
                  
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <button
                      onClick={() => setTier(pen.id, 1)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        tier === 1
                          ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-surface)] dark:bg-zinc-800 font-bold"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="text-xs font-bold">1 Set</div>
                      <div className="text-[10px] text-zinc-400">£{pen.price.toFixed(0)}</div>
                    </button>

                    <button
                      onClick={() => setTier(pen.id, 2)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                        tier === 2
                          ? "border-[var(--color-brand-orange)] bg-[var(--color-brand-orange-light)]/30 dark:bg-zinc-800 font-bold ring-1 ring-[var(--color-brand-orange)]"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="text-xs font-bold">2 Sets</div>
                      <div className="text-[10px] text-[var(--color-brand-orange)] font-bold">-10%</div>
                    </button>

                    <button
                      onClick={() => setTier(pen.id, 3)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        tier === 3
                          ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-surface)] dark:bg-zinc-800 font-bold"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="text-xs font-bold">3 Sets</div>
                      <div className="text-[10px] text-emerald-600 font-bold">-15%</div>
                    </button>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                          £{totalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-400 ml-1">GBP</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {tier === 1 ? "1 Set" : `${qty} Sets Bundle`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(pen)}
                      className="w-full py-3 rounded-2xl bg-[var(--color-brand-orange)] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Add Complete Set to Cart</span>
                      <span>+</span>
                    </button>

                    <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
                      <span>Batch: <strong className="text-zinc-600 dark:text-zinc-300 font-mono">{pen.batch}</strong></span>
                      <Link href="/lab-reports" className="text-[var(--color-brand-teal)] hover:underline">
                        View Verified COA ↗
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>

      {/* System Explanation Banner */}
      <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="font-extrabold text-base sm:text-lg">System Ordering Rules:</h3>
        <ul className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
          <li><strong>One-Time Investment</strong>: Complete Pen Sets are not available on subscription because the precision pen is reusable.</li>
          <li><strong>Replacement Refills</strong>: Once your cartridge is exhausted, keep your pen and reorder from the <strong>Refill Cartridges</strong> section.</li>
          <li><strong>Zero Dosing Advice</strong>: PEPTECH provides hardware and research-grade peptide cartridges strictly for in-vitro scientific investigation. Dosing and human protocols are strictly prohibited.</li>
        </ul>
      </div>

    </main>
  )
}
