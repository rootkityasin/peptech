import type { PaymentGatewayAdapter, GatewayCheckoutInput, GatewayCheckoutResult } from "./types"
import type { LedgerRecord } from "../../../modules/peptech-commerce/service"
import { generateOrderNumber } from "../settlement"
import { fail } from "../policy"

export class BankTransferGatewayAdapter implements PaymentGatewayAdapter {
  id = "bank_transfer"
  name = "UK Faster Payments (Bank Transfer)"

  isConfigured(): boolean {
    return true
  }

  async createCheckoutSession(input: GatewayCheckoutInput): Promise<GatewayCheckoutResult> {
    if (input.quote.lines.some((l) => l.recurring)) {
      fail("28-day recurring subscriptions require an active card gateway. Switch items to one-time purchase to pay by UK Bank Transfer.", 400)
    }

    const transferReference = generateOrderNumber(input.attemptId)
    return {
      sessionId: `bt_${input.attemptId}`,
      transferReference,
      expiresAt: Math.floor(Date.now() / 1000) + 7 * 86400,
      state: "awaiting_transfer",
    }
  }

  async reconcileSession(sessionId: string): Promise<any> {
    return {
      id: sessionId,
      status: "awaiting_transfer",
      payment_status: "unpaid",
    }
  }

  async refundPayment(_receipt: LedgerRecord, _amountMinor: number, _note: string): Promise<any> {
    fail("Bank transfer refunds must be remitted manually via BACS / Faster Payments and recorded in the order notes.", 409)
  }
}

