"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"
import { REFILL_CARTRIDGES } from "@/data/products"

export default function RefillsPage() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [subStates, setSubStates] = useState<Record<string, boolean>>({})

  const toggleSub = (id: string, isSub: boolean) => {
    setSubStates((prev) => ({ ...prev, [id]: isSub }))
  }

  const handleAddToCart = (item: typeof REFILL_CARTRIDGES[0]) => {
    const isSub = subStates[item.id] !== false // default to true
    const price = isSub && item.subscribePrice ? item.subscribePrice : item.price

    addItem({
      id: item.id,
      title: `${item.name} Test Cartridge`,
      format: "refill",
      strength: item.tag,
      price: price,
      isSubscription: isSub,
      subscriptionIntervalDays: isSub ? 28 : undefined,
      discountPercent: isSub ? 10 : undefined,
      sku: `PEP-CRT-${item.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "CRT-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <main className="bg-white min-h-screen text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#0B1F3A]">Home</Link>
          <span>&gt;</span>
          <Link href="/products/complete-pen-set" className="hover:text-[#0B1F3A]">Shop</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-900">Individual Refill Cartridges</span>
        </div>

        {/* Header Title */}
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-[#00A896] tracking-wider uppercase">
            REPLACEMENT CARTRIDGES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
            Individual Test Cartridges
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Designed exclusively for the PEPTECH® reusable pen system. Available for one-time purchase or Subscribe &amp; Save 10% on an automated 28-day laboratory cycle.
          </p>
        </div>

        {/* Cross-Link Banner to Pen */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🖊️</span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0B1F3A]">Need the reusable precision pen?</h4>
              <p className="text-xs text-slate-500">First-time buyers require the complete pen starter kit with needles and device passport.</p>
            </div>
          </div>
          <Link
            href="/products/complete-pen-set"
            className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
          >
            Get Complete Pen Set ($249.00) →
          </Link>
        </div>

        {/* Grid of Cartridges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {REFILL_CARTRIDGES.map((item) => {
            const isSub = subStates[item.id] !== false
            const currentPrice = isSub && item.subscribePrice ? item.subscribePrice : item.price

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between hover:shadow-md transition-all text-center"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2.5 p-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-black text-xs sm:text-sm text-[#0B1F3A]">{item.name}</h3>
                  <div className="text-[10px] text-slate-400 font-medium">{item.tag}</div>
                  
                  {/* Pricing */}
                  <div className="text-sm font-black text-[#0B1F3A] mt-1.5">
                    ${currentPrice.toFixed(2)}
                  </div>
                  {item.subscribePrice && isSub && (
                    <div className="text-[9px] text-teal-700 font-bold">
                      Saved 10% (-${(item.price - item.subscribePrice).toFixed(2)})
                    </div>
                  )}

                  {/* Toggle Sub vs One-Time */}
                  <div className="grid grid-cols-2 gap-1 mt-3 bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => toggleSub(item.id, true)}
                      className={`py-1 rounded cursor-pointer ${
                        isSub ? "bg-white text-teal-800 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Sub -10%
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSub(item.id, false)}
                      className={`py-1 rounded cursor-pointer ${
                        !isSub ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      One-Time
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-3 w-full py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}
