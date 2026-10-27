import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

/**
 * Meta Conversions API (CAPI) Server Route
 * Executes server-to-server conversion events directly from the Next.js server.
 * Provides 1:1 event_id deduplication against browser pixel events and bypasses ad-blockers.
 */

interface CapiRequestBody {
  event_name: string
  event_id: string
  event_source_url?: string
  user_data?: {
    email?: string | null
    phone?: string | null
    firstName?: string | null
    lastName?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
    fbp?: string | null
    fbc?: string | null
  }
  custom_data?: {
    currency?: string
    value?: number
    content_type?: string
    contents?: Array<{
      id: string
      quantity: number
      item_price?: number
    }>
    order_id?: string
    [key: string]: any
  }
  test_event_code?: string
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function hashField(value?: string | null, type: "email" | "phone" | "text" | "postal" = "text"): string | undefined {
  if (!value) return undefined
  let clean = value.trim()
  if (!clean) return undefined

  if (type === "email") {
    clean = clean.toLowerCase()
  } else if (type === "phone") {
    // Retain only digits (E.164 recommendation)
    clean = clean.replace(/[^0-9]/g, "")
  } else if (type === "postal") {
    clean = clean.toLowerCase().replace(/[\s-]/g, "")
  } else {
    clean = clean.toLowerCase()
  }

  if (!clean) return undefined
  return sha256(clean)
}

export async function POST(req: NextRequest) {
  try {
    const pixelId = process.env.META_PIXEL_ID
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN

    // If CAPI credentials are not configured yet, fail closed gracefully without erroring the client
    if (!pixelId || !accessToken) {
      return NextResponse.json(
        {
          success: true,
          status: "skipped_no_credentials",
          message: "Meta CAPI credentials not configured in environment variables.",
        },
        { status: 200 }
      )
    }

    const body: CapiRequestBody = await req.json()

    if (!body || !body.event_name || !body.event_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: event_name and event_id" },
        { status: 400 }
      )
    }

    // Extract client IP and user agent for Meta Advanced Matching
    const forwarded = req.headers.get("x-forwarded-for")
    const clientIp = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || undefined

    const userAgent = req.headers.get("user-agent") || undefined

    // Prepare hashed user data adhering to Meta Graph API specifications
    const uData = body.user_data || {}
    const hashedUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    }

    const hashedEmail = hashField(uData.email, "email")
    if (hashedEmail) hashedUserData.em = [hashedEmail]

    const hashedPhone = hashField(uData.phone, "phone")
    if (hashedPhone) hashedUserData.ph = [hashedPhone]

    const hashedFn = hashField(uData.firstName, "text")
    if (hashedFn) hashedUserData.fn = [hashedFn]

    const hashedLn = hashField(uData.lastName, "text")
    if (hashedLn) hashedUserData.ln = [hashedLn]

    const hashedCity = hashField(uData.city, "text")
    if (hashedCity) hashedUserData.ct = [hashedCity]

    const hashedZp = hashField(uData.postalCode, "postal")
    if (hashedZp) hashedUserData.zp = [hashedZp]

    const hashedCountry = hashField(uData.country || "gb", "text")
    if (hashedCountry) hashedUserData.country = [hashedCountry]

    if (uData.fbp) hashedUserData.fbp = uData.fbp
    if (uData.fbc) hashedUserData.fbc = uData.fbc

    const testCode = body.test_event_code || process.env.META_TEST_EVENT_CODE || undefined

    const metaPayload = {
      data: [
        {
          event_name: body.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.event_id,
          event_source_url: body.event_source_url || "https://peptech.bio",
          action_source: "website",
          user_data: hashedUserData,
          custom_data: body.custom_data || {},
        },
      ],
      ...(testCode ? { test_event_code: testCode } : {}),
    }

    const metaUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`

    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    })

    const metaResult = await metaResponse.json()

    if (!metaResponse.ok) {
      console.warn("[Meta CAPI Error]", metaResult?.error?.message || metaResponse.statusText)
      return NextResponse.json(
        {
          success: false,
          status: "meta_error",
          error: metaResult?.error?.message || "Failed to deliver event to Meta Graph API",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      status: "delivered",
      events_received: metaResult?.events_received || 1,
      fbtrace_id: metaResult?.fbtrace_id,
    })
  } catch (error: any) {
    console.error("[Meta CAPI Uncaught Error]", error?.message || error)
    return NextResponse.json(
      { success: false, error: "Internal server error processing CAPI event" },
      { status: 500 }
    )
  }
}

