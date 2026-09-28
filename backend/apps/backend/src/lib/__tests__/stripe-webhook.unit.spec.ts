// Exercise the installed Medusa provider's real signature verification, not a mock.
import StripeProvider from "@medusajs/payment-stripe/dist/services/stripe-provider"
const Stripe = require("stripe")

const secret = "whsec_fixture"
const provider = new StripeProvider({}, { apiKey: "sk_test_fixture", webhookSecret: secret })
const stripe = new Stripe("sk_test_fixture")
const payload = JSON.stringify({ type: "payment_intent.succeeded", data: { object: {
  id: "pi_fixture", amount: 4995, currency: "gbp", metadata: { session_id: "payses_fixture" },
} } })

describe("native Stripe webhook verification", () => {
  it("rejects unsigned and tampered events", async () => {
    await expect(provider.getWebhookActionAndData({ data: JSON.parse(payload), rawData: Buffer.from(payload), headers: {} })).rejects.toThrow()
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret })
    await expect(provider.getWebhookActionAndData({ data: {}, rawData: Buffer.from(payload + " "), headers: { "stripe-signature": signature } })).rejects.toThrow()
  })
  it("maps a signed successful payment to its Medusa session", async () => {
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret })
    const result = await provider.getWebhookActionAndData({ data: JSON.parse(payload), rawData: Buffer.from(payload), headers: { "stripe-signature": signature } })
    expect(result.action).toBe("captured")
    expect(result.data?.session_id).toBe("payses_fixture")
  })
})
