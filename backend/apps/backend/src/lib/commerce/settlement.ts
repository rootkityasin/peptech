import { createHash } from "node:crypto"
import { Modules } from "@medusajs/framework/utils"
import { createOrderPaymentCollectionWorkflow, capturePaymentWorkflow, markPaymentCollectionAsPaid } from "@medusajs/medusa/core-flows"
import { importCommerceOrder } from "../../workflows/import-commerce-order"
import CommerceService,{recordId,LedgerRecord} from "../../modules/peptech-commerce/service"
import { signReceipt } from "../../modules/stripe-checkout/service"
import { stripeContext,objectId } from "./stripe"
import { fail } from "./policy"
import { Quote,reserveQuote } from "./quote"

export function generateOrderNumber(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex")
  const num = (parseInt(hash.slice(0, 8), 16) % 900000) + 100000
  return `PEP-${num}`
}

export async function settleReceipt(scope:any,ledger:CommerceService,attempt:LedgerRecord,evidence:{reference:string;amount:number;currency:string;payment_intent_id:string|null;invoice_id?:string;session_id?:string;source?:"bank_transfer";verified_by?:string;receipt_url?:string|null},quote?:Quote) {
  const context=stripeContext();const q=quote || attempt.data.quote as Quote
  const renewal=!!quote&&quote.lines[0]?.line_id!==attempt.data.quote.lines[0]?.line_id
  if(attempt.profile!==context.profile || evidence.currency!==q.currency || evidence.amount!==q.total_minor) fail("Payment amount or account requires reconciliation",409)
  const id=recordId("receipt",context.profile,evidence.reference)
  const orderNumber = generateOrderNumber(id)
  const stripeReceiptUrl = evidence.receipt_url || null
  return ledger.locked(id,async()=>{
    if(!renewal)await ledger.locked(attempt.id,async()=>{
      const latest=await ledger.get(attempt.id)
      if(latest?.data.initial_receipt_id&&latest.data.initial_receipt_id!==id)fail("This checkout already has a different settlement reference",409)
      await ledger.patch(attempt.id,{initial_receipt_id:id})
    })
    const receipt=await ledger.create({id,kind:"receipt",profile:context.profile,owner_id:attempt.owner_id,state:"paid",data:{...evidence,attempt_id:attempt.id,quote:q,order_number:orderNumber,display_id:orderNumber,stripe_receipt_url:stripeReceiptUrl}})
    if(receipt.data.attempt_id!==attempt.id)fail("Payment reference is already allocated to another order",409)
    if(receipt.state==="confirmed") return receipt
    const orderId=recordId("order",id)
    const orderModule=scope.resolve(Modules.ORDER)
    const existing=await orderModule.listOrders({id:orderId},{relations:["items"]})
    if(!existing.length) {
      const cleanAddress = (addr: any) => {
        if (!addr) return undefined
        const { id, created_at, updated_at, deleted_at, customer_id, ...rest } = addr
        return {
          first_name: rest.first_name || "",
          last_name: rest.last_name || "",
          company: rest.company || "",
          address_1: rest.address_1 || "",
          address_2: rest.address_2 || "",
          city: rest.city || "",
          postal_code: rest.postal_code || "",
          province: rest.province || "",
          country_code: (rest.country_code || "gb").toLowerCase(),
          phone: rest.phone || "",
          metadata: rest.metadata || {},
        }
      }
      const input:any={id:orderId,custom_display_id:orderNumber,customer_id:q.customer_id,email:q.email,currency_code:q.currency,region_id:q.region_id,
        sales_channel_id:q.sales_channel_id,status:"pending",shipping_address:cleanAddress(q.address),billing_address:cleanAddress(q.billing_address||q.address),
        no_notification:true,metadata:{peptech_receipt_id:id,peptech_attempt:attempt.id,payment_gateway:evidence.source||"stripe",
          subscription_id:attempt.data.subscription_id||null,fulfillment_hold:true,tax_policy:q.tax_policy,order_number_formatted:orderNumber,stripe_receipt_url:stripeReceiptUrl,
          tags:attempt.data.subscription_id?["Sub-Order"]:[]},
        items:q.lines.map(l=>({id:l.line_id,variant_id:l.variant_id,title:l.name,variant_sku:l.sku,quantity:l.quantity,
          unit_price:l.unit_minor/100,is_tax_inclusive:q.tax_inclusive||false,tax_lines:l.tax_lines||(q.vat_registered?[{rate:q.tax_rate,code:"VAT",description:"VAT"}]:[]),requires_shipping:true,metadata:{catalog_version:l.catalog_version,recurring:l.recurring,...(l.metadata||{})}})),
        shipping_methods:[{name:q.shipping_option_name||q.shipping_option_id||"Royal Mail Tracked",amount:q.shipping_minor/100,shipping_option_id:q.shipping_option_id,is_tax_inclusive:q.tax_inclusive||false,tax_lines:q.shipping_tax_lines||(q.vat_registered?[{rate:q.tax_rate,code:"VAT",description:"VAT"}]:[])}]}
      await importCommerceOrder(scope).run({input,context:{transactionId:recordId("workflow",id)}})
      if(q.customer_id&&q.address&&q.address.address_1){
        try{
          const customerModule=scope.resolve(Modules.CUSTOMER)
          const existingAddrs=await customerModule.listCustomerAddresses({customer_id:q.customer_id})
          const norm=(s?:string)=>(s||"").trim().toLowerCase()
          const exists=existingAddrs.some((a:any)=>norm(a.address_1)===norm(q.address.address_1)&&norm(a.postal_code)===norm(q.address.postal_code))
          if(!exists){
            await customerModule.createCustomerAddresses({
              customer_id:q.customer_id,
              first_name:q.address.first_name||"",
              last_name:q.address.last_name||"",
              company:q.address.company||"",
              address_1:q.address.address_1,
              address_2:q.address.address_2||"",
              city:q.address.city||"",
              postal_code:q.address.postal_code||"",
              province:q.address.province||"",
              country_code:(q.address.country_code||"gb").toLowerCase(),
              phone:q.address.phone||"",
              is_default_shipping:existingAddrs.length===0,
              is_default_billing:existingAddrs.length===0,
            })
          }
        }catch{}
      }
      if(q.customer_id && attempt.data?.stripe_customer_id){
        try{
          const custKey = recordId("customer", context.profile, q.customer_id)
          await ledger.create({
            id: custKey,
            kind: "customer",
            profile: context.profile,
            owner_id: q.customer_id,
            state: "active",
            data: { stripe_id: attempt.data.stripe_customer_id }
          }).catch(async () => {
            await ledger.patch(custKey, { stripe_id: attempt.data.stripe_customer_id }, "active").catch(() => {})
          })
          if (evidence?.payment_intent_id) {
            const pi = await context.stripe.paymentIntents.retrieve(evidence.payment_intent_id).catch(() => null)
            if (pi?.payment_method) {
              const pmId = objectId(pi.payment_method)
              if (pmId) {
                await context.stripe.paymentMethods.update(pmId, { allow_redisplay: "always" }).catch(() => {})
                await context.stripe.customers.update(attempt.data.stripe_customer_id, {
                  invoice_settings: { default_payment_method: pmId }
                }).catch(() => {})
              }
            }
          }
        }catch{}
      }
    }
    // Renewal reservations and initial reservations use the same deterministic line IDs.
    try { await reserveQuote(scope,q,renewal?id:attempt.id) }
    catch { receipt.state="stock_hold";receipt.data.order_id=orderId;await ledger.save(receipt);throw new Error("Paid order requires inventory review") }
    let collectionId=receipt.data.collection_id
    if(!collectionId) {
      const {data:[order]}=await scope.resolve("query").graph({entity:"order",fields:["id","total","payment_collections.*"],filters:{id:orderId}})
      if(Math.round(Number(order.total)*100)!==evidence.amount) fail("Medusa order total differs from Stripe",409)
      const collection=order.payment_collections?.[0] || (await createOrderPaymentCollectionWorkflow(scope).run({input:{order_id:orderId,amount:evidence.amount/100}})).result[0]
      collectionId=collection.id;receipt.data.collection_id=collectionId;await ledger.save(receipt)
    }
    const payment=scope.resolve(Modules.PAYMENT)
    const collection=await payment.retrievePaymentCollection(collectionId,{relations:["payment_sessions","payments","payments.captures"]})
    let paymentRecord:any
    if(evidence.source==="bank_transfer") {
      if(!evidence.verified_by)fail("Verified bank evidence is required",409)
      paymentRecord=collection.payments?.[0]
      if(!paymentRecord?.captured_at) paymentRecord=(await markPaymentCollectionAsPaid(scope).run({input:{order_id:orderId,
        payment_collection_id:collectionId,captured_by:evidence.verified_by}})).result
    } else {
    let session=collection.payment_sessions?.[0]
    if(!session) {
      const data:any={profile:context.profile,receipt_id:id,collection_id:collectionId,amount_minor:evidence.amount,currency:q.currency,
        stripe_session_id:evidence.session_id,invoice_id:evidence.invoice_id,payment_intent_id:evidence.payment_intent_id}
      data.attestation=signReceipt(data,context.signingSecret)
      session=await payment.createPaymentSession(collectionId,{provider_id:context.checkoutProviderId,
        amount:evidence.amount/100,currency_code:q.currency,data})
    }
    paymentRecord=collection.payments?.[0] || await payment.authorizePaymentSession(session.id,{})
    if(!paymentRecord) throw new Error("Payment authorization is pending")
    // Native capture is idempotent when already captured, and its transaction
    // step repairs a crash after capture but before the order ledger update.
    await capturePaymentWorkflow(scope).run({input:{payment_id:paymentRecord.id}})
    }
    receipt.state="confirmed";receipt.data.order_id=orderId;receipt.data.order_number=orderNumber;receipt.data.display_id=orderNumber;receipt.data.stripe_receipt_url=stripeReceiptUrl;receipt.data.payment_id=paymentRecord.id;await ledger.save(receipt)
    if(!renewal) await ledger.locked(attempt.id,async()=>{
      const latest=await ledger.get(attempt.id)
      if(latest){latest.state="confirmed";latest.data.order_id=orderId;latest.data.order_number=orderNumber;latest.data.display_id=orderNumber;latest.data.stripe_receipt_url=stripeReceiptUrl;await ledger.save(latest)}
    })
    await ledger.create({id:recordId("operation",id,"receipt-email"),kind:"operation",profile:context.profile,owner_id:q.customer_id,state:"pending",
      data:{type:"email",template:"order-confirmed",to:q.email,order_id:orderId,order_number:orderNumber,reference:id}})
    return receipt
  })
}
export async function paymentEvidence(stripe:any,invoice:any) {
  if(invoice.status!=="paid") return null
  const piId = objectId(invoice.payment_intent)
  if(piId) {
    const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["latest_charge"] })
    if(pi.status!=="succeeded" || pi.amount_received!==invoice.total) fail("Invoice payment is not settled", 409)
    const chargeReceipt = typeof pi.latest_charge === "object" ? (pi.latest_charge as any)?.receipt_url : null
    return { payment_intent_id: pi.id, amount: pi.amount_received, receipt_url: chargeReceipt || invoice.hosted_invoice_url || null }
  }
  if(invoice.total===0 && invoice.amount_paid===0) return { payment_intent_id: null, amount: 0, receipt_url: invoice.hosted_invoice_url || null }
  fail("Invoice settlement requires manual reconciliation", 409)
}
