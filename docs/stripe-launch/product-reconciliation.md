# PEPTECH product identity, naming and keyword reconciliation

Status: proposal awaiting client master data and approval. No product names, prices, permissions or records have been changed by this review.

## Objective and evidence

Make storefront, Medusa, Stripe, order receipts, batch COAs, packaging and customs describe the same real product. Keywords improve accurate discovery; they must never conceal regulated goods, imitate a different product category, or imply unsupported effects.

The client already operates an authorised UK business. Their approved master catalog, supplier/manufacturer records, labels and applicable authorisation scope establish identity. Neither the storefront mock data nor the current database is assumed to be authoritative simply because it exists.

The worksheet product-reconciliation.csv contains 36 records from storefront/src/data/catalog.ts and 17 products read from the local Medusa API. These 53 source rows are not necessarily 53 distinct products. The snapshot scope is recorded in catalog-review-scope.json. This is not a crawl or certification of the public production website.

Before migration, also inventory storefront/src/data/catalog.json, products.ts, static product components, routes, metadata/SEO, reviews, COA pages, database variants, existing orders and any existing Stripe products. The current worksheet is the client review starting point, not a declaration that every catalog source has already been reconciled.

## Source hierarchy

1. Client-signed product master and source evidence establish what is sold.
2. Approved canonical Medusa product/variant and ProductIdentity records become the operational source.
3. Stripe Product/Price mappings reflect that identity and approved commercial terms.
4. Storefront and account UI render the approved backend data.
5. Historic orders/invoices preserve the description and price actually agreed at purchase; corrections are recorded, not silently rewritten.

## Observed conflicts and proposed actions

| Source group | Observed discrepancy | Required client decision |
|---|---|---|
| Semaglutide, tirzepatide, retatrutide | Named storefront pens/refills/vials do not have exact named equivalents in the reviewed local backend | Confirm which are actual sold SKUs, their precise presentation, authorisation scope and evidence. Do not substitute a coded backend product by inference |
| BPC-157, TB-500, GHK-Cu, NAD+, MOTS-C, Semax, Selank, Epithalon | Named chemical/research records exist in storefront data; backend records do not establish matching identities | Approve constituent identity, form, strength, volume, pack size, supplier and real COA references for each SKU |
| RT40 | Storefront/backend refer to food safety testing | Confirm actual composition and documented use. Do not assume RT40 means retatrutide or that 40 indicates concentration |
| C.C-1236 | Described as environmental testing | Confirm identity and substantiate purpose; keep unrelated to any named compound unless documentary evidence establishes a match |
| TB-S30 | Described as healthcare testing | Do not equate with TB-500 based on letters. Confirm identity and whether any diagnostic/device claims are applicable and authorised |
| IFC-137 | Described as industrial hygiene | Client must identify actual substance/product and source documents |
| GVK-00 50 | Described as water quality testing | Confirm composition, strength meaning and intended use; do not infer a GHK-Cu relationship |
| Melatoxin II / Melatonin II | Storefront and backend use different names and describe mycotoxin detection | Resolve against labels/manufacturer evidence. Melatonin, Melatoxin and Melanotan are not interchangeable aliases; do not silently "correct" to any of them |
| Generic Research Grade 5/10/25/50 mg vials | Quantity is known but chemical identity is missing | Add the real identity and formulation, or keep unavailable for online purchase until complete |
| Generic Complete PEPTECH Pen Set | Multiple cartridge choices may map to one shared base handle | Model a real variant or explicit bundle with the exact selected cartridge; invoice/pick list must retain that choice |
| Category labels and copy | Metabolic & Glucose, Tissue Recovery, Cellular Longevity, food/water/mycotoxin-testing descriptions | Retain only descriptions consistent with the actual authorised product/purpose and evidence. No new medical or diagnostic claims in the RUO storefront |
| Purity and reports | Hardcoded percentages/batch-style data in catalog and lab-report pages | Link each claim to an actual batch document; show Report Pending where evidence has not been supplied/verified |

These are data-quality findings, not an allegation about the client's business. Mark inaccurate placeholders as such and reconcile them openly.

## Canonical product contract

Required data: immutable canonical SKU; client legal/trading product name; composition/compound identifier where appropriate; form; strength and units; concentration and fill volume where applicable; total content; pack size; pen compatibility; one-time/subscription eligibility; permitted customer/destination scope; label/manufacturer/supplier references; VAT/product tax classification; shipping weight/dimensions; storage/shelf-life requirements; and approval status/version.

Keep batch-specific purity, manufacture/expiry dates, independent COA files and laboratory details on batch records. A high purity number alone does not establish sterility, suitability for human use, product authorisation or eligibility for Stripe.

Use separate commercial records for one-time vs 28-day prices. A subscription flag does not change the chemical identity. Different strengths, forms, constituents or pack sizes must not collapse into the same purchasable variant.

## Keyword rules

| Keyword type | Proposed treatment |
|---|---|
| Exact chemical/product name | Use the evidence-backed name consistently across customer-facing and processor records |
| Verified abbreviation | Search alias permitted after client approval; always display the full approved identity on product detail/invoice |
| Punctuation/case | Normalise only for searching: BPC157 and BPC-157 may be matching candidates after identity approval; preserve canonical display |
| Units | Normalise display spacing, e.g. 10mg → 10 mg. Never infer mg vs mcg, concentration vs total content, or fill volume from a code |
| Format words | Use factual labels such as Refill Cartridge, Complete Pen Set, Freeze-Dried/Lyophilised Vial when correct |
| Research-use statement | Apply only to goods actually sold under that model and enforce its purchaser controls |
| Claimed effect or application | Require actual scope/evidence. Do not add efficacy, weight-loss, recovery, diagnostic or human-use claims to RUO goods |
| Alternative coded name | Retain as a documented SKU/model code if correct, alongside sufficient truthful identity. Do not use it to hide contents from Stripe/customs |
| Unknown, conflicting or homonymous term | Route to manual review; do not fuzzy-merge or automatically create a saleable SKU |

Conditional display templates, to be filled from approved facts:

- PEPTECH [exact approved identity] — [strength] [form] — [pack size].
- PEPTECH Complete Pen Set — [approved cartridge identity and strength] — [documented included accessories].
- PEPTECH [approved model code] — [truthful product identity or description].

Do not invent safe-sounding replacement names. Existing inaccurate text should be corrected because it is inaccurate, not temporarily hidden from an underwriting review.

## Worksheet completion

For each CSV source row, the client supplies canonical SKU, legal product name, composition, strength/units, volume, approved aliases and evidence reference. Mark whether the record is an actual product, alias, obsolete product or demo placeholder. Fill approver/date after review.

candidate_other_source_id contains exact-handle matches only. It is a review aid, not an accepted identity relationship. Rows with common codes remain unapproved even when the handle matches. The final mapping must specify actual Medusa product/variant IDs and all Stripe account/mode-specific resource IDs.

Validation rejects:

- One source variant mapped to multiple canonical SKUs without a documented split/bundle decision.
- Different compounds/strengths silently sharing one purchasable variant.
- Alias collisions, undefined units, missing identity or unsubstantiated reports.
- Recurring pen-set prices or duplicate subscription discount application.
- A different product occupying an existing Stripe Product/Price identity.

## Safe migration sequence

1. Freeze a versioned client-approved catalog export; retain audit snapshots and current product/variant/order references.
2. Generate an additive dry-run diff: proposed new/updated/archived records, alias collisions and affected baskets/subscriptions/URLs.
3. Get client signoff on each ambiguous identity. Keep pending mappings non-purchasable in the proposed system; do not modify the client's current operational catalog without approval.
4. Apply changes through Medusa workflows/migrations. Do not run the destructive seed-peptech script or erase history.
5. Publish real variants and exact bundles; update search aliases, canonical URLs, sitemaps and redirects without turning distinct products into one item.
6. Synchronise Stripe Products and immutable/versioned Prices; preserve old Prices for existing authorised subscriptions until an explicit price migration.
7. Replace frontend static purchase data and generic fallback routes with canonical data. API failure gives an unavailable state rather than a different product.
8. Compare cart, Stripe line items, Medusa order, packing slip, batch COA, customer invoice and customs descriptions for the same test order.
9. Reconcile totals and records, retain migration report and rollback mappings, then authorise publication.

Acceptance: every online-purchasable variant has one approved identity; every processor line item can be traced to it; no unresolved code or placeholder is charged; prior orders remain auditable; staff can explain any retained model/alias; no product misrepresentation is introduced.
