import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {z} from "zod"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {getStripeConfig} from "../../../../lib/stripe-config"
import {fail} from "../../../../lib/commerce/policy"
const schema=z.object({enabled:z.boolean(),region_id:z.string().min(1),sales_channel_id:z.string().min(1),
  location_id:z.string().min(1),shipping_option_id:z.string().min(1),destinations:z.array(z.string().regex(/^[a-z]{2}$/)).min(1),
  tax_policy:z.literal("stripe_default").default("stripe_default"),tax_evidence_ref:z.string().default("Stripe Dashboard defaults"),version:z.string().min(1),
  stripe_scope_evidence_ref:z.string().optional(),vat_number:z.string().max(100).optional(),
  prices_include_vat:z.boolean().optional(),vat_rates:z.record(z.string().regex(/^[a-z]{2}$/),z.number().min(0).max(100)).optional(),
  bank_instructions:z.object({account_name:z.string().min(1),sort_code:z.string().regex(/^\d{2}-?\d{2}-?\d{2}$/),account_number:z.string().regex(/^\d{8}$/)}).optional()}).strict()
export async function GET(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{operator(req);return {settings:await commerce(req).get("commerce_settings")}})
}
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    const admin=operator(req);const input=schema.parse(req.body);const ledger=commerce(req)
    if(input.enabled&&getStripeConfig()?.mode==="live"&&!input.stripe_scope_evidence_ref)fail("Written Stripe scope evidence is required for live release",409)
    return ledger.locked("commerce_settings",async()=>{
      const record=await ledger.create({id:"commerce_settings",kind:"settings",profile:"settings",owner_id:null,state:"disabled",data:{}})
      record.state=input.enabled?"enabled":"disabled";record.data={...input,reviewer:admin}
      await ledger.audit(record.id,admin,"settings-change",record.data)
      return {settings:await ledger.save(record)}
    })
  })
}
