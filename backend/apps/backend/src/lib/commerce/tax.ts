import {fail} from "./policy"
export async function stripeTaxDefaults(stripe:any,mode:string) {
 const [settings,registrations]=await Promise.all([stripe.tax.settings.retrieve(),stripe.tax.registrations.list({status:"active",limit:100})])
 const ready=settings.status==="active"&&!!settings.defaults.tax_code&&!!settings.defaults.tax_behavior&&registrations.data.length>0
 if(!ready&&mode==="live")fail("Complete Stripe Tax settings and active registrations before live checkout",503)
 return {enabled:ready,code:settings.defaults.tax_code||undefined,
  inclusive:settings.defaults.tax_behavior==="inclusive"||settings.defaults.tax_behavior==="inferred_by_currency",
  status:ready?"ready":"sandbox_unconfigured"}
}
// Rates are basis points (20% = 2000). Integer half-up rounding is applied to
// each extended line, matching Stripe's per-line invoice tax calculation.
export function taxMinor(amount:number,rate:number,inclusive:boolean):number {
 if(!Number.isSafeInteger(amount)||amount<0||!Number.isFinite(rate)||rate<0||rate>100||Math.abs(rate*100-Math.round(rate*100))>1e-8)fail("Invalid tax inputs")
 const basis=Math.round(rate*100)
 const denominator=BigInt(inclusive?10000+basis:10000)
 return Number((BigInt(amount)*BigInt(basis)+denominator/2n)/denominator)
}
export function taxPolicy(policy:any,country:string) {
 if(!policy.tax_evidence_ref)fail("Save the reviewed VAT policy in admin before accepting payment",503)
 if(policy.tax_policy==="not_registered")return {rate:0,inclusive:false,registered:false}
 if(policy.tax_policy!=="manual_vat"||!policy.vat_number||typeof policy.prices_include_vat!=="boolean")fail("VAT registration and price treatment need configuration",503)
 const rate=policy.vat_rates?.[country]
 if(typeof rate!=="number"||!Number.isFinite(rate)||rate<0||rate>100||Math.abs(rate*100-Math.round(rate*100))>1e-8)fail("No reviewed VAT rate is configured for this destination",409)
 return {rate,inclusive:policy.prices_include_vat,registered:true}
}
