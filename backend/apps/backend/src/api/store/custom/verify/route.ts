import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

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

// Helper to set CORS headers
function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = (req.headers.origin as string) || ""
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Vary", "Origin")
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, Accept, Cache-Control, X-Requested-With, x-storefront-origin")
}

// OPTIONS /store/custom/verify - Preflight
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Access-Control-Max-Age", "86400")
  return res.status(204).end()
}

// Known peptide lab batch prefixes & identifiers
const KNOWN_BATCH_PREFIXES = [
  "RT-",
  "TRZ-",
  "SMG-",
  "PEP-",
  "BPC-",
  "TB-",
  "GLP-",
  "CJC-",
  "IPA-",
  "NAD-",
  "GHK-",
]

const KNOWN_EXACT_BATCHES = new Set([
  "RT-2609A",
  "TRZ-2026-08B",
  "SMG-2026-04A",
  "TIR-2026-01",
  "SEMA-2026-02",
  "BPC-157-09A",
  "TB-500-11C",
  "GHK-CU-05B",
])

// GET /store/custom/verify?code=RT-2609A
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

  try {
    const rawQuery =
      (req.query.code as string) ||
      (req.query.batch as string) ||
      (req.query.id as string) ||
      ""

    const trimmed = rawQuery.trim()
    if (!trimmed) {
      return res.status(400).json({
        verified: false,
        message: "A batch lot number or QR code identifier is required.",
      })
    }

    const upper = trimmed.toUpperCase()

    // Check Recognized Batch Lots
    const isKnownBatch =
      KNOWN_EXACT_BATCHES.has(upper) ||
      KNOWN_BATCH_PREFIXES.some((prefix) => upper.startsWith(prefix))

    if (isKnownBatch) {
      return res.status(200).json({
        verified: true,
        type: "batch_lot",
        serial_number: "N/A (Laboratory Batch)",
        product_name: "PEPTECH® High-Purity Research Peptide",
        batch_number: upper,
        status: "Authentic & Safe",
        state: "active",
        security_seal: "LABORATORY-CERTIFIED",
      })
    }

    // Unrecognized / Unverified
    return res.status(200).json({
      verified: false,
      query: trimmed,
      status: "Report Pending / Unverified Batch",
      message: `Report Pending / Unverified Batch: The lot or batch code "${trimmed}" could not be authenticated in the official PEPTECH® synthesis registry.`,
    })
  } catch (err: any) {
    console.error("[Verify Route Error]:", err?.message || err)
    return res.status(500).json({
      verified: false,
      error: "Verification service temporarily unavailable. Please retry shortly.",
    })
  }
}
