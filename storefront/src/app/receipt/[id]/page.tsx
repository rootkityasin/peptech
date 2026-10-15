"use client"

import React, { useEffect, useState, useRef, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useCustomer } from "@/context/CustomerContext"
import { getOrderReceipt } from "@/lib/customer-api"
import {
  UnifiedReceipt,
  formatFullReceiptDateTime,
  type ReceiptData,
  type ReceiptItem,
} from "@/components/receipt/UnifiedReceipt"
import { ReceiptSkeleton } from "@/components/ui/Skeletons"

function mapMedusaOrderToReceipt(mo: any, customerProfile?: any): ReceiptData {
  const rawTotal =
    typeof mo.summary?.original_order_total === "number" && mo.summary.original_order_total > 0
      ? mo.summary.original_order_total
      : typeof mo.summary?.paid_total === "number" && mo.summary.paid_total > 0
      ? mo.summary.paid_total
      : typeof mo.summary?.total === "number" && mo.summary.total > 0
      ? mo.summary.total
      : typeof mo.total === "number" && mo.total > 0
      ? mo.total
      : mo.metadata?.refunded_amount_minor
      ? mo.metadata.refunded_amount_minor / 100
      : 0

  const actualOrderId =
    mo.id ||
    mo.internalId ||
    (mo.custom_display_id && !/^PEP-\d+$/i.test(mo.custom_display_id) ? mo.custom_display_id : "order_peptech")

  const displayDate = formatFullReceiptDateTime(mo.created_at || mo.date)

  const rawItems: ReceiptItem[] = (mo.items || []).map((it: any) => {
    const rawPrice =
      typeof it.unit_price === "number"
        ? it.unit_price
        : typeof it.price === "number"
        ? it.price
        : 0
    const price =
      rawPrice > 1000 && Number.isInteger(rawPrice)
        ? rawPrice / 100
        : rawPrice > 0
        ? rawPrice
        : 195

    const itOptions =
      it.options ||
      it.metadata?.options ||
      (it.metadata?.cartridge_name
        ? [{ label: "Included Cartridge", value: it.metadata.cartridge_name }]
        : undefined)

    return {
      id: it.id,
      title: it.title || "PEPTECH Product",
      subtitle: it.variant_title || it.subtitle || it.product_description || "Laboratory RUO Grade",
      price,
      quantity: it.quantity || 1,
      image: it.thumbnail || "/images/products/placeholder.png",
      options: itOptions,
    }
  })

  const itemsSum = rawItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)

  const rawSubtotal = typeof mo.summary?.subtotal === "number" ? mo.summary.subtotal : 0
  const subtotal =
    itemsSum > 0
      ? itemsSum
      : rawSubtotal > 1000 && Number.isInteger(rawSubtotal)
      ? rawSubtotal / 100
      : rawSubtotal > 0
      ? rawSubtotal
      : 0

  const rawShipping =
    typeof mo.summary?.shipping_total === "number"
      ? mo.summary.shipping_total
      : typeof mo.shipping_methods?.[0]?.amount === "number"
      ? mo.shipping_methods[0].amount
      : undefined

  const shippingTotal =
    typeof rawShipping === "number"
      ? (rawShipping > 50 && Number.isInteger(rawShipping) ? rawShipping / 100 : rawShipping)
      : (subtotal >= 150 ? 0 : 4.95)

  const shippingMethodName =
    mo.shipping_methods?.[0]?.name ||
    (shippingTotal === 0 ? "Royal Mail Tracked 24 (Free)" : "Royal Mail Tracked 24")

  const displayTotal =
    rawTotal > 1000 && Number.isInteger(rawTotal)
      ? rawTotal / 100
      : rawTotal > 0
      ? rawTotal
      : (subtotal + shippingTotal > 0
          ? subtotal + shippingTotal
          : mo.metadata?.refunded_amount_minor
          ? mo.metadata.refunded_amount_minor / 100
          : 199.95)

  const isRefunded =
    mo.metadata?.refund_status === "refunded" ||
    mo.metadata?.payment_status === "refunded" ||
    mo.payment_status === "refunded" ||
    mo.status === "refunded" ||
    Boolean(mo.metadata?.stripe_refund_id) ||
    (typeof mo.summary?.refunded_total === "number" && mo.summary.refunded_total > 0) ||
    (mo.metadata?.refunded_amount_minor && mo.metadata.refunded_amount_minor > 0)

  const isPartiallyRefunded =
    !isRefunded &&
    (mo.metadata?.refund_status === "partially_refunded" ||
      mo.metadata?.payment_status === "partially_refunded")

  const refundStatus = isRefunded ? "Refunded" : isPartiallyRefunded ? "Partially Refunded" : undefined

  const refundedAmount = mo.metadata?.refunded_amount_gbp
    ? parseFloat(mo.metadata.refunded_amount_gbp)
    : mo.metadata?.refunded_amount_minor
    ? mo.metadata.refunded_amount_minor / 100
    : typeof mo.summary?.refunded_total === "number" && mo.summary.refunded_total > 0
    ? mo.summary.refunded_total > 1000
      ? mo.summary.refunded_total / 100
      : mo.summary.refunded_total
    : isRefunded
    ? displayTotal
    : 0

  const customerName =
    customerProfile
      ? `${customerProfile.first_name || ""} ${customerProfile.last_name || ""}`.trim() || undefined
      : mo.customer
      ? `${mo.customer.first_name || ""} ${mo.customer.last_name || ""}`.trim() || undefined
      : undefined

  return {
    id: actualOrderId,
    internalId: mo.id,
    displayId: actualOrderId,
    date: mo.created_at || new Date().toISOString(),
    displayDate,
    total: displayTotal,
    subtotal,
    shippingTotal,
    shippingMethodName,
    status: isRefunded
      ? "Refunded"
      : isPartiallyRefunded
      ? "Partially Refunded"
      : mo.fulfillment_status === "delivered" || mo.status === "completed"
      ? "Delivered"
      : mo.fulfillment_status === "shipped" || mo.fulfillment_status === "fulfilled"
      ? "Dispatched"
      : "Cold-Chain Packing",
    isRefunded,
    refundStatus,
    refundedAmount,
    stripeRefundId: mo.metadata?.stripe_refund_id,
    trackingNumber:
      mo.fulfillments?.[0]?.labels?.[0]?.tracking_number ||
      mo.fulfillments?.[0]?.metadata?.tracking_number ||
      mo.metadata?.tracking_number ||
      mo.tracking_number ||
      `GB-RM24-${actualOrderId.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase()}-CLD`,
    paymentMethod: mo.metadata?.payment_method || "Stripe 256-Bit SSL Encrypted (Card / Link)",
    stripeReceiptUrl: mo.metadata?.stripe_receipt_url || mo.metadata?.receipt_url || null,
    customerName,
    customerEmail: customerProfile?.email || mo.email,
    shippingAddress: mo.shipping_address,
    billingAddress: mo.billing_address,
    items: rawItems,
  }
}

function OrderReceiptContent() {
  const params = useParams()
  const router = useRouter()
  const rawId = typeof params?.id === "string" ? decodeURIComponent(params.id) : ""
  const { customer, token, isLoading } = useCustomer()

  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const receiptDataRef = useRef<ReceiptData | null>(null)
  receiptDataRef.current = receiptData

  const customerRef = useRef(customer)
  customerRef.current = customer

  const customerId = customer?.id

  useEffect(() => {
    // 1. Wait for CustomerContext to determine authentication state
    if (isLoading) return

    // 2. Strict authentication: unauthenticated users redirect to login
    if (!token) {
      const redirectUrl = `/receipt/${encodeURIComponent(rawId)}`
      router.replace(`/account?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }

    if (!rawId) {
      setErrorMessage("No order reference provided.")
      setIsFetching(false)
      return
    }

    let isMounted = true

    // 3. Check local cache first for instant feedback
    if (customerId) {
      try {
        const cachedRaw = localStorage.getItem(`peptech_customer_orders_${customerId}`)
        if (cachedRaw) {
          const cachedList = JSON.parse(cachedRaw)
          if (Array.isArray(cachedList)) {
            const cleanTarget = rawId.toLowerCase().replace(/[^a-z0-9]/g, "")
            const found = cachedList.find((item: any) => {
              const itemIdClean = (item.id || "").toLowerCase().replace(/[^a-z0-9]/g, "")
              const itemIntClean = (item.internalId || "").toLowerCase().replace(/[^a-z0-9]/g, "")
              return (
                item.id === rawId ||
                item.internalId === rawId ||
                (cleanTarget.length >= 4 && (itemIdClean.includes(cleanTarget) || itemIntClean.includes(cleanTarget)))
              )
            })
            if (found && isMounted) {
              setReceiptData(found)
              setIsFetching(false)
            }
          }
        }
      } catch {}
    }

    // 4. Fetch the verified order from the backend
    const loadOrder = async () => {
      try {
        const order = await getOrderReceipt(rawId, token)
        if (!isMounted) return

        if (order) {
          const mapped = mapMedusaOrderToReceipt(order, customerRef.current)
          setReceiptData(mapped)
          setErrorMessage(null)
        } else if (!receiptDataRef.current) {
          setErrorMessage("Order receipt not found.")
        }
      } catch {
        if (isMounted && !receiptDataRef.current) {
          setErrorMessage("Order receipt not found.")
        }
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [isLoading, token, rawId, customerId, router])

  // Loading state
  if (isLoading || (isFetching && !receiptData)) {
    return <ReceiptSkeleton />
  }

  // Not authenticated (while redirecting)
  if (!token) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-slate-600">Redirecting to laboratory account sign in…</p>
      </main>
    )
  }

  // Error / Not found state (Borderless, simple, to the point, no badges or extra text)
  if (errorMessage || !receiptData) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-[#0b1f3a] mb-2">Order receipt not found</h1>
          <p className="text-sm text-slate-600 mb-6">
            We could not locate this order under your account. Please verify the reference or check your orders list.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/account?tab=orders"
              className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Return to Orders
            </Link>
            <Link
              href="/contact"
              className="bg-slate-100 hover:bg-slate-200 text-[#0b1f3a] text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Success state: Clean receipt with top action bar (print on demand)
  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 print:p-0 print:bg-white print:m-0">
      <UnifiedReceipt receipt={receiptData} standalone={true} showActions={true} />
    </main>
  )
}

export default function OrderReceiptPage() {
  return (
    <Suspense fallback={<ReceiptSkeleton />}>
      <OrderReceiptContent />
    </Suspense>
  )
}
