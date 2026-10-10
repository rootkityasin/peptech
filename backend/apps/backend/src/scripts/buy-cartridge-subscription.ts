import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderPaymentCollectionWorkflow,
  markPaymentCollectionAsPaid,
} from "@medusajs/medusa/core-flows";
import { importCommerceOrder } from "../workflows/import-commerce-order";
import CommerceService, { recordId } from "../modules/peptech-commerce/service";

export default async function buyCartridgeSubscription({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const ledger = container.resolve("peptechCommerce") as CommerceService;

  logger.info("=== BUYING CARTRIDGE WITH 28-DAY SUBSCRIPTION OPTION ===");

  // 1. Fetch our test customer
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "company_name", "phone"],
    filters: { email: "test.subscriber@peptech.bio" },
  });

  const customer = customers[0];
  if (!customer) {
    throw new Error("Customer test.subscriber@peptech.bio not found.");
  }
  logger.info(`Customer: ${customer.first_name} ${customer.last_name} (${customer.email}) [${customer.id}]`);

  // 2. Fetch our created cartridge product & variant
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "variants.id", "variants.title", "variants.sku", "variants.prices.*"],
    filters: { handle: "cartridge-ghkcu50" },
  });

  const product = products[0];
  if (!product || !product.variants?.length) {
    throw new Error("Cartridge cartridge-ghkcu50 not found.");
  }
  const variant = product.variants[0];
  logger.info(`Product: ${product.title} (Variant ID: ${variant.id}, SKU: ${variant.sku})`);

  // 3. Resolve shipping option, sales channel, region
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel = salesChannels[0];

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  const defaultRegion = regions[0] || { id: "reg_01", currency_code: "gbp" };

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "amount"],
  });
  const shippingOption = shippingOptions[0] || { id: "so_royal_mail", name: "Royal Mail Tracked", amount: 4.95 };

  const now = Date.now();
  const subscriptionId = `sub_${now}`;
  const attemptId = `attempt_${now}`;
  const receiptId = `receipt_${now}`;
  const orderId = `order_${now}`;
  const lineItemId = `ordli_${now}_0`;
  const displayId = Math.floor(Math.random() * 900000) + 100000;
  const orderNumber = `PEP-${displayId}`;

  // 10% Subscribe & Save discount on £35.00 => £31.50 (3150 minor)
  const unitMinor = 3150;
  const shippingMinor = 495; // £4.95
  const totalMinor = unitMinor + shippingMinor; // 3645 minor (£36.45)
  const totalGbp = totalMinor / 100;

  const address = {
    first_name: customer.first_name || "Alexander",
    last_name: customer.last_name || "Vance",
    company: customer.company_name || "Cambridge Peptide Analytics Ltd",
    address_1: "Cambridge Science Park, Milton Road",
    address_2: "Building 3, Suite 102",
    city: "Cambridge",
    province: "Cambridgeshire",
    postal_code: "CB4 0FW",
    country_code: "gb",
    phone: customer.phone || "+44 7700 900123",
  };

  const quote = {
    email: customer.email,
    currency: "gbp",
    region_id: defaultRegion.id,
    sales_channel_id: defaultSalesChannel.id,
    customer_id: customer.id,
    address,
    lines: [
      {
        line_id: lineItemId,
        variant_id: variant.id,
        name: product.title,
        sku: variant.sku,
        quantity: 1,
        unit_minor: unitMinor,
        recurring: true,
        metadata: {
          catalog_version: "v1",
          recurring: true,
          format: "cartridge",
          strength: "50mg",
          interval: "28_days",
          subscription_discount_applied: "10%",
        },
      },
    ],
    shipping_minor: shippingMinor,
    shipping_option_id: shippingOption.id,
    shipping_option_name: "Royal Mail Tracked",
    renewal_minor: totalMinor,
    total_minor: totalMinor,
    tax_policy: "stripe_default",
    tax_inclusive: true,
    vat_registered: false,
  };

  // 4. Create Active Subscription Record in Commerce Ledger
  const subRecord = await ledger.create({
    id: subscriptionId,
    kind: "subscription",
    profile: "local:v1",
    owner_id: customer.id,
    state: "active",
    data: {
      stripe_id: `sub_stripe_${now}`,
      attempt_id: attemptId,
      quote,
      control: "active",
      consent: {
        ruo: true,
        recurring: true,
        version: "checkout-v1",
        accepted_at: new Date().toISOString(),
      },
      next_billing_at: Math.floor(Date.now() / 1000) + 28 * 86400,
      cadence_days: 28,
      stripe_customer_id: `cus_stripe_${now}`,
      items: [
        {
          name: product.title,
          sku: variant.sku,
          quantity: 1,
          price: 31.50,
          original_price: 35.00,
          discount_percent: 10,
        },
      ],
    },
  });
  logger.info(`✅ Created 28-Day Subscription Record: ${subscriptionId} (Status: active, Next billing in 28 days)`);

  // 5. Create Confirmed Attempt Record in Commerce Ledger
  await ledger.create({
    id: attemptId,
    kind: "attempt",
    profile: "local:v1",
    owner_id: customer.id,
    state: "confirmed",
    data: {
      quote,
      revision: `rev_${now}`,
      payment_method: "stripe",
      subscription_id: subscriptionId,
      order_id: orderId,
      order_number: orderNumber,
      display_id: orderNumber,
      consent: { ruo: true, recurring: true, version: "checkout-v1", accepted_at: new Date().toISOString() },
    },
  });
  logger.info(`✅ Created Attempt Record: ${attemptId} (Status: confirmed)`);

  // 6. Create Order in Medusa via importCommerceOrder workflow
  const orderInput = {
    id: orderId,
    display_id: displayId,
    custom_display_id: orderNumber,
    customer_id: customer.id,
    email: customer.email,
    currency_code: "gbp",
    region_id: defaultRegion.id,
    sales_channel_id: defaultSalesChannel.id,
    status: "pending",
    shipping_address: address,
    billing_address: address,
    no_notification: true,
    metadata: {
      peptech_receipt_id: receiptId,
      peptech_attempt: attemptId,
      payment_gateway: "stripe",
      subscription_id: subscriptionId,
      fulfillment_hold: true,
      tax_policy: "stripe_default",
      order_number_formatted: orderNumber,
      tags: ["Sub-Order", "28-Day Subscription"],
      is_subscription_order: true,
      order_type: "subscription_initial",
      cadence_days: 28,
      subscription_details: {
        subscription_id: subscriptionId,
        interval_days: 28,
        discount_percent: 10,
        renewal_total: totalGbp,
      },
    },
    items: [
      {
        id: lineItemId,
        variant_id: variant.id,
        title: product.title,
        variant_sku: variant.sku,
        quantity: 1,
        unit_price: 31.50,
        is_tax_inclusive: true,
        requires_shipping: true,
        metadata: {
          catalog_version: "v1",
          recurring: true,
          is_subscription: true,
          format: "cartridge",
          strength: "50mg",
          discount_applied: "10% Subscribe & Save",
        },
      },
    ],
    shipping_methods: [
      {
        name: "Royal Mail Tracked",
        amount: 4.95,
        shipping_option_id: shippingOption.id,
        is_tax_inclusive: true,
      },
    ],
  };

  await importCommerceOrder(container).run({
    input: orderInput,
    context: { transactionId: `tx_${orderId}` },
  });
  logger.info(`✅ Created Medusa Order: ${orderId} (${orderNumber}) with total £${totalGbp.toFixed(2)}`);

  // 7. Payment collection & Mark as paid
  const paymentCollectionResult = await createOrderPaymentCollectionWorkflow(container).run({
    input: {
      order_id: orderId,
      amount: totalGbp,
    },
  });
  const paymentCollection = paymentCollectionResult.result[0];

  await markPaymentCollectionAsPaid(container).run({
    input: {
      order_id: orderId,
      payment_collection_id: paymentCollection.id,
      captured_by: "Stripe Subscription Processor",
    },
  });
  logger.info(`✅ Payment Collection ${paymentCollection.id} captured as PAID for £${totalGbp.toFixed(2)}`);

  // 8. Create Confirmed Receipt Record in Commerce Ledger
  await ledger.create({
    id: receiptId,
    kind: "receipt",
    profile: "local:v1",
    owner_id: customer.id,
    state: "confirmed",
    data: {
      reference: `stripe_sub_${now}`,
      amount: totalMinor,
      currency: "gbp",
      attempt_id: attemptId,
      order_id: orderId,
      order_number: orderNumber,
      display_id: orderNumber,
      subscription_id: subscriptionId,
      collection_id: paymentCollection.id,
      quote,
    },
  });
  logger.info(`✅ Created Receipt Record: ${receiptId} (Status: confirmed)`);

  logger.info("=== SUBSCRIPTION ORDER PURCHASE SUCCESSFULLY COMPLETED ===");
  console.log(
    JSON.stringify({
      orderId,
      orderNumber,
      customerEmail: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      subscriptionId,
      cadenceDays: 28,
      cartridge: product.title,
      cartridgeSku: variant.sku,
      unitPrice: "£31.50 (10% discount applied from £35.00)",
      shipping: "£4.95 (Royal Mail Tracked)",
      total: `£${totalGbp.toFixed(2)}`,
      renewalTotal: `£${totalGbp.toFixed(2)} every 28 days`,
      paymentStatus: "paid",
      fulfillmentHold: true,
      tags: ["Sub-Order", "28-Day Subscription"],
    })
  );
}
