import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { commerce, endpoint } from "../../../../lib/commerce/http"
import { listShippingOptions, calculateDynamicShipping, listLocationServiceZones } from "../../../../lib/commerce/shipping"

function destinationCountry(value: unknown): string {
  const country = String(value || "").trim().toLowerCase()
  return /^[a-z]{2}$/.test(country) ? country : ""
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const countryCode = destinationCountry(req.query?.country_code) || "gb"
    const settings = await commerce(req).get("commerce_settings")
    if (settings?.state !== "enabled" || !settings?.data) {
      return { country_code: countryCode, options: [] }
    }
    const policy = settings.data
    const options = await listShippingOptions(req.scope, policy, countryCode)
    const serviceZones = await listLocationServiceZones(req.scope, policy)

    const format = req.query?.format as string | undefined
    const subtotal = req.query?.subtotal ? Number(req.query.subtotal) : undefined
    const recurring = req.query?.recurring === "true"

    const dynamicCalc = calculateDynamicShipping({
      items: format ? [{ format, recurring, unit_minor: subtotal ? Math.round(subtotal * 100) : 0, quantity: 1 }] : [],
      countryCode,
      policy,
      itemsSubtotalMinor: subtotal ? Math.round(subtotal * 100) : undefined,
      serviceZones,
    })

    const adjustedOptions = options.map((opt) => ({
      ...opt,
      amount_minor: dynamicCalc.free_shipping ? 0 : dynamicCalc.amount_minor,
      name: opt.name || dynamicCalc.shipping_option_name,
      description:
        opt.description ||
        (countryCode.toLowerCase() === "gb"
          ? "Royal Mail Tracked 24 · 24-48h Dispatch"
          : "Royal Mail International Tracked · 3-7 Business Days"),
    }))

    const matchedZone = serviceZones.find((z) =>
      z.countries.map((c) => c.toLowerCase()).includes(countryCode.toLowerCase())
    )
    const isUk = countryCode.toLowerCase() === "gb"
    let penSetMinor = isUk ? 495 : 1500
    let refillMinor = isUk ? 395 : 1000
    let vialMinor = isUk ? 395 : 1000

    if (matchedZone) {
      const isUkZone = matchedZone.countries.includes("gb")
      const savedRate = policy?.service_zone_rates?.[matchedZone.id] || matchedZone.rates
      if (savedRate) {
        penSetMinor = Number(savedRate.pen_set_minor ?? (isUkZone ? 495 : 1500))
        refillMinor = Number(savedRate.refill_minor ?? (isUkZone ? 395 : 1000))
        vialMinor = Number(savedRate.vial_minor ?? (isUkZone ? 395 : 1000))
      } else {
        penSetMinor = isUkZone ? 495 : 1500
        refillMinor = isUkZone ? 395 : 1000
        vialMinor = isUkZone ? 395 : 1000
      }
    } else if (policy?.shipping_rates) {
      penSetMinor = isUk ? policy.shipping_rates.pen_set_uk_minor : policy.shipping_rates.pen_set_intl_minor
      refillMinor = isUk ? policy.shipping_rates.refill_uk_minor : policy.shipping_rates.refill_intl_minor
      vialMinor = isUk ? policy.shipping_rates.vial_uk_minor : policy.shipping_rates.vial_intl_minor
    }

    const dynamicShippingRates = {
      pen_set_uk_minor: penSetMinor,
      pen_set_intl_minor: penSetMinor,
      refill_uk_minor: refillMinor,
      refill_intl_minor: refillMinor,
      vial_uk_minor: vialMinor,
      vial_intl_minor: vialMinor,
    }

    return {
      country_code: countryCode,
      service_zone: matchedZone ? { id: matchedZone.id, name: matchedZone.name } : null,
      options: adjustedOptions.length > 0 ? adjustedOptions : options,
      shipping_rates: dynamicShippingRates,
      free_shipping_threshold_minor: policy.free_shipping_threshold_minor ?? 15000,
      subscription_first_order_free: policy.subscription_first_order_free !== false,
      calculated: dynamicCalc,
    }
  })
}
