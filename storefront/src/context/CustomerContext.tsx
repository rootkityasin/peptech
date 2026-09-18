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
} from "@/lib/customer-api"

interface CustomerContextType {
  customer: Customer | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsDemo: () => Promise<void>
  register: (payload: CustomerRegisterPayload) => Promise<void>
  logout: () => void
  updateProfile: (payload: CustomerUpdatePayload) => Promise<void>
  addAddress: (payload: CustomerAddressPayload) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  refreshCustomer: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

const TOKEN_KEY = "peptech_customer_token"

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCustomer = useCallback(async (authToken: string) => {
    try {
      const data = await getCustomerMe(authToken)
      setCustomer(data)
      setToken(authToken)
    } catch (err) {
      console.warn("Failed to restore customer session:", err)
      localStorage.removeItem(TOKEN_KEY)
      setCustomer(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    if (savedToken) {
      void fetchCustomer(savedToken)
    } else {
      const timer = setTimeout(() => setIsLoading(false), 0)
      return () => clearTimeout(timer)
    }
  }, [fetchCustomer])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const receivedToken = await loginCustomer(email, password)
      localStorage.setItem(TOKEN_KEY, receivedToken)
      setToken(receivedToken)
      const data = await getCustomerMe(receivedToken)
      setCustomer(data)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsDemo = async () => {
    return login("alexander.wright@cambridge-biotech.ac.uk", "Password123!")
  }

  const register = async (payload: CustomerRegisterPayload) => {
    setIsLoading(true)
    try {
      const result = await registerCustomer(payload)
      localStorage.setItem(TOKEN_KEY, result.token)
      setToken(result.token)
      setCustomer(result.customer)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCustomer(null)
  }

  const updateProfile = async (payload: CustomerUpdatePayload) => {
    if (!token) throw new Error("Not authenticated")
    const updated = await updateCustomerMe(token, payload)
    setCustomer(updated)
  }

  const addAddress = async (payload: CustomerAddressPayload) => {
    if (!token) throw new Error("Not authenticated")
    await addCustomerAddress(token, payload)
    // Refresh to get full updated customer object with addresses
    const updated = await getCustomerMe(token)
    setCustomer(updated)
  }

  const deleteAddress = async (addressId: string) => {
    if (!token) throw new Error("Not authenticated")
    await deleteCustomerAddress(token, addressId)
    // Refresh to get full updated customer object with addresses
    const updated = await getCustomerMe(token)
    setCustomer(updated)
  }

  const refreshCustomer = async () => {
    if (!token) return
    const updated = await getCustomerMe(token)
    setCustomer(updated)
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: !!customer,
        login,
        loginAsDemo,
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
