const fs = require("node:fs");
const path = require("node:path");

// Load only payment settings from the workspace .env. Never expose the server key
// through Next.js. Deployment-injected variables take precedence.
function loadStripeEnv(start = __dirname, env = process.env) {
  let dir = start;
  while (true) {
    const manifest = path.join(dir, "package.json");
    if (fs.existsSync(manifest)) {
      try {
        if (JSON.parse(fs.readFileSync(manifest, "utf8")).name === "peptech") {
          const file = path.join(dir, ".env");
          if (fs.existsSync(file)) {
            const values = require("dotenv").parse(fs.readFileSync(file));
            for (const [key, value] of Object.entries(values)) {
              if (key.startsWith("STRIPE_") && (env[key] === undefined || env[key] === "")) {
                env[key] = String(value);
              }
            }
          }
          return;
        }
      } catch {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

function getStripeConfig(env = process.env) {
  const apiKey = (env.STRIPE_API_KEY || "").trim();
  if (!apiKey) return null;
  const match = /^(?:sk|rk)_(test|live)_[A-Za-z0-9]+$/.exec(apiKey);
  if (!match) throw new Error("STRIPE_API_KEY must be a Stripe test/live restricted or secret key");
  const mode = match[1];
  const publishableKey = (env.STRIPE_PUBLISHABLE_KEY || "").trim();
  if (!new RegExp(`^pk_${mode}_[A-Za-z0-9]+$`).test(publishableKey)) {
    throw new Error("STRIPE_PUBLISHABLE_KEY must match the API key's test/live mode");
  }
  const accountId = (env.STRIPE_ACCOUNT_ID || "").trim();
  if (!/^acct_[A-Za-z0-9]+$/.test(accountId)) {
    throw new Error("STRIPE_ACCOUNT_ID is required to isolate payment sessions between accounts");
  }
  const webhookSecret = (env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!/^whsec_[A-Za-z0-9]+$/.test(webhookSecret)) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required");
  }
  if (mode === "live" && env.STRIPE_LIVE_APPROVED !== "true") {
    throw new Error("Live Stripe requires written underwriting approval and STRIPE_LIVE_APPROVED=true (GEMINI.md)");
  }
  const id = `stripe_${accountId}_${mode}`;
  return {
    apiKey,
    publishableKey,
    webhookSecret,
    accountId,
    mode,
    id,
    providerId: `pp_stripe_${id}`,
    webhookPath: `/hooks/payment/stripe_${id}`,
  };
}

function stripeModules(env = process.env) {
  const config = getStripeConfig(env);
  if (!config) return [];
  return [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: config.id,
            options: {
              apiKey: config.apiKey,
              webhookSecret: config.webhookSecret,
              capture: true,
              automaticPaymentMethods: true,
            },
          },
          {
            resolve: path.resolve(__dirname, "../modules/stripe-checkout"),
            id: config.id,
            options: {
              apiKey: config.apiKey,
              signingSecret: env.STRIPE_COMMERCE_SIGNING_SECRET || config.apiKey,
              profile: `${config.accountId}:${config.mode}:v1`,
            },
          },
        ],
      },
    },
  ];
}

function commerceRuntimeModules(env = process.env) {
  if (!env.REDIS_URL) return [];
  return [
    { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: env.REDIS_URL } },
    { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { url: env.REDIS_URL } } },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: { redisUrl: env.REDIS_URL },
          },
        ],
      },
    },
  ];
}

function commerceEmailModules(env = process.env) {
  if (!env.STRIPE_EMAIL_HOST) return [];
  return [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: path.resolve(__dirname, "../modules/commerce-email"),
            id: "peptech-email",
            options: {
              channels: ["email"],
              host: env.STRIPE_EMAIL_HOST,
              port: Number(env.STRIPE_EMAIL_PORT || 465),
              user: env.STRIPE_EMAIL_USER,
              password: env.STRIPE_EMAIL_PASSWORD,
              from: env.STRIPE_EMAIL_FROM,
              origin: env.STRIPE_STOREFRONT_URL,
            },
          },
        ],
      },
    },
  ];
}

module.exports = {
  loadStripeEnv,
  getStripeConfig,
  stripeModules,
  commerceRuntimeModules,
  commerceEmailModules,
};
