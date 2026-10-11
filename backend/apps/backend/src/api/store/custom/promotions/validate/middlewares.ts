import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const ValidatePromoCodeSchema = z.object({
  code: z.string().min(1, "Please provide a valid promotional code."),
  subtotal: z.number().optional().default(0),
  one_time_subtotal: z.number().optional().default(0),
  has_subscription_items: z.boolean().optional().default(false),
  currency_code: z.string().optional().default("gbp"),
})

export type ValidatePromoCodeSchema = z.infer<typeof ValidatePromoCodeSchema>

export const validatePromoMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/custom/promotions/validate",
    method: "POST",
    middlewares: [validateAndTransformBody(ValidatePromoCodeSchema)],
  },
]
