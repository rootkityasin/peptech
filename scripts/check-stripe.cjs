// Read-only connection check. Never prints API keys or Stripe error payloads.
const path = require("node:path")
const backend = path.resolve(__dirname, "../backend/apps/backend")
const { loadStripeEnv, getStripeConfig } = require(path.join(backend, "src/lib/stripe-config.js"))

async function main() {
  loadStripeEnv()
  const config = getStripeConfig()
  if (!config) throw new Error("Stripe is disabled. Add the sandbox credentials to the root .env.")
  const Stripe = require(require.resolve("stripe", { paths: [backend] }))
  const client = new Stripe(config.apiKey)
  let account
  try { account = await client.accounts.retrieve() }
  catch { throw new Error("Stripe authentication or account lookup failed. Verify the key, network, and restricted-key account read permission.") }
  console.log(`\n=======================================================`)
  console.log(`   PEPTECH® Stripe Account Verification Status`)
  console.log(`=======================================================\n`)
  console.log(`  • Account ID:        ${account.id}`)
  console.log(`  • Business Name:     ${account.business_profile?.name || account.company?.name || "Not set"}`)
  console.log(`  • Business URL:      ${account.business_profile?.url || "Not set"}`)
  console.log(`  • Statement Name:    ${account.settings?.payments?.statement_descriptor || "Not set"}`)
  console.log(`  • Country / Entity:  ${account.country || "GB"}`)
  console.log(`  • Environment Mode:  ${config.mode.toUpperCase()} (${config.mode === "live" ? "Live Real Cards" : "Sandbox Test Mode"})`)
  console.log(`  • Details Submitted: ${account.details_submitted ? "✅ Yes" : "❌ Incomplete"}`)
  console.log(`  • Charges Enabled:   ${account.charges_enabled ? "✅ Enabled (Can accept payments)" : "❌ Disabled"}`)
  console.log(`  • Payouts Enabled:   ${account.payouts_enabled ? "✅ Enabled (Can receive bank payouts)" : "❌ Paused / Pending"}`)
  console.log(`  • Card Payments:     ${account.capabilities?.card_payments === "active" ? "✅ Active" : account.capabilities?.card_payments || "Inactive"}`)

  const due = account.requirements?.currently_due || []
  const pastDue = account.requirements?.past_due || []
  const disabledReason = account.requirements?.disabled_reason

  if (due.length > 0 || pastDue.length > 0 || disabledReason) {
    console.log(`\n⚠️  Verification Requirements Pending for this Business:`)
    if (disabledReason) console.log(`  • Disabled Reason: ${disabledReason}`)
    if (pastDue.length > 0) console.log(`  • Past Due:       ${pastDue.join(", ")}`)
    if (due.length > 0) console.log(`  • Currently Due:  ${due.join(", ")}`)
  } else {
    console.log(`  • Verification:      ✅ Fully Verified (No pending requirements)`)
  }

  console.log(`\n-------------------------------------------------------`)
  console.log(`Medusa region provider: ${config.providerId}`)
  console.log(`Webhook path:           ${config.webhookPath}`)
  console.log(`=======================================================\n`)
}
main().catch(error => { console.error("❌ " + error.message); process.exitCode = 1 })
