"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getCountryByName } from "@/lib/countries"
import { getShippingOptions, type ShippingOption } from "@/lib/shipping-options"
import { getBackendUrl } from "@/lib/customer-api"

export interface CartItemOption {
  label: string
  value: string
}

export interface AppliedPromotion {
  id: string
  code: string
  title: string
  discountType: "percentage" | "fixed"
  discountValue: number
  discountAmount: number
  currencyCode: string
}

export interface AutoSavingsConfig {
  id: string
  code: string
  isAutomatic: boolean
  discountType: "percentage" | "fixed"
  discountValue: number
  currencyCode: string
  text: string
  fullText: string
  badgeText: string
  saveText: string
}

export const DEFAULT_AUTO_SAVINGS: AutoSavingsConfig = {
  id: "promo_01AUTODISAUTOPEPT",
  code: "AUTODIS",
  isAutomatic: true,
  discountType: "percentage",
  discountValue: 10,
  currencyCode: "gbp",
  text: "10% auto-savings",
  fullText: "Every 28 days · 10% auto-savings",
  badgeText: "10% Off",
  saveText: "Save 10%",
}

export interface CartItem {
  variantId?: string
  productHandle?: string
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
  clearCartIfUnchanged: (snapshot: string) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
  promoDiscount: number
  finalSubtotal: number
  appliedPromo: AppliedPromotion | null
  applyPromoCode: (code: string) => Promise<{ success: boolean; message?: string }>
  removePromoCode: () => void
  autoSavings: AutoSavingsConfig
  shippingCost: number
  total: number
  destination: "UK" | "INTL"
  setDestination: (dest: "UK" | "INTL") => void
  country: string
  setCountry: (country: string) => void
  currency: "GBP" | "USD" | "EUR"
  shippingOptions: ShippingOption[]
  shippingOptionId: string | null
  setShippingOptionId: (id: string) => void
  selectedShippingOption: ShippingOption | null
  shippingAvailable: boolean
  shippingReady: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const DEFAULT_CART_ITEMS: CartItem[] = []

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [country, setCountry] = useState<string>("United Kingdom")
  const [destination, setDestinationState] = useState<"UK" | "INTL">("UK")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingOptionId, setShippingOptionIdState] = useState<string | null>(null)
  const [shippingLoaded, setShippingLoaded] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromotion | null>(null)
  const [autoSavings, setAutoSavings] = useState<AutoSavingsConfig>(DEFAULT_AUTO_SAVINGS)

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
      const savedPromo = localStorage.getItem("peptech_applied_promo")
      if (savedPromo) {
        setAppliedPromo(JSON.parse(savedPromo))
      }
      const savedAutoSavings = localStorage.getItem("peptech_auto_savings")
      if (savedAutoSavings) {
        const parsedAuto = JSON.parse(savedAutoSavings)
        if (parsedAuto && parsedAuto.text) {
          setAutoSavings(parsedAuto)
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  // Fetch dynamic automatic promotion from admin panel
  useEffect(() => {
    let cancelled = false
    const fetchAutoSavings = async () => {
      try {
        const base = getBackendUrl()
        const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"
        const headers = {
          "x-publishable-api-key": pubKey,
        }

        let res: Response | null = null
        try {
          res = await fetch(`${base}/store/custom/promotions/auto-savings`, { headers })
        } catch (directErr) {
          if (base) {
            try {
              res = await fetch("/store/custom/promotions/auto-savings", { headers })
            } catch {}
          }
        }

        if (res && res.ok && !cancelled) {
          const data = await res.json()
          if (data?.success && data?.auto_savings) {
            const fresh: AutoSavingsConfig = {
              id: data.auto_savings.id || "promo_default",
              code: data.auto_savings.code || "AUTODIS",
              isAutomatic: Boolean(data.auto_savings.is_automatic),
              discountType: data.auto_savings.discount_type || "percentage",
              discountValue: Number(data.auto_savings.discount_value || 10),
              currencyCode: data.auto_savings.currency_code || "gbp",
              text: data.auto_savings.text || "10% auto-savings",
              fullText: data.auto_savings.full_text || "Every 28 days · 10% auto-savings",
              badgeText: data.auto_savings.badge_text || "10% Off",
              saveText: data.auto_savings.save_text || "Save 10%",
            }
            setAutoSavings(fresh)
            try {
              localStorage.setItem("peptech_auto_savings", JSON.stringify(fresh))
            } catch {}
          }
        }
      } catch {
        // Keep existing autoSavings on fetch failure
      }
    }

    fetchAutoSavings()
    return () => {
      cancelled = true
    }
  }, [])

  // Save to local storage
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem("peptech_cart", JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, loaded])

  // Clear any applied promo if cart is empty
  useEffect(() => {
    if (loaded && items.length === 0 && appliedPromo) {
      setAppliedPromo(null)
      try {
        localStorage.removeItem("peptech_applied_promo")
      } catch {}
    }
  }, [items.length, loaded, appliedPromo])

  // Resolve the shipping options Medusa serves for the chosen destination.
  useEffect(() => {
    if (!loaded) return
    let cancelled = false
    const countryCode = getCountryByName(country).code.toLowerCase()
    getShippingOptions(countryCode).then((options) => {
      if (cancelled) return
      setShippingOptions(options)
      setShippingOptionIdState((current) =>
        current && options.some((option) => option.id === current)
          ? current
          : options[0]?.id || null
      )
      setShippingLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [country, loaded])

  const setShippingOptionId = (id: string) => {
    setShippingOptionIdState(id)
  }

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
    setAppliedPromo(null)
    try {
      localStorage.removeItem("peptech_cart")
      localStorage.removeItem("peptech_applied_promo")
    } catch {}
  }

  const clearCartIfUnchanged = (snapshot: string) => {
    setItems((current) => {
      // Preserve additions/changes from another tab or a later basket revision.
      if (JSON.stringify(current) !== snapshot || localStorage.getItem("peptech_cart") !== snapshot) return current
      localStorage.removeItem("peptech_cart")
      localStorage.removeItem("peptech_applied_promo")
      setAppliedPromo(null)
      return []
    })
  }

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  // Calculate dynamic promotional discount - ONLY when user enters a promo code
  const promoDiscount = React.useMemo(() => {
    if (!appliedPromo) return 0
    if (subtotal <= 0) return 0

    if (appliedPromo.discountType === "percentage") {
      return Number(((subtotal * appliedPromo.discountValue) / 100).toFixed(2))
    }
    if (appliedPromo.discountType === "fixed") {
      return Math.min(appliedPromo.discountValue, subtotal)
    }
    return 0
  }, [subtotal, appliedPromo])

  const finalSubtotal = Math.max(0, subtotal - promoDiscount)

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (!code || !code.trim()) {
      return { success: false, message: "Please enter a promotional code." }
    }
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"
    const payload = JSON.stringify({
      code: code.trim(),
      subtotal,
      currency_code: "gbp",
    })

    const requestPromo = async (endpoint: string) => {
      return await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": pubKey,
        },
        body: payload,
      })
    }

    try {
      const base = getBackendUrl()
      let res: Response
      try {
        res = await requestPromo(`${base}/store/custom/promotions/validate`)
      } catch (directErr) {
        // If direct cross-origin fetch encountered a network or CORS issue, fall back to same-origin proxy
        if (base) {
          console.warn("[PEPTECH PROMO] Direct fetch failed, trying same-origin proxy:", directErr)
          res = await requestPromo("/store/custom/promotions/validate")
        } else {
          throw directErr
        }
      }

      const data = await res.json()
      if (!res.ok || !data.valid) {
        return { success: false, message: data.message || "Invalid promotional code." }
      }
      const promo: AppliedPromotion = {
        id: data.promotion.id,
        code: data.promotion.code,
        title: data.promotion.title,
        discountType: data.promotion.discount_type,
        discountValue: data.promotion.discount_value,
        discountAmount: data.promotion.discount_amount,
        currencyCode: data.promotion.currency_code,
      }
      setAppliedPromo(promo)
      try {
        localStorage.setItem("peptech_applied_promo", JSON.stringify(promo))
      } catch {}
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to connect to promo verification service." }
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    try {
      localStorage.removeItem("peptech_applied_promo")
    } catch {}
  }

  // Authoritative rates come from Medusa; an empty list means no option is
  // configured for this destination and checkout will refuse to price it.
  const selectedShippingOption = shippingOptions.find((option) => option.id === shippingOptionId) || null
  const shippingAvailable = shippingLoaded && shippingOptions.length > 0
  const shippingCost = items.length > 0 && selectedShippingOption ? selectedShippingOption.amount : 0
  const total = finalSubtotal + shippingCost

  const currency = country === "United Kingdom" ? "GBP" : (["Germany", "France", "Italy", "Spain", "Netherlands", "Ireland", "Sweden", "Denmark", "Belgium", "Austria", "Finland", "Portugal", "Poland", "Czech Republic"].includes(country) ? "EUR" : "USD")

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearCartIfUnchanged,
        isDrawerOpen,
        setIsDrawerOpen,
        itemCount,
        subtotal,
        promoDiscount,
        finalSubtotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        autoSavings,
        shippingCost,
        total,
        destination,
        setDestination,
        country,
        setCountry: handleSetCountry,
        currency,
        shippingOptions,
        shippingOptionId,
        setShippingOptionId,
        selectedShippingOption,
        shippingAvailable,
        shippingReady: shippingLoaded,
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
