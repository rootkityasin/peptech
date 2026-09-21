"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState("")

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    if (promoCode.trim().toUpperCase() === "RESEARCH10") {
      setPromoApplied(true)
      setPromoError("")
    } else {
      setPromoError("Invalid promo code. Use RESEARCH10 for 10% off.")
      setPromoApplied(false)
    }
  }

  const discountAmount = promoApplied ? subtotal * 0.1 : 0
  const finalSubtotal = subtotal - discountAmount
  const shippingCost = finalSubtotal >= 100 || finalSubtotal === 0 ? 0 : 4.95
  const total = finalSubtotal + shippingCost

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
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b1f3a]">
            Laboratory Order Review
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Review compounds and quantities before proceeding to cold-chain dispatch checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 sm:p-16 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#f1f5f9] mx-auto flex items-center justify-center text-3xl">
              🛒
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#0b1f3a]">Your Cart is Currently Empty</h2>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                Explore our reusable pen systems, prefilled refill cartridges, or lyophilised research vials to configure your order.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
                <span className="text-xs text-[#64748b] font-mono">
                  Cold-Chain Verified
                </span>
              </div>

              {items.map((item) => (
                <div key={`${item.id}-${item.isSubscription}`} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-2 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={item.image || "/images/figma/0ca5324b13d2bb071e687b322a30bbdfb858e379.png"}
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
                        Strength: {item.strength} • SKU: {item.sku}
                      </div>
                      {item.options && item.options.length > 0 && (
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          {item.options.map((opt, idx) => (
                            <div key={idx} className="text-xs flex items-center gap-1.5 text-[#475569]">
                              <span className="font-semibold text-[#0b1f3a]">{opt.label}:</span>
                              <span className="text-[#16a6a3] font-medium">{opt.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.isSubscription ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#16a6a3]/10 text-[#16a6a3]">
                          🔄 28-Day Subscribe &amp; Save (10% Off)
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
                      <span className="px-3 py-1.5 text-xs font-mono font-bold text-[#0b1f3a]">
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
                      <div className="font-mono font-bold text-sm text-[#0b1f3a]">
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

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (try RESEARCH10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#e2e8f0] text-xs font-mono focus:outline-hidden focus:border-[#16a6a3]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white text-xs font-bold transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ✓ Promo RESEARCH10 applied: 10% discount!
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-red-500 font-semibold">
                      {promoError}
                    </p>
                  )}
                </form>

                {/* Pricing Calculation Rows */}
                <div className="space-y-2.5 text-xs text-[#64748b] border-t border-[#e2e8f0] pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#0b1f3a] font-semibold">£{subtotal.toFixed(2)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Discount (10%)</span>
                      <span className="font-mono">-£{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Royal Mail Tracked 24</span>
                    <span className="font-mono text-[#0b1f3a]">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase">Free (Over £100)</span>
                      ) : (
                        `£${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#e2e8f0] pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#0b1f3a]">Estimated Total</span>
                    <span className="font-mono text-xl font-black text-[#0b1f3a]">
                      £{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-sm text-center block transition-all shadow-md"
                >
                  Proceed to Checkout →
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
