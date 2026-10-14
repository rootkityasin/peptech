import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { commerceTick } from "../../../lib/commerce/worker"
import { getStripeConfig } from "../../../lib/stripe-config"

/**
 * Dedicated endpoint to wake up Hostinger Node.js processes and execute
 * the PEPTECH commerce tick (renewal invoice preflights, subscription syncs, email notifications).
 *
 * Can be triggered via Hostinger hPanel Cron Job or any external scheduler.
 * Authenticated via 'x-cron-secret' header or '?secret=' query parameter.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return handleCronTick(req, res)
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return handleCronTick(req, res)
}

async function handleCronTick(req: MedusaRequest, res: MedusaResponse) {
  const configuredSecret = process.env.COMMERCE_CRON_SECRET?.trim()
  const authHeader = (req.headers["authorization"] as string)?.replace(/^Bearer\s+/i, "").trim()
  const headerSecret = (req.headers["x-cron-secret"] as string)?.trim()
  const querySecret = (req.query?.secret as string)?.trim()
  const providedSecret = headerSecret || authHeader || querySecret

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid x-cron-secret header, Bearer token, or secret query parameter is required.",
    })
  }

  const startTime = Date.now()

  try {
    let config: any = null
    try {
      config = getStripeConfig()
    } catch {
      config = null
    }

    if (!config) {
      return res.status(200).json({
        status: "skipped",
        message: "Stripe configuration is not active or incomplete.",
        duration_ms: Date.now() - startTime,
      })
    }

    await commerceTick(req.scope)

    return res.status(200).json({
      status: "success",
      message: "PEPTECH commerce tick executed successfully.",
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const logger = req.scope.resolve("logger") as any
    logger?.error?.(`[PEPTECH Commerce Cron] Error executing commerce tick: ${error?.message || error}`)

    return res.status(500).json({
      status: "error",
      message: error?.message || "Failed to execute commerce tick.",
      duration_ms: Date.now() - startTime,
    })
  }
}
