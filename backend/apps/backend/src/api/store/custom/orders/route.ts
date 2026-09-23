import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const orderModule = req.scope.resolve(Modules.ORDER);
    const customerId = req.query.customer_id as string;
    const email = req.query.email as string;

    if (!customerId && !email) {
      return res.status(200).json({ orders: [], count: 0 });
    }

    const filters: any = {};
    if (customerId) {
      filters.customer_id = customerId;
    } else if (email) {
      filters.email = email;
    }

    const [orders, count] = await orderModule.listAndCountOrders(filters, {
      relations: ["items", "shipping_address", "billing_address", "summary"],
      order: { created_at: "DESC" },
    });

    return res.status(200).json({ orders, count });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const orderModule = req.scope.resolve(Modules.ORDER);
    const body = req.body as any;

    if (!body.customer_id && !body.email) {
      return res.status(400).json({ message: "customer_id or email is required." });
    }

    const createdOrder = await orderModule.createOrders({
      customer_id: body.customer_id || null,
      email: body.email,
      currency_code: (body.currency_code || "gbp").toLowerCase(),
      status: (body.status || "pending") as any,
      metadata: body.metadata || {},
      shipping_address: body.shipping_address as any,
      billing_address: (body.billing_address || body.shipping_address) as any,
      items: (body.items || []) as any,
      shipping_methods: (body.shipping_methods || []) as any,
    });

    return res.status(201).json({ order: createdOrder });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
