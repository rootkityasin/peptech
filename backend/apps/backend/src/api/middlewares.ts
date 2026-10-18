import { guardFulfillment, guardNativeRefund, retiredPaymentCreation } from "../lib/commerce/guards"
import { authenticate, defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { validatePromoMiddlewares } from "./store/custom/promotions/validate/middlewares"
import fs from "fs"
import path from "path"

const handleStoreCors = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const origin = (req.headers.origin as string) || ""
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, Accept, Cache-Control, X-Requested-With")
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Max-Age", "86400")
    return res.status(204).end()
  }
  next()
}

const SUPABASE_STORAGE_URL =
  process.env.SUPABASE_STORAGE_URL

const serveStaticImage = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const urlPath = req.originalUrl?.split("?")[0] || req.url?.split("?")[0] || ""
  let imagePath = urlPath
    .replace(/^\/images\/?/, "")
    .replace(/^\/app\/images\/?/, "")
    .replace(/^\/static\/?/, "")
    .replace(/^\/app\/static\/?/, "")

  if (urlPath === "/logo.webp" || urlPath === "/app/logo.webp") {
    imagePath = "logo.webp"
  }

  if (!imagePath || imagePath.split(/[\\/]/).includes("..")) return next()

  // 1. Check in local public/ (e.g. logo.webp)
  const fullPath = path.resolve(process.cwd(), "public", imagePath)
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return res.sendFile(fullPath)
  }

  // 2. Redirect to Supabase Storage CDN
  const cleanKey = imagePath.replace(/^\/+/, "")
  const destination = cleanKey.startsWith("images/")
    ? `${SUPABASE_STORAGE_URL}/${cleanKey}`
    : `${SUPABASE_STORAGE_URL}/images/${cleanKey}`
  return res.redirect(302, destination)
}

const ensureVerifyPublishableKey = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  if (!req.headers["x-publishable-api-key"] && process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    req.headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }
  next()
}

export default defineMiddlewares({
  routes: [
    { matcher: "/store/custom/verify*", middlewares: [ensureVerifyPublishableKey, handleStoreCors] },
    { matcher: "/store/custom*", middlewares: [handleStoreCors] },
    ...validatePromoMiddlewares,
    { matcher: "/store/payment-collections/:id/payment-sessions", methods: ["POST"], middlewares: [retiredPaymentCreation] },
    { matcher: "/admin/orders/:id/fulfillments", methods: ["POST"], middlewares: [authenticate("user", ["session", "bearer"]), guardFulfillment] },
    { matcher: "/admin/payments/:id/refund", methods: ["POST"], middlewares: [authenticate("user", ["session", "bearer"]), guardNativeRefund] },
    { matcher: "/admin/custom/return", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/refund", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/promotions*", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/store/custom/orders", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/orders/*", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/subscriptions", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/subscriptions/*", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/payment-methods", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/payment-methods/*", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/checkout*", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/billing-portal", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/admin/commerce*", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/subscriptions", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/products*", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/hooks/peptech-stripe", bodyParser: { preserveRawBody: true, sizeLimit: "1mb" } },
    {
      matcher: "/images/*",
      middlewares: [serveStaticImage],
    },
    {
      matcher: "/app/images/*",
      middlewares: [serveStaticImage],
    },
    {
      matcher: "/static/*",
      middlewares: [serveStaticImage],
    },
    {
      matcher: "/app/static/*",
      middlewares: [serveStaticImage],
    },
    {
      matcher: "/logo.webp",
      middlewares: [serveStaticImage],
    },
    {
      matcher: "/app/logo.webp",
      middlewares: [serveStaticImage],
    },
  ],
})
