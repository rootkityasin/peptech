import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ProductStatus, Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import CommerceService, { recordId } from "../modules/peptech-commerce/service";

export default async function createCartridge({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const ledger = container.resolve("peptechCommerce") as CommerceService;

  logger.info("=== CREATING PEPTECH PRECISION REFILL CARTRIDGE ===");

  // 1. Resolve default sales channel and shipping profile
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel = salesChannels[0];

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const shippingProfile = shippingProfiles[0];

  // 2. Resolve stock location
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const [location] = await stockLocationModule.listStockLocations({}, { take: 1 });

  // 3. Resolve refill category
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
    filters: { handle: "refill-cartridges" },
  });
  const refillCategory = categories[0];

  const handle = "cartridge-ghkcu50";
  const title = "GHK-Cu 50mg Precision Cartridge";
  const sku = "PEP-CRT-GHKCU50";

  // Check if product already exists
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "variants.id", "variants.sku"],
    filters: { handle },
  });

  let product: any = existing && existing.length > 0 ? existing[0] : null;

  if (!product) {
    logger.info(`Creating new cartridge product "${title}" (${handle})...`);
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title,
            handle,
            description:
              "Laboratory research grade GHK-Cu 50mg pre-filled precision cartridge. 1.5 mL sealed borosilicate cartridge engineered exclusively for the PEPTECH® Precision Pen system. Sealed under inert nitrogen. Research Use Only.",
            thumbnail: "/images/products/refills/ghk-cu.png",
            category_ids: refillCategory ? [refillCategory.id] : [],
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            metadata: {
              category: "refill-cartridges",
              format: "refill",
              tag: "Precision Cartridge",
              subDiscountPercent: 10,
              subscriptionPriceGbp: 31.50,
            },
            options: [{ title: "Type", values: ["Single Cartridge"] }],
            variants: [
              {
                title: "Single Cartridge",
                sku,
                options: { Type: "Single Cartridge" },
                manage_inventory: true,
                prices: [
                  { amount: 45, currency_code: "usd" },
                  { amount: 35, currency_code: "gbp" },
                  { amount: 40, currency_code: "eur" },
                ],
              },
            ],
          },
        ],
      },
    });
    product = result[0];
    logger.info(`Successfully created product: ${product.id}`);
  } else {
    logger.info(`Product already exists: ${product.id}`);
  }

  // 4. Retrieve variant details
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "inventory_items.inventory_item_id"],
    filters: { product_id: product.id },
  });

  const variant = variants[0];
  logger.info(`Variant: ${variant.id} (SKU: ${variant.sku})`);

  // 5. Stock inventory
  if (location && variant.inventory_items?.length) {
    const inventory = container.resolve(Modules.INVENTORY);
    for (const item of variant.inventory_items) {
      if (!item) continue;
      const [level] = await inventory.listInventoryLevels({
        inventory_item_id: item.inventory_item_id,
        location_id: location.id,
      });
      if (!level) {
        await inventory.createInventoryLevels({
          inventory_item_id: item.inventory_item_id,
          location_id: location.id,
          stocked_quantity: 500,
        });
        logger.info(`Created inventory level for item ${item.inventory_item_id}: 500 units`);
      } else {
        logger.info(`Inventory level already exists: ${level.stocked_quantity} units`);
      }
    }
  }

  // 6. Register & approve in PEPTECH Commerce Ledger
  const catalogRecordKey = recordId("catalog", variant.id);
  let catalogRecord = await ledger.get(catalogRecordKey);
  if (!catalogRecord) {
    catalogRecord = await ledger.create({
      id: catalogRecordKey,
      kind: "catalog",
      profile: "catalog",
      owner_id: null,
      state: "approved",
      data: {
        variant_id: variant.id,
        canonical_name: title,
        canonical_sku: sku,
        format: "refill",
        evidence_ref: "ISO-17025-BATCH-VERIFIED",
        destinations: ["gb", "us"],
        version: "v1",
      },
    });
    logger.info(`Approved variant ${variant.id} in PEPTECH Commerce Ledger.`);
  } else {
    catalogRecord.state = "approved";
    catalogRecord.data.canonical_name = title;
    catalogRecord.data.canonical_sku = sku;
    catalogRecord.data.format = "refill";
    catalogRecord.data.destinations = ["gb", "us"];
    await ledger.save(catalogRecord);
    logger.info(`Updated catalog approval for variant ${variant.id}.`);
  }

  logger.info("=== CARTRIDGE CREATION & APPROVAL COMPLETE ===");
  console.log(
    JSON.stringify({
      productId: product.id,
      variantId: variant.id,
      sku: variant.sku,
      handle,
      title,
      priceGbp: 35,
      subDiscount: "10%",
      subPriceGbp: 31.50,
      approved: true,
    })
  );
}
