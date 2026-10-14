const fs = require("node:fs")
const path = require("node:path")
const { execFileSync } = require("node:child_process")

const rootDir = path.resolve(__dirname, "..")
const envFile = path.join(rootDir, ".env")
const stripeBin = path.join(__dirname, "bin/stripe")

if (!fs.existsSync(envFile)) {
  console.error("❌ Root .env not found.")
  process.exit(1)
}

if (!fs.existsSync(stripeBin)) {
  console.error("❌ Stripe CLI binary not found at scripts/bin/stripe.")
  process.exit(1)
}

const envContent = fs.readFileSync(envFile, "utf8")
const matchKey = /STRIPE_API_KEY\s*=\s*(sk_[^\s\r\n]+|rk_[^\s\r\n]+)/.exec(envContent)

if (!matchKey) {
  console.error("❌ STRIPE_API_KEY not found in root .env.")
  process.exit(1)
}

const apiKey = matchKey[1].trim()
console.log(`\n=======================================================`)
console.log(`   Generating Local Stripe Webhook Signing Secret`)
console.log(`=======================================================`)
console.log(`Key Prefix: ${apiKey.slice(0, 12)}...`)

try {
  const secret = execFileSync(stripeBin, [
    "listen",
    "--skip-update",
    "--print-secret",
    "--api-key",
    apiKey,
  ], { encoding: "utf8" }).trim()

  console.log(`\n✅ Webhook Signing Secret Generated:`)
  console.log(`   ${secret}\n`)

  // Update STRIPE_WEBHOOK_SECRET in .env if requested or automatically
  if (process.argv.includes("--save") || process.argv.includes("-s")) {
    const updated = envContent.replace(
      /STRIPE_WEBHOOK_SECRET\s*=\s*[^\s\r\n]*/,
      `STRIPE_WEBHOOK_SECRET=${secret}`
    )
    fs.writeFileSync(envFile, updated, "utf8")
    console.log(`💾 Automatically saved to root .env under STRIPE_WEBHOOK_SECRET!`)
  } else {
    console.log(`👉 To automatically save this into your .env, run:`)
    console.log(`   node scripts/generate-webhook-secret.cjs --save\n`)
  }
} catch (error) {
  console.error(`❌ Failed to generate webhook secret: ${error.message}`)
  process.exit(1)
}
