"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart, getItemSubtitle } from "@/components/cart/CartContext"

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    subscriptionSavings,
    promoDiscount,
    totalSavings,
    finalSubtotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    autoSavings,
    featuredPromo,
    isFreeShippingUnlocked,
    shippingCost,
    selectedShippingOption,
    shippingAvailable,
    total,
  } = useCart()

  const [promoInput, setPromoInput] = useState("")
  const [promoError, setPromoError] = useState("")
  const [promoLoading, setPromoLoading] = useState(false)

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError("")
    const res = await applyPromoCode(promoInput)
    setPromoLoading(false)
    if (!res.success) {
      setPromoError(res.message || "Invalid promotional code.")
    } else {
      setPromoInput("")
    }
  }

  const shippingDisplay = items.length === 0 ? 0 : shippingCost

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#0b1f3a] transition-colors">Shop</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="space-y-2 mb-8">
          <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
            ORDER SUMMARY
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
            Laboratory Order Review
          </h1>
          <p className="text-xs sm:text-[14px] text-[#64748B] leading-[22px]">
            Review compounds and quantities before proceeding to cold-chain dispatch checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 sm:p-16 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#f1f5f9] border border-slate-200/80 mx-auto flex items-center justify-center animate-empty-cart-badge shadow-xs">
                <svg
                  className="w-9 h-9 text-[#0B1F3A]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="21" r="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
                  <circle cx="19" cy="21" r="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border border-[#0B1F3A]/15 animate-ping pointer-events-none opacity-40 [animation-duration:2.5s]" />
            </div>
            <div className="space-y-2 animate-empty-cart-text">
              <h2 className="text-xl font-bold text-[#0b1f3a]">Your Cart is Currently Empty</h2>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                Explore our reusable pen systems, prefilled refill cartridges, or lyophilised research vials to configure your order.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 animate-empty-cart-btn">
              <Link
                href="/pen-sets"
                className="px-5 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-xs transition-colors shadow-xs"
              >
                Complete Pen Sets
              </Link>
              <Link
                href="/refills"
                className="px-5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#0b1f3a] text-[#0b1f3a] font-bold text-xs transition-colors shadow-xs"
              >
                Refill Cartridges
              </Link>
              <Link
                href="/vials"
                className="px-5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#0b1f3a] text-[#0b1f3a] font-bold text-xs transition-colors shadow-xs"
              >
                Freeze-Dried Vials
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e2e8f0] shadow-xs divide-y divide-[#e2e8f0]">
              <div className="p-6 flex items-center justify-between">
                <span className="font-bold text-sm text-[#0b1f3a]">
                  Selected Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                <span className="text-xs text-[#64748b]">
                  Cold-Chain Verified
                </span>
              </div>

              {items.map((item) => (
                <div key={`${item.id}-${item.isSubscription}`} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-2 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={item.image || "/images/products/placeholder.png"}
                        alt={item.title}
                        width={70}
                        height={70}
                        className="object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-[#0b1f3a]">
                        {item.title}
                      </h3>
                      <div className="text-xs text-[#64748b]">
                        {getItemSubtitle(item)}
                      </div>
                      {(() => {
                        const otherOptions = item.options?.filter(
                          (o) => !o.label.toLowerCase().includes("cartridge")
                        )
                        if (!otherOptions || otherOptions.length === 0) return null
                        return (
                          <div className="flex flex-col gap-0.5 pt-0.5">
                            {otherOptions.map((opt, idx) => (
                              <div key={idx} className="text-xs flex items-center gap-1.5 text-[#475569]">
                                <span className="font-semibold text-[#0b1f3a]">{opt.label}:</span>
                                <span className="text-[#16a6a3] font-medium">{opt.value}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}

                      {item.isSubscription ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16a6a3]/10 text-[#16a6a3]">
                          🔄 28-Day Subscribe &amp; Save ({autoSavings.badgeText})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-[#64748b]">
                          One-Time Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#cbd5e1] rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.isSubscription, -1)}
                        className="px-3 py-1.5 text-xs text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-[#0b1f3a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.isSubscription, 1)}
                        className="px-3 py-1.5 text-xs text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Subtotal */}
                    <div className="text-right min-w-[80px]">
                      <div className="font-bold text-sm text-[#0b1f3a]">
                        £{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-[#94a3b8]">
                        £{item.price.toFixed(2)} ea
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => removeItem(item.id, item.isSubscription)}
                      className="text-[#94a3b8] hover:text-red-600 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-6 bg-[#f8fafc] flex items-center justify-between text-xs text-[#64748b] rounded-b-3xl">
                <span>All items packed with cold-chain insulation &amp; verified purity certificate</span>
                <Link href="/shop" className="text-[#16a6a3] font-bold hover:underline">
                  + Add more compounds
                </Link>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="font-bold text-base text-[#0b1f3a] border-b border-[#e2e8f0] pb-4">
                  Order Financial Summary
                </h3>

                {/* Promo Code Section */}
                <div className="space-y-2">
                  {featuredPromo && !appliedPromo && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#0b1f3a]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="bg-[#16a6a3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">CODE</span>
                        <span className="truncate">Active promo: <strong>{featuredPromo.code}</strong> ({featuredPromo.badgeText})</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setPromoLoading(true)
                          setPromoError("")
                          const res = await applyPromoCode(featuredPromo.code)
                          setPromoLoading(false)
                          if (!res.success) {
                            setPromoError(res.message || "Failed to apply promo.")
                          } else {
                            setPromoInput(featuredPromo.code)
                          }
                        }}
                        className="text-[#16a6a3] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoInput || (appliedPromo ? appliedPromo.code : "")}
                        onChange={(e) => {
                          setPromoInput(e.target.value)
                          if (promoError) setPromoError("")
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3]"
                      />
                      {appliedPromo && (!promoInput.trim() || promoInput.trim().toUpperCase() === appliedPromo.code.toUpperCase()) ? (
                        <button
                          type="button"
                          onClick={() => {
                            removePromoCode()
                            setPromoInput("")
                            setPromoError("")
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={promoLoading || !promoInput.trim()}
                          className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white text-xs font-bold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          {promoLoading ? "Applying..." : "Apply"}
                        </button>
                      )}
                    </div>

                    {appliedPromo && (
                      <p className="text-[11px] text-[#00C5A0] font-medium flex items-center gap-1 pt-0.5">
                        <span>✓</span>
                        <span>
                          {appliedPromo.code} applied ({appliedPromo.discountType === "percentage" ? `${appliedPromo.discountValue}% Off` : `£${appliedPromo.discountValue} Off`})
                        </span>
                      </p>
                    )}

                    {promoError && (
                      <p className="text-[11px] text-red-500 font-semibold">
                        {promoError}
                      </p>
                    )}
                  </form>
                </div>


                {/* Pricing Calculation Rows */}
                <div className="space-y-2.5 text-xs text-[#64748b] border-t border-[#e2e8f0] pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#0b1f3a] font-semibold">£{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Automatic Subscribe & Save Auto-Savings */}
                  {subscriptionSavings > 0 && (
                    <div className="flex justify-between text-[#00C5A0] font-semibold">
                      <span>Subscribe &amp; Save ({autoSavings.text})</span>
                      <span>-£{subscriptionSavings.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Manual Promotional Code Discount */}
                  {appliedPromo && promoDiscount > 0 && (
                    <div className="flex justify-between text-[#00C5A0] font-semibold">
                      <span>Promo Code ({appliedPromo.code})</span>
                      <span>-£{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}


                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#0b1f3a] font-semibold text-xs">Shipping</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isFreeShippingUnlocked
                          ? "Free Royal Mail delivery unlocked"
                          : "Calculated at checkout"}
                      </p>
                    </div>
                    <div>
                      {items.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : isFreeShippingUnlocked ? (
                        <span className="text-[#00C5A0] font-bold text-xs uppercase">FREE</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Calculated at checkout</span>
                      )}
                    </div>
                  </div>


                  <div className="border-t border-[#e2e8f0] pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#0b1f3a]">Estimated Total</span>
                    <span className="text-xl font-extrabold text-[#0b1f3a]">
                      £{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-sm text-center block transition-all shadow-md"
                >
                  Proceed to Checkout
                </Link>

                {/* Compliance & Security Guarantee Strip */}
                <div className="pt-2 space-y-2 text-[11px] text-[#64748b]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Discreet, unbranded plain outer packaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>High-risk 3-D Secure card encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>In-vitro laboratory research compliance guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
