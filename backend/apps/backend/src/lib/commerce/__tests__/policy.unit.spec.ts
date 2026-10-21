import { checkoutSchema, toMinor, discounted, owned, assertEligibility, assertProduct } from "../policy"
const address = { first_name: "A",last_name: "B",address_1: "Lab",city: "London",postal_code: "SW1A 1AA",country_code: "gb" }
describe("authoritative commerce boundary", () => {
  it("rejects client prices, paid flags and customer identifiers", () => {
    const request = { revision: "f243ef68-7314-48f7-a5b7-58bcc57703f3", address,
      items: [{ variant_id: "variant_a",quantity: 1,recurring: false }],ruo_accepted: true,recurring_accepted: false }
    expect(checkoutSchema.parse(request)).toBeDefined()
    for (const field of ["unit_price","customer_id","paid","currency"]) {
      expect(() => checkoutSchema.parse({ ...request,[field]: "tampered" })).toThrow()
    }
  })
  it("does not let a customer access another customer's financial records", () => {
    expect(() => owned({ owner_id: "customer_a",profile: "test" },"customer_b","test")).toThrow("not found")
    expect(() => owned({ owner_id: "customer_a",profile: "live" },"customer_a","test")).toThrow("not found")
  })
  it("keeps decimal money exact and applies the discount once", () => {
    expect(toMinor("49.05")).toBe(4905)
    expect(discounted(toMinor("49.00"))).toBe(4410)
    expect(() => toMinor("1.005")).toThrow()
    expect(() => toMinor(-1)).toThrow()
  })
  it("requires a signup research-use declaration, never a role label", () => {
    expect(() => assertEligibility({ has_account:true,metadata:{ role:"Verified Clinical Researcher" } })).toThrow()
    expect(() => assertEligibility({ has_account:true,metadata:{ compliance_ack:true } })).not.toThrow()
    expect(() => assertEligibility({ has_account:false,metadata:{ compliance_ack:true } })).toThrow()
  })
  it("rejects recurring pen sets and unapproved products, and respects wildcard/native service zones", () => {
    const approval = { state:"approved",data:{ canonical_name:"Exact identity",evidence_ref:"catalog-v1",destinations:["gb"],format:"pen" } }
    expect(() => assertProduct(approval,"gb",true)).toThrow("one-time")
    expect(() => assertProduct(approval,"gb",false)).not.toThrow()
    expect(() => assertProduct(approval,"bd",false)).toThrow("catalogue review")
    expect(() => assertProduct(null,"gb",false)).toThrow()

    // Medusa 2.0 native service zones & wildcard destinations
    const worldwideApproval = { state:"approved",data:{ canonical_name:"Worldwide Formulation",evidence_ref:"catalog-v1",destinations:["*"],format:"vial" } }
    expect(() => assertProduct(worldwideApproval,"bd",false)).not.toThrow()
    expect(() => assertProduct(worldwideApproval,"us",false)).not.toThrow()
  })
  it("accepts item metadata, company in address, and normalizes uppercase country codes", () => {
    const request = {
      revision: "f243ef68-7314-48f7-a5b7-58bcc57703f3",
      address: {
        id: "addr_123",
        first_name: "John",
        last_name: "Doe",
        company: "Biotech Labs Ltd",
        address_1: "123 Science Park",
        address_2: null,
        city: "Cambridge",
        postal_code: "CB1 2AB",
        country_code: "GB",
        province: null,
        phone: "+441234567890",
      },
      country_code: "GB",
      items: [
        {
          variant_id: "variant_a",
          quantity: 2,
          recurring: false,
          metadata: { title: "BPC-157", format: "pen", cartridge_name: "Standard" },
        },
      ],
      ruo_accepted: true,
      recurring_accepted: false,
    }
    const parsed = checkoutSchema.parse(request)
    expect(parsed.country_code).toBe("gb")
    expect(parsed.address?.country_code).toBe("gb")
    expect(parsed.items[0].metadata?.title).toBe("BPC-157")
  })
  it("validates configurable shipping rates with sensible default minor units", () => {
    const { shippingRatesSchema } = require("../policy")
    const defaults = shippingRatesSchema.parse({})
    expect(defaults.pen_set_uk_minor).toBe(495)
    expect(defaults.pen_set_intl_minor).toBe(1500)
    expect(defaults.refill_uk_minor).toBe(395)
    expect(defaults.refill_intl_minor).toBe(1000)
    expect(defaults.vial_uk_minor).toBe(395)
    expect(defaults.vial_intl_minor).toBe(1000)

    const custom = shippingRatesSchema.parse({
      pen_set_uk_minor: 500,
      pen_set_intl_minor: 2000,
      refill_uk_minor: 400,
      refill_intl_minor: 1200,
      vial_uk_minor: 400,
      vial_intl_minor: 1200,
    })
    expect(custom.pen_set_uk_minor).toBe(500)
    expect(custom.pen_set_intl_minor).toBe(2000)
    expect(() => shippingRatesSchema.parse({ pen_set_uk_minor: -10 })).toThrow()

    const { serviceZoneRateTierSchema } = require("../policy")
    const zoneDefaults = serviceZoneRateTierSchema.parse({})
    expect(zoneDefaults.pen_set_minor).toBe(495)
    expect(zoneDefaults.refill_minor).toBe(395)
    expect(zoneDefaults.vial_minor).toBe(395)
    const customZone = serviceZoneRateTierSchema.parse({
      pen_set_minor: 650,
      refill_minor: 450,
      vial_minor: 450,
    })
    expect(customZone.pen_set_minor).toBe(650)
    expect(() => serviceZoneRateTierSchema.parse({ pen_set_minor: -1 })).toThrow()
  })
})

