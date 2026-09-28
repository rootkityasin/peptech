import Stripe from "stripe-checkout-sdk"
import { createHash } from "node:crypto"
import { getStripeConfig } from "../stripe-config"
import { fail } from "./policy"
let cached: { key:string; client:Stripe } | undefined
export function stripeContext() {
  const config=getStripeConfig()
  if (!config) fail("Stripe is not configured",503)
  if (!cached || cached.key!==config.apiKey) cached={key:config.apiKey,client:new Stripe(config.apiKey,{
    apiVersion:"2026-08-26.dahlia",maxNetworkRetries:2,timeout:15000,
    appInfo:{name:"PEPTECH Checkout",version:"1.0.0"},
  })}
  return {...config,signingSecret:process.env.STRIPE_COMMERCE_SIGNING_SECRET||config.apiKey,stripe:cached.client,profile:`${config.accountId}:${config.mode}:v1`,
    checkoutProviderId:`pp_peptech-checkout_${config.id}`}
}
export async function assertStripeAccount() {
  const context=stripeContext()
  const account=await context.stripe.accounts.retrieveCurrent()
  if (account.id!==context.accountId) fail("Stripe key belongs to a different account",503)
  if (context.mode==="live" && (!account.charges_enabled || !account.payouts_enabled)) fail("Live payments or payouts are not enabled",503)
  return context
}
export const objectId=(object:any):string | null => typeof object==="string" ? object : object?.id || null
export const operationKey=(...parts:string[])=>createHash("sha256").update(JSON.stringify(parts)).digest("hex")
