import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  readStorefrontSettings,
  writeStorefrontSettings,
  type StorefrontSettings,
} from "../../../../lib/storefront-settings";

// GET /admin/custom/storefront-settings
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const settings = readStorefrontSettings();
    return res.status(200).json({ settings });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to load storefront settings" });
  }
}

// POST /admin/custom/storefront-settings
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const current = readStorefrontSettings();
    const body = (req.body || {}) as Partial<StorefrontSettings>;

    const updated: StorefrontSettings = {
      ...current,
      ...(typeof body.show_lab_quality_section === "boolean"
        ? { show_lab_quality_section: body.show_lab_quality_section }
        : {}),
      updated_at: new Date().toISOString(),
      updated_by: (req as any).auth_context?.actor_id || "admin",
    };

    writeStorefrontSettings(updated);

    // Trigger on-demand cache revalidation on the storefront for immediate updates
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3000";
    const revalidateSecret =
      process.env.REVALIDATION_SECRET ||
      process.env.INTERNAL_REVALIDATE_SECRET ||
      process.env.COMMERCE_CRON_SECRET ||
      "";

    fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(revalidateSecret ? { "x-revalidate-secret": revalidateSecret } : {}),
      },
      body: JSON.stringify({
        event: "storefront-settings-update",
      }),
    }).catch((revalidateErr) => {
      // Non-blocking warning if storefront is not currently running
      console.warn("[Storefront Settings] Revalidation call skipped or pending:", revalidateErr?.message);
    });

    return res.status(200).json({
      success: true,
      settings: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to update storefront settings" });
  }
}
