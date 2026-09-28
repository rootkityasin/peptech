import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Replaced by Medusa's native, signature-verified /hooks/payment/<provider>.
export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "This webhook is retired. Configure the native Medusa Stripe webhook endpoint." })
}
