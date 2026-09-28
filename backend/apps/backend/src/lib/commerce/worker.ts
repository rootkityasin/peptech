import {invoiceTaxQuote} from "./stripe-tax-quote"
import {finishRefund} from "./refunds"
import {Modules} from "@medusajs/framework/utils"
import CommerceService,{recordId,LedgerRecord} from "../../modules/peptech-commerce/service"
import {stripeContext,objectId} from "./stripe"
import {processEvent,reconcileSession,reconcileInvoice} from "./events"
import {assertEligibility,assertProduct,fail} from "./policy"
import {Quote,reserveQuote,releaseQuote} from "./quote"
import {syncSubscription} from "./subscriptions"
async function voidSkippedInvoice(scope:any,ledger:CommerceService,cycle:LedgerRecord){
 const context=stripeContext()
 let invoice=await context.stripe.invoices.retrieve(cycle.data.invoice_id)
 if(invoice.status==="draft")invoice=await context.stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:false},{idempotencyKey:recordId("skip-finalize",invoice.id)})
 if(invoice.status==="open")invoice=await context.stripe.invoices.voidInvoice(invoice.id,{}, {idempotencyKey:recordId("skip-void",invoice.id)})
 if(invoice.status!=="void")fail("Skipped invoice needs payment reconciliation",409)
 await releaseQuote(scope,recordId("receipt",context.profile,invoice.id))
 cycle.state="skipped";await ledger.save(cycle)
 await ledger.audit(cycle.data.subscription_id,"worker","cycle-skipped",{invoice_id:invoice.id})
}
async function preflightInvoice(scope:any,ledger:CommerceService,record:LedgerRecord,invoice:any) {
  const context=stripeContext()
  return ledger.locked(record.id,async()=>{
    const latest=await ledger.get(record.id)
    if(!latest) return
    const current=await context.stripe.invoices.retrieve(invoice.id)
    if(current.status!=="draft") return
    if(latest.data.control!=="active" || (latest.data.skip_until && current.period_end<latest.data.skip_until)) {
      // Subscription-generated drafts cannot be deleted. Disable collection,
      // finalize, then void; persist intent so a crash between steps is recoverable.
      const cycle=await ledger.create({id:recordId("cycle",context.profile,current.id),kind:"cycle",profile:context.profile,owner_id:record.owner_id,state:"skip_pending",
        data:{invoice_id:current.id,subscription_id:record.id}})
      await voidSkippedInvoice(scope,ledger,cycle)
      return
    }
    const customer=await scope.resolve(Modules.CUSTOMER).retrieveCustomer(record.owner_id)
    assertEligibility(customer)
    const quote=record.data.quote as Quote
    let renewal={...quote,lines:quote.lines.filter(l=>l.recurring).map((l,i)=>({...l,line_id:recordId("ordli",invoice.id,String(i))})),total_minor:quote.renewal_minor}
    for(const line of renewal.lines) assertProduct(await ledger.get(recordId("catalog",line.variant_id)),quote.address.country_code,true)
    if(quote.tax_policy==="stripe_default")renewal=await invoiceTaxQuote(context.stripe,current,renewal)
    if(current.total!==renewal.total_minor || current.currency!==renewal.currency) fail("Renewal amount differs from authorised quote",409)
    await reserveQuote(scope,renewal,recordId("receipt",context.profile,invoice.id))
    const cycle=await ledger.create({id:recordId("cycle",context.profile,invoice.id),kind:"cycle",profile:context.profile,
      owner_id:record.owner_id,state:"reserved",data:{invoice_id:invoice.id,subscription_id:record.id,quote:renewal}})
    await context.stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:true},{idempotencyKey:recordId("finalize",invoice.id)})
    cycle.state="awaiting_payment";await ledger.save(cycle)
    // Stripe Billing owns collection and retry scheduling; no separate PaymentIntent charge is made.
  })
}
async function processEmail(scope:any,ledger:CommerceService,record:LedgerRecord) {
  return ledger.locked(record.id,async()=>{
    const current=await ledger.get(record.id);if(!current||current.state==="done")return
    const {data}=current
    if(data.type!=="email")return
    await scope.resolve(Modules.NOTIFICATION).createNotifications({to:data.to,channel:"email",template:data.template,idempotency_key:record.id,
      data:{...data,idempotency_key:record.id},trigger_type:data.template,resource_id:data.reference,resource_type:"peptech-commerce"})
    const sent=await scope.resolve(Modules.NOTIFICATION).listNotifications({idempotency_key:record.id})
    if(!sent.some((n:any)=>n.status==="success"))throw new Error("Notification delivery needs reconciliation")
    current.state="done";await ledger.save(current)
  })
}
export async function commerceTick(scope:any) {
  const ledger=scope.resolve("peptechCommerce") as CommerceService
  const context=stripeContext()
  const logger=scope.resolve("logger")
  const safe=async(label:string,run:()=>Promise<unknown>)=>{try{await run()}catch(error:any){
    await ledger.patch(label,{last_retry_at:new Date().toISOString(),last_error:error.status?error.message:"Processing failed; inspect provider logs"})
    if(error.status!==409)logger.error(`Commerce ${label} needs retry; inspect the ledger operation. ${error.code||""}`)}}
  for(const cycle of await ledger.list("cycle",{profile:context.profile,state:"skip_pending",limit:50,oldestFirst:true})){
    await safe(cycle.id,()=>ledger.locked(cycle.data.subscription_id,()=>voidSkippedInvoice(scope,ledger,cycle)))
  }
  // Each queue is bounded. Retry jobs are processed separately so a bad event cannot starve new events.
  for(const state of ["pending","retry"]) {
    for(const event of await ledger.list("event",{profile:context.profile,state,limit:50,oldestFirst:true})) {
      if(event.data.attempts>=10) {event.state="review";await ledger.save(event);continue}
      await safe(event.id,()=>processEvent(scope,ledger,event.id))
    }
  }
  for(const state of ["open","creating","processing"]) {
    for(const attempt of await ledger.list("attempt",{profile:context.profile,state,limit:50,oldestFirst:true})) {
      if(attempt.data.session_id) await safe(attempt.id,()=>reconcileSession(scope,ledger,attempt.data.session_id))
      else if(attempt.data.expires_at<Date.now()/1000-60)await safe(attempt.id,async()=>{
        const customer=await ledger.get(recordId("customer",context.profile,attempt.owner_id!))
        const sessions=customer?await context.stripe.checkout.sessions.list({customer:customer.data.stripe_id,created:{gte:Math.floor(new Date(attempt.created_at).getTime()/1000)-60},limit:100}):{data:[],has_more:false}
        if(sessions.has_more){await ledger.patch(attempt.id,{},"review");return}
        const found=sessions.data.find((s:any)=>s.metadata?.peptech_attempt===attempt.id)
        if(found){await reconcileSession(scope,ledger,found.id);return}
        await ledger.patch(attempt.id,{},"expired");await releaseQuote(scope,attempt.id)
      })
      else if(Date.now()-new Date(attempt.created_at).getTime()>23*3600000) {
        attempt.state="review";await ledger.save(attempt)
        // Unknown Stripe outcome keeps reservations until an operator reconciles it.
      }
    }
  }
  for(const record of await ledger.list("subscription",{profile:context.profile,excludeStates:["canceled","incomplete_expired"],limit:100,oldestFirst:true})) {
    if(["canceled","incomplete_expired"].includes(record.state))continue
    await safe(record.id,async()=>{
      const sub=await syncSubscription(ledger,record.data.stripe_id);if(!sub)return
      const drafts=await context.stripe.invoices.list({subscription:record.data.stripe_id,status:"draft",limit:10})
      for(const invoice of drafts.data) if(invoice.billing_reason!=="subscription_create")await preflightInvoice(scope,ledger,sub,invoice)
      const paid=await context.stripe.invoices.list({subscription:record.data.stripe_id,status:"paid",limit:5})
      for(const invoice of paid.data)await reconcileInvoice(scope,ledger,invoice.id)
      const next=sub.data.next_billing_at
      if(sub.data.control==="active"&&next&&next-Date.now()/1000<=3*86400&&next>Date.now()/1000&&!(sub.data.skip_until>next)) {
        const id=recordId("operation",sub.id,"reminder",String(next))
        await ledger.create({id,kind:"operation",profile:context.profile,owner_id:sub.owner_id,state:"pending",data:{type:"email",
          template:"subscription-renewal-reminder",to:sub.data.quote.email,reference:sub.id,renewal_at:next,total_minor:sub.data.quote.renewal_minor}})
      }
    })
  }
  for(const refund of await ledger.list("refund",{profile:context.profile,excludeStates:["done"],limit:50,oldestFirst:true})) {
    if(refund.state!=="done" && refund.data.stripe_refund_id) await safe(refund.id,()=>ledger.locked(`refund:${refund.data.order_id}`,()=>finishRefund(scope,ledger,refund,refund.data.admin_id||"worker")))
  }
  for(const operation of await ledger.list("operation",{profile:context.profile,state:"pending",data:{type:"email"},limit:50,oldestFirst:true})) {
    if(operation.data.type==="email")await safe(operation.id,()=>processEmail(scope,ledger,operation))
  }
}
