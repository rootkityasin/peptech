import type {ExecArgs} from "@medusajs/framework/types"
import {randomUUID} from "node:crypto"
import fs from "node:fs"
import {stripeContext} from "../lib/commerce/stripe"
import {POST} from "../api/hooks/peptech-stripe/route"
import {recordId} from "../modules/peptech-commerce/service"
export default async function verify({container}:ExecArgs){
 const context=stripeContext(),url=new URL(process.env.DATABASE_URL!)
 if(context.mode!=="test"||url.hostname!=="127.0.0.1"||!url.pathname.endsWith("_test"))throw new Error("Isolated sandbox required")
 const fixture=JSON.parse(fs.readFileSync("/tmp/peptech-sandbox-fixture.json","utf8"))
 const ledger:any=container.resolve("peptechCommerce"),attempt=await ledger.get(fixture.session.attemptId)
 const secret="whsec_isolatedsignaturefixture",prior=process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET
 process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET=secret
 const event={id:`evt_fixture_${randomUUID()}`,object:"event",type:"checkout.session.completed",livemode:false,created:Math.floor(Date.now()/1000),data:{object:{id:attempt.data.session_id}}}
 async function send(value:any,invalid=false,unavailable=false){
  const payload=JSON.stringify(value),headers={"stripe-signature":invalid?"invalid":context.stripe.webhooks.generateTestHeaderString({payload,secret})}
  const response:any={code:200,status(n:number){this.code=n;return this},json(){return this}}
  const scope=unavailable?{resolve(){return {create:async()=>{throw new Error("fixture database unavailable")}}}}:container
  await POST({rawBody:Buffer.from(payload),headers,scope} as any,response)
  return response.code
 }
 try {
  if(await send(event,true)!==400)throw new Error("Unsigned event accepted")
  if(await send({...event,livemode:true})!==400)throw new Error("Wrong mode accepted")
  if(await send({...event,account:"acct_wrong"})!==400)throw new Error("Wrong account accepted")
  if(await send(event,false,true)!==503)throw new Error("Unstored event acknowledged")
  if(await send(event)!==200||await send(event)!==200)throw new Error("Webhook retry failed")
  const stored=await ledger.get(recordId("event",context.profile,event.id))
  if(stored.state!=="pending")throw new Error("Webhook performed synchronous financial work")
  const rows=await ledger.list("event",{data:{stripe_event_id:event.id}})
  if(rows.length!==1)throw new Error("Duplicate event persisted")
  await ledger.patch(stored.id,{fixture:true},"done")
  console.log(JSON.stringify({signature:"verified",wrong_mode:"rejected",wrong_account:"rejected",storage_failure:503,replay:"one-durable-event"}))
 } finally {if(prior===undefined)delete process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET;else process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET=prior}
}
