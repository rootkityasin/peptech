"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useCart } from "../cart/CartContext"

interface CompoundOption {
  id: string
  name: string
  strength: string
  sku: string
  batch: string
  basePrice: number
  purity: string
  labReportUrl: string
  description: string
  bullets: string[]
  icon: string
}

const FEATURED_COMPOUNDS: CompoundOption[] = [
  {
    id: "pen-retatrutide-10",
    name: "PEPTECH Reusable Pen Set — Retatrutide",
    strength: "10mg Cartridge",
    sku: "PEN-RT-10",
    batch: "RT-2609A",
    basePrice: 45.0,
    purity: "99.4%",
    labReportUrl: "/lab-reports",
    description: "Complete starter package with medical-grade precision aluminum pen, prefilled certified 10mg Retatrutide cartridge, needles & device passport.",
    bullets: [
      "HPLC Batch Certified ≥ 99.4% Purity",
      "Aerospace-Grade Reusable Aluminum Pen",
      "Full Starter Kit (31G needles, alcohol pads, passport)",
    ],
    icon: "🖊️",
  },
  {
    id: "pen-tirzepatide-15",
    name: "PEPTECH Reusable Pen Set — Tirzepatide",
    strength: "15mg Cartridge",
    sku: "PEN-TR-15",
    batch: "TR-2609B",
    basePrice: 48.0,
    purity: "99.2%",
    labReportUrl: "/lab-reports",
    description: "Complete starter package with medical-grade precision aluminum pen, prefilled certified 15mg Tirzepatide cartridge, needles & device passport.",
    bullets: [
      "HPLC Batch Certified ≥ 99.2% Purity",
      "Aerospace-Grade Reusable Aluminum Pen",
      "Full Starter Kit (31G needles, alcohol pads, passport)",
    ],
    icon: "🖊️",
  },
  {
    id: "pen-semaglutide-10",
    name: "PEPTECH Reusable Pen Set — Semaglutide",
    strength: "10mg Cartridge",
    sku: "PEN-SM-10",
    batch: "SM-2609A",
    basePrice: 42.0,
    purity: "99.5%",
    labReportUrl: "/lab-reports",
    description: "Complete starter package with medical-grade precision aluminum pen, prefilled certified 10mg Semaglutide cartridge, needles & device passport.",
    bullets: [
      "HPLC Batch Certified ≥ 99.5% Purity",
      "Aerospace-Grade Reusable Aluminum Pen",
      "Full Starter Kit (31G needles, alcohol pads, passport)",
    ],
    icon: "🖊️",
  },
]

export function HeroProductCard() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [selectedCompoundIndex, setSelectedCompoundIndex] = useState(0)
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(2) // Default to Most Popular (Tier 2)

  const compound = FEATURED_COMPOUNDS[selectedCompoundIndex]

  // Tier pricing calculation matching Screenshot 1:
  // Tier 1: 1 unit @ basePrice
  // Tier 2: 2 units @ 10% discount (Most Popular)
  // Tier 3: 3 units @ 15% discount (Lab Multi-Pack)
  const tierConfigs = {
    1: {
      quantity: 1,
      label: "1 Pen Set",
      sublabel: `£${compound.basePrice.toFixed(2)} each`,
      totalPrice: compound.basePrice,
      savingsPercent: 0,
      badge: null,
    },
    2: {
      quantity: 2,
      label: "2 Pen Sets",
      sublabel: `£${(compound.basePrice * 0.9).toFixed(2)} each`,
      totalPrice: Number((compound.basePrice * 2 * 0.9).toFixed(2)),
      savingsPercent: 10,
      badge: "MOST POPULAR",
    },
    3: {
      quantity: 3,
      label: "3 Pen Sets",
      sublabel: `£${(compound.basePrice * 0.85).toFixed(2)} each`,
      totalPrice: Number((compound.basePrice * 3 * 0.85).toFixed(2)),
      savingsPercent: 15,
      badge: "LAB MULTI-PACK",
    },
  }

  const activeTierConfig = tierConfigs[selectedTier]

  const handleAddToCart = () => {
    // Add the selected quantity of items
    for (let i = 0; i < activeTierConfig.quantity; i++) {
      addItem({
        id: compound.id,
        title: compound.name,
        format: "pen-set",
        strength: compound.strength,
        price: activeTierConfig.totalPrice / activeTierConfig.quantity,
        isSubscription: false,
        sku: compound.sku,
        batch: compound.batch,
      })
    }
    setIsDrawerOpen(true)
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Compound Switcher Pills */}
      <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">
          Featured Set:
        </span>
        {FEATURED_COMPOUNDS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedCompoundIndex(idx)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCompoundIndex === idx
                ? "bg-[var(--color-brand-navy)] text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {item.name.replace("PEPTECH Reusable Pen Set — ", "")}
          </button>
        ))}
      </div>

      {/* Main Showcase Card — Follows Screenshot 1 Style & Structure */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden p-5 sm:p-8 space-y-6">
        
        {/* Top Split: Image + Product Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          
          {/* Left Column: Product Visual Presentation */}
          <div className="relative aspect-4/3 sm:aspect-square rounded-2xl bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200/80 dark:from-zinc-800/80 dark:via-zinc-800 dark:to-zinc-900 flex flex-col items-center justify-center p-6 border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner overflow-hidden">
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-teal)] text-white shadow-xs">
                HPLC {compound.purity}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900/80 text-white dark:bg-black/60">
                {compound.sku}
              </span>
            </div>

            {/* Medical-grade Hardware Illustration */}
            <div className="text-center space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <span className="text-5xl sm:text-6xl animate-bounce" style={{ animationDuration: "3s" }}>
                  {compound.icon}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                  PEPTECH® Precision Pen System
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Aerospace Aluminum • Reusable Hardware
                </div>
              </div>
            </div>

            {/* Bottom In-Stock Bar */}
            <div className="absolute bottom-3 inset-x-3 text-center">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <span>✓</span> In Stock • Dispatched within 24h via Royal Mail
              </span>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Price & Benefit Bullets */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                Category 1 • First-Time Purchase
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-1 leading-snug">
                {compound.name}
              </h2>
            </div>

            {/* Star Rating with Review Count */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500 text-sm">
                ★★★★★
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                (148 reviews)
              </span>
            </div>

            {/* Base Unit Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
                £{compound.basePrice.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">GBP / Unit</span>
            </div>

            {/* Specification Bullet Points with Icons (Screenshot 1 Layout) */}
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 pt-1">
              <li className="flex items-center gap-2.5">
                <span className="text-base text-[var(--color-brand-teal)]">💧</span>
                <span className="font-medium">{compound.bullets[0]}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base text-[var(--color-brand-teal)]">⚙️</span>
                <span className="font-medium">{compound.bullets[1]}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base text-[var(--color-brand-teal)]">📦</span>
                <span className="font-medium">{compound.bullets[2]}</span>
              </li>
            </ul>

          </div>
        </div>

        {/* Bottom Section: CHOOSE YOUR QUANTITY (Exact Screenshot 1 Layout) */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-[11px] font-black text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
            Choose Your Quantity
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            
            {/* Tier 1: 1 Bottle / Set */}
            <div
              onClick={() => setSelectedTier(1)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                selectedTier === 1
                  ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-surface)] dark:bg-zinc-800/80 ring-2 ring-[var(--color-brand-teal)]/30"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedTier === 1
                    ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-teal)]"
                    : "border-zinc-400"
                }`}>
                  {selectedTier === 1 && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    1 Pen Set
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
                  £{tierConfigs[1].totalPrice.toFixed(2)}
                </span>
                <span className="block text-[10px] text-zinc-400 font-mono">
                  {tierConfigs[1].sublabel}
                </span>
              </div>
            </div>

            {/* Tier 2: 2 Sets (MOST POPULAR - Highlighted from Screenshot 1) */}
            <div
              onClick={() => setSelectedTier(2)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer relative ${
                selectedTier === 2
                  ? "border-[var(--color-brand-orange)] bg-[var(--color-brand-orange-light)]/20 dark:bg-zinc-800/90 ring-2 ring-[var(--color-brand-orange)]/40 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedTier === 2
                    ? "border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]"
                    : "border-zinc-400"
                }`}>
                  {selectedTier === 2 && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    2 Pen Sets
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-orange)] text-white shadow-xs">
                    MOST POPULAR
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
                    £{tierConfigs[2].totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-[var(--color-brand-orange)]">
                  SAVE 10% • {tierConfigs[2].sublabel}
                </div>
              </div>
            </div>

            {/* Tier 3: 3 Sets (LAB MULTI-PACK) */}
            <div
              onClick={() => setSelectedTier(3)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                selectedTier === 3
                  ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-surface)] dark:bg-zinc-800/80 ring-2 ring-[var(--color-brand-teal)]/30"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedTier === 3
                    ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-teal)]"
                    : "border-zinc-400"
                }`}>
                  {selectedTier === 3 && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    3 Pen Sets
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    LAB MULTI-PACK
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
                  £{tierConfigs[3].totalPrice.toFixed(2)}
                </span>
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  SAVE 15% • {tierConfigs[3].sublabel}
                </span>
              </div>
            </div>

          </div>

          {/* Big High-Conversion Primary CTA (Screenshot 1 Button) */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-2xl bg-[var(--color-brand-orange)] hover:opacity-95 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-[0.99]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart — £{activeTierConfig.totalPrice.toFixed(2)}</span>
            </button>
          </div>

          {/* Social Proof Review Avatars (Screenshot 1 Footnote) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                DR
              </div>
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                MK
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                AL
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                JS
              </div>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">4.9/5</strong>{" "}
              <span className="text-amber-500 font-bold">★★★★★</span>{" "}
              <span>Based on 148 verified laboratory reviews</span>
            </div>
          </div>

          {/* Verified COA Direct Link */}
          <div className="pt-2 text-center">
            <Link
              href="/lab-reports"
              className="text-xs font-semibold text-[var(--color-brand-teal)] hover:underline inline-flex items-center gap-1"
            >
              <span>View Independent HPLC &amp; Mass Spectrometry Certificate (Batch: {compound.batch})</span>
              <span>↗</span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
