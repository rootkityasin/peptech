import fs from "fs"
import path from "path"
import { getMedusaBackendUrl } from "./medusa"

export interface StorefrontSettings {
  show_lab_quality_section: boolean
  updated_at?: string
}

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  show_lab_quality_section: true,
}

function getLocalSettingsFromFile(): StorefrontSettings | null {
  try {
    if (typeof window !== "undefined") return null
    // In Next.js server runtime, read shared workspace data file directly
    let dir = process.cwd()
    while (true) {
      const dataFile = path.join(dir, "data", "storefront-settings.json")
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, "utf8").replace(/^\uFEFF/, "")
        const parsed = JSON.parse(raw)
        return {
          ...DEFAULT_STOREFRONT_SETTINGS,
          ...parsed,
        }
      }
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fetches current storefront configuration.
 * Uses instant local filesystem read on the server with fallback to Medusa backend HTTP endpoint.
 */
export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  const local = getLocalSettingsFromFile()
  if (local) return local

  try {
    const backendUrl = getMedusaBackendUrl()
    const headers: Record<string, string> = { Accept: "application/json" }
    const pubKey = (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "").trim()
    if (pubKey) headers["x-publishable-api-key"] = pubKey

    const res = await fetch(`${backendUrl}/store/custom/storefront-settings`, {
      headers,
      next: { revalidate: 60, tags: ["storefront-settings", "homepage"] },
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return DEFAULT_STOREFRONT_SETTINGS
    const data = await res.json()
    return data.settings || DEFAULT_STOREFRONT_SETTINGS
  } catch {
    return DEFAULT_STOREFRONT_SETTINGS
  }
}
