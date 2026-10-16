import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * PEPTECH® Instant Storefront Cache Invalidator Subscriber
 * Listens to all admin modifications (products, variants, inventory, pricing, collections)
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

  const storefrontUrl =
    process.env.STOREFRONT_INTERNAL_URL ||
    process.env.STRIPE_STOREFRONT_URL ||
    "http://localhost:3000"

  const revalidateSecret =
    process.env.REVALIDATION_SECRET || "peptech_revalidate_secret_8f49a7c2b3d1490e91a0"

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
