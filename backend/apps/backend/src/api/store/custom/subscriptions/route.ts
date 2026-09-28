import type { AuthenticatedMedusaRequest,MedusaResponse } from "@medusajs/framework/http"
import { actor,commerce,endpoint } from "../../../../lib/commerce/http"
import { presentSubscription,subscriptionCommand } from "../../../../lib/commerce/subscriptions"
export async function GET(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  res.setHeader("Cache-Control","no-store")
  return endpoint(res,async()=>{const rows=await commerce(req).list("subscription",{owner:actor(req)});return {subscriptions:rows.map(presentSubscription)}})
}
export async function PUT(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>({subscription:await subscriptionCommand(commerce(req),actor(req),req.body)}))
}
export async function POST(_req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return res.status(410).json({message:"Subscriptions require an authorised recurring checkout"})
}
