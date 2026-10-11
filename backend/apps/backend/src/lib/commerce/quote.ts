import {stripeContext} from "./stripe"
import {taxMinor,taxPolicy,stripeTaxDefaults} from "./tax"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import CommerceService, { recordId } from "../../modules/peptech-commerce/service"
import { assertEligibility, assertProduct, discounted, fail, toMinor } from "./policy"
import { resolveShippingOption, type ShippingOptionQuote } from "./shipping"

export type QuoteLine = {
  variant_id: string
  line_id: string
  name: string
  sku: string
  quantity: number
  recurring: boolean
  tax_code?: string
  tax_lines?: any[]
  tax_minor?: number
  stripe_price_id?: string
  base_minor: number
  unit_minor: number
  catalog_version: string
  metadata?: Record<string, any>
  inventory: { id: string; quantity: number }[]
}

export type Quote = {
  customer_id: string
  email: string
  address: any
  billing_address?: any
  delivery_collected?: boolean
  currency: "gbp"
  lines: QuoteLine[]
  shipping_minor: number
  total_minor: number
  renewal_minor: number
  region_id: string
  sales_channel_id: string
  location_id: string
  shipping_option_id: string
  shipping_option_name?: string
  stripe_tax_enabled?: boolean
  stripe_tax_status?: string
  shipping_tax_lines?: any[]
  shipping_tax_minor?: number
  shipping_price_id?: string
  default_tax_code?: string
  tax_policy: string
  policy_version: string
  tax_rate: number
  tax_inclusive: boolean
  tax_minor: number
  vat_registered: boolean
  bank_instructions?: any
  free_shipping?: boolean
  promo?: {
    id: string
    code: string
    title: string
    discount_percent?: number
    discount_minor: number
  }
}

export async function buildQuote(
  scope: any,
  ledger: CommerceService,
  customerId: string,
  input: any,
  attemptId: string
): Promise<Quote> {
  input = { ...input, address: input.address || { country_code: input.country_code } }
  const settings = await ledger.get("commerce_settings")
  if (settings?.state !== "enabled") fail("Checkout is not enabled yet", 503)
  const policy = settings.data
  const shippingOption: ShippingOptionQuote = await resolveShippingOption(
    scope,
    policy,
    input.address.country_code,
    input.shipping_option_id
  )
  const useStripe = policy.tax_policy === "stripe_default"
  const context = useStripe ? stripeContext() : null
  const defaults = context ? await stripeTaxDefaults(context.stripe, context.mode) : null
  const tax = defaults ? { rate: 0, inclusive: defaults.inclusive, registered: defaults.enabled } : taxPolicy(policy, input.address.country_code)
  const customer = await scope.resolve(Modules.CUSTOMER).retrieveCustomer(customerId)
  assertEligibility(customer)
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const items = new Map<string, any>()
  for (const item of input.items) {
    const key = `${item.variant_id}:${item.recurring}`
    if (items.has(key)) fail("Duplicate basket line")
    items.set(key, item)
  }
  const lines: QuoteLine[] = []
  for (const item of items.values()) {
    const approval = await ledger.get(recordId("catalog", item.variant_id))
    assertProduct(approval, input.address.country_code, item.recurring)
    const { data: [variant] } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "product.status",
        "price_set.id",
        "manage_inventory",
        "inventory_items.inventory_item_id",
        "inventory_items.required_quantity"
      ],
      filters: { id: item.variant_id }
    })
    if (!variant || variant.product?.status !== "published" || !variant.price_set?.id) fail("Product is unavailable", 409)
    const prices = await scope.resolve(Modules.PRICING).calculatePrices(
      { id: [variant.price_set.id] },
      { context: { currency_code: "gbp", region_id: policy.region_id, quantity: item.quantity } }
    )
    if (prices[0]?.calculated_amount == null) fail("Product has no GBP price", 409)
    const base = toMinor(prices[0].calculated_amount)
    if (base <= 0) fail("Product price requires review", 409)
    if (!variant.manage_inventory || !variant.inventory_items?.length) fail("Tracked inventory is required before sale", 409)
    const unitMinor = item.recurring ? discounted(base) : base
    lines.push({
      variant_id: item.variant_id,
      line_id: recordId("ordli", attemptId, String(lines.length)),
      name: approval!.data.canonical_name,
      sku: approval!.data.canonical_sku,
      quantity: item.quantity,
      recurring: item.recurring,
      tax_code: approval!.data.tax_code || defaults?.code,
      base_minor: base,
      unit_minor: unitMinor,
      catalog_version: approval!.data.version,
      metadata: item.metadata || {},
      inventory: variant.inventory_items.map((i: any) => ({
        id: i.inventory_item_id,
        quantity: Number(i.required_quantity || 1) * item.quantity
      }))
    })
  }

  let promoData: { id: string; code: string; title: string; discount_percent?: number; discount_minor: number } | undefined = undefined
  if (input.promo_code) {
    try {
      const normalized = String(input.promo_code).trim().toUpperCase()
      const { data: promotions = [] } = await query.graph({
        entity: "promotion",
        fields: [
          "id",
          "code",
          "status",
          "limit",
          "used",
          "is_automatic",
          "metadata",
          "application_method.*",
        ],
        filters: {
          code: normalized,
        },
      })

      const promoRecord = promotions[0]
      // Anti-cheating & Stacking rules:
      // 1. Promo must be active
      // 2. Promo must NOT be automatic (automatic codes are already applied to recurring items)
      // 3. Promo must not have exhausted redemption limits
      if (
        promoRecord &&
        promoRecord.status === "active" &&
        !promoRecord.is_automatic &&
        (promoRecord.limit == null || Number(promoRecord.used || 0) < Number(promoRecord.limit)) &&
        promoRecord.application_method
      ) {
        const method = promoRecord.application_method
        const val = Number(method.value)
        let totalDiscountMinor = 0

        // Non-stacking rule: Manual promo codes apply strictly to one-time purchase items
        const eligibleLines = lines.filter((l) => !l.recurring)

        if (eligibleLines.length > 0) {
          if (method.type === "percentage") {
            for (const l of eligibleLines) {
              const lineDiscount = Math.round((l.unit_minor * val) / 100)
              l.unit_minor = Math.max(1, l.unit_minor - lineDiscount)
              totalDiscountMinor += lineDiscount * l.quantity
            }
            if (totalDiscountMinor > 0) {
              promoData = {
                id: promoRecord.id,
                code: promoRecord.code,
                title: promoRecord.metadata?.title || promoRecord.code,
                discount_percent: val,
                discount_minor: totalDiscountMinor,
              }
            }
          } else if (method.type === "fixed") {
            const targetDiscount = Math.round(val * 100)
            const poolMinor = eligibleLines.reduce((sum, l) => sum + l.unit_minor * l.quantity, 0)
            if (poolMinor > 0) {
              const applicableDiscount = Math.min(targetDiscount, poolMinor)
              for (const l of eligibleLines) {
                const share = Math.round((applicableDiscount * (l.unit_minor * l.quantity)) / poolMinor)
                const unitReduction = Math.floor(share / l.quantity)
                l.unit_minor = Math.max(1, l.unit_minor - unitReduction)
                totalDiscountMinor += unitReduction * l.quantity
              }
              if (totalDiscountMinor > 0) {
                promoData = {
                  id: promoRecord.id,
                  code: promoRecord.code,
                  title: promoRecord.metadata?.title || promoRecord.code,
                  discount_minor: totalDiscountMinor,
                }
              }
            }
          }
        }
      }
    } catch (promoErr) {
      console.warn("[PEPTECH Quote] Failed to resolve promo_code via Medusa query:", promoErr)
    }
  }

  const recurring = lines.some((l) => l.recurring)
  if (recurring && !input.recurring_accepted) fail("Explicit recurring payment consent is required")

  // Free shipping auto-waiver: Check if basket subtotal meets active threshold
  const itemsSubtotalMinor = lines.reduce((sum, l) => sum + l.unit_minor * l.quantity, 0)
  let freeShippingApplied = false
  try {
    const { data: shippingPromos = [] } = await query.graph({
      entity: "promotion",
      fields: ["id", "code", "status", "is_automatic", "metadata", "application_method.*"],
      filters: {
        status: "active",
      },
    })
    const activeFreeShip = shippingPromos.find(
      (p: any) => p.application_method?.target_type === "shipping_methods" || p.code === "FREESHIP150"
    )
    if (activeFreeShip && activeFreeShip.status === "active") {
      let threshold = 150
      if (activeFreeShip.metadata?.threshold) {
        threshold = Number(activeFreeShip.metadata.threshold)
      } else {
        const title = String(activeFreeShip.metadata?.title || activeFreeShip.title || "")
        const match = title.match(/(?:over|spend|above|min|minimum)\s*[£$€]?\s*(\d+(?:\.\d+)?)/i)
        if (match && Number(match[1]) > 0) {
          threshold = Number(match[1])
        } else {
          const codeMatch = String(activeFreeShip.code || "").match(/(\d+)/)
          if (codeMatch && Number(codeMatch[1]) > 0) {
            threshold = Number(codeMatch[1])
          }
        }
      }
      const thresholdMinor = Math.round(threshold * 100)
      if (itemsSubtotalMinor >= thresholdMinor) {
        freeShippingApplied = true
      }
    }
  } catch (fsErr) {
    console.warn("[PEPTECH Quote] Free shipping query error:", fsErr)
  }

  const shipping = freeShippingApplied ? 0 : shippingOption.amount_minor
  const subtotal = itemsSubtotalMinor + shipping
  const taxTotal = lines.reduce((sum, l) => sum + taxMinor(l.unit_minor * l.quantity, tax.rate, tax.inclusive), taxMinor(shipping, tax.rate, tax.inclusive))
  const recurringLines = lines.filter((l) => l.recurring)
  const recurringSubtotal = recurringLines.reduce((sum, l) => sum + l.unit_minor * l.quantity, shipping)
  const recurringTax = recurringLines.reduce((sum, l) => sum + taxMinor(l.unit_minor * l.quantity, tax.rate, tax.inclusive), taxMinor(shipping, tax.rate, tax.inclusive))
  return {
    customer_id: customerId,
    email: customer.email,
    address: input.address,
    currency: "gbp",
    lines,
    shipping_minor: shipping,
    free_shipping: freeShippingApplied,
    total_minor: subtotal + (tax.inclusive ? 0 : taxTotal),
    renewal_minor: recurring ? recurringSubtotal + (tax.inclusive ? 0 : recurringTax) : 0,
    region_id: policy.region_id,
    sales_channel_id: policy.sales_channel_id,
    location_id: policy.location_id,
    shipping_option_id: shippingOption.id,
    shipping_option_name: shippingOption.name,
    tax_policy: policy.tax_policy,
    policy_version: policy.version,
    stripe_tax_enabled: defaults?.enabled,
    stripe_tax_status: defaults?.status,
    default_tax_code: defaults?.code,
    tax_rate: tax.rate,
    tax_inclusive: tax.inclusive,
    tax_minor: taxTotal,
    vat_registered: tax.registered,
    promo: promoData
  }
}

export async function reserveQuote(scope: any, quote: Quote, reference: string) {
  const inventory = scope.resolve(Modules.INVENTORY)
  const existing = await inventory.listReservationItems({ external_id: reference }, { take: 200 })
  if (existing.length) return existing
  return inventory.createReservationItems(
    quote.lines.flatMap((line) =>
      line.inventory.map((item) => ({
        inventory_item_id: item.id,
        location_id: quote.location_id,
        line_item_id: line.line_id,
        quantity: item.quantity,
        allow_backorder: false,
        external_id: reference,
        metadata: { peptech_checkout: reference }
      }))
    )
  )
}

export async function releaseQuote(scope: any, reference: string) {
  const inventory = scope.resolve(Modules.INVENTORY)
  const reservations = await inventory.listReservationItems({ external_id: reference }, { take: 200 })
  if (reservations.length) await inventory.deleteReservationItems(reservations.map((r: any) => r.id))
}
