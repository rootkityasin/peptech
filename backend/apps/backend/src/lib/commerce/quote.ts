import {stripeContext} from "./stripe"
import {taxMinor,taxPolicy,stripeTaxDefaults} from "./tax"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import CommerceService, { recordId } from "../../modules/peptech-commerce/service"
import { assertEligibility, assertProduct, discounted, fail, toMinor } from "./policy"
export type QuoteLine={ variant_id:string; line_id:string; name:string; sku:string; quantity:number; recurring:boolean;
  tax_code?:string;tax_lines?:any[];tax_minor?:number;stripe_price_id?:string;base_minor:number; unit_minor:number; catalog_version:string; inventory:{id:string;quantity:number}[] }
export type Quote={ customer_id:string;email:string;address:any;billing_address?:any;delivery_collected?:boolean;currency:"gbp";lines:QuoteLine[];shipping_minor:number;
  total_minor:number;renewal_minor:number;region_id:string;sales_channel_id:string;location_id:string;shipping_option_id:string;
  stripe_tax_enabled?:boolean;stripe_tax_status?:string;shipping_tax_lines?:any[];shipping_tax_minor?:number;shipping_price_id?:string;default_tax_code?:string;tax_policy:string;policy_version:string;tax_rate:number;tax_inclusive:boolean;tax_minor:number;vat_registered:boolean;bank_instructions?:any }
export async function buildQuote(scope:any,ledger:CommerceService,customerId:string,input:any,attemptId:string):Promise<Quote> {
  input={...input,address:input.address||{country_code:input.country_code}}
  const settings=await ledger.get("commerce_settings")
  if (settings?.state!=="enabled") fail("Checkout is not enabled yet",503)
  const policy=settings.data
  if (!policy.destinations?.includes(input.address.country_code)) fail("Shipping is unavailable for this destination")
  const useStripe=policy.tax_policy==="stripe_default"
  const context=useStripe?stripeContext():null
  const defaults=context?await stripeTaxDefaults(context.stripe,context.mode):null
  const tax=defaults?{rate:0,inclusive:defaults.inclusive,registered:defaults.enabled}:taxPolicy(policy,input.address.country_code)
  const customer=await scope.resolve(Modules.CUSTOMER).retrieveCustomer(customerId)
  assertEligibility(customer)
  const query=scope.resolve(ContainerRegistrationKeys.QUERY)
  const items=new Map<string,any>()
  for (const item of input.items) {
    const key=`${item.variant_id}:${item.recurring}`
    if (items.has(key)) fail("Duplicate basket line")
    items.set(key,item)
  }
  const lines:QuoteLine[]=[]
  for (const item of items.values()) {
    const approval=await ledger.get(recordId("catalog",item.variant_id))
    assertProduct(approval,input.address.country_code,item.recurring)
    const {data:[variant]}=await query.graph({entity:"product_variant",fields:["id","sku","product.status","price_set.id",
      "manage_inventory","inventory_items.inventory_item_id","inventory_items.required_quantity"],filters:{id:item.variant_id}})
    if (!variant || variant.product?.status!=="published" || !variant.price_set?.id) fail("Product is unavailable",409)
    const prices=await scope.resolve(Modules.PRICING).calculatePrices({id:[variant.price_set.id]},
      {context:{currency_code:"gbp",region_id:policy.region_id,quantity:item.quantity}})
    if (prices[0]?.calculated_amount==null) fail("Product has no GBP price",409)
    const base=toMinor(prices[0].calculated_amount)
    if (base<=0) fail("Product price requires review",409)
    if (!variant.manage_inventory || !variant.inventory_items?.length) fail("Tracked inventory is required before sale",409)
    lines.push({variant_id:item.variant_id,line_id:recordId("ordli",attemptId,String(lines.length)),
      name:approval!.data.canonical_name,sku:approval!.data.canonical_sku,quantity:item.quantity,recurring:item.recurring,
      tax_code:approval!.data.tax_code||defaults?.code,base_minor:base,unit_minor:item.recurring?discounted(base):base,catalog_version:approval!.data.version,
      inventory:variant.inventory_items.map((i:any)=>({id:i.inventory_item_id,quantity:Number(i.required_quantity || 1)*item.quantity}))})
  }
  const recurring=lines.some(l=>l.recurring)
  if (recurring && !input.recurring_accepted) fail("Explicit recurring payment consent is required")
  const shipping=input.address.country_code==="gb"?495:1500
  const subtotal=lines.reduce((sum,l)=>sum+l.unit_minor*l.quantity,shipping)
  const taxTotal=lines.reduce((sum,l)=>sum+taxMinor(l.unit_minor*l.quantity,tax.rate,tax.inclusive),taxMinor(shipping,tax.rate,tax.inclusive))
  const recurringLines=lines.filter(l=>l.recurring)
  const recurringSubtotal=recurringLines.reduce((sum,l)=>sum+l.unit_minor*l.quantity,shipping)
  const recurringTax=recurringLines.reduce((sum,l)=>sum+taxMinor(l.unit_minor*l.quantity,tax.rate,tax.inclusive),taxMinor(shipping,tax.rate,tax.inclusive))
  return {customer_id:customerId,email:customer.email,address:input.address,currency:"gbp",lines,shipping_minor:shipping,
    total_minor:subtotal+(tax.inclusive?0:taxTotal),
    renewal_minor:recurring?recurringSubtotal+(tax.inclusive?0:recurringTax):0,
    region_id:policy.region_id,sales_channel_id:policy.sales_channel_id,location_id:policy.location_id,
    shipping_option_id:policy.shipping_option_id,tax_policy:policy.tax_policy,policy_version:policy.version,
    stripe_tax_enabled:defaults?.enabled,stripe_tax_status:defaults?.status,default_tax_code:defaults?.code,tax_rate:tax.rate,tax_inclusive:tax.inclusive,tax_minor:taxTotal,vat_registered:tax.registered}
}
export async function reserveQuote(scope:any,quote:Quote,reference:string) {
  const inventory=scope.resolve(Modules.INVENTORY)
  const existing=await inventory.listReservationItems({external_id:reference},{take:200})
  if (existing.length) return existing
  return inventory.createReservationItems(quote.lines.flatMap(line=>line.inventory.map(item=>({
    inventory_item_id:item.id,location_id:quote.location_id,line_item_id:line.line_id,quantity:item.quantity,
    allow_backorder:false,external_id:reference,metadata:{peptech_checkout:reference}}))))
}
export async function releaseQuote(scope:any,reference:string) {
  const inventory=scope.resolve(Modules.INVENTORY)
  const reservations=await inventory.listReservationItems({external_id:reference},{take:200})
  if(reservations.length) await inventory.deleteReservationItems(reservations.map((r:any)=>r.id))
}
