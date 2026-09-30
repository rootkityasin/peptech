import { ContainerRegistrationKeys, Modules, QueryContext } from "@medusajs/framework/utils"
import { fail, toMinor } from "./policy"

export type ShippingOptionQuote = {
  id: string
  name: string
  price_type: string
  amount_minor: number
  description?: string | null
  code?: string | null
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
