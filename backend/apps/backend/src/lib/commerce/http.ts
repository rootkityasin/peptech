import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CommerceService from "../../modules/peptech-commerce/service"
import { fail, publicError } from "./policy"
export function actor(req: AuthenticatedMedusaRequest) {
  if (!req.auth_context?.actor_id) fail("Authentication required", 401)
  return req.auth_context.actor_id
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
