"use client"

import React, { useState, useEffect } from "react"
import { useCart } from "../cart/CartContext"

export function MobileStickyBar() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once scrolled past 400px
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  const handleQuickAdd = () => {
    addItem({
      id: "pen-retatrutide-10",
      title: "PEPTECH Reusable Pen Set — Retatrutide",
      format: "pen-set",
      strength: "10mg Cartridge",
      price: 45.0,
      isSubscription: false,
      sku: "PEN-RT-10",
      batch: "RT-2609A",
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Product Info & Price */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-teal)]">
            Complete Pen Set
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black font-mono text-[var(--color-brand-navy)] dark:text-zinc-100">
              £45.00
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">GBP</span>
            <span className="text-[10px] text-emerald-600 font-bold ml-1">✓ In Stock</span>
          </div>
        </div>

        {/* Right: Add to Order Button */}
        <button
          onClick={handleQuickAdd}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-orange)] hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add to Order</span>
        </button>

      </div>
    </div>
  )
}
