import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ValidatePromoCodeSchema } from "./middlewares"

// Helper to set CORS headers
function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = (req.headers.origin as string) || ""
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, Accept, Cache-Control, X-Requested-With")
}

// OPTIONS /store/custom/promotions/validate - Handle CORS preflight
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Access-Control-Max-Age", "86400")
  return res.status(204).end()
}

// POST /store/custom/promotions/validate - Validate a promo code using Medusa Promotion Module
export async function POST(
  req: MedusaRequest<ValidatePromoCodeSchema>,
  res: MedusaResponse
) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-store")
  try {
    const { code, subtotal, currency_code } = req.validatedBody || (req.body as any) || {}

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ valid: false, message: "Please provide a valid promotional code." })
    }

    const normalizedCode = code.trim().toUpperCase()
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) || req.scope.resolve("query")

    // Fetch promotion and application method via Medusa 2.0 query graph
    const { data: promotions = [] } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "type",
        "status",
        "limit",
        "used",
        "metadata",
        "is_automatic",
        "application_method.*",
      ],
      filters: {
        code: normalizedCode,
      },
    })

    const promo = promotions[0]

    if (!promo || promo.status !== "active") {
      return res.status(404).json({ valid: false, message: "Invalid or inactive promotional code." })
    }

    // Check redemption limits
    if (promo.limit !== null && promo.limit !== undefined && Number(promo.used || 0) >= Number(promo.limit)) {
      return res.status(400).json({ valid: false, message: "This promotional code has reached its maximum redemptions." })
    }

    const method = promo.application_method
    const discountType = method?.type || "percentage"
    const discountValue = Number(method?.value || 0)
    const numericSubtotal = Math.max(0, Number(subtotal) || 0)

    let discountAmount = 0
    if (discountType === "percentage") {
      discountAmount = Number(((numericSubtotal * discountValue) / 100).toFixed(2))
    } else if (discountType === "fixed") {
      discountAmount = Math.min(discountValue, numericSubtotal)
    }

    const title = promo.metadata?.title || (promo.code === "RESEARCH10" ? "Institutional Research Discount (10% Off)" : promo.code)

    return res.status(200).json({
      valid: true,
      promotion: {
        id: promo.id,
        code: promo.code,
        title,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        currency_code: method?.currency_code || currency_code || "gbp",
      },
    })
  } catch (err: any) {
    console.error("[PEPTECH PROMO VALIDATION ERROR]:", err)
    return res.status(500).json({ valid: false, message: err.message || "Failed to validate promotional code." })
  }
}
