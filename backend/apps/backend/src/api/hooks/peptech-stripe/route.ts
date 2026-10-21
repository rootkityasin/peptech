import type { MedusaRequest,MedusaResponse } from "@medusajs/framework/http"
import { stripeContext } from "../../../lib/commerce/stripe"
import { commerce } from "../../../lib/commerce/http"
import { recordId } from "../../../modules/peptech-commerce/service"
import { createHash } from "node:crypto"
export async function POST(req:MedusaRequest,res:MedusaResponse) {
  let event:any;let context:ReturnType<typeof stripeContext>
  try {
    context=stripeContext()
    const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET
    if(!secret) return res.status(503).json({message:"Webhook destination is not configured"})
    if(!req.rawBody || typeof req.headers["stripe-signature"]!=="string") return res.status(400).json({message:"Signature required"})
    event=context.stripe.webhooks.constructEvent(req.rawBody,req.headers["stripe-signature"],secret)
    if(event.livemode!==(context.mode==="live") || (event.account && event.account!==context.accountId)) return res.status(400).json({message:"Event account mismatch"})
  } catch { return res.status(400).json({message:"Invalid Stripe signature"}) }
  try {
    const ledger = commerce(req)
    const eventId = recordId("event", context.profile, event.id)
    await ledger.create({
      id: eventId,
      kind: "event",
      profile: context.profile,
      owner_id: null,
      state: "pending",
      data: {
        stripe_event_id: event.id,
        type: event.type,
        object_id: event.data.object.id,
        created: event.created,
        digest: createHash("sha256").update(req.rawBody).digest("hex"),
        attempts: 0,
      },
    })

    // Pure event-driven execution: immediately trigger event processing
    try {
      const { processEvent } = await import("../../../lib/commerce/events.js")
      await processEvent(req.scope, ledger, eventId)
    } catch (procErr: any) {
      console.warn(`[PEPTECH Webhook Event Deferred to Recovery Queue]: ${procErr?.message || procErr}`)
    }

    return res.status(200).json({ received: true })
  } catch {
    return res.status(503).json({ message: "Webhook storage unavailable; retry required" })
  }
}
