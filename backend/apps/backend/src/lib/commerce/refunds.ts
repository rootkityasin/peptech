import { z } from "zod"
import { Modules } from "@medusajs/framework/utils"
import { refundPaymentWorkflow } from "@medusajs/medusa/core-flows"
import CommerceService, { recordId } from "../../modules/peptech-commerce/service"
import { stripeContext } from "./stripe"
import { fail, toMinor } from "./policy"
import { createHmac } from "node:crypto"

const schema = z.object({
  order_id: z.string().min(1),
  operation_id: z.string().uuid(),
  amount: z.union([z.string(), z.number()]),
  note: z.string().max(1000).default(""),
}).strict()

export function refundProof(receipt: string, refund: string, amount: number, secret: string) {
  return createHmac("sha256", secret).update(JSON.stringify([receipt, refund, amount])).digest("hex")
}

export function parseRefundAmount(rawAmount: string | number, maxMinorAmount?: number): number {
  if (typeof rawAmount === "string" && rawAmount.includes(".")) {
    return toMinor(rawAmount)
  }
  if (typeof rawAmount === "number" && !Number.isInteger(rawAmount)) {
    return toMinor(rawAmount.toFixed(2))
  }
  const rawNum = typeof rawAmount === "string" ? parseInt(rawAmount, 10) : rawAmount
  if (maxMinorAmount && rawNum > 0 && rawNum <= maxMinorAmount && rawNum * 100 > maxMinorAmount) {
    // Already in minor units (e.g. 19995 pence against a 19995 pence receipt)
    return rawNum
  }
  return toMinor(rawAmount)
}

export async function refundOrder(scope: any, ledger: CommerceService, admin: string, body: unknown) {
  const input = schema.parse(body)
  const context = stripeContext()

  return ledger.locked(`refund:${input.order_id}`, async () => {
    const order = await scope.resolve(Modules.ORDER).retrieveOrder(input.order_id)
    const receipt = await ledger.get(order.metadata?.peptech_receipt_id)
    if (!receipt || receipt.profile !== context.profile || !receipt.data.payment_intent_id || !receipt.data.payment_id) {
      fail("No verified Stripe payment is linked to this order", 409)
    }

    const chargedMinor = receipt.data.amount || receipt.data.amount_minor || 0
    const amount = parseRefundAmount(input.amount, chargedMinor)
    if (amount <= 0) fail("Refund amount must be positive")
    if (chargedMinor > 0 && amount > chargedMinor) {
      fail(`Refund amount (£${(amount / 100).toFixed(2)}) cannot exceed the original charge amount (£${(chargedMinor / 100).toFixed(2)})`)
    }

    const id = recordId("refund", receipt.id, input.operation_id)
    let operation = await ledger.get(id)
    if (operation && (operation.data.amount !== amount || operation.data.note !== input.note)) {
      fail("Refund operation changed", 409)
    }
    if (operation?.state === "done") {
      return { refund_id: operation.data.stripe_refund_id, status: "succeeded" }
    }
    if (!operation) {
      const unresolved = (await ledger.list("refund", { profile: context.profile, limit: 500 })).find(
        (r) => r.data.order_id === input.order_id && r.state !== "done" && r.state !== "failed" && r.state !== "canceled"
      )
      if (unresolved) {
        fail("A previous refund is still being reconciled. Retry that operation first.", 409)
      }
    }
    if (!operation) {
      operation = await ledger.create({
        id,
        kind: "refund",
        profile: context.profile,
        owner_id: receipt.owner_id,
        state: "pending",
        data: {
          amount,
          note: input.note,
          operation_id: input.operation_id,
          admin_id: admin,
          receipt_id: receipt.id,
          order_id: input.order_id,
          payment_id: receipt.data.payment_id,
        },
      })
    }

    if (!operation.data.stripe_refund_id) {
      if (Date.now() - new Date(operation.created_at).getTime() > 23 * 3600000) {
        fail("Refund requires reconciliation before retry", 409)
      }
      try {
        const refund = await context.stripe.refunds.create(
          {
            payment_intent: receipt.data.payment_intent_id,
            amount,
            metadata: { peptech_operation: id },
          },
          { idempotencyKey: id }
        )
        operation.data.stripe_refund_id = refund.id
        await ledger.save(operation)
      } catch (stripeErr: any) {
        operation.state = "failed"
        operation.data.last_error = stripeErr?.message || "Stripe refund failed"
        await ledger.save(operation)
        await ledger.audit(receipt.id, admin, "refund-failed", {
          error: stripeErr?.message,
          amount_minor: amount,
          operation_id: id,
        })
        throw stripeErr
      }
    }

    return finishRefund(scope, ledger, operation, admin)
  })
}

export async function finishRefund(scope: any, ledger: CommerceService, operation: any, admin: string) {
  const context = stripeContext()
  if (operation.profile !== context.profile) fail("Refund belongs to a different credential profile", 409)
  const receipt = await ledger.get(operation.data.receipt_id)
  if (!receipt) fail("Receipt not found", 404)
  const order = await scope.resolve(Modules.ORDER).retrieveOrder(operation.data.order_id)
  const id = operation.id, amount = operation.data.amount
  const refund = await context.stripe.refunds.retrieve(operation.data.stripe_refund_id)
  if (refund.status !== "succeeded") {
    operation.state = refund.status || "pending"
    await ledger.save(operation)
    return { refund_id: refund.id, status: refund.status }
  }
  const paymentService = scope.resolve(Modules.PAYMENT)
  const payment = await paymentService.retrievePayment(receipt!.data.payment_id, { relations: ["refunds"] })
  const note = `${id}: ${operation.data.note}`
  if (!payment.refunds?.some((r: any) => r.note === note)) {
    await paymentService.updatePayments({
      id: payment.id,
      data: {
        ...payment.data,
        approved_refund: {
          id: refund.id,
          amount,
          attestation: refundProof(receipt!.id, refund.id, amount, context.signingSecret),
        },
      },
    })
    await refundPaymentWorkflow(scope).run({
      input: { payment_id: payment.id, amount: amount / 100, note, created_by: admin },
    })
  }
  operation.state = "done"
  await ledger.save(operation)

  // Update receipt state in the ledger
  const chargedMinor = receipt.data.amount || receipt.data.amount_minor || receipt.data.quote?.total_minor || 0
  const previousRefundedMinor = receipt.data.refunded_minor || 0
  const totalRefundedMinor = previousRefundedMinor + amount
  const isFullyRefunded = chargedMinor > 0 && totalRefundedMinor >= chargedMinor

  receipt.state = isFullyRefunded ? "refunded" : "partially_refunded"
  receipt.data = {
    ...receipt.data,
    refund_status: isFullyRefunded ? "refunded" : "partially_refunded",
    refunded_minor: totalRefundedMinor,
    refunded_amount_gbp: (totalRefundedMinor / 100).toFixed(2),
    stripe_refund_id: refund.id,
    refunded_at: new Date().toISOString(),
    refund_note: operation.data.note,
  }
  await ledger.save(receipt)

  await ledger.audit(receipt!.id, admin, "refund-succeeded", {
    refund_id: refund.id,
    amount_minor: amount,
    operation_id: id,
  })

  // Update Medusa Order metadata so Storefront and Admin reflect refunded status
  await scope.resolve(Modules.ORDER).updateOrders(operation.data.order_id, {
    metadata: {
      ...order.metadata,
      fulfillment_hold: true,
      refund_review: true,
      payment_status: isFullyRefunded ? "refunded" : "partially_refunded",
      refund_status: isFullyRefunded ? "refunded" : "partially_refunded",
      refunded_amount_minor: totalRefundedMinor,
      refunded_amount_gbp: (totalRefundedMinor / 100).toFixed(2),
      refunded_at: new Date().toISOString(),
      stripe_refund_id: refund.id,
    },
  })
  return { refund_id: refund.id, status: "succeeded" }
}

