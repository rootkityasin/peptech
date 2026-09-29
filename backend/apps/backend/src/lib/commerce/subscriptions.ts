import {isDeepStrictEqual} from "node:util"
import { z } from "zod"
import CommerceService,{recordId,LedgerRecord} from "../../modules/peptech-commerce/service"
import { stripeContext,objectId,operationKey } from "./stripe"
import { fail,owned } from "./policy"
export function periodEnd(subscription:any):number {
  return subscription.items.data.reduce((end:number,item:any)=>Math.max(end,item.current_period_end||0),0)
}
export async function syncSubscription(ledger:CommerceService,stripeId:string) {
  const context=stripeContext()
  return ledger.locked(recordId("subscription",context.profile,stripeId),()=>syncLockedSubscription(ledger,stripeId))
}
async function syncLockedSubscription(ledger:CommerceService,stripeId:string) {
  const context=stripeContext()
  const subscription=await context.stripe.subscriptions.retrieve(stripeId)
  const attempt=await ledger.get(subscription.metadata.peptech_attempt)
  if(!attempt || attempt.profile!==context.profile || subscription.metadata.peptech_profile!==context.profile ||
    objectId(subscription.customer)!==attempt.data.stripe_customer_id) return null
  const id=recordId("subscription",context.profile,stripeId)
  const record=await ledger.create({id,kind:"subscription",profile:context.profile,owner_id:attempt.owner_id,state:subscription.status,data:{
    stripe_id:stripeId,attempt_id:attempt.id,quote:attempt.data.quote,control:"active",consent:attempt.data.consent}})
  record.state=subscription.status;record.data.next_billing_at=periodEnd(subscription);record.data.cancel_at_period_end=subscription.cancel_at_period_end
  if((!record.data.quote.shipping_price_id&&attempt.data.quote.shipping_price_id)||(!record.data.quote.delivery_collected&&attempt.data.quote.delivery_collected))record.data.quote=attempt.data.quote
  record.data.stripe_customer_id=objectId(subscription.customer)
  // Invoices remain drafts until our inventory/eligibility preflight completes.
  // This is collection control, not Stripe's distinct paused subscription status.
  if(!["canceled","incomplete_expired"].includes(subscription.status) && !subscription.pause_collection) {
    await context.stripe.subscriptions.update(stripeId,{pause_collection:{behavior:record.data.control==="paused"?"void":"keep_as_draft"}},
      {idempotencyKey:operationKey("collection-control",id,String((subscription.items.data[0] as any)?.current_period_end || (subscription as any).current_period_end))})
  }
  await ledger.locked(attempt.id,async()=>{
    const latest=await ledger.get(attempt.id)
    if(latest){latest.data.subscription_id=id;await ledger.save(latest)}
  })
  return ledger.save(record)
}
export const commandSchema=z.object({subscription_id:z.string().min(1),operation_id:z.string().uuid(),
  action:z.enum(["pause","resume","skip","cancel","change_date"]),date:z.string().datetime().optional()}).strict()
export async function subscriptionCommand(ledger:CommerceService,customer:string,body:unknown) {
  const input=commandSchema.parse(body);const context=stripeContext()
  return ledger.locked(input.subscription_id,async()=>{
    const record=owned(await ledger.get(input.subscription_id),customer,context.profile)
    if(record.kind!=="subscription") fail("Subscription not found",404)
    const key=recordId("operation",record.id,input.operation_id)
    let operation=await ledger.get(key)
    if(operation && !isDeepStrictEqual(operation.data.input,input)) fail("Operation ID reused for a different command",409)
    if(operation?.state==="done") return presentSubscription(record)
    const current=await context.stripe.subscriptions.retrieve(record.data.stripe_id)
    if(["canceled","incomplete_expired"].includes(current.status)) fail("Subscription has ended",409)
    if(current.cancel_at_period_end&&input.action!=="cancel")fail("This subscription is ending. Start a new subscription to purchase future deliveries.",409)
    const open=await context.stripe.invoices.list({subscription:current.id,status:"open",limit:1})
    if(open.data.length && input.action!=="cancel") fail("An invoice is already in progress. Resolve it before changing the next cycle.",409)
    const next=periodEnd(current)
    if(!operation) operation=await ledger.create({id:key,kind:"operation",profile:context.profile,owner_id:customer,state:"pending",data:{input}})
    if(Date.now()-new Date(operation.created_at).getTime()>23*3600000) fail("Command needs reconciliation before retry",409)
    let params:any
    if(input.action==="pause") params={pause_collection:{behavior:"void"}}
    if(input.action==="resume") params={pause_collection:{behavior:"keep_as_draft"}}
    if(input.action==="cancel") params={cancel_at_period_end:true,pause_collection:{behavior:"void"}}
    if(input.action==="skip") {
      if(record.data.control==="paused") fail("Resume the subscription before skipping a cycle",409)
      operation.data.skip_until=operation.data.skip_until || next+1
      params={pause_collection:{behavior:"keep_as_draft"}}
    }
    if(input.action==="change_date") {
      const target=Math.floor(Date.parse(input.date||"")/1000)
      if(!Number.isFinite(target)||target<Math.floor(Date.now()/1000)+86400||target>Math.floor(Date.now()/1000)+90*86400) fail("Choose a renewal date between tomorrow and 90 days from now")
      params={trial_end:target,proration_behavior:"none",pause_collection:{behavior:"keep_as_draft"}}
    }
    await ledger.save(operation)
    await context.stripe.subscriptions.update(current.id,params,{idempotencyKey:key})
    if(input.action==="skip") record.data.skip_until=operation.data.skip_until
    else record.data.control=input.action==="pause"?"paused":input.action==="cancel"?"canceling":"active"
    if(input.action==="change_date") record.data.next_billing_at=Math.floor(Date.parse(input.date!)/1000)
    await ledger.save(record)
    await ledger.audit(record.id,customer,input.action,{operation_id:key,date:input.date||null})
    operation.state="done";await ledger.save(operation)
    const synced=await syncSubscription(ledger,current.id)
    return presentSubscription(synced || record)
  })
}
export function presentSubscription(record:LedgerRecord) {
  const q=record.data.quote;const recurring=q.lines.filter((l:any)=>l.recurring)
  const next=record.data.skip_until && record.data.next_billing_at<record.data.skip_until ? record.data.next_billing_at+28*86400:record.data.next_billing_at
  return {id:record.id,status:["canceled","incomplete_expired"].includes(record.state)?record.state:record.data.control==="paused"?"Paused":record.data.control==="canceling"?"Canceling":record.state,
    title:recurring.map((l:any)=>l.name).join(", "),price:q.renewal_minor/100,currency:q.currency,
    quantity:recurring.reduce((s:number,l:any)=>s+l.quantity,0),frequency:"Every 28 days",
    nextBillingDate:next?new Date(next*1000).toLocaleDateString("en-GB"):null,next_billing_at:next,
    cancel_at_period_end:record.data.cancel_at_period_end,control:record.data.control,
    items:recurring.map((l:any)=>({title:l.name,quantity:l.quantity,unit_price:l.unit_minor/100})),shipping_amount:q.shipping_minor/100}
}
