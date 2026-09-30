import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { commerce, endpoint } from "../../../../lib/commerce/http"
import { listShippingOptions } from "../../../../lib/commerce/shipping"

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
    const options = await listShippingOptions(req.scope, settings.data, countryCode)
    return { country_code: countryCode, options }
  })
}
