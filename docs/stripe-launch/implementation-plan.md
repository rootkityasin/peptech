# PEPTECH Stripe payments, subscriptions and fulfillment implementation plan

Status: sandbox implementation authorised by the user and implemented on 27 September 2026. This document records the original design; implementation-progress.md and deployment-runbook.md describe the delivered scope, evidence and remaining launch checks. Live deployment and external submissions have not been performed.

## 1. Established context and intended outcome

The client already owns and operates an authorised UK business. The plan accepts that fact. We need the scope and evidence of the existing authorisations so the website, destinations, customer eligibility and Stripe account accurately reflect the real business. Existing authorisation and Stripe's acceptance of a particular online payment model are separate matters.

Deliver a reliable commerce flow with:

- Existing PEPTECH checkout and success-page design, using official Stripe payment components and their documented appearance controls.
- One-time Complete Pen Set purchases; one-time or recurring Refill Cartridges and Freeze-Dried Vials.
- Recurring billing every 28 days with a default 10% product discount; no recurring pen set charge.
- One initial payment for a mixed basket, then renewals containing only the recurring goods and applicable delivery/tax.
- Real customer self-service, verified payment state, native Medusa order/payment/fulfillment records and Royal Mail dispatch.
- Accurate, approved product identity across storefront, backend, Stripe, invoices, COAs, labels and customs.
- Failure recovery, refunds, disputes, auditable operations and daily reconciliation.

No implementation can promise zero issuer declines, fraud blocks, reviews, payout reserves or suspension. The acceptance target is accurate onboarding, enforceable controls, correct transaction processing and a documented response to restrictions. Never rotate merchant accounts, mask products or weaken Radar to bypass a restriction.

## 2. Repository baseline and gaps

The current code has environment-scoped Stripe configuration, the native Medusa Stripe provider, a Payment Element component and cart completion. A successful API-key account check has occurred; a full successful checkout and fulfillment have not been established by that check. Runtime settings may lag .env changes until restart.

Files affected by the proposed implementation:

| Area | Current location | Planned change |
|---|---|---|
| Checkout | storefront/src/app/checkout/page.tsx | Preserve layout; server quote, signed-in customer eligibility, mixed-basket summary, embedded Stripe UI and recovery states |
| Payment UI | storefront/src/components/checkout/StripePayment.tsx | Adopt the chosen Checkout Sessions component integration; never retain two independent payment creators |
| Success page | storefront/src/app/checkout/success/page.tsx | Owned checkout status lookup; processing/confirmed/action-needed states; verified order and subscription details |
| Cart/payment client | storefront/src/lib/stripe-checkout.ts | Typed API contracts, durable attempt identifiers, cart revision handling and polling |
| Catalog | storefront/src/data/catalog.ts, catalog.json, products.ts, product components, storefront/src/lib/medusa.ts | Approved canonical variants and presentation; remove purchasable fallback/demo records and fuzzy purchase matching |
| Account UI | storefront/src/app/account and customer-api.ts | Server-backed subscriptions, invoices, addresses and customer portal |
| Legacy orders | backend/apps/backend/src/api/store/custom/orders/route.ts | Enforce ownership; replace client-price order creation with authoritative Medusa workflows, including bank transfer |
| Legacy subscriptions | backend/apps/backend/src/api/store/custom/subscriptions/route.ts and admin equivalent | Replace metadata-only mutations with authenticated subscription commands and durable records |
| Backend configuration | medusa-config.ts/.js and src/lib/stripe-config.ts | Account/mode/provider consistency, credentials and live feature gates |
| New backend modules | src/modules, src/workflows, src/subscribers, src/jobs | Catalog identity, checkout attempts, Stripe billing adapter, webhook inbox/outbox, renewals, reconciliation and fulfillment integration |

Preserve unrelated local changes. Keep Medusa Admin native; add any necessary screens using native Medusa components and permissions, without restyling the dashboard. Do not run the existing seed-peptech script on client data: it deletes existing products/categories.

## 3. Proposed architecture and payment ownership

### Primary design

Use Stripe Checkout Sessions with the Payment Element inside PEPTECH's existing checkout. Use `mode=payment` for one-time baskets and `mode=subscription` when a basket contains recurring goods. Adopt the current documented Elements UI mode supported by the pinned production SDK/API version, verified in a sandbox before implementation is accepted. Avoid preview-only dependencies. A supported embedded Checkout template is the fallback if the chosen SDK/UI combination cannot meet this contract; it must pass the same business tests.

This is a planned migration from the current native PaymentIntent flow, not a Dashboard switch. Build a dedicated Medusa payment-provider adapter and orchestration workflows for Checkout/Billing. The existing native provider remains responsible for its already-created payments until drained. New and legacy attempts have explicit provider/version ownership; no attempt runs through both.

| Responsibility | Authority |
|---|---|
| Actual SKU identity, sale eligibility, inventory, batch/COA | Client-approved records in Medusa/custom modules |
| Base prices, discount policy, basket and shipping eligibility | Medusa; calculated server-side, never from browser prices |
| Payment collection, authentication, recurring invoice schedule | Stripe |
| Taxes | One agreed authority per checkout. Proposed: Stripe Tax for Stripe payments after accountant-approved registrations/configuration; import exact tax results into Medusa without recalculating/double-taxing |
| Bank transfer quote/tax | Same approved tax policy; use a supported off-Stripe tax calculation or agreed Medusa tax provider, not a second tax on card orders |
| Customer-facing final payable amount | Current server-validated quote plus Stripe's authoritative final calculation; discrepancy prevents payment/order release |
| Fulfillment and returns | Medusa and Royal Mail integration |
| Accounting/reporting | Reconciled Stripe transactions and Medusa records; accountant owns statutory treatment |

A confirmed Checkout payment must create/capture the corresponding Medusa payment through the adapter using the existing Stripe payment reference. The adapter must not call Stripe to charge again. It implements initiate, retrieve/status, authorize, capture, cancel and refund with idempotent semantics. With automatic capture, Medusa's capture operation reconciles the already-captured payment rather than creating a second capture.

For mixed baskets, one Checkout subscription session contains recurring Prices and one-time Prices. Stripe places one-time items on the first invoice only. That paid first invoice creates one initial Medusa order containing all purchased goods. Recurring invoices create subsequent orders containing only eligible recurring goods. Checkout completion and invoice-paid events converge on the same finalization workflow and unique initial invoice key.

Create a documented API-version compatibility test before finalising the adapter: resolve Checkout → subscription/invoice → payment using the pinned API's current object relationships; do not assume older invoice PaymentIntent fields still exist. Add the Checkout integration identifier required by the selected API, with a stable integration label plus an eight-letter random suffix. Do not hardcode payment_method_types; configure eligible methods through Dashboard configurations and verify recurring/off-session support.

### Core workflow

1. Authenticate the customer and verify approved purchasing eligibility and destination.
2. Resolve explicit Medusa variant IDs; validate allowed formats, quantities, catalog approval, stock and subscription eligibility.
3. Generate a versioned server quote. Reserve inventory for the allowed payment window and snapshot prices, discount version, address, tax inputs, policy/consent versions and legal product names.
4. Persist a CheckoutAttempt before calling Stripe. Generate a stable idempotency key from its ID and immutable operation version.
5. Create/retrieve the Stripe session using only the server snapshot and account-specific price/customer mappings. Persist Stripe IDs before returning the scoped client secret.
6. Render Stripe components; customer confirms payment and any authentication.
7. Verified events and recovery jobs retrieve authoritative payment state, verify ownership, currency and amount, and perform idempotent Medusa order/payment creation.
8. Release fulfillment only after financial confirmation, eligibility checks and stock allocation. The return URL displays status but is never proof of payment.

## 4. Durable data and invariants

Implement custom Medusa modules/migrations rather than direct table writes in route handlers. Store currency-aware monetary values as integer minor units or exact decimal strings, never binary floating-point money. Preserve Medusa's currency-unit conventions at the adapter boundary, including zero/three-decimal currencies if later supported.

| Record | Required fields and uniqueness |
|---|---|
| ProductIdentity / CatalogApproval | Canonical SKU, exact composition, form, strength units, fill volume, pack size, variants, authorised purpose, source documents, approved descriptions, destination scope, approval version and approver |
| ProductAlias | SKU, alias, locale, alias type and evidence; unique within intended scope; collisions require review |
| StripeResourceMapping | Account ID, livemode, provider version, local ID, Stripe ID; unique account/mode/resource pair; prices also keyed by currency/interval/version |
| CustomerEligibility | Authenticated customer ID, review status/scope, evidence references, reviewer, effective/expiry dates, audit history; client cannot self-approve |
| CheckoutAttempt | Customer, cart ID/revision, immutable quote hash, account/mode, session/invoice/payment IDs, reservation, state/version and idempotency operation IDs |
| PaymentReceipt | External payment/invoice ID, exact currency/amount, payment source, verification result, Medusa order/payment link; unique external financial reference per account/mode |
| Subscription | Customer, Stripe subscription ID, status, items, recurring prices, shipping/tax policy, consent version, renewal period, pause/skip/change requests and review holds |
| RenewalCycle | Subscription/cycle/invoice identity, preflight result, reservation, expected amount, paid amount and order link; unique invoice and logical subscription cycle |
| WebhookInbox | Account/mode + Stripe event ID unique, verified raw event digest, minimal needed payload, receipt/processing timestamps, attempts/errors and processing lease |
| Outbox / Operation | Unique business operation key, payload, committed status, retry state; drives emails, shipping and reconciliation |
| Fulfillment / Shipment mapping | Medusa fulfillment ID, client shipment reference, carrier order/label/tracking identifiers, batch/COA allocation, dispatch timestamps and failure state |
| Refund / Dispute mapping | Payment, refund/dispute ID, order lines and tax/shipping allocation, status and auditable decision |

Invariants: no cross-account resource reuse; no two charges for one attempt; no two initial orders for one invoice; no two renewal orders for one cycle; paid never means shipped; a customer cannot read or mutate another customer's objects; client metadata cannot assert paid, approved or fulfilled.

## 5. Catalog and keyword reconciliation

Use product-reconciliation.csv and product-reconciliation.md in this folder. The worksheet contains 36 storefront records and 17 local Medusa products, not 53 established distinct SKUs. Only the client-approved master catalog establishes identity. Review exact-handle candidates; never merge by title similarity, code resemblance or shared URL.

Do a dry-run migration first: export backups and diff plans, approve row-level mappings, preserve existing product/variant IDs where identity is unchanged, archive superseded records, and keep historical order snapshots immutable. Create explicit redirects and approved search aliases where names/handles change. Do not repurpose an old Stripe Product or Price to describe a different substance. Archive replaced Prices for new sales while preserving historical subscription references.

Centralise catalog rendering after reconciliation. No "first product" fallback may become purchasable when API lookup fails. Revalidate existing local baskets against canonical variants; unresolved items require customer re-selection. Preserve the selected pen/cartridge model explicitly through checkout, invoice and picking records.

## 6. Checkout and success UI specification

Retain PEPTECH navy/teal/white styling, delivery form, order summary, RUO acknowledgement and responsive layout. Integrate official Payment Element and, where appropriate, Address/Express Checkout Elements. Wallet visibility depends on account, browser, domain registration and eligible payment methods; do not promise unavailable methods or charge separately through wallet buttons.

- Show actual SKU, quantity, one-time/28-day purchase type, discount, delivery, tax, currency and total.
- Mixed basket summary separates "Due today" from "Every 28 days", including recurring shipping/tax treatment and next billing date. Never label 28 days as monthly.
- Obtain explicit recurring consent separately from RUO/terms acknowledgement. Persist text/version, accepted terms and time; retain only necessary audit data under the approved privacy policy.
- Card data stays within Stripe; no PAN/CVC, full client secrets or sensitive webhook data in logs, localStorage, analytics, session replay or support screenshots.
- Address/cart/promotion changes invalidate the quote safely. Cancel/expire superseded payable sessions before issuing replacements; if payment already succeeded or is ambiguous, reconcile before allowing another charge.
- Lock one active operation server-side; disabling the button alone is insufficient. Expiration/reload uses the existing owned attempt.
- Success page reads the server's owned attempt/order status. Show confirming, action required, processing, confirmed, failed, expired or support-needed. Never trust query-string flags or sessionStorage receipts.
- Clear only purchased cart items/revision after confirmation; retain items added in another tab. Handle signed-out returns with login and secure resume.
- Show verified order number, paid amount, invoice/receipt access, delivery address, next subscription billing date and account-management link. Do not claim COA email, dispatch or tracking until completed.
- UI test: mobile/desktop, keyboard/screen reader, focus after SCA, wallet availability, interrupted redirects, slow network, session expiry, modal/scroll cleanup and no layout obstruction.

## 7. Subscription contract

Defaults proposed for approval:

| Decision | Proposed behavior |
|---|---|
| Interval | Exactly 28 days; Stripe recurring interval day=28 or week=4 |
| Eligible goods | Approved refills/vials only; pen sets one-time |
| Discount | 10% off approved base product price, computed once; not automatically on shipping/tax |
| Grouping | One subscription shipment group for common customer, currency, destination and 28-day schedule; different groups require separate explicit consent/checkouts |
| Mixed purchase | One initial invoice/order; future invoices contain only recurring items and recurring delivery/tax |
| Shipping | One charge per shipment, initially £4.95 UK / £15 approved international unless client confirms another policy; no assumed free-shipping threshold |
| Initial vs renewal delivery | Model recurring delivery exactly once. If initial and recurring amounts differ, use an explicit, documented first-invoice adjustment and show both totals; never bill Checkout shipping plus a duplicate recurring shipping line |
| Reminder | Send three days before scheduled renewal; delivery retry, deduplication and monitoring; recompute on skip/date changes |
| Cancel | Stops future renewals; already-paid orders remain subject to separate cancellation/refund rules |
| Pause | Stops future charges and shipments from the agreed effective cycle; specifies treatment of any already-open invoice; not merely a UI badge or unqualified pause_collection flag |
| Skip | Skip the next unpaid shipment/cycle with corresponding Stripe billing change; show the next actual date and prevent unexpected proration or catch-up charges |
| Item/quantity change | Apply to next unpaid cycle by default, show new recurring total and consent; preserve already-paid invoice/order snapshot |
| Price change | Versioned future price with client-approved notice/consent policy; no silent rewrite of existing recurring amounts |
| Payment failure/SCA | No shipment; recovery notification, configured retries and customer authentication link; policy decides eventual pause/cancel |
| Stock shortage | Preflight before renewal/finalization, reserve inventory, and defer/hold the charge where possible. If payment wins a race with stock loss, hold fulfillment and promptly offer approved refund/resolution |
| Address change | Validate permitted destination, shipping and tax before next cycle; do not silently redirect an already-dispatched order |

Stripe Billing owns scheduling, invoice creation and payment retries. Do not build a second cron that independently charges PaymentIntents every 28 days. A platform preflight scheduler controls eligibility/inventory and coordinates with Billing before invoice finalization. Define and test auto_advance, pause and scheduling semantics for the pinned API; never rely on a late webhook alone to prevent an automatic charge.

Use an authenticated Stripe Customer Portal session for supported payment-method, invoice and cancellation operations. Custom PEPTECH subscription commands handle skip, date changes and shipment policies not supported by the portal configuration. Both paths reconcile back from Stripe. A 0-value invoice settled by an approved discount/credit may be valid; a manually marked-paid/out-of-band invoice requires the appropriate verified payment evidence before automatic release.

Existing metadata-only "Active" subscriptions are unverified historical records. Do not convert them into billable subscriptions or assume card consent. Reconcile against actual client records, then obtain fresh customer authorisation where needed. Existing legitimate client subscriptions require a separate migration inventory; payment tokens cannot be moved by simply changing .env.

## 8. Webhooks and distributed failure recovery

Create a dedicated adapter endpoint, proposed `/hooks/peptech-stripe`, separate from the existing native provider endpoint. It must verify the raw-body signature, account/mode, timestamp tolerance and expected resource ownership before accepting durable work. Use a separate scoped secret for each configured event destination. A valid signature alone does not prove the event belongs to this application's checkout.

Acknowledge only after the event is durably stored; process asynchronously. Duplicate valid events are acknowledged without repeating side effects. Invalid signatures are rejected; temporary persistence failures return a retryable error. Maintain a replayable failure queue and operation-level locks with leases.

Event responsibilities (confirm exact availability in the selected API version):

| Event family | Handler responsibility |
|---|---|
| checkout.session.completed | Resolve owned session. For one-time payment reconcile paid/no-payment-required status; for subscription route through initial invoice finalization. Unpaid completion does not release fulfillment |
| checkout.session.async_payment_succeeded / failed | Reconcile delayed outcome, create/release once or notify/release reservation according to policy |
| checkout.session.expired | Release unused reservation after authoritative state check; late successful payments go to compensation review |
| invoice.paid | Resolve subscription/invoice ownership and payment evidence; create one initial/renewal order or converge with existing initial order |
| invoice.payment_failed / payment_action_required / finalization_failed | Mark recovery/hold state; notify customer or operator; no shipment |
| invoice.upcoming / created | Renewal preview and controlled preflight; not the sole reliable mechanism for timed reminders or stock checks |
| customer.subscription.created / updated / deleted and supported pause/resume events | Reconcile current Stripe state and effective schedule; avoid regressing state from older events |
| Relevant payment_intent events | Supporting reconciliation for owned adapter payments; no independent duplicate order creator |
| Refund lifecycle and charge refund events | Update refund records and Medusa accounting once; handle pending/failed refunds |
| charge.dispute.created / updated / closed | Evidence task, financial hold/recovery and outcome reconciliation; no automatic second refund |

Fetch current Stripe resource state when order is uncertain; events may arrive late or out of order. Use database uniqueness plus transactional outbox operations, not event-ID deduplication alone. Stripe idempotency keys expire: retain local business-operation records for the full required lifetime and reconcile before retrying an old ambiguous request.

Daily financial reconciliation compares owned Stripe payments/invoices/refunds/disputes with Medusa receipts/orders. A shorter recovery job finds paid-but-unfinalized checkouts and retryable fulfillment/email operations. Payout reconciliation separately explains gross receipts, fees, refunds, disputes, FX and reserves against bank payouts. A payout is not a customer payment event and must not be used as the shipping trigger.

## 9. Fulfillment, Royal Mail and returns

Native Medusa holds order and fulfillment state. Custom workflows link batch/COA allocation, inventory and carrier references. Preserve separation between financial status, operational hold, picking, packed, label-created, dispatched, delivered, returned and refunded.

1. Verify financial eligibility and any manual/Radar review hold.
2. Confirm current customer/product/destination scope; allocate in-stock batches using the client's shelf-life/storage policy.
3. Record batch IDs, real COA document versions and pen serial/device passport where applicable. Substitutions require approval; never silently ship another compound/model.
4. Pick and pack discreetly; required product/customs descriptions remain accurate. Confirm weights, dimensions, packaging and any agreed temperature requirements.
5. Create the Royal Mail order using a stable shipment reference and persist its external ID. On API timeout, look up/reconcile before retrying; do not assume carrier idempotency.
6. Generate the agreed 6x4 label; do not treat a label as proof of dispatch. Record actual handover/dispatch and send tracking notification once.
7. Update delivery through supported carrier tracking capabilities or controlled manual status. Click & Drop label creation does not itself establish delivery tracking API entitlement.
8. Handle partial shipment, lost/damaged parcels, address corrections, label void/reissue and returns. Returned stock is quarantined pending inspection; refunds do not automatically restock goods.

Client provides Click & Drop account type and entitlements. Official documentation distinguishes OBA label/document support from OLP limitations; confirm with their actual account before promising automatic labels. A manual verified label/tracking workflow is the fallback. [Royal Mail integration documentation](https://help.parcel.royalmail.com/hc/en-gb/articles/360011462338-Integrating-with-the-Click-Drop-API)

Bank transfers use an authoritative order quote, unique payment reference and reconciliation record. Underpayment, overpayment, duplicate receipts and unidentified funds need an operator queue. Bank evidence is verified before fulfillment. Do not route a blocked Stripe purchase to another payment method as a compliance workaround; payment eligibility and legal restrictions apply independently.

## 10. Failure and acceptance matrix

| Scenario | Required outcome and acceptance test |
|---|---|
| Double-click, two tabs or concurrent retries | One owned attempt and payment operation; competing requests converge or return a safe conflict |
| Stripe creates session but API response times out | Retrieve/retry using same operation key; no new session/charge until ambiguity resolved |
| Client changes price, currency, customer or variant | Server rejects or recalculates from approved data; cross-customer access denied |
| New promotion/address/cart revision | Old payable session expires/cancels safely; new quote shown and accepted; no accidental second charge |
| Declined or insufficient-funds card | Order remains unpaid; safe error and retry; no order fulfillment |
| 3DS challenge abandoned/failed | Recover same attempt; no false success and no unconditional order creation |
| Redirect or browser closes after payment | Webhook/recovery job completes once; later success page shows the same order |
| Async payment pending | Clear processing message; reservation policy enforced; ship only after verified paid state |
| Invalid, duplicated, delayed or reordered webhook | No unauthorised mutation, no duplicate side effects, no state regression |
| Worker/database outage | Durable retry/replay, alerts, paid-orphan reconciliation; no lost paid orders |
| Session expired then delayed payment succeeds | Revalidate stock/quote; hold or refund according to policy, never silently oversell |
| Two buyers race for last unit | Atomic reservation; losing customer cannot pay an invalid checkout; post-payment race has compensation |
| Initial subscription events arrive in both orders | Exactly one first invoice/order containing mixed basket; no repeated pen shipment |
| 28-day renewal and leap/month boundaries | Correct 28-day billing; timezone display consistent; no calendar-month drift |
| Pause/skip/cancel races with invoice/charge | Defined effective-cycle semantics; paid order handled separately; no contradictory status |
| Reminder/email provider outage | Durable delivery retries and alert; no duplicated reminders or invented delivery confirmation |
| Subscription renewal needs authentication | Customer receives recovery link; no shipment until payment and invoice confirmed |
| Recurring price, address or tax change | New total preview, proper consent/notice, versioned records, no double discount/tax/shipping |
| Zero invoice / credit / manually paid invoice | Distinguish authorised zero-price settlement from unverified out-of-band payment |
| Refund request repeated or response times out | One refund operation; retrieve status before retry; reconcile pending/failed outcomes |
| Partial refund/return or open dispute | Correct item/shipping/tax allocation; prevent duplicate refund; cancellation remains separate |
| Royal Mail timeout or label failure | Preserve paid order; reconcile existing carrier order before retry; no duplicate label charges |
| Partial shipment, lost parcel or recall | Auditable shipment/batch record and support process; no fabricated tracking |
| Wrong sandbox/live key, webhook or price/customer ID | Fail configuration/resource validation; no cross-account access or accidental live charge |
| Account restriction / unavailable payment method | Stop affected checkout, retain evidence/operations, alert owner; no account rotation workaround |
| Secret rotation / deploy / restart | New attempts use validated profile; outstanding attempts remain processable by their owning adapter |
| Stale local basket / missing SKU / code conflict | Require re-selection/client reconciliation; never fuzzy-match to a different product |
| Customer logs out on success or adds new cart items | Secure resume; show only owned order and clear only purchased cart revision |

## 11. Security, privacy and compliance controls

- Mandatory authenticated ownership on all custom order/subscription/portal endpoints; use session actor ID, not submitted customer/Stripe IDs.
- Role-scoped admin actions, audit trail, MFA for client Stripe/admin users, least-privilege API keys and protected environment secrets.
- Separate sandbox and live resources/databases. Assert account ID/livemode/provider version on boot and every resource mapping.
- CSRF protection appropriate to session authentication; rate-limit checkout creation and account/recovery endpoints; prevent card-testing abuse.
- Restrict CSP to required Stripe/application domains; no sensitive data in analytics/session replay. Preserve HTTPS and certificate validation.
- Persist customer eligibility and versioned RUO/recurring consent server-side. A role label or checkbox does not itself certify research eligibility.
- Approved product descriptions, destinations and any licence restrictions enforced at checkout and renewal. Marketing updates/new SKUs enter the same review process.
- Actual batch evidence for purity/COA claims; verified reviews only; no invented affiliations or clinical claims.
- Client/accountant approves VAT treatment, shipping tax, inclusive/exclusive prices and registrations. Verify Stripe Tax settings and actual test calculations before enabling it; never double-apply Medusa tax. [Stripe Tax setup](https://docs.stripe.com/billing/taxes/collect-taxes)
- Client approves lawful consumer/B2B terms, returns, privacy/cookies, data retention and access-request handling. PCI obligations remain shared even with Stripe-hosted fields.

These reduce avoidable review and dispute exposure; they do not override Stripe underwriting or guarantee payment acceptance.

## 12. Stripe Dashboard and client operational setup

Detailed evidence requests and a ready-to-send client message are in client-handoff.md. Dashboard navigation labels may vary; verify during setup.

1. Client controls the correct UK legal-entity account, business description, owners/representative, settlement bank and outstanding verification requests. Developer access is role-based; no password sharing.
2. Client submits accurate catalog and requested evidence through Stripe's authenticated channels. Record any written acceptance scope, conditions and case reference. Do not upload identity documents into source control or send them through general chat.
3. Configure recognisable statement descriptor, support contacts, receipt branding and public policy links.
4. Configure approved payment methods and Radar review process. Register actual domains for applicable wallet methods; test recurring eligibility.
5. Sync approved products/prices from the canonical catalog using account-specific mappings; review one-time and 28-day prices in the Dashboard.
6. Configure Billing recovery/email behavior and Customer Portal. Implement PEPTECH-only controls in the application.
7. Configure tax settings/registrations with accountant input and validate representative calculations; separate sandbox and live settings.
8. Register public HTTPS webhook destinations for the new adapter and preserve legacy endpoints while draining old attempts. Record secrets securely and replay procedures.
9. Configure payout schedule/alerts, refund/dispute owners, reserve visibility and accounting reconciliation.
10. Create live credentials only for the final approved scope; enable the matching Medusa provider/regions and production feature gates after acceptance signoff.

## 13. Delivery phases and gates

| Phase | Deliverable | Exit evidence |
|---|---|---|
| A: client facts and catalog | Completed evidence checklist, SKU worksheet and policy decisions | Client-approved source catalog, scope of existing authorisations and documented Stripe supportability path |
| B: security and data foundation | Modules/migrations, canonical variants, ownership controls, durable attempts and webhook inbox/outbox | Migration dry run/rollback rehearsal; unauthorised access and money tampering tests fail safely |
| C: one-time checkout and UI | Sessions adapter, existing-page Stripe UI, success states and refunds | Sandbox success/decline/3DS/duplicate/timeout/async tests; exact Medusa/Stripe totals and one order |
| D: subscriptions | Mixed initial invoice, 28-day lifecycle, portal/custom controls and reminders | Test Clock coverage where supported plus worker-time tests; first/renewal/cancel/refund reconciled |
| E: fulfillment | Inventory/batch/COA allocation, Royal Mail integration, returns and bank reconciliation | Test shipment/label/tracking, carrier-timeout recovery, manual fallback and customer notices |
| F: operational readiness | Monitoring, reconciliation reports, staff runbooks, backups and secret rotation | Recovery/replay drills; client UAT, reconciliation signoff and Stripe evidence recorded |
| G: controlled live release | Final account setup, limited release and close monitoring | Owner authorises launch for genuine customer purchases; simulated payment/refund tests stay in sandbox, with no live-mode test charges using real cards; genuine payments, fulfillment and payouts reconcile |

Phases C–E remain disabled in production until their acceptance criteria pass. Development can proceed in a sandbox while the client supplies evidence; live activation is a separate gate. Estimate dates after Phase A confirms catalog size, legacy subscriptions and Royal Mail account capabilities; Stripe review times are external and cannot be guaranteed.

Rollback disables new payment attempts but retains webhook processing, order recovery, refunds and access to historical account credentials. Do not roll back by dropping records or replacing the account key underneath unsettled transactions. Existing client subscription migration is planned separately once the true source processor/data and customer mandates are known.

## 14. Approval requested

Approve the proposed scope and defaults, including Checkout Sessions/embedded Stripe UI migration, canonical identity review, 28-day billing with 10% discount, mixed-basket handling, native Medusa fulfillment, Royal Mail integration, security hardening and reconciliation. Approve using the accompanying handoff as the client information request.

This approval permits implementation in the workspace/sandbox. It does not authorise contacting the client or Stripe on your behalf, changing the client's live catalog, migrating active customer mandates, enabling live payments, or submitting identity documents. Those actions require the specific agreed inputs and subsequent explicit release/submission authorisation.

## Sources checked

- [Stripe peptide/research-business FAQ](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs?locale=en-GB)
- [Stripe restricted-business policy](https://stripe.com/legal/restricted-businesses)
- [Payment Element](https://docs.stripe.com/payments/payment-element)
- [Checkout Sessions API and mixed line items](https://docs.stripe.com/api/checkout/sessions/create)
- [Subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Customer Portal configuration](https://docs.stripe.com/customer-management/configure-portal)
- [Pausing payment collection](https://docs.stripe.com/billing/subscriptions/pause-payment)
- [Website checklist](https://docs.stripe.com/get-started/checklist/website)
- [Medusa Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)
- [Royal Mail Click & Drop](https://help.parcel.royalmail.com/hc/en-gb/articles/360011462338-Integrating-with-the-Click-Drop-API)

Stripe permits some research-peptide models with preventive purchaser controls; it does not give blanket approval to this catalog. Written scope confirmation is the repository's required launch control and the proposed approach for this implementation, not a claim that every research-peptide merchant universally needs the same documents.
