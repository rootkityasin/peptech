import {checkoutDelivery} from "../checkout-delivery"
import {checkoutSchema} from "../policy"
const quote:any={address:{country_code:"gb"},email:"owner@example.com",lines:[]}
const address={line1:"12 Laboratory Street",line2:"Unit 2",city:"London",postal_code:"SW1A 1AA",country:"GB",state:"London"}
const session:any={ui_mode:"hosted_page",status:"complete",collected_information:{shipping_details:{name:"Alex Researcher",address}},
  customer_details:{name:"Billing Contact",email:"billing@example.com",phone:"+447700900123",address:{...address,line1:"4 Billing Road"}}}
describe("hosted Checkout order details",()=>{
 it("uses session delivery and separate billing addresses without changing order ownership",()=>{
  const result=checkoutDelivery(session,quote)
  expect(result.address).toMatchObject({first_name:"Alex",last_name:"Researcher",address_1:"12 Laboratory Street",phone:"+447700900123"})
  expect(result.billing_address.address_1).toBe("4 Billing Road")
  expect(result.email).toBe(quote.email)
  expect(result.delivery_collected).toBe(true)
 })
 it("does not overwrite addresses from an incomplete session or legacy Elements checkout",()=>{
  expect(checkoutDelivery({...session,status:"open"},quote)).toBe(quote)
  expect(checkoutDelivery({...session,ui_mode:"elements"},quote)).toBe(quote)
 })
 it("rejects missing shipping details and a country outside the shipping quote",()=>{
  expect(()=>checkoutDelivery({...session,collected_information:null},quote)).toThrow("incomplete")
  expect(()=>checkoutDelivery(session,{...quote,address:{country_code:"us"}})).toThrow("destination changed")
 })
 it("accepts a single-word recipient name without inventing a surname",()=>{
  const result=checkoutDelivery({...session,collected_information:{shipping_details:{name:"Alex",address}}},quote)
  expect(result.address.last_name).toBe("")
 })
 it("accepts country-only input for hosted collection and rejects bank transfer",()=>{
  const body={revision:"f243ef68-7314-48f7-a5b7-58bcc57703f3",country_code:"gb",items:[{variant_id:"variant_a",quantity:1,recurring:false}],ruo_accepted:true,recurring_accepted:false}
  expect(checkoutSchema.parse(body).payment_method).toBe("stripe")
  expect(()=>checkoutSchema.parse({...body,payment_method:"bank_transfer"})).toThrow()
 })
})
