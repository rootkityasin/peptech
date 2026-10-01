import type { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import CommerceService from "../modules/peptech-commerce/service";

export default async function createSubscriptionRenewal({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const orderModule = container.resolve(Modules.ORDER);
  const customerModule = container.resolve(Modules.CUSTOMER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const ledger = container.resolve("peptechCommerce") as CommerceService;

  logger.info("=== CREATING SUBSCRIPTION RENEWAL TEST ORDER ===");

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "addresses.*"],
  });

  const customer = customers[0];
  if (!customer) {
    throw new Error("No customer found. Run seed-peptech first.");
  }

  const customerId = customer.id;
  const email: string = customer.email || "";
  const address = customer.addresses?.[0] || {
    first_name: customer.first_name || "Test",
    last_name: customer.last_name || "Customer",
    company: "Test Laboratory",
    address_1: "123 Science Park",
    address_2: "",
    city: "Cambridge",
    province: "",
    postal_code: "CB4 0GZ",
    country_code: "gb",
    phone: "+441234567890",
  };

  const now = Date.now();
  const subscriptionId = `sub_test_${now}`;
  const renewalOrderId = `sub_renewal_${now}`;
  const displayId = Math.floor(Math.random() * 900000) + 100000;
  const orderNumber = `PEP-${displayId}`;
  const receiptId = `receipt_${now}`;
  const lineItemId = `ordli_${now}_0`;

  const quote = {
    email,
    currency: "gbp",
    address: {
      first_name: address.first_name || "Test",
      last_name: address.last_name || "Customer",
      company: address.company || "Test Laboratory",
      address_1: address.address_1 || "123 Science Park",
      address_2: address.address_2 || "",
      city: address.city || "Cambridge",
      province: address.province || "",
      postal_code: address.postal_code || "CB4 0GZ",
      country_code: (address.country_code || "gb").toLowerCase(),
      phone: address.phone || "+441234567890",
    },
    lines: [
      {
        line_id: lineItemId,
        variant_id: "variant_refill_ghk_cu_50mg",
        name: "GHK-Cu Refill Cartridge 50mg",
        sku: "REF-GHK-50",
        quantity: 1,
        unit_minor: 3510,
        recurring: true,
        metadata: { catalog_version: "v1", strength: "50mg", format: "cartridge" },
      },
    ],
    shipping_minor: 495,
    shipping_option_id: "royal_mail_tracked",
    shipping_option_name: "Royal Mail Tracked",
    renewal_minor: 4005,
    total_minor: 4005,
    tax_policy: "stripe_default",
    tax_inclusive: true,
    vat_registered: false,
    customer_id: customerId,
  };

  try {
    await ledger.create({
      id: subscriptionId,
      kind: "subscription",
      profile: "local:v1",
      owner_id: customerId,
      state: "active",
      data: {
        stripe_id: `sub_test_stripe_${now}`,
        attempt_id: `attempt_test_${now}`,
        quote,
        control: "active",
        consent: { ruo: true, recurring: true, version: "checkout-v1", accepted_at: new Date().toISOString() },
        next_billing_at: Math.floor(Date.now() / 1000) + 28 * 86400,
        cadence_days: 28,
        stripe_customer_id: `cus_test_${now}`,
      },
    });

    logger.info(`Created subscription record: ${subscriptionId}`);

    const orderInput = {
      id: renewalOrderId,
      display_id: displayId,
      custom_display_id: orderNumber,
      customer_id: customerId,
      email: email,
      currency_code: "gbp",
      status: "pending",
      shipping_address: quote.address,
      billing_address: quote.address,
      no_notification: true,
      metadata: {
        peptech_receipt_id: receiptId,
        payment_gateway: "stripe",
        subscription_id: subscriptionId,
        fulfillment_hold: true,
        tax_policy: "stripe_default",
        order_number_formatted: orderNumber,
        is_subscription_renewal: true,
        renewal_cycle: 1,
        tags: [orderNumber],
      },
      items: [
        {
          id: lineItemId,
          variant_id: "variant_refill_ghk_cu_50mg",
          title: "GHK-Cu Refill Cartridge 50mg",
          variant_sku: "REF-GHK-50",
          quantity: 1,
          unit_price: 35.1,
          is_tax_inclusive: true,
          requires_shipping: true,
          metadata: {
            catalog_version: "v1",
            recurring: true,
            strength: "50mg",
            format: "cartridge",
          },
        },
      ],
      shipping_methods: [
        {
          name: "Royal Mail Tracked",
          amount: 4.95,
          shipping_option_id: "royal_mail_tracked",
          is_tax_inclusive: true,
        },
      ],
    };

    const [created] = await orderModule.createOrders([orderInput]);
    logger.info(`Created subscription renewal order: ${created.id}`);
    logger.info(`Order number: ${orderNumber}`);
    logger.info(`Customer: ${email}`);
    logger.info(`Status: pending (fulfillment_hold: true)`);
    logger.info("");
    logger.info("=== NEXT STEPS ===");
    logger.info("1. Go to Admin → Orders → find order " + orderNumber);
    logger.info("2. Release fulfillment hold: POST /api/admin/commerce/release");
    logger.info("3. Create Royal Mail fulfillment via the order detail widget");
    logger.info("");
    logger.info("Release payload:");
    logger.info(
      JSON.stringify(
        {
          order_id: renewalOrderId,
          allocations: [
            {
              line_id: lineItemId,
              quantity: 1,
              batch_id: "BATCH-TEST-001",
              coa_reference: "COA-TEST-001",
            },
          ],
        },
        null,
        2
      )
    );

    return {
      subscriptionId: subscriptionId,
      orderId: renewalOrderId,
      orderNumber: orderNumber,
      customerEmail: email,
      status: "pending",
      fulfillmentHold: true,
    };
  } catch (err: any) {
    logger.error(`Error creating renewal order: ${err.message}`);
    throw err;
  }
}
