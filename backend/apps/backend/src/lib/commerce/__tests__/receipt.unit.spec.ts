import { signReceipt } from "../../../modules/stripe-checkout/service"
import { parseRefundAmount, refundProof } from "../refunds"
import { paymentEvidence } from "../settlement"

describe("native payment adapter receipt attestation", () => {
  const receipt = {
    profile: "acct_a:test:v1",
    receipt_id: "receipt_a",
    collection_id: "paycol_a",
    amount_minor: 1495,
    currency: "gbp",
    stripe_session_id: "cs_test_a",
    payment_intent_id: "pi_a",
  }

  it("survives Medusa adding its own session_id", () => {
    expect(signReceipt({ ...receipt, session_id: "payses_a" }, "secret")).toBe(signReceipt(receipt, "secret"))
  })

  it.each(["profile", "receipt_id", "collection_id", "amount_minor", "currency", "stripe_session_id", "payment_intent_id"])(
    "rejects changed %s",
    (field) => {
      expect(signReceipt({ ...receipt, [field]: "different" }, "secret")).not.toBe(signReceipt(receipt, "secret"))
    }
  )
})

describe("refund amount parsing & safety", () => {
  it("correctly parses decimal strings in GBP", () => {
    expect(parseRefundAmount("199.95", 19995)).toBe(19995)
    expect(parseRefundAmount("1.00", 19995)).toBe(100)
    expect(parseRefundAmount("0.50", 19995)).toBe(50)
  })

  it("correctly parses floating point numbers in GBP", () => {
    expect(parseRefundAmount(199.95, 19995)).toBe(19995)
    expect(parseRefundAmount(1.5, 19995)).toBe(150)
  })

  it("safely handles pre-converted minor integer units without 100x explosion", () => {
    // 19995 minor units against a 19995 minor unit charge should be 19995, not 1999500
    expect(parseRefundAmount(19995, 19995)).toBe(19995)
    expect(parseRefundAmount("19995", 19995)).toBe(19995)
  })

  it("generates deterministic HMAC refund proofs", () => {
    const proof1 = refundProof("receipt_1", "re_1", 19995, "secret_key")
    const proof2 = refundProof("receipt_1", "re_1", 19995, "secret_key")
    expect(proof1).toBe(proof2)
    expect(proof1.length).toBe(64)
  })
})

describe("paymentEvidence settlement reconciliation", () => {
  it("returns null when invoice is not paid", async () => {
    const invoice = { status: "open", total: 1000 }
    const evidence = await paymentEvidence({}, invoice)
    expect(evidence).toBeNull()
  })

  it("reconciles legacy invoice with top-level payment_intent", async () => {
    const invoice = {
      status: "paid",
      total: 18089,
      payment_intent: "pi_123",
      hosted_invoice_url: "https://stripe.com/invoice/123",
    }
    const mockStripe = {
      paymentIntents: {
        retrieve: jest.fn().mockResolvedValue({
          id: "pi_123",
          status: "succeeded",
          amount_received: 18089,
          latest_charge: { receipt_url: "https://stripe.com/receipt/123" },
        }),
      },
    }
    const evidence = await paymentEvidence(mockStripe, invoice)
    expect(evidence).toEqual({
      payment_intent_id: "pi_123",
      amount: 18089,
      receipt_url: "https://stripe.com/receipt/123",
    })
  })

  it("reconciles modern Stripe (2025-09-30.clover) invoice with nested payments.data structure", async () => {
    const invoice = {
      id: "in_123",
      status: "paid",
      total: 18089,
      amount_paid: 18089,
      payments: {
        data: [
          {
            payment: {
              payment_intent: "pi_modern_456",
            },
          },
        ],
      },
      hosted_invoice_url: "https://stripe.com/invoice/modern",
    }
    const mockStripe = {
      paymentIntents: {
        retrieve: jest.fn().mockResolvedValue({
          id: "pi_modern_456",
          status: "succeeded",
          amount_received: 18089,
          latest_charge: { receipt_url: "https://stripe.com/receipt/456" },
        }),
      },
    }
    const evidence = await paymentEvidence(mockStripe, invoice)
    expect(evidence).toEqual({
      payment_intent_id: "pi_modern_456",
      amount: 18089,
      receipt_url: "https://stripe.com/receipt/456",
    })
  })

  it("refreshes unexpanded invoice via stripe.invoices.retrieve if payments not present", async () => {
    const invoice = {
      id: "in_unexpanded",
      status: "paid",
      total: 18089,
      amount_paid: 18089,
      hosted_invoice_url: "https://stripe.com/invoice/unexpanded",
    }
    const mockStripe = {
      invoices: {
        retrieve: jest.fn().mockResolvedValue({
          id: "in_unexpanded",
          status: "paid",
          total: 18089,
          payments: {
            data: [
              {
                payment: {
                  payment_intent: { id: "pi_refreshed_789" },
                },
              },
            ],
          },
        }),
      },
      paymentIntents: {
        retrieve: jest.fn().mockResolvedValue({
          id: "pi_refreshed_789",
          status: "succeeded",
          amount_received: 18089,
          latest_charge: { receipt_url: "https://stripe.com/receipt/789" },
        }),
      },
    }
    const evidence = await paymentEvidence(mockStripe, invoice)
    expect(evidence).toEqual({
      payment_intent_id: "pi_refreshed_789",
      amount: 18089,
      receipt_url: "https://stripe.com/receipt/789",
    })
    expect(mockStripe.invoices.retrieve).toHaveBeenCalledWith("in_unexpanded", {
      expand: ["payments.data.payment.payment_intent"],
    })
  })

  it("falls back to hosted_invoice_url when invoice is paid and amount matches", async () => {
    const invoice = {
      id: "in_direct",
      status: "paid",
      total: 5000,
      amount_paid: 5000,
      hosted_invoice_url: "https://stripe.com/invoice/direct",
    }
    const mockStripe = {
      invoices: {
        retrieve: jest.fn().mockResolvedValue({
          id: "in_direct",
          status: "paid",
          total: 5000,
          amount_paid: 5000,
        }),
      },
    }
    const evidence = await paymentEvidence(mockStripe, invoice)
    expect(evidence).toEqual({
      payment_intent_id: null,
      amount: 5000,
      receipt_url: "https://stripe.com/invoice/direct",
    })
  })

  it("handles zero-total free invoice without failure", async () => {
    const invoice = {
      id: "in_free",
      status: "paid",
      total: 0,
      amount_paid: 0,
      hosted_invoice_url: "https://stripe.com/invoice/free",
    }
    const evidence = await paymentEvidence({}, invoice)
    expect(evidence).toEqual({
      payment_intent_id: null,
      amount: 0,
      receipt_url: "https://stripe.com/invoice/free",
    })
  })
})
