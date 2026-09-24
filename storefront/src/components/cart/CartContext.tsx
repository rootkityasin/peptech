"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItemOption {
  label: string
  value: string
}

export interface CartItem {
  id: string
  title: string
  format: "pen-set" | "refill" | "vial"
  strength: string
  price: number
  quantity: number
  isSubscription: boolean
  subscriptionIntervalDays?: number
  discountPercent?: number
  sku: string
  batch?: string
  image?: string
  options?: CartItemOption[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string, isSubscription: boolean) => void
  updateQuantity: (id: string, isSubscription: boolean, delta: number) => void
  clearCart: () => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
  shippingCost: number
  total: number
  destination: "UK" | "INTL"
  setDestination: (dest: "UK" | "INTL") => void
  country: string
  setCountry: (country: string) => void
  currency: "GBP" | "USD" | "EUR"
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const DEFAULT_CART_ITEMS: CartItem[] = []

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [country, setCountry] = useState<string>("United Kingdom")
  const [destination, setDestinationState] = useState<"UK" | "INTL">("UK")

  const setDestination = (dest: "UK" | "INTL") => {
    setDestinationState(dest)
    if (dest === "UK") setCountry("United Kingdom")
    else if (country === "United Kingdom") setCountry("United States")
  }

  const handleSetCountry = (newCountry: string) => {
    setCountry(newCountry)
    setDestinationState(newCountry === "United Kingdom" ? "UK" : "INTL")
  }

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("peptech_cart")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem("peptech_cart", JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addItem = (itemData: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === itemData.id && i.isSubscription === itemData.isSubscription
      )
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex].quantity += quantity
        return next
      }
      return [...prev, { ...itemData, quantity }]
    })
    setIsDrawerOpen(true)
  }

  const removeItem = (id: string, isSubscription: boolean) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.isSubscription === isSubscription)))
  }

  const updateQuantity = (id: string, isSubscription: boolean, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id && i.isSubscription === isSubscription) {
            const nextQty = i.quantity + delta
            return nextQty > 0 ? { ...i, quantity: nextQty } : null
          }
          return i
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const clearCart = () => {
    setItems([])
    try {
      localStorage.removeItem("peptech_cart")
    } catch {}
  }

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => {
    const itemPrice = i.isSubscription && i.discountPercent ? i.price * (1 - i.discountPercent / 100) : i.price
    return acc + itemPrice * i.quantity
  }, 0)

  // Royal Mail rates: Free UK over £100 / £4.95 UK standard / £15.00 International
  const shippingCost = items.length > 0 ? (destination === "UK" ? (subtotal >= 100 ? 0 : 4.95) : 15.0) : 0
  const total = subtotal + shippingCost

  const currency = country === "United Kingdom" ? "GBP" : (["Germany", "France", "Italy", "Spain", "Netherlands", "Ireland", "Sweden", "Denmark", "Belgium", "Austria", "Finland", "Portugal", "Poland", "Czech Republic"].includes(country) ? "EUR" : "USD")

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        itemCount,
        subtotal,
        shippingCost,
        total,
        destination,
        setDestination,
        country,
        setCountry: handleSetCountry,
        currency,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
