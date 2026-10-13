import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import CommerceService, { recordId } from "../modules/peptech-commerce/service";

export default async function verifyAdminDashboard({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const ledger = container.resolve("peptechCommerce") as CommerceService;

  logger.info("=== VERIFYING MEDUSA ADMIN DASHBOARD STATE ===");

  // 1. Verify Cartridge in Medusa Product Catalog
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "status",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.prices.*",
      "categories.name",
      "categories.handle",
    ],
    filters: { handle: "cartridge-ghkcu50" },
  });

  const product = products[0];
  const variant = product?.variants?.[0];
  const catalogRecord = variant ? await ledger.get(recordId("catalog", variant.id)) : null;

  // 2. Verify Customer
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "email",
      "first_name",
      "last_name",
      "company_name",
      "has_account",
      "created_at",
    ],
    filters: { email: "test.subscriber@peptech.bio" },
  });

  const customer = customers[0];

  // 3. Verify Order
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "custom_display_id",
      "status",
      "email",
      "total",
      "currency_code",
      "metadata",
      "items.*",
      "shipping_methods.*",
      "payment_collections.*",
      "payment_collections.payments.*",
    ],
    filters: { email: "test.subscriber@peptech.bio" },
  });

  const order = orders.find((o: any) => o.metadata?.is_subscription_order) || orders[0];

  // 4. Verify Subscriptions in Commerce Ledger
  const subscriptions = await ledger.list("subscription", {
    owner: customer?.id,
    limit: 10,
  });

  const latestSub = subscriptions[0];

  // 5. Verification Summary Object
  const verification = {
    cartridgeProduct: {
      id: product?.id,
      title: product?.title,
      handle: product?.handle,
      status: product?.status,
      variantId: variant?.id,
      sku: variant?.sku,
      category: product?.categories?.[0]?.name,
      prices: (variant as any)?.prices?.map((p: any) => `${p.currency_code.toUpperCase()} ${p.amount}`),
      ledgerApproval: catalogRecord?.state === "approved" ? "APPROVED" : "PENDING",
      destinations: catalogRecord?.data?.destinations,
    },
    customerAccount: {
      id: customer?.id,
      email: customer?.email,
      name: `${customer?.first_name} ${customer?.last_name}`,
      company: customer?.company_name,
      hasAccount: customer?.has_account,
    },
    subscriptionOrder: {
      id: order?.id,
      orderNumber: order?.custom_display_id || `PEP-${order?.display_id}`,
      email: order?.email,
      status: order?.status,
      total: `£${Number(order?.total).toFixed(2)}`,
      paymentStatus:
        order?.payment_collections?.[0]?.status ||
        order?.payment_collections?.[0]?.payments?.[0]?.captured_at
          ? "paid"
          : "pending",
      tags: order?.metadata?.tags,
      subscriptionId: order?.metadata?.subscription_id,
      lineItems: order?.items?.map((item: any) => ({
        title: item.title,
        sku: item.variant_sku,
        quantity: item.quantity,
        unitPrice: `£${Number(item.unit_price).toFixed(2)}`,
        recurring: item.metadata?.recurring,
        discount: item.metadata?.discount_applied,
      })),
      shipping: order?.shipping_methods?.[0]?.name,
    },
    activeSubscription: {
      id: latestSub?.id,
      state: latestSub?.state,
      ownerId: latestSub?.owner_id,
      cadenceDays: latestSub?.data?.cadence_days || 28,
      nextBillingDate: latestSub?.data?.next_billing_at
        ? new Date(latestSub.data.next_billing_at * 1000).toISOString()
        : null,
      items: latestSub?.data?.items,
      renewalAmount: latestSub?.data?.quote?.renewal_minor
        ? `£${(latestSub.data.quote.renewal_minor / 100).toFixed(2)}`
        : null,
    },
  };

  logger.info("=== VERIFICATION RESULTS ===");
  console.log(JSON.stringify(verification, null, 2));
}
