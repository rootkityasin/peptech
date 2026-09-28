import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getStripeConfig } from "../../../../lib/stripe-config"

// Public runtime configuration: secret keys never leave the backend.
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    const config = getStripeConfig()
    return res.json({
      is_active: Boolean(config),
      mode: config?.mode || null,
      publishable_key: config?.publishableKey || null,
      provider_id: config?.providerId || null,
    })
  } catch {
    return res.status(503).json({ message: "Card payments are not configured. Please contact support." })
  }
}

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use Medusa cart payment sessions. Client-supplied payment amounts are not accepted." })
}
