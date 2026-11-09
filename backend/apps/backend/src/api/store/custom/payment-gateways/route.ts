import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { commerce, endpoint } from "../../../../lib/commerce/http"
import { isCardGatewayActive, listAvailableGateways } from "../../../../lib/commerce/gateways/registry"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const settings = await commerce(req).get("commerce_settings").catch(() => null)
    const bank = settings?.data?.bank_instructions || null
    const bankConfigured = Boolean(bank?.account_name && bank?.sort_code && bank?.account_number)
    return {
      gateways: listAvailableGateways(),
      card_gateway_active: isCardGatewayActive(),
      bank_transfer_configured: bankConfigured,
    }
  })
}

