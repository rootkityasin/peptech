import {Quote} from "./quote"
import {fail} from "./policy"
// Stripe is the tax authority. The base price, quantity and product identity
// remain the server's authority; discounts and unrecognised invoice lines fail closed.
export function applyStripeLines(original:Quote,rows:any[],total:number,invoice=false):Quote {
 const quote:Quote=structuredClone(original)
 const expected=[...quote.lines.map(line=>({line,shipping:false})),{line:null,shipping:true}]
 const seen=new Set<number>();let tax=0,renewal=0,sum=0
 for(const row of rows){
  const priceId=invoice?row.pricing?.price_details?.price:row.price?.id
  const product=row.price?.product
  const index=expected.findIndex(({line,shipping},i)=>!seen.has(i)&&(invoice
   ?priceId===(shipping?quote.shipping_price_id:line!.stripe_price_id)
   :shipping?product?.metadata?.peptech_shipping==="true":product?.metadata?.variant_id===line!.variant_id&&product?.metadata?.recurring===String(line!.recurring)))
  if(index<0)fail("Stripe line identity requires reconciliation",409)
  seen.add(index);const {line,shipping}=expected[index]
  const quantity=shipping?1:line!.quantity;const unit=shipping?quote.shipping_minor:line!.unit_minor
  if(row.quantity!==quantity||Number(invoice?row.pricing?.unit_amount_decimal:row.price?.unit_amount)!==unit||row.currency!==quote.currency||row.amount_discount||row.discount_amounts?.length)fail("Stripe base price or quantity differs from the agreed basket",409)
  const taxes=row.taxes||[]
  const lineTax=invoice?taxes.reduce((n:number,t:any)=>n+t.amount,0):row.amount_tax
  const inclusive=invoice?taxes.every((t:any)=>t.tax_behavior==="inclusive"):row.price.tax_behavior==="inclusive"
  const totalLine=invoice?row.amount+(inclusive?0:lineTax):row.amount_total
  const taxLines=taxes.map((t:any)=>({code:"STRIPE_TAX",description:t.rate?.display_name||"Stripe Tax",
   rate:Number(t.rate?.percentage??NaN),
   metadata:{stripe_tax_rate:typeof t.tax_rate_details?.tax_rate==="string"?t.tax_rate_details.tax_rate:t.rate?.id,amount_minor:t.amount,taxability_reason:t.taxability_reason}}))
  if(taxLines.some((t:any)=>!Number.isFinite(t.rate)))fail("Stripe tax rate requires reconciliation",409)
  if(shipping){quote.shipping_tax_lines=taxLines;quote.shipping_tax_minor=lineTax;quote.shipping_price_id=priceId}
  else {line!.tax_lines=taxLines;line!.tax_minor=lineTax;line!.stripe_price_id=priceId}
  tax+=lineTax;sum+=totalLine
  if(shipping||line!.recurring)renewal+=totalLine
 }
 if(seen.size!==expected.length||sum!==total)fail("Stripe total requires reconciliation",409)
 quote.total_minor=total;quote.tax_minor=tax;quote.renewal_minor=quote.lines.some(l=>l.recurring)?renewal:0
 return quote
}
export async function checkoutTaxQuote(stripe:any,session:any,quote:Quote) {
 if(quote.stripe_tax_enabled&&session.automatic_tax?.status!=="complete")fail("Stripe tax calculation is not complete",409)
 const lines=await stripe.checkout.sessions.listLineItems(session.id,{limit:100,expand:["data.price.product"]})
 if(lines.has_more)fail("Checkout has too many lines",409)
 return applyStripeLines(quote,lines.data,session.amount_total)
}
export async function invoiceTaxQuote(stripe:any,invoice:any,quote:Quote) {
 if(quote.stripe_tax_enabled&&invoice.automatic_tax?.status!=="complete")fail("Stripe invoice tax is not complete",409)
 const lines=await stripe.invoices.listLineItems(invoice.id,{limit:100})
 if(lines.has_more)fail("Invoice has too many lines",409)
 const rates=new Map<string,any>()
 for(const line of lines.data)for(const tax of line.taxes||[]){
  const id=tax.tax_rate_details?.tax_rate
  if(!id)fail("Invoice tax rate is missing",409)
  if(!rates.has(id))rates.set(id,await stripe.taxRates.retrieve(id))
  tax.rate=rates.get(id)
 }
 return applyStripeLines(quote,lines.data,invoice.total,true)
}
