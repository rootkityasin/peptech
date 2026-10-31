import nodemailer from "nodemailer"

export interface ContactInquiryPayload {
  name: string
  email: string
  institution?: string
  inquiryType: string
  referenceId?: string
  message: string
  ruoAgreement: boolean
}

export interface ContactInquiryResult {
  success: boolean
  ticketRef: string
  dispatchedStaff: boolean
  dispatchedCustomer: boolean
  mocked?: boolean
  error?: string
}

export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  order_support: "Active Order & Delivery Status",
  coa_batch: "Certificate of Analysis (COA) / Batch Verification",
  institutional_po: "Institutional Purchase Order (Net-30 PO)",
  hardware_specs: "Reusable Pen Hardware & Cartridge Specs",
  bulk_trial: "Bulk Research Trial Procurement",
  other: "General Scientific Support",
}

function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function getSmtpConfig() {
  const host = (
    process.env.CONTACT_SMTP_HOST ||
    process.env.STRIPE_EMAIL_HOST ||
    process.env.SMTP_HOST ||
    ""
  ).trim()

  const port = Number(
    process.env.CONTACT_SMTP_PORT ||
    process.env.STRIPE_EMAIL_PORT ||
    process.env.SMTP_PORT ||
    "465"
  )

  const user = (
    process.env.CONTACT_SMTP_USER ||
    process.env.STRIPE_EMAIL_USER ||
    process.env.SMTP_USER ||
    ""
  ).trim()

  const pass = (
    process.env.CONTACT_SMTP_PASSWORD ||
    process.env.STRIPE_EMAIL_PASSWORD ||
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    ""
  ).trim()

  const from = (
    process.env.CONTACT_SMTP_FROM ||
    process.env.STRIPE_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    '"PEPTECH Research" <notifications@peptech.bio>'
  ).trim()

  const supportEmail = (
    process.env.CONTACT_SUPPORT_EMAIL ||
    process.env.SUPPORT_EMAIL ||
    "support@peptech.bio"
  ).trim()

  return { host, port, user, pass, from, supportEmail }
}

/**
 * Builds HTML template for staff alert email sent to support@peptech.bio
 */
export function buildStaffNotificationEmail(payload: ContactInquiryPayload, ticketRef: string) {
  const categoryLabel = INQUIRY_TYPE_LABELS[payload.inquiryType] || payload.inquiryType
  const timestamp = new Date().toUTCString()
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br>")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Laboratory Inquiry: ${escapeHtml(ticketRef)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1f3a;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Top Header -->
    <div style="background-color: #0b1f3a; padding: 22px 28px; border-bottom: 3px solid #16a6a3;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px;">PEPTECH<span style="font-size: 12px; vertical-align: top;">®</span></div>
            <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">Laboratory Support Desk</div>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <span style="display: inline-block; background-color: #16a6a3; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
              New Inquiry
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #e2e8f0; pb: 14px;">
        <h1 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #0b1f3a;">
          Inquiry: ${escapeHtml(ticketRef)}
        </h1>
        <div style="font-size: 12px; color: #64748b;">${escapeHtml(timestamp)}</div>
      </div>

      <!-- Category Pill -->
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #e6fffa; border: 1px solid #16a6a3; color: #0b1f3a; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px;">
          🏷️ Category: ${escapeHtml(categoryLabel)}
        </span>
      </div>

      <!-- Researcher Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748b; width: 140px; border-bottom: 1px solid #e2e8f0;">Researcher:</td>
          <td style="padding: 10px 14px; font-weight: 700; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(payload.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Direct Email:</td>
          <td style="padding: 10px 14px; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">
            <a href="mailto:${escapeHtml(payload.email)}" style="color: #16a6a3; text-decoration: none; font-weight: 600;">${escapeHtml(payload.email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Institution / Lab:</td>
          <td style="padding: 10px 14px; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(payload.institution || "Not specified")}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Order / Batch ID:</td>
          <td style="padding: 10px 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">
            ${escapeHtml(payload.referenceId || "None specified")}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748b;">RUO Compliance:</td>
          <td style="padding: 10px 14px; color: #16a6a3; font-weight: 600;">
            ✓ Confirmed 18+ Laboratory RUO Research Policy
          </td>
        </tr>
      </table>

      <!-- Message Details -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px;">
          Inquiry Message Details:
        </div>
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #16a6a3; border-radius: 6px; padding: 16px; font-size: 13.5px; line-height: 1.6; color: #1e293b;">
          ${safeMessage}
        </div>
      </div>

      <!-- Action Footer -->
      <div style="text-align: center; margin: 24px 0 16px 0;">
        <a href="mailto:${escapeHtml(payload.email)}?subject=Re:%20[PEPTECH%20${escapeHtml(ticketRef)}]%20${encodeURIComponent(categoryLabel)}" style="display: inline-block; background-color: #0b1f3a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
          Reply to Researcher (${escapeHtml(payload.email)})
        </a>
      </div>

      <!-- Footer Note -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
        PEPTECH® Research Support Gateway · Internal Automated Dispatch
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = [
    `[PEPTECH] New Laboratory Inquiry - ${ticketRef}`,
    `Category: ${categoryLabel}`,
    `Timestamp: ${timestamp}`,
    ``,
    `Researcher: ${payload.name}`,
    `Email: ${payload.email}`,
    `Institution: ${payload.institution || "Not specified"}`,
    `Order / Batch Reference: ${payload.referenceId || "None"}`,
    `RUO Policy Acknowledged: Yes`,
    ``,
    `Message:`,
    payload.message,
    ``,
    `To reply, respond directly to this email or write to ${payload.email}.`,
  ].join("\n")

  return { html, text }
}

/**
 * Builds HTML template for customer confirmation auto-responder
 */
export function buildCustomerConfirmationEmail(payload: ContactInquiryPayload, ticketRef: string) {
  const categoryLabel = INQUIRY_TYPE_LABELS[payload.inquiryType] || payload.inquiryType
  const trimmed = payload.name.trim()
  const greetingName = /^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)/i.test(trimmed)
    ? trimmed
    : trimmed.split(" ")[0] || "Researcher"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Inquiry Received: ${escapeHtml(ticketRef)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1f3a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Top Header -->
    <div style="background-color: #0b1f3a; padding: 22px 28px; border-bottom: 3px solid #16a6a3;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px;">PEPTECH<span style="font-size: 12px; vertical-align: top;">®</span></div>
            <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">Quality. Safety. Precision.</div>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <span style="color: #00c5a0; font-size: 12px; font-weight: 600;">Inquiry Logged</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Body -->
    <div style="padding: 28px;">
      <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0b1f3a;">
        Laboratory Inquiry Received
      </h1>

      <div style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; font-weight: 700; color: #0b1f3a; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 14px; margin-bottom: 20px;">
        Reference: ${escapeHtml(ticketRef)}
      </div>

      <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #334155;">
        Dear ${escapeHtml(greetingName)},
      </p>

      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for contacting PEPTECH Laboratory Support. Your inquiry has been formally logged and assigned to a scientific support coordinator.
      </p>

      <!-- SLA Box -->
      <div style="background: #e6fffa; border: 1px solid #16a6a3; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px;">
        <div style="font-weight: 700; color: #0b1f3a; font-size: 12.5px; margin-bottom: 4px;">
          ⏱️ Average Response SLA: Under 2 Hours
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.5;">
          Our laboratory support coordinators review inquiries Monday through Friday, 08:00 – 18:00 GMT. We will respond directly to <strong>${escapeHtml(payload.email)}</strong>.
        </div>
      </div>

      <!-- Submission Summary Table -->
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.8px; margin-bottom: 8px;">
        Your Submission Summary:
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 12px; color: #64748b; width: 130px; border-bottom: 1px solid #e2e8f0;">Category:</td>
          <td style="padding: 8px 12px; font-weight: 600; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(categoryLabel)}</td>
        </tr>
        ${payload.institution ? `
        <tr>
          <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Institution:</td>
          <td style="padding: 8px 12px; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(payload.institution)}</td>
        </tr>` : ""}
        ${payload.referenceId ? `
        <tr>
          <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Reference / Batch:</td>
          <td style="padding: 8px 12px; font-family: monospace; font-weight: 600; color: #0b1f3a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(payload.referenceId)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px 12px; color: #64748b;">Status:</td>
          <td style="padding: 8px 12px; font-weight: 700; color: #00c5a0;">Queued in Laboratory Support</td>
        </tr>
      </table>

      <!-- Useful Links -->
      <div style="margin-bottom: 24px; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #64748b; line-height: 1.6;">
        <strong>Need immediate assistance?</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 20px;">
          <li>Verify batch reports &amp; COA online: <a href="https://peptech.bio/verify" style="color: #16a6a3; text-decoration: none;">peptech.bio/verify</a></li>
          <li>Track ongoing parcels: <a href="https://peptech.bio/account?tab=orders" style="color: #16a6a3; text-decoration: none;">peptech.bio/account</a></li>
          <li>For institutional Net-30 purchase orders: send formal PO documents directly to <a href="mailto:support@peptech.bio" style="color: #16a6a3; text-decoration: none;">support@peptech.bio</a></li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">PEPTECH® · Quality. Safety. Precision.</p>
        <p style="margin: 0 0 4px 0;">PEPTECH LTD · Office 17 Ips Innovate, Chartermark Way, Colburn Business Park, DL9 4QJ, UK</p>
        <p style="margin: 0;">In-Vitro Scientific &amp; Laboratory Research Peptide Logistics · <a href="mailto:support@peptech.bio" style="color: #16a6a3; text-decoration: none;">support@peptech.bio</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = [
    `PEPTECH Laboratory Inquiry Received - ${ticketRef}`,
    ``,
    `Dear ${greetingName},`,
    ``,
    `Thank you for contacting PEPTECH Laboratory Support. Your inquiry has been formally logged under reference ${ticketRef}.`,
    ``,
    `Our scientific support team reviews inquiries Monday through Friday, 08:00 – 18:00 GMT with an average response time of under 2 hours.`,
    ``,
    `Submission Summary:`,
    `- Reference: ${ticketRef}`,
    `- Category: ${categoryLabel}`,
    `- Institution: ${payload.institution || "Not specified"}`,
    `- Order / Batch Reference: ${payload.referenceId || "None"}`,
    ``,
    `If you need to provide additional details, simply reply directly to this email.`,
    ``,
    `PEPTECH® · Quality. Safety. Precision.`,
    `Laboratory Support: support@peptech.bio`,
  ].join("\n")

  return { html, text }
}

/**
 * Sends both internal staff alert and customer confirmation emails via SMTP.
 * If SMTP credentials are missing, cleanly logs and returns a mock success.
 */
export async function sendContactInquiryEmails(
  payload: ContactInquiryPayload,
  ticketRef: string
): Promise<ContactInquiryResult> {
  const config = getSmtpConfig()

  // Guard: If SMTP host is not configured (e.g. dev/test mode)
  if (!config.host) {
    console.info(`[PEPTECH SMTP MOCK] No SMTP host configured. Simulating dispatch for ${ticketRef}:`, {
      from: config.from,
      toSupport: config.supportEmail,
      toCustomer: payload.email,
      inquiryType: payload.inquiryType,
    })
    return {
      success: true,
      ticketRef,
      dispatchedStaff: false,
      dispatchedCustomer: false,
      mocked: true,
    }
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    connectionTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  })

  const safeName = (payload.name || "Customer").replace(/[\r\n]/g, " ").trim()
  const safeTicket = ticketRef.replace(/[\r\n]/g, "").trim()
  const categoryLabel = (INQUIRY_TYPE_LABELS[payload.inquiryType] || "General Scientific Support").replace(/[\r\n]/g, " ").trim()
  const staffEmail = buildStaffNotificationEmail(payload, ticketRef)
  const customerEmail = buildCustomerConfirmationEmail(payload, ticketRef)

  let dispatchedStaff = false
  let dispatchedCustomer = false
  const errors: string[] = []

  // 1. Send Staff Notification
  try {
    const staffRes = await transporter.sendMail({
      from: config.from,
      to: config.supportEmail,
      replyTo: payload.email,
      subject: `[PEPTECH Inquiry] ${categoryLabel} - Ref: ${safeTicket} (${safeName})`,
      text: staffEmail.text,
      html: staffEmail.html,
    })
    dispatchedStaff = Boolean(staffRes.accepted?.length)
  } catch (err: any) {
    console.error(`[PEPTECH SMTP ERROR] Failed to send staff alert for ${ticketRef}:`, err?.message || err)
    errors.push(`Staff alert failed: ${err?.message || "Unknown error"}`)
  }

  // 2. Send Customer Confirmation Auto-responder
  try {
    const customerRes = await transporter.sendMail({
      from: config.from,
      to: payload.email,
      replyTo: config.supportEmail,
      subject: `Inquiry Logged: ${ticketRef} - PEPTECH Laboratory Support`,
      text: customerEmail.text,
      html: customerEmail.html,
    })
    dispatchedCustomer = Boolean(customerRes.accepted?.length)
  } catch (err: any) {
    console.error(`[PEPTECH SMTP ERROR] Failed to send customer receipt for ${ticketRef}:`, err?.message || err)
    errors.push(`Customer receipt failed: ${err?.message || "Unknown error"}`)
  }

  const success = dispatchedStaff || dispatchedCustomer || errors.length === 0

  return {
    success,
    ticketRef,
    dispatchedStaff,
    dispatchedCustomer,
    mocked: false,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  }
}
