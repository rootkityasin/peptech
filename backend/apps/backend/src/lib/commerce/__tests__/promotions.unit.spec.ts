import {
  calculatePromotionDiscount,
  lookupActivePromotion,
  recordPromotionUsage,
  type PromotionRecord,
} from "../promotions"
import { checkoutSchema } from "../policy"

describe("Promotions Engine & Security Boundary", () => {
  describe("checkoutSchema promo_code validation", () => {
    const validBase = {
      revision: "f243ef68-7314-48f7-a5b7-58bcc57703f3",
      address: {
        first_name: "Dr. Jane",
        last_name: "Doe",
        address_1: "Biotech Lab 4",
        city: "Oxford",
        postal_code: "OX1 2JD",
        country_code: "gb",
      },
      items: [{ variant_id: "var_pen_01", quantity: 1, recurring: false }],
      ruo_accepted: true,
      recurring_accepted: false,
    }

    it("accepts valid optional promo_code", () => {
      const parsed = checkoutSchema.parse({ ...validBase, promo_code: "WELCOME10" })
      expect(parsed.promo_code).toBe("WELCOME10")
    })

    it("trims whitespace from promo_code", () => {
      const parsed = checkoutSchema.parse({ ...validBase, promo_code: "  WELCOME10  " })
      expect(parsed.promo_code).toBe("WELCOME10")
    })

    it("rejects promo_code exceeding 50 characters", () => {
      expect(() =>
        checkoutSchema.parse({ ...validBase, promo_code: "A".repeat(51) })
      ).toThrow()
    })
  })

  describe("calculatePromotionDiscount", () => {
    const percentagePromo: PromotionRecord = {
      id: "promo_pct_10",
      code: "SAVE10",
      status: "active",
      type: "standard",
      limit: null,
      used: 0,
      metadata: null,
      method_type: "percentage",
      value: 10,
      target_type: "items",
      allocation: null,
      currency_code: "gbp",
    }

    const fixedPromo: PromotionRecord = {
      id: "promo_fix_15",
      code: "FLAT15",
      status: "active",
      type: "standard",
      limit: null,
      used: 0,
      metadata: null,
      method_type: "fixed",
      value: 15, // £15.00
      target_type: "items",
      allocation: null,
      currency_code: "gbp",
    }

    it("calculates percentage discount on one-time items", () => {
      const items = [{ unit_minor: 10000, quantity: 1, recurring: false }] // £100.00
      const discount = calculatePromotionDiscount(percentagePromo, items)
      expect(discount).toBe(1000) // 10% of £100 = £10.00 = 1000 pence
    })

    it("calculates fixed amount discount on one-time items", () => {
      const items = [{ unit_minor: 5000, quantity: 2, recurring: false }] // £100.00 total
      const discount = calculatePromotionDiscount(fixedPromo, items)
      expect(discount).toBe(1500) // £15 = 1500 pence
    })

    it("enforces Stacking Guard: excludes subscriptions from promo code discounts", () => {
      // Cart with 1 subscription item (£50) and 1 one-time item (£100)
      const mixedItems = [
        { unit_minor: 5000, quantity: 1, recurring: true },
        { unit_minor: 10000, quantity: 1, recurring: false },
      ]
      const discount = calculatePromotionDiscount(percentagePromo, mixedItems)
      // 10% applies strictly to the £100 one-time item (1000 pence), NOT the £150 total
      expect(discount).toBe(1000)
    })

    it("returns 0 discount when cart contains only subscription items", () => {
      const subOnlyItems = [
        { unit_minor: 4500, quantity: 2, recurring: true },
      ]
      const discount = calculatePromotionDiscount(percentagePromo, subOnlyItems)
      expect(discount).toBe(0)
    })

    it("caps discount at eligible subtotal (cannot be greater than cart total)", () => {
      const smallCart = [{ unit_minor: 1000, quantity: 1, recurring: false }] // £10.00
      const bigDiscountPromo: PromotionRecord = {
        ...fixedPromo,
        value: 50, // £50 discount on a £10 cart
      }
      const discount = calculatePromotionDiscount(bigDiscountPromo, smallCart)
      expect(discount).toBe(1000) // capped at £10.00
    })
  })

  describe("lookupActivePromotion with mock db", () => {
    it("returns invalid when promo code is empty", async () => {
      const result = await lookupActivePromotion("")
      expect(result.valid).toBe(false)
      expect(result.message).toContain("required")
    })

    it("returns invalid when promo code is not found in database", async () => {
      const mockPool: any = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      }
      const result = await lookupActivePromotion("UNKNOWN99", mockPool)
      expect(result.valid).toBe(false)
      expect(result.message).toContain("was not found")
      expect(mockPool.query).toHaveBeenCalledTimes(1)
    })

    it("rejects promo code if status is inactive", async () => {
      const mockPool: any = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              id: "promo_inactive",
              code: "INACTIVE10",
              status: "inactive",
              type: "standard",
              limit: null,
              used: 0,
              value: "10",
              method_type: "percentage",
            },
          ],
        }),
      }
      const result = await lookupActivePromotion("INACTIVE10", mockPool)
      expect(result.valid).toBe(false)
      expect(result.message).toContain("inactive")
    })

    it("rejects promo code if usage limit has been reached", async () => {
      const mockPool: any = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              id: "promo_maxed",
              code: "LIMITED20",
              status: "active",
              type: "standard",
              limit: 50,
              used: 50,
              value: "20",
              method_type: "percentage",
            },
          ],
        }),
      }
      const result = await lookupActivePromotion("LIMITED20", mockPool)
      expect(result.valid).toBe(false)
      expect(result.message).toContain("maximum redemption limit")
    })

    it("successfully validates active promotion and parses fields", async () => {
      const mockPool: any = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              id: "promo_active_10",
              code: "RESEARCH10",
              status: "active",
              type: "standard",
              limit: 100,
              used: 12,
              value: "10.00",
              method_type: "percentage",
              target_type: "items",
              metadata: { title: "Research Partner 10%" },
            },
          ],
        }),
      }
      const result = await lookupActivePromotion("RESEARCH10", mockPool)
      expect(result.valid).toBe(true)
      expect(result.promotion).toBeDefined()
      expect(result.promotion?.code).toBe("RESEARCH10")
      expect(result.promotion?.value).toBe(10)
      expect(result.promotion?.used).toBe(12)
    })
  })

  describe("recordPromotionUsage with mock db", () => {
    it("increments used count and inserts order_promotion link", async () => {
      const mockPool: any = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [{ id: "promo_123" }] }) // select id
          .mockResolvedValueOnce({ rows: [] }) // update used
          .mockResolvedValueOnce({ rows: [] }), // insert order_promotion
      }
      await recordPromotionUsage("RESEARCH10", "order_test_999", mockPool)

      expect(mockPool.query).toHaveBeenCalledTimes(3)
      expect(mockPool.query.mock.calls[0][0]).toContain("SELECT id FROM promotion")
      expect(mockPool.query.mock.calls[1][0]).toContain("UPDATE promotion SET used")
      expect(mockPool.query.mock.calls[2][0]).toContain("INSERT INTO order_promotion")
      expect(mockPool.query.mock.calls[2][1][1]).toBe("order_test_999")
      expect(mockPool.query.mock.calls[2][1][2]).toBe("promo_123")
    })
  })
})
