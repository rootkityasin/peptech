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

// OPTIONS /store/custom/promotions/active - Preflight
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Access-Control-Max-Age", "86400")
  return res.status(204).end()
}

// GET /store/custom/promotions/active - Retrieve both active automatic and manual promotions
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) || req.scope.resolve("query")

    // 1. Fetch active automatic promotions for subscription auto-savings
    let { data: autoPromos = [] } = await query.graph({
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

    if (!autoPromos || autoPromos.length === 0) {
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
      autoPromos = fallbackResult.data || []
    }

    const autoPromo = autoPromos[0]
    let autoDiscountType = "percentage"
    let autoDiscountValue = 10
    let autoCurrencyCode = "gbp"
    let autoPromoCode = "AUTODIS"
    let autoPromoId = "promo_default"

    if (autoPromo) {
      autoPromoId = autoPromo.id
      autoPromoCode = autoPromo.code
      const method = autoPromo.application_method
      if (method) {
        autoDiscountType = method.type || "percentage"
        autoDiscountValue = Number(method.value || 10)
        autoCurrencyCode = (method.currency_code || "gbp").toLowerCase()
      }
    }

    const autoCurrencySymbol = autoCurrencyCode === "usd" ? "$" : autoCurrencyCode === "eur" ? "€" : "£"
    const autoText = autoDiscountType === "percentage"
      ? `${autoDiscountValue}% auto-savings`
      : `${autoCurrencySymbol}${autoDiscountValue} auto-savings`

    const autoBadgeText = autoDiscountType === "percentage"
      ? `${autoDiscountValue}% Off`
      : `${autoCurrencySymbol}${autoDiscountValue} Off`

    const autoSaveText = autoDiscountType === "percentage"
      ? `Save ${autoDiscountValue}%`
      : `Save ${autoCurrencySymbol}${autoDiscountValue}`

    const autoFullText = `Every 28 days · ${autoText}`

    // 2. Fetch active manual promotion codes (is_automatic: false) to feature on storefront
    const { data: manualPromos = [] } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "type",
        "status",
        "limit",
        "used",
        "is_automatic",
        "metadata",
        "updated_at",
        "application_method.*",
      ],
      filters: {
        status: "active",
        is_automatic: false,
      },
      pagination: {
        order: { updated_at: "DESC" },
      },
    })

    // Filter out internal subscription-only codes like SUB28-10 if not meant for public input
    const publicManualPromo = manualPromos.find((p: any) => {
      // Must not have exhausted redemption limits
      if (p.limit !== null && p.limit !== undefined && Number(p.used || 0) >= Number(p.limit)) {
        return false
      }
      return true
    })

    let featuredPromo: any = null
    if (publicManualPromo) {
      const method = publicManualPromo.application_method
      const mDiscountType = method?.type || "percentage"
      const mDiscountValue = Number(method?.value || 10)
      const mCurrencyCode = (method?.currency_code || "gbp").toLowerCase()
      const mCurrencySymbol = mCurrencyCode === "usd" ? "$" : mCurrencyCode === "eur" ? "€" : "£"

      const mBadgeText = mDiscountType === "percentage"
        ? `${mDiscountValue}% Off`
        : `${mCurrencySymbol}${mDiscountValue} Off`

      const mSaveText = mDiscountType === "percentage"
        ? `Save ${mDiscountValue}%`
        : `Save ${mCurrencySymbol}${mDiscountValue}`

      const title = publicManualPromo.metadata?.title || (publicManualPromo.code === "RESEARCH10" ? "Institutional Research Discount (10% Off)" : `Promo Code ${publicManualPromo.code}`)
      const announcement = `Use code ${publicManualPromo.code} for ${mBadgeText} one-time research orders`

      featuredPromo = {
        id: publicManualPromo.id,
        code: publicManualPromo.code,
        title,
        is_automatic: false,
        discount_type: mDiscountType,
        discount_value: mDiscountValue,
        currency_code: mCurrencyCode,
        badge_text: mBadgeText,
        save_text: mSaveText,
        announcement,
      }
    }

    return res.status(200).json({
      success: true,
      auto_savings: {
        id: autoPromoId,
        code: autoPromoCode,
        is_automatic: true,
        discount_type: autoDiscountType,
        discount_value: autoDiscountValue,
        currency_code: autoCurrencyCode,
        text: autoText,
        full_text: autoFullText,
        badge_text: autoBadgeText,
        save_text: autoSaveText,
      },
      featured_promo: featuredPromo,
    })
  } catch (err: any) {
    console.error("[PEPTECH ACTIVE PROMOTIONS API ERROR]:", err)
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
      featured_promo: {
        id: "promo_01RESEARCH10PEPT",
        code: "RESEARCH10",
        title: "Institutional Research Discount (10% Off)",
        is_automatic: false,
        discount_type: "percentage",
        discount_value: 10,
        currency_code: "gbp",
        badge_text: "10% Off",
        save_text: "Save 10%",
        announcement: "Use code RESEARCH10 for 10% off one-time research orders",
      },
    })
  }
}
