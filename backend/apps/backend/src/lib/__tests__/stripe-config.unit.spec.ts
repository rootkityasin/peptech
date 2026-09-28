import { getStripeConfig, stripeModules, loadStripeEnv } from "../stripe-config"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const testEnv = {
  STRIPE_API_KEY: "rk_test_fixture", STRIPE_PUBLISHABLE_KEY: "pk_test_fixture",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture", STRIPE_ACCOUNT_ID: "acct_fixture",
}

describe("Stripe account configuration", () => {
  it("disables payments when the server key is absent", () => {
    expect(getStripeConfig({})).toBeNull()
    expect(stripeModules({})).toEqual([])
  })
  it("supports restricted test keys and isolates account and mode", () => {
    expect(getStripeConfig(testEnv)?.providerId).toBe("pp_stripe_stripe_acct_fixture_test")
    expect(getStripeConfig({ ...testEnv, STRIPE_ACCOUNT_ID: "acct_other" })?.providerId).not.toBe(getStripeConfig(testEnv)?.providerId)
    expect(getStripeConfig(testEnv)?.mode).toBe("test")
  })
  it.each(["STRIPE_WEBHOOK_SECRET", "STRIPE_PUBLISHABLE_KEY", "STRIPE_ACCOUNT_ID"])("rejects missing %s", key => {
    expect(() => getStripeConfig({ ...testEnv, [key]: "" })).toThrow()
  })
  it("rejects mixed test and live keys", () => {
    expect(() => getStripeConfig({ ...testEnv, STRIPE_PUBLISHABLE_KEY: "pk_live_fixture" })).toThrow()
  })
  it("requires an explicit underwriting acknowledgement for live mode", () => {
    const live = { ...testEnv, STRIPE_API_KEY: "rk_live_fixture", STRIPE_PUBLISHABLE_KEY: "pk_live_fixture" }
    expect(() => getStripeConfig(live)).toThrow(/underwriting/)
    expect(getStripeConfig({ ...live, STRIPE_LIVE_APPROVED: "true" })?.mode).toBe("live")
  })
  it("loads only Stripe settings from root and preserves injected environment", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "peptech-stripe-"))
    try {
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "peptech" }))
      fs.writeFileSync(path.join(dir, ".env"), "STRIPE_API_KEY=rk_test_fixture\nSTRIPE_ACCOUNT_ID=acct_file\nDATABASE_URL=never-copy\n")
      const env: NodeJS.ProcessEnv = { STRIPE_ACCOUNT_ID: "acct_injected" }
      loadStripeEnv(dir, env)
      expect(env.STRIPE_API_KEY).toBe("rk_test_fixture")
      expect(env.STRIPE_ACCOUNT_ID).toBe("acct_injected")
      expect(env.DATABASE_URL).toBeUndefined()
    } finally { fs.rmSync(dir, { recursive: true, force: true }) }
  })
})
