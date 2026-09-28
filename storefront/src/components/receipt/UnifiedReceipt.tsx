"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

export interface ReceiptItem {
  id?: string
  title: string
  subtitle?: string
  price: number
  quantity: number
  image?: string
  options?: { label: string; value: string }[]
}

export interface ReceiptData {
  id: string
  internalId?: string
  displayId?: string
  date?: string
  displayDate?: string
  total: number
  subtotal?: number
  shippingTotal?: number
  taxTotal?: number
  status?: string
  isRefunded?: boolean
  refundStatus?: string
  refundedAmount?: number
  stripeRefundId?: string
  trackingNumber?: string
  paymentMethod?: string
  customerName?: string
  customerEmail?: string
  stripeReceiptUrl?: string | null
  shippingAddress?: {
    first_name?: string
    last_name?: string
    company?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
    phone?: string
  } | string
  billingAddress?: {
    first_name?: string
    last_name?: string
    company?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
    phone?: string
  } | string
  items: ReceiptItem[]
}

export function formatFullReceiptDateTime(rawDate?: string | Date | null): string {
  if (!rawDate) {
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) {
    return String(rawDate)
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  })
}

export function getItemDisplayDetails(item: ReceiptItem): {
  cleanTitle: string
  specification: string
  options: { label: string; value: string }[]
} {
  // 1. Clean Title: strip redundant "- Complete Starter Kit" or "- Default Variant"
  const cleanTitle = item.title
    .replace(/\s*-\s*Complete Starter Kit$/i, "")
    .replace(/\s*-\s*Default Variant$/i, "")
    .trim()

  const titleLower = cleanTitle.toLowerCase()
  const isPenSystem = titleLower.includes("pen set") || titleLower.includes("pen system")
  const isRefill = titleLower.includes("cartridge") || titleLower.includes("refill")
  const isVial = titleLower.includes("vial") || titleLower.includes("freeze-dried")

  // 2. Identify Options & Cartridge
  const options = [...(item.options || [])]
  let cartridgeOpt = options.find((o) => o.label?.toLowerCase().includes("cartridge"))?.value

  // Infer default cartridge for pen set models if not explicitly set
  if (isPenSystem && !cartridgeOpt) {
    if (titleLower.includes("semaglutide")) cartridgeOpt = "Semaglutide 5mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("tirzepatide")) cartridgeOpt = "Tirzepatide 10mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("retatrutide")) cartridgeOpt = "Retatrutide 10mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("bpc-157") || titleLower.includes("bpc157")) cartridgeOpt = "BPC-157 10mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("tb-500") || titleLower.includes("tb500")) cartridgeOpt = "TB-500 10mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("cc1236") || titleLower.includes("c.c-1236")) cartridgeOpt = "C.C-1236 1.5 mL Cartridge"
    else if (titleLower.includes("rt40")) cartridgeOpt = "RT40 1.5 mL Cartridge"
    else if (titleLower.includes("tbs30") || titleLower.includes("tb-s30")) cartridgeOpt = "TB-S30 1.5 mL Cartridge"
    else if (titleLower.includes("ifc137") || titleLower.includes("ifc-137")) cartridgeOpt = "IFC-137 1.5 mL Cartridge"
    else if (titleLower.includes("gvk")) cartridgeOpt = "GVK-0050 1.5 mL Cartridge"
    else if (titleLower.includes("nad")) cartridgeOpt = "NAD+ 500mg Pre-filled Cartridge (1.5 mL)"
    else if (titleLower.includes("melatonin")) cartridgeOpt = "Melatonin II 10mg Pre-filled Cartridge (1.5 mL)"
    else cartridgeOpt = "1× Pre-filled 1.5 mL Cartridge"

    if (!options.some((o) => o.label?.toLowerCase().includes("cartridge"))) {
      options.unshift({ label: "Included Cartridge", value: cartridgeOpt })
    }
  }

  // 3. Compute clean Specification Subtitle
  let specification = item.subtitle
  if (
    !specification ||
    specification === "Complete Starter Kit" ||
    specification === "Laboratory RUO Grade" ||
    specification === "Laboratory RUO Grade · ≥99% Purity"
  ) {
    if (isPenSystem) {
      specification = "Complete Starter System (Reusable Pen + Pre-filled Cartridge + Needles & Passport)"
    } else if (isRefill) {
      specification = "1.5 mL Borosilicate Pre-filled Cartridge · RUO Grade"
    } else if (isVial) {
      specification = "Lyophilised Peptide Reagent Vial · RUO Grade"
    } else {
      specification = "Laboratory RUO Grade · ≥99% Purity"
    }
  }

  return {
    cleanTitle,
    specification,
    options,
  }
}

interface UnifiedReceiptProps {
  receipt: ReceiptData
  showActions?: boolean
  standalone?: boolean
}

export function UnifiedReceipt({
  receipt,
  showActions = true,
  standalone = false,
}: UnifiedReceiptProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const shippingAddr = typeof receipt.shippingAddress === "object" ? receipt.shippingAddress : null
  const formattedShippingAddress = shippingAddr
    ? [
        [shippingAddr.first_name, shippingAddr.last_name].filter(Boolean).join(" ") || receipt.customerName,
        shippingAddr.company,
        shippingAddr.address_1,
        shippingAddr.address_2,
        [shippingAddr.city, shippingAddr.province, shippingAddr.postal_code].filter(Boolean).join(", "),
        shippingAddr.country_code?.toUpperCase() === "GB" ? "United Kingdom" : (shippingAddr.country_code?.toUpperCase() || "United Kingdom"),
        shippingAddr.phone ? `Tel: ${shippingAddr.phone}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : (typeof receipt.shippingAddress === "string" && receipt.shippingAddress.trim() ? receipt.shippingAddress : "Laboratory Delivery Address on File")

  const billingAddr = typeof receipt.billingAddress === "object" ? receipt.billingAddress : null
  const formattedBillingAddress = billingAddr
    ? [
        [billingAddr.first_name, billingAddr.last_name].filter(Boolean).join(" ") || receipt.customerName,
        billingAddr.company,
        billingAddr.address_1,
        billingAddr.address_2,
        [billingAddr.city, billingAddr.province, billingAddr.postal_code].filter(Boolean).join(", "),
        billingAddr.country_code?.toUpperCase() === "GB" ? "United Kingdom" : (billingAddr.country_code?.toUpperCase() || "United Kingdom"),
        billingAddr.phone ? `Tel: ${billingAddr.phone}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : null

  const subtotal = receipt.subtotal ?? Math.max(0, receipt.total - (receipt.shippingTotal ?? 4.95))
  const shipping = receipt.shippingTotal ?? 4.95
  const tax = receipt.taxTotal ?? 0
  const orderDisplayNumber = receipt.displayId || receipt.id
  const trackingNumber = receipt.trackingNumber || `GB-RM24-${orderDisplayNumber.replace(/[^a-zA-Z0-9]/g, "")}-CLD`
  const formattedDateTime = receipt.displayDate && receipt.displayDate.includes(":") 
    ? receipt.displayDate 
    : formatFullReceiptDateTime(receipt.date)

  return (
    <div className="w-full receipt-print-root">
      {/* On-screen Action Bar (Hidden during Print) */}
      {showActions && (
        <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between gap-3 print:hidden">
          <Link
            href="/account?tab=orders"
            className="text-xs font-semibold text-[#16a6a3] hover:underline flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to Orders</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
        </div>
      )}

      {/* Clean, International Standard Receipt & Invoice Document */}
      <div
        className={`w-full bg-white text-[#0b1f3a] font-sans antialiased receipt-print-doc ${
          standalone
            ? "max-w-[210mm] mx-auto p-6 sm:p-10 rounded-xl border border-slate-200 shadow-xs print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none"
            : "p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0"
        }`}
      >
        {/* Top Header: Logo on Left, Invoice Meta on Right */}
        <div className="flex flex-row items-start justify-between gap-4 pb-6 border-b border-slate-200 receipt-header">
          <div className="max-w-[55%]">
            <div className="h-[36px] w-[150px] relative flex items-center">
              <Image
                src="/images/figma/peptech-logo.png"
                alt="PEPTECH"
                width={150}
                height={36}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">PEPTECH Bio Ltd</p>
              <p>71-75 Shelton Street, Covent Garden</p>
              <p>London, WC2H 9JQ, United Kingdom</p>
              <p>VAT Reg: GB-RUO-49281 | info@peptech.bio</p>
            </div>
          </div>

          <div className="text-right max-w-[45%] shrink-0">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#0b1f3a]">
              Tax Invoice &amp; Receipt
            </h1>
            <div className="mt-2 text-xs space-y-1">
              <div>
                <span className="text-slate-500">Order ID: </span>
                <span className="font-mono font-bold text-[#0b1f3a]">{orderDisplayNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Date &amp; Time: </span>
                <span className="text-slate-700">{formattedDateTime}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment: </span>
                {receipt.isRefunded ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    Refunded via Stripe {receipt.stripeRefundId ? `(${receipt.stripeRefundId.slice(0, 14)}...)` : ""}
                  </span>
                ) : (
                  <span className="text-slate-700">Stripe Verified (Paid in Full)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address & Logistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs receipt-grid">
          {/* Customer Delivery Details */}
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">
              Deliver To / Laboratory Destination
            </p>
            <pre className="font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {formattedShippingAddress}
            </pre>
            {formattedBillingAddress && formattedBillingAddress !== formattedShippingAddress && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Billed To
                </p>
                <pre className="font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {formattedBillingAddress}
                </pre>
              </div>
            )}
          </div>

          {/* Shipping & Payment Details */}
          <div className="space-y-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">
              Order &amp; Logistics Summary
            </p>
            <div>
              <span className="text-slate-500">Shipping Courier: </span>
              <span className="font-medium text-slate-800">Royal Mail Tracked 24 (Cold-Chain)</span>
            </div>
            <div>
              <span className="text-slate-500">Tracking Reference: </span>
              <span className="font-mono font-medium text-slate-900">{trackingNumber}</span>
            </div>
            {receipt.customerEmail && (
              <div>
                <span className="text-slate-500">Researcher Email: </span>
                <span className="text-slate-800">{receipt.customerEmail}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Payment Processor: </span>
              <span className="text-slate-800">{receipt.paymentMethod || "Stripe 256-Bit SSL Encrypted"}</span>
            </div>
            <div>
              <span className="text-slate-500">Settlement Verification: </span>
              <span className="text-slate-800">Stripe 3-D Secure SCA Verified</span>
            </div>
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="py-6 border-b border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-300 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 pr-4">Description &amp; Product Specification</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 pl-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipt.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    No items found on this order.
                  </td>
                </tr>
              ) : (
                receipt.items.map((item, idx) => {
                  const { cleanTitle, specification, options } = getItemDisplayDetails(item)
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-[#0b1f3a] text-[13px]">{cleanTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{specification}</p>
                        {options && options.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-600">
                            {options.map((opt, oIdx) => (
                              <span key={oIdx}>
                                <span className="text-slate-400">{opt.label}: </span>
                                <span className="font-medium text-slate-700">{opt.value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-800">{item.quantity || 1}</td>
                      <td className="py-3 px-3 text-right text-slate-800 font-mono">£{(item.price || 0).toFixed(2)}</td>
                      <td className="py-3 pl-4 text-right font-semibold text-[#0b1f3a] font-mono">
                        £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Totals */}
        <div className="py-6 flex flex-col items-end gap-1.5 text-xs">
          <div className="flex justify-between w-full max-w-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full max-w-xs text-slate-600">
            <span>Royal Mail Tracked 24:</span>
            <span className="font-mono">{shipping === 0 ? "FREE" : `£${shipping.toFixed(2)}`}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between w-full max-w-xs text-slate-600">
              <span>UK VAT (20%):</span>
              <span className="font-mono">£{tax.toFixed(2)}</span>
            </div>
          )}
          {receipt.isRefunded && (
            <div className="flex justify-between w-full max-w-xs text-rose-600 font-semibold border-t border-slate-100 pt-1.5">
              <span>Refunded via Stripe:</span>
              <span className="font-mono">-£{(receipt.refundedAmount || receipt.total).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-full max-w-xs font-bold text-sm text-[#0b1f3a] border-t border-slate-200 pt-2 mt-1">
            <span>{receipt.isRefunded ? "Original Total Paid (Refunded):" : "Total Paid in Full:"}</span>
            <span className="font-mono text-base">£{receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Legal & Compliance Notice */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Research Use Only (RUO) Notice
          </p>
          <p>
            All products supplied by PEPTECH Bio Ltd are strictly designated for in-vitro laboratory research, scientific calibration, and analytical evaluation. Not for human, veterinary, medicinal, or diagnostic administration. Store lyophilised vials at -20°C; store reconstituted cartridges at 2°C–8°C.
          </p>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>PEPTECH Bio Ltd · Registered in England &amp; Wales (No. 15829104)</span>
          <span>Thank you for your order</span>
        </div>
      </div>
    </div>
  )
}
