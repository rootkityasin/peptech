import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {subscriptionCommand} from "../../../../lib/commerce/subscriptions"
import {fail} from "../../../../lib/commerce/policy"
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
 return endpoint(res,async()=>{
  const admin=operator(req),ledger=commerce(req),body=req.body as any
  const subscription=await ledger.get(body.subscription_id)
  if(!subscription?.owner_id||subscription.kind!=="subscription")fail("Subscription not found",404)
  await ledger.audit(subscription.id,admin,"admin-subscription-command",{action:body.action,operation_id:body.operation_id})
  return {subscription:await subscriptionCommand(ledger,subscription.owner_id,body)}
 })
}
