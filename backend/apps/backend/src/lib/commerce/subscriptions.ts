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
export const commandSchema = z.object({
  subscription_id: z.string().min(1),
  operation_id: z.string().uuid(),
  action: z.enum(["pause", "resume", "skip", "cancel", "change_date", "change_cadence", "update_dosage", "update_address"]),
  date: z.string().datetime().optional(),
  pause_duration_months: z.number().int().min(1).max(12).optional(),
  cadence_days: z.number().int().min(7).max(90).optional(),
  variant_id: z.string().optional(),
  strength: z.string().optional(),
  address: z.record(z.string(), z.any()).optional(),
}).strict()

export async function subscriptionCommand(ledger: CommerceService, customer: string, body: unknown) {
  const input = commandSchema.parse(body)
  let context: any = null
  try {
    context = stripeContext()
  } catch {}
  return ledger.locked(input.subscription_id, async () => {
    const raw = await ledger.get(input.subscription_id)
    if (!raw || raw.owner_id !== customer || raw.kind !== "subscription") fail("Subscription not found", 404)
    const record = raw
    const key = recordId("operation", record.id, input.operation_id)
    let operation = await ledger.get(key)
    if (operation && !isDeepStrictEqual(operation.data.input, input)) fail("Operation ID reused for a different command", 409)
    if (operation?.state === "done") return presentSubscription(record)

    let current: any = null
    if (context && record.data.stripe_id) {
      try {
        current = await context.stripe.subscriptions.retrieve(record.data.stripe_id)
        if (["canceled", "incomplete_expired"].includes(current.status)) fail("Subscription has ended", 409)
        if (current.cancel_at_period_end && input.action !== "cancel") fail("This subscription is ending. Start a new subscription to purchase future deliveries.", 409)
        const open = await context.stripe.invoices.list({ subscription: current.id, status: "open", limit: 1 })
        if (open.data.length && input.action !== "cancel") fail("An invoice is already in progress. Resolve it before changing the next cycle.", 409)
      } catch (stripeErr: any) {
        console.warn("Stripe subscription retrieve warning:", stripeErr?.message)
      }
    }

    const next = current ? periodEnd(current) : (record.data.next_billing_at || Math.floor(Date.now() / 1000) + 28 * 86400)
    if (!operation) {
      operation = await ledger.create({
        id: key,
        kind: "operation",
        profile: context?.profile || record.profile || "local:v1",
        owner_id: customer,
        state: "pending",
        data: { input },
      })
    }
    if (Date.now() - new Date(operation.created_at).getTime() > 23 * 3600000) fail("Command needs reconciliation before retry", 409)

    let params: any
    if (input.action === "pause") {
      params = { pause_collection: { behavior: "void" } }
      if (input.pause_duration_months) {
        const resumeSecs = next + input.pause_duration_months * 30 * 86400
        record.data.pause_until = resumeSecs
      } else if (input.date) {
        record.data.pause_until = Math.floor(Date.parse(input.date) / 1000)
      }
    }
    if (input.action === "resume") {
      params = { pause_collection: { behavior: "keep_as_draft" } }
      record.data.pause_until = null
    }
    if (input.action === "cancel") {
      params = { cancel_at_period_end: true, pause_collection: { behavior: "void" } }
    }
    if (input.action === "skip") {
      if (record.data.control === "paused") fail("Resume the subscription before skipping a cycle", 409)
      const cadence = record.data.cadence_days || 28
      operation.data.skip_until = operation.data.skip_until || next + cadence * 86400
      params = { pause_collection: { behavior: "keep_as_draft" } }
    }
    if (input.action === "change_date") {
      const target = Math.floor(Date.parse(input.date || "") / 1000)
      if (!Number.isFinite(target) || target < Math.floor(Date.now() / 1000) + 86400 || target > Math.floor(Date.now() / 1000) + 90 * 86400) {
        fail("Choose a renewal date between tomorrow and 90 days from now")
      }
      params = { trial_end: target, proration_behavior: "none", pause_collection: { behavior: "keep_as_draft" } }
    }
    if (input.action === "change_cadence") {
      record.data.cadence_days = input.cadence_days || 28
      params = { pause_collection: { behavior: "keep_as_draft" } }
    }
    if (input.action === "update_address" && input.address) {
      record.data.quote.address = { ...record.data.quote.address, ...input.address }
      params = { pause_collection: { behavior: "keep_as_draft" } }
    }
    if (input.action === "update_dosage" && (input.variant_id || input.strength)) {
      if (record.data.quote?.lines?.[0]) {
        if (input.variant_id) record.data.quote.lines[0].variant_id = input.variant_id
        if (input.strength) {
          record.data.quote.lines[0].metadata = {
            ...(record.data.quote.lines[0].metadata || {}),
            strength: input.strength,
          }
        }
      }
      params = { pause_collection: { behavior: "keep_as_draft" } }
    }

    await ledger.save(operation)
    if (params && context && current) {
      try {
        await context.stripe.subscriptions.update(current.id, params, { idempotencyKey: key })
      } catch (stripeErr: any) {
        console.warn("Stripe subscription update warning:", stripeErr?.message)
      }
    }
    if (input.action === "skip") record.data.skip_until = operation.data.skip_until
    else if (input.action === "pause") record.data.control = "paused"
    else if (input.action === "cancel") {
      record.data.control = "canceling"
      record.state = "canceled"
    }
    else if (input.action === "resume") record.data.control = "active"

    if (input.action === "change_date") record.data.next_billing_at = Math.floor(Date.parse(input.date!) / 1000)
    await ledger.save(record)
    await ledger.audit(record.id, customer, input.action, { operation_id: key, input })
    operation.state = "done"
    await ledger.save(operation)
    let synced: any = null
    if (context && current) {
      try {
        synced = await syncSubscription(ledger, current.id)
      } catch {}
    }
    return presentSubscription(synced || record)
  })
}

export function presentSubscription(record: LedgerRecord) {
  const q = record.data?.quote || { lines: [], address: {} }
  const recurring = q.lines ? q.lines.filter((l: any) => l.recurring) : []
  const cadenceDays = record.data?.cadence_days || 28
  const nextBilling = record.data?.skip_until && record.data?.next_billing_at < record.data?.skip_until
    ? record.data.next_billing_at + cadenceDays * 86400
    : record.data?.next_billing_at

  const firstItem = recurring[0] || {}
  const rawId = record.data?.stripe_id || record.id
  const shortId = `SUB-${rawId.slice(-4).toUpperCase()}`

  // Format clean next billing and dispatch dates
  const billingDateObj = nextBilling ? new Date(nextBilling * 1000) : null
  const nextBillingDate = billingDateObj ? billingDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null
  const autoBillDate = billingDateObj ? billingDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null

  // Dispatch is normally next day after successful billing
  let dispatchDateObj: Date | null = null
  let nextDispatchDate: string | null = null
  if (billingDateObj) {
    dispatchDateObj = new Date(billingDateObj)
    dispatchDateObj.setDate(dispatchDateObj.getDate() + 1)
    nextDispatchDate = dispatchDateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  }

  // Estimated delivery is 1-2 business days after dispatch
  let estimatedDeliveryDate: string | null = null
  if (dispatchDateObj) {
    const deliveryDateObj = new Date(dispatchDateObj)
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 1)
    estimatedDeliveryDate = deliveryDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const cadenceLabel = cadenceDays === 14
    ? "14-Day Cycle"
    : cadenceDays === 56
    ? "56-Day Cycle"
    : "28-Day Standard Cycle"

  const frequency = `Every ${cadenceDays} Days (${cadenceLabel})`
  const custName = [q.address?.first_name, q.address?.last_name].filter(Boolean).join(" ") || q.email || "Customer unavailable"

  const normalizedStatus = ["canceled", "incomplete_expired"].includes(record.state)
    ? "canceled"
    : record.data?.control === "paused"
    ? "paused"
    : record.data?.control === "canceling"
    ? "canceling"
    : "active"

  return {
    id: record.id,
    stripe_id: record.data?.stripe_id || null,
    sub_display_id: shortId,
    status: normalizedStatus,
    title: recurring.map((l: any) => l.name).join(", ") || firstItem.name || "Research Refill Cartridge",
    product_name: firstItem.name || "Research Refill Cartridge",
    format: firstItem.metadata?.format || "cartridge",
    strength: firstItem.metadata?.strength || "",
    protocol_info: firstItem.metadata?.options?.find((o: any) => o.label?.toLowerCase().includes("cartridge"))?.value
      || "28-Day Automated Research Reorder Cadence",
    price: (q.renewal_minor || 0) / 100,
    unit_price: (firstItem.unit_minor || 0) / 100,
    currency: q.currency || "gbp",
    quantity: recurring.reduce((s: number, l: any) => s + l.quantity, 0) || 1,
    cadence_days: cadenceDays,
    cadence_label: cadenceLabel,
    frequency,
    nextBillingDate,
    next_billing_at: nextBilling,
    next_renewal_date: nextBillingDate,
    autoBillDate,
    nextDispatchDate,
    estimatedDeliveryDate,
    cancel_at_period_end: record.data?.cancel_at_period_end || false,
    control: record.data?.control || "active",
    pause_until: record.data?.pause_until || null,
    customer_id: q.customer_id || record.owner_id || null,
    customer_name: custName,
    email: q.email || null,
    customer_email: q.email || null,
    created_at: record.created_at,
    shipping_address: q.address || {},
    recipient_name: custName,
    recipient_facility: q.address?.company || "",
    items: recurring.map((l: any) => ({
      title: l.name,
      quantity: l.quantity,
      unit_price: (l.unit_minor || 0) / 100,
      metadata: l.metadata || {},
    })),
    shipping_amount: (q.shipping_minor ?? 0) / 100,
    shipping_option_id: q.shipping_option_id || null,
    shipping_option_name: q.shipping_option_name || null,
    locked_discount_pct: 10,
  }
}
