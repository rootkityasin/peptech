import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils"
import { createHmac,timingSafeEqual } from "node:crypto"
import Stripe from "stripe-checkout-sdk"
export function signReceipt(data:Record<string,any>,secret:string) {
  return createHmac("sha256",secret).update(JSON.stringify([data.profile,data.receipt_id,data.collection_id,
    data.amount_minor,data.currency,data.stripe_session_id||null,data.invoice_id||null,data.payment_intent_id||null])).digest("hex")
}
export default class StripeCheckoutProvider extends AbstractPaymentProvider {
  static identifier="peptech-checkout"
  private stripe:Stripe
  private secret:string
  private profile:string
  constructor(container:any,options:any) {
    super(container,options)
    this.secret=options.signingSecret||options.apiKey;this.profile=options.profile
    this.stripe=new Stripe(options.apiKey,{apiVersion:"2026-08-26.dahlia",maxNetworkRetries:2,timeout:15000})
  }
  private validate(data:any) {
    if(!data || data.profile!==this.profile || !data.collection_id || !data.receipt_id) throw new Error("Invalid receipt owner")
    const expected=Buffer.from(signReceipt(data,this.secret));const actual=Buffer.from(String(data.attestation||""))
    if(expected.length!==actual.length || !timingSafeEqual(expected,actual)) throw new Error("Receipt attestation failed")
    return data
  }
  private async paid(input:any) {
    const data=this.validate(input.data)
    if(data.payment_intent_id) {
      const pi=await this.stripe.paymentIntents.retrieve(data.payment_intent_id)
      if(pi.status!=="succeeded" || pi.amount_received!==data.amount_minor || pi.currency!==data.currency) throw new Error("Payment is not settled for the expected amount")
      return data
    }
    // Zero invoices can be valid but out-of-band/manual settlements never authorize fulfillment.
    if(data.invoice_id && data.amount_minor===0) {
      const invoice=await this.stripe.invoices.retrieve(data.invoice_id)
      if(invoice.status!=="paid" || invoice.total!==0 || invoice.amount_paid!==0) throw new Error("Invalid zero invoice")
      return data
    }
    throw new Error("Verified Stripe payment evidence is required")
  }
  async initiatePayment(input:any):Promise<any> {
    const data=await this.paid(input)
    if(Math.round(Number(input.amount?.value ?? input.amount)*100)!==data.amount_minor || input.currency_code!==data.currency) throw new Error("Collection amount differs from receipt")
    return {id:data.receipt_id,data}
  }
  async authorizePayment(input:any):Promise<any> { return {status:PaymentSessionStatus.AUTHORIZED,data:await this.paid(input)} }
  async capturePayment(input:any):Promise<any> { return {data:await this.paid(input)} }
  async getPaymentStatus(input:any):Promise<any> { await this.paid(input);return {status:PaymentSessionStatus.CAPTURED} }
  async retrievePayment(input:any):Promise<any> { return {data:this.validate(input.data)} }
  async updatePayment(input:any):Promise<any> { return this.initiatePayment(input) }
  async deletePayment(input:any):Promise<any> { return {data:this.validate(input.data)} }
  async cancelPayment(input:any):Promise<any> { throw new Error("Captured payments must be refunded, not canceled") }
  async refundPayment(input:any):Promise<any> {
    const data=this.validate(input.data)
    const approved=data.approved_refund
    const amount=Math.round(Number(input.amount?.value ?? input.amount)*100)
    if(!approved || amount!==approved.amount) throw new Error("Refund must use the audited commerce refund endpoint")
    const proof=createHmac("sha256",this.secret).update(JSON.stringify([data.receipt_id,approved.id,amount])).digest("hex")
    if(proof!==approved.attestation)throw new Error("Invalid refund approval")
    const refund=await this.stripe.refunds.retrieve(approved.id)
    if(refund.status!=="succeeded"||refund.amount!==amount||refund.payment_intent!==data.payment_intent_id)throw new Error("Refund settlement mismatch")
    return {data:{...data,last_refund_id:refund.id,approved_refund:null}}
  }

  async getWebhookActionAndData():Promise<any> { return {action:"not_supported"} }
}
