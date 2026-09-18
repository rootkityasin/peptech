"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

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
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string, isSubscription: boolean) => void
  updateQuantity: (id: string, isSubscription: boolean, delta: number) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
  shippingCost: number
  total: number
  destination: "UK" | "INTL"
  setDestination: (dest: "UK" | "INTL") => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: "semaglutide-pen-set",
    title: "Semaglutide Starter Pen Set (5mg)",
    format: "pen-set",
    strength: "5mg",
    price: 145.0,
    quantity: 1,
    isSubscription: false,
    sku: "PEP-SEMA-PEN-5",
    batch: "PT-2026-081",
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "tirzepatide-refill",
    title: "Tirzepatide Refill Cartridge (10mg)",
    format: "refill",
    strength: "10mg",
    price: 95.0,
    quantity: 1,
    isSubscription: true,
    subscriptionIntervalDays: 28,
    discountPercent: 10,
    sku: "PEP-TIRZ-REF-10",
    batch: "PT-2026-082",
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "bpc-157-vial",
    title: "BPC-157 Pure Research Peptide (10mg)",
    format: "vial",
    strength: "10mg",
    price: 48.0,
    quantity: 1,
    isSubscription: false,
    sku: "PEP-BPC-VIAL-10",
    batch: "PT-2026-083",
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
]

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [destination, setDestination] = useState<"UK" | "INTL">("UK")

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

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => {
    const itemPrice = i.isSubscription && i.discountPercent ? i.price * (1 - i.discountPercent / 100) : i.price
    return acc + itemPrice * i.quantity
  }, 0)

  // Royal Mail rates: Free UK over £100 / £4.95 UK standard / £15.00 International
  const shippingCost = items.length > 0 ? (destination === "UK" ? (subtotal >= 100 ? 0 : 4.95) : 15.0) : 0
  const total = subtotal + shippingCost

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        isDrawerOpen,
        setIsDrawerOpen,
        itemCount,
        subtotal,
        shippingCost,
        total,
        destination,
        setDestination,
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
