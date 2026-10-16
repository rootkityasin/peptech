"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCustomer } from "@/context/CustomerContext"
import { useCart } from "@/components/cart/CartContext"
import { checkoutStatus, completeStripeCheckout, type CheckoutSession } from "@/lib/stripe-checkout"

export default function CheckoutSuccessPage() {
  const { customer, token, isLoading, refreshCustomer } = useCustomer()
  const { clearCartIfUnchanged } = useCart()
  const [result, setResult] = useState<CheckoutSession | null>(null)
  const [message, setMessage] = useState("Confirming your order…")
  const [retry, setRetry] = useState(0)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      setMessage("Sign in to view your payment confirmation.")
      setIsChecking(false)
      return
    }
    const params = new URLSearchParams(window.location.search)
    const id = params.get("attempt_id")
    const legacy = params.get("cart_id")
    let active = true
    let timer: ReturnType<typeof setTimeout>
    let count = 0
    setIsChecking(true)

    const poll = async () => {
      try {
        if (!id) {
          if (legacy && /^cart_[A-Za-z0-9]+$/.test(legacy)) {
            await completeStripeCheckout(legacy, token)
            if (active) {
              setMessage("Your order is confirmed. View it in your account.")
              setIsChecking(false)
            }
            return
          }
          if (active) {
            setMessage("No checkout reference was supplied.")
            setIsChecking(false)
          }
          return
        }
        const data = await checkoutStatus(id, token)
        if (!active) return
        setResult(data)
        if (data.state === "confirmed") {
          setMessage("Payment confirmed. Your order has been received; dispatch will be confirmed separately.")
          const snapshot = sessionStorage.getItem(`peptech_checkout_cart:${id}`)
          if (snapshot) clearCartIfUnchanged(snapshot)
          sessionStorage.removeItem(`peptech_checkout_cart:${id}`)
          void refreshCustomer()
          setIsChecking(false)
          return
        }
        if (["expired", "failed"].includes(data.state)) {
          setMessage("This checkout has expired or failed. Check your account before placing another order.")
          setIsChecking(false)
          return
        }
        setMessage("Payment confirmation is processing. You can safely leave this page and check your account later.")
        if (++count < 30) {
          timer = setTimeout(poll, 3000)
        } else {
          setIsChecking(false)
        }
      } catch (error) {
        if (active) {
          setMessage("Confirming your payment with the banking network… Please wait.")
          if (++count < 30) {
            timer = setTimeout(poll, 3000)
          } else {
            setMessage(error instanceof Error ? error.message : "Confirmation is pending. Please check your account.")
            setIsChecking(false)
          }
        }
      }
    }
    void poll()
    return () => {
      active = false
      clearTimeout(timer)
    }
    // Cleanup is intentionally based on the purchased snapshot, not current cart state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading, retry])

  const orderDisplayId = result?.orderId || result?.orderNumber || null
  const isConfirming = isChecking || result?.state === "processing" || (!result && !!token)

  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    if (!orderDisplayId) return
    navigator.clipboard.writeText(orderDisplayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-slate-50/60 text-[#0B1F3A]">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/80 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#16A6A3] shrink-0 shadow-xs">
            <svg className="w-6 h-6 stroke-[#16A6A3]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">
              {result?.state === "confirmed" ? "Order Confirmed" : "Payment Confirmation"}
            </h1>
            <p className="text-xs font-medium text-slate-500">PEPTECH LTD · RUO Certified Laboratory Order</p>
          </div>
        </div>

        {/* Status Message */}
        <p role="status" className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          {message}
        </p>

        {/* Order Reference Box with Dedicated Monospace Pill & Copy Action */}
        {orderDisplayId && (
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Official Order Reference
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A6A3] hover:text-[#128380] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-[#16A6A3]/40 shadow-2xs"
                title="Copy Order ID to clipboard"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-[#0B1F3A] bg-white px-3.5 py-2.5 rounded-lg border border-slate-200/80 select-all break-all tracking-tight leading-relaxed">
              {orderDisplayId}
            </div>
          </div>
        )}

        {/* Verified Payment & Logistics Summary */}
        {result && (
          <div className="rounded-xl bg-slate-50/60 border border-slate-200/80 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Payment Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified &amp; Paid
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Dispatch Logistics</span>
              <span className="font-medium text-[#0B1F3A]">Royal Mail Tracked (Cold-Chain)</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Total Paid</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#0B1F3A]">
                {new Intl.NumberFormat("en-GB", { style: "currency", currency: result.currency }).format(result.total)}
              </span>
            </div>
          </div>
        )}

        {/* Protocol Renewal Note */}
        {result?.renewalTotal ? (
          <div className="text-xs text-slate-700 bg-teal-50/60 p-3 rounded-xl border border-teal-200/80 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#16A6A3] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="leading-relaxed">
              <strong className="text-[#0B1F3A]">Automated Protocol Renewal:</strong> £{result.renewalTotal.toFixed(2)} every 28 days. You can pause, skip, or modify renewals anytime in your researcher account.
            </p>
          </div>
        ) : null}

        {/* Action CTAs */}
        {result?.state === "confirmed" && (
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href={`/receipt/${encodeURIComponent(orderDisplayId || result?.orderId || "PEP-CONFIRMED")}`}
              target="_blank"
              className="flex-1 bg-[#16A6A3] hover:bg-[#138e8b] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View &amp; Print Receipt</span>
            </Link>
            <Link
              href="/account?tab=orders"
              className="flex-1 bg-[#0B1F3A] hover:bg-[#162a45] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Account Orders</span>
            </Link>
          </div>
        )}

        {/* Confirmation Status Polling Button */}
        {result?.state !== "confirmed" && token && (
          <button
            onClick={() => {
              if (isConfirming) return
              setIsChecking(true)
              setRetry((v) => v + 1)
            }}
            disabled={isConfirming}
            className={`w-full rounded-xl py-3.5 px-4 font-semibold text-xs sm:text-sm transition-colors text-center flex items-center justify-center gap-2 ${
              isConfirming
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none"
                : "bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 cursor-pointer"
            }`}
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking Confirmation Status…</span>
              </>
            ) : (
              <span>Check Confirmation Status</span>
            )}
          </button>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B1F3A] font-semibold transition-colors"
          >
            <span>←</span>
            <span>Return to Store Catalogue</span>
          </Link>
          <a
            href="mailto:support@peptech.bio"
            className="text-slate-500 hover:text-[#16A6A3] transition-colors"
          >
            Need assistance? <span className="font-semibold text-slate-700 underline">support@peptech.bio</span>
          </a>
        </div>

        {!token && (
          <div className="text-center pt-1">
            <Link href="/account" className="text-xs font-semibold underline text-[#16A6A3] hover:text-[#138e8b]">
              Sign in to your researcher account
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

