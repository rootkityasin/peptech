import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const orderModule = req.scope.resolve(Modules.ORDER);

    const [customers] = await customerModule.listAndCountCustomers({}, {
      take: 100,
      select: ["id", "email", "first_name", "last_name", "metadata"],
    });

    const subscriptions: any[] = [];
    for (const cust of customers) {
      const list = Array.isArray(cust.metadata?.subscriptions) ? cust.metadata.subscriptions : [];
      for (const s of list) {
        subscriptions.push({
          ...s,
          customer_id: cust.id,
          customer_email: cust.email,
          customer_name: `${cust.first_name || ""} ${cust.last_name || ""}`.trim() || cust.email,
        });
      }
    }

    // Also check if any orders have subscription renewals not yet in customer metadata
    const [orders] = await orderModule.listAndCountOrders({
      // all orders to scan for subscription metadata
    }, {
      take: 50,
      select: ["id", "display_id", "email", "total", "currency_code", "created_at", "status", "metadata"],
      order: { created_at: "DESC" },
    });

    const subscriptionOrders = (orders || []).filter((o: any) => {
      const meta = o.metadata || {};
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      return meta.order_type === "subscription_renewal" ||
             Boolean(meta.subscription_id) ||
             tags.some((t: any) => String(t).toLowerCase().includes("subscri"));
    });

    // If a subscription order has a sub ID not in subscriptions list, synthesize it
    for (const sOrder of subscriptionOrders) {
      const subId = sOrder.metadata?.subscription_id;
      if (subId && !subscriptions.some(s => s.id === subId)) {
        subscriptions.push({
          id: subId,
          title: "GVK-00 50 Test Cartridge (3ml Prefilled)",
          frequency: "Every 28 Days (Standard Cycle)",
          status: "Active",
          price: sOrder.metadata?.subtotal || 44.10,
          nextBillingDate: "18 Nov 2026",
          nextDispatchDate: "18 Nov 2026",
          quantity: 1,
          cardEnding: sOrder.metadata?.card_last4 || "4242",
          shipsTo: "Registered Laboratory Address",
          customer_id: sOrder.customer_id || null,
          customer_email: sOrder.email,
          customer_name: sOrder.email?.split("@")[0] || "Active Subscriber",
          created_at: sOrder.created_at,
        });
      }
    }

    return res.status(200).json({
      subscriptions,
      subscription_orders: subscriptionOrders,
      count: subscriptions.length,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any;
    const { customer_id, subscription_id, action } = body;

    if (!subscription_id || !action) {
      return res.status(400).json({ message: "subscription_id and action are required." });
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    
    // Find customer by customer_id or by searching customers
    let targetCustomer: any = null;
    if (customer_id) {
      try {
        targetCustomer = await customerModule.retrieveCustomer(customer_id);
      } catch {}
    }

    if (!targetCustomer) {
      const [allCusts] = await customerModule.listAndCountCustomers({}, { take: 100 });
      targetCustomer = allCusts.find((c: any) =>
        Array.isArray(c.metadata?.subscriptions) &&
        c.metadata.subscriptions.some((s: any) => s.id === subscription_id)
      );
    }

    if (!targetCustomer) {
      return res.status(404).json({ message: `Customer with subscription ${subscription_id} not found.` });
    }

    let existingSubs: any[] = Array.isArray(targetCustomer.metadata?.subscriptions)
      ? [...targetCustomer.metadata.subscriptions]
      : [];

    if (action === "cancel") {
      existingSubs = existingSubs.filter((s) => s.id !== subscription_id);
    } else {
      existingSubs = existingSubs.map((s) => {
        if (s.id !== subscription_id) return s;

        if (action === "pause") {
          return { ...s, status: "Paused" };
        }
        if (action === "resume") {
          return { ...s, status: "Active" };
        }
        if (action === "skip") {
          const currentBilling = new Date(s.nextBillingDate || Date.now());
          const newBilling = isNaN(currentBilling.getTime()) ? new Date() : currentBilling;
          newBilling.setDate(newBilling.getDate() + 28);
          const formatted = newBilling.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return {
            ...s,
            nextBillingDate: formatted,
            nextDispatchDate: formatted,
          };
        }
        return s;
      });
    }

    await customerModule.updateCustomers(targetCustomer.id, {
      metadata: {
        ...(targetCustomer.metadata || {}),
        subscriptions: existingSubs,
      },
    });

    return res.status(200).json({ success: true, subscriptions: existingSubs });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
