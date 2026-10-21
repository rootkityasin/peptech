import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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

    // Filter autoPromos to item/order promotions so shipping promos do not overwrite subscription auto-savings
    const itemAutoPromo = autoPromos.find(
      (p: any) => p.application_method?.target_type !== "shipping_methods"
    ) || autoPromos.find((p: any) => p.code === "AUTODIS") || autoPromos[0]

    const autoPromo = itemAutoPromo
    let autoDiscountType = "percentage"
    let autoDiscountValue = 10
    let autoCurrencyCode = "gbp"
    let autoPromoCode = "AUTODIS"
    let autoPromoId = "promo_default"

    if (autoPromo && autoPromo.application_method?.target_type !== "shipping_methods") {
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

    // Free Shipping Promotion (target_type: "shipping_methods" or code: "FREESHIP150")
    let freeShippingPromo: any = null

    try {
      const { data: fsPromos = [] } = await query.graph({
        entity: "promotion",
        fields: [
          "id",
          "code",
          "type",
          "status",
          "is_automatic",
          "metadata",
          "application_method.*",
          "application_method.target_rules.*",
          "application_method.target_rules.values.*",
          "rules.*",
          "rules.values.*",
        ],
        filters: {
          code: "FREESHIP150",
        },
      })
      freeShippingPromo = fsPromos[0]
    } catch {
      freeShippingPromo = autoPromos.find(
        (p: any) => p.application_method?.target_type === "shipping_methods" || p.code === "FREESHIP150"
      )
    }

    if (!freeShippingPromo) {
      freeShippingPromo = autoPromos.find(
        (p: any) => p.application_method?.target_type === "shipping_methods" || p.code === "FREESHIP150"
      )
    }

    // Attempt to load target rules via Promotion Module if not present on application_method
    if (freeShippingPromo && (!freeShippingPromo.application_method?.target_rules || freeShippingPromo.application_method.target_rules.length === 0)) {
      const appMethodId = freeShippingPromo.application_method?.id
      let targetRulesLoaded = false

      try {
        const promotionModule = req.scope.resolve(Modules.PROMOTION)
        if (promotionModule && freeShippingPromo.id) {
          const fullPromo = await promotionModule.retrievePromotion(freeShippingPromo.id, {
            relations: ["application_method.target_rules.values", "rules.values"],
          })
          if (fullPromo?.application_method?.target_rules?.length) {
            if (!freeShippingPromo.application_method) freeShippingPromo.application_method = {}
            freeShippingPromo.application_method.target_rules = fullPromo.application_method.target_rules
            targetRulesLoaded = true
          }
        }
      } catch (err: any) {
        console.warn("[PEPTECH Active Promotions] Promotion module retrievePromotion warning:", err?.message || err)
      }

      // Single-tier fallback via Medusa's managed database connection
      if (!targetRulesLoaded && appMethodId) {
        try {
          const pgConn: any = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION, { allowUnregistered: true }) || req.scope.resolve("pgConnection", { allowUnregistered: true })
          if (pgConn && typeof pgConn.raw === "function") {
            const trResult = await pgConn.raw(
              `SELECT pr.id, pr.attribute, pr.operator, array_agg(prv.value) as values
               FROM application_method_target_rules amtr
               JOIN promotion_rule pr ON amtr.promotion_rule_id = pr.id
               LEFT JOIN promotion_rule_value prv ON prv.promotion_rule_id = pr.id
               WHERE amtr.application_method_id = ?
               GROUP BY pr.id, pr.attribute, pr.operator`,
              [appMethodId]
            )
            const rows = trResult?.rows || trResult
            if (rows?.length) {
              if (!freeShippingPromo.application_method) freeShippingPromo.application_method = {}
              freeShippingPromo.application_method.target_rules = rows.map((r: any) => ({
                id: r.id,
                attribute: r.attribute,
                operator: r.operator,
                values: (r.values || []).map((v: string) => ({ value: v })),
              }))
            }
          }
        } catch (dbErr: any) {
          console.error("[PEPTECH Active Promotions] Database query for target rules failed:", dbErr?.message || dbErr)
        }
      }
    }

    // Fetch shipping option types to map IDs to type codes (e.g. 'standard', 'express')
    const typeCodeToIdMap: Record<string, string> = {}
    const idToTypeCodeMap: Record<string, string> = {}
    try {
      const { data: sTypes = [] } = await query.graph({
        entity: "shipping_option_type",
        fields: ["id", "code", "label"],
      })
      for (const st of sTypes) {
        if (st.code && st.id) {
          typeCodeToIdMap[st.code.toLowerCase()] = st.id
          idToTypeCodeMap[st.id] = st.code.toLowerCase()
        }
      }
    } catch {
      // Fallback known standard/express mappings
      idToTypeCodeMap["sotype_01M2AQBJF36KA7QFAXD9C4VYWQ"] = "standard"
      idToTypeCodeMap["sotype_01M2AQBJF4QM55WST41DD0PP99"] = "express"
      typeCodeToIdMap["standard"] = "sotype_01M2AQBJF36KA7QFAXD9C4VYWQ"
      typeCodeToIdMap["express"] = "sotype_01M2AQBJF4QM55WST41DD0PP99"
    }

    // Extract target rules
    const targetRules = freeShippingPromo?.application_method?.target_rules || []
    const eligibleTypeIds: string[] = []
    const eligibleTypes: string[] = []
    const eligibleOptionIds: string[] = []

    for (const rule of targetRules) {
      const attr = String(rule.attribute || "")
      const rawVals: string[] = Array.isArray(rule.values)
        ? rule.values.map((v: any) => (typeof v === "object" ? v?.value : v)).filter(Boolean).map(String)
        : []

      if (attr.includes("shipping_option_type") || attr === "shipping_option_type_id") {
        for (const val of rawVals) {
          eligibleTypeIds.push(val)
          const mappedCode = idToTypeCodeMap[val]
          if (mappedCode) {
            eligibleTypes.push(mappedCode)
          } else {
            eligibleTypes.push(val.toLowerCase())
          }
        }
      } else if (attr.includes("shipping_option") || attr === "shipping_option_id") {
        for (const val of rawVals) {
          eligibleOptionIds.push(val)
        }
      }
    }

    const hasTargetRules = targetRules.length > 0

    function extractThreshold(promo: any, fallback = 150): number {
      if (promo?.metadata?.threshold) {
        const val = Number(promo.metadata.threshold)
        if (!isNaN(val) && val > 0) return val
      }
      const title = String(promo?.metadata?.title || promo?.title || "")
      const match = title.match(/(?:over|spend|above|min|minimum)\s*[£$€]?\s*(\d+(?:\.\d+)?)/i)
      if (match && Number(match[1]) > 0) {
        return Number(match[1])
      }
      const code = String(promo?.code || "")
      const codeMatch = code.match(/(\d+)/)
      if (codeMatch && Number(codeMatch[1]) > 0) {
        return Number(codeMatch[1])
      }
      return fallback
    }

    const freeShippingEnabled = freeShippingPromo ? freeShippingPromo.status === "active" : true
    const freeShippingThreshold = extractThreshold(freeShippingPromo, 150)
    const freeShippingTitle = freeShippingPromo?.metadata?.title || `Free Tracked 24 Shipping over £${freeShippingThreshold}`
    const freeShippingCode = freeShippingPromo?.code || "FREESHIP150"

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
      free_shipping: {
        enabled: freeShippingEnabled,
        threshold: freeShippingThreshold,
        title: freeShippingTitle,
        code: freeShippingCode,
        delivery_method: freeShippingPromo?.metadata?.delivery_method || "Royal Mail Tracked 24",
        storefront_message: freeShippingPromo?.metadata?.storefront_message || "Add {remaining} more for Free Tracked 24 Shipping",
        rule_operator: freeShippingPromo?.metadata?.rule_operator || "gte",
        has_target_rules: hasTargetRules,
        eligible_types: Array.from(new Set(eligibleTypes)),
        eligible_type_ids: Array.from(new Set(eligibleTypeIds)),
        eligible_option_ids: Array.from(new Set(eligibleOptionIds)),
      },
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
      free_shipping: {
        enabled: true,
        threshold: 150,
        title: "Free Tracked 24 Shipping over £150",
        code: "FREESHIP150",
        has_target_rules: true,
        eligible_types: ["standard"],
        eligible_type_ids: [],
        eligible_option_ids: [],
      },
    })
  }
}

