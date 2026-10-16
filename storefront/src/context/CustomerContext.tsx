"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  Customer,
  CustomerAddressPayload,
  CustomerRegisterPayload,
  CustomerUpdatePayload,
  loginCustomer,
  registerCustomer,
  getCustomerMe,
  updateCustomerMe,
  addCustomerAddress,
  deleteCustomerAddress,
  clearOrdersMemoryCache,
} from "@/lib/customer-api"

interface CustomerContextType {
  customer: Customer | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: CustomerRegisterPayload) => Promise<void>
  logout: () => void
  updateProfile: (payload: CustomerUpdatePayload) => Promise<void>
  addAddress: (payload: CustomerAddressPayload) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  refreshCustomer: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

const TOKEN_KEY = "peptech_customer_token"
const PROFILE_KEY = "peptech_customer_profile"

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(PROFILE_KEY)
        return cached ? JSON.parse(cached) : null
      } catch {
        return null
      }
    }
    return null
  })
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem(TOKEN_KEY)
      const hasProfile = !!localStorage.getItem(PROFILE_KEY)
      return hasToken && !hasProfile
    }
    return false
  })

  const setSyncedCustomer = useCallback((cust: Customer | null) => {
    setCustomer(cust)
    if (typeof window !== "undefined") {
      if (cust) {
        try {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(cust))
        } catch {}
      } else {
        localStorage.removeItem(PROFILE_KEY)
      }
    }
  }, [])

  const fetchCustomer = useCallback(async (authToken: string) => {
    try {
      const data = await getCustomerMe(authToken)
      setSyncedCustomer(data)
      setToken(authToken)
    } catch (err) {
      console.warn("Failed to restore customer session:", err)
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(PROFILE_KEY)
      }
      setSyncedCustomer(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [setSyncedCustomer])

  useEffect(() => {
    let isMounted = true
    const savedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    if (!savedToken) {
      setIsLoading(false)
      return
    }

    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    }, 2500)

    fetchCustomer(savedToken).finally(() => {
      clearTimeout(fallbackTimer)
    })

    return () => {
      isMounted = false
      clearTimeout(fallbackTimer)
    }
  }, [fetchCustomer])

  const login = async (email: string, password: string) => {
    const receivedToken = await loginCustomer(email, password)
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, receivedToken)
    }
    setToken(receivedToken)
    const data = await getCustomerMe(receivedToken)
    setSyncedCustomer(data)
  }

  const register = async (payload: CustomerRegisterPayload) => {
    const result = await registerCustomer(payload)
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, result.token)
    }
    setToken(result.token)
    setSyncedCustomer(result.customer)
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      if (customer?.id) {
        try {
          localStorage.removeItem(`peptech_customer_orders_${customer.id}`)
        } catch {}
      }
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PROFILE_KEY)
      try {
        sessionStorage.clear()
      } catch {}
    }
    clearOrdersMemoryCache()
    setToken(null)
    setSyncedCustomer(null)
  }

  const updateProfile = async (payload: CustomerUpdatePayload) => {
    if (!token) throw new Error("Not authenticated")
    const updated = await updateCustomerMe(token, payload)
    setSyncedCustomer(updated)
  }

  const addAddress = async (payload: CustomerAddressPayload) => {
    if (!token) throw new Error("Not authenticated")
    await addCustomerAddress(token, payload)
    // Refresh to get full updated customer object with addresses
    const updated = await getCustomerMe(token)
    setSyncedCustomer(updated)
  }

  const deleteAddress = async (addressId: string) => {
    if (!token) throw new Error("Not authenticated")
    await deleteCustomerAddress(token, addressId)
    // Refresh to get full updated customer object with addresses
    const updated = await getCustomerMe(token)
    setSyncedCustomer(updated)
  }

  const refreshCustomer = async () => {
    if (!token) return
    const updated = await getCustomerMe(token)
    setSyncedCustomer(updated)
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider")
  }
  return context
}
