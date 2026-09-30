import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { randomUUID } from "node:crypto"
import { actor, commerce, endpoint, operator } from "../../../../lib/commerce/http"
import { presentSubscription, subscriptionCommand } from "../../../../lib/commerce/subscriptions"
import { fail } from "../../../../lib/commerce/policy"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    actor(req)
    const ledger = commerce(req)
    const records = await ledger.list("subscription")
    const id = req.query.id as string | undefined

    if (id) {
      const found = records.find(s => s.id === id || s.data?.stripe_id === id)
      return { subscription: found ? presentSubscription(found) : null }
    }

    const subscriptions = records.map(presentSubscription)
    return { subscriptions, count: subscriptions.length }
  })
}

export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = operator(req)
    const ledger = commerce(req)
    const body = (req.body || {}) as any

    if (!body.subscription_id) {
      fail("Subscription ID is required", 400)
    }

    const subscription = await ledger.get(body.subscription_id)
    if (!subscription?.owner_id || subscription.kind !== "subscription") {
      fail("Subscription not found", 404)
    }

    const operation_id = body.operation_id || randomUUID()
    await ledger.audit(subscription.id, admin, "admin-subscription-command", {
      action: body.action,
      operation_id,
    })

    const updated = await subscriptionCommand(ledger, subscription.owner_id, {
      subscription_id: body.subscription_id,
      action: body.action,
      operation_id,
      date: body.date,
      cadence_days: body.cadence_days,
      pause_duration_months: body.pause_duration_months,
      address: body.address,
    })

    return { subscription: updated }
  })
}
