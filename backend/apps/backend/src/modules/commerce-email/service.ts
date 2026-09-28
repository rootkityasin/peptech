import {AbstractNotificationProviderService} from "@medusajs/framework/utils"
import type {ProviderSendNotificationDTO,ProviderSendNotificationResultsDTO} from "@medusajs/framework/types"
import {createHash} from "node:crypto"
export function emailContent(template:string,data:Record<string,any>,origin:string) {
  const account=`${origin.replace(/\/$/,"")}/account`
  if(template==="order-confirmed")return {subject:"PEPTECH order received",text:`Your payment is confirmed and order ${data.order_id} has been received. Dispatch will be confirmed separately.\n\nView your order: ${account}?tab=orders`}
  if(template==="subscription-renewal-reminder")return {subject:"Your PEPTECH subscription renews in three days",text:`Your next 28-day renewal is scheduled for ${new Date(data.renewal_at*1000).toISOString().slice(0,10)}. The authorised total is GBP ${(Number(data.total_minor)/100).toFixed(2)}, including delivery.\n\nManage, pause, skip or cancel future renewals: ${account}?tab=subscriptions`}
  if(template==="payment-recovery")return {subject:"Action needed for your PEPTECH payment",text:`Your payment needs attention. No shipment will be released until payment is confirmed.\n\nReview your invoices and payment method securely: ${account}?tab=payment`}
  if(template==="order-dispatched")return {subject:"Your PEPTECH order has been dispatched",text:`Your order ${data.order_id} has been handed to the carrier. Tracking reference: ${data.tracking_number}.\n\nView your order: ${account}?tab=orders`}
  throw new Error("Unknown commerce email template")
}
export default class CommerceEmail extends AbstractNotificationProviderService {
  static identifier="peptech-email"
  private transport:any
  private options:any
  constructor(container:any,options:any) {
    super();this.options=options
    if(!options.host||!options.from)throw new Error("SMTP host and sender are required")
    this.transport=require("nodemailer").createTransport({host:options.host,port:options.port||465,secure:(options.port||465)===465,
      requireTLS:true,auth:options.user?{user:options.user,pass:options.password}:undefined,
      connectionTimeout:10000,socketTimeout:15000,tls:{rejectUnauthorized:true}})
  }
  async send(notification:ProviderSendNotificationDTO):Promise<ProviderSendNotificationResultsDTO> {
    if(notification.channel!=="email")throw new Error("Only email is supported")
    const data=notification.data||{}
    const content=emailContent(notification.template,data,this.options.origin)
    const hash=createHash("sha256").update(String(data.idempotency_key)).digest("hex")
    const sent=await this.transport.sendMail({from:this.options.from,to:notification.to,...content,messageId:`<${hash}@peptech.bio>`})
    if(!sent.accepted?.length)throw new Error("Mail server did not accept the message")
    return {id:sent.messageId}
  }
}
