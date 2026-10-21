import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {z} from "@medusajs/framework/zod"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {settleReceipt} from "../../../../lib/commerce/settlement"
import {fail,toMinor} from "../../../../lib/commerce/policy"
const schema=z.object({attempt_id:z.string(),bank_transaction_id:z.string().trim().min(1).max(150),
  statement_reference:z.string().trim().min(1).max(300),amount:z.union([z.string(),z.number()])}).strict()
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    fail("Offline bank transfer rail is disabled. PEPTECH operates exclusively on Stripe SCA card and digital wallet settlements.", 410)
  })
}
