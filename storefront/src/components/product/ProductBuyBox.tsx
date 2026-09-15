"use client"

import React, { useState } from "react"
import { useCart } from "@/components/cart/CartContext"

interface ProductBuyBoxProps {
  title?: string
  subtitle?: string
  description?: string
  price?: number
  subscribePrice?: number
  tag?: string
}

export function ProductBuyBox({
  title = "Complete PEPTECH® Pen Set",
  subtitle = "One system. Multiple possibilities.",
  description = "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.",
  price = 249.00,
  subscribePrice = 224.10,
  tag = "PEN SYSTEM",
}: ProductBuyBoxProps) {
  const { addItem, setIsDrawerOpen } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")

  const currentPrice = purchaseType === "subscription" ? subscribePrice : price

  const handleAddToCart = () => {
    addItem({
      id: "complete-pen-set",
      title: title,
      format: "pen-set",
      strength: tag,
      price: currentPrice,
      isSubscription: purchaseType === "subscription",
      subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
      discountPercent: purchaseType === "subscription" ? 10 : undefined,
      sku: "PPS-1000",
      batch: "PT-PS-001",
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Category Tag */}
      <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
        {tag}
      </div>

      {/* Main Title & Rating */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
          {title}
        </h1>
        
        {/* Star Rating from Mockup 2 */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex text-amber-400 text-sm">
            ★★★★★
          </div>
          <span className="text-xs font-bold text-slate-800">4.9</span>
          <span className="text-xs text-slate-500">(264 reviews)</span>
        </div>
      </div>

      {/* Subtitle & Description */}
      <div className="space-y-1.5 border-b border-slate-200 pb-5">
        <div className="font-bold text-sm text-[#0B1F3A]">
          {subtitle}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Price Display */}
      <div className="text-3xl font-black text-[#0B1F3A]">
        ${currentPrice.toFixed(2)}
      </div>

      {/* Purchase Option Radio Selector (Mockup 2) */}
      <div className="space-y-3 pt-1">
        {/* Option 1: One-time purchase */}
        <label
          onClick={() => setPurchaseType("one-time")}
          className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
            purchaseType === "one-time"
              ? "border-[#0B1F3A] bg-slate-50/50 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="purchase_type"
              checked={purchaseType === "one-time"}
              onChange={() => setPurchaseType("one-time")}
              className="w-4 h-4 text-[#0B1F3A] accent-[#0B1F3A]"
            />
            <span className="text-xs font-bold text-slate-800">One-time purchase</span>
          </div>
          <span className="text-xs font-bold text-slate-900">${price.toFixed(2)}</span>
        </label>

        {/* Option 2: Subscribe & Save 10% */}
        <label
          onClick={() => setPurchaseType("subscription")}
          className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
            purchaseType === "subscription"
              ? "border-[#00C5A0] bg-teal-50/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="purchase_type"
              checked={purchaseType === "subscription"}
              onChange={() => setPurchaseType("subscription")}
              className="w-4 h-4 text-[#00C5A0] accent-[#00C5A0]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Subscribe &amp; Save 10%</span>
              </div>
              <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                Free shipping • Cancel anytime
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-900">${subscribePrice.toFixed(2)}</span>
        </label>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 rounded-xl bg-[#0B1F3A] hover:bg-[#15345d] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>🛒</span>
        <span>Add to Cart</span>
      </button>

      {/* In-Stock Indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-semibold text-emerald-700">In Stock</span>
        <span className="text-slate-400">•</span>
        <span>Ships within 1–2 business days</span>
      </div>

      {/* 4 Trust Badges Strip (Mockup 2) */}
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-200 text-center">
        <div className="space-y-1">
          <span className="text-lg">🚚</span>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Free Shipping</div>
          <div className="text-[9px] text-slate-400">Orders over $200</div>
        </div>
        <div className="space-y-1">
          <span className="text-lg">🔒</span>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Secure Checkout</div>
          <div className="text-[9px] text-slate-400">256-bit SSL</div>
        </div>
        <div className="space-y-1">
          <span className="text-lg">🔄</span>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">30-Day Returns</div>
          <div className="text-[9px] text-slate-400">Guarantee</div>
        </div>
        <div className="space-y-1">
          <span className="text-lg">🎧</span>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Dedicated Support</div>
          <div className="text-[9px] text-slate-400">24/7 Assistance</div>
        </div>
      </div>

    </div>
  )
}
