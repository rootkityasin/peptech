const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"

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
    const response = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })

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
    const authResponse = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password: payload.password,
      }),
    })

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
    const token = authData.token
    if (!token) {
      throw new Error("Registration token was not returned.")
    }

    // Generate a research customer ID code if not provided
    const generatedCustCode = `#PEP-CUST-${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const memberSince = `${monthNames[now.getMonth()]} ${now.getFullYear()}`

    // Step 2: Create customer record linked to this identity
    const custResponse = await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
    // Re-authenticate to ensure token contains full customer actor_id
    let activeToken = token
    try {
      activeToken = await loginCustomer(normalizedEmail, payload.password)
    } catch {
      // fallback to auth token
    }
    return { token: activeToken, customer: custData.customer }
  } catch (err: any) {
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
  const response = await fetch(`${BACKEND_URL}/store/customers/me?fields=*addresses`, {
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
  const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
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
  const response = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
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
  const response = await fetch(`${BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
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
 * Fetch authenticated customer's order history from Medusa 2.0 store API
 */
export async function getCustomerOrders(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/store/orders?fields=*items,*items.variant,*shipping_address`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.orders || []
  } catch (err) {
    console.warn("Failed to fetch customer orders from Medusa:", err)
    return []
  }
}

