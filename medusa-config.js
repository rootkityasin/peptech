const fs = require('fs');
const path = require('path');
const { loadEnv, defineConfig } = require('@medusajs/framework/utils');

// Auto-load root .env if present
function loadRootEnv(startDir = __dirname) {
  let dir = startDir;
  while (true) {
    const envFile = path.join(dir, '.env');
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined || process.env[key] === '') {
            process.env[key] = val;
          }
        }
      }
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}
loadRootEnv();

const { loadStripeEnv, stripeModules, commerceRuntimeModules, commerceEmailModules } = require("./backend/apps/backend/src/lib/stripe-config")
loadStripeEnv()

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const defaultDatabaseUrl = 'postgresql://localhost:5432/peptech';
let rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || defaultDatabaseUrl;

// Strip sslmode=require / sslmode=prefer / sslmode=verify-ca from URL query string
// because pg-connection-string parses sslmode=require as verify-full, overriding custom ssl options
const dbUrl = rawDbUrl.replace(/([?&])sslmode=[^&]*(&|$)/gi, (match, prefix, suffix) => {
  if (prefix === '?' && suffix === '&') return '?';
  if (prefix === '?' && suffix === '') return '';
  if (prefix === '&') return suffix;
  return '';
});

// Update process.env so internal Medusa loaders read the sanitized URL
process.env.DATABASE_URL = dbUrl;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: dbUrl,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1')
      ? { connection: { ssl: false } }
      : {
          ssl: { rejectUnauthorized: false },
          connection: { ssl: { rejectUnauthorized: false } }
        },
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000,http://localhost:8000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000,http://localhost:5173,http://localhost:9000,http://localhost:8000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
    cookieOptions: {
      secure: false,
      sameSite: 'lax',
    }
  },
  admin: {
    disable: false,
    backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    { resolve: "./backend/apps/backend/src/modules/peptech-commerce", options: { databaseUrl: process.env.STRIPE_COMMERCE_DATABASE_URL || rawDbUrl } },
    ...stripeModules(),
    ...commerceRuntimeModules(),
    ...commerceEmailModules(),
  ],
});
