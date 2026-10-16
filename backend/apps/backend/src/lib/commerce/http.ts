import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CommerceService from "../../modules/peptech-commerce/service"
import { fail, publicError } from "./policy"
export function actor(req: AuthenticatedMedusaRequest): string {
  const candidate = req.auth_context?.actor_id
  if (!candidate) fail("Authentication required", 401)
  return candidate
}
export function commerce(req: { scope: { resolve: (name: string) => any } }): CommerceService {
  return req.scope.resolve("peptechCommerce")
}
export async function endpoint(res: MedusaResponse, run: () => Promise<unknown>) {
  try { return res.json(await run()) }
  catch (error) { const result = publicError(error); return res.status(result.status).json({ message: result.message }) }
}

export function operator(req: AuthenticatedMedusaRequest) {
  const id=actor(req)
  const live=/^(?:sk|rk)_live_/.test(process.env.STRIPE_API_KEY || "")
  if(live && !(process.env.STRIPE_COMMERCE_ADMIN_IDS || "").split(",").map(s=>s.trim()).includes(id)) fail("Financial administrator permission required",403)
  return id
}

export function resolveStorefrontOrigin(req?: any): string {
  const isProd = process.env.NODE_ENV === "production" || /^(?:sk|rk)_live_/.test(process.env.STRIPE_API_KEY || "")

  const candidates: (string | undefined)[] = [
    req?.headers?.["x-storefront-origin"],
    req?.headers?.["origin"],
    req?.headers?.["referer"],
  ]

  for (const raw of candidates) {
    if (!raw || typeof raw !== "string") continue
    try {
      const parsed = new URL(raw)
      const hostname = parsed.hostname.toLowerCase()
      if (
        hostname === "peptech.bio" ||
        hostname.endsWith(".peptech.bio") ||
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      ) {
        return `${parsed.protocol}//${parsed.host}`
      }
    } catch {}
  }

  const envUrl = process.env.STRIPE_STOREFRONT_URL
  if (envUrl && typeof envUrl === "string") {
    try {
      const parsed = new URL(envUrl)
      if (!isProd || !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
        return envUrl.replace(/\/$/, "")
      }
    } catch {}
  }

  return isProd ? "https://peptech.bio" : "http://localhost:3000"
}
