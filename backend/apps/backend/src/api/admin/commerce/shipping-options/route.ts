import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { operator, commerce, endpoint } from "../../../../lib/commerce/http"
import { listShippingOptions } from "../../../../lib/commerce/shipping"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    operator(req)
    const settings = await commerce(req).get("commerce_settings")
    const policy = settings?.data || {}
    const requested = String(req.query?.country_code || "").trim().toLowerCase()
    const countryCode = /^[a-z]{2}$/.test(requested) ? requested : undefined
    const options = await listShippingOptions(req.scope, policy, countryCode)
    return {
      options,
      location_id: policy.location_id || null,
      region_id: policy.region_id || null,
      sales_channel_id: policy.sales_channel_id || null,
      shipping_option_id: policy.shipping_option_id || null,
      destinations: policy.destinations || [],
      enabled: settings?.state === "enabled",
    }
  })
}
