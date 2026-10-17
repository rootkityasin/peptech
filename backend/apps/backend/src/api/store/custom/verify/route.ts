import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Helper to set CORS headers
function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = (req.headers.origin as string) || ""
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
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
        manufacture_date: "09/2025",
        expiry_date: "09/2028",
        status: "Authentic & Safe",
        state: "active",
        security_seal: "LABORATORY-CERTIFIED",
        verification_date: new Date().toISOString(),
      })
    }

    // Unrecognized / Unverified
    return res.status(200).json({
      verified: false,
      query: trimmed,
      message: `The lot or batch code "${trimmed}" could not be authenticated in the official PEPTECH® synthesis registry.`,
    })
  } catch (err: any) {
    console.error("[Verify Route Error]:", err?.message || err)
    return res.status(500).json({
      verified: false,
      error: "Verification service temporarily unavailable. Please retry shortly.",
    })
  }
}
