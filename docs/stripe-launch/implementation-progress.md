# Implementation and verification record

Updated 27 September 2026. User authorised implementation, then confirmed signup-only researcher eligibility, existing 28-day/10% subscription rules, vial prices from native pricing, Stripe Dashboard tax defaults, and deferral of Royal Mail API automation.

## Foundation and payment integration

Implemented authenticated order/subscription boundaries, a PostgreSQL commerce ledger and migration, account-scoped keys, database advisory locks, audit records, Checkout Sessions/Payment Element, authoritative quotes, inventory reservations, signed native payment adapter, durable webhook inbox, recovery worker and backend-confirmed success page. Payment data is tokenized by Stripe; no local card-entry storage remains. Retired prototype wallet buttons, fake local discounts, metadata-only returns/refunds and false signup verification/VAT-exemption labels.

Verification:
- Full Medusa migration passed on isolated PostgreSQL 16, not the client database.
- Final automated suite: 39 tests across seven suites; policy/configuration, signature/attestation, Stripe tax mapping and real PostgreSQL concurrency/account isolation.
- Sandbox one-time checkout: £14.95; repeated creation returns the same session; successful test card creates one native order, payment collection and captured payment. Reconciliation replay creates no duplicate.
- Injected an isolated crash between capture and order-transaction recording: recovery restored exactly one transaction without another charge.
- Partial £1 refund succeeded; retry returned the same Stripe refund and native accounting.
- Webhook handler tests rejected invalid signatures, wrong mode and wrong account; storage failure returned 503; duplicate delivery persisted one event. These are handler/inbox checks, not deployed ingress tests.

## Subscriptions

Implemented mixed baskets, recurring-only renewal orders, draft invoice preflight, pause/resume/skip/change-date/cancel, ownership checks, stable command IDs, payment-method/invoice portal configuration guard, reminder/recovery email outbox and failed-payment holds.

Verified against real Stripe sandbox test clocks:
- £23.95 mixed initial basket; only the £9 subscribed item and £4.95 shipping repeat (£13.95 every 28 days).
- Initial invoice and two separate test runs of 28-day renewal each produce one native order on replay. One-time products do not recur.
- Pause/resume changed Stripe collection behavior correctly; duplicate command replay was safe.
- Cross-customer command rejected; next date changed; skip replay remained idempotent.
- Skip implementation initially encountered Stripe's restriction on deleting subscription-generated drafts. Corrected to durable finalize-without-collection followed by void; retest confirmed no charge and no collectible invoice.
- Cancellation verified `cancel_at_period_end` and stopped future collection.

## Admin, bank payments and fulfillment

Native-style Payments and billing page provides ledger details, exact catalogue approval, settings, financial actions, bank verification and packing release. Refund/dispute events create review tasks and reapply fulfillment holds. Bank evidence is operator-attested; it is not an automated bank feed.

Verified isolated bank flow: awaiting transfer never implies paid; underpayment rejected; identical bank reference converged on one order; a second settlement reference for the same checkout was rejected; packing release required a paid receipt and complete batch/COA allocations. No Royal Mail label, tracking or external dispatch was simulated as real.

## Tax and storefront

New configuration uses `stripe_default`. The actual configured sandbox has pending Tax setup, no default tax code/behavior and no active registrations. Per user instruction, test payments continue with tax explicitly disabled/labeled. Live checkout requires reviewed Tax setup and registrations. No registration, head-office address or client VAT rate was invented.

Stripe tax line reconciliation has inclusive/exclusive and invoice mapping tests, including rejection of unexpected quantities, prices, discounts, identities and totals. Actual nonzero Stripe Tax checkout/renewal still needs a configured sandbox; that is not claimed as verified. Taxed bank checkout currently requires an operator-issued Stripe invoice and is guarded in the storefront.

Browser checks used the actual production storefront build with isolated API fixtures and real Stripe sandbox Elements:
- Mobile 390px: embedded form, authoritative £14.95, one checkout-create request, no horizontal overflow or page errors.
- Declined test card displayed its error and allowed retry; 4242 test card subsequently succeeded.
- Pending backend status did not show a false confirmation.
- Confirmed-status UI fixture preserved items added after the purchased basket snapshot.
- The actual Stripe payment from that UI test was then reconciled separately into one native Medusa order.

Backend/admin and storefront production builds passed; TypeScript and whitespace checks passed. Verification harness records are on the isolated database; no client catalog/DB migration or live settings were changed.

## Release boundary

Code is available for sandbox/staging acceptance, **not an assertion that production launch is cleared**. Remaining production acceptance includes configured nonzero Tax calculations, SCA/3DS/wallet/asynchronous methods on deployed domains, actual SMTP delivery, portal setup, Redis/worker operation and alerting, public webhook ingress, client-approved exact product identities, written Stripe scope review, legal/business content and native fulfillment/returns operations. Review existing dependency audit findings before release. Royal Mail API work remains explicitly deferred.

SMTP was not configured in this isolated environment: email operations remain pending with retry errors rather than being falsely marked delivered. Stripe account risk and issuer declines cannot be eliminated by code. See [deployment-runbook.md](deployment-runbook.md) and [client-handoff.md](client-handoff.md).

## Hosted Checkout revision — 2026-09-27

- Replaced the custom Elements checkout with Stripe-hosted Checkout (`hosted_page` on API 2026-08-26.dahlia). The storefront collects country and consent; Stripe collects shipping, separate billing, phone and payment. New checkout requests accept Stripe only; historical bank records remain intact.
- Collected addresses are copied from the immutable Stripe session into the order and subscription snapshot, including invoice-first delivery. Country stays bound to the server shipping quote. Completed sessions awaiting delayed payment return processing, never false success.
- Catalogue, account and checkout now resolve the same configured backend, including local production previews. Static fallback products and fabricated cartridge selectors no longer enter baskets. Pen, refill and vial purchase paths carry exact variant IDs/SKUs; recurring prices receive one discount.
- The connected backend returned 17 products and no Retatrutide product/variant. Existing Retatrutide static cart entries require removal; the real product must be created/reconciled with reviewed identity/price/stock before it is purchasable. No automatic alias or approval was created.
- Verification: 34 commerce tests including isolated PostgreSQL concurrency passed; backend and storefront production builds passed (webpack used because this environment blocks Turbopack worker binding); final backend TypeScript check passed.
- Actual hosted sandbox card payment: £14.95, one native order/payment, collected addresses matched, repeated reconciliation and capture crash recovery produced no duplicate.
- Actual hosted mixed subscription: £23.95 initially, £13.95 quoted every 28 days; invoice-first reconciliation retained delivery details; one-time item stayed out of recurring items; pause/resume passed. Test subscription canceled after validation.
- Browser: final built shop displayed 17 API products, and adding a pen saved its exact variant ID with one-time purchase. Checkout showed the Stripe-hosted flow/account gate and no manual transfer option.
- Tests used an isolated database and sandbox account. Client catalogue facts, approvals, migration/configuration and live launch prerequisites were not fabricated or changed by these tests.
