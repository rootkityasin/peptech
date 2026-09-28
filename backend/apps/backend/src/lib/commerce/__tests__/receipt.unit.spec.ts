import {signReceipt} from "../../../modules/stripe-checkout/service"
describe("native payment adapter receipt attestation",()=>{
 const receipt={profile:"acct_a:test:v1",receipt_id:"receipt_a",collection_id:"paycol_a",amount_minor:1495,currency:"gbp",stripe_session_id:"cs_test_a",payment_intent_id:"pi_a"}
 it("survives Medusa adding its own session_id",()=>{
  expect(signReceipt({...receipt,session_id:"payses_a"},"secret")).toBe(signReceipt(receipt,"secret"))
 })
 it.each(["profile","receipt_id","collection_id","amount_minor","currency","stripe_session_id","payment_intent_id"])("rejects changed %s",field=>{
  expect(signReceipt({...receipt,[field]:"different"},"secret")).not.toBe(signReceipt(receipt,"secret"))
 })
})
