import type { Quote } from "../quote"
import type { LedgerRecord } from "../../../modules/peptech-commerce/service"

export interface GatewayCustomerInput {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  companyName?: string
  address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    postal_code?: string
    country_code?: string
    province?: string
    phone?: string
  }
}

export interface GatewayCheckoutInput {
  attemptId: string
  customer: GatewayCustomerInput
  quote: Quote
  revision: string
  origin: string
  uiMode?: "embedded" | "hosted" | "embedded_page" | "hosted_page"
}

export interface GatewayCheckoutResult {
  sessionId: string
  clientSecret?: string
  checkoutUrl?: string
  publishableKey?: string
  stripeCustomerId?: string
  expiresAt: number
  state: "open" | "processing" | "paid" | "expired" | "failed"
}

export interface PaymentGatewayAdapter {
  id: string
  name: string
  isConfigured(): boolean
  createCheckoutSession(input: GatewayCheckoutInput): Promise<GatewayCheckoutResult>
  reconcileSession(sessionId: string): Promise<any>
  syncSubscription?(subscriptionId: string): Promise<any>
  processSubscriptionCommand?(subscriptionId: string, action: string, params?: any): Promise<any>
  refundPayment(receipt: LedgerRecord, amountMinor: number, note: string): Promise<any>
}
