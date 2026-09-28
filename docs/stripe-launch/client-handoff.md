# Client information request and Stripe onboarding handoff

Prepared for the PEPTECH owner through the developer. Status: draft for developer approval; not sent to the client or Stripe. The client already operates an authorised UK business. This request documents that existing business for its online payment and fulfillment integration.

## Purpose and expectation

We are preparing PEPTECH's existing checkout for Stripe payments, 28-day subscriptions, customer account management and Royal Mail fulfillment. We need accurate business/catalog information, account access through proper roles, and approved operating rules.

This is not a promise of zero blocked payments. Stripe and issuing banks independently assess transactions; Stripe can request further information, impose reserves or restrict services. Accurate onboarding, consistent descriptions, purchaser controls and reliable fulfillment reduce avoidable problems. Existing legal sales authorisation does not automatically establish Stripe's acceptance of every SKU, destination or subscription model.

Stripe's policy allows some research-peptide sales with preventive controls against non-research purchasing. It does not prescribe one universal document packet for every research seller. Some pharmaceutical models require preapproval. The items below distinguish ordinary account information, likely case-specific evidence, and information needed by the application. [Stripe policy FAQ](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs?locale=en-GB)

## A. Account and business information

These are routine onboarding/verification categories; Stripe's actual Dashboard requests determine the precise required documents.

| Client supplies/confirms | Purpose | Safe handling |
|---|---|---|
| Legal entity name, trading name, company number, registered/operating address and country | Match the website, existing business and merchant account | Business information via agreed project channel |
| Authorised representative, directors/beneficial owners and details requested by Stripe | Account verification | Identity documents uploaded directly to Stripe's authenticated flow, not emailed to the developer |
| Settlement bank details/account ownership as requested | Payout verification | Enter directly in Stripe; do not put bank evidence or passwords in the repository |
| Actual website domains, support email/phone, return address and business description | Clear merchant identity and customer support | Confirm public fields and private compliance contacts separately |
| Existing Stripe account ID and whether the business already processes with Stripe | Reuse the appropriate account; avoid unnecessary merchant migrations | Share acct_ ID and grant an appropriate team role; never share login credentials |
| Existing Stripe review decision, permitted scope, limitations and open Dashboard requests | Confirm what has already been accepted and what remains | Case reference and relevant written scope; secure supporting evidence |
| Historic processing statements if requested; expected volume, average/max order value and refund/dispute experience | Stripe's underwriting/risk review where applicable | Financial documents directly to Stripe or an approved secure channel |

The developer needs sandbox access initially and least-privilege production access only when approved. API secrets go into the agreed secret manager/environment configuration; no raw card details, passwords or full API keys in chat.

## B. Catalog and authorised-sale evidence

These may be requested during Stripe's product/business review. Supply existing evidence relevant to the actual products; do not obtain or claim a generic "peptide licence" that may not correspond to the business model.

| Client supplies/confirms | Required detail |
|---|---|
| Signed master product list | SKU, actual identity/composition, form, strength/units, volume, pack size, price, tax treatment, included accessories and manufacturer/supplier |
| Current product and packaging photographs | Labels and actual pen/cartridge/vial presentation; not design mockups |
| Existing authorisations/licences/registrations and scope | Issuer, holder, reference, validity, applicable goods, activities and territories; explain where no special licence is applicable with appropriate professional advice |
| Intended customer and purpose | Actual B2B/B2C model, research-only or other authorised category, and any prescription/pharmacy conditions if applicable |
| Existing purchaser verification procedure | What is checked, who approves/rejects, records kept and ongoing controls; do not merely call every new signup "verified" |
| Batch quality and traceability | Genuine COAs, test laboratory, report/batch relationship, manufacturing/expiry details and supplier provenance as applicable |
| Approved territories and shipping restrictions | Countries the client is authorised and operationally able to serve; local product/import restrictions |
| Complete current marketing scope | Website, relevant linked social/advertising materials, actual product descriptions and claims |
| Reconciliation worksheet | Resolve each source record in product-reconciliation.csv, particularly coded identities and Melatoxin/Melatonin discrepancies |

Where existing authorisations cover a sales model different from the current RUO-only app, identify that gap before launch; do not silently reinterpret the authorisation or change the business model.

## C. App and fulfillment decisions

These inputs are needed to build the system; they are not all documents Stripe universally requires.

| Decision | Proposed default for confirmation |
|---|---|
| Initial destinations/currencies | UK/GBP first; enable EU/worldwide only for approved products/destinations and confirmed tax/shipping setup |
| Recurring goods | Refills and vials only; pen sets one-time |
| Frequency/discount | Every 28 days; 10% product discount applied once |
| Initial mixed basket | One first payment/order; future payments include only recurring goods and agreed recurring delivery/tax |
| Shipping | £4.95 UK / £15 approved international; no free threshold assumed |
| Pause/skip/cancel | Applies to future unpaid cycles; already-paid orders handled separately under the return/refund policy |
| Changes to quantities, address or renewal date | Confirm cutoff and effect on next invoice, shipping and any prorations; proposed no surprise immediate prorations |
| Stock unavailable at renewal | Defer/hold charge where possible; do not automatically substitute. Confirm refund/contact policy for a payment/stock race |
| Failed renewal payment | No dispatch; agreed retry and customer-contact policy, then pause/cancel according to the client's chosen deadline |
| Price changes | Client-approved advance notice/consent process; preserve historical prices and agreements |
| Renewal reminder | Three days before actual renewal; clear amount/date and management link |
| Existing customer subscriptions | Identify real processor, IDs, consents, schedules, outstanding invoices and customer communications before migration |
| Bank transfer | Confirm account/reference instructions, reconciliation owner, under/overpayment handling and refund process |
| Royal Mail | Click & Drop account type (OBA/OLP), approved services, API access, return address, weights/dimensions, label format, dispatch cutoffs and delivery promises |
| Storage/packing | Confirm actual product-specific temperature/storage/shelf-life requirements; no unsupported cold-chain promises |
| Support/operations | Staff responsible for refunds, disputes, fulfillment holds, restricted payments and Stripe evidence deadlines |
| VAT/tax/accounting | VAT status/numbers, accountant-approved product/shipping tax classification, inclusive/exclusive prices, registrations and invoice details |
| Policies | Approved terms, privacy/cookies, delivery, returns, refunds, cancellation, RUO and recurring consent wording |

## D. What to submit to Stripe

First review the client's existing Stripe correspondence so we do not repeat an already-completed review. If scope is absent or does not cover this website/catalog/subscription offering, the owner should use the authenticated Stripe support/review channel and provide:

1. Accurate business summary and account ID.
2. Website/review URL and full SKU catalog with clear identities and actual product photographs.
3. Relevant existing authorisation evidence and explanation of customer/purpose/destination scope.
4. Purchaser verification procedure and how the website enforces it.
5. Subscription terms, billing interval, customer cancellation controls and recurring authorisation wording.
6. Shipping, refund and fulfillment policies plus supporting supplier/COA/processing evidence specifically requested.
7. A request for written confirmation of supportability and any restrictions for the exact model.

Do not send all personal identity/financial evidence unsolicited in a support email. Use the requested secure upload mechanism and provide only necessary information. Keep the review case, decision date, account, website, approved product/destination scope and conditions in the client's operational records.

### Draft Stripe review message for the client to submit

Subject: PEPTECH online payments and recurring-order scope review — [account ID]

Hello Stripe team,

We operate [legal entity], an established UK business trading as PEPTECH. We are integrating our website [URL] with Stripe for the attached accurately identified product catalog and optional recurring replenishment every 28 days for eligible products. Complete pen sets are one-time purchases.

Our existing sales authorisations and their scope are [summary/references]. Our actual customers and intended uses are [accurate description]. We sell to [approved destinations] and apply [actual purchaser verification controls]. The attached catalog and product/packaging images reflect what customers receive.

Please confirm whether Stripe Payments and Billing can support this specific online model and identify any additional documentation, restrictions, required controls or review steps. We would also appreciate clarification of any payment-method or destination limitations and any reserve or payout conditions communicated for our account.

Our fulfillment, cancellation/refund and subscription policies are at [links]. We can provide relevant supplier, batch/COA and processing records through your requested secure channel.

Regards,
[authorised business representative]

## E. Dashboard configuration after review

The owner/developer configures the approved account, with separate sandbox/live resources:

- Business/account details and outstanding verification tasks.
- Branding, recognisable statement descriptor, customer support and receipt settings.
- Payment methods and Radar; operational responsibility for reviews and disputes.
- Approved catalog/Prices mapped to actual Medusa SKUs; 28-day recurring Prices only for eligible goods.
- Billing retries, emails and Customer Portal configuration. The app implements shipment-specific skip/date controls.
- Tax settings and valid registrations after accountant confirmation; test representative calculations before activation.
- Public HTTPS webhook destinations and signing secrets for the implemented adapter; monitor deliveries and processing errors. A local stripe listen process is not the production webhook service.
- Payout schedule, operational alerts and reconciliation access.

Creating a Stripe Product, activating a key or receiving a successful test payment is not evidence that the catalog has passed review.

## F. Ready-to-send message from developer to client

Hi [Client name],

We are preparing the Stripe integration for PEPTECH's existing checkout, including card/wallet payments where supported, 28-day subscriptions, customer management, order tracking and Royal Mail fulfillment.

Since your business already operates in the UK with authorised sales, we need to document the existing business and product scope accurately for the online integration. Please provide:

1. Your legal/trading business details, existing Stripe account ID and any previous Stripe approval or outstanding verification requests.
2. The final product master: exact names/composition, SKU, strength/volume, format, prices, packaging and genuine batch/COA records. Please resolve the attached product-reconciliation worksheet, especially the coded product names.
3. Relevant existing sales authorisation documents and their product/customer/territory scope, plus your purchaser-verification procedure.
4. Confirmation of subscription rules: 28-day interval, 10% product discount, delivery charges, pause/skip/cancel cutoffs and failed-payment handling.
5. Approved shipping countries, VAT/tax information, Royal Mail Click & Drop account type/access, return address and fulfillment/support policies.
6. Details of any existing paid subscriptions that must migrate; we must preserve customer consent and avoid duplicate charges.

Please upload identity documents directly to Stripe when requested, invite developer access through team roles, and use our secure credential channel for API access. Do not email passwords or card information.

We will preserve the site's design and embed Stripe's secure payment components. Before live release, we will complete sandbox payment/renewal/refund tests, reconcile orders and shipments, and record Stripe's acceptance of the intended scope. These controls reduce avoidable issues, but no provider can guarantee that every payment will be accepted or that an account will never be reviewed.

Once we receive the information, we will confirm the remaining implementation and launch steps for your approval.

Thanks,
[Your name]

## G. Approval and responsibilities

The developer approves the proposed implementation and this client information request before work proceeds. The client confirms business facts, product identities, policies and account access. Stripe determines its service eligibility and any additional evidence requirements. The client's accountant/regulatory adviser confirms any tax or authorisation questions outside software implementation.

No email, support case, account change or live migration has been sent or performed by preparing this document.

References: [Stripe business FAQ](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs?locale=en-GB), [website checklist](https://docs.stripe.com/get-started/checklist/website), [subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [Customer Portal](https://docs.stripe.com/customer-management/configure-portal), [tax setup](https://docs.stripe.com/billing/taxes/collect-taxes), [Royal Mail API integration](https://help.parcel.royalmail.com/hc/en-gb/articles/360011462338-Integrating-with-the-Click-Drop-API).

## Implementation decisions confirmed after this draft

The user authorised sandbox implementation. Signup's age/RUO acknowledgement supplies researcher eligibility; no independent verification claim is made. Vial pricing remains in native product pricing, subscriptions follow the existing 28-day/10% rules, and Royal Mail API automation is deferred. Stripe Dashboard Tax defaults are now the chosen tax authority; an unconfigured sandbox explicitly tests without tax. Final client VAT/registration decisions remain necessary for live mode. See `deployment-runbook.md` for delivered behavior and release checks; the original proposed controls above are not all claims of completed client onboarding.
