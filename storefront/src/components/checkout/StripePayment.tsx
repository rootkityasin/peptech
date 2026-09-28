"use client"
import type {CheckoutSession} from "@/lib/stripe-checkout"
export function StripePayment({session}:{session:CheckoutSession;token:string}) {
  if(session.checkoutUrl) return <a href={session.checkoutUrl} className="block rounded-xl bg-[#0B1F3A] p-3 text-center font-semibold text-white">Continue to Stripe Checkout</a>
  return <a className="underline" href={`/checkout/success?attempt_id=${encodeURIComponent(session.attemptId)}`}>View payment status</a>
}
