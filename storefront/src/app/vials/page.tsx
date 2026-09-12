"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import catalog from "@/data/catalog.json"
import { useCart } from "@/components/cart/CartContext"

export default function FreezeDriedVialsPage() {
  const { addItem } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStrength, setSelectedStrength] = useState("all")
  const [subscriptionMode, setSubscriptionMode] = useState<Record<string, boolean>>({})

  // Extract all unique strengths for the filter pill bar
  const allStrengths = useMemo(() => {
    const set = new Set<string>()
    catalog.featuredVials.forEach((v) => set.add(v.strength))
    return Array.from(set)
  }, [])

  const filteredVials = useMemo(() => {
    return catalog.featuredVials.filter((vial) => {
      const matchesSearch =
        vial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vial.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStrength = selectedStrength === "all" || vial.strength === selectedStrength
      return matchesSearch && matchesStrength
    })
  }, [searchTerm, selectedStrength])

  const toggleSub = (code: string, isSub: boolean) => {
    setSubscriptionMode((prev) => ({ ...prev, [code]: isSub }))
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Category Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            Category 3 • Master Research Price List
          </span>
          <span className="text-xs text-zinc-500 font-mono">50+ Lyophilised Vials</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Freeze-Dried Vials
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Traditional laboratory lyophilised vials supplied with independent HPLC &amp; Mass Spectrometry batch certificates. Available for immediate one-time dispatch or <strong>Subscribe &amp; Save every 28 days (10% discount)</strong>.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by peptide name or SKU code (e.g. Retatrutide, RT, BPC)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-brand-teal)]"
            />
          </div>

          {/* Strength Filter Dropdown on mobile / Clear button */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Strength Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 font-medium whitespace-nowrap text-[11px]">Filter Strength:</span>
          <button
            onClick={() => setSelectedStrength("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStrength === "all"
                ? "bg-[var(--color-brand-navy)] text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            All Strengths
          </button>
          {allStrengths.map((str) => (
            <button
              key={str}
              onClick={() => setSelectedStrength(str)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStrength === str
                  ? "bg-[var(--color-brand-navy)] text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              {str}
            </button>
          ))}
        </div>
      </div>

      {/* Product List / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredVials.map((vial) => {
          const isSub = subscriptionMode[vial.code] ?? false
          const oneTimePrice = vial.price
          const subPrice = Number((vial.price * 0.9).toFixed(2))
          const activePrice = isSub ? subPrice : oneTimePrice

          return (
            <div
              key={`${vial.code}-${vial.strength}`}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
            >
              {/* Card Top */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                    {vial.code}
                  </span>
                  <span className="text-emerald-600 font-semibold text-[10px]">
                    ✓ In Stock
                  </span>
                </div>

                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                  {vial.name}
                </h3>

                <div className="text-xs text-zinc-500 font-mono">
                  Strength: <strong className="text-zinc-800 dark:text-zinc-200">{vial.strength} x 1 vial</strong>
                </div>
              </div>

              {/* Purchase Options Toggle */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => toggleSub(vial.code, false)}
                    className={`py-1.5 rounded transition-all ${
                      !isSub
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-400"
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    onClick={() => toggleSub(vial.code, true)}
                    className={`py-1.5 rounded transition-all ${
                      isSub
                        ? "bg-[var(--color-brand-teal)] text-white shadow-xs"
                        : "text-zinc-400"
                    }`}
                  >
                    Sub -10% (28d)
                  </button>
                </div>

                {/* Price Display */}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                      £{activePrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400 ml-1">GBP</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {isSub ? "Every 28 Days" : "Single Vial"}
                  </span>
                </div>

                {/* Add to Order CTA */}
                <button
                  onClick={() =>
                    addItem({
                      id: `vial-${vial.code}-${vial.strength}`,
                      title: `${vial.name} Lyophilised Vial`,
                      format: "vial",
                      strength: vial.strength,
                      price: oneTimePrice,
                      isSubscription: isSub,
                      subscriptionIntervalDays: isSub ? 28 : undefined,
                      discountPercent: isSub ? 10 : undefined,
                      sku: `VIA-${vial.code}`,
                      batch: `${vial.code}-2609`,
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{isSub ? "Subscribe (28 Days)" : "Add to Order"}</span>
                  <span>+</span>
                </button>

                <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
                  <span>Batch: <span className="font-mono">{vial.code}-2609</span></span>
                  <Link href="/lab-reports" className="text-[var(--color-brand-teal)] hover:underline">
                    Report ↗
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredVials.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-2">
          <div className="text-3xl">🔍</div>
          <h3 className="font-bold text-sm">No compounds found matching "{searchTerm}"</h3>
          <p className="text-xs text-zinc-500">Try searching for generic names like Retatrutide, Tirzepatide, or BPC.</p>
        </div>
      )}

    </main>
  )
}
