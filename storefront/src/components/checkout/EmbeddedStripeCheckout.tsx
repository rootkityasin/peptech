"use client"

import React, { useMemo } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"

interface EmbeddedStripeCheckoutProps {
  clientSecret: string
  publishableKey?: string
  onClose?: () => void
}

export function EmbeddedStripeCheckout({
  clientSecret,
  publishableKey,
  onClose,
}: EmbeddedStripeCheckoutProps) {
  const activeKey = publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  const stripePromise = useMemo(() => {
    if (!activeKey) return null
    return loadStripe(activeKey)
  }, [activeKey])

  if (!activeKey || !stripePromise) {
    return (
      <div className="p-6 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        Stripe configuration is missing or pending initialization.
      </div>
    )
  }

  return (
    <div id="stripe-embedded-checkout" className="w-full min-h-[380px] animate-in fade-in duration-300">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout className="w-full" />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
