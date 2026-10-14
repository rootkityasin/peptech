import {AbstractNotificationProviderService} from "@medusajs/framework/utils"
import type {ProviderSendNotificationDTO,ProviderSendNotificationResultsDTO} from "@medusajs/framework/types"
import {createHash} from "node:crypto"
import { generateReceiptPdfBuffer } from "../../lib/commerce/receipt-pdf"

function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function emailContent(template: string, data: Record<string, any>, origin: string) {
  const account = `${origin.replace(/\/$/, "")}/account`
  
  if (template === "order-confirmed") {
    const orderId = String(data.order_id || "PEPTECH-ORDER")
    const customerName = (data.customer_name || "").trim() || "Researcher"
    const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : []
    const subtotal = data.subtotal !== undefined ? Number(data.subtotal).toFixed(2) : (items.length ? items.reduce((s: number, i: any) => s + Number(i.total || 0), 0).toFixed(2) : "195.00")
    const shipping = data.shipping !== undefined ? Number(data.shipping) : 0
    const shippingName = data.shipping_name || "Royal Mail Tracked 24"
    const total = data.total !== undefined ? Number(data.total).toFixed(2) : (Number(subtotal) + shipping).toFixed(2)
    const currency = data.currency || "GBP"

    const itemsText = items.length
      ? items.map((it: any) => `- ${it.title} (x${it.quantity}) - ${currency} ${it.total}`).join("\n")
      : `- PEPTECH Laboratory Order - ${currency} ${total}`

    const plainText = [
      `PEPTECH order received`,
      `Order ID: ${orderId}`,
      ``,
      `Dear ${customerName},`,
      ``,
      `Thank you for your order with PEPTECH. Your payment has been confirmed, and your order has been received for cold-chain packing and dispatch. A dispatch confirmation with tracking reference will be sent once handed to the carrier.`,
      ``,
      `Order Summary:`,
      itemsText,
      `Subtotal: ${currency} ${subtotal}`,
      `${shippingName}: ${shipping === 0 ? "FREE" : `${currency} ${shipping.toFixed(2)}`}`,
      `Total Paid in Full: ${currency} ${total}`,
      ``,
      `View your order in your laboratory account: ${account}?tab=orders`,
      ``,
      `Your official PDF receipt is attached to this email for your records.`,
      ``,
      `PEPTECH® · Quality. Safety. Precision.`,
      `Laboratory Support: support@peptech.bio`,
    ].join("\n")

    const itemsRowsHtml = items.length
      ? items
          .map(
            (it: any) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 10px; color: #0b1f3a; font-weight: 500; font-size: 13px;">${escapeHtml(it.title)}</td>
          <td style="padding: 12px 10px; text-align: center; color: #334155; font-size: 13px;">${escapeHtml(it.quantity)}</td>
          <td style="padding: 12px 10px; text-align: right; color: #334155; font-family: monospace; font-size: 13px;">£${escapeHtml(it.unit_price)}</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: 600; color: #0b1f3a; font-family: monospace; font-size: 13px;">£${escapeHtml(it.total)}</td>
        </tr>`
          )
          .join("")
      : `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 10px; color: #0b1f3a; font-weight: 500; font-size: 13px;">PEPTECH Laboratory Order</td>
          <td style="padding: 12px 10px; text-align: center; color: #334155; font-size: 13px;">1</td>
          <td style="padding: 12px 10px; text-align: right; color: #334155; font-family: monospace; font-size: 13px;">£${escapeHtml(subtotal)}</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: 600; color: #0b1f3a; font-family: monospace; font-size: 13px;">£${escapeHtml(subtotal)}</td>
        </tr>`

    let destinationHtml = ""
    if (data.shipping_address) {
      const a = data.shipping_address
      const addrLines = [
        [a.first_name, a.last_name].filter(Boolean).join(" ") || customerName,
        a.company,
        a.address_1,
        a.address_2,
        [a.city, a.province, a.postal_code].filter(Boolean).join(", "),
        a.country_code ? String(a.country_code).toUpperCase() : "UNITED KINGDOM",
      ].filter(Boolean)
      if (addrLines.length > 0) {
        destinationHtml = `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; font-size: 13px; color: #334155;">
            <div style="font-weight: 600; color: #0b1f3a; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Destination</div>
            <div>${addrLines.map((l: string) => escapeHtml(l)).join("<br>")}</div>
          </div>
        `
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PEPTECH order received</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1f3a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    
    <!-- Top Header -->
    <div style="background-color: #0b1f3a; padding: 22px 28px; border-bottom: 3px solid #16a6a3;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px;">PEPTECH<span style="font-size: 12px; vertical-align: top;">®</span></div>
            <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">Quality. Safety. Precision.</div>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <span style="color: #00c5a0; font-size: 12px; font-weight: 600;">Payment Confirmed</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Body -->
    <div style="padding: 28px;">
      <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0b1f3a;">PEPTECH order received</h1>
      
      <div style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; font-weight: 600; color: #0b1f3a; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 20px; word-break: break-all;">
        Order ID: ${escapeHtml(orderId)}
      </div>

      <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #334155;">Dear ${escapeHtml(customerName)},</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for your order with PEPTECH. Your payment has been confirmed, and your order has been received for cold-chain packing and dispatch. A dispatch notification with Royal Mail tracking will be sent once your parcel is on its way.
      </p>

      <!-- Products & Pricing Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 10px;">Item Description</th>
            <th style="padding: 8px 10px; text-align: center;">Qty</th>
            <th style="padding: 8px 10px; text-align: right;">Unit Price</th>
            <th style="padding: 8px 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px 10px 4px 10px; text-align: right; color: #64748b; font-size: 13px;">Subtotal:</td>
            <td style="padding: 10px 10px 4px 10px; text-align: right; font-family: monospace; color: #0b1f3a; font-size: 13px;">£${escapeHtml(subtotal)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 4px 10px; text-align: right; color: #64748b; font-size: 13px;">${escapeHtml(shippingName)}:</td>
            <td style="padding: 4px 10px; text-align: right; font-family: monospace; color: #0b1f3a; font-size: 13px;">${shipping === 0 ? "FREE" : `£${shipping.toFixed(2)}`}</td>
          </tr>
          <tr style="border-top: 2px solid #0b1f3a;">
            <td colspan="3" style="padding: 12px 10px; text-align: right; font-weight: 700; color: #0b1f3a; font-size: 14px;">Total Paid in Full:</td>
            <td style="padding: 12px 10px; text-align: right; font-weight: 700; font-family: monospace; color: #0b1f3a; font-size: 16px;">£${escapeHtml(total)}</td>
          </tr>
        </tfoot>
      </table>

      ${destinationHtml}

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0 20px 0;">
        <a href="${account}?tab=orders" style="display: inline-block; background-color: #0b1f3a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 26px; border-radius: 8px;">
          View Order in Laboratory Portal
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0 0 20px 0;">
        An official PDF receipt is attached to this email for your records.
      </p>

      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">PEPTECH® · Quality. Safety. Precision.</p>
        <p style="margin: 0;">In-Vitro Scientific &amp; Laboratory Research Peptide Logistics · <a href="mailto:support@peptech.bio" style="color: #16a6a3; text-decoration: none;">support@peptech.bio</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()

    const pdfBuffer = generateReceiptPdfBuffer({
      orderId,
      date: data.date,
      customerName,
      customerEmail: data.to,
      shippingAddress: data.shipping_address,
      items,
      subtotal,
      shipping,
      shippingName,
      total,
      currency,
    })

    return {
      subject: "PEPTECH order received",
      text: plainText,
      html,
      attachments: [
        {
          filename: `PEPTECH-Receipt-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }
  }
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
