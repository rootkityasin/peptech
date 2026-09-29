import {checkoutTaxQuote} from "./stripe-tax-quote"
import { createHash, randomBytes } from "node:crypto"
import CommerceService,{ recordId,LedgerRecord } from "../../modules/peptech-commerce/service"
import { assertStripeAccount,stripeContext,operationKey } from "./stripe"
import { checkoutSchema,fail,owned } from "./policy"
import { buildQuote,reserveQuote,releaseQuote,Quote } from "./quote"
export async function prepareCheckout(scope:any,ledger:CommerceService,customer:string,body:unknown) {
  const input=checkoutSchema.parse(body)
  const context=await assertStripeAccount()
  if(context.mode==="live") {
    const settings=await ledger.get("commerce_settings")
    if(!settings?.data.stripe_scope_evidence_ref || !process.env.REDIS_URL || !process.env.STRIPE_EMAIL_HOST || !process.env.STRIPE_EMAIL_FROM || (process.env.STRIPE_COMMERCE_SIGNING_SECRET||"").length<32 || !process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET ||
      !process.env.JWT_SECRET || process.env.JWT_SECRET==="supersecret" || !process.env.COOKIE_SECRET || process.env.COOKIE_SECRET==="supersecret") {
      fail("Production payment prerequisites have not been cleared",503)
    }
  }
  const id=recordId("attempt",context.profile,customer,input.revision)
  return ledger.locked(`customer-checkout:${customer}`,async()=>{
    const hash=createHash("sha256").update(JSON.stringify(input)).digest("hex")
    let attempt=await ledger.get(id)
    if(attempt && attempt.data.request_hash!==hash) fail("Basket changed. Use a new checkout revision.",409)
    const active=await ledger.list("attempt",{owner:customer,profile:context.profile,limit:500})
    for(const other of active.filter(a=>a.id!==id && ["creating","open","processing"].includes(a.state))) {
      if(!other.data.session_id) fail("A previous checkout is still being prepared. Resume it before starting another.",409)
      const session=await context.stripe.checkout.sessions.retrieve(other.data.session_id)
      if(session.status==="open") await context.stripe.checkout.sessions.expire(session.id)
      else if(session.status!=="expired") fail("A previous payment is awaiting confirmation. Check your orders before retrying.",409)
      other.state="expired";await ledger.save(other);await releaseQuote(scope,other.id)
    }
    if(!attempt) {
      const recent=active.filter(a=>Date.now()-new Date(a.created_at).getTime()<3600000)
      if(recent.length>=12) fail("Too many checkout attempts. Please try again later.",429)
      const quote=await buildQuote(scope,ledger,customer,input,id)
      attempt=await ledger.create({id,kind:"attempt",profile:context.profile,owner_id:customer,state:"creating",data:{
        request_hash:hash,quote,revision:input.revision,payment_method:input.payment_method,
        integration_identifier:`peptech_${Array.from(randomBytes(8),b=>String.fromCharCode(97+b%26)).join("")}`,
        consent:{ruo:true,recurring:input.recurring_accepted,version:"checkout-v1",accepted_at:new Date().toISOString()},
        expires_at:Math.floor(Date.now()/1000)+3600}})
    }
    owned(attempt,customer,context.profile)
    if(["paid","confirmed","held"].includes(attempt.state)) return publicAttempt(attempt)
    if(["expired","failed"].includes(attempt.state)) fail("Checkout has expired. Refresh your basket.",409)
    if(attempt.state==="review")fail("Checkout needs operator reconciliation before another payment",409)
    const quote=attempt.data.quote as Quote
    await reserveQuote(scope,quote,id)
    let session=attempt.data.session_id?await context.stripe.checkout.sessions.retrieve(attempt.data.session_id):null
    if(!session) {
      // Stripe idempotency retention is finite. Never reissue an old ambiguous create.
      if(Date.now()-new Date(attempt.created_at).getTime()>23*3600000) fail("Checkout needs reconciliation before retry",409)
      if(attempt.data.expires_at<Math.floor(Date.now()/1000)+1800)fail("Checkout is awaiting expiry reconciliation. Please retry shortly.",409)
      const customerKey=recordId("customer",context.profile,customer)
      let mapping=await ledger.get(customerKey)
      if(!mapping) {
        const stripeCustomer=await context.stripe.customers.create({email:quote.email,
          metadata:{peptech_customer_id:customer,peptech_profile:context.profile}}, {idempotencyKey:customerKey})
        mapping=await ledger.create({id:customerKey,kind:"customer",profile:context.profile,owner_id:customer,state:"active",data:{stripe_id:stripeCustomer.id}})
      }
      const address={line1:quote.address.address_1,line2:quote.address.address_2,city:quote.address.city,
        postal_code:quote.address.postal_code,country:quote.address.country_code.toUpperCase(),state:quote.address.province}
      if(quote.address.address_1) await context.stripe.customers.update(mapping.data.stripe_id,{address,shipping:{name:`${quote.address.first_name} ${quote.address.last_name}`,address}})
      const recurring=quote.renewal_minor>0
      let taxRateId:string|undefined
      if(quote.vat_registered && quote.tax_policy!=="stripe_default") {
        const taxKey=recordId("taxrate",context.profile,String(quote.tax_rate),String(quote.tax_inclusive),quote.address.country_code)
        let mapping=await ledger.get(taxKey)
        if(!mapping) {
          const rate=await context.stripe.taxRates.create({display_name:"VAT",percentage:quote.tax_rate,
            inclusive:quote.tax_inclusive,country:quote.address.country_code.toUpperCase()}, {idempotencyKey:taxKey})
          mapping=await ledger.create({id:taxKey,kind:"taxrate",profile:context.profile,owner_id:null,state:"active",data:{stripe_id:rate.id}})
        }
        taxRateId=mapping.data.stripe_id
      }
      const lineItems:any[]=quote.lines.map(l=>({quantity:l.quantity,...(taxRateId?{tax_rates:[taxRateId]}:{}),price_data:{currency:quote.currency,unit_amount:l.unit_minor,tax_behavior:quote.tax_inclusive?"inclusive":"exclusive",
        product_data:{name:l.name,...(l.tax_code?{tax_code:l.tax_code}:{}),metadata:{variant_id:l.variant_id,catalog_version:l.catalog_version,recurring:String(l.recurring)}},
        ...(l.recurring?{recurring:{interval:"day",interval_count:28}}:{})}}))
      lineItems.push({quantity:1,...(taxRateId?{tax_rates:[taxRateId]}:{}),price_data:{currency:quote.currency,unit_amount:quote.shipping_minor,tax_behavior:quote.tax_inclusive?"inclusive":"exclusive",
        product_data:{name:"Royal Mail Tracked delivery",tax_code:"txcd_92010001",metadata:{peptech_shipping:"true"}},...(recurring?{recurring:{interval:"day",interval_count:28}}:{})}})
      const origin=process.env.STRIPE_STOREFRONT_URL || "http://localhost:3000"
      if(!origin || (context.mode==="live"&&!origin.startsWith("https://"))) fail("Storefront return URL needs configuration",503)
      try {
      session=await context.stripe.checkout.sessions.create({ui_mode:"hosted" as any,
        billing_address_collection:"required",phone_number_collection:{enabled:true},
        shipping_address_collection:{allowed_countries:[quote.address.country_code.toUpperCase()]},
        customer_update:{address:"auto",shipping:"auto",name:"auto"},mode:recurring?"subscription":"payment",
        integration_identifier:attempt.data.integration_identifier,customer:mapping.data.stripe_id,
        line_items:lineItems,automatic_tax:{enabled:quote.stripe_tax_enabled===true},client_reference_id:id,metadata:{peptech_attempt:id,peptech_profile:context.profile},
        ...(recurring?{subscription_data:{metadata:{peptech_attempt:id,peptech_profile:context.profile}}}:
          {payment_intent_data:{metadata:{peptech_attempt:id,peptech_profile:context.profile}}}),
        cancel_url:`${origin.replace(/\/$/,"")}/checkout?cancelled=1`,
        success_url:`${origin.replace(/\/$/,"")}/checkout/success?attempt_id=${id}`,
        expires_at:attempt.data.expires_at,} as any, {idempotencyKey:operationKey("checkout-hosted-v2",id)})
      } catch(error:any) {
        // A definitive validation rejection created no session. Allow a fresh revision.
        // Network/unknown failures remain recoverable with the same idempotency key.
        if(error.type==="StripeInvalidRequestError") {
          attempt.state="failed";await ledger.save(attempt);await releaseQuote(scope,attempt.id)
        }
        throw error
      }
      attempt.data.session_id=session.id;attempt.data.stripe_customer_id=mapping.data.stripe_id
    }
    if(quote.tax_policy==="stripe_default"&&session.automatic_tax.status!=="requires_location_inputs") {
      attempt.data.quote=await checkoutTaxQuote(context.stripe,session,quote)
    }
    if(session.livemode!==(context.mode==="live")) fail("Stripe environment mismatch",503)
    attempt.state=session.status==="expired"?"expired":(session.payment_status==="paid"||session.status==="complete")?"processing":"open"
    await ledger.save(attempt)
    return {...publicAttempt(attempt),checkoutUrl:session.url}
  })
}
export function publicAttempt(attempt:LedgerRecord) {
  const q=attempt.data.quote as Quote
  return {attemptId:attempt.id,state:attempt.state,orderId:attempt.data.order_id||null,
    revision:attempt.data.revision,taxStatus:q.stripe_tax_status,total:q.total_minor/100,currency:q.currency,renewalTotal:q.renewal_minor/100,
    items:q.lines.map(l=>({name:l.name,quantity:l.quantity,recurring:l.recurring,unitPrice:l.unit_minor/100})),
    shipping:q.shipping_minor/100,tax:q.tax_minor/100||0,taxInclusive:q.tax_inclusive,bankInstructions:attempt.data.payment_method==="bank_transfer"?q.bank_instructions:undefined,paymentMethod:attempt.data.payment_method,reference:attempt.id,
    subscriptionId:attempt.data.subscription_id||null}
}
