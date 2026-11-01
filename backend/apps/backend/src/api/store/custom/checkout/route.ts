import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { prepareCheckout, publicAttempt } from "../../../../lib/commerce/checkout"
import { owned } from "../../../../lib/commerce/policy"
import { reconcileSession } from "../../../../lib/commerce/events"

const checkoutRateLimitMap = new Map<string, number[]>()
const CHECKOUT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_CHECKOUT_ATTEMPTS = 15 // 15 attempts per 15 minutes per customer/IP

function checkCheckoutRateLimit(key: string): boolean {
  const now = Date.now()
  const timestamps = checkoutRateLimitMap.get(key) || []
  const recent = timestamps.filter((t) => now - t < CHECKOUT_WINDOW_MS)
  if (recent.length >= MAX_CHECKOUT_ATTEMPTS) {
    checkoutRateLimitMap.set(key, recent)
    return false
  }
  recent.push(now)
  checkoutRateLimitMap.set(key, recent)
  return true
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  const customerId = actor(req)
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    customerId

  const rateKey = `${customerId}:${ip}`
  if (!checkCheckoutRateLimit(rateKey)) {
    return res.status(429).json({
      message: "Too many checkout attempts. Please wait 15 minutes before trying again.",
      code: "RATE_LIMITED",
    })
  }

  return endpoint(res, () => prepareCheckout(req.scope, commerce(req), customerId, req.body, req))
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
