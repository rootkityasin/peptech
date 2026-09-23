import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerId = req.query.customer_id as string;
    if (!customerId) {
      return res.status(400).json({ message: "customer_id query parameter is required." });
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const customer = await customerModule.retrieveCustomer(customerId);

    const subscriptions = Array.isArray(customer.metadata?.subscriptions)
      ? customer.metadata.subscriptions
      : [];

    return res.status(200).json({ subscriptions, count: subscriptions.length });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any;
    const { customer_id, title, price, quantity = 1, card_last4, shipping_address, image } = body;

    if (!customer_id || !title || price === undefined) {
      return res.status(400).json({ message: "customer_id, title, and price are required." });
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const customer = await customerModule.retrieveCustomer(customer_id);

    const existingSubs: any[] = Array.isArray(customer.metadata?.subscriptions)
      ? [...customer.metadata.subscriptions]
      : [];

    const subId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 28);
    const formattedDate = nextDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const newSub = {
      id: subId,
      title,
      frequency: "Every 28 Days (Standard Cycle)",
      status: "Active",
      price: Number(price),
      nextBillingDate: formattedDate,
      nextDispatchDate: formattedDate,
      quantity: Number(quantity),
      cardEnding: card_last4 || "Card on File",
      shipsTo: shipping_address || "Registered Laboratory Address",
      image: image || null,
      created_at: new Date().toISOString(),
    };

    existingSubs.unshift(newSub);

    await customerModule.updateCustomers(customer_id, {
      metadata: {
        ...(customer.metadata || {}),
        subscriptions: existingSubs,
      },
    });

    return res.status(201).json({ subscription: newSub });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any;
    const { customer_id, subscription_id, action } = body;

    if (!customer_id || !subscription_id || !action) {
      return res.status(400).json({ message: "customer_id, subscription_id, and action are required." });
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const customer = await customerModule.retrieveCustomer(customer_id);

    let existingSubs: any[] = Array.isArray(customer.metadata?.subscriptions)
      ? [...customer.metadata.subscriptions]
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

    await customerModule.updateCustomers(customer_id, {
      metadata: {
        ...(customer.metadata || {}),
        subscriptions: existingSubs,
      },
    });

    return res.status(200).json({ success: true, subscriptions: existingSubs });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
