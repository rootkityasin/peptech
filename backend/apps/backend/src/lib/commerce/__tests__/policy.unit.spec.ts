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
  it("rejects recurring pen sets and unapproved products", () => {
    const approval = { state:"approved",data:{ canonical_name:"Exact identity",evidence_ref:"catalog-v1",destinations:["gb"],format:"pen" } }
    expect(() => assertProduct(approval,"gb",true)).toThrow("one-time")
    expect(() => assertProduct(approval,"gb",false)).not.toThrow()
    expect(() => assertProduct(null,"gb",false)).toThrow()
  })
})
