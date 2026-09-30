import { z } from "zod"
export const addressSchema = z.object({
  id: z.string().optional().nullable(),
  first_name: z.string().trim().max(100).optional().default(""),
  last_name: z.string().trim().max(100).optional().default(""),
  company: z.string().max(100).optional().nullable(),
  address_1: z.string().trim().min(1).max(200),
  address_2: z.string().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().min(1).max(20),
  country_code: z.string().trim().transform((c) => c.toLowerCase()).pipe(z.string().regex(/^[a-z]{2}$/)),
  province: z.string().max(100).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
}).passthrough()

export const checkoutItemSchema = z.object({
  variant_id: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
  recurring: z.boolean(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
})

export const checkoutSchema = z.object({
  revision: z.string().uuid(),
  address: addressSchema.optional().nullable(),
  country_code: z.string().trim().transform((c) => c.toLowerCase()).pipe(z.string().regex(/^[a-z]{2}$/)).default("gb"),
  items: z.array(checkoutItemSchema).min(1).max(30),
  ruo_accepted: z.literal(true),
  recurring_accepted: z.boolean(),
  payment_method: z.enum(["stripe"]).default("stripe"),
  shipping_option_id: z.string().trim().min(3).max(100).optional(),
  ui_mode: z.enum(["embedded", "hosted", "embedded_page", "hosted_page"]).default("embedded").optional(),
}).strict()

export function fail(message: string, status = 400): never {
  const error: any = new Error(message); error.status = status; throw error
}
export function owned(record: any, customer: string, profile?: string) {
  if (!record || record.owner_id !== customer || (profile && record.profile !== profile)) fail("Record not found", 404)
  return record
}
export function toMinor(value: string | number): number {
  const text = String(value)
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) fail("Price must be a non-negative exact GBP amount")
  const [whole, fraction = ""] = text.split(".")
  const result = Number(whole) * 100 + Number(fraction.padEnd(2,"0"))
  if (!Number.isSafeInteger(result)) fail("Price is outside the supported range")
  return result
}
export function discounted(amount: number): number { return Math.floor((amount * 90 + 50) / 100) }
export function assertEligibility(customer: any) {
  if (!customer?.has_account || customer.metadata?.compliance_ack !== true) {
    fail("Complete the 18+ research-use declaration during signup before purchasing.", 403)
  }
}
export function assertProduct(approval: any, country: string, recurring: boolean) {
  if (approval?.state !== "approved" || !approval.data?.canonical_name || !approval.data?.evidence_ref ||
    !approval.data.destinations?.includes(country)) fail("This product requires catalogue review before purchase.", 409)
  if (recurring && !["refill","vial"].includes(approval.data.format)) fail("Pen sets are one-time purchases only.")
}
export function publicError(error: any) {
  if (error instanceof z.ZodError) {
    const details = error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`).join("; ")
    console.error("[PEPTECH Commerce Validation Error]:", details, JSON.stringify(error.issues))
    return { status: 400, message: `Invalid request. Check required fields: ${details}` }
  }
  console.error("[PEPTECH Commerce Error]:", error)
  return { status: error.status || 503, message: error.message || "This operation could not finish. Retry the same request or contact support." }
}
