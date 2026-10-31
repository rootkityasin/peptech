import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
const nodemailer = require("nodemailer")

const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/,
  /^https:\/\/(?:[a-zA-Z0-9-]+\.)*peptech\.bio$/,
  /^https:\/\/docs\.medusajs\.com$/,
]

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false
  const configuredCors = process.env.STORE_CORS || ""
  if (configuredCors) {
    const list = configuredCors.split(",").map((s) => s.trim()).filter(Boolean)
    if (list.includes(origin)) return true
    for (const item of list) {
      if (item.startsWith("/") && item.endsWith("/")) {
        try {
          const regex = new RegExp(item.slice(1, -1))
          if (regex.test(origin)) return true
        } catch {}
      }
    }
  }
  return DEFAULT_ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
}

function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = (req.headers.origin as string) || ""
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Vary", "Origin")
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-publishable-api-key, Accept, Cache-Control, X-Requested-With, x-storefront-origin"
  )
}

const ipLimitMap = new Map<string, { count: number; resetAt: number }>()
const emailLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_RATE_LIMIT_ENTRIES = 1000

function checkRate(map: Map<string, { count: number; resetAt: number }>, key: string, maxCount: number, windowMs: number): boolean {
  const now = Date.now()
  if (map.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, v] of map.entries()) {
      if (v.resetAt < now) map.delete(k)
    }
  }
  const entry = map.get(key)
  if (!entry || entry.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxCount) {
    return false
  }
  entry.count++
  return true
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Access-Control-Max-Age", "86400")
  return res.status(204).end()
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

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  order_support: "Active Order & Delivery Status",
  coa_batch: "Certificate of Analysis (COA) / Batch Verification",
  institutional_po: "Institutional Purchase Order (Net-30 PO)",
  hardware_specs: "Reusable Pen Hardware & Cartridge Specs",
  bulk_trial: "Bulk Research Trial Procurement",
  other: "General Scientific Support",
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-store")

  try {
    const body = (req.body as any) || {}

    const cfIp = req.headers["cf-connecting-ip"] as string | undefined
    const realIp = req.headers["x-real-ip"] as string | undefined
    const forwarded = req.headers["x-forwarded-for"] as string | undefined
    const clientIp = cfIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : "unknown")

    if (!checkRate(ipLimitMap, clientIp, 5, 3600000)) {
      return res.status(429).json({ message: "Too many contact submissions from this connection. Please try again later." })
    }

    const email = String(body.email || "").trim().toLowerCase()
    if (email && !checkRate(emailLimitMap, email, 3, 3600000)) {
      return res.status(429).json({ message: "Too many inquiries for this email address. Please try again later." })
    }

    // Honeypot check
    if (body._fax_verification || body.website_url) {
      return res.status(200).json({
        success: true,
        ticketRef: `PEP-INQ-${Math.floor(10000 + Math.random() * 90000)}`,
        message: "Inquiry received.",
      })
    }

    const name = String(body.name || "").replace(/[\r\n]/g, " ").trim()
    const institution = String(body.institution || "").replace(/[\r\n]/g, " ").trim()
    const rawInquiry = String(body.inquiryType || "order_support").trim()
    const inquiryType = INQUIRY_TYPE_LABELS[rawInquiry] ? rawInquiry : "other"
    const referenceId = String(body.referenceId || "").replace(/[\r\n]/g, " ").trim()
    const message = String(body.message || "").trim()
    const ruoAgreement = Boolean(body.ruoAgreement)

    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: "Valid name required (2–100 chars)." })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email address required." })
    }

    if (!message || message.length < 10 || message.length > 5000) {
      return res.status(400).json({ success: false, message: "Inquiry message must be 10–5000 characters." })
    }

    if (!ruoAgreement) {
      return res.status(400).json({ success: false, message: "RUO compliance agreement required." })
    }

    const ticketRef = `PEP-INQ-${Math.floor(10000 + Math.random() * 90000)}`
    const categoryLabel = INQUIRY_TYPE_LABELS[inquiryType] || inquiryType

    const host = (process.env.CONTACT_SMTP_HOST || process.env.STRIPE_EMAIL_HOST || process.env.SMTP_HOST || "").trim()
    const port = Number(process.env.CONTACT_SMTP_PORT || process.env.STRIPE_EMAIL_PORT || process.env.SMTP_PORT || "465")
    const user = (process.env.CONTACT_SMTP_USER || process.env.STRIPE_EMAIL_USER || process.env.SMTP_USER || "").trim()
    const pass = (process.env.CONTACT_SMTP_PASSWORD || process.env.STRIPE_EMAIL_PASSWORD || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "").trim()
    const from = (process.env.CONTACT_SMTP_FROM || process.env.STRIPE_EMAIL_FROM || process.env.SMTP_FROM || '"PEPTECH Research" <notifications@peptech.bio>').trim()
    const supportEmail = (process.env.CONTACT_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || "support@peptech.bio").trim()

    if (!host) {
      console.info(`[PEPTECH MEDUSA CONTACT MOCK] No SMTP host configured. Simulating dispatch for ${ticketRef}.`)
      return res.status(200).json({
        success: true,
        ticketRef,
        message: "Inquiry logged (SMTP simulated in development).",
        mocked: true,
      })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 10000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    })

    // 1. Staff Email
    await transporter.sendMail({
      from,
      to: supportEmail,
      replyTo: email,
      subject: `[PEPTECH Inquiry] ${categoryLabel} - Ref: ${ticketRef} (${name})`,
      text: `Inquiry ${ticketRef}\nResearcher: ${name} (${email})\nInstitution: ${institution || "N/A"}\nCategory: ${categoryLabel}\nRef: ${referenceId || "None"}\n\nMessage:\n${message}`,
    })

    // 2. Customer Email
    await transporter.sendMail({
      from,
      to: email,
      replyTo: supportEmail,
      subject: `Inquiry Logged: ${ticketRef} - PEPTECH Laboratory Support`,
      text: `Dear Researcher,\n\nYour inquiry has been logged under reference ${ticketRef}. Average response time: < 2 hours.\n\nPEPTECH Laboratory Support`,
    })

    return res.status(200).json({
      success: true,
      ticketRef,
      message: "Inquiry dispatched successfully via SMTP.",
    })
  } catch (err: any) {
    console.error("[PEPTECH MEDUSA CONTACT ROUTE ERROR]:", err)
    return res.status(500).json({
      success: false,
      message: "Failed to dispatch laboratory inquiry.",
    })
  }
}
