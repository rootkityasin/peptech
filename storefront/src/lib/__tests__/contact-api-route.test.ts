import test from "node:test"
import assert from "node:assert/strict"
import { POST } from "../../app/api/contact/route.ts"

test("Contact API Route Suite", async (t) => {
  await t.test("Rejects empty or non-object body with 400", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.message.includes("Invalid JSON"))
  })

  await t.test("Triggers honeypot bot trap silently with 200 when _fax_verification is filled", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spam Bot",
        email: "bot@spam.com",
        message: "Buy cheap products now",
        _fax_verification: "spam-bot-value",
      }),
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
    assert.match(json.ticketRef, /^PEP-INQ-\d{5}$/)
  })

  await t.test("Validates name length (minimum 2 chars)", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "researcher@lab.ac.uk",
        message: "Valid scientific inquiry details here.",
        ruoAgreement: true,
      }),
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.message.includes("name"))
  })

  await t.test("Validates email format", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dr. Jane Doe",
        email: "invalid-email-address",
        message: "Valid scientific inquiry details here.",
        ruoAgreement: true,
      }),
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.message.includes("email"))
  })

  await t.test("Validates RUO agreement is confirmed", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dr. Jane Doe",
        email: "jane.doe@cambridge.ac.uk",
        message: "Valid scientific inquiry details here.",
        ruoAgreement: false,
      }),
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.equal(json.success, false)
    assert.ok(json.message.includes("RUO"))
  })

  await t.test("Successfully processes valid inquiry payload and returns ticketRef", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.50",
      },
      body: JSON.stringify({
        name: "Dr. Jane Doe",
        email: "jane.doe@cambridge.ac.uk",
        institution: "Cambridge Institute",
        inquiryType: "hardware_specs",
        referenceId: "RT-2609A",
        message: "Inquiring about reusable pen tolerances and borosilicate cartridge durability.",
        ruoAgreement: true,
      }),
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
    assert.match(json.ticketRef, /^PEP-INQ-\d{5}$/)
    assert.ok(json.message.includes("logged"))
  })
})
