"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"
import { REFILL_CARTRIDGES } from "@/data/products"

export function RefillsSection() {
  const { addItem, setIsDrawerOpen } = useCart()

  const handleAddCartridge = (item: typeof REFILL_CARTRIDGES[0], isSub: boolean) => {
    addItem({
      id: item.id,
      title: `${item.name} Test Cartridge`,
      format: "refill",
      strength: item.tag,
      price: isSub && item.subscribePrice ? item.subscribePrice : item.price,
      isSubscription: isSub,
      subscriptionIntervalDays: isSub ? 28 : undefined,
      discountPercent: isSub ? 10 : undefined,
      sku: `PEP-CRT-${item.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "CRT-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <section className="py-14 bg-slate-50/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
              Refill Cartridges
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              For existing PEPTECH® customers. Compatible. Reliable. Cost-effective.
            </p>
          </div>
          <Link
            href="/refills"
            className="text-xs sm:text-sm font-bold text-[#0B1F3A] hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1"
          >
            <span>View All Cartridges</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Promo Card */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <Image
                  src="/images/peptech/cartridge.webp"
                  alt="PEPTECH Refill"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-black text-sm text-[#0B1F3A] text-center">
                PEPTECH® Refill Cartridge
              </h3>
              <ul className="space-y-2 text-[11px] text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>Compatible with PEPTECH reusable pen</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>Multiple strengths available</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>Save with subscription</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>Same high quality standards</span>
                </li>
              </ul>
            </div>

            <Link
              href="/refills"
              className="mt-4 block py-2 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold transition-colors"
            >
              Shop All Refills →
            </Link>
          </div>

          {/* Right 4 Cartridges */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {REFILL_CARTRIDGES.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-all text-center"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2 p-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h4 className="font-black text-xs text-[#0B1F3A]">{item.name}</h4>
                  <div className="text-[10px] text-slate-400">{item.tag}</div>
                  <div className="text-xs font-black text-[#0B1F3A] mt-1">${item.price.toFixed(2)}</div>
                  {item.subscribePrice && (
                    <div className="text-[10px] text-teal-700 font-bold">
                      Subscribe &amp; Save 10%: ${item.subscribePrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  <button
                    onClick={() => handleAddCartridge(item, false)}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#0B1F3A] hover:bg-[#15345d] text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Add to Cart</span>
                    <span>🛒</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Subscription Benefit Note */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium bg-white/70 py-2.5 px-4 rounded-xl border border-slate-200/80">
          🔄 Flexible subscriptions — Pause, skip, change, or cancel anytime through your account.
        </div>
      </div>
    </section>
  )
}
