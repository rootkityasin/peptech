"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCustomer } from "@/context/CustomerContext"
import { useCart } from "@/components/cart/CartContext"
import { checkoutStatus, completeStripeCheckout, type CheckoutSession } from "@/lib/stripe-checkout"

export default function CheckoutSuccessPage() {
  const { customer, token, isLoading } = useCustomer()
  const { clearCartIfUnchanged } = useCart()
  const [result, setResult] = useState<CheckoutSession | null>(null)
  const [message, setMessage] = useState("Confirming your order…")
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      setMessage("Sign in to view your payment confirmation.")
      return
    }
    const params = new URLSearchParams(window.location.search)
    const id = params.get("attempt_id")
    const legacy = params.get("cart_id")
    let active = true
    let timer: ReturnType<typeof setTimeout>
    let count = 0

    const poll = async () => {
      try {
        if (!id) {
          if (legacy && /^cart_[A-Za-z0-9]+$/.test(legacy)) {
            await completeStripeCheckout(legacy, token)
            if (active) setMessage("Your order is confirmed. View it in your account.")
            return
          }
          if (active) setMessage("No checkout reference was supplied.")
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
          return
        }
        if (["expired", "failed"].includes(data.state)) {
          setMessage("This checkout has expired or failed. Check your account before placing another order.")
          return
        }
        setMessage("Payment confirmation is processing. You can safely leave this page and check your account later.")
        if (++count < 30) timer = setTimeout(poll, 3000)
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Confirmation is pending.")
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

  const orderDisplayId = result?.orderNumber || (result?.orderId ? (result.orderId.startsWith("order_") ? `PEP-${result.orderId.replace(/^order_/, "").slice(0, 6).toUpperCase()}` : result.orderId) : null)

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col justify-center gap-6 px-6 py-16 text-[#0B1F3A]">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-200">
            ✓
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">
              {result?.state === "confirmed" ? "Order Confirmed" : "Payment Confirmation"}
            </h1>
            <p className="text-xs text-slate-500">PEPTECH® Bio Ltd · RUO Certified</p>
          </div>
        </div>

        <p role="status" className="text-sm text-slate-700 leading-relaxed">
          {message}
        </p>

        {orderDisplayId && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Official Order Reference:
            </span>
            <span className="font-mono font-bold text-[#0B1F3A] text-sm">{orderDisplayId}</span>
          </div>
        )}

        {result && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-600">Total Paid:</span>
            <span className="text-xl font-bold text-[#0B1F3A]">
              {new Intl.NumberFormat("en-GB", { style: "currency", currency: result.currency }).format(result.total)}
            </span>
          </div>
        )}

        {result?.renewalTotal ? (
          <p className="text-xs text-slate-600 bg-teal-50/60 p-2.5 rounded-lg border border-teal-100">
            Automated Protocol Renewal: £{result.renewalTotal.toFixed(2)} every 28 days.
          </p>
        ) : null}

        {result?.state === "confirmed" && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/receipt/${encodeURIComponent(orderDisplayId || result?.orderId || "PEP-CONFIRMED")}`}
              target="_blank"
              className="flex-1 bg-[#16A6A3] hover:bg-[#138e8b] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View &amp; Print Receipt ↗
            </Link>
            <Link
              href="/account?tab=orders"
              className="flex-1 bg-[#0B1F3A] hover:bg-[#162a45] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors text-center flex items-center justify-center shadow-xs"
            >
              Account Orders →
            </Link>
          </div>
        )}

        {result?.state !== "confirmed" && token && (
          <button
            onClick={() => setRetry((v) => v + 1)}
            className="rounded-xl bg-[#0B1F3A] p-3 text-white font-medium hover:bg-opacity-95 transition-colors text-xs"
          >
            Check Confirmation Status
          </button>
        )}

        <div className="flex gap-4 pt-3 border-t border-slate-100 text-xs">
          <Link href="/account?tab=orders" className="text-[#16A6A3] font-medium hover:underline">
            Account Dashboard
          </Link>
          <Link href="/" className="text-slate-600 hover:underline">
            Return to Store
          </Link>
        </div>

        {!token && (
          <Link href="/account" className="text-xs underline text-[#16A6A3]">
            Sign in to your researcher account
          </Link>
        )}
      </div>
    </main>
  )
}

