import type { PaymentGatewayAdapter } from "./types"
import { StripeGatewayAdapter } from "./stripe-adapter"
import { fail } from "../policy"

const adapters = new Map<string, PaymentGatewayAdapter>()

// Register default active gateway
const defaultStripeAdapter = new StripeGatewayAdapter()
adapters.set("stripe", defaultStripeAdapter)

export function registerPaymentGateway(adapter: PaymentGatewayAdapter) {
  adapters.set(adapter.id, adapter)
}

export function getPaymentGateway(id = "stripe"): PaymentGatewayAdapter {
  const adapter = adapters.get(id) || adapters.get("stripe")
  if (!adapter || !adapter.isConfigured()) {
    fail(`Payment gateway "${id}" is not configured.`, 503)
  }
  return adapter
}

export function listAvailableGateways(): { id: string; name: string }[] {
  return Array.from(adapters.values())
    .filter((a) => a.isConfigured())
    .map((a) => ({ id: a.id, name: a.name }))
}
