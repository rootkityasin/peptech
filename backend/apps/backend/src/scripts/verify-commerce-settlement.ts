import type {ExecArgs} from "@medusajs/framework/types"
import fs from "node:fs"
import {Modules} from "@medusajs/framework/utils"
import {reconcileSession} from "../lib/commerce/events"
import {stripeContext} from "../lib/commerce/stripe"
import CommerceService from "../modules/peptech-commerce/service"
export default async function verify({container}:ExecArgs) {
  const url=new URL(process.env.DATABASE_URL!)
  if(url.hostname!=="127.0.0.1"||!url.pathname.endsWith("_test")||stripeContext().mode!=="test")throw new Error("Isolated sandbox required")
  const fixture=JSON.parse(fs.readFileSync("/tmp/peptech-sandbox-fixture.json","utf8"))
  const ledger=container.resolve("peptechCommerce") as CommerceService
  let attempt=await ledger.get(fixture.session.attemptId)
  if(!attempt?.data.session_id)throw new Error("No fixture session")
  await reconcileSession(container,ledger,attempt.data.session_id)
  await reconcileSession(container,ledger,attempt.data.session_id)
  attempt=await ledger.get(attempt.id)
  if(attempt?.state!=="confirmed")throw new Error(`Checkout state is ${attempt?.state}`)
  const orders=await container.resolve(Modules.ORDER).listOrders({id:attempt.data.order_id},{relations:["items","summary","shipping_address","billing_address"]})
  if(orders.length!==1)throw new Error("Expected exactly one order")
  if(!attempt.data.quote.delivery_collected || orders[0].shipping_address?.address_1!==attempt.data.quote.address.address_1 || orders[0].billing_address?.address_1!==attempt.data.quote.billing_address.address_1)throw new Error("Hosted order address mismatch")
  const orderModule=container.resolve(Modules.ORDER)
  const receiptId=String(orders[0].metadata?.peptech_receipt_id)
  const transactions=await orderModule.listOrderTransactions({order_id:attempt.data.order_id,reference:"capture"})
  if(transactions.length!==1)throw new Error("Expected one capture transaction")
  // Isolated fault injection: model a crash after native capture but before
  // recording the order transaction and confirming the durable receipt.
  await orderModule.deleteOrderTransactions(transactions.map(t=>t.id))
  await ledger.patch(receiptId,{},"paid")
  await reconcileSession(container,ledger,attempt.data.session_id)
  await reconcileSession(container,ledger,attempt.data.session_id)
  if((await orderModule.listOrderTransactions({order_id:attempt.data.order_id,reference:"capture"})).length!==1)throw new Error("Capture crash recovery duplicated or lost accounting")
  const {data:[order]}=await container.resolve("query").graph({entity:"order",fields:["id","total","payment_collections.*","payment_collections.payments.*"],filters:{id:attempt.data.order_id}})
  if(Number(order.total)!==fixture.session.total)throw new Error("Order total mismatch")
  console.log(JSON.stringify({phase:"C",attempt:attempt.id,state:attempt.state,order:order.id,total:order.total,
    collections:order.payment_collections?.length,payments:order.payment_collections?.[0]?.payments?.length,replay:"no-duplicate-order",capture_crash:"recovered-once"}))
}
