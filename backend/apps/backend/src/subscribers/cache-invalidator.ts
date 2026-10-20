import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * PEPTECH® Instant Storefront Cache Invalidator Subscriber
 * Listens to all admin modifications (products, variants, inventory, pricing, collections, media, files)
 * and immediately purges Next.js ISR and Hostinger LiteSpeed edge caches.
 */
export default async function cacheInvalidationSubscriber({
  event: { name, data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info(
    `[PEPTECH CACHE INVALIDATOR] Event "${name}" detected for entity ${
      data?.id ? data.id : JSON.stringify(data)
    }. Triggering instant storefront cache purge...`
  )

  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.MEDUSA_ADMIN_ONBOARDING_TYPE === "default" ||
    Boolean(process.env.MEDUSA_BACKEND_URL?.includes("peptech.bio"))

  const storefrontUrl =
    process.env.STRIPE_STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_STOREFRONT_URL ||
    (isProd ? "https://peptech.bio" : "http://localhost:3000")

  const revalidateSecret =
    process.env.REVALIDATION_SECRET ||
    process.env.COMMERCE_CRON_SECRET ||
    process.env.STRIPE_COMMERCE_SIGNING_SECRET

  if (!revalidateSecret) {
    logger.warn(
      "[PEPTECH CACHE INVALIDATOR] Neither REVALIDATION_SECRET, COMMERCE_CRON_SECRET, nor STRIPE_COMMERCE_SIGNING_SECRET is configured. Skipping cache invalidation request."
    )
    return
  }

  let handle: string | undefined
  let categories: string[] = []

  let productId: string | undefined =
    typeof data?.id === "string" && data.id.startsWith("prod_")
      ? data.id
      : typeof data?.product_id === "string"
      ? data.product_id
      : undefined

  // If the event is for an image (e.g. img_...), resolve the parent product
  if (!productId && typeof data?.id === "string" && data.id.startsWith("img_")) {
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: images } = await query.graph({
        entity: "image",
        fields: ["id", "product_id", "product.id", "product.handle", "product.categories.handle"],
        filters: { id: data.id },
      })
      if (images && images[0]) {
        productId = images[0].product_id || images[0].product?.id
        if (images[0].product?.handle) {
          handle = images[0].product.handle
          categories = (images[0].product.categories || []).map((c: any) => c.handle).filter(Boolean)
        }
      }
    } catch {
      // Continue gracefully if image entity query fails
    }
  }

  if (productId && !handle) {
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "categories.handle"],
        filters: { id: productId },
      })
      if (products && products[0]) {
        handle = products[0].handle
        categories = (products[0].categories || []).map((c: any) => c.handle).filter(Boolean)
      }
    } catch {
      // Continue gracefully if query resolution is not available
    }
  }

  try {
    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": revalidateSecret,
      },
      body: JSON.stringify({
        event: name,
        data,
        productId,
        handle,
        categories,
        timestamp: Date.now(),
      }),
    })

    if (res.ok) {
      const result = await res.json()
      logger.info(
        `[PEPTECH CACHE INVALIDATOR] ✓ Storefront & LiteSpeed edge cache purged instantly: ${JSON.stringify(
          result
        )}`
      )
    } else {
      const text = await res.text()
      logger.warn(
        `[PEPTECH CACHE INVALIDATOR] ⚠️ Storefront revalidation failed (Status ${res.status}): ${text}`
      )
    }
  } catch (err: any) {
    logger.warn(
      `[PEPTECH CACHE INVALIDATOR] ⚠️ Failed to reach storefront revalidation endpoint at ${storefrontUrl}: ${
        err?.message || err
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    // Product workflow events (triggered when admin saves a product or variant)
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",

    // Product entity lifecycle events
    "product.product.created",
    "product.product.updated",
    "product.product.deleted",
    "product.product-variant.created",
    "product.product-variant.updated",
    "product.product-variant.deleted",
    "product.product-category.created",
    "product.product-category.updated",
    "product.product-category.deleted",
    "product.product-collection.created",
    "product.product-collection.updated",
    "product.product-collection.deleted",

    // Media & Product-Image lifecycle events
    "product.product-image.created",
    "product.product-image.updated",
    "product.product-image.deleted",
    "product-image.created",
    "product-image.updated",
    "product-image.deleted",
    "product.image.created",
    "product.image.updated",
    "product.image.deleted",

    // File Module lifecycle events
    "file.created",
    "file.updated",
    "file.deleted",
    "file.file.created",
    "file.file.updated",
    "file.file.deleted",

    // Inventory levels and item updates (stock adjustments)
    "inventory-item.created",
    "inventory-item.updated",
    "inventory-item.deleted",
    "inventory-level.created",
    "inventory-level.updated",
    "inventory-level.deleted",

    // Pricing & price sets (price changes)
    "pricing.price-set.created",
    "pricing.price-set.updated",
    "pricing.price-set.deleted",
    "pricing.price.created",
    "pricing.price.updated",
    "pricing.price.deleted",
    "price-set.updated",
  ],
}
