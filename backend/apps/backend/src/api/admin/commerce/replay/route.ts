import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {processEvent} from "../../../../lib/commerce/events"
import {fail} from "../../../../lib/commerce/policy"
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
 return endpoint(res,async()=>{
  const admin=operator(req),ledger=commerce(req),body=req.body as any
  if(typeof body.event_id!=="string")fail("Event ID required")
  const event=await ledger.get(body.event_id)
  if(event?.kind!=="event")fail("Event not found",404)
  await ledger.audit(event.id,admin,"event-replay")
  await processEvent(req.scope,ledger,event.id)
  return {processed:true}
 })
}
