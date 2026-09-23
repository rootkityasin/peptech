import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedPeptech({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=== PEPTECH CATALOG SEED INITIALIZATION (PDF DESIGN SYNC) ===");

  // 1. Fetch & Delete all legacy products
  logger.info("Step 1: Checking for existing products to purge...");
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
  });

  if (existingProducts && existingProducts.length > 0) {
    const productIds = existingProducts.map((p: any) => p.id);
    logger.info(`Deleting ${productIds.length} existing products...`);
    await deleteProductsWorkflow(container).run({
      input: {
        ids: productIds,
      },
    });
    logger.info("Successfully purged all existing products.");
  } else {
    logger.info("No existing products to purge.");
  }

  // 2. Fetch & Delete all legacy categories
  logger.info("Step 2: Checking for existing categories to purge...");
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  if (existingCategories && existingCategories.length > 0) {
    const categoryIds = existingCategories.map((c: any) => c.id);
    logger.info(`Deleting ${categoryIds.length} existing categories...`);
    await deleteProductCategoriesWorkflow(container).run({
      input: categoryIds,
    });
    logger.info("Successfully purged all existing categories.");
  } else {
    logger.info("No existing categories to purge.");
  }

  // 3. Create the 3 PEPTECH Product Categories
  logger.info("Step 3: Creating 3 PEPTECH product categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        {
          name: "Complete Pen Sets",
          handle: "complete-pen-sets",
          description:
            "First-time buyer starter package: Reusable precision aluminum pen, prefilled cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads. One-time purchase only.",
          is_active: true,
        },
        {
          name: "Refill Cartridges",
          handle: "refill-cartridges",
          description:
            "Designed exclusively for the PEPTECH reusable pen system. Available for One-Time Purchase and 28-day Subscribe & Save (10% discount).",
          is_active: true,
        },
        {
          name: "Freeze-Dried Vials",
          handle: "freeze-dried-vials",
          description:
            "High-purity laboratory lyophilised vials with verifiable HPLC & Mass Spectrometry lab reports. One-time purchase or 28-day Subscribe & Save.",
          is_active: true,
        },
      ],
    },
  });

  const penSetsCat = categoryResult.find((c: any) => c.handle === "complete-pen-sets")!;
  const refillsCat = categoryResult.find((c: any) => c.handle === "refill-cartridges")!;
  const vialsCat = categoryResult.find((c: any) => c.handle === "freeze-dried-vials")!;

  logger.info(`Created categories:
  - Complete Pen Sets: ${penSetsCat.id}
  - Refill Cartridges: ${refillsCat.id}
  - Freeze-Dried Vials: ${vialsCat.id}`);

  // 4. Retrieve Default Sales Channel and Shipping Profile
  logger.info("Step 4: Resolving default sales channel and shipping profile...");
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

  logger.info(`Using Sales Channel: ${defaultSalesChannel.id}, Shipping Profile: ${shippingProfile.id}`);

  // 5. Build PEPTECH Products Catalog Matching PDF Mockups Exactly
  logger.info("Step 5: Seeding PEPTECH products from PDF catalog...");

  const productsToCreate: any[] = [
    // --- Category 1: Complete Pen Sets ($249.00) ---
    {
      title: "Complete PEPTECH® Pen Set",
      handle: "complete-pen-set",
      description:
        "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.",
      thumbnail: "https://peptech.bio/images/peptech/mockup2.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "All Laboratory Testing",
        tag: "PEN SYSTEM",
        rating: 4.9,
        reviewsCount: 264,
        purchaseType: "one-time",
      },
      options: [{ title: "System", values: ["Complete Starter Kit"] }],
      variants: [
        {
          title: "Complete Starter Kit",
          sku: "PPS-1000",
          options: { System: "Complete Starter Kit" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
            { amount: 230, currency_code: "eur" },
          ],
        },
      ],
    },
    {
      title: "RT40 Pen System",
      handle: "pen-system-rt40",
      description: "Complete starter set with reusable precision pen and RT40 cartridge for food safety testing.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Food Safety Testing",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["RT40 Starter Set"] }],
      variants: [
        {
          title: "RT40 Starter Set",
          sku: "PEP-PEN-RT40",
          options: { Model: "RT40 Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "C.C-1236 Pen System",
      handle: "pen-system-cc1236",
      description: "Complete starter set with reusable precision pen and C.C-1236 cartridge for environmental testing.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Environmental Testing",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["C.C-1236 Starter Set"] }],
      variants: [
        {
          title: "C.C-1236 Starter Set",
          sku: "PEP-PEN-CC1236",
          options: { Model: "C.C-1236 Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "TB-S30 Pen System",
      handle: "pen-system-tbs30",
      description: "Complete starter set with reusable precision pen and TB-S30 cartridge for healthcare testing.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Healthcare Testing",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["TB-S30 Starter Set"] }],
      variants: [
        {
          title: "TB-S30 Starter Set",
          sku: "PEP-PEN-TBS30",
          options: { Model: "TB-S30 Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "IFC-137 Pen System",
      handle: "pen-system-ifc137",
      description: "Complete starter set with reusable precision pen and IFC-137 cartridge for industrial hygiene.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Industrial Hygiene",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["IFC-137 Starter Set"] }],
      variants: [
        {
          title: "IFC-137 Starter Set",
          sku: "PEP-PEN-IFC137",
          options: { Model: "IFC-137 Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "GVK-00 50 Pen System",
      handle: "pen-system-gvk0050",
      description: "Complete starter set with reusable precision pen and GVK-00 50 cartridge for water quality testing.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Water Quality Testing",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["GVK-00 50 Starter Set"] }],
      variants: [
        {
          title: "GVK-00 50 Starter Set",
          sku: "PEP-PEN-GVK0050",
          options: { Model: "GVK-00 50 Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "Melatonin II Pen System",
      handle: "pen-system-melatonin2",
      description: "Complete starter set with reusable precision pen and Melatonin II cartridge for mycotoxin detection.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        application: "Mycotoxin Detection",
        tag: "PEN SYSTEM",
        rating: 4.9,
        purchaseType: "one-time",
      },
      options: [{ title: "Model", values: ["Melatonin II Starter Set"] }],
      variants: [
        {
          title: "Melatonin II Starter Set",
          sku: "PEP-PEN-MELATONIN2",
          options: { Model: "Melatonin II Starter Set" },
          prices: [
            { amount: 249, currency_code: "usd" },
            { amount: 195, currency_code: "gbp" },
          ],
        },
      ],
    },

    // --- Category 2: Refill Cartridges ---
    {
      title: "RT40 Test Cartridge",
      handle: "cartridge-rt40",
      description: "Replacement cartridge for RT40 food safety testing. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-RT40",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 39, currency_code: "usd" },
            { amount: 30, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "C.C-1236 Test Cartridge",
      handle: "cartridge-cc1236",
      description: "Replacement cartridge for C.C-1236 environmental testing. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-CC1236",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 39, currency_code: "usd" },
            { amount: 30, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "TB-S30 Test Cartridge",
      handle: "cartridge-tbs30",
      description: "Replacement cartridge for TB-S30 healthcare testing. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-TBS30",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 25, currency_code: "usd" },
            { amount: 20, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "IFC-137 Test Cartridge",
      handle: "cartridge-ifc137",
      description: "Replacement cartridge for IFC-137 industrial hygiene. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-IFC137",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 39, currency_code: "usd" },
            { amount: 30, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "GVK-00 50 Test Cartridge",
      handle: "cartridge-gvk0050",
      description: "Replacement cartridge for GVK-00 50 water quality testing. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-GVK0050",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 35, currency_code: "usd" },
            { amount: 28, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "Melatonin II Test Cartridge",
      handle: "cartridge-melatonin2",
      description: "Replacement cartridge for Melatonin II mycotoxin detection. Compatible with PEPTECH reusable pen.",
      thumbnail: "https://peptech.bio/images/peptech/cartridge.webp",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "refill-cartridges", format: "refill", tag: "Test Cartridge", subDiscountPercent: 10 },
      options: [{ title: "Type", values: ["Single Cartridge"] }],
      variants: [
        {
          title: "Single Cartridge",
          sku: "PEP-CRT-MELATONIN2",
          options: { Type: "Single Cartridge" },
          prices: [
            { amount: 33, currency_code: "usd" },
            { amount: 26, currency_code: "gbp" },
          ],
        },
      ],
    },

    // --- Category 3: Freeze-Dried Vials ---
    {
      title: "Research Grade 5 mg Lyophilised Vial",
      handle: "vial-5mg",
      description: "Research grade 5 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [vialsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "freeze-dried-vials", format: "vial", tag: "Freeze-Dried Vial" },
      options: [{ title: "Dose", values: ["5 mg"] }],
      variants: [
        {
          title: "5 mg",
          sku: "PEP-VIA-5MG",
          options: { Dose: "5 mg" },
          prices: [
            { amount: 129, currency_code: "usd" },
            { amount: 100, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "Research Grade 10 mg Lyophilised Vial",
      handle: "vial-10mg",
      description: "Research grade 10 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [vialsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "freeze-dried-vials", format: "vial", tag: "Freeze-Dried Vial" },
      options: [{ title: "Dose", values: ["10 mg"] }],
      variants: [
        {
          title: "10 mg",
          sku: "PEP-VIA-10MG",
          options: { Dose: "10 mg" },
          prices: [
            { amount: 199, currency_code: "usd" },
            { amount: 155, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "Research Grade 25 mg Lyophilised Vial",
      handle: "vial-25mg",
      description: "Research grade 25 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [vialsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "freeze-dried-vials", format: "vial", tag: "Freeze-Dried Vial" },
      options: [{ title: "Dose", values: ["25 mg"] }],
      variants: [
        {
          title: "25 mg",
          sku: "PEP-VIA-25MG",
          options: { Dose: "25 mg" },
          prices: [
            { amount: 349, currency_code: "usd" },
            { amount: 270, currency_code: "gbp" },
          ],
        },
      ],
    },
    {
      title: "Research Grade 50 mg Lyophilised Vial",
      handle: "vial-50mg",
      description: "Research grade 50 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.",
      thumbnail: "https://peptech.bio/images/peptech/front.webp",
      category_ids: [vialsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { category: "freeze-dried-vials", format: "vial", tag: "Freeze-Dried Vial" },
      options: [{ title: "Dose", values: ["50 mg"] }],
      variants: [
        {
          title: "50 mg",
          sku: "PEP-VIA-50MG",
          options: { Dose: "50 mg" },
          prices: [
            { amount: 599, currency_code: "usd" },
            { amount: 465, currency_code: "gbp" },
          ],
        },
      ],
    },
  ];

  logger.info(`Creating ${productsToCreate.length} products...`);
  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info(`✅ Successfully seeded ${productsToCreate.length} PEPTECH products matching PDF mockups!`);
}
