"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useCart } from "./CartContext"

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useCart()

  // Calculate items total
  const itemsTotal = items.reduce((acc, item) => {
    const unitPrice =
      item.isSubscription && item.discountPercent
        ? item.price * (1 - item.discountPercent / 100)
        : item.price
    return acc + unitPrice * item.quantity
  }, 0)

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  // Do not unmount abruptly - keep mounted for smooth slide-out transition
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex justify-end transition-all duration-300 ${
        isDrawerOpen ? "pointer-events-auto visible" : "pointer-events-none invisible delay-300"
      }`}
      data-node-id="47:7370"
      data-name="PEPTECH - Cart Drawer (Slide-Out)"
    >
      {/* Left Backdrop (Click to Close with Smooth Fade) */}
      <div
        className={`fixed inset-0 bg-[rgba(11,31,58,0.55)] backdrop-blur-xs transition-opacity duration-300 ease-out cursor-pointer ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsDrawerOpen(false)}
        data-node-id="47:7421"
        data-name="Left Backdrop (Click to Close)"
      />

      {/* Cart Drawer Panel (Right Aligned - Smooth 60fps Slide Entrance & Exit) */}
      <div
        className={`relative z-10 bg-white border-l border-[#e2e8f0] flex flex-col h-full items-start overflow-hidden shadow-[-12px_0px_32px_0px_rgba(11,31,58,0.22)] shrink-0 w-full sm:w-[480px] transition-transform duration-300 ease-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-node-id="47:7422"
        data-name="Cart Drawer Panel (Right Aligned)"
      >
        {/* 01 Drawer Header */}
        <div
          className="bg-white border-b border-[#e2e8f0] flex flex-col items-start px-[24px] py-[18px] shrink-0 w-full"
          data-node-id="47:7423"
          data-name="01 Drawer Header"
        >
          <div
            className="flex items-center justify-between w-full"
            data-node-id="47:7424"
            data-name="Title & Close Row"
          >
            <div className="flex items-center gap-2.5" data-node-id="47:7425" data-name="Header Left">
              <h2
                className="font-bold text-[#0b1f3a] text-[20px] leading-tight"
                data-node-id="47:7426"
              >
                Review Cart
              </h2>
              {items.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#0b1f3a]">
                  {items.reduce((sum, i) => sum + i.quantity, 0)} {items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="bg-[#0b1f3a] cursor-pointer flex items-center justify-center rounded-[8px] shrink-0 size-[36px] hover:bg-[#16a6a3] active:scale-95 transition-all duration-200 group"
              data-node-id="47:7429"
              data-name="Close Button"
              aria-label="Close cart"
            >
              <span
                className="font-bold text-[14px] text-white leading-none transition-transform duration-200 group-hover:rotate-90"
                data-node-id="47:7430"
              >
                ✕
              </span>
            </button>
          </div>
        </div>

        {/* Free Shipping Dynamic Progress Indicator */}
        {items.length > 0 && (
          <div className="w-full px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-medium text-[#0b1f3a]">
                {itemsTotal >= 150 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Free Royal Mail Tracked 24 Unlocked!</span>
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#16a6a3]">£{(150 - itemsTotal).toFixed(2)}</strong> more for Free Tracked 24 Shipping
                  </span>
                )}
              </span>
              <span className="text-[11px] font-semibold text-[#94a3b8]">
                {Math.min(100, Math.round((itemsTotal / 150) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  itemsTotal >= 150 ? "bg-emerald-500" : "bg-[#16a6a3]"
                }`}
                style={{ width: `${Math.min(100, Math.max(6, (itemsTotal / 150) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* 02 Drawer Body - Items List */}
        <div
          className="bg-[#f8fafc] flex flex-1 flex-col gap-[10px] min-h-0 overflow-y-auto px-[20px] py-[14px] w-full"
          data-node-id="47:7439"
          data-name="02 Drawer Body - Items List"
        >
          {items.length === 0 ? (
            <div
              key={isDrawerOpen ? "drawer-empty-open" : "drawer-empty-closed"}
              className="flex flex-1 flex-col items-center justify-center py-16 text-center space-y-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-100/90 border border-slate-200/80 flex items-center justify-center shadow-xs animate-empty-cart-badge">
                  <svg
                    className="w-7 h-7 text-[#0b1f3a]"
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
                {/* Subtle gentle decorative pulse ring */}
                <div className="absolute inset-0 rounded-full border border-[#0b1f3a]/15 animate-ping pointer-events-none opacity-40 [animation-duration:2.5s]" />
              </div>

              <div className="space-y-1 animate-empty-cart-text">
                <h3 className="font-bold text-[#0b1f3a] text-base">Your cart is empty</h3>
                <p className="text-xs text-[#64748b] max-w-[260px]">
                  Explore our Complete Pen Sets, Refill Cartridges, and Freeze-Dried Vials.
                </p>
              </div>

              <div className="animate-empty-cart-btn">
                <Link
                  href="/shop"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-shimmer btn-press px-5 py-2.5 rounded-lg bg-[#0b1f3a] hover:bg-[#16335a] text-white font-semibold text-xs transition-colors shadow-sm inline-block"
                >
                  Start Browsing
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice =
                item.isSubscription && item.discountPercent
                  ? item.price * (1 - item.discountPercent / 100)
                  : item.price
              const itemTotal = unitPrice * item.quantity
              const originalItemTotal = item.price * item.quantity

              const subtitle =
                item.format === "pen-set"
                  ? "Medical Applicator + Cartridge + 4x Needles"
                  : item.format === "refill"
                  ? "Pre-filled 3mL Borosilicate Glass Cartridge"
                  : "99.8% HPLC Certified • Sterile Lyophilised Cake"

              return (
                <div
                  key={`${item.id}-${item.isSubscription}`}
                  className="bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] flex items-start justify-between p-[14px] rounded-[10px] shrink-0 w-full shadow-xs transition-colors"
                  data-name={`Cart Item - ${item.title}`}
                >
                  <div className="flex flex-1 gap-[12px] items-start min-w-0" data-name="Left Content">
                    {/* Thumb Container */}
                    <div
                      className="flex items-center justify-center rounded-[8px] shrink-0 size-[64px] bg-[#f8fafc] border border-slate-100 overflow-hidden mt-0.5"
                      data-name="Thumb Container"
                    >
                      <img
                        src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                        alt={item.title}
                        className="size-full object-contain pointer-events-none rounded-[6px] p-1 transition-transform duration-200 hover:scale-105"
                      />
                    </div>

                    {/* Info Column */}
                    <div className="flex flex-1 flex-col gap-[5px] items-start min-w-0" data-name="Info Column">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug truncate w-full">
                        {item.title}
                      </p>
                      <p className="font-normal text-[#64748b] text-[10.5px] leading-tight truncate w-full">
                        {subtitle}
                      </p>

                      {/* Dynamic Chosen Options (Cartridge & Diluent/Vial) */}
                      {item.options && item.options.length > 0 && (
                        <div className="flex flex-col gap-1 w-full my-0.5">
                          {item.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] leading-snug flex items-baseline gap-1.5 w-full"
                            >
                              <span className="font-semibold text-[#0b1f3a] shrink-0 text-[10.5px]">
                                {opt.label}:
                              </span>
                              <span
                                className="text-[#16a6a3] font-medium text-[11px] truncate"
                                title={opt.value}
                              >
                                {opt.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price & Qty Stack */}
                      <div className="flex flex-col gap-[6px] items-start mt-0.5" data-name="Price & Qty Stack">
                        <div className="flex items-baseline gap-[6px]" data-name="Price Row">
                          <p className="font-bold text-[#0b1f3a] text-[14px] leading-none">
                            £{itemTotal.toFixed(2)}
                          </p>
                          {item.isSubscription && item.discountPercent && (
                            <p className="font-normal line-through text-[#94a3b8] text-[11px] leading-none">
                              £{originalItemTotal.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Qty Stepper with Click Animation */}
                        <div
                          className="bg-[#f8fafc] border border-slate-200 flex h-[32px] items-center rounded-[6px] shrink-0 w-[96px] overflow-hidden shadow-2xs"
                          data-name="Qty Stepper"
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.isSubscription, -1)}
                            className="flex h-[32px] w-[30px] items-center justify-center font-bold text-[#65748b] text-[15px] hover:bg-slate-200 active:scale-90 active:bg-slate-300 transition-all cursor-pointer"
                            data-name="Minus"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <div
                            className="bg-white border-x border-slate-200 flex h-[32px] w-[36px] items-center justify-center font-bold text-[#0b1f3a] text-[13.5px]"
                            data-name="Value"
                          >
                            {item.quantity}
                          </div>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.isSubscription, 1)}
                            className="flex h-[32px] w-[30px] items-center justify-center font-bold text-[#0b1f3a] text-[15px] hover:bg-slate-200 active:scale-90 active:bg-slate-300 transition-all cursor-pointer"
                            data-name="Plus"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button with Hover Pop */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.isSubscription)}
                    className="flex items-center justify-center rounded-[8px] shrink-0 size-[28px] hover:bg-red-50 text-[#94a3b8] hover:text-red-500 hover:scale-110 active:scale-90 transition-all cursor-pointer ml-2"
                    data-name="Delete Button"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <img
                      src="/images/figma/82f34279beaa4b89be7b1de448ff84f33585b42e.svg"
                      alt="Trash"
                      className="size-[20px] block pointer-events-none"
                    />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* 03 Drawer Footer - Checkout Actions with Shimmer CTA */}
        {items.length > 0 && (
          <div
            className="bg-white border-t border-[#e2e8f0] flex flex-col gap-[18px] items-start pb-[28px] pt-[20px] px-[24px] shrink-0 w-full shadow-xs"
            data-node-id="47:7519"
            data-name="03 Drawer Footer - Checkout Actions"
          >
            <div
              className="flex items-center justify-between w-full"
              data-node-id="47:7743"
              data-name="Total Row"
            >
              <div className="flex flex-col">
                <p
                  className="font-medium text-[#64748b] text-[14px]"
                  data-node-id="47:7744"
                >
                  Subtotal
                </p>
                <p className="text-[11px] text-[#94a3b8]">
                  Taxes &amp; shipping calculated at checkout
                </p>
              </div>
              <p
                className="font-bold text-[#0b1f3a] text-[22px]"
                data-node-id="47:7745"
              >
                £{itemsTotal.toFixed(2)}
              </p>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#162e52] flex h-[52px] items-center justify-center rounded-xl w-full text-white font-semibold text-[15px] transition-all shadow-md hover:shadow-xl group cursor-pointer"
              data-node-id="47:7746"
              data-name="Checkout Button"
            >
              <span>Proceed to Checkout</span>
              <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
