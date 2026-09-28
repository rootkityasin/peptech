import type {ExecArgs} from "@medusajs/framework/types"
import {Modules} from "@medusajs/framework/utils"
import {randomUUID} from "node:crypto"
import fs from "node:fs"
import CommerceService,{recordId} from "../modules/peptech-commerce/service"
import {stripeContext} from "../lib/commerce/stripe"
import {prepareCheckout} from "../lib/commerce/checkout"
import {reconcileSession,reconcileInvoice} from "../lib/commerce/events"
import {subscriptionCommand} from "../lib/commerce/subscriptions"
import {commerceTick} from "../lib/commerce/worker"
import {refundOrder,finishRefund} from "../lib/commerce/refunds"
export default async function verify({container}:ExecArgs) {
 const url=new URL(process.env.DATABASE_URL!)
 const context=stripeContext()
 if(url.hostname!=="127.0.0.1"||!url.pathname.endsWith("_test")||context.mode!=="test")throw new Error("Isolated sandbox required")
 const ledger=container.resolve("peptechCommerce") as CommerceService
 const fixture=JSON.parse(fs.readFileSync("/tmp/peptech-sandbox-fixture.json","utf8"))
 const stage=process.env.PEPTECH_BILLING_STAGE||"prepare"
 if(stage==="refund") {
   const attempt=(await ledger.list("attempt",{state:"confirmed",limit:100})).find(a=>!a.data.quote.renewal_minor&&a.data.payment_method!=="bank_transfer")!
   for(const pending of await ledger.list("refund",{profile:context.profile,limit:100})) {
     if(pending.state!=="done"&&pending.data.stripe_refund_id)await finishRefund(container,ledger,pending,"sandbox-verifier")
   }
   const request={order_id:attempt!.data.order_id,operation_id:"2ee67c55-3dbe-43c0-ac11-0383d8802819",amount:"1.00",note:"Sandbox partial refund verification"}
   const first=await refundOrder(container,ledger,"sandbox-verifier",request)
   const again=await refundOrder(container,ledger,"sandbox-verifier",request)
   if(first.refund_id!==again.refund_id||first.status!=="succeeded")throw new Error("Refund replay failed")
   console.log(JSON.stringify({phase:"C",partial_refund:first.status,replay:"same-refund",refund_id:first.refund_id}));return
 }
 if(stage==="prepare") {
   const clock=await context.stripe.testHelpers.testClocks.create({frozen_time:Math.floor(Date.now()/1000),name:"PEPTECH subscription acceptance"})
   const customer=await container.resolve(Modules.CUSTOMER).createCustomers({email:`billing-${randomUUID()}@example.com`,has_account:true,
     first_name:"Sandbox",last_name:"Subscriber",metadata:{compliance_ack:true}})
   const sc=await context.stripe.customers.create({email:customer.email,test_clock:clock.id,metadata:{peptech_customer_id:customer.id}})
   await ledger.create({id:recordId("customer",context.profile,customer.id),kind:"customer",profile:context.profile,owner_id:customer.id,state:"active",data:{stripe_id:sc.id}})
   const input={...fixture.input,revision:randomUUID(),items:[{variant_id:fixture.variant_id,quantity:1,recurring:false},
     {variant_id:fixture.variant_id,quantity:1,recurring:true}],recurring_accepted:true}
   const session:any=await prepareCheckout(container,ledger,customer.id,input)
   if(session.total!==23.95||session.renewalTotal!==13.95)throw new Error("Mixed basket pricing failed")
   fs.writeFileSync("/tmp/peptech-billing-fixture.json",JSON.stringify({customer_id:customer.id,clock_id:clock.id,clock_time:clock.frozen_time,input,session}),{mode:0o600})
   // Browser harness reads only this sandbox-owned hosted Checkout URL.
   fs.writeFileSync("/tmp/peptech-sandbox-fixture.json",JSON.stringify({...fixture,customer_id:customer.id,input,session}),{mode:0o600})
   console.log(JSON.stringify({phase:"D",stage,total:session.total,renewal:session.renewalTotal,clock:clock.id,attempt:session.attemptId}));return
 }
 const billing=JSON.parse(fs.readFileSync("/tmp/peptech-billing-fixture.json","utf8"))
 const attempt=await ledger.get(billing.session.attemptId)
 if(stage==="verify") {
   // Model invoice.paid arriving before checkout.session.completed.
   const session=await context.stripe.checkout.sessions.retrieve(attempt!.data.session_id)
   if(!session.invoice)throw new Error("Hosted subscription invoice missing")
   await reconcileInvoice(container,ledger,typeof session.invoice==="string"?session.invoice:session.invoice.id)
   await reconcileSession(container,ledger,attempt!.data.session_id)
   await reconcileSession(container,ledger,attempt!.data.session_id)
   const confirmed=await ledger.get(attempt!.id)
   if(confirmed?.state!=="confirmed"||!confirmed.data.subscription_id)throw new Error("Initial subscription order is unconfirmed")
   const sub=await ledger.get(confirmed.data.subscription_id)
   if(!sub?.data.quote.delivery_collected || !sub.data.quote.address.address_1)throw new Error("Subscription delivery snapshot missing")
   const stripeSub=await context.stripe.subscriptions.retrieve(sub!.data.stripe_id)
   if(stripeSub.items.data.length!==2)throw new Error("One-time item leaked into recurring subscription")
   for(const item of stripeSub.items.data)if(item.price.recurring?.interval!=="day"||item.price.recurring.interval_count!==28)throw new Error("Wrong subscription interval")
   const input={subscription_id:sub!.id,operation_id:randomUUID(),action:"pause"}
   await subscriptionCommand(ledger,billing.customer_id,input)
   await subscriptionCommand(ledger,billing.customer_id,input)
   if((await context.stripe.subscriptions.retrieve(stripeSub.id)).pause_collection?.behavior!=="void")throw new Error("Pause failed")
   await subscriptionCommand(ledger,billing.customer_id,{...input,operation_id:randomUUID(),action:"resume"})
   if((await context.stripe.subscriptions.retrieve(stripeSub.id)).pause_collection?.behavior!=="keep_as_draft")throw new Error("Resume failed")
   billing.subscription_id=sub!.id;billing.stripe_subscription_id=stripeSub.id
   fs.writeFileSync("/tmp/peptech-billing-fixture.json",JSON.stringify(billing),{mode:0o600})
   console.log(JSON.stringify({phase:"D",initial_order:confirmed.data.order_id,total:23.95,recurring_items:2,interval:"28 days",pause:"verified",resume:"verified"}));return
 }
 if(stage==="advance") {
   const clock=await context.stripe.testHelpers.testClocks.retrieve(billing.clock_id)
   if(clock.status!=="ready")throw new Error("Test clock is still advancing")
   await context.stripe.testHelpers.testClocks.advance(clock.id,{frozen_time:clock.frozen_time+28*86400+3600})
   console.log(JSON.stringify({phase:"D",test_clock:"advancing-28-days"}));return
 }
 if(stage==="renewal") {
   const clock=await context.stripe.testHelpers.testClocks.retrieve(billing.clock_id)
   if(clock.status!=="ready")throw new Error("Test clock is still advancing")
   await commerceTick(container)
   const invoices=await context.stripe.invoices.list({subscription:billing.stripe_subscription_id,limit:10})
   const renewal=invoices.data.find(i=>i.billing_reason==="subscription_cycle")
   if(!renewal)throw new Error("No renewal invoice yet")
   if(renewal.status==="open")await context.stripe.invoices.pay(renewal.id,{}, {idempotencyKey:recordId("test-pay",renewal.id)})
   await reconcileInvoice(container,ledger,renewal.id)
   await reconcileInvoice(container,ledger,renewal.id)
   const receipt=await ledger.get(recordId("receipt",context.profile,renewal.id))
   if(receipt?.state!=="confirmed")throw new Error(`Renewal is ${renewal.status}; no confirmed order yet`)
   const order=await container.resolve(Modules.ORDER).retrieveOrder(receipt.data.order_id,{relations:["items"]})
   if(order.items?.length!==1)throw new Error("One-time product repeated in renewal shipment")
   console.log(JSON.stringify({phase:"D",renewal_invoice:renewal.id,order:order.id,items:order.items.length,total_minor:renewal.total,replay:"one-renewal-order"}));return
 }
 if(stage==="controls") {
   const request={subscription_id:billing.subscription_id,operation_id:randomUUID(),action:"pause"}
   let rejected=false;try{await subscriptionCommand(ledger,"different-customer",request)}catch(e:any){rejected=e.status===404}
   if(!rejected)throw new Error("Cross-customer subscription mutation allowed")
   const clock=await context.stripe.testHelpers.testClocks.retrieve(billing.clock_id)
   const target=clock.frozen_time+7*86400
   await subscriptionCommand(ledger,billing.customer_id,{...request,operation_id:randomUUID(),action:"change_date",date:new Date(target*1000).toISOString()})
   const changed=await context.stripe.subscriptions.retrieve(billing.stripe_subscription_id)
   if(changed.trial_end!==target)throw new Error("Renewal date did not change")
   const skip={...request,operation_id:randomUUID(),action:"skip"}
   await subscriptionCommand(ledger,billing.customer_id,skip);await subscriptionCommand(ledger,billing.customer_id,skip)
   const sub=await ledger.get(billing.subscription_id)
   if(!sub?.data.skip_until)throw new Error("Skip was not recorded")
   billing.skip_target=target
   fs.writeFileSync("/tmp/peptech-billing-fixture.json",JSON.stringify(billing),{mode:0o600})
   console.log(JSON.stringify({cross_customer:"rejected",change_date:"verified",skip:"recorded-idempotently"}));return
 }
 if(stage==="skip-advance") {
   await context.stripe.testHelpers.testClocks.advance(billing.clock_id,{frozen_time:billing.skip_target+3600})
   console.log(JSON.stringify({test_clock:"advancing-to-skipped-cycle"}));return
 }
 if(stage==="skip-verify") {
   const clock=await context.stripe.testHelpers.testClocks.retrieve(billing.clock_id)
   if(clock.status!=="ready")throw new Error("Test clock still advancing")
   await commerceTick(container)
   const invoices=await context.stripe.invoices.list({subscription:billing.stripe_subscription_id,limit:20})
   if(invoices.data.some(i=>i.billing_reason==="subscription_cycle"&&i.created>=billing.skip_target&&["paid","open","draft"].includes(i.status||"")))throw new Error("Skipped cycle was charged or left collectible")
   console.log(JSON.stringify({skip:"no-charge-no-collectible-invoice"}));return
 }
 if(stage==="cancel") {
   await subscriptionCommand(ledger,billing.customer_id,{subscription_id:billing.subscription_id,operation_id:randomUUID(),action:"cancel"})
   const subscription=await context.stripe.subscriptions.retrieve(billing.stripe_subscription_id)
   if(!subscription.cancel_at_period_end||subscription.pause_collection?.behavior!=="void")throw new Error("Cancellation did not stop future collection")
   console.log(JSON.stringify({phase:"D",cancellation:"verified-no-future-collection"}))
 }
}
