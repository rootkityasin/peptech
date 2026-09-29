import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { prepareCheckout, publicAttempt } from "../../../../lib/commerce/checkout"
import { owned } from "../../../../lib/commerce/policy"
import { reconcileSession } from "../../../../lib/commerce/events"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, () => prepareCheckout(req.scope, commerce(req), actor(req), req.body))
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const ledger = commerce(req)
    const attemptId = String(req.query.attempt_id || "")
    let attempt = owned(await ledger.get(attemptId), actor(req))
    const sessionId = (req.query.session_id as string) || attempt.data?.session_id

    if (attempt && sessionId && !["confirmed", "held", "expired", "failed"].includes(attempt.state)) {
      try {
        await reconcileSession(req.scope, ledger, sessionId)
        const refreshed = await ledger.get(attempt.id)
        if (refreshed) attempt = refreshed
      } catch (e: any) {
        console.warn("[PEPTECH Commerce] Auto-reconciliation on checkout GET warning:", e?.message || e)
      }
    }

    return publicAttempt(attempt)
  })
}
