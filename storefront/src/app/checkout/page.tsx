"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/CartContext"

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, destination, setDestination } = useCart()
  const [ruoAccepted, setRuoAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Customer Details Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    organization: "",
  })

  const hasSubscription = items.some((i) => i.isSubscription)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "country") {
      setDestination(value === "United Kingdom" ? "UK" : "INTL")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruoAccepted) {
      alert("You must accept the 18+ Research Use Only terms to proceed.")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      try {
        localStorage.removeItem("peptech_cart")
      } catch {
        // ignore
      }
    }, 1500)
  }

  if (isSuccess) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl font-black mx-auto">
          ✓
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500">ORDER CONFIRMATION #PT-84920</span>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Thank You for Your Order</h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            A confirmation email with your Royal Mail tracking reference has been dispatched to <strong>{formData.email || "your email"}</strong>.
          </p>
        </div>

        {paymentMethod === "bank" && (
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🏦</span> <span>UK Faster Payments / Bank Transfer Details</span>
            </h4>
            <div className="space-y-1 font-mono text-zinc-600 dark:text-zinc-300">
              <div>Bank Name: <strong>Barclays Bank UK</strong></div>
              <div>Account Name: <strong>PEPTECH INDUSTRIES LTD</strong></div>
              <div>Sort Code: <strong>20-04-15</strong></div>
              <div>Account Number: <strong>83920184</strong></div>
              <div>Payment Reference: <strong className="text-[var(--color-brand-teal)]">PT-84920</strong></div>
              <div>Amount Due: <strong className="text-base text-zinc-900 dark:text-white">£{total.toFixed(2)} GBP</strong></div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Orders are dispatched via Royal Mail Tracked immediately following automated bank settlement confirmation.
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 text-left flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <div className="font-bold">Discreet Outer Packaging Assured</div>
            <div className="text-[11px] opacity-90">Packed in plain unbranded cardboard boxes. PEPTECH branding is kept exclusively inside.</div>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-all shadow-md inline-block"
          >
            Return to Storefront
          </Link>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🛒</div>
        <h2 className="text-xl font-bold">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-500">Add items from Complete Pen Sets, Refills, or Vials before checkout.</p>
        <div>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-[var(--color-brand-navy)] text-white text-xs font-bold inline-block">
            Browse Store →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frictionless Secure Checkout</h1>
        <p className="text-xs text-zinc-500">Guest Checkout • Royal Mail Tracked • 18+ Laboratory Research Gate</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Contact & Laboratory Info */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-brand-navy)] text-white text-xs flex items-center justify-center">1</span>
              <span>Researcher &amp; Laboratory Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">First Name *</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Last Name *</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Email Address (For Royal Mail Tracking) *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Research Institution / Company (Optional)</label>
                <input
                  type="text"
                  name="organization"
                  placeholder="e.g. BioTech Research Institute Ltd"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-brand-navy)] text-white text-xs flex items-center justify-center">2</span>
              <span>Delivery Address (Discreet Shipping)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Country / Region *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  <option value="United Kingdom">United Kingdom (Royal Mail Tracked £4.95)</option>
                  <option value="United States">United States (Royal Mail International £15.00)</option>
                  <option value="European Union">European Union (Royal Mail International £15.00)</option>
                  <option value="Other">Worldwide (Royal Mail International £15.00)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Street Address *</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">City *</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Postal Code / ZIP *</label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Gateway Selection */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-brand-navy)] text-white text-xs flex items-center justify-center">3</span>
              <span>High-Risk Compliant Payment Method</span>
            </h3>

            <div className="space-y-3">
              {/* Card Gateway Option */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-teal)]/5"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mt-1"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">Credit / Debit Card (Authorize.Net 3DS / High-Risk Acquirer)</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">3DS SECURE</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Visa, Mastercard, Apple Pay, Google Pay. Tokenized 28-day recurring support. Raw card data is never stored on PEPTECH servers.
                  </p>
                </div>
              </label>

              {/* UK Bank Transfer Option */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "bank"
                    ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-teal)]/5"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="mt-1"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">UK Faster Payments / Direct Bank Transfer (BACS)</span>
                    <span className="text-[10px] font-mono text-zinc-400">ZERO CARD FEES</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Instant bank transfer from any UK banking app. Pay using sort code and account number with order reference.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Mandatory 18+ Checkbox (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-extrabold text-lg border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Order Summary
            </h3>

            {/* Item List */}
            <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {items.map((item) => (
                <div key={`${item.id}-${item.isSubscription}`} className="pt-2 flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</div>
                    <div className="text-[10px] text-zinc-500">
                      Qty: {item.quantity} • {item.strength} • {item.isSubscription ? "28-Day Sub (-10%)" : "One-Time"}
                    </div>
                  </div>
                  <div className="font-mono font-bold">
                    £{(item.price * item.quantity * (item.isSubscription && item.discountPercent ? 0.9 : 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Royal Mail ({destination === "UK" ? "UK Tracked" : "International"})</span>
                <span>£{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-base text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Due</span>
                <span className="text-[var(--color-brand-teal)] font-mono">£{total.toFixed(2)} GBP</span>
              </div>
            </div>

            {/* 28-day subscription notice if present */}
            {hasSubscription && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold">⚡ 28-Day Subscription Active:</div>
                <p className="text-[10px] opacity-90">
                  Your refill/vial item will renew every 28 days. A reminder email will be sent 3 days before renewal. You can pause, skip, or cancel at any time in your account.
                </p>
              </div>
            )}

            {/* Mandatory 18+ Research Gate Checkbox */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-snug">
                <input
                  type="checkbox"
                  required
                  checked={ruoAccepted}
                  onChange={(e) => setRuoAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-400 text-[var(--color-brand-teal)] focus:ring-[var(--color-brand-teal)]"
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  I confirm that I am at least <strong>18 years of age</strong> and that all purchased materials are strictly for <strong>in-vitro laboratory, scientific, and educational research purposes only</strong>. I agree to the <Link href="/terms-of-sale" className="text-[var(--color-brand-teal)] underline">Terms of Sale</Link> and <Link href="/research-disclaimer" className="text-[var(--color-brand-teal)] underline">Research Disclaimer</Link>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || !ruoAccepted}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                ruoAccepted && !isProcessing
                  ? "bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] cursor-pointer"
                  : "bg-zinc-400 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <span>Securing Order...</span>
              ) : (
                <span>Complete Research Order (£{total.toFixed(2)}) →</span>
              )}
            </button>

            <div className="text-center text-[10px] text-zinc-400">
              Discreet Shipping • Plain Outer Cardboard • Tracked Delivery
            </div>
          </div>
        </div>

      </form>
    </main>
  )
}
