import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

const STRIPE_SECRET = process.env.STRIPE_API_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sig = req.headers["stripe-signature"] as string;
    let event: any = req.body;

    if (STRIPE_SECRET && STRIPE_WEBHOOK_SECRET && sig) {
      try {
        const Stripe = require("stripe");
        const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
        event = stripe.webhooks.constructEvent((req as any).rawBody || JSON.stringify(req.body), sig, STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.warn("[PEPTECH STRIPE WEBHOOK] Signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    const eventType = event.type;
    const dataObject = event.data?.object;

    console.log(`[PEPTECH STRIPE WEBHOOK] Event received: ${eventType}`);

    // Handle payment_intent.succeeded
    if (eventType === "payment_intent.succeeded") {
      const orderId = dataObject.metadata?.order_id || dataObject.metadata?.medusa_order_id;
      if (orderId) {
        try {
          const orderModule = req.scope.resolve(Modules.ORDER);
          const order = await orderModule.retrieveOrder(orderId);
          if (order) {
            await orderModule.updateOrders(orderId, {
              status: "completed" as any,
              metadata: {
                ...(order.metadata || {}),
                payment_status: "paid",
                stripe_payment_intent_id: dataObject.id,
                paid_at: new Date().toISOString(),
              },
            });
            console.log(`[PEPTECH STRIPE WEBHOOK] Order ${orderId} marked as paid`);
          }
        } catch (e: any) {
          console.error(`[PEPTECH STRIPE WEBHOOK] Error updating order:`, e.message);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[PEPTECH STRIPE WEBHOOK ERROR]", err);
    return res.status(500).json({ message: err.message });
  }
}
