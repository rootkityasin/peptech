const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"

/**
 * Dynamically resolves the Medusa backend URL.
 * In a browser environment on production domains (e.g., https://peptech.bio),
 * returns https://admin.peptech.bio directly (where Medusa is hosted), bypassing
 * hanging Next.js reverse proxies on containerized hosts like Hostinger.
 * In local development, returns "" to use same-origin Next.js dev rewrites.
 */
export function getBackendUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "")
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin
    // In production browser, connect directly to the live Medusa API
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return "https://admin.peptech.bio"
    }
    // In local development browser, use relative paths to route through Next.js proxy
    return ""
  }

  // Server-side (Node.js / SSR) resolution
  if (process.env.NODE_ENV === "production") {
    return "https://admin.peptech.bio"
  }

  return (
    process.env.MEDUSA_BACKEND_URL ||
    envUrl ||
    "http://localhost:9000"
  )
}

/**
 * Resilient fetch wrapper with dual-redundant failover and timeout protection.
 * If the direct connection to https://admin.peptech.bio drops or times out (e.g. regional CDN routing issues),
 * it seamlessly switches to the Next.js reverse proxy (/auth/*, /store/*), ensuring 100% uptime.
 */
async function fetchWithTimeout(endpointPath: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const isFullPath = endpointPath.startsWith("http://") || endpointPath.startsWith("https://")
  const primaryUrl = isFullPath ? endpointPath : `${getBackendUrl()}${endpointPath}`

  // Determine alternate URL for automatic regional failover
  let fallbackUrl: string | null = null
  if (typeof window !== "undefined") {
    const origin = window.location.origin
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      const cleanPath = isFullPath ? (new URL(endpointPath).pathname + new URL(endpointPath).search) : endpointPath
      // If primary is admin.peptech.bio, fallback to same-origin relative path (Next.js server proxy)
      if (primaryUrl.includes("admin.peptech.bio")) {
        fallbackUrl = cleanPath
      } else {
        fallbackUrl = `https://admin.peptech.bio${cleanPath}`
      }
    }
  }

  // Attempt primary endpoint with a fast 4.5s check if fallback exists
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), fallbackUrl ? 4500 : timeoutMs)
    const res = await fetch(primaryUrl, {
      ...options,
      signal: options.signal || controller.signal,
    })
    clearTimeout(timer)
    return res
  } catch (err: any) {
    if (!fallbackUrl) {
      throw err
    }
    console.warn(`[PEPTECH FAILOVER] Primary connection to ${primaryUrl} failed/timed out. Falling back to ${fallbackUrl}...`)
    const controllerFallback = new AbortController()
    const timerFallback = setTimeout(() => controllerFallback.abort(), timeoutMs)
    try {
      const res = await fetch(fallbackUrl, {
        ...options,
        signal: options.signal || controllerFallback.signal,
      })
      return res
    } finally {
      clearTimeout(timerFallback)
    }
  }
}

export interface CustomerAddress {
  id: string
  address_name?: string | null
  is_default_shipping?: boolean
  is_default_billing?: boolean
  company?: string | null
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  country_code?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}

export interface CustomerMetadata {
  role?: string
  title?: string
  avatar_url?: string | null
  member_since?: string
  customer_id_code?: string
  [key: string]: unknown
}

export interface Customer {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  has_account?: boolean
  metadata?: CustomerMetadata | null
  addresses?: CustomerAddress[]
  created_at?: string
  updated_at?: string
}

export interface CustomerLoginResponse {
  token: string
}

export interface CustomerRegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  metadata?: CustomerMetadata
}

export interface CustomerUpdatePayload {
  first_name?: string
  last_name?: string
  phone?: string
  company_name?: string
  metadata?: CustomerMetadata
}

export interface CustomerAddressPayload {
  address_name?: string
  first_name?: string
  last_name?: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  country_code: string
  postal_code: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

/**
 * Log in customer with email and password via Medusa 2.0 Auth API
 */
export async function loginCustomer(email: string, password: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(`${getBackendUrl()}/auth/customer/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    }, 8000)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = errorData.message || ""
      if (response.status === 401 || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("unauthorized")) {
        throw new Error("Invalid institutional email or password. Please verify your credentials.")
      }
      throw new Error(msg || "Authentication failed. Please check your credentials and try again.")
    }

    const data = await response.json()
    if (!data.token) {
      throw new Error("Authentication token was not returned by server.")
    }
    return data.token
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Connection timed out while contacting PEPTECH Research Server. Please try again.")
    }
    if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
      throw err
    }
    throw new Error("Unable to connect to the authentication server. Please check your network or try again shortly.")
  }
}

/**
 * Register a new customer via Medusa 2.0 Auth & Customer Store API
 */
export async function registerCustomer(payload: CustomerRegisterPayload): Promise<{ token: string; customer: Customer }> {
  const normalizedEmail = payload.email.trim().toLowerCase()
  try {
    // Step 1: Register auth identity
    const authResponse = await fetchWithTimeout(`${getBackendUrl()}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password: payload.password,
      }),
    }, 8000)

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}))
      const msg = errorData.message || ""
      if (
        authResponse.status === 400 ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("identity")
      ) {
        throw new Error("An account is already registered with this institutional email. Please sign in instead.")
      }
      throw new Error(msg || "Registration failed. Please review your details and try again.")
    }

    const authData = await authResponse.json()
    const tempToken = authData.token
    if (!tempToken) {
      throw new Error("Registration token was not returned.")
    }

    // Generate a research customer ID code if not provided
    const generatedCustCode = `#PEP-CUST-${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const memberSince = `${monthNames[now.getMonth()]} ${now.getFullYear()}`

    // Step 2: Create customer record linked to this identity
    const custResponse = await fetchWithTimeout(`${getBackendUrl()}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tempToken}`,
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        email: normalizedEmail,
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        company_name: (payload.company_name || "").trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        metadata: {
          role: "Verified Clinical Researcher",
          title: payload.metadata?.title || "Dr.",
          avatar_url: payload.metadata?.avatar_url || null,
          member_since: memberSince,
          customer_id_code: generatedCustCode,
          compliance_ack: true,
          registered_via: "PEPTECH Storefront Portal",
          ...(payload.metadata || {}),
        },
      }),
    })

    if (!custResponse.ok) {
      const err = await custResponse.json().catch(() => ({}))
      throw new Error(err.message || "Could not complete customer profile creation.")
    }

    const custData = await custResponse.json()

    // Step 3: Re-authenticate to ensure token contains full customer actor_id
    let activeToken = tempToken
    try {
      activeToken = await loginCustomer(normalizedEmail, payload.password)
    } catch {
      // Keep tempToken
    }

    // Step 4: Retrieve fully loaded customer object with addresses
    let fullCustomer = custData.customer
    try {
      fullCustomer = await getCustomerMe(activeToken)
    } catch {
      // Keep custData.customer
    }

    return { token: activeToken, customer: fullCustomer }
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Connection timed out while registering account. Please try again.")
    }
    if (err.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")) {
      throw err
    }
    throw new Error("Unable to connect to the registration server. Please verify your connection or try again.")
  }
}

/**
 * Retrieve the current authenticated customer and addresses
 */
export async function getCustomerMe(token: string): Promise<Customer> {
  const response = await fetchWithTimeout(`${getBackendUrl()}/store/customers/me?fields=*addresses`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })

  if (!response.ok) {
    throw new Error("Session expired or invalid. Please sign in again.")
  }

  const data = await response.json()
  return data.customer
}

/**
 * Update the current authenticated customer profile
 */
export async function updateCustomerMe(token: string, payload: CustomerUpdatePayload): Promise<Customer> {
  const response = await fetchWithTimeout(`${getBackendUrl()}/store/customers/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to update profile details.")
  }

  const data = await response.json()
  return data.customer
}

/**
 * Add a new shipping/billing address to the authenticated customer
 */
export async function addCustomerAddress(token: string, address: CustomerAddressPayload): Promise<CustomerAddress> {
  const response = await fetchWithTimeout(`${getBackendUrl()}/store/customers/me/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify(address),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to add delivery address.")
  }

  const data = await response.json()
  return data.address
}

/**
 * Delete a customer address
 */
export async function deleteCustomerAddress(token: string, addressId: string): Promise<void> {
  const response = await fetchWithTimeout(`${getBackendUrl()}/store/customers/me/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to delete address.")
  }
}

/**
 * Fetch authenticated customer's order history from Medusa 2.0 PostgreSQL database
 */
export async function getCustomerOrders(token?: string, customerId?: string, email?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (customerId) params.append("customer_id", customerId)
    if (email) params.append("email", email)

    const headers: Record<string, string> = {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // Attempt custom order lookup directly connected to Medusa 2.0 PostgreSQL Order Module
    const customResponse = await fetchWithTimeout(`${getBackendUrl()}/store/custom/orders?${params.toString()}`, {
      method: "GET",
      headers,
    })

    if (customResponse.ok) {
      const data = await customResponse.json()
      if (Array.isArray(data.orders)) {
        return data.orders
      }
    }

    // Fallback to standard Medusa store orders if authenticated with bearer token
    if (token) {
      const response = await fetchWithTimeout(`${getBackendUrl()}/store/orders?fields=*items,*items.variant,*shipping_address`, {
        method: "GET",
        headers,
      })
      if (response.ok) {
        const data = await response.json()
        return data.orders || []
      }
    }

    return []
  } catch (err) {
    console.warn("Failed to fetch customer orders from Medusa:", err)
    return []
  }
}

/**
 * Create a new real order in Medusa 2.0 PostgreSQL database linked to customer account
 */
export async function createStoreOrder(payload: any, token?: string): Promise<{ order: any }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetchWithTimeout(`${getBackendUrl()}/store/custom/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to persist order to the database.")
  }

  const data = await response.json()
  return data
}

/**
 * Initialize a Stripe payment intent or setup intent for international card & subscription payments
 */
export async function createStripePaymentIntent(payload: {
  amount: number
  currency?: string
  email?: string
  customer_email?: string
  customer_id?: string
  is_subscription?: boolean
  has_subscription?: boolean
  metadata?: Record<string, any>
}): Promise<{
  client_secret: string
  payment_intent_id: string
  customer_id?: string | null
  amount: number
  currency: string
  mode: string
}> {
  const normalizedPayload = {
    amount: payload.amount,
    currency: payload.currency,
    email: payload.email || payload.customer_email,
    customer_id: payload.customer_id,
    is_subscription: payload.is_subscription ?? payload.has_subscription ?? false,
    metadata: payload.metadata,
  }

  const response = await fetchWithTimeout(`${getBackendUrl()}/store/custom/stripe-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify(normalizedPayload),
  }, 10000)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to initialize Stripe payment session.")
  }

  return await response.json()
}


