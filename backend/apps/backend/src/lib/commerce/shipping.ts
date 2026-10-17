import { ContainerRegistrationKeys, Modules, QueryContext } from "@medusajs/framework/utils"
import { fail, toMinor } from "./policy"

export type ShippingOptionQuote = {
  id: string
  name: string
  price_type: string
  amount_minor: number
  description?: string | null
  code?: string | null
  type_id?: string | null
  shipping_option_type_id?: string | null
  countries?: string[]
}

type CommercePolicy = Record<string, any>

/**
 * Fulfillment sets linked to the configured commerce location.
 *
 * Returns `null` when the location cannot be resolved so callers list every
 * option that serves the destination, and `[]` when the location genuinely has
 * no fulfillment sets so checkout fails closed.
 */
async function locationFulfillmentSetIds(scope: any, policy: CommercePolicy): Promise<string[] | null> {
  if (!policy?.location_id) return null
  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "stock_locations",
      fields: ["id", "fulfillment_sets.id"],
      filters: { id: policy.location_id },
    })
    const location = data?.[0]
    if (!location) return null
    return (location.fulfillment_sets || []).map((set: any) => set?.id).filter(Boolean)
  } catch {
    return null
  }
}

function isCovered(price: any, quantity: number): boolean {
  const min = price?.min_quantity
  const max = price?.max_quantity
  if (min !== null && min !== undefined && Number(min) > quantity) return false
  if (max !== null && max !== undefined && Number(max) < quantity) return false
  return true
}

function priceMatches(price: any, policy: CommercePolicy): boolean {
  if (price?.currency_code === "gbp") return true
  if (price?.currency_code) return false
  const rules = price?.price_rules || []
  return rules.some((rule: any) => rule?.attribute === "region_id" && String(rule?.value) === String(policy?.region_id))
}

/**
 * Flat shipping options are priced by the Pricing module, not by the
 * fulfillment provider: the bundled manual provider refuses price
 * calculation. Prefer the resolved `calculated_price`, then fall back to the
 * stored price rows so a plain GBP/region rate still resolves.
 */
function amountMinorFor(row: any, policy: CommercePolicy, quantity: number): number | null {
  if (!row) return null
  const calculated = row.calculated_price?.calculated_amount
  if (calculated !== null && calculated !== undefined && calculated !== "") {
    try {
      return toMinor(calculated)
    } catch {
      return null
    }
  }
  const prices = Array.isArray(row.prices) ? row.prices : []
  const candidates = prices.filter((price: any) => isCovered(price, quantity) && priceMatches(price, policy))
  if (!candidates.length) return null
  const unbounded = candidates.find((price: any) => price?.min_quantity == null && price?.max_quantity == null)
  const chosen = unbounded || candidates[0]
  try {
    return toMinor(chosen?.amount)
  } catch {
    return null
  }
}

async function withAmounts(scope: any, policy: CommercePolicy, options: any[]): Promise<ShippingOptionQuote[]> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  let rows: any[] = []
  try {
    const result = await query.graph({
      entity: "shipping_options",
      fields: [
        "id",
        "price_type",
        "calculated_price.calculated_amount",
        "prices.currency_code",
        "prices.amount",
        "prices.min_quantity",
        "prices.max_quantity",
        "prices.price_rules.attribute",
        "prices.price_rules.value",
      ],
      filters: { id: options.map((option) => option.id) },
      context: {
        calculated_price: QueryContext({
          currency_code: "gbp",
          region_id: policy?.region_id,
          quantity: 1,
        }),
      },
    })
    rows = result?.data || []
  } catch (error: any) {
    console.warn("[PEPTECH Commerce] Shipping price lookup failed:", error?.message || error)
  }

  const priced = new Map<string, any>(rows.map((row: any) => [row.id, row]))
  const resolved: ShippingOptionQuote[] = []
  for (const option of options) {
    const amount = amountMinorFor(priced.get(option.id), policy, 1)
    if (amount === null) continue
    resolved.push({
      id: option.id,
      name: option.name,
      price_type: option.price_type,
      amount_minor: amount,
      description: option.type?.description ?? null,
      code: option.type?.code ?? null,
      type_id: option.type?.id ?? option.shipping_option_type_id ?? null,
      shipping_option_type_id: option.shipping_option_type_id ?? option.type?.id ?? null,
      countries: Array.from(
        new Set(
          (option.service_zone?.geo_zones || [])
            .map((zone: any) => String(zone?.country_code || "").toLowerCase())
            .filter(Boolean)
        )
      ),
    })
  }
  return resolved
}

/**
 * Shipping options the configured location serves for a destination, priced in
 * GBP. Pass an empty `countryCode` to list every option regardless of coverage.
 */
export async function listShippingOptions(
  scope: any,
  policy: CommercePolicy,
  countryCode?: string
): Promise<ShippingOptionQuote[]> {
  const sets = await locationFulfillmentSetIds(scope, policy)
  if (sets !== null && sets.length === 0) return []

  const filters: any = {
    context: { enabled_in_store: "true", is_return: "false" },
  }
  if (sets) filters.fulfillment_set_id = sets
  if (countryCode) filters.address = { country_code: countryCode }

  const fulfillment = scope.resolve(Modules.FULFILLMENT)
  const options = await fulfillment.listShippingOptionsForContext(filters, {
    relations: ["rules", "type", "service_zone.fulfillment_set", "service_zone.geo_zones"],
  })
  if (!options?.length) return []
  return withAmounts(scope, policy, options)
}

/**
 * Resolves the option a customer is paying with. Fails closed: an unknown or
 * unsupported option, or a destination no option serves, aborts the quote.
 */
export async function resolveShippingOption(
  scope: any,
  policy: CommercePolicy,
  countryCode: string,
  optionId?: string | null
): Promise<ShippingOptionQuote> {
  const options = await listShippingOptions(scope, policy, countryCode)
  if (!options.length) fail("Shipping is unavailable for this destination", 409)
  if (!optionId) return options[0]
  const chosen = options.find((option) => option.id === optionId)
  if (!chosen) fail("The selected shipping method is unavailable for this destination", 409)
  return chosen
}

export type ProductShippingFormat = "pen_set" | "refill" | "vial"

export type DynamicShippingItem = {
  format?: string | null
  metadata?: Record<string, any> | null
  handle?: string | null
  title?: string | null
  quantity?: number
  unit_minor?: number
  recurring?: boolean
}

export type DynamicShippingCalculation = {
  amount_minor: number
  free_shipping: boolean
  reason: "free_threshold" | "renewal_free" | "subscription_free" | "category_rate"
  rate_tier: ProductShippingFormat
  is_uk: boolean
  shipping_option_name: string
}

export function resolveItemFormat(item: {
  format?: string | null
  metadata?: Record<string, any> | null
  handle?: string | null
  title?: string | null
}): ProductShippingFormat {
  const candidate = String(
    item.format ||
    item.metadata?.format ||
    item.metadata?.category ||
    item.handle ||
    item.title ||
    ""
  ).toLowerCase()

  if (
    candidate.includes("pen") ||
    candidate.includes("device") ||
    candidate.includes("starter-set") ||
    candidate.includes("complete-pen")
  ) {
    return "pen_set"
  }
  if (candidate.includes("cartridge") || candidate.includes("refill")) {
    return "refill"
  }
  return "vial"
}

export type ShippingServiceZone = {
  id: string
  name: string
  countries: string[]
  rates?: {
    pen_set_minor?: number
    refill_minor?: number
    vial_minor?: number
  }
}

export async function listLocationServiceZones(
  scope: any,
  policy: CommercePolicy
): Promise<ShippingServiceZone[]> {
  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY)
    let locations: any[] = []
    const result = await query.graph({
      entity: "stock_locations",
      fields: [
        "id",
        "name",
        "fulfillment_sets.id",
        "fulfillment_sets.name",
        "fulfillment_sets.service_zones.id",
        "fulfillment_sets.service_zones.name",
        "fulfillment_sets.service_zones.geo_zones.id",
        "fulfillment_sets.service_zones.geo_zones.country_code",
      ],
      filters: policy?.location_id ? { id: policy.location_id } : {},
    })
    locations = result?.data || []
    if (locations.length === 0 && policy?.location_id) {
      const fallback = await query.graph({
        entity: "stock_locations",
        fields: [
          "id",
          "name",
          "fulfillment_sets.id",
          "fulfillment_sets.name",
          "fulfillment_sets.service_zones.id",
          "fulfillment_sets.service_zones.name",
          "fulfillment_sets.service_zones.geo_zones.id",
          "fulfillment_sets.service_zones.geo_zones.country_code",
        ],
      })
      locations = fallback?.data || []
    }

    const zoneMap = new Map<string, ShippingServiceZone>()
    for (const loc of locations) {
      for (const fset of loc.fulfillment_sets || []) {
        for (const sz of fset.service_zones || []) {
          if (!sz?.id || zoneMap.has(sz.id)) continue
          const countries = (sz.geo_zones || [])
            .map((gz: any) => String(gz?.country_code || "").toLowerCase())
            .filter(Boolean)
          const savedRates = policy?.service_zone_rates?.[sz.id]
          const isUkZone = countries.includes("gb")
          const rates = savedRates
            ? {
                pen_set_minor: Number(savedRates.pen_set_minor ?? (isUkZone ? 495 : 1800)),
                refill_minor: Number(savedRates.refill_minor ?? (isUkZone ? 395 : 1000)),
                vial_minor: Number(savedRates.vial_minor ?? (isUkZone ? 395 : 1000)),
              }
            : {
                pen_set_minor: isUkZone ? 495 : 1800,
                refill_minor: isUkZone ? 395 : 1000,
                vial_minor: isUkZone ? 395 : 1000,
              }
          zoneMap.set(sz.id, {
            id: sz.id,
            name: sz.name,
            countries,
            rates,
          })
        }
      }
    }
    return Array.from(zoneMap.values())
  } catch (err: any) {
    console.warn("[PEPTECH Commerce] listLocationServiceZones error:", err?.message || err)
    return []
  }
}

export function calculateDynamicShipping({
  items,
  countryCode,
  policy,
  isRenewal = false,
  itemsSubtotalMinor,
  serviceZones,
}: {
  items: DynamicShippingItem[]
  countryCode: string
  policy?: CommercePolicy | null
  isRenewal?: boolean
  itemsSubtotalMinor?: number
  serviceZones?: ShippingServiceZone[]
}): DynamicShippingCalculation {
  const cleanCountry = String(countryCode || "gb").trim().toLowerCase()
  const isUk = cleanCountry === "gb"

  let penSetMinor = isUk
    ? (policy?.shipping_rates?.pen_set_uk_minor ?? 495)
    : (policy?.shipping_rates?.pen_set_intl_minor ?? 1800)
  let refillMinor = isUk
    ? (policy?.shipping_rates?.refill_uk_minor ?? 395)
    : (policy?.shipping_rates?.refill_intl_minor ?? 1000)
  let vialMinor = isUk
    ? (policy?.shipping_rates?.vial_uk_minor ?? 395)
    : (policy?.shipping_rates?.vial_intl_minor ?? 1000)

  // Service Zone matching if provided
  if (serviceZones && serviceZones.length > 0) {
    const matchedZone = serviceZones.find((z) =>
      z.countries.map((c) => c.toLowerCase()).includes(cleanCountry)
    )
    if (matchedZone) {
      const isUkZone = matchedZone.countries.map((c) => c.toLowerCase()).includes("gb")
      const savedRate = policy?.service_zone_rates?.[matchedZone.id] || matchedZone.rates
      if (savedRate) {
        penSetMinor = Number(savedRate.pen_set_minor ?? (isUkZone ? 495 : 1800))
        refillMinor = Number(savedRate.refill_minor ?? (isUkZone ? 395 : 1000))
        vialMinor = Number(savedRate.vial_minor ?? (isUkZone ? 395 : 1000))
      } else {
        penSetMinor = isUkZone ? 495 : 1800
        refillMinor = isUkZone ? 395 : 1000
        vialMinor = isUkZone ? 395 : 1000
      }
    }
  }

  const thresholdMinor = Number(policy?.free_shipping_threshold_minor ?? 15000)
  const subtotal = itemsSubtotalMinor ?? items.reduce((sum, item) => sum + (item.unit_minor ?? 0) * (item.quantity ?? 1), 0)

  // 1. Spend threshold >= £150 -> Free shipping everywhere
  if (subtotal >= thresholdMinor) {
    return {
      amount_minor: 0,
      free_shipping: true,
      reason: "free_threshold",
      rate_tier: "pen_set",
      is_uk: isUk,
      shipping_option_name: isUk ? "Royal Mail Tracked 24 (Free)" : "Royal Mail International Tracked (Free)",
    }
  }

  // 2. Automatic renewals are always free everywhere
  if (isRenewal) {
    return {
      amount_minor: 0,
      free_shipping: true,
      reason: "renewal_free",
      rate_tier: "refill",
      is_uk: isUk,
      shipping_option_name: isUk ? "Royal Mail Tracked 24 (Free)" : "Royal Mail International Tracked (Free)",
    }
  }

  // 3. Pure Subscribe & Save cart (all items recurring)
  const isPureSubscription = items.length > 0 && items.every((i) => Boolean(i.recurring))
  const subscriptionFirstOrderFree = policy?.subscription_first_order_free !== false

  if (isPureSubscription && subscriptionFirstOrderFree) {
    return {
      amount_minor: 0,
      free_shipping: true,
      reason: "subscription_free",
      rate_tier: "refill",
      is_uk: isUk,
      shipping_option_name: isUk ? "Royal Mail Tracked 24 (Free)" : "Royal Mail International Tracked (Free)",
    }
  }

  // 4. Category-based rate evaluation
  // If any item is a pen set, highest tier applies
  const hasPenSet = items.some((item) => resolveItemFormat(item) === "pen_set")
  const hasRefill = items.some((item) => resolveItemFormat(item) === "refill")

  let rateTier: ProductShippingFormat = "vial"
  let amountMinor = 0

  if (hasPenSet || items.length === 0) {
    rateTier = "pen_set"
    amountMinor = penSetMinor
  } else if (hasRefill) {
    rateTier = "refill"
    amountMinor = refillMinor
  } else {
    rateTier = "vial"
    amountMinor = vialMinor
  }

  return {
    amount_minor: amountMinor,
    free_shipping: false,
    reason: "category_rate",
    rate_tier: rateTier,
    is_uk: isUk,
    shipping_option_name: isUk ? "Royal Mail Tracked 24" : "Royal Mail International Tracked",
  }
}

