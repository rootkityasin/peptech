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
  if (account.id !== config.accountId) throw new Error("STRIPE_ACCOUNT_ID does not match the account owning STRIPE_API_KEY.")
  console.log(`Connected to ${account.id} in ${config.mode} mode.`)
  console.log(`Medusa region provider: ${config.providerId}`)
  console.log(`Webhook path: ${config.webhookPath}`)
  console.log("Publishable key and webhook ownership still require an end-to-end payment test.")
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
