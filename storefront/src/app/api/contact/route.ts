import { sendContactInquiryEmails, type ContactInquiryPayload } from "../../../lib/contact-email.ts"

export const dynamic = "force-dynamic"

// In-memory rate limiting map: ip -> array of request timestamps
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent)
    return true
  }
  
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

// Clean up old rate limit entries every 15 minutes
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of rateLimitMap.entries()) {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (recent.length === 0) {
        rateLimitMap.delete(ip)
      } else {
        rateLimitMap.set(ip, recent)
      }
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
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1"

    if (isRateLimited(clientIp)) {
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

    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const institution = String(body.institution || "").trim()
    const inquiryType = String(body.inquiryType || "order_support").trim()
    const referenceId = String(body.referenceId || "").trim()
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
