import {guardFulfillment,guardNativeRefund,retiredPaymentCreation} from "../lib/commerce/guards"
import { authenticate, defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const serveStaticImage = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const urlPath = req.originalUrl?.split("?")[0] || req.url?.split("?")[0] || ""
  const imagePath = urlPath.replace(/^\/images\/?/, "")

  if (!imagePath || imagePath.split(/[\\/]/).includes("..")) return next()

  // 1. Check in public/images/
  const fullPath1 = path.resolve(process.cwd(), "public/images", imagePath)
  if (fs.existsSync(fullPath1) && fs.statSync(fullPath1).isFile()) {
    return res.sendFile(fullPath1)
  }

  // 2. Check in public/
  const fullPath2 = path.resolve(process.cwd(), "public", imagePath)
  if (fs.existsSync(fullPath2) && fs.statSync(fullPath2).isFile()) {
    return res.sendFile(fullPath2)
  }

  // 3. Check in storefront/public/images/
  const fullPath3 = path.resolve(process.cwd(), "../../../storefront/public/images", imagePath)
  if (fs.existsSync(fullPath3) && fs.statSync(fullPath3).isFile()) {
    return res.sendFile(fullPath3)
  }

  next()
}

export default defineMiddlewares({
  routes: [
    { matcher: "/store/payment-collections/:id/payment-sessions", methods: ["POST"], middlewares: [retiredPaymentCreation] },
    { matcher: "/admin/orders/:id/fulfillments", methods: ["POST"], middlewares: [authenticate("user", ["session", "bearer"]),guardFulfillment] },
    { matcher: "/admin/payments/:id/refund", methods: ["POST"], middlewares: [authenticate("user", ["session", "bearer"]),guardNativeRefund] },
    { matcher: "/admin/custom/return", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/refund", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/store/custom/orders", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/subscriptions", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/checkout*", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/store/custom/billing-portal", middlewares: [authenticate("customer", ["bearer"])] },
    { matcher: "/admin/commerce*", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/admin/custom/subscriptions", middlewares: [authenticate("user", ["session", "bearer"])] },
    { matcher: "/hooks/peptech-stripe", bodyParser: { preserveRawBody: true, sizeLimit: "1mb" } },
    {
      matcher: "/images/*",
      middlewares: [serveStaticImage],
    },
  ],
})
