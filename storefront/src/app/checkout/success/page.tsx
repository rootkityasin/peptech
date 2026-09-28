"use client"
import {useEffect,useState} from "react"
import Link from "next/link"
import {useCustomer} from "@/context/CustomerContext"
import {useCart} from "@/components/cart/CartContext"
import {checkoutStatus,completeStripeCheckout,type CheckoutSession} from "@/lib/stripe-checkout"
export default function CheckoutSuccessPage() {
  const {token,isLoading}=useCustomer();const {clearCartIfUnchanged}=useCart()
  const [result,setResult]=useState<CheckoutSession|null>(null);const [message,setMessage]=useState("Confirming your order…")
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    if(isLoading) return
    if(!token) {setMessage("Sign in to view your payment confirmation.");return}
    const params=new URLSearchParams(window.location.search);const id=params.get("attempt_id");const legacy=params.get("cart_id")
    let active=true;let timer:ReturnType<typeof setTimeout>;let count=0
    const poll=async()=>{
      try {
        if(!id) {
          if(legacy && /^cart_[A-Za-z0-9]+$/.test(legacy)) {await completeStripeCheckout(legacy,token);if(active)setMessage("Your order is confirmed. View it in your account.");return}
          if(active)setMessage("No checkout reference was supplied.");return
        }
        const data=await checkoutStatus(id,token);if(!active)return;setResult(data)
        if(data.state==="confirmed") {
          setMessage("Payment confirmed. Your order has been received; dispatch will be confirmed separately.")
          const snapshot=sessionStorage.getItem(`peptech_checkout_cart:${id}`)
          if(snapshot) clearCartIfUnchanged(snapshot)
          sessionStorage.removeItem(`peptech_checkout_cart:${id}`)
          return
        }
        if(["expired","failed"].includes(data.state)) {setMessage("This checkout has expired or failed. Check your account before placing another order.");return}
        setMessage("Payment confirmation is processing. You can safely leave this page and check your account later.")
        if(++count<30) timer=setTimeout(poll,3000)
      } catch(error) {if(active)setMessage(error instanceof Error?error.message:"Confirmation is pending.")}
    }
    void poll();return()=>{active=false;clearTimeout(timer)}
    // Cleanup is intentionally based on the purchased snapshot, not current cart state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token,isLoading,retry])
  return <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col justify-center gap-5 px-6 py-16 text-[#0B1F3A]">
    <h1 className="text-3xl font-bold">{result?.state==="confirmed"?"Order confirmed":"Payment confirmation"}</h1>
    <p role="status" className="text-gray-700">{message}</p>
    {result?.orderId && <p className="text-sm font-semibold text-teal-700">Order Reference: {result.orderId}</p>}
    {result && <p className="text-xl font-bold">{new Intl.NumberFormat("en-GB",{style:"currency",currency:result.currency}).format(result.total)}</p>}
    {result?.renewalTotal ? <p className="text-sm text-gray-600">Renewal: £{result.renewalTotal.toFixed(2)} every 28 days. View your next billing date in your account.</p>:null}
    {result?.state!=="confirmed" && token && <button onClick={()=>setRetry(v=>v+1)} className="rounded-xl bg-[#0B1F3A] p-3 text-white font-medium hover:bg-opacity-95 transition-colors">Check confirmation</button>}
    <div className="flex gap-4 pt-4 border-t border-gray-200">
      <Link href="/account?tab=orders" className="text-teal-700 font-medium hover:underline">View your account</Link>
      <Link href="/" className="text-gray-600 hover:underline">Return to Home</Link>
    </div>
    {!token && <Link href="/account" className="underline text-teal-700">Sign in</Link>}
  </main>
}
