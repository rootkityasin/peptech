import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000,http://localhost:8000,https://docs.medusajs.com',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:5173,http://localhost:9000,https://docs.medusajs.com',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000,http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
    cookieOptions: {
      secure: false,
      sameSite: 'lax',
    }
  },
  modules: [
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
})
