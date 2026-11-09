import type { PaymentGatewayAdapter } from "./types"
import { StripeGatewayAdapter } from "./stripe-adapter"
import { BankTransferGatewayAdapter } from "./bank-transfer-adapter"
import { fail } from "../policy"

const adapters = new Map<string, PaymentGatewayAdapter>()

const defaultBankTransferAdapter = new BankTransferGatewayAdapter()
const defaultStripeAdapter = new StripeGatewayAdapter()

adapters.set("bank_transfer", defaultBankTransferAdapter)
adapters.set("stripe", defaultStripeAdapter)
adapters.set("card", defaultStripeAdapter)

export function isCardGatewayActive(env: Record<string, string | undefined> = process.env): boolean {
  return env.COMMERCE_ENABLE_STRIPE_CHECKOUT === "true" && defaultStripeAdapter.isConfigured()
}

export function registerPaymentGateway(adapter: PaymentGatewayAdapter) {
  adapters.set(adapter.id, adapter)
}

export function getPaymentGateway(id = "bank_transfer"): PaymentGatewayAdapter {
  if (id === "stripe" || id === "card") {
    if (!isCardGatewayActive()) {
      fail("Card payment processing is temporarily unavailable. Please use UK Faster Payments (Bank Transfer).", 503)
    }
    return defaultStripeAdapter
  }

  const adapter = adapters.get(id)
  if (!adapter || !adapter.isConfigured()) {
    fail("Selected payment rail is currently unavailable. Please choose an active payment method.", 503)
  }
  return adapter
}

export function listAvailableGateways(): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [
    { id: defaultBankTransferAdapter.id, name: defaultBankTransferAdapter.name },
  ]

  if (isCardGatewayActive()) {
    result.push({ id: "card", name: "Debit / Credit Card (3-D Secure)" })
  }

  for (const adapter of adapters.values()) {
    if (["bank_transfer", "stripe", "card"].includes(adapter.id)) continue
    if (adapter.isConfigured()) {
      result.push({ id: adapter.id, name: adapter.name })
    }
  }

  return result
}
