"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/CartContext"
import {
  AppleLogo,
  GoogleLogo,
  VisaBadge,
  MastercardBadge,
  AmexBadge,
  JcbBadge,
} from "@/components/ui/PaymentBadges"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shippingCost, total, destination, setDestination } = useCart()
  const [ruoAccepted, setRuoAccepted] = useState(false)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    email: "email@example.com",
    fullName: "Dr. Alexander Wright",
    engraving: "",
    country: destination === "UK" ? "United Kingdom" : "United States",
    address1: "Imperial College Bioengineering Lab, South Kensington",
    address2: "Suite 4B, Scientific Research Annex",
    city: "London",
    zip: "SW7 2AZ",
    state: "Greater London",
    phone: "+44 20 7594 6000",
    cardNumber: "•••• •••• •••• 1234",
    cardExpiry: "12 / 28",
    cardCvc: "892",
  })

  const hasSubscription = items.some((i) => i.isSubscription)
  const subscriptionSavings = items.reduce((acc, item) => {
    if (item.isSubscription && item.discountPercent) {
      return acc + (item.price * (item.discountPercent / 100)) * item.quantity
    }
    return acc
  }, 0)

  const finalTotal = total - (promoApplied ? 15 : 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "country") {
      setDestination(value === "United Kingdom" ? "UK" : "INTL")
    }
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === "LAB10" || promoCode.trim().toUpperCase() === "RESEARCH") {
      setPromoApplied(true)
    } else {
      alert("Promo code applied: Standard Institutional Researcher tier")
      setPromoApplied(true)
    }
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruoAccepted) {
      alert("Please acknowledge and accept the 18+ Research Use Only (RUO) and Terms agreement to proceed.")
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
    }, 1200)
  }

  // If order succeeded, render the 100% Figma Node 52:8419 Payment Success view
  if (isSuccess) {
    return (
      <div
        className="bg-white flex flex-col items-center justify-center py-[48px] min-h-screen w-full"
        data-node-id="52:8419"
        data-name="PEPTECH - Payment Success Prototype"
      >
        <div
          className="flex flex-col gap-[20px] items-center justify-center w-full max-w-[560px] px-4"
          data-node-id="52:8420"
        >
          {/* Brand Logo Box */}
          <div className="flex items-center justify-center" data-node-id="52:8421">
            <img
              src="/images/figma/c053e9bca99b2b8f944f474abd976f1ff48db2ed.png"
              alt="PEPTECH"
              className="h-[28px] w-auto object-contain"
              data-node-id="52:8422"
            />
          </div>

          {/* Success Icon Badge */}
          <div
            className="bg-[#e6fffa] flex items-center justify-center rounded-[32px] size-[64px]"
            data-node-id="52:8423"
          >
            <div
              className="bg-[#16a6a3] flex items-center justify-center rounded-[23px] size-[46px]"
              data-node-id="52:8424"
            >
              <img
                src="/images/figma/3bed33eb2e1b4c1910e4a19511aab6704caaae5c.svg"
                alt="Success"
                className="size-[22px] block"
                data-node-id="52:8425"
              />
            </div>
          </div>

          {/* Text Stack */}
          <div
            className="flex flex-col gap-[6px] items-center text-center"
            data-node-id="52:8427"
          >
            <h1
              className="font-['Inter'] font-bold text-[#0b1f3a] text-[26px] leading-tight"
              data-node-id="52:8428"
            >
              Payment successful
            </h1>
            <p
              className="font-['Inter'] font-normal text-[#64748b] text-[13.5px] max-w-[420px]"
              data-node-id="52:8429"
            >
              Thank you for your order. We&apos;ve sent your receipt and batch COA to your email.
            </p>
          </div>

          {/* Order Receipt Slip */}
          <div
            className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[26px] sm:p-[28px] rounded-[16px] shadow-[0px_2px_8px_0px_rgba(10,31,59,0.03),0px_16px_36px_0px_rgba(10,31,59,0.06)] w-full"
            data-node-id="52:8492"
          >
            {/* Slip Header Row */}
            <div
              className="flex items-center justify-between w-full text-[13px]"
              data-node-id="52:8493"
            >
              <div className="flex gap-[6px] items-center" data-node-id="52:8494">
                <span className="text-[#64748b]" data-node-id="52:8495">Order ID:</span>
                <span className="font-bold text-[#0b1f3a]" data-node-id="52:8496">#PEP-89241</span>
              </div>
              <span className="text-[#94a3b8] text-[12px]" data-node-id="52:8497">
                16 Sep 2026, 18:34 GMT
              </span>
            </div>

            <div className="bg-[#f1f5f9] h-px w-full" data-node-id="52:8498" />

            {/* Slip Body Rows */}
            <div
              className="flex flex-col gap-[11px] items-start w-full text-[13px]"
              data-node-id="52:8499"
            >
              <div className="flex items-center justify-between w-full" data-node-id="52:8500">
                <span className="text-[#64748b]" data-node-id="52:8501">Payment amount</span>
                <span className="font-bold text-[#0b1f3a] text-[17px]" data-node-id="52:8502">
                  £{finalTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8503">
                <span className="text-[#64748b]" data-node-id="52:8504">Payment method</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px]" data-node-id="52:8505">
                  {paymentMethod === "card" ? "Visa ending in 1234" : "UK Faster Payments (Bank Transfer)"}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8506">
                <span className="text-[#64748b]" data-node-id="52:8507">Order items</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px] truncate max-w-[280px]" data-node-id="52:8508">
                  {items.map((i) => i.title).join(", ") || "Semaglutide Starter, Tirzepatide, BPC-157"}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8509">
                <span className="text-[#64748b]" data-node-id="52:8510">Delivery method</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px]" data-node-id="52:8511">
                  Royal Mail Tracked 24 (Cold-Chain)
                </span>
              </div>
            </div>

            <div className="bg-[#f1f5f9] h-px w-full" data-node-id="52:8512" />

            {/* Slip Actions Row */}
            <div
              className="flex items-center justify-between w-full"
              data-node-id="52:8513"
            >
              <div
                className="bg-[#e6fffa] flex gap-[6px] items-center px-[10px] py-[4px] rounded-[20px]"
                data-node-id="52:8514"
              >
                <img
                  src="/images/figma/5e8dbe8d29765b6f8d79690d9f2c6b1f1d8b3eed.svg"
                  alt="Verified"
                  className="size-[12px] block"
                  data-node-id="52:8515"
                />
                <span
                  className="font-['Inter'] font-semibold text-[#16a6a3] text-[11.5px]"
                  data-node-id="52:8517"
                >
                  Payment Verified &amp; Confirmed
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#f8fafc] hover:bg-slate-100 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[8px] transition-colors cursor-pointer"
                data-node-id="52:8518"
              >
                <img
                  src="/images/figma/56efa08312dbf6221d1bfffe005a20a1ed7d34dc.svg"
                  alt="Print"
                  className="size-[14px] block"
                  data-node-id="52:8519"
                />
                <span
                  className="font-['Inter'] font-semibold text-[#0b1f3a] text-[12.5px]"
                  data-node-id="52:8522"
                >
                  Print Slip
                </span>
              </button>
            </div>
          </div>

          {/* Success Action Buttons Row */}
          <div
            className="flex flex-col sm:flex-row gap-[12px] w-full"
            data-node-id="52:8524"
          >
            <Link
              href="/shop"
              className="bg-[#f1f5f9] hover:bg-slate-200 flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-[#0b1f3a] font-['Inter'] font-semibold text-[14px] transition-colors text-center"
              data-node-id="52:8525"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="bg-[#0b1f3a] hover:bg-[#16335a] flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-white font-['Inter'] font-semibold text-[14px] transition-colors text-center shadow-sm"
              data-node-id="52:8527"
            >
              Go to My Account →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const renderSummaryContent = () => (
    <>
      {/* Itemized Items List */}
      <div
        className="flex flex-col gap-[14px] items-start w-full"
        data-node-id="50:8033"
        data-name="Itemized Items List"
      >
        {items.map((item) => {
          const unitPrice =
            item.isSubscription && item.discountPercent
              ? item.price * (1 - item.discountPercent / 100)
              : item.price
          const lineTotal = unitPrice * item.quantity

          const subtitle = item.isSubscription
            ? "Auto-renews every 28 days • 10% Off"
            : item.format === "pen-set"
            ? "Medical Applicator + Cartridge + 4x Needles"
            : "99.8% HPLC Certified • Sterile Vial"

          return (
            <div
              key={`${item.id}-${item.isSubscription}`}
              className="flex items-center justify-between w-full gap-3"
              data-name={`Summary Item - ${item.title}`}
            >
              <div className="flex flex-1 gap-[12px] items-center min-w-0" data-name="Left Item">
                <div
                  className="bg-[rgba(255,255,255,0.08)] flex h-[48px] items-center justify-center rounded-[8px] shrink-0 size-[48px] p-1 border border-white/10"
                  data-name="Thumb"
                >
                  <img
                    src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                    alt={item.title}
                    className="size-[42px] object-contain pointer-events-none"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0 leading-tight" data-name="Info">
                  <p className="font-['Inter'] font-semibold text-[13px] text-white truncate w-full">
                    {item.title}
                  </p>
                  <p className="font-['Inter'] font-normal text-[#94a3b8] text-[11px] truncate w-full">
                    {subtitle}
                  </p>
                </div>
              </div>
              <p className="font-['Inter'] font-bold text-[14px] text-white whitespace-nowrap">
                £{lineTotal.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Promo Code Row */}
      <form
        onSubmit={handleApplyPromo}
        className="flex gap-[8px] h-[40px] items-start w-full mt-2"
        data-node-id="50:8058"
        data-name="Promo Code Row"
      >
        <div
          className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.14)] flex flex-1 h-full items-center px-[12px] rounded-[6px]"
          data-node-id="50:8059"
          data-name="Promo Input"
        >
          <input
            type="text"
            placeholder="Add promo or coupon code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="bg-transparent text-white text-[12.5px] w-full placeholder:text-[#94a3b8] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.24)] flex h-full items-center justify-center px-[16px] rounded-[6px] text-white text-[12.5px] font-semibold transition-colors cursor-pointer shrink-0"
          data-node-id="50:8061"
          data-name="Apply Promo Button"
        >
          {promoApplied ? "Applied ✓" : "Apply"}
        </button>
      </form>

      {/* Divider */}
      <div className="bg-[rgba(255,255,255,0.12)] h-px w-full my-1" data-node-id="50:8063" />

      {/* Financials Box */}
      <div
        className="flex flex-col gap-[9px] items-start w-full text-[13px]"
        data-node-id="50:8064"
        data-name="Financials Box"
      >
        <div className="flex items-center justify-between w-full" data-node-id="50:8065">
          <span className="text-[#94a3b8]" data-node-id="50:8066">Subtotal</span>
          <span className="font-['Inter'] font-medium text-white text-[13.5px]" data-node-id="50:8067">
            £{subtotal.toFixed(2)}
          </span>
        </div>
        {subscriptionSavings > 0 && (
          <div className="flex items-center justify-between w-full" data-node-id="50:8068">
            <span className="text-[#94a3b8]" data-node-id="50:8069">
              28-Day Subscription Savings (10%)
            </span>
            <span className="font-['Inter'] font-bold text-[#2dd4bf] text-[13.5px]" data-node-id="50:8070">
              -£{subscriptionSavings.toFixed(2)}
            </span>
          </div>
        )}
        {promoApplied && (
          <div className="flex items-center justify-between w-full">
            <span className="text-[#94a3b8]">Institutional Researcher Discount</span>
            <span className="font-['Inter'] font-bold text-[#2dd4bf] text-[13.5px]">-£15.00</span>
          </div>
        )}
        <div className="flex items-center justify-between w-full" data-node-id="50:8071">
          <span className="text-[#94a3b8]" data-node-id="50:8072">
            Royal Mail Special Delivery (Tracked 24)
          </span>
          <span className="font-['Inter'] font-bold text-[#2dd4bf] text-[13.5px]" data-node-id="50:8073">
            {destination === "UK" ? "FREE" : "£15.00"}
          </span>
        </div>
        <div className="flex items-center justify-between w-full" data-node-id="50:8074">
          <div className="flex gap-[6px] items-center" data-node-id="50:8167">
            <span className="text-[#94a3b8]" data-node-id="50:8168">Tax</span>
            <img
              src="/images/figma/c625150f6097c7e9a94871ef584d45568709e394.svg"
              alt="Info"
              className="size-[13px] block"
              data-node-id="50:8169"
            />
          </div>
          <span className="text-[#94a3b8]" data-node-id="50:8173">
            Included (UK VAT Exempt for RUO)
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="bg-[rgba(255,255,255,0.12)] h-px w-full my-1" data-node-id="50:8077" />

      {/* Total Due Row */}
      <div
        className="flex items-center justify-between w-full text-white"
        data-node-id="50:8078"
        data-name="Total Due Row"
      >
        <span className="font-['Inter'] font-semibold text-[14.5px]" data-node-id="50:8079">
          Total due today
        </span>
        <span className="font-['Inter'] font-bold text-[24px]" data-node-id="50:8080">
          £{finalTotal.toFixed(2)}
        </span>
      </div>

      {/* Cold Chain Assurance Badge */}
      <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 text-xs text-[#94A3B8]">
        <span className="text-base">❄️</span>
        <span>
          <strong className="text-white">Protected 2°C–8°C Cold-Chain:</strong> All peptides ship in insulated temperature-monitored packaging via Royal Mail Tracked 24.
        </span>
      </div>
    </>
  )

  return (
    <div
      className="bg-white flex flex-col lg:flex-row w-full min-h-screen relative"
      data-node-id="50:8021"
      data-name="PEPTECH - Checkout Page Prototype"
    >
      {/* ======================================================== */}
      {/* MOBILE TOP BAR (< lg)                                    */}
      {/* ======================================================== */}
      <div className="lg:hidden w-full bg-[#0A1B33] text-white border-b border-white/10 sticky top-0 z-30 shadow-md">
        {/* Top brand row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-lg size-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link href="/" className="flex items-center">
              <img
                src="/images/figma/43d09fdba59db4b9cd704c903f631862a259e619.png"
                alt="PEPTECH"
                className="h-5 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#94A3B8] block uppercase tracking-wider">Due Today</span>
            <span className="text-base font-bold text-white">£{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Collapsible Order Summary Bar */}
        <div className="border-t border-white/10 px-4 sm:px-6 py-2.5 bg-[#071324] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-[#2DD4BF] hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#2DD4BF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{summaryExpanded ? "Hide order summary" : "Show order summary"}</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 transform ${summaryExpanded ? "rotate-180 text-white" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {hasSubscription && (
            <span className="text-[10px] bg-[#16A6A3] text-white font-bold px-2 py-0.5 rounded">
              28-Day Refill Included
            </span>
          )}
        </div>

        {/* Expanded Summary Drawer on Mobile (Smooth Accordion Transition) */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#0a1b33] border-t border-white/10 ${
            summaryExpanded ? "max-h-[1200px] opacity-100 py-5 px-4 sm:px-6" : "max-h-0 opacity-0 py-0 px-4 sm:px-6 pointer-events-none"
          }`}
        >
          {renderSummaryContent()}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP LEFT SUMMARY COLUMN (Full Screen Half, #0a1b33)  */}
      {/* ======================================================== */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[44%] 2xl:w-[42%] bg-[#0a1b33] min-h-screen justify-end shrink-0 border-r border-[#1e293b]"
        data-node-id="50:8022"
        data-name="Left Summary Column"
      >
        <div className="w-full max-w-[560px] px-8 lg:px-10 xl:px-14 py-10 flex flex-col gap-[20px] text-white">
          {/* Top Nav Row */}
          <div
            className="flex gap-[16px] items-center w-full"
            data-node-id="50:8023"
            data-name="Top Nav Row"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-[12px] size-[28px] hover:bg-white/10 transition-colors cursor-pointer"
              data-node-id="50:8024"
              data-name="Back Button"
              aria-label="Back"
            >
              <img
                src="/images/figma/0d968d2c24d222a837cbe159704831bf4712a235.svg"
                alt="Back"
                className="size-[20px] block"
                data-node-id="50:8164"
              />
            </button>
            <Link href="/" className="h-[22px] w-[182px] relative block" data-node-id="50:8026" data-name="PEPTECH Logo">
              <img
                src="/images/figma/43d09fdba59db4b9cd704c903f631862a259e619.png"
                alt="PEPTECH"
                className="size-full object-contain pointer-events-none"
              />
            </Link>
          </div>

          {/* Hero Price Display */}
          <div
            className="flex flex-col gap-[4px] items-start w-full"
            data-node-id="50:8027"
            data-name="Hero Price Display"
          >
            <p
              className="font-['Inter'] font-medium text-[#94a3b8] text-[13px]"
              data-node-id="50:8028"
            >
              Total due today
            </p>
            <div
              className="flex gap-[12px] items-center w-full flex-wrap"
              data-node-id="50:8029"
              data-name="Hero Price Row"
            >
              <p
                className="font-['Inter'] font-bold text-white text-[34px] leading-tight"
                data-node-id="50:8030"
              >
                £{finalTotal.toFixed(2)}
              </p>
              {hasSubscription && (
                <div
                  className="bg-[#16a6a3] flex items-center justify-center px-[8px] py-[4px] rounded-[6px]"
                  data-node-id="50:8031"
                  data-name="Cadence Pill"
                >
                  <span
                    className="font-['Inter'] font-bold text-[11px] text-white whitespace-nowrap"
                    data-node-id="50:8032"
                  >
                    28-Day Refill Included
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Summary Content */}
          {renderSummaryContent()}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT FORM COLUMN (Full Screen Half, White)              */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[54%] xl:w-[56%] 2xl:w-[58%] bg-white min-h-screen flex justify-start">
        <form
          onSubmit={handleSubmitOrder}
          className="w-full max-w-[680px] px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 flex flex-col gap-[20px]"
          data-node-id="50:8087"
          data-name="Right Form Column"
        >
        {/* Express Checkout Box */}
        <div
          className="flex flex-col gap-[8px] items-start w-full"
          data-node-id="50:8088"
          data-name="Express Checkout Box"
        >
          <p
            className="font-['Inter'] font-semibold text-[#64748b] text-[13px]"
            data-node-id="50:8089"
          >
            Express Checkout
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] w-full"
            data-node-id="50:8090"
            data-name="Express Buttons Row"
          >
            {/* Apple Pay Button */}
            <button
              type="button"
              onClick={() => alert("Apple Pay (PEPTECH High-Risk SCA 3DS Tokenized Gateway)")}
              className="btn-press bg-black hover:bg-neutral-900 flex h-[48px] items-center justify-center gap-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              data-node-id="50:8153"
              data-name="Apple Pay Button"
            >
              <AppleLogo className="w-[19px] h-[19px] text-white" fill="white" />
              <span className="font-bold text-[16px] text-white tracking-wide">
                Pay
              </span>
            </button>

            {/* Google Pay Button */}
            <button
              type="button"
              onClick={() => alert("Google Pay (PEPTECH High-Risk SCA 3DS Tokenized Gateway)")}
              className="btn-press bg-white hover:bg-slate-50 border border-[#cbd5e1] flex h-[48px] items-center justify-center gap-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              data-node-id="50:8157"
              data-name="Google Pay Button"
            >
              <GoogleLogo className="w-[19px] h-[19px]" />
              <span className="font-semibold text-[16px] text-[#3c4043]">
                Pay
              </span>
            </button>
          </div>
        </div>

        {/* Or Divider */}
        <div
          className="flex gap-[12px] items-center justify-center w-full my-1"
          data-node-id="50:8095"
          data-name="Or Divider"
        >
          <div className="bg-[#e2e8f0] flex-1 h-px" data-node-id="50:8096" />
          <p
            className="font-['Inter'] font-normal text-[#94a3b8] text-[11.5px]"
            data-node-id="50:8097"
          >
            or pay with card
          </p>
          <div className="bg-[#e2e8f0] flex-1 h-px" data-node-id="50:8098" />
        </div>

        {/* Shipping Information Section */}
        <div
          className="flex flex-col gap-[14px] items-start w-full"
          data-node-id="50:8174"
          data-name="Shipping Information Section"
        >
          <p
            className="font-['Inter'] font-bold text-[#0b1f3a] text-[15px]"
            data-node-id="50:8175"
          >
            Shipping information
          </p>

          {/* Email Field Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8176"
            data-name="Email Field Group"
          >
            <label
              htmlFor="email"
              className="font-['Inter'] font-medium text-[#475569] text-[13px]"
              data-node-id="50:8177"
            >
              Email
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex h-[42px] items-center px-[14px] rounded-[8px] w-full"
              data-node-id="50:8178"
            >
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13px] bg-transparent focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Personal Engraving Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8180"
            data-name="Personal Engraving Group"
          >
            <label
              htmlFor="engraving"
              className="font-['Inter'] font-medium text-[#475569] text-[13px]"
              data-node-id="50:8181"
            >
              Personal engraving
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex h-[42px] items-center justify-between pl-[14px] pr-[10px] rounded-[8px] w-full"
              data-node-id="50:8182"
            >
              <input
                id="engraving"
                type="text"
                name="engraving"
                value={formData.engraving}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13px] bg-transparent focus:outline-none placeholder:text-[#94a3b8]"
                placeholder="Custom laboratory ID / Pen engraving text"
              />
              <span
                className="font-['Inter'] font-normal text-[#94a3b8] text-[13px] whitespace-nowrap ml-2"
                data-node-id="50:8185"
              >
                Optional
              </span>
            </div>
          </div>

          {/* Shipping Address Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8186"
            data-name="Shipping Address Group"
          >
            <label
              className="font-['Inter'] font-medium text-[#475569] text-[13px]"
              data-node-id="50:8187"
            >
              Shipping address
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex flex-col items-start rounded-[8px] w-full overflow-hidden"
              data-node-id="50:8188"
              data-name="Address Matrix Container"
            >
              {/* Row - Full Name */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8189"
              >
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8191" />

              {/* Row - Country */}
              <div
                className="flex h-[38px] items-center justify-between px-[14px] w-full"
                data-node-id="50:8192"
              >
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full text-[13px] font-['Inter'] font-medium text-[#0b1f3a] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Australia">Australia</option>
                </select>
                <img
                  src="/images/figma/ac0f05ab35f639b793408b3455e8c057a73c1f13.svg"
                  alt="Chevron"
                  className="size-[12px] block pointer-events-none -ml-4"
                  data-node-id="50:8194"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8196" />

              {/* Row - Address Line 1 */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8197"
              >
                <input
                  type="text"
                  name="address1"
                  required
                  value={formData.address1}
                  onChange={handleInputChange}
                  placeholder="Address line 1"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8199" />

              {/* Row - Address Line 2 */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8200"
              >
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  placeholder="Address line 2"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8202" />

              {/* City and ZIP Row */}
              <div
                className="flex h-[38px] items-center w-full"
                data-node-id="50:8203"
              >
                <div className="flex flex-1 h-full items-center px-[14px]">
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                  />
                </div>
                <div className="bg-[#e2e8f0] h-full w-px" data-node-id="50:8206" />
                <div className="flex flex-1 h-full items-center px-[14px]">
                  <input
                    type="text"
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP / Postal Code"
                    className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8209" />

              {/* Row - State */}
              <div
                className="flex h-[38px] items-center justify-between px-[14px] w-full"
                data-node-id="50:8210"
              >
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State / County / Region"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
                <img
                  src="/images/figma/ac0f05ab35f639b793408b3455e8c057a73c1f13.svg"
                  alt="Chevron"
                  className="size-[12px] block pointer-events-none"
                  data-node-id="50:8212"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div
          className="flex flex-col gap-[8px] items-start w-full"
          data-node-id="50:8104"
          data-name="Payment Method Section"
        >
          <div className="flex items-center justify-between w-full">
            <p
              className="font-['Inter'] font-bold text-[#0b1f3a] text-[15px]"
              data-node-id="50:8269"
            >
              Payment method
            </p>
            {/* Method switch between Card and UK Faster Payments */}
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  paymentMethod === "card"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                Card (SCA 3DS)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  paymentMethod === "bank"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                UK Faster Payments
              </button>
            </div>
          </div>

          {paymentMethod === "card" ? (
            <div
              className="bg-white border border-[#cbd5e1] flex flex-col gap-[12px] items-start p-[16px] rounded-[10px] w-full"
              data-node-id="50:8270"
              data-name="Payment Method Outer Card"
            >
              <div
                className="flex gap-[8px] items-center w-full"
                data-node-id="50:8271"
                data-name="Card Radio Option Row"
              >
                <img
                  src="/images/figma/75de50cf21aff3f32d16f45441e50cd9aeff3c2a.svg"
                  alt="Selected"
                  className="size-[18px] block"
                  data-node-id="50:8272"
                />
                <img
                  src="/images/figma/b7f7e157fccaacb88eb1df8d437caf0564d19ad9.svg"
                  alt="Card"
                  className="h-[14px] w-[18px] block"
                  data-node-id="50:8275"
                />
                <span
                  className="font-['Inter'] font-semibold text-[#0b1f3a] text-[14px]"
                  data-node-id="50:8279"
                >
                  Card
                </span>
              </div>

              <p
                className="font-['Inter'] font-medium text-[#475569] text-[12.5px]"
                data-node-id="50:8280"
              >
                Card information
              </p>

              <div
                className="bg-white border border-[#cbd5e1] flex flex-col items-start rounded-[8px] w-full overflow-hidden"
                data-node-id="50:8281"
                data-name="Card Information Group"
              >
                {/* Card Number Row */}
                <div
                  className="flex h-[46px] sm:h-[44px] items-center justify-between pl-[14px] pr-[10px] w-full gap-2"
                  data-node-id="50:8282"
                >
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 1234 1234 1234"
                    className="w-full text-[15px] sm:text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none font-mono"
                  />
                  <div
                    className="flex gap-1.5 items-center shrink-0"
                    data-node-id="50:8284"
                  >
                    <VisaBadge />
                    <MastercardBadge />
                    <AmexBadge />
                    <JcbBadge />
                  </div>
                </div>

                <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8295" />

                {/* Expiry & CVC Row */}
                <div
                  className="flex h-[42px] items-center w-full"
                  data-node-id="50:8296"
                >
                  <div className="flex flex-1 h-full items-center px-[14px]">
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM / YY"
                      className="w-full text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="bg-[#e2e8f0] h-full w-px" data-node-id="50:8299" />
                  <div className="flex flex-1 h-full items-center justify-between px-[14px]">
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      placeholder="CVC"
                      className="w-full text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                    />
                    <img
                      src="/images/figma/82f5d1a1b3c15602bab94ef555b4d7e076c2e1c0.svg"
                      alt="CVC"
                      className="h-[16px] w-[26px] block shrink-0"
                      data-node-id="50:8357"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Same as Shipping Row */}
              <label
                className="flex gap-[8px] items-center w-full cursor-pointer mt-1"
                data-node-id="50:8308"
              >
                <div
                  className={`flex items-center justify-center rounded-[4px] size-[16px] border-[1.5px] transition-colors ${
                    billingSameAsShipping
                      ? "bg-[#0b1f3a] border-[#0b1f3a]"
                      : "bg-white border-[#475469]"
                  }`}
                  onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
                  data-node-id="50:8309"
                >
                  {billingSameAsShipping && (
                    <img
                      src="/images/figma/32f20819089ab9125b39743c1b4b5e726591e0d9.svg"
                      alt="Checked"
                      className="size-[11px] block invert"
                      data-node-id="50:8362"
                    />
                  )}
                </div>
                <span
                  className="font-['Inter'] font-normal text-[#475569] text-[13px]"
                  data-node-id="50:8311"
                >
                  Billing info is same as shipping
                </span>
              </label>
            </div>
          ) : (
            <div className="bg-[#f8fafc] border border-[#cbd5e1] p-[18px] rounded-[10px] w-full space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <span className="font-bold text-sm text-[#0b1f3a]">
                  UK Faster Payments (Bank Transfer)
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Account instructions and unique payment reference will be issued immediately upon order submission. Orders dispatch via Royal Mail Tracked once automated bank settlement is detected.
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <div>Bank: Barclays Bank UK PLC</div>
                <div>Account Name: PEPTECH INDUSTRIES LTD</div>
                <div>Reference Code: PT-REQ-INST</div>
              </div>
            </div>
          )}
        </div>

        {/* Phone and Link Box */}
        <div
          className="bg-white border border-[#cbd5e1] flex flex-col gap-[12px] items-start p-[16px] rounded-[10px] w-full"
          data-node-id="50:8312"
          data-name="Phone and Link Box"
        >
          <label
            htmlFor="phone"
            className="font-['Inter'] font-medium text-[#475569] text-[13px]"
            data-node-id="50:8313"
          >
            Phone number
          </label>
          <div
            className="bg-white border border-[#cbd5e1] flex h-[42px] items-center justify-between pl-[14px] pr-[10px] rounded-[8px] w-full"
            data-node-id="50:8314"
          >
            <div className="flex items-center gap-[8px] flex-1">
              <span className="text-[14px]">{destination === "UK" ? "🇬🇧" : "🇺🇸"}</span>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13.5px] bg-transparent focus:outline-none placeholder:text-[#94a3b8]"
                placeholder="(201) 555-0123"
              />
            </div>
            <span
              className="font-['Inter'] font-normal text-[#94a3b8] text-[13px] ml-2"
              data-node-id="50:8319"
            >
              Optional
            </span>
          </div>

          <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8320" />

          <p
            className="font-['Inter'] font-normal text-[#64748b] text-[11.5px] leading-[16px]"
            data-node-id="50:8321"
          >
            By providing your contact details, you agree to create a research account and save your dispatch address, subject to our Terms and Privacy Policy.
          </p>
        </div>

        {/* Terms Agreement & Mandatory 18+ RUO Checkbox */}
        <div
          className="flex gap-[10px] items-start w-full cursor-pointer py-1"
          onClick={() => setRuoAccepted(!ruoAccepted)}
          data-node-id="50:8322"
          data-name="Terms Agreement Row"
        >
          <div
            className={`flex items-center justify-center rounded-[4px] size-[18px] border-[1.5px] shrink-0 mt-0.5 transition-colors ${
              ruoAccepted
                ? "bg-[#1a56db] border-[#1a56db]"
                : "bg-white border-[#cbd5e1]"
            }`}
            data-node-id="50:8323"
          >
            {ruoAccepted && (
              <img
                src="/images/figma/32f20819089ab9125b39743c1b4b5e726591e0d9.svg"
                alt="Checked"
                className="size-[12px] block invert"
              />
            )}
          </div>
          <p
            className="font-['Inter'] font-normal text-[#475569] text-[12.5px] leading-snug"
            data-node-id="50:8324"
          >
            I confirm that I am at least 18 years of age and agree to PEPTECH&apos;s{" "}
            <Link href="/terms-of-sale" onClick={(e) => e.stopPropagation()} className="underline hover:text-[#0b1f3a]">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/privacy" onClick={(e) => e.stopPropagation()} className="underline hover:text-[#0b1f3a]">
              Privacy Policy
            </Link>
            , and strict Research Use Only (RUO) laboratory conditions.
          </p>
        </div>

        {/* Pay Action Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="btn-shimmer btn-press bg-[#1a56db] hover:bg-[#1546b8] flex h-[50px] items-center justify-center rounded-xl w-full text-white font-semibold text-[15px] transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          data-node-id="50:8325"
          data-name="Pay Action Button"
        >
          {isProcessing ? "Authorizing SCA 3D Secure..." : `Pay £${finalTotal.toFixed(2)}`}
        </button>

        {/* Returns Guarantee Row */}
        <div
          className="flex gap-[6px] items-center justify-center w-full mt-1"
          data-node-id="50:8327"
          data-name="Returns Guarantee Row"
        >
          <img
            src="/images/figma/ad4ab2c76cb3f79e810c6af109b26156f538b564.svg"
            alt="Return"
            className="size-[14px] block"
            data-node-id="50:8328"
          />
          <span
            className="font-['Inter'] font-normal text-[#475569] text-[12px] underline"
            data-node-id="50:8330"
          >
            Free returns and exchanges on unopened laboratory hardware
          </span>
        </div>

        {/* Security Footer Row */}
        <div
          className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full text-[11.5px] text-[#64748b] pt-3 border-t border-slate-100"
          data-node-id="50:8331"
          data-name="Stripe Footer Row"
        >
          <div className="flex items-center gap-2" data-node-id="50:8332">
            <span className="text-emerald-600 font-bold">🔒 256-Bit SSL</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-[#0b1f3a]">3-D Secure 2.0 (SCA)</span>
            <span className="text-slate-300">•</span>
            <span>PCI-DSS Level 1</span>
          </div>
          <div className="flex gap-[12px] items-center text-slate-500" data-node-id="50:8336">
            <Link href="/terms-of-sale" className="hover:text-[#0b1f3a] transition-colors">Terms of Sale</Link>
            <Link href="/shipping-returns" className="hover:text-[#0b1f3a] transition-colors">Shipping &amp; Returns</Link>
            <Link href="/contact" className="hover:text-[#0b1f3a] transition-colors">Laboratory Support</Link>
          </div>
        </div>
      </form>
    </div>
  </div>
)
}
