import {checkoutDelivery} from "./checkout-delivery"
import {checkoutTaxQuote,invoiceTaxQuote} from "./stripe-tax-quote"
import CommerceService,{recordId} from "../../modules/peptech-commerce/service"
import { stripeContext,objectId } from "./stripe"
import { fail } from "./policy"
import { releaseQuote,Quote } from "./quote"
import { settleReceipt,paymentEvidence } from "./settlement"
import { syncSubscription } from "./subscriptions"
import {Modules} from "@medusajs/framework/utils"
async function financialException(scope:any,ledger:CommerceService,event:any) {
 const context=stripeContext();let pi:string|null=null
 if(event.type.startsWith("charge.dispute.")){const dispute=await context.stripe.disputes.retrieve(event.object_id);pi=objectId(dispute.payment_intent)}
 else if(event.type.startsWith("refund.")){const refund=await context.stripe.refunds.retrieve(event.object_id);pi=objectId(refund.payment_intent)}
 else {const charge=await context.stripe.charges.retrieve(event.object_id);pi=objectId(charge.payment_intent)}
 if(!pi)return
 const receipts=await ledger.list("receipt",{profile:context.profile,data:{payment_intent_id:pi},limit:100})
 for(const receipt of receipts){
  if(!receipt.data.order_id)continue
  const orders=scope.resolve(Modules.ORDER)
  await ledger.locked(`fulfillment:${receipt.data.order_id}`,async()=>{
   const order=await orders.retrieveOrder(receipt.data.order_id)
   await orders.updateOrders(order.id,{metadata:{...order.metadata,fulfillment_hold:true,refund_review:true,financial_review_event:event.stripe_event_id}})
   await ledger.audit(receipt.id,"stripe-webhook","financial-review-hold",{type:event.type,event_id:event.stripe_event_id})
  })
 }
}
export async function reconcileSession(scope:any,ledger:CommerceService,sessionId:string) {
  const context=stripeContext();const session=await context.stripe.checkout.sessions.retrieve(sessionId)
  const attempt=await ledger.get(session.metadata?.peptech_attempt||"")
  if(!attempt || attempt.profile!==context.profile || session.metadata?.peptech_profile!==context.profile ||
    session.client_reference_id!==attempt.id || session.livemode!==(context.mode==="live")) return
  if(attempt.data.session_id && attempt.data.session_id!==session.id) fail("Checkout session mismatch",409)
  attempt.data.quote=checkoutDelivery(session,attempt.data.quote)
  // Recover a session created before a process crash interrupted saving its ID.
  if(attempt.data.quote.tax_policy==="stripe_default"&&session.status!=="expired"&&session.automatic_tax.status!=="requires_location_inputs")attempt.data.quote=await checkoutTaxQuote(context.stripe,session,attempt.data.quote)
  attempt.data.session_id=session.id;attempt.data.stripe_customer_id=objectId(session.customer);await ledger.patch(attempt.id,{session_id:session.id,stripe_customer_id:attempt.data.stripe_customer_id,quote:attempt.data.quote})
  if(attempt.owner_id && attempt.data.stripe_customer_id){
    try{
      const custKey = recordId("customer", context.profile, attempt.owner_id)
      await ledger.create({
        id: custKey,
        kind: "customer",
        profile: context.profile,
        owner_id: attempt.owner_id,
        state: "active",
        data: { stripe_id: attempt.data.stripe_customer_id }
      }).catch(async () => {
        await ledger.patch(custKey, { stripe_id: attempt.data.stripe_customer_id }, "active").catch(() => {})
      })
    }catch{}
  }
  if(session.status==="expired") {
    if(!["confirmed","held"].includes(attempt.state)) {attempt.state="expired";await ledger.save(attempt);await releaseQuote(scope,attempt.id)}
    return
  }
  if(session.mode==="subscription" && session.subscription) {
    await syncSubscription(ledger,objectId(session.subscription)!)
    if(session.invoice) await reconcileInvoice(scope,ledger,objectId(session.invoice)!)
    return
  }
  if(session.payment_status!=="paid") return
  const pi=await context.stripe.paymentIntents.retrieve(objectId(session.payment_intent)!, { expand: ["latest_charge"] })
  if(pi.status!=="succeeded" || pi.metadata.peptech_attempt!==attempt.id) fail("Payment ownership mismatch",409)
  if (pi.payment_method && attempt.data.stripe_customer_id) {
    try {
      const pmId = objectId(pi.payment_method)
      if (pmId) {
        await context.stripe.paymentMethods.update(pmId, { allow_redisplay: "always" }).catch(() => {})
        await context.stripe.customers.update(attempt.data.stripe_customer_id, {
          invoice_settings: { default_payment_method: pmId }
        }).catch(() => {})
      }
    } catch {}
  }
  const chargeReceipt = typeof pi.latest_charge === "object" ? (pi.latest_charge as any)?.receipt_url : null
  const receiptUrl = chargeReceipt || null
  await settleReceipt(scope,ledger,attempt,{reference:session.id,session_id:session.id,amount:pi.amount_received,
    currency:pi.currency,payment_intent_id:pi.id,receipt_url:receiptUrl})
}
export async function reconcileInvoice(scope:any,ledger:CommerceService,invoiceId:string) {
  const context=stripeContext();const invoice=await context.stripe.invoices.retrieve(invoiceId)
  const subscriptionId=objectId(invoice.parent?.subscription_details?.subscription)
  if(!subscriptionId) return
  const subscription=await syncSubscription(ledger,subscriptionId)
  if(!subscription || invoice.livemode!==(context.mode==="live") || objectId(invoice.customer)!==subscription.data.stripe_customer_id) return
  const attempt=await ledger.get(subscription.data.attempt_id)
  if(!attempt) return
  if(["void","uncollectible"].includes(invoice.status||"")){
    const cycle=await ledger.get(recordId("cycle",context.profile,invoice.id))
    if(cycle&&cycle.state!=="released"){
      await releaseQuote(scope,recordId("receipt",context.profile,invoice.id))
      cycle.state="released";await ledger.save(cycle)
    }
    return
  }
  if(invoice.status==="open"&&invoice.attempt_count>0){
    await ledger.create({id:recordId("operation",context.profile,invoice.id,"recovery",String(invoice.attempt_count)),kind:"operation",profile:context.profile,
      owner_id:subscription.owner_id,state:"pending",data:{type:"email",template:"payment-recovery",to:subscription.data.quote.email,reference:invoice.id}})
  }
  if(!["subscription_create","subscription_cycle"].includes(invoice.billing_reason||"")) return
  if(invoice.billing_reason==="subscription_create" || (attempt.data.quote.tax_policy==="stripe_default"&&!attempt.data.quote.shipping_price_id)){
    const session=await context.stripe.checkout.sessions.retrieve(attempt.data.session_id)
    if(session.status!=="complete") return
    if(session.metadata?.peptech_attempt!==attempt.id || session.metadata?.peptech_profile!==context.profile || objectId(session.subscription)!==subscriptionId) fail("Invoice checkout ownership mismatch",409)
    attempt.data.quote=checkoutDelivery(session,attempt.data.quote)
    if(attempt.data.quote.tax_policy==="stripe_default") attempt.data.quote=await checkoutTaxQuote(context.stripe,session,attempt.data.quote)
    await ledger.save(attempt)
    subscription.data.quote=attempt.data.quote;await ledger.save(subscription)
  }
  const evidence=await paymentEvidence(context.stripe,invoice)
  if(!evidence) return
  let quote:Quote|undefined
  if(invoice.billing_reason!=="subscription_create") {
    const original=subscription.data.quote as Quote
    quote={...original,lines:original.lines.filter(l=>l.recurring).map((l,i)=>({...l,line_id:recordId("ordli",invoice.id,String(i))})),
      total_minor:original.renewal_minor}
  }
  if(attempt.data.quote.tax_policy==="stripe_default")quote=await invoiceTaxQuote(context.stripe,invoice,quote||attempt.data.quote)
  await settleReceipt(scope,ledger,attempt,{reference:invoice.id,invoice_id:invoice.id,amount:evidence.amount,
    currency:invoice.currency,payment_intent_id:evidence.payment_intent_id,receipt_url:evidence.receipt_url||invoice.hosted_invoice_url||null},quote)
}
export async function processEvent(scope:any,ledger:CommerceService,eventId:string) {
  return ledger.locked(eventId,async()=>{
    const record=await ledger.get(eventId);if(!record || record.state==="done") return
    const event=record.data;const context=stripeContext()
    if(record.profile!==context.profile) fail("Event belongs to an inactive credential profile",409)
    try {
      if(event.type.startsWith("checkout.session.")) await reconcileSession(scope,ledger,event.object_id)
      else if(event.type.startsWith("invoice.")) await reconcileInvoice(scope,ledger,event.object_id)
      else if(event.type.startsWith("customer.subscription.")) await syncSubscription(ledger,event.object_id)
      else if(event.type.startsWith("charge.dispute.") || event.type.startsWith("refund.") || event.type==="charge.refunded") {
        await financialException(scope,ledger,event)
        // Financial exceptions require an operator task; never infer refund or dispatch from this notification.
        await ledger.create({id:recordId("reconciliation",eventId),kind:"reconciliation",profile:context.profile,owner_id:null,state:"review",
          data:{event_id:event.stripe_event_id,type:event.type,object_id:event.object_id}})
      }
      if(event.type==="checkout.session.async_payment_failed"){
        const session=await context.stripe.checkout.sessions.retrieve(event.object_id)
        const attempt=await ledger.get(session.metadata?.peptech_attempt||"")
        if(attempt?.profile===context.profile&&attempt.data.session_id===session.id&&session.payment_status==="unpaid"&&session.payment_intent){
          const pi=await context.stripe.paymentIntents.retrieve(objectId(session.payment_intent)!)
          if(["requires_payment_method","canceled"].includes(pi.status)&&attempt.state!=="confirmed"){
            await ledger.patch(attempt.id,{},"failed");await releaseQuote(scope,attempt.id)
          }
        }
      }
      record.state="done";record.data.processed_at=new Date().toISOString();await ledger.save(record)
    } catch(error:any) {
      record.data.attempts=(record.data.attempts||0)+1;record.data.last_error=error.status?error.message:"Processing failed; inspect provider and workflow logs"
      record.state="retry";await ledger.save(record);throw error
    }
  })
}
