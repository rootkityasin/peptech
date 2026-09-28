import type { AuthenticatedMedusaRequest,MedusaResponse } from "@medusajs/framework/http"
import { actor,commerce,endpoint } from "../../../../lib/commerce/http"
import { prepareCheckout,publicAttempt } from "../../../../lib/commerce/checkout"
import { owned } from "../../../../lib/commerce/policy"
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  res.setHeader("Cache-Control","no-store")
  return endpoint(res,()=>prepareCheckout(req.scope,commerce(req),actor(req),req.body))
}
export async function GET(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  res.setHeader("Cache-Control","no-store")
  return endpoint(res,async()=>publicAttempt(owned(await commerce(req).get(String(req.query.attempt_id)),actor(req))))
}
