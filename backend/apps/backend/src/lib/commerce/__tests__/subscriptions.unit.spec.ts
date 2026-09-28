import { commandSchema, presentSubscription } from "../subscriptions"

describe("subscription commands and presentation", () => {
  const mockRecord: any = {
    id: "sub_test_123",
    kind: "subscription",
    profile: "test",
    owner_id: "cus_123",
    state: "active",
    data: {
      stripe_id: "sub_stripe_123",
      attempt_id: "att_123",
      cadence_days: 28,
      next_billing_at: Math.floor(Date.now() / 1000) + 86400 * 14,
      control: "active",
      cancel_at_period_end: false,
      quote: {
        renewal_minor: 11000,
        shipping_minor: 495,
        currency: "gbp",
        lines: [
          {
            name: "Semaglutide Multi-Dose Cartridge (5mg)",
            quantity: 1,
            recurring: true,
            unit_minor: 11000,
            metadata: {
              format: "cartridge",
              strength: "5mg",
              options: [{ label: "Cartridge Protocol", value: "0.25mg Weekly Escalation Protocol · 4 Doses / Refill" }],
            },
          },
        ],
        address: {
          first_name: "Alexander",
          last_name: "Wright",
          company: "Cambridge Science Park Lab",
          address_1: "Milton Rd",
          city: "Cambridge",
          postal_code: "CB4 0GZ",
          country_code: "gb",
        },
      },
    },
  }

  it("presents subscription with rich fields matching reference requirements", () => {
    const presented = presentSubscription(mockRecord)
    expect(presented.sub_display_id).toMatch(/^SUB-/)
    expect(presented.title).toBe("Semaglutide Multi-Dose Cartridge (5mg)")
    expect(presented.price).toBe(110)
    expect(presented.cadence_days).toBe(28)
    expect(presented.frequency).toBe("Every 28 Days (Standard Cycle)")
    expect(presented.recipient_name).toBe("Alexander Wright")
    expect(presented.recipient_facility).toBe("Cambridge Science Park Lab")
    expect(presented.protocol_info).toContain("0.25mg Weekly Escalation Protocol")
    expect(presented.nextBillingDate).toBeDefined()
    expect(presented.nextDispatchDate).toBeDefined()
  })

  it("validates command schema actions including change_cadence, pause with months, update_dosage, and change_date", () => {
    const validCommands = [
      { subscription_id: "sub_1", operation_id: "123e4567-e89b-42d3-a456-426614174000", action: "pause", pause_duration_months: 2 },
      { subscription_id: "sub_1", operation_id: "223e4567-e89b-42d3-a456-426614174001", action: "resume" },
      { subscription_id: "sub_1", operation_id: "323e4567-e89b-42d3-a456-426614174002", action: "skip" },
      { subscription_id: "sub_1", operation_id: "423e4567-e89b-42d3-a456-426614174003", action: "change_cadence", cadence_days: 14 },
      { subscription_id: "sub_1", operation_id: "523e4567-e89b-42d3-a456-426614174004", action: "change_date", date: new Date(Date.now() + 864000000).toISOString() },
      { subscription_id: "sub_1", operation_id: "623e4567-e89b-42d3-a456-426614174005", action: "cancel" },
      { subscription_id: "sub_1", operation_id: "723e4567-e89b-42d3-a456-426614174006", action: "update_dosage", strength: "10mg" },
      { subscription_id: "sub_1", operation_id: "823e4567-e89b-42d3-a456-426614174007", action: "update_address", address: { address_1: "New Lab Wing" } },
    ]

    for (const cmd of validCommands) {
      expect(() => commandSchema.parse(cmd)).not.toThrow()
    }

    // Invalid action or extra unknown fields
    expect(() => commandSchema.parse({ subscription_id: "sub_1", operation_id: "123e4567-e89b-42d3-a456-426614174000", action: "invalid_action" })).toThrow()
    expect(() => commandSchema.parse({ subscription_id: "sub_1", operation_id: "123e4567-e89b-42d3-a456-426614174000", action: "pause", unknown_field: true })).toThrow()
  })

  it("computes proper cadence labels and skip calculations", () => {
    const accRecord = { ...mockRecord, data: { ...mockRecord.data, cadence_days: 14 } }
    const accPresented = presentSubscription(accRecord)
    expect(accPresented.cadence_label).toBe("Accelerated Protocol")
    expect(accPresented.frequency).toBe("Every 14 Days (Accelerated Protocol)")

    const mainRecord = { ...mockRecord, data: { ...mockRecord.data, cadence_days: 56 } }
    const mainPresented = presentSubscription(mainRecord)
    expect(mainPresented.cadence_label).toBe("8-Week Maintenance")
    expect(mainPresented.frequency).toBe("Every 56 Days (8-Week Maintenance)")
  })
})
