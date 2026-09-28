import { loadEnv, defineConfig } from '@medusajs/framework/utils'

const { loadStripeEnv, stripeModules, commerceRuntimeModules, commerceEmailModules } = require("./src/lib/stripe-config")
loadStripeEnv()

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const defaultDatabaseUrl = 'postgresql://localhost:5432/peptech'
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || defaultDatabaseUrl

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: dbUrl,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1')
      ? { connection: { ssl: false } }
      : { connection: { ssl: { rejectUnauthorized: false } } },
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000,http://localhost:8000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000,http://localhost:5173,http://localhost:9000,http://localhost:8000,https://peptech.bio,https://www.peptech.bio,https://admin.peptech.bio,https://docs.medusajs.com',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
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
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
            },
          },
        ],
      },
    },
    { resolve: "./src/modules/peptech-commerce", options: { databaseUrl: process.env.STRIPE_COMMERCE_DATABASE_URL || dbUrl } },
    ...stripeModules(),
    ...commerceRuntimeModules(),
    ...commerceEmailModules(),
  ],
})
