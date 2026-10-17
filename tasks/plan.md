# Implementation Plan: Dynamic Service Zone Category Shipping Configuration in Medusa 2.0

## Overview
This plan refactors the shipping configuration system so that category rates (Complete Pen Sets, Refill Cartridges, Freeze-Dried Vials) are dynamically linked to Medusa 2.0 **Service Zones** created under **Location & Shipping** (`/app/settings/locations`). The configuration card is moved from `/app/commerce` to an inline widget on `/app/settings/locations`.

---

## Architectural Principles & User Decisions

1. **Native Service Zone Integration**:
   - In Medusa Admin (`/app/settings/locations`), administrators create and manage Service Zones (e.g. *UK Domestic*, *European Union*, *North America*, *Worldwide*) and their member countries using Medusa's standard flows.
   - The shipping configuration module dynamically queries these Service Zones and provides category pricing inputs for each active zone.

2. **Admin Placement**:
   - Completely remove "Category & Regional Shipping Rules" from `/app/commerce`.
   - Create a dedicated inline Admin Widget `location-shipping-configuration.tsx` registered at `location.list.after` on the Locations page (`/app/settings/locations`).

3. **Pricing & Fallbacks**:
   - **Global Free Shipping Threshold (£ GBP)**: Subtotal >= threshold (default £150) gets free shipping worldwide.
   - **Subscribe & Save 1st Order**: Toggle for pure subscription carts; renewals are always free (£0).
   - **Service Zone Category Rates**: Complete Pen Sets, Refill Cartridges, and Freeze-Dried Vials rates configured per Service Zone.
   - **Intelligent Defaults**: If a newly created Service Zone has not been assigned custom rates yet:
     - Zones containing `GB` default to £4.95 (Pen Set) / £3.95 (Refill & Vial).
     - Any other zone defaults to £18.00 (Pen Set) / £10.00 (Refill & Vial).
   - **Highest Tier Wins**: Mixed carts under the threshold charge the highest category tier (Pen Sets > Refills > Vials).

---

## Task Breakdown

### Phase 1: Policy Schema & Admin Service Zones API
- [ ] **Task 1: Extend Policy Schema for Service Zone Rates**
  - Add `serviceZoneRateTierSchema` (`pen_set_minor`, `refill_minor`, `vial_minor`).
  - Add `service_zone_rates: Record<string, ServiceZoneRateTier>` to `commerceSettingsSchema`.
- [ ] **Task 2: Implement Admin Service Zones API Route**
  - Implement `GET /admin/custom/shipping-zones`: queries stock location fulfillment sets, service zones, and geo zones, returns zones with active/default rates and threshold settings.
  - Implement `POST /admin/custom/shipping-zones`: updates `service_zone_rates`, `free_shipping_threshold_minor`, and `subscription_first_order_free` in commerce policy.

### Phase 2: Core Calculation Engine & Quote Integration
- [ ] **Task 3: Update `calculateDynamicShipping` & Service Zone Matching**
  - Match customer `countryCode` to the stock location's Service Zone via `geo_zones`.
  - Lookup configured `service_zone_rates[zone.id]` or apply intelligent default.
  - Maintain threshold (£150 free), subscription rules, and category hierarchy.
  - Update unit tests in `shipping.unit.spec.ts`.
- [ ] **Task 4: Update Quote Pipeline & Store Shipping Options Route**
  - In `quote.ts`, pass resolved service zones to `calculateDynamicShipping`.
  - In `/store/custom/shipping-options/route.ts`, resolve the service zone for `country_code` and return the matching rates.

### Phase 3: Admin UI & Storefront Verification
- [ ] **Task 5: Move Shipping Module from `/app/commerce` to `/app/settings/locations`**
  - Remove "Category & Regional Shipping Rules" card from `admin/routes/commerce/page.tsx`.
  - Create `admin/widgets/location-shipping-configuration.tsx` in `location.list.after` zone.
  - Render Service Zones table with inline inputs for Pen Sets, Refills, and Vials, plus Threshold and Subscription controls.
- [ ] **Task 6: Storefront Verification & End-to-End Testing**
  - Verify `CartContext.tsx` receives active zone rates and computes dynamic rates accurately.
  - Run backend unit tests and storefront typecheck.
