"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCustomer } from "@/context/CustomerContext"
import { useCart } from "@/components/cart/CartContext"
import { checkoutStatus, completeOrderCheckout, type CheckoutSession } from "@/lib/commerce-checkout"
import { trackPurchase } from "@/lib/tracking"

export default function CheckoutSuccessPage() {
  const { customer, token, isLoading, refreshCustomer } = useCustomer()
  const { clearCartIfUnchanged } = useCart()
  const [result, setResult] = useState<CheckoutSession | null>(null)
  const [message, setMessage] = useState("Confirming your order…")
  const [retry, setRetry] = useState(0)
  const [isChecking, setIsChecking] = useState<boolean>(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      setMessage("Sign in to view your order and payment confirmation.")
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

    const clearPurchasedSnapshot = (attemptId: string) => {
      try {
        const snapshot = sessionStorage.getItem(`peptech_checkout_cart:${attemptId}`)
        if (snapshot) clearCartIfUnchanged(snapshot)
        sessionStorage.removeItem(`peptech_checkout_cart:${attemptId}`)
        localStorage.removeItem("peptech_checkout_revision")
      } catch {}
    }

    const poll = async () => {
      try {
        if (!id) {
          if (legacy && /^cart_[A-Za-z0-9]+$/.test(legacy)) {
            await completeOrderCheckout(legacy, token)
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

        if (data.state === "awaiting_transfer") {
          setMessage(
            "Your order reference has been reserved. Please complete a UK Faster Payments transfer for the exact total shown below using your mandatory transfer reference. Cold-chain packing begins automatically once settlement clears."
          )
          clearPurchasedSnapshot(id)

          try {
            const ref = data.transferReference || data.orderNumber || data.attemptId
            const existingRaw = localStorage.getItem("peptech_bank_orders")
            const existing = existingRaw ? JSON.parse(existingRaw) : []
            const list = Array.isArray(existing) ? existing : []
            if (ref && !list.some((o: any) => o?.orderReference === ref)) {
              list.unshift({
                orderReference: ref,
                placedAt: new Date().toISOString(),
                total: data.total,
                currency: data.currency || "gbp",
                customer: customer
                  ? {
                      email: customer.email,
                      name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || undefined,
                    }
                  : undefined,
                items: (data.items || []).map((it, idx) => ({
                  id: `${ref}_${idx}`,
                  title: it.name,
                  price: it.unitPrice,
                  quantity: it.quantity,
                })),
              })
              localStorage.setItem("peptech_bank_orders", JSON.stringify(list.slice(0, 25)))
            }
          } catch {}

          void refreshCustomer()
          setIsChecking(false)
          return
        }

        if (data.state === "confirmed") {
          trackPurchase({
            transaction_id: String(data.orderNumber || data.orderId || data.attemptId),
            value: data.total,
            tax: data.tax,
            shipping: data.shipping,
            currency: data.currency || "GBP",
            items: (data.items || []).map((it) => ({
              item_id: it.name,
              item_name: it.name,
              price: it.unitPrice,
              quantity: it.quantity,
              subscription_type: it.recurring ? "28_day_subscription" : "one_time",
            })),
            customer: customer
              ? {
                  email: customer.email,
                  firstName: customer.first_name,
                  lastName: customer.last_name,
                  phone: customer.phone,
                }
              : undefined,
          })
          setMessage("Payment confirmed. Your order has been received; dispatch will be confirmed separately.")
          clearPurchasedSnapshot(id)
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
          setMessage("Checking order settlement status… Please wait.")
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

  const isAwaitingTransfer = result?.state === "awaiting_transfer"
  const isConfirmed = result?.state === "confirmed"
  const orderDisplayId =
    result?.transferReference || result?.orderNumber || result?.orderId || null
  const isConfirming = isChecking || result?.state === "processing" || (!result && !!token)
  const bank = result?.bankInstructions || null
  const hasBankAccountDetails = Boolean(bank?.account_name && bank?.sort_code && bank?.account_number)
  const formattedTotal = result
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: result.currency || "GBP" }).format(result.total)
    : null

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
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
              isAwaitingTransfer
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-teal-50 border-teal-200 text-[#16A6A3]"
            }`}
          >
            {isAwaitingTransfer ? (
              <svg className="w-6 h-6 stroke-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 stroke-[#16A6A3]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F3A]">
              {isAwaitingTransfer
                ? "Order Reserved — Awaiting Bank Transfer"
                : isConfirmed
                ? "Order Confirmed"
                : "Payment Confirmation"}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              PEPTECH® · RUO Certified Laboratory Order
            </p>
          </div>
        </div>

        {/* Status Message */}
        <p role="status" className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          {message}
        </p>

        {/* Order / Transfer Reference Box */}
        {orderDisplayId && (
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isAwaitingTransfer ? "Mandatory Payment Reference" : "Official Order Reference"}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A6A3] hover:text-[#128380] transition-colors cursor-pointer bg-white px-3 py-1.5 min-h-[36px] rounded-md border border-slate-200 hover:border-[#16A6A3]/40 shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                title="Copy Reference to clipboard"
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
                    <span>Copy Reference</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-[#0B1F3A] bg-white px-3.5 py-2.5 rounded-lg border border-slate-200/80 select-all break-all tracking-tight leading-relaxed">
              {orderDisplayId}
            </div>
            {isAwaitingTransfer && (
              <p className="text-[11.5px] text-amber-800 font-medium">
                Include <strong>{orderDisplayId}</strong> as your payment reference so our operations team can reconcile your transfer without delay.
              </p>
            )}
          </div>
        )}

        {/* UK Faster Payments Instructions (when awaiting transfer) */}
        {isAwaitingTransfer && (
          <div className="rounded-xl bg-[#F6F9FF] border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
                UK Faster Payments Transfer Details
              </h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Awaiting Settlement
              </span>
            </div>

            {hasBankAccountDetails ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {bank?.bank_name && (
                  <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                    <dt className="text-slate-500 text-[11px]">Bank Name</dt>
                    <dd className="font-semibold text-[#0B1F3A] mt-0.5">{bank.bank_name}</dd>
                  </div>
                )}
                <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                  <dt className="text-slate-500 text-[11px]">Account Name</dt>
                  <dd className="font-semibold text-[#0B1F3A] mt-0.5 select-all">{bank?.account_name}</dd>
                </div>
                <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                  <dt className="text-slate-500 text-[11px]">Sort Code</dt>
                  <dd className="font-mono font-bold text-[#0B1F3A] mt-0.5 select-all">{bank?.sort_code}</dd>
                </div>
                <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                  <dt className="text-slate-500 text-[11px]">Account Number</dt>
                  <dd className="font-mono font-bold text-[#0B1F3A] mt-0.5 select-all">{bank?.account_number}</dd>
                </div>
                {bank?.iban && (
                  <div className="bg-white rounded-lg border border-slate-200/80 p-2.5 sm:col-span-2">
                    <dt className="text-slate-500 text-[11px]">IBAN (International)</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] mt-0.5 select-all break-all">{bank.iban}</dd>
                  </div>
                )}
                {bank?.bic && (
                  <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                    <dt className="text-slate-500 text-[11px]">SWIFT / BIC</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] mt-0.5 select-all">{bank.bic}</dd>
                  </div>
                )}
                {formattedTotal && (
                  <div className="bg-white rounded-lg border border-slate-200/80 p-2.5">
                    <dt className="text-slate-500 text-[11px]">Exact Amount to Send</dt>
                    <dd className="font-mono font-extrabold text-[#0B1F3A] text-sm mt-0.5">{formattedTotal}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-3.5 text-xs text-slate-600 leading-relaxed">
                Transfer account credentials are managed securely by our compliance desk. If they do not appear in your order confirmation email, please write to{" "}
                <a href="mailto:support@peptech.bio" className="font-semibold text-[#16A6A3] underline">
                  support@peptech.bio
                </a>{" "}
                quoting reference <strong className="font-mono text-[#0B1F3A]">{orderDisplayId || result?.attemptId}</strong>.
              </div>
            )}

            {bank?.instructions && (
              <p className="text-[11.5px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/70">
                {bank.instructions}
              </p>
            )}
          </div>
        )}

        {/* Order & Logistics Financial Summary */}
        {result && (
          <div className="rounded-xl bg-slate-50/60 border border-slate-200/80 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Payment Status</span>
              {isAwaitingTransfer ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Awaiting Bank Transfer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified &amp; Paid
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Dispatch Logistics</span>
              <span className="font-medium text-[#0B1F3A]">
                {result.shippingOptionName || "Royal Mail Tracked (Cold-Chain)"}
              </span>
            </div>
            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {isAwaitingTransfer ? "Total Due via Transfer" : "Total Paid"}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#0B1F3A] font-mono">
                {formattedTotal}
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

        {/* Action CTAs for Confirmed OR Awaiting Bank Transfer */}
        {(isConfirmed || isAwaitingTransfer) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href={`/receipt/${encodeURIComponent(orderDisplayId || result?.orderId || "PEP-ORDER")}`}
              target="_blank"
              className="flex-1 min-h-[48px] bg-[#16A6A3] hover:bg-[#138e8b] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isAwaitingTransfer ? "View Proforma Invoice" : "View & Print Receipt"}</span>
            </Link>
            <Link
              href="/account?tab=orders"
              className="flex-1 min-h-[48px] bg-[#0B1F3A] hover:bg-[#162a45] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Account Orders</span>
            </Link>
          </div>
        )}

        {/* Confirmation Status Refresh Button */}
        {!isConfirmed && token && (
          <button
            type="button"
            onClick={() => {
              if (isConfirming) return
              setIsChecking(true)
              setRetry((v) => v + 1)
            }}
            disabled={isConfirming}
            className={`w-full min-h-[48px] rounded-xl py-3.5 px-4 font-semibold text-xs sm:text-sm transition-colors text-center flex items-center justify-center gap-2 ${
              isConfirming
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none"
                : "bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 cursor-pointer"
            }`}
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking Settlement Status…</span>
              </>
            ) : (
              <span>{isAwaitingTransfer ? "Refresh Transfer Settlement Status" : "Check Confirmation Status"}</span>
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
