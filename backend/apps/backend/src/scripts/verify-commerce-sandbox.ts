import type {ExecArgs} from "@medusajs/framework/types"
import {Modules,ContainerRegistrationKeys} from "@medusajs/framework/utils"
import {createProductsWorkflow,createRegionsWorkflow} from "@medusajs/medusa/core-flows"
import {randomUUID} from "node:crypto"
import CommerceService,{recordId} from "../modules/peptech-commerce/service"
import {prepareCheckout} from "../lib/commerce/checkout"
import {listShippingOptions} from "../lib/commerce/shipping"
import {stripeContext} from "../lib/commerce/stripe"
import fs from "node:fs"
export default async function verify({container}:ExecArgs) {
  const url=new URL(process.env.DATABASE_URL!)
  if(url.hostname!=="127.0.0.1"||!url.pathname.endsWith("_test"))throw new Error("Isolated local test database required")
  const context=stripeContext();if(context.mode!=="test")throw new Error("Only sandbox credentials are allowed")
  const ledger=container.resolve("peptechCommerce") as CommerceService
  const query=container.resolve(ContainerRegistrationKeys.QUERY)
  const [channel]=await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({},{take:1})
  const [location]=await container.resolve(Modules.STOCK_LOCATION).listStockLocations({},{take:1})
  const [profile]=await container.resolve(Modules.FULFILLMENT).listShippingProfiles({},{take:1})
  let [region]=await container.resolve(Modules.REGION).listRegions({name:"PEPTECH sandbox UK"})
  if(!region) {
    const regions=await container.resolve(Modules.REGION).listRegions({},{relations:["countries"]})
    region=regions.find(r=>r.countries?.some(c=>c.iso_2==="gb"))!
    if(region) region=await container.resolve(Modules.REGION).updateRegions(region.id,{name:"PEPTECH sandbox UK",currency_code:"gbp"})
    else region=(await createRegionsWorkflow(container).run({input:{regions:[{name:"PEPTECH sandbox UK",currency_code:"gbp",countries:["gb"]}]}})).result[0]
  }
  const shippingOptions=await listShippingOptions(container,{location_id:location.id,region_id:region.id},"gb")
  if(!shippingOptions.length)throw new Error("No shipping option serves gb from the sandbox location")
  const shipping=shippingOptions[0]
  let [customer]=await container.resolve(Modules.CUSTOMER).listCustomers({email:"commerce-fixture@example.com"})
  if(!customer) customer=await container.resolve(Modules.CUSTOMER).createCustomers({email:"commerce-fixture@example.com",has_account:true,
    first_name:"Sandbox",last_name:"Researcher",metadata:{compliance_ack:true}})
  const productService=container.resolve(Modules.PRODUCT)
  let [product]=await productService.listProducts({handle:"sandbox-research-fixture"},{relations:["variants"]})
  if(!product) product=(await createProductsWorkflow(container).run({input:{products:[{title:"Sandbox research fixture",handle:"sandbox-research-fixture",status:"published",
    shipping_profile_id:profile.id,options:[{title:"Size",values:["Fixture"]}],sales_channels:[{id:channel.id}],
    variants:[{title:"Fixture",sku:"SANDBOX-FIXTURE-001",manage_inventory:true,options:{Size:"Fixture"},prices:[{currency_code:"gbp",amount:10}]}]}]}})).result[0]
  const variant=product.variants![0]
  const {data:[row]}=await query.graph({entity:"product_variant",fields:["id","inventory_items.inventory_item_id"],filters:{id:variant.id}})
  const inventory=container.resolve(Modules.INVENTORY)
  for(const item of row.inventory_items || []) {
    if(!item)continue
    const [level]=await inventory.listInventoryLevels({inventory_item_id:item.inventory_item_id,location_id:location.id})
    if(!level)await inventory.createInventoryLevels({inventory_item_id:item.inventory_item_id,location_id:location.id,stocked_quantity:1000})
  }
  const settings=await ledger.create({id:"commerce_settings",kind:"settings",profile:"settings",owner_id:null,state:"enabled",data:{
    destinations:["gb"],tax_policy:"stripe_default",tax_evidence_ref:"sandbox-fixture-only",version:"sandbox-v1",region_id:region.id,
    sales_channel_id:channel.id,location_id:location.id,shipping_option_id:shipping.id}})
  if(settings.data.tax_evidence_ref!=="sandbox-fixture-only")throw new Error("Refusing to overwrite non-fixture settings")
  settings.data.tax_policy="stripe_default";await ledger.save(settings)
  await ledger.create({id:recordId("catalog",variant.id),kind:"catalog",profile:"catalog",owner_id:null,state:"approved",data:{
    variant_id:variant.id,canonical_name:"Sandbox research fixture",canonical_sku:"SANDBOX-FIXTURE-001",format:"vial",
    evidence_ref:"sandbox-fixture-only",destinations:["gb"],version:"sandbox-v1"}})
  const input={revision:randomUUID(),country_code:"gb",shipping_option_id:shipping.id,
    items:[{variant_id:variant.id,quantity:1,recurring:false}],ruo_accepted:true,recurring_accepted:false}
  const session:any=await prepareCheckout(container,ledger,customer.id,input)
  const retry:any=await prepareCheckout(container,ledger,customer.id,input)
  if(session.attemptId!==retry.attemptId || !session.checkoutUrl || session.checkoutUrl!==retry.checkoutUrl)throw new Error("Checkout retry created a different session")
  const expectedTotal=(1000+shipping.amount_minor)/100
  if(session.total!==expectedTotal)throw new Error(`Unexpected authoritative total: ${session.total}, expected ${expectedTotal}`)
  fs.writeFileSync("/tmp/peptech-sandbox-fixture.json",JSON.stringify({customer_id:customer.id,variant_id:variant.id,input,session}),{mode:0o600})
  console.log(JSON.stringify({phase:"C",account:context.accountId,mode:context.mode,attempt:session.attemptId,total:session.total,retry:"same-session",fixture:"/tmp/peptech-sandbox-fixture.json"}))
}
