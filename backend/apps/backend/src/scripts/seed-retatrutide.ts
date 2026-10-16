import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, ProductStatus, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import CommerceService, { recordId } from "../modules/peptech-commerce/service"

export default async function seedRetatrutide({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const ledger = container.resolve("peptechCommerce") as CommerceService
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  logger.info("=== STARTING RETATRUTIDE PRODUCT REGISTRATION ===")

  // 1. Resolve sales channel, shipping profile, and stock location
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const defaultSalesChannel = salesChannels[0]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })
  const defaultShippingProfile = shippingProfiles[0]

  const [location] = await stockLocationModule.listStockLocations({}, { take: 1 })

  // 2. Resolve categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })

  const penSetCategory = categories.find(
    (c) => c.handle === "complete-pen-sets" || c.name.toLowerCase().includes("pen")
  )
  const refillCategory = categories.find(
    (c) => c.handle === "refill-cartridges" || c.name.toLowerCase().includes("refill")
  )
  const vialCategory = categories.find(
    (c) => c.handle === "freeze-dried-vials" || c.name.toLowerCase().includes("vial")
  )

  const retatrutideProducts = [
    {
      title: "Retatrutide Complete Pen Set",
      subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
      handle: "retatrutide-pen-set",
      sku: "PEP-PEN-RETA",
      format: "complete-pen-set",
      formatLabel: "Complete Pen Set",
      category_ids: penSetCategory ? [penSetCategory.id] : [],
      description:
        "PEPTECH® Complete Precision Pen System engineered for Retatrutide (LY3437943) triple incretin receptor research. First-time buyer comprehensive analytical package: Reusable precision pen, prefilled 1.5 mL Type I borosilicate cartridge, device passport/authenticity card, 31G 5mm sterile micro-needles, and alcohol preparation wipes. Research Use Only.",
      thumbnail: "/images/products/pen-sets/retatrutide.png",
      images: [
        { url: "/images/products/pen-sets/retatrutide.png" },
        { url: "/images/products/pen-sets/retatrutide-2.png" },
        { url: "/images/products/pen-sets/retatrutide-3.jpg" },
      ],
      priceGbp: 164.99,
      isSubEligible: false,
      metadata: {
        category: "complete-pen-sets",
        format: "complete-pen-set",
        compound: "retatrutide",
        compound_name: "Retatrutide (LY3437943)",
        contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
        subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
        tag: "Triple Incretin Agonist",
        isSubscriptionEligible: false,
      },
    },
    {
      title: "Retatrutide Refill Cartridge",
      subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
      handle: "retatrutide-cartridge",
      sku: "PEP-CRT-RETA",
      format: "refill-cartridge",
      formatLabel: "Refill Cartridge",
      category_ids: refillCategory ? [refillCategory.id] : [],
      description:
        "Retatrutide (LY3437943) pre-filled 1.5 mL precision borosilicate refill cartridge designed exclusively for the PEPTECH® Reusable Pen System. Sealed under ultra-pure inert nitrogen for maximum chemical stability. Research Use Only.",
      thumbnail: "/images/products/refills/retatrutide.png",
      images: [
        { url: "/images/products/refills/retatrutide.png" },
        { url: "/images/products/pen-sets/retatrutide-2.png" },
        { url: "/images/products/pen-sets/retatrutide.png" },
      ],
      priceGbp: 82.50,
      subDiscountPercent: 10,
      subPriceGbp: 74.25,
      isSubEligible: true,
      metadata: {
        category: "refill-cartridges",
        format: "refill-cartridge",
        compound: "retatrutide",
        compound_name: "Retatrutide (LY3437943)",
        contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
        subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
        tag: "Precision Cartridge",
        subDiscountPercent: 10,
        subscriptionPriceGbp: 74.25,
        isSubscriptionEligible: true,
      },
    },
    {
      title: "Retatrutide Freeze-Dried Vial",
      subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
      handle: "retatrutide-vial",
      sku: "PEP-VIA-RETA",
      format: "freeze-dried-vial",
      formatLabel: "Freeze-Dried Vial",
      category_ids: vialCategory ? [vialCategory.id] : [],
      description:
        "Lyophilised analytical reference standard Retatrutide (LY3437943) in laboratory-grade borosilicate glass vials with rubber butyl stopper and flip-off crimp seal. Batch-verified HPLC purity ≥ 99.0%. Research Use Only.",
      thumbnail: "/images/products/vials/retatrutide.png",
      images: [
        { url: "/images/products/vials/retatrutide.png" },
        { url: "/images/products/pen-sets/retatrutide.png" },
      ],
      priceGbp: 82.50,
      subDiscountPercent: 10,
      subPriceGbp: 74.25,
      isSubEligible: true,
      metadata: {
        category: "freeze-dried-vials",
        format: "freeze-dried-vial",
        compound: "retatrutide",
        compound_name: "Retatrutide (LY3437943)",
        contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
        subtitle: "Retatrutide (GIP, GLP-1 & Glucagon)",
        tag: "Lyophilised Reference Standard",
        subDiscountPercent: 10,
        subscriptionPriceGbp: 74.25,
        isSubscriptionEligible: true,
      },
    },
  ]

  for (const item of retatrutideProducts) {
    logger.info(`--- Processing "${item.title}" (${item.handle}) ---`)

    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle", "variants.id", "variants.sku"],
      filters: { handle: item.handle },
    })

    let product: any = existing && existing.length > 0 ? existing[0] : null

    if (!product) {
      logger.info(`Creating new product "${item.title}"...`)
      const { result } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: item.title,
              subtitle: item.subtitle,
              handle: item.handle,
              description: item.description,
              thumbnail: item.thumbnail,
              images: item.images,
              category_ids: item.category_ids,
              status: ProductStatus.PUBLISHED,
              shipping_profile_id: defaultShippingProfile.id,
              sales_channels: defaultSalesChannel ? [{ id: defaultSalesChannel.id }] : [],
              metadata: item.metadata,
              options: [{ title: "Format", values: [item.formatLabel] }],
              variants: [
                {
                  title: item.formatLabel,
                  sku: item.sku,
                  options: { Format: item.formatLabel },
                  manage_inventory: true,
                  prices: [
                    { amount: item.priceGbp, currency_code: "gbp" },
                    { amount: Math.round(item.priceGbp * 1.3 * 100) / 100, currency_code: "usd" },
                    { amount: Math.round(item.priceGbp * 1.18 * 100) / 100, currency_code: "eur" },
                  ],
                },
              ],
            },
          ],
        },
      })
      product = result[0]
      logger.info(`✓ Successfully created product: ${product.id}`)
    } else {
      logger.info(`Product already exists with ID: ${product.id}. Updating details...`)
      await updateProductsWorkflow(container).run({
        input: {
          products: [
            {
              id: product.id,
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              thumbnail: item.thumbnail,
              images: item.images,
              category_ids: item.category_ids,
              status: ProductStatus.PUBLISHED,
              metadata: item.metadata,
            },
          ],
        },
      })
      logger.info(`✓ Updated product ${product.id}`)
    }

    // Retrieve variant details
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "title", "sku", "inventory_items.inventory_item_id"],
      filters: { product_id: product.id },
    })

    const variant = variants && variants[0]
    if (variant) {
      logger.info(`Variant: ${variant.id} (${variant.sku})`)

      // Stock inventory if not already stocked
      if (location && variant.inventory_items?.length) {
        for (const invItem of variant.inventory_items) {
          if (!invItem?.inventory_item_id) continue
          const [level] = await inventoryModule.listInventoryLevels({
            inventory_item_id: invItem.inventory_item_id,
            location_id: location.id,
          })
          if (!level) {
            await inventoryModule.createInventoryLevels({
              inventory_item_id: invItem.inventory_item_id,
              location_id: location.id,
              stocked_quantity: 500,
            })
            logger.info(`✓ Stocked 500 units for inventory item ${invItem.inventory_item_id}`)
          } else {
            logger.info(`Inventory level already exists: ${level.stocked_quantity} units`)
          }
        }
      }

      // Register / Approve in PEPTECH Commerce Ledger
      const catalogRecordKey = recordId("catalog", variant.id)
      let catalogRecord = await ledger.get(catalogRecordKey)
      if (!catalogRecord) {
        await ledger.create({
          id: catalogRecordKey,
          kind: "catalog",
          profile: "catalog",
          owner_id: null,
          state: "approved",
          data: {
            variant_id: variant.id,
            canonical_name: item.title,
            canonical_sku: item.sku,
            format: item.format,
            evidence_ref: "ISO-17025-BATCH-VERIFIED",
            destinations: ["gb", "us"],
            version: "v1",
          },
        })
        logger.info(`✓ Approved variant ${variant.id} in PEPTECH Commerce Ledger.`)
      } else {
        catalogRecord.state = "approved"
        catalogRecord.data.canonical_name = item.title
        catalogRecord.data.canonical_sku = item.sku
        catalogRecord.data.format = item.format
        catalogRecord.data.destinations = ["gb", "us"]
        await ledger.save(catalogRecord)
        logger.info(`✓ Verified catalog approval for variant ${variant.id}.`)
      }
    }
  }

  logger.info("=== ALL RETATRUTIDE PRODUCTS REGISTERED SUCCESSFULLY ===")
}
