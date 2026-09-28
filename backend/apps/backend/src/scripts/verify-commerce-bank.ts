import type {ExecArgs} from "@medusajs/framework/types"
import {Modules} from "@medusajs/framework/utils"
import {randomUUID} from "node:crypto"
import fs from "node:fs"
import {stripeContext} from "../lib/commerce/stripe"
import {prepareCheckout} from "../lib/commerce/checkout"
import {POST as bank} from "../api/admin/commerce/bank-transfer/route"
import {POST as release} from "../api/admin/commerce/release/route"
export default async function verify({container}:ExecArgs){
 const url=new URL(process.env.DATABASE_URL!),context=stripeContext()
 if(context.mode!=="test"||url.hostname!=="127.0.0.1"||!url.pathname.endsWith("_test"))throw new Error("Isolated sandbox required")
 const ledger:any=container.resolve("peptechCommerce"),settings=await ledger.get("commerce_settings")
 if(settings.data.tax_evidence_ref!=="sandbox-fixture-only")throw new Error("Fixture configuration required")
 const original=structuredClone(settings.data)
 const fixture=JSON.parse(fs.readFileSync("/tmp/peptech-sandbox-fixture.json","utf8"))
 async function call(handler:any,body:any){const res:any={code:200,body:null,status(n:number){this.code=n;return this},json(value:any){this.body=value;return this}};await handler({scope:container,body,auth_context:{actor_id:"sandbox-admin"}},res);return res}
 try{
  settings.data.bank_instructions={account_name:"ISOLATED TEST ONLY",sort_code:"000000",account_number:"00000000"};await ledger.save(settings)
  const customer=await container.resolve(Modules.CUSTOMER).createCustomers({email:`bank-${randomUUID()}@example.com`,has_account:true,metadata:{compliance_ack:true}})
  const input={...fixture.input,revision:randomUUID(),items:[{variant_id:fixture.variant_id,quantity:1,recurring:false}],payment_method:"bank_transfer",recurring_accepted:false}
  const attempt:any=await prepareCheckout(container,ledger,customer.id,input)
  if(attempt.state!=="awaiting_transfer")throw new Error("Bank order falsely marked paid")
  const body={attempt_id:attempt.attemptId,bank_transaction_id:`fixture-${randomUUID()}`,statement_reference:"isolated bank statement",amount:attempt.total}
  if((await call(bank,{...body,amount:1})).code!==409)throw new Error("Underpayment accepted")
  const first=await call(bank,body),again=await call(bank,body)
  if(first.body.status!=="confirmed"||again.body.order_id!==first.body.order_id)throw new Error(`Bank replay failed: ${first.body.message||first.body.status}`)
  if((await call(bank,{...body,bank_transaction_id:randomUUID()})).code!==409)throw new Error("Second settlement reference accepted")
  const order=await container.resolve(Modules.ORDER).retrieveOrder(first.body.order_id,{relations:["items"]})
  if(order.metadata?.fulfillment_hold!==true)throw new Error("Payment released dispatch automatically")
  const allocations=order.items!.map(i=>({line_id:i.id,quantity:Number(i.quantity),batch_id:"TEST-BATCH",coa_reference:"TEST-COA-NOT-FOR-SALE"}))
  if((await call(release,{order_id:order.id,allocations})).body.released!==true)throw new Error("Packing release failed")
  console.log(JSON.stringify({bank:"verified-once",underpayment:"held",second_reference:"rejected",fulfillment:"paid-then-explicit-batch-release",order:order.id}))
 }finally{settings.data=original;await ledger.save(settings)}
}
