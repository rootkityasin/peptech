# PEPTECH® Project & Compliance Rules

These rules are mandatory for all AI agents and developers working in this workspace. Every change, component, API integration, and content element must adhere strictly to these guidelines.

---

## 1. Brand Identity & Design Standards
- **Brand**: PEPTECH® (`peptech.bio`). Support: `info@peptech.bio`.
- **Slogan**: *Quality. Safety. Precision.*
- **Core Color Palette**:
  - Deep Navy: `#0B1F3A`
  - Teal Accent: `#16A6A3` / `#00C5A0`
  - White / Surface: `#FFFFFF` / `#F6F9FF`
- **Aesthetic**: Clean, clinical, premium, spacious, and mobile-first. Avoid bodybuilding, dark-underground, or cluttered aesthetics.
- **UX Reference**: Inspired by `kovalabs.co.uk/products/ghk-cu` for speed, clarity, dispatch badges, and report accessibility.
- **Core Web Vitals**: Target LCP < 2.0s, INP < 150ms, CLS 0.0.
- **Admin Dashboard**: The Medusa 2.0 Admin Dashboard (`http://localhost:9000/app`) must remain **100% native in default styling**. Do NOT alter its colors or layout.

---

## 2. The Three Mandatory Product Categories
All product browsing and navigation must clearly separate the three distinct routes:
1. **Complete Pen Sets** (`/pen-sets`):
   - First-time buyer package: Reusable precision pen, prefilled cartridge, device passport/authenticity card, 31G 5mm sterile needles, and alcohol prep pads.
   - **One-time purchase only** (NO subscriptions).
   - Prominently feature a cross-link: *"Shop Compatible Refills"*.
2. **Refill Cartridges** (`/refills`):
   - Designed exclusively for the PEPTECH reusable pen system.
   - Must display a compatibility badge/table.
   - Available for **One-Time Purchase** and **Subscribe & Save every 28 days (10% discount)**.
   - Prominently feature a cross-link: *"Need the pen?"* linking to the matching Complete Pen Set.
3. **Freeze-Dried Vials** (`/vials`):
   - Separate laboratory section for traditional lyophilised vials from the 6-page price list.
   - Available for **One-Time Purchase** and **Subscribe & Save every 28 days (10% discount)**.
   - Filters for product name, strength, and availability.

**Customer Journey Flow**:
Display the 3-step lifecycle:
- *Step 1*: Buy your Complete Pen Set once.
- *Step 2*: Keep the reusable precision pen.
- *Step 3*: Return to reorder compatible Refill Cartridges as needed.

---

## 3. Research Peptide Compliance & Legal Rules
- **Classification**: All products are for **Laboratory, Research, and Scientific Purposes Only**. 18+ age restriction.
- **PROHIBITED CONTENT**:
  - NEVER generate, publish, or suggest dosing protocols, injection guides, or human/veterinary consumption instructions.
  - NEVER make therapeutic, medical, bodybuilding, diagnostic, or clinical-outcome claims.
- **Mandatory Gates**:
  - Enforce an 18+ research disclaimer acknowledgement modal before store access.
  - Enforce a mandatory terms & research-use checkbox at checkout.
- **Legal Notices**: Maintain dedicated pages for Terms of Sale, Privacy (UK GDPR/PECR compliant), Cookie Consent, Shipping Policy, and Research Disclaimer.

---

## 4. Payment Gateway & High-Risk Rules
- Research peptides are high-risk. **Do NOT assume standard Stripe accounts are permitted** without explicit written underwriting from Stripe compliance.
- Support **Authorize.Net / Dedicated High-Risk UK Acquirers** with 3-D Secure (SCA), 28-day tokenized subscription recurring billing, and full fraud controls.
- Provide a **Manual / UK Faster Payments (Bank Transfer)** fallback.
- **Zero Workarounds**: Never mask product names, alter product descriptions, or misrepresent the business model to circumvent payment aggregators.
- Never store raw credit card data on PEPTECH servers.

---

## 5. Subscriptions & Customer Portal
- Applies **only** to Refill Cartridges and Freeze-Dried Vials (Pen Sets are strictly one-time).
- Renewal frequency: **Every 28 days**. Launch discount: **10%** (adjustable in admin).
- Customer self-service: Allow customers to pause, skip, change renewal date, or cancel without contacting support.
- Automated notifications: Send renewal reminder emails 3 days prior to charging.

---

## 6. Logistics & Royal Mail Shipping
- **Couriers & Rates**:
  - United Kingdom: Royal Mail Tracked (£4.95).
  - Worldwide / USA: Royal Mail International Tracked (£15.00).
- **Automation**: Royal Mail Click & Drop API for 6x4 thermal label generation and automated tracking attachment.
- **Discreet Packaging**: Plain, protective outer packaging with zero peptide branding on the external box; PEPTECH branding is kept exclusively inside.
- Customs forms must remain accurate, lawful, and compliant.

---

## 7. Lab Reports (COA) & Packaging QR Verification
- **Searchable COA Library (`/lab-reports`)**: Searchable by product and batch number, showing synthesis date, independent testing lab, HPLC / Mass Spectrometry results.
- **No Fabricated Reports**: If a lab report is pending or not yet uploaded, display *"Report Pending"*; never display unverified purity percentages or fake certificates.
- **QR Verification (`/verify`)**: Mobile-friendly scan page for packaging QR codes and device passport serial verification.

---

## 8. Customer Reviews & Testimonials
- Only display genuine, verified-purchase reviews linked to real order records.
- **Strictly prohibit** AI-generated or fictional customer testimonials.
- Implement admin moderation to prevent spam or unauthorized medical/dosing claims in review text.
