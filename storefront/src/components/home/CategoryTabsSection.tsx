"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "../cart/CartContext"
import { getProductsByCategory, getProductPrice, StoreProduct } from "@/lib/medusa"
import catalog from "@/data/catalog.json"

export function CategoryTabsSection() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [activeCategory, setActiveCategory] = useState<"pen-sets" | "refills" | "vials">("pen-sets")
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(false)

  // Map category tab to Medusa category handle
  const handleMap = {
    "pen-sets": "complete-pen-sets",
    "refills": "refill-cartridges",
    "vials": "freeze-dried-vials",
  }

  useEffect(() => {
    setLoading(true)
    getProductsByCategory(handleMap[activeCategory])
      .then((res) => {
        if (res && res.length > 0) {
          setLiveProducts(res)
        } else {
          setLiveProducts([])
        }
      })
      .catch((err) => {
        console.error("Error loading category products:", err)
        setLiveProducts([])
      })
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
            Mandatory 3-Category Ecosystem
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Browse Research Catalog
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Choose between complete reusable pen packages, compatible replacement cartridges, or traditional lyophilised vials.
          </p>
        </div>

        {/* Category Route Deep Link */}
        <Link
          href={`/${activeCategory}`}
          className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View full {activeCategory.replace("-", " ")} page</span>
          <span>→</span>
        </Link>
      </div>

      {/* Category Tabs Switcher (Screenshot 2 Structure) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 overflow-x-auto">
        <button
          onClick={() => setActiveCategory("pen-sets")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCategory === "pen-sets"
              ? "bg-[var(--color-brand-navy)] text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <span>🖊️ Complete Pen Sets</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono hidden md:inline">
            1-Time
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("refills")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCategory === "refills"
              ? "bg-[var(--color-brand-teal)] text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <span>🔄 Refill Cartridges</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono hidden md:inline">
            -10% Sub
          </span>
        </button>

        <button
          onClick={() => setActiveCategory("vials")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCategory === "vials"
              ? "bg-[var(--color-brand-navy)] text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <span>🧪 Freeze-Dried Vials</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono hidden md:inline">
            50+ Compounds
          </span>
        </button>
      </div>

      {/* Product Grid based on Active Tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* If Complete Pen Sets Tab */}
        {activeCategory === "pen-sets" && (
          (liveProducts.length > 0 ? liveProducts : catalog.samplePenSets).map((item: any) => {
            const v = item.variants?.[0]
            const price = v ? getProductPrice(v, "gbp") : item.price || 45.0
            const sku = v?.sku || item.sku || "PEN-RT-10"
            const batch = item.metadata?.batch || item.batch || "RT-2609A"
            const title = item.title

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      Complete Starter Set
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{sku}</span>
                  </div>

                  <div className="aspect-16/10 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center text-4xl border border-zinc-100 dark:border-zinc-800">
                    🖊️
                  </div>

                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {title}
                  </h3>

                  <div className="text-xs text-zinc-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> Reusable Precision Aluminum Pen
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> 31G 5mm Needles + Alcohol Pads
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> Serialized Device Passport Card
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                      £{price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">One-Time Only</span>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: item.id,
                        title: item.title,
                        format: "pen-set",
                        strength: item.strength || "10mg Cartridge",
                        price: price,
                        isSubscription: false,
                        sku: sku,
                        batch: batch,
                      })
                      setIsDrawerOpen(true)
                    }}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Add Complete Set</span>
                    <span>+</span>
                  </button>

                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Batch: <strong className="font-mono text-zinc-600 dark:text-zinc-300">{batch}</strong></span>
                    <Link href="/refills" className="text-[var(--color-brand-teal)] hover:underline">
                      Need Refills? ↗
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* If Refill Cartridges Tab */}
        {activeCategory === "refills" && (
          (liveProducts.length > 0 ? liveProducts : catalog.sampleRefills).map((item: any) => {
            const v = item.variants?.[0]
            const priceOneTime = v ? getProductPrice(v, "gbp") : item.priceOneTime || 24.0
            const priceSub = Number((priceOneTime * 0.9).toFixed(2))
            const sku = v?.sku || item.sku || "REF-RT-10"
            const batch = item.metadata?.batch || item.batch || "RT-2609A"

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]">
                      Reusable Pen Refill
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{sku}</span>
                  </div>

                  <div className="aspect-16/10 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center text-4xl border border-zinc-100 dark:border-zinc-800">
                    🔄
                  </div>

                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {item.title}
                  </h3>

                  <div className="text-xs text-zinc-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> Designed for PEPTECH Aluminum Pen
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> Prefilled Sealed Cartridge
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500">★</span> 28-Day Auto Refill Available (-10%)
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                        £{priceSub.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-400 ml-1">/ 28d sub</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">£{priceOneTime.toFixed(2)} once</span>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: item.id,
                        title: item.title,
                        format: "refill",
                        strength: item.strength || "10mg Cartridge",
                        price: priceOneTime,
                        isSubscription: true,
                        subscriptionIntervalDays: 28,
                        discountPercent: 10,
                        sku: sku,
                        batch: batch,
                      })
                      setIsDrawerOpen(true)
                    }}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Subscribe &amp; Save 10%</span>
                    <span>+</span>
                  </button>

                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <Link href="/pen-sets" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      Need the Pen? View Set ↗
                    </Link>
                    <Link href="/lab-reports" className="text-[var(--color-brand-teal)] hover:underline">
                      View COA ↗
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* If Freeze-Dried Vials Tab */}
        {activeCategory === "vials" && (
          (liveProducts.length > 0 ? liveProducts.slice(0, 6) : catalog.featuredVials.slice(0, 6)).map((item: any) => {
            const v = item.variants?.[0]
            const price = v ? getProductPrice(v, "gbp") : item.price || 8.40
            const code = item.metadata?.code || item.code || "PEP"
            const strength = item.metadata?.strength || item.strength || "5mg"
            const sku = v?.sku || `VIA-${code}`

            return (
              <div
                key={item.id || `${code}-${strength}`}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {code}
                    </span>
                    <span className="text-emerald-600 font-bold text-[10px]">✓ In Stock</span>
                  </div>

                  <div className="aspect-16/10 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center text-4xl border border-zinc-100 dark:border-zinc-800">
                    🧪
                  </div>

                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {item.name || item.title}
                  </h3>

                  <div className="text-xs text-zinc-500 font-mono">
                    Specification: <strong className="text-zinc-800 dark:text-zinc-200">{strength} x 1 vial</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                      £{price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">GBP • Single Vial</span>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: item.id || `vial-${code}-${strength}`,
                        title: `${item.name || item.title} Lyophilised Vial`,
                        format: "vial",
                        strength: strength,
                        price: price,
                        isSubscription: false,
                        sku: sku,
                        batch: `${code}-2609`,
                      })
                      setIsDrawerOpen(true)
                    }}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Add Vial to Order</span>
                    <span>+</span>
                  </button>

                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Batch: <span className="font-mono">{code}-2609</span></span>
                    <Link href="/lab-reports" className="text-[var(--color-brand-teal)] hover:underline">
                      Report ↗
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}

      </div>

    </section>
  )
}
