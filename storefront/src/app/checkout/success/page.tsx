"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("peptech_last_order")
      if (raw) {
        setOrder(JSON.parse(raw))
      }
    } catch {}
  }, [])

  const orderId = order?.id || "#PEP-CONFIRMED"
  const orderDate = order?.displayDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const orderTotal = order?.total != null ? `£${Number(order.total).toFixed(2)}` : "Paid in Full"
  const paymentMethod = order?.paymentMethod || "Secure Research Payment Gateway"
  const itemsSummary = order?.items?.map((i: any) => `${i.title} (${i.quantity}x)`).join(", ") || "Research Peptide Items"

  return (
    <div
      className="bg-white flex flex-col items-center justify-center py-[48px] min-h-screen w-full font-sans"
      data-node-id="52:8419"
      data-name="PEPTECH - Payment Success Prototype"
    >
      <div
        className="flex flex-col gap-[20px] items-center justify-center w-full max-w-[560px] px-4"
        data-node-id="52:8420"
      >
        {/* Brand Logo Box */}
        <div className="flex items-center justify-center" data-node-id="52:8421">
          <Link href="/">
            <img
              src="/images/figma/c053e9bca99b2b8f944f474abd976f1ff48db2ed.png"
              alt="PEPTECH"
              className="h-[28px] w-auto object-contain"
              data-node-id="52:8422"
            />
          </Link>
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
            className="font-bold text-[#0b1f3a] text-[26px] leading-tight"
            data-node-id="52:8428"
          >
            Payment successful
          </h1>
          <p
            className="font-normal text-[#64748b] text-[13.5px] max-w-[420px]"
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
              <span className="font-bold text-[#0b1f3a]" data-node-id="52:8496">{orderId}</span>
            </div>
            <span className="text-[#94a3b8] text-[12px]" data-node-id="52:8497">
              {orderDate}
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
                {orderTotal}
              </span>
            </div>
            <div className="flex items-center justify-between w-full" data-node-id="52:8503">
              <span className="text-[#64748b]" data-node-id="52:8504">Payment method</span>
              <span className="font-medium text-[#0b1f3a] text-[13.5px]" data-node-id="52:8505">
                {paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between w-full" data-node-id="52:8506">
              <span className="text-[#64748b]" data-node-id="52:8507">Order items</span>
              <span className="font-medium text-[#0b1f3a] text-[13.5px] truncate max-w-[280px]" data-node-id="52:8508">
                {itemsSummary}
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
                className="font-semibold text-[#16a6a3] text-[11.5px]"
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
                className="font-semibold text-[#0b1f3a] text-[12.5px]"
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
            className="bg-[#f1f5f9] hover:bg-slate-200 flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-[#0b1f3a] font-semibold text-[14px] transition-colors text-center"
            data-node-id="52:8525"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="bg-[#0b1f3a] hover:bg-[#16335a] flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-white font-semibold text-[14px] transition-colors text-center shadow-sm"
            data-node-id="52:8527"
          >
            Go to My Account →
          </Link>
        </div>
      </div>
    </div>
  )
}
