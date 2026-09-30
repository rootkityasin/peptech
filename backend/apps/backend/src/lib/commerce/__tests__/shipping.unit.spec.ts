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
      { id: "so_uk", name: "Demastic Delivery (UK)", price_type: "flat", amount_minor: 495, description: "Tracked", code: "standard", countries: ["gb"] },
    ])
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
})
