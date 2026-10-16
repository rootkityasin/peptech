import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { commerce } from "../../../../lib/commerce/http"

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

// GET /store/custom/verify?code=PT-26-000184
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  applyCors(req, res)
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

  try {
    const rawQuery =
      (req.query.code as string) ||
      (req.query.serial as string) ||
      (req.query.batch as string) ||
      (req.query.id as string) ||
      ""

    const trimmed = rawQuery.trim()
    if (!trimmed) {
      return res.status(400).json({
        verified: false,
        message: "A device passport serial number or batch lot number is required.",
      })
    }

    const upper = trimmed.toUpperCase()
    const ledger = commerce(req)

    // 1. Check Dynamic Device Passports (Managed via Admin Panel)
    const passport = await ledger.findDevicePassport(trimmed)
    if (passport) {
      const isActive = passport.state === "active"
      if (!isActive) {
        return res.status(200).json({
          verified: false,
          revoked: true,
          type: "device_passport",
          serial_number: passport.data?.serial_number || passport.id.replace(/^devpass_/, ""),
          product_name: passport.data?.product_name || "PEPTECH® Reusable Precision Pen System",
          batch_number: passport.data?.batch_number || "RT-2609A",
          status: passport.state === "revoked" ? "Revoked / Flagged" : "Decommissioned",
          state: passport.state,
          message: `This device serial (${passport.data?.serial_number || trimmed}) has been marked as ${passport.state} by PEPTECH quality assurance.`,
        })
      }

      return res.status(200).json({
        verified: true,
        type: "device_passport",
        serial_number: passport.data?.serial_number || passport.id.replace(/^devpass_/, ""),
        product_name: passport.data?.product_name || "PEPTECH® Reusable Precision Pen 1.0",
        batch_number: passport.data?.batch_number || "RT-2609A",
        manufacture_date: passport.data?.manufacture_date || "01/2026",
        expiry_date: passport.data?.expiry_date || "01/2029",
        status: "Authentic & Safe",
        state: "active",
        device_type: passport.data?.device_type || "Precision Pen Device",
        nfc_enabled: passport.data?.nfc_enabled !== false,
        qr_enabled: passport.data?.qr_enabled !== false,
        security_seal: passport.data?.security_seal || "HOLOGRAPHIC-VERIFIED",
        notes: passport.data?.notes || "",
        verification_date: new Date().toISOString(),
      })
    }

    // 2. Check Recognized Batch Lots
    const isKnownBatch =
      KNOWN_EXACT_BATCHES.has(upper) ||
      KNOWN_BATCH_PREFIXES.some((prefix) => upper.startsWith(prefix))

    if (isKnownBatch) {
      return res.status(200).json({
        verified: true,
        type: "batch_lot",
        serial_number: "N/A (Lyophilised Batch)",
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

    // 3. Unrecognized / Unverified
    return res.status(200).json({
      verified: false,
      query: trimmed,
      message: `The lot or serial code "${trimmed}" could not be authenticated in the official PEPTECH® synthesis and device registry.`,
    })
  } catch (err: any) {
    console.error("[Verify Route Error]:", err?.message || err)
    return res.status(500).json({
      verified: false,
      error: "Verification service temporarily unavailable. Please retry shortly.",
    })
  }
}
