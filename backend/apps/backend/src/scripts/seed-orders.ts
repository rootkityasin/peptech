import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function seedOrders({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const orderModule = container.resolve(Modules.ORDER);

  logger.info("=== SEEDING REALISTIC PEPTECH ORDERS ===");

  // Find products to link real variants/thumbnails if available
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "variants.id", "variants.title", "variants.sku"],
  });

  const penProduct = products.find((p: any) => p.title.toLowerCase().includes("pen")) || products[0];
  const refillProduct = products.find((p: any) => p.title.toLowerCase().includes("refill")) || products[1] || products[0];

  const ordersData = [
    {
      display_id: 1018,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "completed",
      metadata: {
        tags: ["Walmart"],
        source: "GeekSeller Integration",
        notes: "Order# 697930605097\nShipping info: $1.96, Delivery by April 5, 2017, 1:28 pm EDT",
        fulfillment_status: "fulfilled",
        payment_status: "paid",
        fulfillments: [
          {
            id: "1018-F3",
            carrier: "FedEx",
            tracking_number: "0987654321",
            tracking_url: "https://www.fedex.com/fedextrack/?trknbr=0987654321",
            status: "fulfilled",
            shipped_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
        ],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        company: "Evergreen Pet Supplies",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "Test Product 2",
          variant_sku: "test2",
          thumbnail: refillProduct?.thumbnail || "/images/peptech/cartridge.webp",
          quantity: 2,
          unit_price: 12.45,
          requires_shipping: true,
        },
        {
          title: "Test product",
          variant_sku: "test1",
          thumbnail: penProduct?.thumbnail || "/images/peptech/mockup1.webp",
          quantity: 2,
          unit_price: 12.00,
          requires_shipping: true,
        },
      ],
      shipping_methods: [
        {
          name: "Standard Shipping (4.01%)",
          amount: 1.96,
        },
      ],
    },
    {
      display_id: 1017,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: ["Repeat Customer"],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "Complete Pen Set - Midnight Navy",
          variant_sku: "PEN-SET-NVY",
          thumbnail: "/images/peptech/mockup1.webp",
          quantity: 1,
          unit_price: 249.00,
          requires_shipping: true,
        },
      ],
      shipping_methods: [
        {
          name: "Royal Mail Tracked",
          amount: 4.95,
        },
      ],
    },
    {
      display_id: 1016,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: ["RUO Research"],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "GHK-Cu Refill Cartridge 50mg",
          variant_sku: "REF-GHK-50",
          thumbnail: "/images/peptech/cartridge.webp",
          quantity: 2,
          unit_price: 39.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1015,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "completed",
      metadata: {
        tags: ["Walmart", "Priority"],
        source: "GeekSeller Integration",
        fulfillment_status: "fulfilled",
        payment_status: "paid",
        fulfillments: [
          {
            id: "1015-F1",
            carrier: "Royal Mail Tracked",
            tracking_number: "RM987654321GB",
            tracking_url: "https://www.royalmail.com/track-your-item#/tracking-results/RM987654321GB",
            status: "fulfilled",
            shipped_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "BPC-157 Refill Cartridge 10mg",
          variant_sku: "REF-BPC-10",
          thumbnail: "/images/peptech/cartridge.webp",
          quantity: 3,
          unit_price: 35.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1014,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: ["Laboratory"],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "Semaglutide Lyophilised Vial 5mg",
          variant_sku: "VIAL-SEMA-5",
          thumbnail: "/images/peptech/mockup2.webp",
          quantity: 1,
          unit_price: 120.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1013,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: [],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "TB-500 Refill Cartridge 10mg",
          variant_sku: "REF-TB-10",
          thumbnail: "/images/peptech/cartridge.webp",
          quantity: 1,
          unit_price: 33.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1012,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: ["Wholesale"],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "NAD+ Refill Cartridge 500mg",
          variant_sku: "REF-NAD-500",
          thumbnail: "/images/peptech/cartridge.webp",
          quantity: 1,
          unit_price: 25.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1011,
      email: "maggie.simpson@springfield.org",
      currency_code: "usd",
      status: "pending",
      metadata: {
        tags: ["VIP"],
        source: "Online Store",
        fulfillment_status: "unfulfilled",
        payment_status: "paid",
        fulfillments: [],
      },
      shipping_address: {
        first_name: "Maggie",
        last_name: "Simpson",
        address_1: "742 Evergreen Terrace",
        city: "Springfield",
        province: "OR",
        postal_code: "97477",
        country_code: "us",
        phone: "555-0199",
      },
      items: [
        {
          title: "Complete Pen Set - Glacier Silver",
          variant_sku: "PEN-SET-SLV",
          thumbnail: "/images/peptech/mockup1.webp",
          quantity: 1,
          unit_price: 249.00,
          requires_shipping: true,
        },
      ],
    },
    {
      display_id: 1010,
      email: "santa.helper@peptech.bio",
      currency_code: "usd",
      status: "completed",
      metadata: {
        tags: ["Walmart"],
        source: "GeekSeller Integration",
        fulfillment_status: "fulfilled",
        payment_status: "paid",
        fulfillments: [
          {
            id: "1010-F1",
            carrier: "FedEx",
            tracking_number: "0491823719",
            tracking_url: "https://www.fedex.com/fedextrack/?trknbr=0491823719",
            status: "fulfilled",
            shipped_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          },
        ],
      },
      shipping_address: {
        first_name: "Santa's",
        last_name: "Little Helper",
        address_1: "34 Birch street",
        city: "Old Cairo",
        province: "MS",
        postal_code: "38829",
        country_code: "us",
        phone: "212-212-9828",
      },
      items: [
        {
          title: "Tirzepatide Lyophilised Vial 10mg",
          variant_sku: "VIAL-TIRZ-10",
          thumbnail: "/images/peptech/mockup2.webp",
          quantity: 1,
          unit_price: 160.00,
          requires_shipping: true,
        },
      ],
    },
  ];

  for (const o of ordersData) {
    try {
      const created = await orderModule.createOrders({
        email: o.email,
        currency_code: o.currency_code,
        status: o.status as any,
        metadata: o.metadata,
        shipping_address: o.shipping_address as any,
        billing_address: o.shipping_address as any,
        items: o.items as any,
        shipping_methods: o.shipping_methods as any,
      });
      logger.info(`Created Order #${o.display_id} (${created.id}) for ${o.shipping_address.first_name} ${o.shipping_address.last_name}`);
    } catch (err: any) {
      logger.error(`Error creating order #${o.display_id}: ${err.message}`);
    }
  }

  logger.info("=== SEEDING COMPLETED SUCCESSFULLY ===");
}
