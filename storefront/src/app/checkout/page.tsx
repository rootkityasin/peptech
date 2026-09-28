"use client"

import {useState} from "react"
import Link from "next/link"
import {useCart} from "@/components/cart/CartContext"
import {useCustomer} from "@/context/CustomerContext"
import {prepareStripeCheckout} from "@/lib/stripe-checkout"
import {COUNTRIES,getCountryByName} from "@/lib/countries"

export default function CheckoutPage() {
  const {items,subtotal,shippingCost,country,setCountry,removeItem}=useCart()
  const {customer,token,isAuthenticated,isLoading}=useCustomer()
  const [ruo,setRuo]=useState(false)
  const [recurring,setRecurring]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState("")
  const hasSubscription=items.some(i=>i.isSubscription)
  const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n)
  async function checkout(e:React.FormEvent) {
    e.preventDefault()
    if(busy||!token||!customer)return
    setBusy(true);setError("")
    try {
      const session=await prepareStripeCheckout({items,token,email:customer.email,
        countryCode:getCountryByName(country).code.toLowerCase(),ruoAccepted:ruo,recurringAccepted:recurring})
      if(session.checkoutUrl) window.location.assign(session.checkoutUrl)
      else if(["processing","paid","confirmed","held"].includes(session.state)) window.location.assign(`/checkout/success?attempt_id=${encodeURIComponent(session.attemptId)}`)
      else throw new Error("This checkout cannot be opened. Please refresh and try again.")
    } catch(e) {setError(e instanceof Error?e.message:"Checkout could not open. Please retry.");setBusy(false)}
  }
  return <main className="min-h-screen bg-[#F6F9FF] px-4 py-12 text-[#0B1F3A]">
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
      <Link href="/shop" className="text-sm underline">Continue shopping</Link>
      <h1 className="mt-5 text-3xl font-bold">Checkout</h1>
      <p className="mt-3 text-slate-600">Pay securely with Stripe. You’ll enter your delivery address, billing details and phone number on Stripe’s checkout page.</p>
      {!items.length?<p className="mt-6">Your basket is empty.</p>:<>
        <ul className="my-6 divide-y divide-slate-200">{items.map(item=><li key={`${item.id}:${item.isSubscription}`} className="flex justify-between gap-4 py-4">
          <div><p className="font-semibold">{item.quantity} × {item.title}</p><p className="text-sm text-slate-600">{item.isSubscription?"Every 28 days · 10% off":"One-time purchase"}</p></div>
          <button type="button" disabled={busy} onClick={()=>removeItem(item.id,item.isSubscription)} className="text-sm underline">Remove</button>
        </li>)}</ul>
        {isLoading?<p role="status">Loading your account…</p>:!isAuthenticated?<div className="space-y-4">
          <p>Sign in or create your research account before checkout. Your basket will be saved.</p>
          <Link href="/account" className="inline-block rounded-lg bg-[#0B1F3A] px-5 py-3 text-white">Sign in / Create account</Link>
        </div>:<form onSubmit={checkout} className="space-y-5">
          <p className="text-sm">Signed in as {customer?.email}</p>
          <label className="block font-medium">Delivery country
            <select value={country} onChange={e=>setCountry(e.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-slate-300 p-3">
              {COUNTRIES.map(c=><option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <p className="text-sm text-slate-600">Delivery availability is checked before payment. To change country after opening Stripe, return here first.</p>
          <div className="space-y-2 rounded-lg bg-slate-50 p-4"><p>Products: {money(subtotal)}</p><p>Royal Mail Tracked: {money(shippingCost)}</p><p className="font-semibold">Estimated total: {money(subtotal+shippingCost)}</p><p className="text-sm text-slate-600">Stripe shows the final total and applicable tax before you pay.</p></div>
          {hasSubscription&&<label className="flex gap-3 text-sm"><input type="checkbox" required checked={recurring} onChange={e=>setRecurring(e.target.checked)}/><span>I authorise payment today and every 28 days for recurring items, with 10% off products plus delivery and applicable tax. I can pause, skip or cancel future renewals in my account.</span></label>}
          <label className="flex gap-3 text-sm"><input type="checkbox" required checked={ruo} onChange={e=>setRuo(e.target.checked)}/><span>I agree to the <Link href="/terms-of-sale" className="underline">Terms of Sale</Link>, <Link href="/privacy-policy" className="underline">Privacy Policy</Link> and Research Use Only conditions.</span></label>
          {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} type="submit" className="w-full rounded-xl bg-[#0B1F3A] p-4 font-semibold text-white disabled:opacity-50">{busy?"Opening Stripe Checkout…":"Continue to Stripe Checkout"}</button>
          <p className="text-center text-xs text-slate-500">Orders are confirmed after payment has been verified.</p>
        </form>}
      </>}
    </div>
  </main>
}
