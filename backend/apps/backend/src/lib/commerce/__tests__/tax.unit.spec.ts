import {taxMinor,taxPolicy} from "../tax"
describe("client-configured VAT",()=>{
 it("does not assume the client is unregistered",()=>{expect(()=>taxPolicy({},"gb")).toThrow()})
 it("calculates inclusive and exclusive taxes in minor units",()=>{
  expect(taxMinor(1000,20,false)).toBe(200)
  expect(taxMinor(1200,20,true)).toBe(200)
  expect(taxMinor(495,20,false)).toBe(99)
  expect(taxMinor(495,20,true)).toBe(83)
 })
 it("requires a deliberate destination rate including zero-rated destinations",()=>{
  const settings={tax_policy:"manual_vat",tax_evidence_ref:"accountant",vat_number:"GB-fixture",prices_include_vat:true,vat_rates:{gb:20}}
  expect(taxPolicy(settings,"gb").rate).toBe(20)
  expect(()=>taxPolicy(settings,"us")).toThrow()
 })
})
