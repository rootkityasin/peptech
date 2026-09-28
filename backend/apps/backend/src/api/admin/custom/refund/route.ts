import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {refundOrder} from "../../../../lib/commerce/refunds"
export async function GET(_req:AuthenticatedMedusaRequest,res:MedusaResponse) {return res.json({refund_reasons:[]})}
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,()=>refundOrder(req.scope,commerce(req),operator(req),req.body))
}
