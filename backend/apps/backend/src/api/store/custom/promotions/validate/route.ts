import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { endpoint } from "../../../../../lib/commerce/http"
import { lookupActivePromotion, calculatePromotionDiscount } from "../../../../../lib/commerce/promotions"

const validateSchema = z.object({
  code: z.string().trim().min(1, "Promo code cannot be empty").max(50),
  items: z.array(z.object({
    unit_minor: z.number().int().nonnegative().optional().default(0),
    quantity: z.number().int().positive().optional().default(1),
    recurring: z.boolean().optional().default(false),
  })).optional().default([]),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const parsed = validateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        valid: false,
        message: parsed.error.issues[0]?.message || "Invalid promotion verification request.",
      })
    }

    const { code, items } = parsed.data
    const result = await lookupActivePromotion(code)

    if (!result.valid || !result.promotion) {
      return res.status(400).json({
        valid: false,
        message: result.message || "Invalid or inactive promo code.",
      })
    }

    const promo = result.promotion
    const discountMinor = calculatePromotionDiscount(promo, items)

    return {
      valid: true,
      code: promo.code,
      title: promo.metadata?.title || (promo.code === "SUB28-10" ? "Subscribe & Save (28-Day Protocol)" : promo.code),
      type: promo.method_type,
      value: promo.value,
      discount_minor: discountMinor,
      discount_gbp: (discountMinor / 100).toFixed(2),
      message: `Promo code "${promo.code}" applied successfully.`,
    }
  })
}
