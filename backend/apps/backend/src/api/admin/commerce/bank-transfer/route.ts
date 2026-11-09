import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { operator, commerce, endpoint } from "../../../../lib/commerce/http"
import { settleReceipt } from "../../../../lib/commerce/settlement"
import { fail, toMinor } from "../../../../lib/commerce/policy"

const schema = z.object({
  attempt_id: z.string().min(1),
  bank_transaction_id: z.string().trim().min(1).max(150),
  statement_reference: z.string().trim().min(1).max(300),
  amount: z.union([z.string(), z.number()]),
}).strict()

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = operator(req)
    const input = schema.parse(req.body)
    const ledger = commerce(req)

    const attempt = await ledger.get(input.attempt_id)
    if (!attempt || attempt.kind !== "attempt") {
      fail("Checkout attempt not found.", 404)
    }
    if (!["awaiting_transfer", "creating", "open", "confirmed"].includes(attempt.state)) {
      fail(`Cannot confirm bank transfer for attempt in state "${attempt.state}".`, 409)
    }

    const q = attempt.data?.quote
    const amountMinor = toMinor(input.amount)
    if (!q || amountMinor !== q.total_minor) {
      fail(
        `Confirmed amount (£${(amountMinor / 100).toFixed(2)}) must match order total (£${((q?.total_minor || 0) / 100).toFixed(2)}).`,
        409
      )
    }

    const receipt = await settleReceipt(req.scope, ledger, attempt, {
      reference: input.bank_transaction_id,
      amount: amountMinor,
      currency: q.currency || "gbp",
      payment_intent_id: null,
      source: "bank_transfer",
      verified_by: admin,
    })

    await ledger.audit(attempt.id, admin, "bank-transfer-confirmed", {
      bank_transaction_id: input.bank_transaction_id,
      statement_reference: input.statement_reference,
      amount_minor: amountMinor,
      receipt_id: receipt.id,
      order_id: receipt.data?.order_id,
    })

    return { receipt }
  })
}
