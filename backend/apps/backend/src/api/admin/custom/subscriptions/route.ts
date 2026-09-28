import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    actor(req)
    const subscriptions = await commerce(req).list("subscription")
    const id = req.query.id
    if (id) return { subscription: subscriptions.find(s => s.id === id) || null }
    return { subscriptions, count: subscriptions.length }
  })
}
export async function PUT(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the audited commerce subscription command endpoint." })
}
