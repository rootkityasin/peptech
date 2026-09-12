"use client"

import React from "react"
import Link from "next/link"
import { useCart } from "./CartContext"

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isDrawerOpen,
    setIsDrawerOpen,
    subtotal,
    shippingCost,
    total,
    destination,
    setDestination,
  } = useCart()

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-[var(--color-foreground)]">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-base font-bold tracking-tight">Your Research Order</h2>
              <p className="text-xs text-zinc-500">Royal Mail Tracked • Discreet Outer Box</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-4xl">🛒</div>
                <h3 className="font-semibold text-sm">Your order is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Browse our Complete Pen Sets, Refill Cartridges, or Freeze-Dried Vials to get started.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--color-brand-navy)] text-white hover:bg-[var(--color-brand-slate)]"
                  >
                    Start Browsing
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const effectivePrice =
                  item.isSubscription && item.discountPercent
                    ? item.price * (1 - item.discountPercent / 100)
                    : item.price

                return (
                  <div
                    key={`${item.id}-${item.isSubscription}`}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              item.format === "pen-set"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : item.format === "refill"
                                ? "bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]"
                                : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                            }`}
                          >
                            {item.format === "pen-set"
                              ? "Pen Set"
                              : item.format === "refill"
                              ? "Refill"
                              : "Vial"}
                          </span>
                          {item.isSubscription && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Subscribe &amp; Save (28 Days)
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>Strength: <strong className="text-zinc-700 dark:text-zinc-300">{item.strength}</strong></span>
                          {item.batch && <span>• Batch: <span className="font-mono">{item.batch}</span></span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.isSubscription)}
                        className="text-zinc-400 hover:text-red-500 text-xs p-1"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-zinc-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.isSubscription, -1)}
                          className="px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.isSubscription, 1)}
                          className="px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        {item.isSubscription && item.discountPercent ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] line-through text-zinc-400">
                              £{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="font-bold text-xs text-[var(--color-brand-teal)]">
                              £{(effectivePrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xs">
                            £{(effectivePrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <div className="text-[10px] text-zinc-500">
                          {item.isSubscription ? "Renews every 28 days" : "One-time purchase"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3.5">
              {/* Shipping Destination Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Delivery Destination:</span>
                  <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded">
                    <button
                      onClick={() => setDestination("UK")}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        destination === "UK"
                          ? "bg-white dark:bg-zinc-900 text-[var(--color-brand-navy)] shadow-xs"
                          : "text-zinc-500"
                      }`}
                    >
                      UK Tracked (£4.95)
                    </button>
                    <button
                      onClick={() => setDestination("INTL")}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        destination === "INTL"
                          ? "bg-white dark:bg-zinc-900 text-[var(--color-brand-navy)] shadow-xs"
                          : "text-zinc-500"
                      }`}
                    >
                      Worldwide (£15.00)
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Calculations */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Royal Mail Tracked</span>
                  <span>£{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Total Due</span>
                  <span className="text-[var(--color-brand-teal)] font-mono text-base">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Discreet Packaging Guarantee */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                <span>📦</span>
                <span>Plain, protective outer packaging with zero peptide branding.</span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3 rounded-lg bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold text-sm text-center block transition-all shadow-md"
              >
                Proceed to Secure Checkout →
              </Link>

              <div className="text-center text-[10px] text-zinc-400">
                18+ Laboratory Research Only • Authorize.Net 3DS / Faster Payments
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
