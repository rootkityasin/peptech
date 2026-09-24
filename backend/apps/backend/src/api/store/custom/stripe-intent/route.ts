import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const STRIPE_SECRET = process.env.STRIPE_API_KEY || "";
const STRIPE_PUBLIC = process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";

function getStripeInstance() {
  if (!STRIPE_SECRET) return null;
  try {
    const Stripe = require("stripe");
    return new Stripe(STRIPE_SECRET, {
      apiVersion: "2024-06-20",
    });
  } catch (err) {
    console.error("[PEPTECH STRIPE] Failed to load Stripe SDK:", err);
    return null;
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).json({
    gateway: "stripe",
    is_active: true,
    is_live: Boolean(STRIPE_SECRET && !STRIPE_SECRET.startsWith("sk_test_")),
    publishable_key: STRIPE_PUBLIC,
    supported_currencies: ["usd", "eur", "gbp", "cad", "aud"],
    default_currency: "usd",
    payment_methods: ["card", "apple_pay", "google_pay", "link"],
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {};
    const {
      amount,
      currency = "usd",
      email,
      customer_id,
      is_subscription = false,
      metadata = {},
    } = body;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ message: "Valid amount is required." });
    }

    const cleanCurrency = String(currency).toLowerCase();
    // Stripe expects amounts in cents/pence (e.g. $49.05 -> 4905)
    const amountInCents = Math.round(Number(amount) * 100);

    const stripe = getStripeInstance();

    // 1. Live/Test Stripe Processing when STRIPE_API_KEY is configured
    if (stripe) {
      let stripeCustomerId: string | undefined = undefined;

      // Handle customer creation for recurring 28-day subscriptions
      if (email) {
        try {
          const existingCustomers = await stripe.customers.list({
            email,
            limit: 1,
          });
          if (existingCustomers.data && existingCustomers.data.length > 0) {
            stripeCustomerId = existingCustomers.data[0].id;
          } else {
            const newCustomer = await stripe.customers.create({
              email,
              metadata: {
                medusa_customer_id: customer_id || "",
                source: "peptech_international_storefront",
              },
            });
            stripeCustomerId = newCustomer.id;
          }
        } catch (custErr) {
          console.warn("[PEPTECH STRIPE] Customer lookup/creation warning:", custErr);
        }
      }

      const intentParams: any = {
        amount: amountInCents,
        currency: cleanCurrency,
        automatic_payment_methods: { enabled: true },
        receipt_email: email || undefined,
        metadata: {
          ...metadata,
          source: "peptech_storefront",
          is_subscription: String(is_subscription),
          medusa_customer_id: customer_id || "",
        },
      };

      if (stripeCustomerId) {
        intentParams.customer = stripeCustomerId;
      }

      if (is_subscription) {
        // Essential for recurring off-session charges every 28 days
        intentParams.setup_future_usage = "off_session";
      }

      const paymentIntent = await stripe.paymentIntents.create(intentParams);

      return res.status(200).json({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        customer_id: stripeCustomerId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        mode: STRIPE_SECRET.startsWith("sk_test_") ? "test" : "live",
      });
    }

    // 2. High-performance Fallback / Sandbox Tokenizer for testing without live keys
    const mockIntentId = `pi_peptech_${cleanCurrency}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 15)}`;

    return res.status(200).json({
      client_secret: mockClientSecret,
      payment_intent_id: mockIntentId,
      customer_id: email ? `cus_mock_${Date.now().toString(36)}` : null,
      amount: amountInCents,
      currency: cleanCurrency,
      mode: "test_sandbox",
      note: "Stripe sandbox intent generated. Set STRIPE_API_KEY in .env to process on live Stripe accounts.",
    });
  } catch (err: any) {
    console.error("[PEPTECH STRIPE ERROR]", err);
    return res.status(500).json({
      message: err.message || "Failed to initialize Stripe payment intent.",
    });
  }
}
