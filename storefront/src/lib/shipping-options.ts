import { commerceRequest } from "./stripe-checkout"

export type ShippingOption = {
  id: string
  name: string
  amount: number
  code?: string | null
  description?: string | null
}

type RawShippingOption = {
  id?: string
  name?: string
  amount_minor?: number | string
  code?: string | null
  description?: string | null
}

/**
 * Shipping options Medusa serves for a destination. Returns an empty list when
 * the backend is unavailable so the UI can say "calculated at checkout"
 * instead of inventing a rate.
 */
export async function getShippingOptions(countryCode: string): Promise<ShippingOption[]> {
  try {
    const data = (await commerceRequest(
      `/store/custom/shipping-options?country_code=${encodeURIComponent(countryCode)}`
    )) as { options?: RawShippingOption[] }
    const options = Array.isArray(data?.options) ? data.options : []
    return options
      .filter((option): option is RawShippingOption => !!option?.id)
      .map((option) => ({
        id: String(option.id),
        name: String(option.name || "Shipping"),
        amount: Number(option.amount_minor ?? 0) / 100,
        code: option.code || null,
        description: option.description || null,
      }))
  } catch {
    return []
  }
}
