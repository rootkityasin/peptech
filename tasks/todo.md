# Todo: Medusa 2.0 Dynamic Service Zone Category Shipping

## Phase 1: Policy Schema & Admin Service Zones API
- [x] **Task 1: Extend Policy Schema for Service Zone Rates**
  - [x] Add `serviceZoneRateTierSchema` in `policy.ts`
  - [x] Add `service_zone_rates` to `commerceSettingsSchema`
  - [x] Update `policy.unit.spec.ts`

- [x] **Task 2: Implement Admin Service Zones API Route**
  - [x] Create `GET /admin/custom/shipping-zones` querying stock location & fulfillment service zones
  - [x] Create `POST /admin/custom/shipping-zones` persisting zone rates, threshold, and subscription toggle

## Phase 2: Core Calculation Engine & Storefront Routes
- [x] **Task 3: Update `calculateDynamicShipping` for Service Zones**
  - [x] Add `serviceZones` lookup and country matching to `shipping.ts`
  - [x] Apply intelligent defaults (GB -> £4.95/£3.95, Intl -> £18.00/£10.00)
  - [x] Add unit tests in `shipping.unit.spec.ts`

- [x] **Task 4: Update Quote Pipeline & Store Shipping Options Route**
  - [x] Update `quote.ts` to pass resolved service zones to `calculateDynamicShipping`
  - [x] Update `api/store/custom/shipping-options/route.ts` to return zone-aware rates for destination

## Phase 3: Admin UI & Verification
- [x] **Task 5: Move Shipping Module from `/app/commerce` to `/app/settings/locations`**
  - [x] Remove shipping rules card and state from `admin/routes/commerce/page.tsx`
  - [x] Create `admin/widgets/location-shipping-configuration.tsx` in `location.list.after`
  - [x] Build table with Service Zones, country previews, Pen Set, Refill, and Vial inputs

- [x] **Task 6: Storefront Verification & End-to-End Testing**
  - [x] Verify storefront `CartContext.tsx` handles dynamic zone rates
  - [x] Run backend unit tests (`npm test:unit` - all 11 suites pass)
  - [x] Run storefront typecheck (`tsc --noEmit` - zero errors)
