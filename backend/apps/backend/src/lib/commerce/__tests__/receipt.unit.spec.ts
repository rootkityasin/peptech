import { signReceipt } from "../../../modules/stripe-checkout/service"
import { parseRefundAmount, refundProof } from "../refunds"

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
