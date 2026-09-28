"use client"

import React, { useEffect, useState, useCallback } from "react"
import { commerceRequest } from "@/lib/stripe-checkout"
import { VisaBadge, MastercardBadge, AmexBadge, JcbBadge } from "@/components/ui/PaymentBadges"
import { SubscriptionDashboard } from "@/components/account/SubscriptionDashboard"
import Link from "next/link"

function CardBrandBadge({ brand, className = "w-[36px] h-[22px]" }: { brand?: string; className?: string }) {
  const b = (brand || "").toLowerCase()
  if (b.includes("mastercard") || b.includes("mc")) {
    return <MastercardBadge className={className} monochrome />
  }
  if (b.includes("amex") || b.includes("american express")) {
    return <AmexBadge className={className} monochrome />
  }
  if (b.includes("jcb")) {
    return <JcbBadge className={className} monochrome />
  }
  return <VisaBadge className={className} monochrome />
}

import { useCustomer } from "@/context/CustomerContext"

export function AccountBilling({
  token,
  customerId,
  customerEmail,
  customerName,
  customerAddresses,
  initialPaymentMethods,
  initialSubscriptions,
  subscriptionsOnly = false,
}: {
  token?: string | null
  customerId?: string | null
  customerEmail?: string | null
  customerName?: string | null
  customerAddresses?: any[]
  initialPaymentMethods?: any[]
  initialSubscriptions?: any[]
  subscriptionsOnly?: boolean
}) {
  const { customer, token: ctxToken } = useCustomer()
  const [subscriptions, setSubscriptions] = useState<any[]>(() => initialSubscriptions || [])
  const [paymentMethods, setPaymentMethods] = useState<any[]>(() => initialPaymentMethods || [])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(() => !initialPaymentMethods)
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(() => !initialSubscriptions)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [busy, setBusy] = useState("")
  const [dates, setDates] = useState<Record<string, string>>({})

  // Sync props from parent if passed
  useEffect(() => {
    if (initialPaymentMethods !== undefined) {
      setPaymentMethods(initialPaymentMethods)
      setIsLoadingPaymentMethods(false)
    }
  }, [initialPaymentMethods])

  useEffect(() => {
    if (initialSubscriptions !== undefined) {
      setSubscriptions(initialSubscriptions)
      setIsLoadingSubscriptions(false)
    }
  }, [initialSubscriptions])

  const fetchPaymentMethods = useCallback(async () => {
    if (subscriptionsOnly) return
    setIsLoadingPaymentMethods(true)
    const activeToken = token || ctxToken || (typeof window !== "undefined" ? localStorage.getItem("peptech_customer_token") : null)
    const effectiveCustId = customerId || customer?.id || ""
    const queryStr = effectiveCustId ? `?customer_id=${encodeURIComponent(effectiveCustId)}` : ""

    try {
      const res = await commerceRequest(`/store/custom/payment-methods${queryStr}`, activeToken)
      if (Array.isArray(res?.payment_methods)) {
        const seen = new Set<string>()
        const deduped = res.payment_methods.filter((pm: any) => {
          const key = `${pm.brand}_${pm.last4}_${pm.exp_month || ""}_${pm.exp_year || ""}`.toLowerCase()
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setPaymentMethods(deduped)
      }
    } catch (e: any) {
      console.warn("Could not load payment methods", e)
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }, [token, ctxToken, customerId, customer?.id, subscriptionsOnly])

  const fetchSubscriptions = useCallback(async () => {
    setIsLoadingSubscriptions(true)
    const activeToken = token || ctxToken || (typeof window !== "undefined" ? localStorage.getItem("peptech_customer_token") : null)
    const effectiveCustId = customerId || customer?.id || ""
    const queryStr = effectiveCustId ? `?customer_id=${encodeURIComponent(effectiveCustId)}` : ""

    try {
      const res = await commerceRequest(`/store/custom/subscriptions${queryStr}`, activeToken)
      if (Array.isArray(res?.subscriptions)) {
        setSubscriptions(res.subscriptions)
      }
    } catch (e: any) {
      if (subscriptionsOnly) {
        setError(e instanceof Error ? e.message : "Failed to load subscriptions")
      }
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }, [token, ctxToken, customerId, customerEmail, customer?.id, customer?.email, subscriptionsOnly])

  useEffect(() => {
    if (subscriptionsOnly) {
      if (initialSubscriptions === undefined) fetchSubscriptions()
    } else {
      if (initialPaymentMethods === undefined) fetchPaymentMethods()
      if (initialSubscriptions === undefined) fetchSubscriptions()
    }
  }, [token, subscriptionsOnly, initialSubscriptions, initialPaymentMethods, fetchSubscriptions, fetchPaymentMethods])

  const command = async (id: string, action: string) => {
    if (busy) return
    if (action === "cancel" && !window.confirm("Cancel future renewals? Already paid orders are handled separately.")) return
    setBusy(id)
    setError("")
    setSuccessMsg("")

    const storageKey = `peptech_subscription_command:${id}:${action}:${action === "change_date" ? dates[id] : ""}`
    let operation = sessionStorage.getItem(storageKey)
    if (!operation) {
      operation = crypto.randomUUID()
      sessionStorage.setItem(storageKey, operation)
    }

    try {
      const result = await commerceRequest(
        "/store/custom/subscriptions",
        token,
        {
          subscription_id: id,
          operation_id: operation,
          action,
          ...(action === "change_date" ? { date: new Date(`${dates[id]}T12:00:00Z`).toISOString() } : {}),
        },
        "PUT"
      )
      setSubscriptions((old) => old.map((s) => (s.id === id ? result.subscription : s)))
      sessionStorage.removeItem(storageKey)
      setSuccessMsg(`Subscription action "${action}" completed successfully.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update subscription")
    } finally {
      setBusy("")
    }
  }

  const removePaymentMethod = async (pmId: string) => {
    if (busy) return
    if (!window.confirm("Remove this saved payment method from your account?")) return
    setBusy(pmId)
    setError("")
    setSuccessMsg("")
    try {
      await commerceRequest(
        "/store/custom/payment-methods",
        token,
        { payment_method_id: pmId },
        "DELETE"
      )
      setPaymentMethods((old) => old.filter((pm) => pm.id !== pmId))
      setSuccessMsg("Payment method detached successfully.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove payment method")
    } finally {
      setBusy("")
    }
  }

  const portal = async () => {
    setBusy("portal")
    setError("")
    try {
      const result = await commerceRequest("/store/custom/billing-portal", token, {})
      if (result?.url) {
        window.location.assign(result.url)
      } else {
        setError("Billing portal is currently unreachable.")
        setBusy("")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Billing portal is currently unavailable")
      setBusy("")
    }
  }

  // If subscriptionsOnly tab
  if (subscriptionsOnly) {
    return <SubscriptionDashboard token={token} />
  }

  // Default: Payment Methods Tab
  return (
    <div className="flex flex-col gap-[24px] w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#0b1f3a] text-[18px]">
            Saved Payment Methods
          </h2>
          <p className="font-normal text-[#64748b] text-[13px] mt-0.5">
            Manage saved cards, default billing methods, and payment preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={portal}
          disabled={!!busy}
          className="bg-[#0b1f3a] hover:bg-[#162a45] text-white font-semibold text-[13px] px-[16px] py-[10px] rounded-[6px] transition-colors cursor-pointer shrink-0 disabled:opacity-50 inline-flex items-center gap-2 shadow-xs"
        >
          <svg className="w-4 h-4 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{busy === "portal" ? "Redirecting..." : "Manage in Stripe Portal ↗"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-[10px]">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-[#e6fffa] border border-[#16a6a3] text-[#0b1f3a] text-xs font-semibold p-3.5 rounded-[10px]">
          ✓ {successMsg}
        </div>
      )}

      {/* Payment Methods List */}
      {isLoadingPaymentMethods ? (
        <div className="bg-white rounded-[16px] p-8 border border-slate-100 flex items-center justify-center text-[#64748b] text-sm">
          Loading payment cards...
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="bg-white rounded-[16px] p-8 border border-slate-100 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#0b1f3a]">
            <svg className="w-6 h-6 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-[#0b1f3a] text-[16px]">No Saved Cards Found</h3>
          <p className="text-[#64748b] text-[13px] max-w-[480px]">
            Payment cards used during checkout are automatically saved and tokenised for seamless reorders and subscriptions. You can also securely add a payment method via the customer billing portal.
          </p>
          <button
            type="button"
            onClick={portal}
            disabled={!!busy}
            className="mt-2 bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Add Card via Secure Portal ↗</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((pm, idx) => (
            <div
              key={pm.id}
              className={`bg-white rounded-[16px] p-6 border transition-all flex flex-col justify-between gap-4 ${
                pm.is_default || idx === 0
                  ? "border-[#16a6a3]/40 shadow-xs ring-1 ring-[#16a6a3]/20"
                  : "border-slate-100 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CardBrandBadge brand={pm.brand} className="w-[42px] h-[26px]" />
                  <div>
                    <p className="font-bold text-[#0b1f3a] text-[14.5px] capitalize">
                      {pm.brand} {pm.funding || "card"}
                    </p>
                    <p className="font-mono text-[13px] text-[#475569] font-medium">
                      •••• •••• •••• {pm.last4}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {(pm.is_default || idx === 0) && (
                    <span className="bg-[#e6fffa] border border-[#16a6a3] text-[#0b1f3a] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                      DEFAULT
                    </span>
                  )}
                  <span className="bg-slate-50 border border-slate-200 text-[#16a6a3] text-[10px] font-medium px-2 py-0.5 rounded-[4px]">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-center justify-between text-[12px] text-[#64748b]">
                <span>
                  {pm.expiry && pm.expiry !== "Verified" ? `Expires: ${pm.expiry}` : pm.exp_month && pm.exp_year ? `Expires: ${String(pm.exp_month).padStart(2, "0")}/${String(pm.exp_year).slice(-2)}` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={portal}
                  disabled={!!busy}
                  className="text-[12px] font-semibold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors cursor-pointer"
                >
                  Edit Billing Details ↗
                </button>
                <button
                  type="button"
                  onClick={() => removePaymentMethod(pm.id)}
                  disabled={busy === pm.id}
                  className="text-[12px] font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {busy === pm.id ? "Removing..." : "Remove Card"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
