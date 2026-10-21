import test from "node:test"
import assert from "node:assert/strict"
import {
  buildStaffNotificationEmail,
  buildCustomerConfirmationEmail,
  sendContactInquiryEmails,
  type ContactInquiryPayload,
} from "../contact-email.ts"

test("Contact Email Suite", async (t) => {
  const samplePayload: ContactInquiryPayload = {
    name: "Dr. Alexander Wright",
    email: "alexander.wright@cambridge.ac.uk",
    institution: "Cambridge Centre for Molecular Pharmacology",
    inquiryType: "coa_batch",
    referenceId: "RT-2609A",
    message: "Requesting detailed HPLC chromatogram and mass spectrometry data for lot RT-2609A.",
    ruoAgreement: true,
  }

  const sampleTicketRef = "PEP-INQ-48291"

  await t.test("buildStaffNotificationEmail generates complete branded staff alert", () => {
    const { html, text } = buildStaffNotificationEmail(samplePayload, sampleTicketRef)

    // Verify HTML contains required elements
    assert.ok(html.includes("PEPTECH"), "HTML should contain PEPTECH brand mark")
    assert.ok(html.includes(sampleTicketRef), "HTML should contain the ticket reference")
    assert.ok(html.includes("Dr. Alexander Wright"), "HTML should contain researcher name")
    assert.ok(html.includes("alexander.wright@cambridge.ac.uk"), "HTML should contain researcher email")
    assert.ok(html.includes("Cambridge Centre for Molecular Pharmacology"), "HTML should contain institution")
    assert.ok(html.includes("RT-2609A"), "HTML should contain batch reference")
    assert.ok(html.includes("Certificate of Analysis (COA) / Batch Verification"), "HTML should map category label")
    assert.ok(html.includes("Requesting detailed HPLC chromatogram"), "HTML should contain inquiry message")
    assert.ok(html.includes("Confirmed 18+ Laboratory RUO Research Policy"), "HTML should confirm RUO compliance")

    // Verify plain text version
    assert.ok(text.includes(sampleTicketRef), "Text should contain ticket ref")
    assert.ok(text.includes("Dr. Alexander Wright"), "Text should contain researcher name")
    assert.ok(text.includes("alexander.wright@cambridge.ac.uk"), "Text should contain email")
    assert.ok(text.includes("RT-2609A"), "Text should contain batch reference")
  })

  await t.test("buildCustomerConfirmationEmail generates reassurance auto-responder with SLA", () => {
    const { html, text } = buildCustomerConfirmationEmail(samplePayload, sampleTicketRef)

    // Verify customer confirmation
    assert.ok(html.includes(sampleTicketRef), "Customer confirmation should contain ticket reference")
    assert.ok(html.includes("Dear Dr. Alexander Wright"), "Customer confirmation should greet respectfully with title")
    assert.ok(html.includes("Average Response SLA: Under 2 Hours"), "Customer confirmation should state SLA")
    assert.ok(html.includes("Certificate of Analysis (COA) / Batch Verification"), "Should display category")
    assert.ok(html.includes("support@peptech.bio"), "Should list support email")
    assert.ok(html.includes("peptech.bio/verify"), "Should link to verify page")

    // Verify plain text
    assert.ok(text.includes(sampleTicketRef), "Text should contain ticket ref")
    assert.ok(text.includes("under 2 hours"), "Text should mention SLA")
  })

  await t.test("sendContactInquiryEmails handles unconfigured SMTP in mock mode gracefully", async () => {
    // Save original env
    const origHost = process.env.STRIPE_EMAIL_HOST
    const origSmtpHost = process.env.SMTP_HOST
    const origContactHost = process.env.CONTACT_SMTP_HOST

    try {
      delete process.env.STRIPE_EMAIL_HOST
      delete process.env.SMTP_HOST
      delete process.env.CONTACT_SMTP_HOST

      const result = await sendContactInquiryEmails(samplePayload, sampleTicketRef)

      assert.equal(result.success, true, "Should report success")
      assert.equal(result.ticketRef, sampleTicketRef, "Should preserve ticket reference")
      assert.equal(result.mocked, true, "Should flag as mocked")
      assert.equal(result.dispatchedStaff, false, "Should not dispatch real email when unconfigured")
      assert.equal(result.dispatchedCustomer, false, "Should not dispatch real email when unconfigured")
    } finally {
      // Restore env
      if (origHost) process.env.STRIPE_EMAIL_HOST = origHost
      if (origSmtpHost) process.env.SMTP_HOST = origSmtpHost
      if (origContactHost) process.env.CONTACT_SMTP_HOST = origContactHost
    }
  })
})
