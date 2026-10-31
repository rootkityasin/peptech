import { sendContactInquiryEmails, INQUIRY_TYPE_LABELS, type ContactInquiryPayload } from "../../../lib/contact-email.ts"

export const dynamic = "force-dynamic"

// In-memory rate limiting maps with hard capacity bounds
const ipRateLimitMap = new Map<string, number[]>()
const emailRateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_IP_REQUESTS = 5
const MAX_EMAIL_REQUESTS = 3
const MAX_MAP_ENTRIES = 1000

function checkRateLimit(map: Map<string, number[]>, key: string, maxLimit: number): boolean {
  const now = Date.now()
  if (map.size > MAX_MAP_ENTRIES) {
    for (const [k, timestamps] of map.entries()) {
      if (!timestamps.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) {
        map.delete(k)
      }
    }
  }
  const timestamps = map.get(key) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  
  if (recent.length >= maxLimit) {
    map.set(key, recent)
    return false
  }
  
  recent.push(now)
  map.set(key, recent)
  return true
}

// Clean up old rate limit entries every 15 minutes
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of ipRateLimitMap.entries()) {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (recent.length === 0) ipRateLimitMap.delete(ip)
      else ipRateLimitMap.set(ip, recent)
    }
    for (const [email, timestamps] of emailRateLimitMap.entries()) {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (recent.length === 0) emailRateLimitMap.delete(email)
      else emailRateLimitMap.set(email, recent)
    }
  }, 15 * 60 * 1000)
  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref()
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1"

    if (!checkRateLimit(ipRateLimitMap, clientIp, MAX_IP_REQUESTS)) {
      return Response.json(
        {
          success: false,
          message: "Too many inquiries submitted from this connection. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return Response.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      )
    }

    // Bot honeypot check: If hidden field is filled, silently return a dummy success
    if (body._fax_verification || body.website_url) {
      console.warn("[PEPTECH CONTACT BOT DETECTED] Honeypot triggered from IP:", clientIp)
      return Response.json({
        success: true,
        ticketRef: `PEP-INQ-${Math.floor(10000 + Math.random() * 90000)}`,
        message: "Inquiry received.",
      })
    }

    const name = String(body.name || "").replace(/[\r\n]/g, " ").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const institution = String(body.institution || "").replace(/[\r\n]/g, " ").trim()
    const rawInquiryType = String(body.inquiryType || "order_support").trim()
    const validInquiryTypes = new Set(Object.keys(INQUIRY_TYPE_LABELS))
    if (!validInquiryTypes.has(rawInquiryType)) {
      return Response.json(
        { success: false, message: "Invalid scientific inquiry type selected." },
        { status: 400 }
      )
    }
    const inquiryType = rawInquiryType
    const referenceId = String(body.referenceId || "").replace(/[\r\n]/g, " ").trim()
    const message = String(body.message || "").trim()
    const ruoAgreement = Boolean(body.ruoAgreement)

    // Validation
    if (!name || name.length < 2 || name.length > 100) {
      return Response.json(
        { success: false, message: "Please provide a valid full name (2–100 characters)." },
        { status: 400 }
      )
    }

    if (!email || !isValidEmail(email) || email.length > 120) {
      return Response.json(
        { success: false, message: "Please enter a valid academic or work email address." },
        { status: 400 }
      )
    }

    if (!checkRateLimit(emailRateLimitMap, email, MAX_EMAIL_REQUESTS)) {
      return Response.json(
        {
          success: false,
          message: "Too many inquiries submitted for this email address. Please allow time for our response.",
        },
        { status: 429 }
      )
    }

    if (!message || message.length < 10 || message.length > 5000) {
      return Response.json(
        { success: false, message: "Please provide inquiry details (between 10 and 5,000 characters)." },
        { status: 400 }
      )
    }

    if (!ruoAgreement) {
      return Response.json(
        {
          success: false,
          message: "You must confirm the 18+ Research Use Only (RUO) laboratory compliance agreement.",
        },
        { status: 400 }
      )
    }

    // Generate unique inquiry ticket reference
    const ticketRef = `PEP-INQ-${Math.floor(10000 + Math.random() * 90000)}`

    const payload: ContactInquiryPayload = {
      name,
      email,
      institution: institution || undefined,
      inquiryType,
      referenceId: referenceId || undefined,
      message,
      ruoAgreement,
    }

    // Dispatch emails via SMTP
    const result = await sendContactInquiryEmails(payload, ticketRef)

    return Response.json({
      success: true,
      ticketRef: result.ticketRef,
      message: "Your inquiry has been logged and dispatched to laboratory support.",
      mocked: result.mocked,
    })
  } catch (error: any) {
    console.error("[PEPTECH CONTACT API ERROR]:", error?.message || error)
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your inquiry. Please email support@peptech.bio directly.",
      },
      { status: 500 }
    )
  }
}
