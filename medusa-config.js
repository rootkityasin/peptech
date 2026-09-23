// Fix: Allow SSL connections to Supabase/cloud database poolers without rejecting intermediate certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { loadEnv, defineConfig } = require('@medusajs/framework/utils');

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const defaultDatabaseUrl = 'postgresql://postgres.ubzoovlhbnztjwemvrwo:Peptech2026!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';
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
    ...(process.env.STRIPE_API_KEY ? [
      {
        resolve: "@medusajs/medusa/payment",
        options: {
          providers: [
            {
              resolve: "@medusajs/payment-stripe",
              id: "stripe",
              options: {
                apiKey: process.env.STRIPE_API_KEY,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              },
            },
          ],
        },
      }
    ] : []),
  ],
});
