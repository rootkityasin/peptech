"use client"
import {useEffect,useState} from "react"
import {commerceRequest} from "@/lib/stripe-checkout"
export function AccountBilling({token,subscriptionsOnly=false}:{token:string;subscriptionsOnly?:boolean}) {
  const [subscriptions,setSubscriptions]=useState<any[]>([]);const [error,setError]=useState("");const [busy,setBusy]=useState("")
  const [dates,setDates]=useState<Record<string,string>>({})
  useEffect(()=>{let active=true;commerceRequest("/store/custom/subscriptions",token).then(r=>{if(active)setSubscriptions(r.subscriptions)})
    .catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[token])
  const command=async(id:string,action:string)=>{
    if(busy)return
    if(action==="cancel"&&!window.confirm("Cancel future renewals? Already paid orders are handled separately."))return
    setBusy(id);setError("")
    const storageKey=`peptech_subscription_command:${id}:${action}:${action==="change_date"?dates[id]:""}`
    let operation=sessionStorage.getItem(storageKey)
    if(!operation){operation=crypto.randomUUID();sessionStorage.setItem(storageKey,operation)}
    try {
      const result=await commerceRequest("/store/custom/subscriptions",token,{subscription_id:id,operation_id:operation,action,
        ...(action==="change_date"?{date:new Date(`${dates[id]}T12:00:00Z`).toISOString()}:{})},"PUT")
      setSubscriptions(old=>old.map(s=>s.id===id?result.subscription:s));sessionStorage.removeItem(storageKey)
    }catch(e){setError(e instanceof Error?e.message:"Could not update subscription")}
    finally{setBusy("")}
  }
  const portal=async()=>{setBusy("portal");setError("");try{const result=await commerceRequest("/store/custom/billing-portal",token,{});window.location.assign(result.url)}
    catch(e){setError(e instanceof Error?e.message:"Billing is unavailable");setBusy("")}}
  return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 text-[#0B1F3A]">
    <h2 className="text-2xl font-semibold">{subscriptionsOnly?"Your subscriptions":"Billing and payment methods"}</h2>
    <button onClick={portal} disabled={!!busy} className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-white disabled:opacity-50">Manage payment methods and invoices securely</button>
    {error&&<p role="alert" className="text-red-700">{error}</p>}
    {subscriptionsOnly&&subscriptions.length===0&&<p>No subscriptions yet. Eligible refills and vials offer 10% off product prices every 28 days; delivery is charged separately.</p>}
    {subscriptionsOnly&&subscriptions.map(sub=><article key={sub.id} className="space-y-3 border-t border-slate-200 pt-5">
      <h3 className="font-semibold">{sub.title}</h3><p>{sub.status}</p>
      <p>£{sub.price.toFixed(2)} every 28 days, including £{sub.shipping_amount.toFixed(2)} delivery. Applicable tax may change.</p>
      <p>Next billing date: {sub.control==="paused"?"Paused":sub.nextBillingDate||"Awaiting confirmation"}</p>
      <div className="flex flex-wrap gap-3">{["pause","resume","skip","cancel"].filter(a=>a==="resume"?sub.control==="paused":a==="pause"?sub.control!=="paused":true).map(action=>
        <button key={action} disabled={!!busy||sub.status==="canceled"||sub.control==="canceling"} onClick={()=>command(sub.id,action)} className="rounded-lg border px-4 py-2 capitalize disabled:opacity-40">{action}</button>)}</div>
      <label className="block text-sm">Change next renewal date<input type="date" value={dates[sub.id]||""} onChange={e=>setDates(old=>({...old,[sub.id]:e.target.value}))} className="ml-3 rounded border p-2" /></label>
      <button disabled={!!busy||!dates[sub.id]||sub.status==="canceled"||sub.control==="canceling"} onClick={()=>command(sub.id,"change_date")} className="text-sm underline disabled:opacity-40">Apply new date without a proration charge</button>
      <p className="text-xs text-slate-600">Pause and skip stop future charges and shipments. Resume uses the next scheduled cycle. Already paid orders are unchanged.</p>
    </article>)}
  </section>
}
