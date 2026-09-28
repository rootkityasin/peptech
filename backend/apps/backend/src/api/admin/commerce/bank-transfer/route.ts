import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {z} from "zod"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {settleReceipt} from "../../../../lib/commerce/settlement"
import {fail,toMinor} from "../../../../lib/commerce/policy"
const schema=z.object({attempt_id:z.string(),bank_transaction_id:z.string().trim().min(1).max(150),
  statement_reference:z.string().trim().min(1).max(300),amount:z.union([z.string(),z.number()])}).strict()
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    const admin=operator(req),input=schema.parse(req.body),ledger=commerce(req)
    const attempt=await ledger.get(input.attempt_id)
    if(!attempt || attempt.data.payment_method!=="bank_transfer")fail("Bank transfer checkout not found",404)
    const amount=toMinor(input.amount)
    if(amount!==attempt.data.quote.total_minor) {
      await ledger.audit(attempt.id,admin,"bank-amount-exception",{amount_minor:amount,statement_reference:input.statement_reference})
      fail("Underpayment or overpayment requires reconciliation; no fulfillment was released",409)
    }
    await ledger.audit(attempt.id,admin,"bank-funds-verified",{statement_reference:input.statement_reference,transaction_id:input.bank_transaction_id,amount_minor:amount})
    const receipt=await settleReceipt(req.scope,ledger,attempt,{reference:`bank:${input.bank_transaction_id}`,amount,currency:attempt.data.quote.currency,
      payment_intent_id:null,source:"bank_transfer",verified_by:admin})
    return {order_id:receipt.data.order_id,status:receipt.state}
  })
}
