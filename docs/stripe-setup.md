# Stripe sandbox setup for PEPTECH

Stripe skills are already installed globally in `~/.agents/skills` and available to Codex: `stripe-best-practices`, `stripe-docs`, `upgrade-stripe`, and other Stripe skills. MCP access is separate from the app's API credentials. The connected MCP sandbox is **testingapp sandbox**, account `acct_1UJNMsIy87xghqkP`.

## 1. Configure the root .env

In the Stripe Dashboard, select the intended sandbox, then open **Developers → API keys** (or **Workbench → Overview → API keys**, depending on the Dashboard layout).

Merge `.env.template` into the workspace root `.env`, keeping existing database settings:

```dotenv
STRIPE_API_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_ACCOUNT_ID=acct_1UJNMsIy87xghqkP
STRIPE_LIVE_APPROVED=false
```

- `STRIPE_API_KEY`: preferably a restricted `rk_test_…` key. The native Medusa provider uses Payment Intents, Customers, Payment Methods, Setup Intents, and Refunds; grant their needed read/write permissions. The connection checker also needs account read access. An `sk_test_…` secret key can be used for initial sandbox setup. Never use a live key for tests.
- `STRIPE_PUBLISHABLE_KEY`: the same sandbox's `pk_test_…` key.
- `STRIPE_ACCOUNT_ID`: that sandbox's `acct_…` identifier, not its parent live account ID.
- `STRIPE_WEBHOOK_SECRET`: `whsec_…` from the listener or webhook destination below. This is separate from an API key.

Keep secrets out of chat and Git. Root Stripe values load into the backend before its local environment file. Deployment-injected nonempty variables take precedence; remove duplicated Stripe settings from backend-specific env files. The frontend fetches only the publishable key and provider ID at runtime, so no Stripe keys need to be copied into `storefront/.env` or rebuilt into browser assets.

Missing server keys disable Stripe. Partial or mixed-mode configuration fails startup. Secret and publishable keys must belong to the same account; matching prefixes alone cannot prove that. TLS verification remains enabled for payment traffic.

## 2. Forward signed webhooks locally

Authenticate the Stripe CLI to the same sandbox:

```bash
stripe login
stripe listen \
  --forward-to http://localhost:9000/hooks/payment/stripe_stripe_acct_1UJNMsIy87xghqkP_test \
  --events payment_intent.succeeded,payment_intent.amount_capturable_updated,payment_intent.payment_failed,payment_intent.canceled,payment_intent.processing,payment_intent.requires_action
```

Copy the listener's `whsec_…` into the root `.env`. Keep the listener running. Restart it against the correct account if you change accounts, and update the signing secret if it changes. Do not use a Dashboard destination's secret for CLI-forwarded events.

For a deployed backend, create a webhook event destination in **Workbench → Webhooks**, using:

```text
https://YOUR-BACKEND/hooks/payment/stripe_stripe_ACCOUNT-ID_MODE
```

For example, replace `ACCOUNT-ID` with `acct_1UJNMsIy87xghqkP` and `MODE` with `test`. Subscribe to `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`, `payment_intent.payment_failed`, `payment_intent.canceled`, `payment_intent.processing`, and `payment_intent.requires_action`. Use that destination's signing secret. Medusa preserves the raw request body, verifies signatures through its Stripe provider, and processes payments with its native workflow. The old `/hooks/stripe` endpoint returns 410.

Use a persistent event bus/workflow infrastructure for production webhook delivery. A successful webhook HTTP response means the event was queued; inspect Medusa subscriber errors as well as Stripe delivery logs.

## 3. Check the account and enable its region provider

```bash
node scripts/check-stripe.cjs
npm run dev:backend
npm run dev:storefront
```

In native Medusa Admin → **Settings → Regions**, edit the checkout region and enable:

```text
pp_stripe_stripe_acct_1UJNMsIy87xghqkP_test
```

Ensure published products have real Medusa variants, prices in the region currency, available inventory, and a sales channel attached to the storefront publishable key. Configure one applicable flat-price Royal Mail option per shipping destination (£4.95 UK / £15 worldwide, unless an explicitly configured policy changes this). Checkout uses the actual Medusa total, including configured shipping, taxes, and promotions. Browser-only prices and the old cosmetic promo-code widget cannot lower the charged total.

## 4. Test

- Sign in, add a real catalog product as a **one-time purchase**, enter delivery details, and accept the RUO terms.
- Continue to secure payment. Review the server-calculated total.
- Use Stripe test card `4242 4242 4242 4242`, a future expiry, and any three-digit CVC.
- Test a decline (`4000 0000 0000 9995`) and 3DS challenge (`4000 0025 0000 3155`).
- Confirm a successful PaymentIntent in the intended sandbox and one corresponding Medusa order. Test webhook retries and reopening the return URL; neither should create a second order.
- Interrupt the redirect after payment and retry confirmation. The app must not initiate a second charge.
- Invalid signatures must not mutate payment/order state. Missing keys must not generate mock payment tokens or successful orders.

Card data is collected exclusively by Stripe Payment Element. Card orders are completed by Medusa's native cart/payment workflow. The success URL alone never establishes payment success.

## 5. Switch sandbox accounts or go live

Replace **all four** Stripe account settings together. Restart the backend, enable the new provider in each applicable region, and configure the new account's webhook destination. Each account/mode has a distinct Medusa provider ID, preventing reuse of another account's payment sessions or customer references. Existing local checkout carts are reused only if the provider and checkout details still match.

Finish outstanding payments/refunds before switching. Switching credentials is not a migration of Stripe customers, saved cards, payment history, or subscriptions. Retain the old deployment/credentials separately if it still needs to process old orders. Do not switch accounts while customers are paying.

Live mode is conditional on written Stripe underwriting approval for PEPTECH's actual research-peptide catalog, as required by `GEMINI.md`. Only then use matching live keys and set `STRIPE_LIVE_APPROVED=true`. This flag records an operator acknowledgement; it does not obtain approval from Stripe.

## Scope and remaining prerequisites

This connects **one-time native Medusa payments**. The pre-existing subscription screen only simulated recurring billing, so checkout now rejects subscription baskets until real 28-day renewals, lifecycle webhooks, customer controls, and reminders are implemented. Native Medusa Stripe payments do not implement those subscription workflows automatically.

Static/demo products without an exact purchasable variant cannot be charged. Re-add items from the live catalog. Multiple-variant products need explicit variant selection; checkout does not guess. Bank transfers remain manually verified and must not be treated as paid on order submission.

No real sandbox charge can be verified until the keys, region, catalog, inventory, and shipping are configured.

References: [Medusa Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe), [Stripe API keys](https://docs.stripe.com/keys), [Stripe webhook testing](https://docs.stripe.com/webhooks), [Stripe test cards](https://docs.stripe.com/testing).
