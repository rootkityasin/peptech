import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { listShippingOptions, resolveShippingOption } from "../shipping"

type Fixture = {
  location?: any
  options?: any[]
  rows?: any[]
  seen?: any
}

function scopeFor(fixture: Fixture) {
  return {
    resolve(key: string) {
      if (key === ContainerRegistrationKeys.QUERY) {
        return {
          graph: async (args: any) => {
            if (args.entity === "stock_locations") return { data: fixture.location ? [fixture.location] : [] }
            if (args.entity === "shipping_options") return { data: fixture.rows || [] }
            return { data: [] }
          },
        }
      }
      if (key === Modules.FULFILLMENT) {
        return {
          listShippingOptionsForContext: async (filters: any) => {
            fixture.seen = filters
            const served = fixture.options || []
            const country = filters.address?.country_code
            if (!country) return served
            return served.filter((entry) =>
              (entry.service_zone?.geo_zones || []).some((zone: any) => String(zone?.country_code || "").toLowerCase() === country)
            )
          },
        }
      }
      throw new Error(`unexpected container key: ${key}`)
    },
  }
}

function option(id: string, name: string, countries: string[]) {
  return {
    id,
    name,
    price_type: "flat",
    type: { code: "standard", description: "Tracked" },
    service_zone: { geo_zones: countries.map((country_code) => ({ country_code })) },
  }
}

const policy = { location_id: "loc_1", region_id: "reg_1" }

describe("shipping option resolution", () => {
  it("prices flat options from Pricing and records destination coverage", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [option("so_uk", "Demastic Delivery (UK)", ["GB", "gb"])],
      rows: [{ id: "so_uk", calculated_price: { calculated_amount: 4.95 } }],
    }
    const quoted = await listShippingOptions(scopeFor(fixture), policy, "gb")

    expect(fixture.seen).toMatchObject({
      fulfillment_set_id: ["fset_1"],
      address: { country_code: "gb" },
      context: { enabled_in_store: "true", is_return: "false" },
    })
    expect(quoted).toEqual([
      { id: "so_uk", name: "Demastic Delivery (UK)", price_type: "flat", amount_minor: 495, description: "Tracked", code: "standard", countries: ["gb"], type_id: null, shipping_option_type_id: null },
    ])
  })

  it("resolves description from type.label, metadata, or data when type.description is absent", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [
        {
          id: "so_label",
          name: "Standard Delivery",
          price_type: "flat",
          type: { code: "std", label: "24-48h Tracked" },
          service_zone: { geo_zones: [{ country_code: "gb" }] },
        },
        {
          id: "so_meta",
          name: "Express Courier",
          price_type: "flat",
          metadata: { description: "Guaranteed Next Day Delivery" },
          service_zone: { geo_zones: [{ country_code: "gb" }] },
        },
      ],
      rows: [
        { id: "so_label", calculated_price: { calculated_amount: 4.95 } },
        { id: "so_meta", calculated_price: { calculated_amount: 8.5 } },
      ],
    }
    const quoted = await listShippingOptions(scopeFor(fixture), policy, "gb")
    expect(quoted[0].description).toBe("24-48h Tracked")
    expect(quoted[1].description).toBe("Guaranteed Next Day Delivery")
  })

  it("falls back to a stored GBP or regional price when Pricing resolves nothing", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [option("so_flat", "Flat rate", ["gb"]), option("so_region", "Region rate", ["gb"]), option("so_none", "Priced elsewhere", ["gb"])],
      rows: [
        { id: "so_flat", prices: [{ currency_code: "gbp", amount: "15.00", min_quantity: null, max_quantity: null }] },
        { id: "so_region", prices: [{ amount: 4.95, price_rules: [{ attribute: "region_id", value: "reg_1" }] }] },
        { id: "so_none", prices: [{ currency_code: "usd", amount: 9.99 }] },
      ],
    }
    const quoted = await listShippingOptions(scopeFor(fixture), policy, "gb")

    expect(quoted.map((entry) => [entry.id, entry.amount_minor])).toEqual([
      ["so_flat", 1500],
      ["so_region", 495],
    ])
  })

  it("drops options whose quantity band does not cover the order", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [option("so_bulk", "Bulk only", ["gb"])],
      rows: [{ id: "so_bulk", prices: [{ currency_code: "gbp", amount: 9.99, min_quantity: 2, max_quantity: null }] }],
    }
    expect(await listShippingOptions(scopeFor(fixture), policy, "gb")).toEqual([])
  })

  it("fails closed when the configured location has no fulfillment sets", async () => {
    const fixture: Fixture = { location: { id: "loc_1", fulfillment_sets: [] }, options: [option("so_1", "Anything", ["gb"])] }
    expect(await listShippingOptions(scopeFor(fixture), policy, "gb")).toEqual([])
    expect(fixture.seen).toBeUndefined()
  })

  it("lists every serving option when the location cannot be resolved", async () => {
    const fixture: Fixture = { location: null, options: [option("so_1", "Anything", ["gb"])] }
    const quoted = await listShippingOptions(scopeFor(fixture), { region_id: "reg_1" }, "gb")

    expect(fixture.seen).not.toHaveProperty("fulfillment_set_id")
    expect(quoted.map((entry) => entry.id)).toEqual([])
  })

  it("returns an empty list when nothing serves the destination", async () => {
    const fixture: Fixture = { location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] }, options: [] }
    expect(await listShippingOptions(scopeFor(fixture), policy, "us")).toEqual([])
    expect(fixture.seen).toMatchObject({ address: { country_code: "us" } })
  })

  it("charges the customer the option they picked and falls back to the first", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [option("so_uk", "Demastic Delivery (UK)", ["gb"]), option("so_express", "Express Tracked", ["gb"])],
      rows: [
        { id: "so_uk", calculated_price: { calculated_amount: 4.95 } },
        { id: "so_express", calculated_price: { calculated_amount: 15 } },
      ],
    }
    const scope = scopeFor(fixture)

    expect((await resolveShippingOption(scope, policy, "gb", "so_express")).amount_minor).toBe(1500)
    expect((await resolveShippingOption(scope, policy, "gb")).id).toBe("so_uk")
    expect((await resolveShippingOption(scope, policy, "gb", "so_uk")).amount_minor).toBe(495)
  })

  it("aborts checkout when the selected or destination has no option", async () => {
    const fixture: Fixture = {
      location: { id: "loc_1", fulfillment_sets: [{ id: "fset_1" }] },
      options: [option("so_uk", "Demastic Delivery (UK)", ["gb"])],
      rows: [{ id: "so_uk", calculated_price: { calculated_amount: 4.95 } }],
    }
    const scope = scopeFor(fixture)

    await expect(resolveShippingOption(scope, policy, "gb", "so_retired")).rejects.toThrow("unavailable")
    await expect(resolveShippingOption(scope, policy, "ca")).rejects.toThrow("unavailable")
    await expect(resolveShippingOption(scope, policy, "gb", "so_retired")).rejects.toMatchObject({ status: 409 })
    await expect(resolveShippingOption(scope, policy, "ca")).rejects.toMatchObject({ status: 409 })
  })

  describe("calculateDynamicShipping", () => {
    const { calculateDynamicShipping, resolveItemFormat } = require("../shipping")

    it("correctly identifies product format categories", () => {
      expect(resolveItemFormat({ format: "device" })).toBe("pen_set")
      expect(resolveItemFormat({ title: "Retatrutide Complete Pen Set" })).toBe("pen_set")
      expect(resolveItemFormat({ handle: "bpc-157-starter-set" })).toBe("pen_set")
      expect(resolveItemFormat({ format: "refill" })).toBe("refill")
      expect(resolveItemFormat({ handle: "retatrutide-cartridge" })).toBe("refill")
      expect(resolveItemFormat({ format: "vial" })).toBe("vial")
      expect(resolveItemFormat({ title: "GHK-Cu Freeze-Dried Vial 50mg" })).toBe("vial")
    })

    it("grants free shipping everywhere when cart subtotal is >= £150", () => {
      const ukResult = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 15000, recurring: false }],
        countryCode: "gb",
      })
      expect(ukResult.free_shipping).toBe(true)
      expect(ukResult.amount_minor).toBe(0)
      expect(ukResult.reason).toBe("free_threshold")

      const intlResult = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 16500, recurring: false }],
        countryCode: "us",
      })
      expect(intlResult.free_shipping).toBe(true)
      expect(intlResult.amount_minor).toBe(0)
      expect(intlResult.reason).toBe("free_threshold")
    })

    it("calculates UK category rates under £150", () => {
      // Pen set: £4.95 (495 minor)
      const pen = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 12000, recurring: false }],
        countryCode: "gb",
      })
      expect(pen.free_shipping).toBe(false)
      expect(pen.amount_minor).toBe(495)
      expect(pen.rate_tier).toBe("pen_set")

      // Refill only: £3.95 (395 minor)
      const refill = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: false }],
        countryCode: "gb",
      })
      expect(refill.free_shipping).toBe(false)
      expect(refill.amount_minor).toBe(395)
      expect(refill.rate_tier).toBe("refill")

      // Vial only: £3.95 (395 minor)
      const vial = calculateDynamicShipping({
        items: [{ format: "vial", quantity: 1, unit_minor: 3500, recurring: false }],
        countryCode: "gb",
      })
      expect(vial.free_shipping).toBe(false)
      expect(vial.amount_minor).toBe(395)
      expect(vial.rate_tier).toBe("vial")

      // Mixed Refills + Vials: £3.95 (395 minor)
      const mixedRefillVial = calculateDynamicShipping({
        items: [
          { format: "refill", quantity: 1, unit_minor: 4000, recurring: false },
          { format: "vial", quantity: 1, unit_minor: 3500, recurring: false },
        ],
        countryCode: "gb",
      })
      expect(mixedRefillVial.free_shipping).toBe(false)
      expect(mixedRefillVial.amount_minor).toBe(395)

      // Mixed Pen Set + Refill: Highest tier wins -> £4.95 (495 minor)
      const mixedPenRefill = calculateDynamicShipping({
        items: [
          { format: "pen_set", quantity: 1, unit_minor: 8000, recurring: false },
          { format: "refill", quantity: 1, unit_minor: 4000, recurring: false },
        ],
        countryCode: "gb",
      })
      expect(mixedPenRefill.free_shipping).toBe(false)
      expect(mixedPenRefill.amount_minor).toBe(495)
      expect(mixedPenRefill.rate_tier).toBe("pen_set")
    })

    it("calculates International category rates under £150", () => {
      // Pen set: £18.00 (1800 minor)
      const pen = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 12000, recurring: false }],
        countryCode: "us",
      })
      expect(pen.free_shipping).toBe(false)
      expect(pen.amount_minor).toBe(1500)
      expect(pen.rate_tier).toBe("pen_set")

      // Refill only: £10.00 (1000 minor)
      const refill = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: false }],
        countryCode: "de",
      })
      expect(refill.free_shipping).toBe(false)
      expect(refill.amount_minor).toBe(1000)
      expect(refill.rate_tier).toBe("refill")

      // Vial only: £10.00 (1000 minor)
      const vial = calculateDynamicShipping({
        items: [{ format: "vial", quantity: 1, unit_minor: 3500, recurring: false }],
        countryCode: "fr",
      })
      expect(vial.free_shipping).toBe(false)
      expect(vial.amount_minor).toBe(1000)
      expect(vial.rate_tier).toBe("vial")

      // Mixed Refills + Vials: £10.00 (1000 minor)
      const mixedRefillVial = calculateDynamicShipping({
        items: [
          { format: "refill", quantity: 1, unit_minor: 4000, recurring: false },
          { format: "vial", quantity: 1, unit_minor: 3500, recurring: false },
        ],
        countryCode: "ca",
      })
      expect(mixedRefillVial.free_shipping).toBe(false)
      expect(mixedRefillVial.amount_minor).toBe(1000)

      // Mixed Pen Set + Refill: Highest tier wins -> £18.00 (1800 minor)
      const mixedPenRefill = calculateDynamicShipping({
        items: [
          { format: "pen_set", quantity: 1, unit_minor: 8000, recurring: false },
          { format: "refill", quantity: 1, unit_minor: 4000, recurring: false },
        ],
        countryCode: "au",
      })
      expect(mixedPenRefill.free_shipping).toBe(false)
      expect(mixedPenRefill.amount_minor).toBe(1500)
      expect(mixedPenRefill.rate_tier).toBe("pen_set")
    })

    it("handles Subscribe & Save free shipping rules and renewals", () => {
      // 100% Subscribe & Save cart -> Free shipping everywhere
      const pureSubUk = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: true }],
        countryCode: "gb",
      })
      expect(pureSubUk.free_shipping).toBe(true)
      expect(pureSubUk.amount_minor).toBe(0)
      expect(pureSubUk.reason).toBe("subscription_free")

      const pureSubIntl = calculateDynamicShipping({
        items: [{ format: "vial", quantity: 1, unit_minor: 3500, recurring: true }],
        countryCode: "us",
      })
      expect(pureSubIntl.free_shipping).toBe(true)
      expect(pureSubIntl.amount_minor).toBe(0)
      expect(pureSubIntl.reason).toBe("subscription_free")

      // Mixed one-time + subscription under £150 -> First order pays standard shipping
      const mixedSub = calculateDynamicShipping({
        items: [
          { format: "pen_set", quantity: 1, unit_minor: 8000, recurring: false },
          { format: "refill", quantity: 1, unit_minor: 4000, recurring: true },
        ],
        countryCode: "gb",
      })
      expect(mixedSub.free_shipping).toBe(false)
      expect(mixedSub.amount_minor).toBe(495)

      // Recurring renewal is always free everywhere
      const renewal = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: true }],
        countryCode: "us",
        isRenewal: true,
      })
      expect(renewal.free_shipping).toBe(true)
      expect(renewal.amount_minor).toBe(0)
      expect(renewal.reason).toBe("renewal_free")
    })

    it("respects policy overrides from Commerce Settings", () => {
      const customPolicy = {
        shipping_rates: {
          pen_set_uk_minor: 600,
          pen_set_intl_minor: 2200,
          refill_uk_minor: 250,
          refill_intl_minor: 800,
          vial_uk_minor: 250,
          vial_intl_minor: 800,
        },
        free_shipping_threshold_minor: 20000, // £200 threshold
        subscription_first_order_free: false, // charge 1st order
      }

      // £160 order is below custom £200 threshold -> pays shipping
      const thresholdTest = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 16000, recurring: false }],
        countryCode: "gb",
        policy: customPolicy,
      })
      expect(thresholdTest.free_shipping).toBe(false)
      expect(thresholdTest.amount_minor).toBe(600)

      // Subscription first order pays shipping when subscription_first_order_free is false
      const subChargeTest = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: true }],
        countryCode: "gb",
        policy: customPolicy,
      })
      expect(subChargeTest.free_shipping).toBe(false)
      expect(subChargeTest.amount_minor).toBe(250)
    })

    it("dynamically resolves rates from matching Medusa Service Zones and respects zone rate overrides", () => {
      const serviceZones = [
        {
          id: "serzone_uk",
          name: "Domestic UK",
          countries: ["gb"],
          rates: { pen_set_minor: 495, refill_minor: 395, vial_minor: 395 },
        },
        {
          id: "serzone_eu",
          name: "European Union",
          countries: ["de", "fr", "es", "it"],
          rates: { pen_set_minor: 1200, refill_minor: 750, vial_minor: 750 },
        },
        {
          id: "serzone_us",
          name: "North America",
          countries: ["us", "ca"],
          rates: { pen_set_minor: 1800, refill_minor: 1000, vial_minor: 1000 },
        },
      ]

      // German customer purchasing refills -> matches European Union zone (£7.50)
      const euRefill = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: false }],
        countryCode: "de",
        serviceZones,
      })
      expect(euRefill.amount_minor).toBe(750)

      // US customer purchasing pen set -> matches North America zone (£18.00)
      const usPen = calculateDynamicShipping({
        items: [{ format: "pen_set", quantity: 1, unit_minor: 8000, recurring: false }],
        countryCode: "us",
        serviceZones,
      })
      expect(usPen.amount_minor).toBe(1800)

      // Policy override for EU zone: custom rate in policy takes precedence
      const policyWithZoneRates = {
        service_zone_rates: {
          serzone_eu: { pen_set_minor: 1400, refill_minor: 850, vial_minor: 850 },
        },
      }
      const overriddenEu = calculateDynamicShipping({
        items: [{ format: "refill", quantity: 1, unit_minor: 4000, recurring: false }],
        countryCode: "fr",
        policy: policyWithZoneRates,
        serviceZones,
      })
      expect(overriddenEu.amount_minor).toBe(850)

      // Unconfigured newly created zone covering Australia (no explicit rates in policy or zone)
      const newZone = [
        {
          id: "serzone_anz",
          name: "Oceania",
          countries: ["au", "nz"],
        },
      ]
      const oceaniaVial = calculateDynamicShipping({
        items: [{ format: "vial", quantity: 1, unit_minor: 3000, recurring: false }],
        countryCode: "au",
        serviceZones: newZone,
      })
      // Intelligent default for non-GB zone is £10.00 (1000 minor)
      expect(oceaniaVial.amount_minor).toBe(1000)
    })
  })
})

