import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Helper to set CORS headers
function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = (req.headers.origin as string) || ""
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, Accept, Cache-Control, X-Requested-With")
}

// OPTIONS /store/custom/promotions/auto-savings - Preflight
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Access-Control-Max-Age", "86400")
  return res.status(204).end()
}

// GET /store/custom/promotions/auto-savings - Retrieve dynamic automatic promotion discount
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) || req.scope.resolve("query")

    // 1. Search for active automatic promotions
    let { data: promotions = [] } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "type",
        "status",
        "is_automatic",
        "metadata",
        "updated_at",
        "application_method.*",
      ],
      filters: {
        status: "active",
        is_automatic: true,
      },
      pagination: {
        order: { updated_at: "DESC" },
      },
    })

    // 2. Filter out shipping promotions — auto-savings only applies to line items, not shipping
    let itemPromotions = (promotions || []).filter((p: any) => {
      const targetType = p.application_method?.target_type
      return targetType !== "shipping_methods" && p.code !== "FREESHIP150"
    })

    // 3. Fallback to active promotions with code AUTODIS or SUB28-10 if is_automatic filter didn't match
    if (itemPromotions.length === 0) {
      const fallbackResult = await query.graph({
        entity: "promotion",
        fields: [
          "id",
          "code",
          "type",
          "status",
          "is_automatic",
          "metadata",
          "updated_at",
          "application_method.*",
        ],
        filters: {
          status: "active",
          code: ["AUTODIS", "SUB28-10"],
        },
        pagination: {
          order: { updated_at: "DESC" },
        },
      })
      itemPromotions = (fallbackResult.data || []).filter((p: any) => {
        const targetType = p.application_method?.target_type
        return targetType !== "shipping_methods" && p.code !== "FREESHIP150"
      })
    }

    const promo = itemPromotions[0]

    let discountType = "percentage"
    let discountValue = 10
    let currencyCode = "gbp"
    let promoCode = "AUTODIS"
    let promoId = "promo_default"

    if (promo) {
      promoId = promo.id
      promoCode = promo.code
      const method = promo.application_method
      if (method) {
        discountType = method.type || "percentage"
        discountValue = Number(method.value || 10)
        currencyCode = (method.currency_code || "gbp").toLowerCase()
      }
    }

    const currencySymbol = currencyCode === "usd" ? "$" : currencyCode === "eur" ? "€" : "£"
    const text = discountType === "percentage"
      ? `${discountValue}% auto-savings`
      : `${currencySymbol}${discountValue} auto-savings`

    const badgeText = discountType === "percentage"
      ? `${discountValue}% Off`
      : `${currencySymbol}${discountValue} Off`

    const saveText = discountType === "percentage"
      ? `Save ${discountValue}%`
      : `Save ${currencySymbol}${discountValue}`

    const fullText = `Every 28 days · ${text}`

    return res.status(200).json({
      success: true,
      auto_savings: {
        id: promoId,
        code: promoCode,
        is_automatic: true,
        discount_type: discountType,
        discount_value: discountValue,
        currency_code: currencyCode,
        text,
        full_text: fullText,
        badge_text: badgeText,
        save_text: saveText,
      },
    })
  } catch (err: any) {
    console.error("[PEPTECH AUTO-SAVINGS API ERROR]:", err)
    return res.status(200).json({
      success: true,
      auto_savings: {
        id: "promo_default",
        code: "AUTODIS",
        is_automatic: true,
        discount_type: "percentage",
        discount_value: 10,
        currency_code: "gbp",
        text: "10% auto-savings",
        full_text: "Every 28 days · 10% auto-savings",
        badge_text: "10% Off",
        save_text: "Save 10%",
      },
    })
  }
}
