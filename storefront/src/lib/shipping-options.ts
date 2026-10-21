import { commerceRequest } from "./stripe-checkout"

export type ShippingOption = {
  id: string
  name: string
  amount: number
  code?: string | null
  type_id?: string | null
  shipping_option_type_id?: string | null
  description?: string | null
}

export type ShippingRatesConfig = {
  pen_set_uk_minor: number
  pen_set_intl_minor: number
  refill_uk_minor: number
  refill_intl_minor: number
  vial_uk_minor: number
  vial_intl_minor: number
}

export type ShippingOptionsResponse = {
  options: ShippingOption[]
  shipping_rates: ShippingRatesConfig
  free_shipping_threshold_minor: number
  subscription_first_order_free: boolean
}

type RawShippingOption = {
  id?: string
  name?: string
  amount_minor?: number | string
  code?: string | null
  type_id?: string | null
  shipping_option_type_id?: string | null
  description?: string | null
}

const DEFAULT_RATES: ShippingRatesConfig = {
  pen_set_uk_minor: 495,
  pen_set_intl_minor: 1500,
  refill_uk_minor: 395,
  refill_intl_minor: 1000,
  vial_uk_minor: 395,
  vial_intl_minor: 1000,
}

/**
 * Shipping options and dynamic configuration Medusa serves for a destination.
 */
export async function getShippingOptionsWithConfig(countryCode: string): Promise<ShippingOptionsResponse> {
  try {
    const data = (await commerceRequest(
      `/store/custom/shipping-options?country_code=${encodeURIComponent(countryCode)}`
    )) as {
      options?: RawShippingOption[]
      shipping_rates?: ShippingRatesConfig
      free_shipping_threshold_minor?: number
      subscription_first_order_free?: boolean
    }
    const rawOptions = Array.isArray(data?.options) ? data.options : []
    const options = rawOptions
      .filter((option): option is RawShippingOption => !!option?.id)
      .map((option) => ({
        id: String(option.id),
        name: String(option.name || "Shipping"),
        amount: Number(option.amount_minor ?? 0) / 100,
        code: option.code || null,
        type_id: option.type_id || option.shipping_option_type_id || null,
        shipping_option_type_id: option.shipping_option_type_id || option.type_id || null,
        description: option.description || null,
      }))

    return {
      options,
      shipping_rates: data?.shipping_rates || DEFAULT_RATES,
      free_shipping_threshold_minor: data?.free_shipping_threshold_minor ?? 15000,
      subscription_first_order_free: data?.subscription_first_order_free !== false,
    }
  } catch {
    return {
      options: [],
      shipping_rates: DEFAULT_RATES,
      free_shipping_threshold_minor: 15000,
      subscription_first_order_free: true,
    }
  }
}

/**
 * Shipping options Medusa serves for a destination.
 */
export async function getShippingOptions(countryCode: string): Promise<ShippingOption[]> {
  const res = await getShippingOptionsWithConfig(countryCode)
  return res.options
}

