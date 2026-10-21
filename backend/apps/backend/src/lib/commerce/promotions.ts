import { Pool } from "pg"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: (process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1")) ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    })
  }
  return pool
}

export interface PromotionRecord {
  id: string
  code: string
  status: string
  type: string
  limit: number | null
  used: number
  metadata: Record<string, any> | null
  method_type: "percentage" | "fixed"
  value: number
  target_type: string
  allocation?: string | null
  currency_code?: string | null
}

export interface PromotionLookupResult {
  valid: boolean
  message?: string
  promotion?: PromotionRecord
}

export async function lookupActivePromotion(code: string, externalPool?: Pool): Promise<PromotionLookupResult> {
  const cleanCode = (code || "").trim()
  if (!cleanCode) {
    return { valid: false, message: "Promotion code is required." }
  }

  const db = externalPool || getPool()
  const query = `
    SELECT p.id, p.code, p.status, p.type, p.limit, p.used, p.metadata,
           m.type AS method_type, m.value, m.target_type, m.allocation, m.currency_code
    FROM promotion p
    LEFT JOIN promotion_application_method m ON m.promotion_id = p.id AND m.deleted_at IS NULL
    WHERE p.code ILIKE $1 AND p.deleted_at IS NULL
    LIMIT 1;
  `

  try {
    const res = await db.query(query, [cleanCode])
    if (!res.rows.length) {
      return { valid: false, message: `Promo code "${cleanCode}" was not found.` }
    }

    const row = res.rows[0]
    if (row.status !== "active") {
      return { valid: false, message: `Promo code "${row.code}" is currently ${row.status}.` }
    }

    if (row.limit !== null && Number(row.used) >= Number(row.limit)) {
      return { valid: false, message: `Promo code "${row.code}" has reached its maximum redemption limit.` }
    }

    const value = parseFloat(row.value || "0")
    if (isNaN(value) || value <= 0) {
      return { valid: false, message: `Promo code "${row.code}" has no valid discount value configured.` }
    }

    const promotion: PromotionRecord = {
      id: row.id,
      code: row.code,
      status: row.status,
      type: row.type,
      limit: row.limit !== null ? Number(row.limit) : null,
      used: Number(row.used || 0),
      metadata: row.metadata || null,
      method_type: row.method_type === "fixed" ? "fixed" : "percentage",
      value,
      target_type: row.target_type || "items",
      allocation: row.allocation || null,
      currency_code: row.currency_code || "gbp",
    }

    return { valid: true, promotion }
  } catch (err: any) {
    console.error("[PEPTECH PROMOTIONS LOOKUP ERROR]:", err)
    return { valid: false, message: "Failed to verify promo code due to a database error." }
  }
}

export function calculatePromotionDiscount(
  promotion: PromotionRecord,
  items: Array<{ unit_minor: number; quantity: number; recurring: boolean }>
): number {
  // Stacking Guard: subscriptions already receive the mandatory 10% Subscribe & Save discount.
  // Promo codes apply strictly to one-time purchase items to protect margins.
  const eligibleItems = items.filter((i) => !i.recurring)
  if (!eligibleItems.length) return 0

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, i) => sum + Math.round(Number(i.unit_minor) || 0) * (Number(i.quantity) || 1),
    0
  )

  if (eligibleSubtotal <= 0) return 0

  if (promotion.method_type === "percentage") {
    const pct = Math.min(100, Math.max(0, promotion.value))
    const discount = Math.round((eligibleSubtotal * pct) / 100)
    return Math.min(eligibleSubtotal, discount)
  }

  if (promotion.method_type === "fixed") {
    // If value is stored in GBP pounds (e.g. 10.00), convert to minor pence.
    // If already stored as minor units (> 100), preserve as is.
    const fixedMinor = promotion.value >= 100 ? Math.round(promotion.value) : Math.round(promotion.value * 100)
    return Math.min(eligibleSubtotal, fixedMinor)
  }

  return 0
}

export async function recordPromotionUsage(
  promoCode: string,
  orderId: string,
  externalPool?: Pool
): Promise<void> {
  const cleanCode = (promoCode || "").trim()
  if (!cleanCode || !orderId) return

  const db = externalPool || getPool()
  try {
    const res = await db.query(
      `SELECT id FROM promotion WHERE code ILIKE $1 AND deleted_at IS NULL LIMIT 1`,
      [cleanCode]
    )
    if (!res.rows.length) return
    const promoId = res.rows[0].id

    await db.query(
      `UPDATE promotion SET used = COALESCE(used, 0) + 1, updated_at = NOW() WHERE id = $1`,
      [promoId]
    )

    const ordPromoId = `ordpromo_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    await db.query(
      `INSERT INTO order_promotion (id, order_id, promotion_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [ordPromoId, orderId, promoId]
    )
  } catch (err: any) {
    console.error("[PEPTECH RECORD PROMOTION USAGE ERROR]:", err)
  }
}
