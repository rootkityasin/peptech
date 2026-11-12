import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { readStorefrontSettings } from "../../../../lib/storefront-settings";

// GET /store/custom/storefront-settings
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const settings = readStorefrontSettings();
    return res.status(200).json({ settings });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Failed to retrieve storefront settings",
      settings: { show_lab_quality_section: true },
    });
  }
}

// OPTIONS /store/custom/storefront-settings - CORS Preflight
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end();
}
