# Stripe deployment and operations

Updated 27 September 2026. Sandbox code is implemented; this is not live-launch approval. No client database migration or live payment was performed. Royal Mail API automation is deferred by the user.

## Delivered payment paths

- Signed-in checkout uses current Medusa GBP variant prices and tracked inventory. Signup's 18+/RUO declaration is the eligibility check; it is not independent researcher verification.
- Exact approved catalogue variants are required. Pen sets are one-time; vials/refills support 28-day subscriptions with 10% off product prices. UK shipping is £4.95; approved international shipping is £15. No invented aliases, automatic product approval or hidden naming changes.
- Stripe-hosted Checkout (`ui_mode: hosted_page` on the pinned API) collects delivery, billing, phone and payment details after the storefront basket/consent step. Mixed baskets have one initial invoice and recurring-only renewal orders.
- The durable inbox accepts signed webhooks, then the recovery job reconciles authoritative Stripe state. A redirect never confirms payment. Native Medusa payment capture imports an existing Stripe payment; it does not charge again.
- Pause uses Stripe collection control (`void`), resume retains the next cycle, skip finalizes without collection then voids the affected invoice, date changes use a future trial end with no prorations, and cancel stops future collection. Paid orders remain separate.
- Renewal drafts require stock and eligibility preflight before finalization. Tax comes from the invoice. Never enable a second charging scheduler.
- Every paid order starts on a fulfillment hold. Admin records real batch/COA allocations, then releases packing. Use the native fulfillment workflow and actual carrier tracking. Payment does not imply dispatch.
- Card refunds use `/admin/commerce/refunds` and a stable operation UUID. Refunds do not cancel subscriptions or automatically restock goods. Native returns handle returned inventory. The old metadata-only return/refund simulators are retired.
- New checkout requests are Stripe-only. Historical bank records remain available for reconciliation; the storefront and checkout API no longer create bank-transfer attempts.

## Environment and account switching

See root `.env.template`. Payment variables are loaded from root `.env`; deployment-injected values win. Other Medusa environment settings must be supplied to the backend/deployment environment.

Required for sandbox:

```dotenv
STRIPE_API_KEY=rk_test_REPLACE
STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE
STRIPE_ACCOUNT_ID=acct_REPLACE
STRIPE_WEBHOOK_SECRET=whsec_LEGACY_PROVIDER_DESTINATION
STRIPE_CHECKOUT_WEBHOOK_SECRET=whsec_NEW_CHECKOUT_DESTINATION
STRIPE_STOREFRONT_URL=http://localhost:3000
STRIPE_LIVE_APPROVED=false
```

Use a restricted key with permissions for the implemented account, customer, Checkout, PaymentIntent read, Billing/subscriptions/invoices, refunds, disputes read, Tax settings/registrations read, tax rates read and portal operations. Test-clock permissions are only for the verification scripts. Validate exact permissions with sandbox acceptance tests; avoid granting broad production permissions merely to silence a test-clock failure.

Live additionally requires strong JWT/cookie secrets, durable PostgreSQL, `REDIS_URL`, working TLS SMTP (`STRIPE_EMAIL_*`), a separate stable `STRIPE_COMMERCE_SIGNING_SECRET` of at least 32 random characters, financial-admin native user IDs in `STRIPE_COMMERCE_ADMIN_IDS`, HTTPS storefront URL, written Stripe scope evidence and the explicit live approval flag. Keep the signing secret stable when rotating API keys; losing it requires controlled receipt re-attestation, not disabling validation.

The commerce ledger requires a direct PostgreSQL connection or a session-mode pool; transaction pooling does not preserve session advisory locks. If necessary set `STRIPE_COMMERCE_DATABASE_URL` to a direct/session-pool URL for the same Medusa database. Never point it at a different database from the migrations.

Restart backend and storefront after changing the relevant environment. Account + test/live mode scope customer, invoice, receipt and provider mappings. Never copy Stripe IDs from one account to another. Switching the active profile does not migrate subscriptions or keep the old profile's webhook worker running. Drain or separately operate the old profile before changing a production account. Keep all old financial records.

## Stripe Dashboard

1. Use the intended sandbox while testing. Live mode needs its own keys, webhook destination, portal configuration and Tax settings.
2. Configure supported payment methods in Dashboard; code uses dynamic methods. Register the production payment domain for wallet methods and test on eligible devices.
3. Configure Tax → Settings: actual head-office address, reviewed default product tax code and inclusive/exclusive price treatment. Add actual active registrations. The app uses those defaults, never a hard-coded VAT percentage. Products may have a reviewed tax-code override; delivery is classified as shipping.
4. An unconfigured **sandbox** can test payments with tax disabled (the hosted payment summary reflects this). Live checkout refuses missing Tax setup/registrations. A non-VAT-registered live business needs a separately reviewed no-collection policy before that gate is changed; do not invent a registration.
5. Configure a customer portal for payment-method management and invoice history only. Disable customer address changes, subscription updates and portal cancellation; app controls own the subscription/inventory workflow. Save its ID in `STRIPE_PORTAL_CONFIGURATION_ID`.
6. Configure Billing payment recovery/retry rules. The app emits payment-recovery and three-day reminder email operations; configure and verify the mail transport before launch. SMTP acceptance is not proof of inbox delivery. Duplicate delivery is possible after a crash at the SMTP boundary; deterministic Message-ID aids tracing.
7. Create the new webhook destination at `https://YOUR_BACKEND/hooks/peptech-stripe`, API version `2026-08-26.dahlia`. Subscribe to Checkout completed/expired/async success/async failure; subscription created/updated/deleted; invoice created/updated/finalized/paid/payment_failed/payment_action_required/voided/marked_uncollectible; refund created/updated/failed; charge.refunded; charge.dispute.created/updated/closed. Preserve the separate legacy destination until old native carts drain.

Local listener example (the `--events` argument needs a value):

```sh
stripe listen --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.created,invoice.updated,invoice.finalized,invoice.paid,invoice.payment_failed,invoice.payment_action_required,invoice.voided,invoice.marked_uncollectible,refund.created,refund.updated,refund.failed,charge.refunded,charge.dispute.created,charge.dispute.updated,charge.dispute.closed --forward-to http://localhost:9000/hooks/peptech-stripe
```

Put the listener's signing secret in `STRIPE_CHECKOUT_WEBHOOK_SECRET`, restart backend, and keep the listener running. The CLI account must match the app's root `.env` account. An MCP connected to another sandbox does not configure the app's credentials.

## Medusa admin setup and deployment

1. Back up the deployment database; apply the custom commerce migration using the normal Medusa migration command in `backend/apps/backend`. Run `npx medusa db:migrate` only against the explicitly chosen deployment database. This was tested on an isolated database, not run on the client's database.
2. Build backend and storefront with their `npm run build` scripts. Deploy matching builds; do not rebuild a running preview and reuse stale assets.
3. In native admin → Payments and billing, record exact variant approvals using `product-reconciliation.csv`. Actual vial prices remain in native product pricing. Nothing automatically approves production products.
4. Save reviewed routing settings. IDs come from the actual Medusa region, sales channel, stock location and shipping option; do not paste fixture IDs:

```json
{
  "enabled": true,
  "region_id": "reg_REPLACE",
  "sales_channel_id": "sc_REPLACE",
  "location_id": "sloc_REPLACE",
  "shipping_option_id": "so_REPLACE",
  "destinations": ["gb"],
  "tax_policy": "stripe_default",
  "tax_evidence_ref": "Client-reviewed Stripe Tax setup reference",
  "stripe_scope_evidence_ref": "Written Stripe review case reference",
  "version": "launch-v1"
}
```

5. Run the recovery job continuously with shared Redis workflow/event/locking services. Monitor pending/retry/review records, draft/open invoices, failed notifications, paid stock holds and reconciliation tasks. Alert on job failure and old pending items. The initial subscription's collection guard is installed during reconciliation: prolonged initial webhook/worker outages require immediate review, not unattended operation.
6. Refund/dispute notifications put linked orders back on hold and create review tasks. External Dashboard refunds need operator reconciliation into Medusa; they are not silently treated as native refunds. Resolve accounting and fulfillment explicitly before release.
7. Verify actual destination delivery, email delivery, rate limits, backups, restore and ingress/raw-body signature handling in staging. Review existing dependency audit findings; the current install reports 76 advisories (68 high, 8 moderate), not all introduced by this integration.

## Acceptance and launch boundary

Reproducible isolated scripts are in `scripts/run-commerce-sandbox.cjs`. They explicitly require loopback PostgreSQL with a `_test` database and test keys; they must not run against live credentials or client data. Modes: `prepare`, `settle`, `billing`, `billing-verify`, `billing-advance`, `billing-renewal`, `billing-controls`, `billing-skip-advance`, `billing-skip-verify`, `billing-cancel`, `refund`, `webhooks`, `bank`. Browser confirmation is required between prepare and settle/verify. Advance stages are asynchronous; wait for the Stripe clock to be ready.

Before live activation, obtain the client's catalogue/legal/business/Stripe scope decisions in `client-handoff.md`; configure production Tax, portal, mail and webhook destinations; test taxed one-time and mixed baskets with real sandbox registrations; run 3DS/SCA, wallet and asynchronous-method acceptance on the deployed staging domain; validate native fulfillment/returns operationally. Royal Mail Click & Drop remains a later integration.

There is no implementation that guarantees Stripe will never block a payment or restrict an account. Sandbox results verify application paths, not underwriting, legal authorisation, payout availability or production delivery. Switching to live keys alone is not a release procedure.

## Hosted Checkout retest (2026-09-27)

Restart the backend and storefront after updating. Remove old static/demo basket entries and select current API products from `/shop`; every new basket line carries a real Medusa variant ID and SKU. Legacy `complete-pen-set?model=...` URLs do not resolve to the generic pen: create/reconcile the actual named product and variant in Admin first. Never alias Retatrutide to RT40 or another product without documented identity evidence.

Choose delivery country and accept terms at `/checkout`, then continue to Stripe. Stripe collects the full delivery address, phone and billing address. Return to the storefront to change country, since the shipping quote is country-specific. The signed/reconciled Checkout session supplies order addresses; changing the Stripe customer profile later does not change an existing order. Confirmation and cart clearing occur only after backend settlement.

`node scripts/run-commerce-sandbox.cjs prepare` creates an isolated hosted session. Its URL is in `/tmp/peptech-sandbox-fixture.json` under `session.checkoutUrl`. Open it, pay with the official 4242 test card, then run `node scripts/run-commerce-sandbox.cjs settle`. These scripts use the isolated local test database, not client catalogue approvals. The main application still needs the migration, commerce settings, exact catalogue approvals, tracked stock and working webhook/worker described above.
