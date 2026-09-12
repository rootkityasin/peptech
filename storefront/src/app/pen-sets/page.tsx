"use client"

import React from "react"
import Link from "next/link"
import catalog from "@/data/catalog.json"
import { useCart } from "@/components/cart/CartContext"

export default function PenSetsPage() {
  const { addItem } = useCart()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Category Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Category 1 • First-Time Purchase
          </span>
          <span className="text-xs text-zinc-500 font-mono">One-Time Only</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Complete Pen Sets
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          The complete starter package for research laboratories. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads.
        </p>
      </div>

      {/* Cross-Link Banner for Returning Customers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-brand-surface)] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Already own the reusable PEPTECH pen?</h4>
            <p className="text-xs text-zinc-500">You do not need to buy another pen. Reorder compatible refill cartridges at a 10% discount.</p>
          </div>
        </div>
        <Link
          href="/refills"
          className="px-4 py-2 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
        >
          Shop Compatible Refills →
        </Link>
      </div>

      {/* Pen Set Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {catalog.samplePenSets.map((pen) => (
          <div
            key={pen.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Image Placeholder with Medical Icon */}
            <div className="aspect-4/3 bg-zinc-100 dark:bg-zinc-800/80 flex flex-col items-center justify-center p-6 border-b border-zinc-100 dark:border-zinc-800 text-center relative">
              <span className="text-5xl mb-2">🖊️</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">PEPTECH Aluminum Pen System</span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">31G 5mm Accessories Included</span>
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white font-mono">
                {pen.sku}
              </span>
            </div>

            {/* Product Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pen.strength}</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">✓ In Stock (Royal Mail)</span>
                </div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">{pen.title}</h3>
                
                {/* What is included */}
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">What's In The Box:</div>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    {pen.included.map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[var(--color-brand-teal)] text-[10px]">●</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-2xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                      £{pen.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">GBP</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">One-Time Purchase</span>
                </div>

                <button
                  onClick={() =>
                    addItem({
                      id: pen.id,
                      title: pen.title,
                      format: "pen-set",
                      strength: pen.strength,
                      price: pen.price,
                      isSubscription: false,
                      sku: pen.sku,
                      batch: pen.batch,
                    })
                  }
                  className="w-full py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Add Complete Pen Set to Order</span>
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
        ))}
      </div>

      {/* Visual Explanation of System */}
      <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="font-extrabold text-lg">System Ordering Rules:</h3>
        <ul className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
          <li><strong>One-Time Investment</strong>: Complete Pen Sets are not available on subscription because the pen is reusable.</li>
          <li><strong>Replacement Refills</strong>: Once your cartridge is exhausted, keep your pen and reorder from the <strong>Refill Cartridges</strong> section.</li>
          <li><strong>Zero Dosing Advice</strong>: PEPTECH provides hardware and research-grade peptide cartridges strictly for in-vitro scientific investigation. Dosing and human protocols are strictly prohibited.</li>
        </ul>
      </div>

    </main>
  )
}
