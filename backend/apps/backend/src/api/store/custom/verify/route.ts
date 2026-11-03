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

// Known peptide lab batch exact identifiers
const VERIFIED_EXACT_BATCHES = new Set([
  "PT-26-000184",
])

const PENDING_BATCHES = new Set<string>()

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

    // 1. Check Pending Batch Lots
    if (PENDING_BATCHES.has(upper)) {
      return res.status(200).json({
        verified: false,
        pending: true,
        type: "batch_lot",
        product_name: "PEPTECH® High-Purity Research Peptide",
        batch_number: upper,
        status: "Laboratory Testing Active / Report Pending",
        message: `Synthesis complete for batch ${upper}; independent HPLC/MS analytical report is currently pending.`,
      })
    }

    // 2. Check Verified Batch Lots
    if (VERIFIED_EXACT_BATCHES.has(upper)) {
      return res.status(200).json({
        verified: true,
        pending: false,
        type: "batch_lot",
        serial_number: upper === "PT-26-000184" ? "PT-26-000184" : upper,
        product_name: "PEPTECH® High-Purity Research Peptide",
        batch_number: upper,
        status: "Authentic & Safe",
        state: "active",
        security_seal: "LABORATORY-CERTIFIED",
      })
    }

    // 3. Unrecognized / Unverified -> 404
    return res.status(404).json({
      verified: false,
      pending: false,
      query: trimmed,
      status: "Unverified Batch",
      message: `Batch code "${trimmed}" not found or unverified in the authentic PEPTECH® synthesis registry.`,
    })
  } catch (err: any) {
    console.error("[Verify Route Error]:", err?.message || err)
    return res.status(500).json({
      verified: false,
      error: "Verification service temporarily unavailable. Please retry shortly.",
    })
  }
}
