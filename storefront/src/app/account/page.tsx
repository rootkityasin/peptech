"use client"

import { AccountBilling } from "@/components/checkout/AccountBilling"
import { SubscriptionDashboard } from "@/components/account/SubscriptionDashboard"
import { commerceRequest } from "@/lib/stripe-checkout"

import React, { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { VisaBadge, MastercardBadge, AmexBadge, JcbBadge } from "@/components/ui/PaymentBadges"
import { useCustomer } from "@/context/CustomerContext"
import { getCustomerOrders } from "@/lib/customer-api"
import { formatFullReceiptDateTime, getItemDisplayDetails } from "@/components/receipt/UnifiedReceipt"

function formatOrderDate(rawDate?: string | Date | null): string {
  if (!rawDate) return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const d = new Date(rawDate)
  return isNaN(d.getTime())
    ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

type AccountTab = "overview" | "orders" | "subscriptions" | "addresses" | "payment"

function AccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") as AccountTab | null
  const [activeTab, setActiveTab] = useState<AccountTab>(tabParam || "overview")

  const {
    customer,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    addAddress,
    deleteAddress,
  } = useCustomer()

  // Dynamic User Data (Orders, Subscriptions, Saved Payment Cards)
  const [orders, setOrders] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [paymentCards, setPaymentCards] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Payment Modal States

  // Auth Portal States
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [lockCountdown, setLockCountdown] = useState(0)

  // Registration Form States
  const [regTitle, setRegTitle] = useState("Dr.")
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regCompany, setRegCompany] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [regAgreeCompliance, setRegAgreeCompliance] = useState(false)

  // Rate Limiting Security Cooldown
  useEffect(() => {
    if (!lockedUntil) return
    const interval = setInterval(() => {
      const diff = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (diff <= 0) {
        setLockedUntil(null)
        setLockCountdown(0)
        setFailedAttempts(0)
      } else {
        setLockCountdown(diff)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  // Initials helper
  const getInitials = (first?: string | null, last?: string | null) => {
    const f = (first || "").trim()[0] || ""
    const l = (last || "").trim()[0] || ""
    return (f + l).toUpperCase() || "RU"
  }

  // Load customer orders, subscriptions, and payment methods
  useEffect(() => {
    if (!customer?.id) {
      setOrders([])
      setSubscriptions([])
      setPaymentCards([])
      return
    }

    const loadData = async () => {
      setIsLoadingOrders(true)
      try {
        let loadedOrders: any[] = []
        try {
          const raw = localStorage.getItem(`peptech_customer_orders_${customer.id}`)
          if (raw) loadedOrders = JSON.parse(raw)
        } catch {}

        const savedToken = typeof window !== "undefined" ? localStorage.getItem("peptech_customer_token") : null
        try {
          const medusaOrders = await getCustomerOrders(savedToken || undefined, customer.id, customer.email)
          if (Array.isArray(medusaOrders) && medusaOrders.length > 0) {
            const mapped = medusaOrders.map((mo: any) => {
              const rawTotal = typeof mo.summary?.total === "number" ? mo.summary.total : (typeof mo.total === "number" ? mo.total : 0)
              const displayTotal = rawTotal > 1000 ? rawTotal / 100 : rawTotal
              const orderDisplayId = mo.custom_display_id || mo.metadata?.order_number_formatted || (mo.display_id ? `PEP-${mo.display_id}` : `PEP-${mo.id.replace(/^order_/, "").slice(0, 6).toUpperCase()}`)
              const displayDate = formatFullReceiptDateTime(mo.created_at || mo.date)
              const rawSubtotal = typeof mo.summary?.subtotal === "number" ? mo.summary.subtotal : 0
              const subtotal = rawSubtotal > 1000 ? rawSubtotal / 100 : (rawSubtotal > 0 ? rawSubtotal : Math.max(0, displayTotal - 4.95))
              const rawShipping = typeof mo.summary?.shipping_total === "number" ? mo.summary.shipping_total : 4.95
              const shippingTotal = rawShipping > 1000 ? rawShipping / 100 : rawShipping

              return {
                id: orderDisplayId,
                internalId: mo.id,
                displayId: mo.display_id,
                date: mo.created_at || new Date().toISOString(),
                displayDate,
                total: displayTotal,
                subtotal,
                shippingTotal,
                status: mo.fulfillment_status === "delivered" || mo.status === "completed" ? "Delivered" : "Cold-Chain Packing",
                trackingNumber: mo.metadata?.tracking_number || `GB-RM24-${orderDisplayId.replace(/[^a-zA-Z0-9]/g, "")}-CLD`,
                paymentMethod: mo.metadata?.payment_method || "Stripe 256-Bit SSL Encrypted (Card / Link)",
                stripeReceiptUrl: mo.metadata?.stripe_receipt_url || mo.metadata?.receipt_url || null,
                customerName: customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || undefined : undefined,
                customerEmail: customer?.email || mo.email,
                shippingAddress: mo.shipping_address,
                billingAddress: mo.billing_address,
                items: (mo.items || []).map((it: any) => {
                  const itPrice = typeof it.unit_price === "number" ? it.unit_price : 0
                  const itOptions = it.options || it.metadata?.options || (it.metadata?.cartridge_name ? [{ label: "Included Cartridge", value: it.metadata.cartridge_name }] : undefined)
                  return {
                    id: it.id,
                    title: it.title,
                    subtitle: it.variant_title || it.subtitle || it.product_description || "Laboratory RUO Grade",
                    price: itPrice > 1000 ? itPrice / 100 : itPrice,
                    quantity: it.quantity || 1,
                    image: it.thumbnail || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
                    options: itOptions,
                  }
                })
              }
            })
            const mappedIds = new Set(mapped.map(m => m.id))
            const dedupedLocal = loadedOrders.filter(o => !mappedIds.has(o.id))
            loadedOrders = [...mapped, ...dedupedLocal]
          }
        } catch (e) {
          console.warn("Could not fetch remote Medusa orders", e)
        }
        setOrders(loadedOrders)

        const activeToken = token || savedToken
        try {
          if (activeToken) {
            const result = await commerceRequest("/store/custom/subscriptions", activeToken)
            if (result?.subscriptions) setSubscriptions(result.subscriptions)
          }
        } catch (error) { console.warn("Subscription loading failed", error) }

        try {
          if (activeToken) {
            const pResult = await commerceRequest("/store/custom/payment-methods", activeToken)
            if (Array.isArray(pResult?.payment_methods) && pResult.payment_methods.length > 0) {
              const seen = new Set<string>()
              const deduped = pResult.payment_methods.filter((pm: any) => {
                const key = `${pm.brand}_${pm.last4}_${pm.exp_month || ""}_${pm.exp_year || ""}`.toLowerCase()
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
              setPaymentCards(deduped)
            } else if (loadedOrders.length > 0) {
              const firstOrderWithPayment = loadedOrders.find((o: any) => o.paymentMethod || o.stripeReceiptUrl)
              if (firstOrderWithPayment) {
                const pmStr = firstOrderWithPayment.paymentMethod || ""
                const isMc = /mastercard/i.test(pmStr)
                const isAmex = /amex|american express/i.test(pmStr)
                const brand = isMc ? "mastercard" : isAmex ? "amex" : "visa"
                const last4Match = pmStr.match(/\b\d{4}\b/)
                const last4 = last4Match ? last4Match[0] : "4242"
                setPaymentCards([{
                  id: "order_saved_card",
                  brand,
                  last4,
                  funding: "card",
                  title: `${isMc ? "Mastercard" : isAmex ? "American Express" : "Visa"} Corporate`,
                  expiry: "",
                  is_default: true,
                }])
              } else {
                setPaymentCards([])
              }
            } else {
              setPaymentCards([])
            }
          }
        } catch (error) {
          console.warn("Payment methods loading failed", error)
        }

      } finally {
        setIsLoadingOrders(false)
      }
    }

    void loadData()
  }, [customer?.id])

  // Derive saved addresses from customer profile or order history
  const effectiveAddresses = React.useMemo(() => {
    const direct = customer?.addresses || []
    if (direct.length > 0) return direct

    const extracted: any[] = []
    const seen = new Set<string>()

    for (const o of orders) {
      const addr = typeof o.shippingAddress === "object" ? o.shippingAddress : (typeof o.shipping_address === "object" ? o.shipping_address : null)
      if (addr && (addr.address_1 || addr.address1)) {
        const addr1 = addr.address_1 || addr.address1 || ""
        const postCode = addr.postal_code || addr.postalCode || ""
        const key = `${addr1.trim().toLowerCase()}_${postCode.trim().toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          extracted.push({
            id: addr.id || `order_addr_${extracted.length + 1}`,
            address_name: addr.company || (orders.length === 1 ? "Primary Laboratory Destination" : `Laboratory Destination ${extracted.length + 1}`),
            first_name: addr.first_name || customer?.first_name || "",
            last_name: addr.last_name || customer?.last_name || "",
            company: addr.company || customer?.company_name || "",
            address_1: addr1,
            address_2: addr.address_2 || addr.address2 || "",
            city: addr.city || "",
            postal_code: postCode,
            country_code: addr.country_code || "gb",
            phone: addr.phone || customer?.phone || "",
            is_default_shipping: extracted.length === 0,
            is_default_billing: extracted.length === 0,
          })
        }
      }
    }

    return extracted
  }, [customer?.addresses, customer?.first_name, customer?.last_name, customer?.company_name, customer?.phone, orders])

  // Avatar upload handler
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be under 5MB.")
      return
    }

    setIsUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement("canvas")
          const maxDim = 250
          let width = img.width
          let height = img.height
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.85)

          try {
            await updateProfile({
              metadata: {
                ...(customer?.metadata || {}),
                avatar_url: optimizedDataUrl,
              },
            })
          } catch (err: any) {
            alert(err.message || "Failed to update profile picture.")
          } finally {
            setIsUploadingAvatar(false)
          }
        }
        img.src = base64Data
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      alert(err.message || "Failed to process image.")
      setIsUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!customer?.metadata?.avatar_url) return
    setIsUploadingAvatar(true)
    try {
      await updateProfile({
        metadata: {
          ...(customer.metadata || {}),
          avatar_url: null,
        },
      })
    } catch (err: any) {
      alert(err.message || "Failed to remove avatar.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Payment Cards management
  const handleSkipSubscription = async (id: string) => {
    if (!token) return
    try {
      const result = await commerceRequest("/store/custom/subscriptions", token, {subscription_id:id,action:"skip",operation_id:crypto.randomUUID()}, "PUT")
      setSubscriptions(old => old.map(s => s.id === id ? result.subscription : s))
    } catch (error) { alert(error instanceof Error ? error.message : "Subscription could not be updated") }
  }

  // Profile Edit Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("Dr.")
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editCompany, setEditCompany] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)

  // Add Address Modal States
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [addrName, setAddrName] = useState("")
  const [addrFirstName, setAddrFirstName] = useState("")
  const [addrLastName, setAddrLastName] = useState("")
  const [addrCompany, setAddrCompany] = useState("")
  const [addrLine1, setAddrLine1] = useState("")
  const [addrLine2, setAddrLine2] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrPostcode, setAddrPostcode] = useState("")
  const [addrCountry, setAddrCountry] = useState("GB")
  const [addrPhone, setAddrPhone] = useState("")
  const [addrSaving, setAddrSaving] = useState(false)

  // Subscriptions schedule expanded toggle (Node 52:11602)
  const [scheduleExpanded, setScheduleExpanded] = useState(false)
  const [selectedCadence, setSelectedCadence] = useState<"28" | "14" | "56">("28")

  // Orders filter pill (Node 52:9060)
  const [ordersFilter, setOrdersFilter] = useState<"all" | "transit" | "delivered">("all")
  const [orderSearchQuery, setOrderSearchQuery] = useState("")

  // Subscriptions filter pill (Node 52:9548)
  const [subFilter, setSubFilter] = useState<"active" | "paused" | "ended">("active")

  useEffect(() => {
    if (tabParam && ["overview", "orders", "subscriptions", "addresses", "payment"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab)
    router.replace(`/account?tab=${tab}`, { scroll: false })
  }

  const openEditProfileModal = () => {
    if (!customer) return
    setEditTitle(customer.metadata?.title || "Dr.")
    setEditFirstName(customer.first_name || "")
    setEditLastName(customer.last_name || "")
    setEditCompany(customer.company_name || "")
    setEditPhone(customer.phone || "")
    setEditSuccess(false)
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      await updateProfile({
        first_name: editFirstName,
        last_name: editLastName,
        company_name: editCompany,
        phone: editPhone,
        metadata: {
          ...(customer?.metadata || {}),
          title: editTitle,
        },
      })
      setEditSuccess(true)
      setTimeout(() => {
        setIsEditProfileOpen(false)
        setEditSuccess(false)
      }, 800)
    } catch (err: any) {
      alert(err.message || "Failed to update profile.")
    } finally {
      setEditSaving(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addrLine1 || !addrCity || !addrPostcode) {
      alert("Please fill in Street Address, City, and Postal Code.")
      return
    }
    setAddrSaving(true)
    try {
      await addAddress({
        address_name: addrName || "Laboratory Facility",
        first_name: addrFirstName || customer?.first_name || "",
        last_name: addrLastName || customer?.last_name || "",
        company: addrCompany || customer?.company_name || "",
        address_1: addrLine1,
        address_2: addrLine2 || undefined,
        city: addrCity,
        postal_code: addrPostcode,
        country_code: addrCountry.toLowerCase(),
        phone: addrPhone || customer?.phone || undefined,
        is_default_shipping: !customer?.addresses || customer.addresses.length === 0,
      })
      setIsAddAddressOpen(false)
      setAddrName("")
      setAddrFirstName("")
      setAddrLastName("")
      setAddrCompany("")
      setAddrLine1("")
      setAddrLine2("")
      setAddrCity("")
      setAddrPostcode("")
      setAddrPhone("")
    } catch (err: any) {
      alert(err.message || "Failed to add address.")
    } finally {
      setAddrSaving(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccessMessage(null)

    if (lockedUntil && Date.now() < lockedUntil) {
      setAuthError(`Security pause active. Please wait ${lockCountdown}s before attempting to sign in again.`)
      return
    }

    const cleanEmail = loginEmail.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAuthError("Please enter a valid institutional email address.")
      return
    }

    if (!loginPassword || loginPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.")
      return
    }

    setAuthSubmitting(true)
    try {
      await login(cleanEmail, loginPassword)
      setFailedAttempts(0)
      setLockedUntil(null)
    } catch (err: any) {
      const nextFailed = failedAttempts + 1
      setFailedAttempts(nextFailed)
      if (nextFailed >= 5) {
        const lockTime = Date.now() + 60000
        setLockedUntil(lockTime)
        setLockCountdown(60)
        setAuthError("Security threshold reached (5 consecutive failed attempts). Account access paused for 60 seconds.")
      } else {
        const remaining = 5 - nextFailed
        setAuthError(`${err.message || "Invalid credentials."} (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`)
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccessMessage(null)

    const cleanEmail = regEmail.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAuthError("Please enter a valid institutional email address.")
      return
    }

    if (!regFirstName.trim() || !regLastName.trim()) {
      setAuthError("Researcher first name and last name are required.")
      return
    }

    if (!regCompany.trim()) {
      setAuthError("Institution or facility name is required for clinical compliance.")
      return
    }

    if (regPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.")
      return
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(regPassword)) {
      setAuthError("Password must contain at least one letter and one number for laboratory security.")
      return
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match. Please verify both password entries.")
      return
    }

    if (!regAgreeCompliance) {
      setAuthError("You must certify that you are 18+ and that all orders are strictly for Laboratory Research Use Only.")
      return
    }

    setAuthSubmitting(true)
    try {
      setAuthSuccessMessage("Registering research facility account...")
      await register({
        email: cleanEmail,
        password: regPassword,
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        company_name: regCompany.trim(),
        phone: regPhone.trim() || undefined,
        metadata: {
          title: regTitle,
          role: "Research account",
          compliance_ack: regAgreeCompliance,
        },
      })
      setAuthSuccessMessage("Account created! Loading research dashboard...")
    } catch (err: any) {
      setAuthSuccessMessage(null)
      setAuthError(err.message || "Failed to create account.")
    } finally {
      setAuthSubmitting(false)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] flex flex-col items-center justify-center w-full min-h-[calc(100vh-118px)] p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#16a6a3] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#0b1f3a]">Connecting to PEPTECH® Research Server...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated State: Render Clinical Auth Portal
  if (!isAuthenticated || !customer) {
    return (
      <div className="bg-[#f8fafc] flex flex-col items-center justify-center w-full min-h-[calc(100vh-118px)] px-4 py-12">
        <div className="max-w-[480px] w-full bg-white rounded-[20px] p-6 sm:p-9 border border-[#e2e8f0] shadow-sm flex flex-col gap-6">
          {/* Top Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0b1f3a] tracking-tight uppercase">
              Login
            </h1>
          </div>



          {/* Auth Tabs */}
          <div className="grid grid-cols-2 bg-[#f1f5f9] p-1 rounded-[10px]">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin")
                setAuthError(null)
              }}
              className={`py-2 text-[13px] font-semibold rounded-[8px] transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white text-[#0b1f3a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0b1f3a]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register")
                setAuthError(null)
              }}
              className={`py-2 text-[13px] font-semibold rounded-[8px] transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-[#0b1f3a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0b1f3a]"
              }`}
            >
              Register Facility
            </button>
          </div>

          {/* Success Notification */}
          {authSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-3.5 text-[12.5px] text-emerald-800 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{authSuccessMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-3.5 text-[12.5px] text-rose-700 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          {authMode === "signin" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-[#0b1f3a]">
                  Institutional Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      if (authError) setAuthError(null)
                    }}
                    placeholder="researcher@biotech-institute.ac.uk"
                    disabled={authSubmitting || (!!lockedUntil && Date.now() < lockedUntil)}
                    className="w-full border border-[#cbd5e1] rounded-[8px] px-3.5 py-2.5 text-sm text-[#0b1f3a] focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3] outline-hidden placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-semibold text-[#0b1f3a]">
                    Password
                  </label>
                  <span className="text-[11.5px] text-[#64748b]">Min. 8 characters</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      if (authError) setAuthError(null)
                    }}
                    placeholder="••••••••••••"
                    disabled={authSubmitting || (!!lockedUntil && Date.now() < lockedUntil)}
                    className="w-full border border-[#cbd5e1] rounded-[8px] pl-3.5 pr-10 py-2.5 text-sm text-[#0b1f3a] focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3] outline-hidden placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Rate limit banner if locked */}
              {lockedUntil && Date.now() < lockedUntil && (
                <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-2.5 text-[12px] text-amber-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Security cooldown: Access paused for {lockCountdown}s</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting || (!!lockedUntil && Date.now() < lockedUntil)}
                className="btn-press mt-2 w-full bg-[#0b1f3a] hover:bg-[#162a45] disabled:opacity-50 text-white text-[13.5px] font-semibold py-2.5 rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {authSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Title</label>
                  <select
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    className="border border-[#cbd5e1] rounded-[8px] px-2.5 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden bg-white"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Ph.D.">Ph.D.</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Alexander"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Wright"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Institution / Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="e.g. Cambridge Biomedical Research Centre"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alexander.wright@cambridge-biotech.ac.uk"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
                <span className="text-[11px] text-[#64748b]">
                  Orders, cold-chain dispatches, and COAs will be delivered here.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Direct Phone / Lab Extension <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+44 1223 928 401"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Create Password *</label>
                  <span className="text-[11px] text-[#64748b]">Min. 8 chars (letters &amp; numbers)</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full border border-[#cbd5e1] rounded-[8px] pl-3 pr-10 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">Confirm Password *</label>
                <div className="relative flex items-center">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full border rounded-[8px] pl-3 pr-10 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden ${
                      regConfirmPassword && regConfirmPassword !== regPassword
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-[#cbd5e1]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {regConfirmPassword && regConfirmPassword !== regPassword && (
                  <span className="text-[11px] text-rose-500 font-medium">Passwords do not match</span>
                )}
              </div>

              {/* Research Use Only & 18+ Mandatory Certification */}
              <label className="flex items-start gap-2.5 pt-1 text-[12px] text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={regAgreeCompliance}
                  onChange={(e) => setRegAgreeCompliance(e.target.checked)}
                  className="mt-0.5 rounded border-[#cbd5e1] text-[#16a6a3] focus:ring-[#16a6a3] cursor-pointer"
                />
                <span className="leading-snug">
                  I certify that I am at least 18 years old and represent an accredited laboratory or scientific facility. All purchases are strictly for{" "}
                  <strong className="text-[#0b1f3a]">In-Vitro Laboratory Research Use Only (RUO)</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={authSubmitting || !regAgreeCompliance}
                className="btn-press mt-2 w-full bg-[#0b1f3a] hover:bg-[#162a45] disabled:opacity-50 text-white text-[13.5px] font-semibold py-2.5 rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {authSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering account...</span>
                  </>
                ) : (
                  <span>Create Verified Research Account</span>
                )}
              </button>
            </form>
          )}

          {/* Research Compliance Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-[#64748b]">
            <svg className="w-3.5 h-3.5 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256-Bit Encrypted · Research Use Only · GDPR Compliant</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-[calc(100vh-118px)]">
      {/* Profile Banner & Navigation Tabs (Node 52:8586 / 52:9139) */}
      <section className="bg-white border-b border-[#e2e8f0] w-full pt-[36px] px-4 sm:px-8 lg:px-[80px]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-[28px]">
          {/* Banner Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="flex gap-[20px] items-center">
              <div className="relative shrink-0 w-[64px] h-[64px] rounded-full overflow-hidden border-2 border-slate-100 shadow-2xs group">
                {customer.metadata?.avatar_url ? (
                  <img
                    alt={`${customer.first_name || ""} ${customer.last_name || ""}`}
                    className="w-full h-full object-cover"
                    src={customer.metadata.avatar_url}
                  />
                ) : (
                  <div className="w-full h-full bg-[#0b1f3a] text-white font-bold text-[22px] flex items-center justify-center tracking-wider">
                    {getInitials(customer.first_name, customer.last_name)}
                  </div>
                )}
                {/* Hover Camera Overlay to change avatar */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-[#0b1f3a]/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  title="Upload profile picture"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[9px] font-semibold mt-0.5">{isUploadingAvatar ? "..." : "Upload"}</span>
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-extrabold text-[#0b1f3a] text-[20px] sm:text-[24px] tracking-tight">
                    {customer.metadata?.title ? `${customer.metadata.title} ` : ""}
                    {customer.first_name} {customer.last_name}
                  </h1>
                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="text-[11.5px] font-semibold text-[#16a6a3] hover:underline bg-[#e6fffa] px-2.5 py-0.5 rounded-[4px] cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
                <p className="font-normal text-[#64748b] text-[12.5px] sm:text-[13px]">
                  {customer.metadata?.role || "Verified Clinical Researcher"} · Member since {customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : (customer.metadata?.member_since || new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }))} · Customer ID: {customer.metadata?.customer_id_code || (customer.id ? `#PEP-CUST-${customer.id.replace(/[^0-9]/g, "").slice(-4) || customer.id.slice(-4).toUpperCase()}` : "")}
                  {customer.company_name ? ` · ${customer.company_name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {subscriptions.length > 0 && (
                <div className="bg-[#f1f5f9] flex items-center px-[12px] py-[8px] rounded-[8px]">
                  <p className="font-medium text-[#0b1f3a] text-[12.5px] whitespace-nowrap">
                    Next Dispatch: <span className="font-bold text-[#16a6a3]">{subscriptions[0].nextDispatchDate || subscriptions[0].nextBillingDate || "Scheduled"}</span>
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-[12px] font-semibold text-[#64748b] hover:text-[#0b1f3a] bg-white border border-[#e2e8f0] px-3 py-2 rounded-[8px] shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Tabs Navigation Row */}
          <div className="flex gap-[20px] sm:gap-[32px] items-end overflow-x-auto no-scrollbar w-full -mb-px">
            {/* Dashboard Overview */}
            <button
              type="button"
              onClick={() => handleTabChange("overview")}
              className={`flex items-center pb-[14px] pt-1 cursor-pointer whitespace-nowrap border-b-2 transition-all shrink-0 -mb-px ${
                activeTab === "overview"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[13.5px] sm:text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] hover:border-slate-300 font-medium text-[13.5px] sm:text-[14px]"
              }`}
            >
              Dashboard Overview
            </button>

            {/* Orders & Tracking */}
            <button
              type="button"
              onClick={() => handleTabChange("orders")}
              className={`flex items-center gap-[6px] pb-[14px] pt-1 cursor-pointer whitespace-nowrap border-b-2 transition-all shrink-0 -mb-px ${
                activeTab === "orders"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[13.5px] sm:text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] hover:border-slate-300 font-medium text-[13.5px] sm:text-[14px]"
              }`}
            >
              <span>Orders &amp; Tracking</span>
              {orders.length > 0 && (
                <span
                  className={`flex items-center justify-center px-[6px] py-[2px] rounded-[10px] text-[10px] font-bold leading-none ${
                    activeTab === "orders" ? "bg-[#0b1f3a] text-white" : "bg-[#e2e8f0] text-[#64748b]"
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            {/* Active Subscriptions */}
            <button
              type="button"
              onClick={() => handleTabChange("subscriptions")}
              className={`flex items-center gap-[6px] pb-[14px] pt-1 cursor-pointer whitespace-nowrap border-b-2 transition-all shrink-0 -mb-px ${
                activeTab === "subscriptions"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[13.5px] sm:text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] hover:border-slate-300 font-medium text-[13.5px] sm:text-[14px]"
              }`}
            >
              <span>Active Subscriptions</span>
              {subscriptions.length > 0 && (
                <span
                  className={`flex items-center justify-center px-[6px] py-[2px] rounded-[10px] text-[10px] font-bold leading-none ${
                    activeTab === "subscriptions" ? "bg-[#0b1f3a] text-white" : "bg-[#e2e8f0] text-[#64748b]"
                  }`}
                >
                  {subscriptions.length}
                </span>
              )}
            </button>

            {/* Saved Addresses */}
            <button
              type="button"
              onClick={() => handleTabChange("addresses")}
              className={`flex items-center pb-[14px] pt-1 cursor-pointer whitespace-nowrap border-b-2 transition-all shrink-0 -mb-px ${
                activeTab === "addresses"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[13.5px] sm:text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] hover:border-slate-300 font-medium text-[13.5px] sm:text-[14px]"
              }`}
            >
              Saved Addresses
            </button>

            {/* Payment Methods */}
            <button
              type="button"
              onClick={() => handleTabChange("payment")}
              className={`flex items-center pb-[14px] pt-1 cursor-pointer whitespace-nowrap border-b-2 transition-all shrink-0 -mb-px ${
                activeTab === "payment"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[13.5px] sm:text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] hover:border-slate-300 font-medium text-[13.5px] sm:text-[14px]"
              }`}
            >
              Payment Methods
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full max-w-[1280px] px-4 sm:px-8 lg:px-[80px] py-[36px] pb-[60px]">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW (Node 52:8568) */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="flex flex-col lg:flex-row gap-[32px] items-start w-full">
            {/* Left Main Column (flex-1) */}
            <div className="flex flex-col gap-[24px] w-full lg:flex-1">
              {/* Card 1: Latest Order or Empty State */}
              {orders.length > 0 ? (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[20px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-bold text-[#0b1f3a] text-[17px]">
                        Latest Order #{orders[0].id}
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px]">
                        Placed {orders[0].displayDate} · {orders[0].items?.length || 1} Line Item{(orders[0].items?.length || 1) === 1 ? "" : "s"} · Royal Mail Tracked 24
                      </p>
                    </div>
                    <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                      <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                        {orders[0].status || "Cold-Chain Packing"}
                      </p>
                    </div>
                  </div>

                  {/* 4-Step Progress Stepper */}
                  <div className="bg-[#f8fafc] rounded-[10px] px-[16px] py-[14px] flex items-center justify-between gap-2 overflow-x-auto">
                    {/* Step 1 */}
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full bg-[#16a6a3] text-white flex items-center justify-center font-bold text-[11px]">
                        ✓
                      </div>
                      <span className="font-medium text-[#0f172a] text-[12px] whitespace-nowrap">
                        Order Placed
                      </span>
                    </div>
                    <div className="flex-1 h-[2px] min-w-[20px] bg-[#16a6a3] rounded-full" />

                    {/* Step 2 */}
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className={`w-[22px] h-[22px] rounded-full ${orders[0].status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#0b1f3a] text-white ring-4 ring-[#0b1f3a]/10"} flex items-center justify-center font-bold text-[11px]`}>
                        {orders[0].status === "Delivered" ? "✓" : "2"}
                      </div>
                      <span className="font-bold text-[#0b1f3a] text-[12px] whitespace-nowrap">
                        Cold-Chain Packing
                      </span>
                    </div>
                    <div className={`flex-1 h-[2px] min-w-[20px] ${orders[0].status === "Delivered" ? "bg-[#16a6a3]" : "bg-[#e2e8f0]"} rounded-full`} />

                    {/* Step 3 */}
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className={`w-[22px] h-[22px] rounded-full ${orders[0].status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#cbd5e1] text-white"} flex items-center justify-center font-bold text-[11px]`}>
                        {orders[0].status === "Delivered" ? "✓" : "3"}
                      </div>
                      <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                        Dispatched (Tracked 24)
                      </span>
                    </div>
                    <div className={`flex-1 h-[2px] min-w-[20px] ${orders[0].status === "Delivered" ? "bg-[#16a6a3]" : "bg-[#e2e8f0]"} rounded-full`} />

                    {/* Step 4 */}
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className={`w-[22px] h-[22px] rounded-full ${orders[0].status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#cbd5e1] text-white"} flex items-center justify-center font-bold text-[11px]`}>
                        {orders[0].status === "Delivered" ? "✓" : "4"}
                      </div>
                      <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                        Delivered
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#f1f5f9] w-full" />

                  {/* Ordered Items List */}
                  <div className="flex flex-col gap-[14px]">
                    {orders[0].items?.map((item: any, idx: number) => {
                      const { cleanTitle, specification, options } = getItemDisplayDetails(item)
                      return (
                        <div key={item.id || idx} className="flex items-start justify-between gap-4">
                          <div className="flex gap-[14px] items-start">
                            <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 mt-0.5">
                              <img
                                alt=""
                                className="w-full h-full object-contain"
                                src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                              />
                            </div>
                            <div className="flex flex-col gap-[2px]">
                              <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                                {cleanTitle}
                              </p>
                              <p className="font-normal text-[#64748b] text-[12px]">
                                {specification}
                              </p>
                              {options && options.length > 0 && (
                                <div className="flex flex-col gap-0.5 mt-0.5 text-[11.5px]">
                                  {options.map((opt: any, oIdx: number) => (
                                    <span key={oIdx} className="text-slate-600">
                                      <span className="text-slate-400 font-medium">{opt.label}: </span>
                                      <span className="font-semibold text-slate-700">{opt.value}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-[#0b1f3a] text-[14px] shrink-0 font-mono">
                            £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-px bg-[#f1f5f9] w-full" />

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-[8px] items-center text-[13px]">
                      <span className="text-[#64748b]">Total Paid:</span>
                      <span className="font-bold text-[#0b1f3a] text-[16px]">£{orders[0].total?.toFixed(2)}</span>
                      {orders[0].paymentMethod && (
                        <span className="text-[#94a3b8] text-[12.5px]">({orders[0].paymentMethod})</span>
                      )}
                    </div>
                    <div className="flex gap-[10px] items-center">
                      <button
                        type="button"
                        onClick={() => handleTabChange("orders")}
                        className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12.5px] font-semibold px-[16px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                      >
                        Live Dispatch Tracker →
                      </button>
                      <Link
                        href={`/receipt/${encodeURIComponent(orders[0].id)}`}
                        target="_blank"
                        className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors inline-flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>View &amp; Print Receipt ↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[36px] shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center gap-[16px]">
                  <div className="w-[56px] h-[56px] rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#0b1f3a]">
                    <svg className="w-7 h-7 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="max-w-[440px]">
                    <p className="font-bold text-[#0b1f3a] text-[18px]">No Orders Placed Yet</p>
                    <p className="font-normal text-[#64748b] text-[13px] mt-1.5 leading-relaxed">
                      You haven&apos;t placed any research peptide orders yet. Once you complete checkout, your order progress, cold-chain tracking, and dispatch details will appear here.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-center pt-1">
                    <Link
                      href="/refills"
                      className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13px] font-semibold px-[18px] py-[9px] rounded-[8px] transition-colors"
                    >
                      Browse Refill Cartridges
                    </Link>
                    <Link
                      href="/pen-sets"
                      className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[13px] font-semibold px-[16px] py-[9px] rounded-[8px] transition-colors"
                    >
                      Complete Pen Sets
                    </Link>
                  </div>
                </div>
              )}

              {/* Card 2: Active Refill Protocol */}
              {subscriptions.length > 0 ? (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[18px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-bold text-[#0b1f3a] text-[17px]">
                        Active Refill Protocol · 28-Day Automated Cycle
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px]">
                        Ensures uninterrupted cold-chain peptide supply with 10% subscriber savings
                      </p>
                    </div>
                    <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                      <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                        Active Subscription
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] px-4 sm:px-[28px] py-[22px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-[14px] items-center">
                      <div className="w-[44px] h-[44px] rounded-[8px] bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src={subscriptions[0].image || "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"}
                        />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <p className="font-bold text-[#0b1f3a] text-[14px]">
                          {subscriptions[0].title}
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px]">
                          Next auto-billing &amp; dispatch: {subscriptions[0].nextDispatchDate} · Protocol: {subscriptions[0].protocolInfo || "Standard Cadence"}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1f3a] text-[15px] whitespace-nowrap">
                      £{subscriptions[0].price?.toFixed(2)} / cycle
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-[10px] items-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleTabChange("subscriptions")
                        setScheduleExpanded(true)
                      }}
                      className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                    >
                      Manage Refill Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipSubscription(subscriptions[0].id)}
                      className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                    >
                      Skip Next Cycle
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[28px] shadow-xs border border-slate-100 flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[16px]">
                        Automated 28-Day Refill Protocols
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px] mt-0.5">
                        Maintain uninterrupted cold-chain peptide supply with 10% subscriber savings.
                      </p>
                    </div>
                    <span className="bg-[#f1f5f9] text-[#64748b] text-[11px] font-medium px-[10px] py-[4px] rounded-[12px]">
                      0 Active Protocols
                    </span>
                  </div>
                  <div className="bg-[#f8fafc] border border-slate-200 border-dashed rounded-[12px] p-6 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-[13px] text-[#0b1f3a] font-semibold">No active recurring refill cycles on file.</p>
                    <p className="text-[12px] text-[#64748b] max-w-[420px]">
                      Compatible refill cartridges and lyophilised vials can be ordered on a 28-day automated cycle with flexible pause and cancel controls.
                    </p>
                    <Link
                      href="/refills"
                      className="mt-1 text-[12.5px] font-semibold text-[#16a6a3] hover:underline"
                    >
                      Explore 28-Day Refills →
                    </Link>
                  </div>
                </div>
              )}

              {/* Card 3: Digital COA Vault */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[18px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[17px]">
                    Digital Certificate of Analysis (COA) Vault
                  </p>
                  <p className="font-medium text-[#64748b] text-[12.5px]">
                    {orders.length > 0 ? `${orders.reduce((acc, o) => acc + (o.items?.length || 0), 0)} Verified Batch Reports` : "Central Verified Library"}
                  </p>
                </div>

                {orders.length > 0 ? (
                  <div className="flex flex-col gap-[10px]">
                    {orders.flatMap(o => o.items || []).slice(0, 3).map((item: any, idx: number) => (
                      <div key={item.id || idx} className="bg-[#f8fafc] rounded-[8px] px-[14px] py-[10px] flex items-center justify-between">
                        <div className="flex gap-[12px] items-center flex-wrap">
                          <span className="font-bold text-[#0b1f3a] text-[13px]">
                            {item.batchNumber ? `Batch #${item.batchNumber}` : `Batch Record #${orders[0]?.id || (idx + 1)}`}
                          </span>
                          <span className="font-medium text-[#0f172a] text-[13px]">
                            {item.title}
                          </span>
                          <span className="bg-[#e6fffa] text-[#16a6a3] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                            {item.purity || "Verified RUO"}
                          </span>
                        </div>
                        <Link
                          href="/lab-reports"
                          className="bg-white border border-slate-200 hover:border-slate-300 text-[#0b1f3a] font-semibold text-[11.5px] px-[10px] py-[5px] rounded-[6px] transition-colors"
                        >
                          View COA →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#f8fafc] rounded-[10px] p-5 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-[13px] text-[#0b1f3a] font-medium">Batch lab reports will automatically link here upon order completion.</p>
                    <p className="text-[12px] text-[#64748b]">You can also look up any batch or lot number in our central repository.</p>
                    <Link
                      href="/lab-reports"
                      className="text-[12.5px] font-semibold text-[#16a6a3] hover:underline pt-1"
                    >
                      Search Central COA Library →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Column (w-[420px]) */}
            <div className="flex flex-col gap-[24px] w-full lg:w-[420px] shrink-0">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">Delivery Address</p>
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#64748b] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                    DEFAULT
                  </span>
                </div>
                {effectiveAddresses && effectiveAddresses.length > 0 ? (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {effectiveAddresses[0].first_name} {effectiveAddresses[0].last_name}
                    </p>
                    {effectiveAddresses[0].company && <p>{effectiveAddresses[0].company}</p>}
                    <p>{effectiveAddresses[0].address_1}</p>
                    {effectiveAddresses[0].address_2 && <p>{effectiveAddresses[0].address_2}</p>}
                    <p>{effectiveAddresses[0].city}, {effectiveAddresses[0].postal_code}</p>
                    <p>{effectiveAddresses[0].country_code?.toUpperCase() === "GB" ? "United Kingdom" : effectiveAddresses[0].country_code?.toUpperCase()}</p>
                  </div>
                ) : (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {customer.metadata?.title ? `${customer.metadata.title} ` : ""}
                      {customer.first_name} {customer.last_name}
                    </p>
                    {customer.company_name && <p>{customer.company_name}</p>}
                    <p className="text-[#64748b] italic">No delivery address saved yet.</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleTabChange("addresses")}
                  className="font-semibold text-[#0b1f3a] hover:text-[#16a6a3] text-[12.5px] text-left transition-colors cursor-pointer"
                >
                  Manage Delivery Addresses →
                </button>
              </div>

              {/* Payment & Billing Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">Payment &amp; Billing</p>
                  {paymentCards.length > 0 && (
                    <span className="bg-[#f8fafc] border border-slate-200 text-[#16a6a3] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                      ACTIVE
                    </span>
                  )}
                </div>
                {paymentCards.length > 0 ? (
                  <div className="flex flex-col gap-[4px]">
                    <div className="flex items-center gap-[8px] py-1">
                      {paymentCards[0].brand === "mastercard" ? (
                        <MastercardBadge className="w-[32px] h-[20px]" monochrome />
                      ) : paymentCards[0].brand === "amex" ? (
                        <AmexBadge className="w-[32px] h-[20px]" monochrome />
                      ) : paymentCards[0].brand === "jcb" ? (
                        <JcbBadge className="w-[32px] h-[20px]" monochrome />
                      ) : (
                        <VisaBadge className="w-[32px] h-[20px]" monochrome />
                      )}
                      <p className="font-semibold text-[#0f172a] text-[13.5px]">
                        {paymentCards[0].title || `${paymentCards[0].brand === "mastercard" ? "Mastercard" : paymentCards[0].brand === "amex" ? "American Express" : "Visa"} ${paymentCards[0].funding || "Card"}`} ending in •••• {paymentCards[0].last4}
                      </p>
                    </div>
                    {paymentCards[0].expiry && paymentCards[0].expiry !== "Verified" ? (
                      <p className="font-normal text-[#64748b] text-[12px]">
                        Expires: {paymentCards[0].expiry}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-[6px]">
                    <p className="text-[#64748b] text-[12.5px]">
                      No saved payment methods on file. Cards can be securely saved during checkout.
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleTabChange("payment")}
                  className="font-semibold text-[#0b1f3a] hover:text-[#16a6a3] text-[12.5px] text-left transition-colors cursor-pointer"
                >
                  Manage Payment Methods →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS & TRACKING (Node 52:9060) */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="flex flex-col lg:flex-row gap-[32px] items-start w-full">
            {/* Left Main Column */}
            <div className="flex flex-col gap-[24px] w-full lg:flex-1">
              {/* Filter Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="flex gap-[8px] items-center overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("all")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      ordersFilter === "all"
                        ? "bg-[#0b1f3a] text-white shadow-2xs"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300 font-medium"
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("transit")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      ordersFilter === "transit"
                        ? "bg-[#0b1f3a] text-white shadow-2xs font-semibold"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300 font-medium"
                    }`}
                  >
                    In Transit ({orders.filter(o => o.status !== "Delivered").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("delivered")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      ordersFilter === "delivered"
                        ? "bg-[#0b1f3a] text-white shadow-2xs font-semibold"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300 font-medium"
                    }`}
                  >
                    Delivered ({orders.filter(o => o.status === "Delivered").length})
                  </button>
                </div>

                <div className="flex gap-[8px] items-center w-full sm:w-auto">
                  <div className="bg-white border border-[#e2e8f0] flex gap-[8px] h-[35px] items-center px-[12px] rounded-[8px] flex-1 sm:w-[250px] shadow-2xs">
                    <img
                      alt=""
                      className="w-[14px] h-[14px] opacity-60 shrink-0"
                      src="/images/figma/e3f62c52a7fc2f0b8e680fc2bac1e48528c872a0.svg"
                    />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by Order # or Peptide..."
                      className="w-full bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder-[#94a3b8]"
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-[#0b1f3a] hover:bg-[#162a45] text-white font-semibold text-[12.5px] px-[16px] h-[35px] rounded-[8px] transition-colors cursor-pointer shrink-0"
                  >
                    Track
                  </button>
                </div>
              </div>

              {/* Order Cards List or Empty State */}
              {orders.length === 0 ? (
                <div className="bg-white rounded-[16px] p-12 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#0b1f3a]">
                    <svg className="w-7 h-7 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[17px]">No Order History Found</p>
                  <p className="text-sm text-[#64748b] max-w-[420px]">
                    You haven&apos;t placed any research peptide orders yet. Once placed, your cold-chain tracking status and line items will be displayed here in real time.
                  </p>
                  <Link
                    href="/pen-sets"
                    className="mt-2 bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] transition-colors"
                  >
                    Explore Research Catalog
                  </Link>
                </div>
              ) : (
                orders
                  .filter((order) => {
                    if (ordersFilter === "transit") return order.status !== "Delivered"
                    if (ordersFilter === "delivered") return order.status === "Delivered"
                    return true
                  })
                  .filter((order) => {
                    if (!orderSearchQuery.trim()) return true
                    const q = orderSearchQuery.toLowerCase()
                    return (
                      order.id?.toLowerCase().includes(q) ||
                      order.items?.some((it: any) => it.title?.toLowerCase().includes(q))
                    )
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[20px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-[3px]">
                          <p className="font-bold text-[#0b1f3a] text-[17px]">
                            Order #{order.id}
                          </p>
                          <p className="font-normal text-[#64748b] text-[12.5px]">
                            Placed {order.displayDate} · Tracking: {order.trackingNumber || "GB-RM24-PENDING"}
                          </p>
                        </div>
                        <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                          <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                            {order.status || "Cold-Chain Packing"}
                          </p>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="bg-[#f8fafc] rounded-[10px] px-[16px] py-[14px] flex items-center justify-between gap-2 overflow-x-auto">
                        <div className="flex gap-[8px] items-center shrink-0">
                          <div className="w-[22px] h-[22px] rounded-full bg-[#16a6a3] text-white flex items-center justify-center font-bold text-[11px]">
                            ✓
                          </div>
                          <span className="font-medium text-[#0f172a] text-[12px] whitespace-nowrap">
                            Order Placed
                          </span>
                        </div>
                        <div className="flex-1 h-[2px] min-w-[20px] bg-[#16a6a3] rounded-full" />
                        <div className="flex gap-[8px] items-center shrink-0">
                          <div className={`w-[22px] h-[22px] rounded-full ${order.status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#0b1f3a] text-white ring-4 ring-[#0b1f3a]/10"} flex items-center justify-center font-bold text-[11px]`}>
                            {order.status === "Delivered" ? "✓" : "2"}
                          </div>
                          <span className="font-bold text-[#0b1f3a] text-[12px] whitespace-nowrap">
                            Cold-Chain Packing
                          </span>
                        </div>
                        <div className={`flex-1 h-[2px] min-w-[20px] ${order.status === "Delivered" ? "bg-[#16a6a3]" : "bg-[#e2e8f0]"} rounded-full`} />
                        <div className="flex gap-[8px] items-center shrink-0">
                          <div className={`w-[22px] h-[22px] rounded-full ${order.status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#cbd5e1] text-white"} flex items-center justify-center font-bold text-[11px]`}>
                            {order.status === "Delivered" ? "✓" : "3"}
                          </div>
                          <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                            Dispatched (Tracked 24)
                          </span>
                        </div>
                        <div className={`flex-1 h-[2px] min-w-[20px] ${order.status === "Delivered" ? "bg-[#16a6a3]" : "bg-[#e2e8f0]"} rounded-full`} />
                        <div className="flex gap-[8px] items-center shrink-0">
                          <div className={`w-[22px] h-[22px] rounded-full ${order.status === "Delivered" ? "bg-[#16a6a3] text-white" : "bg-[#cbd5e1] text-white"} flex items-center justify-center font-bold text-[11px]`}>
                            {order.status === "Delivered" ? "✓" : "4"}
                          </div>
                          <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                            Delivered
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="flex flex-col gap-[14px]">
                        {order.items?.map((item: any, idx: number) => {
                          const { cleanTitle, specification, options } = getItemDisplayDetails(item)
                          return (
                            <div key={item.id || idx} className="flex items-start justify-between gap-4">
                              <div className="flex gap-[14px] items-start">
                                <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 mt-0.5">
                                  <img
                                    alt=""
                                    className="w-full h-full object-contain"
                                    src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                                  />
                                </div>
                                <div className="flex flex-col gap-[2px]">
                                  <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                                    {cleanTitle}
                                  </p>
                                  <p className="font-normal text-[#64748b] text-[12px]">
                                    {specification}
                                  </p>
                                  {options && options.length > 0 && (
                                    <div className="flex flex-col gap-0.5 mt-0.5 text-[11.5px]">
                                      {options.map((opt: any, oIdx: number) => (
                                        <span key={oIdx} className="text-slate-600">
                                          <span className="text-slate-400 font-medium">{opt.label}: </span>
                                          <span className="font-semibold text-slate-700">{opt.value}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="font-bold text-[#0b1f3a] text-[14px] shrink-0 font-mono">
                                £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="h-px bg-[#f1f5f9] w-full" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="font-bold text-[#0b1f3a] text-[15px]">
                          Total Paid: £{order.total?.toFixed(2)}
                        </p>
                        <div className="flex gap-[10px] items-center">
                          <button
                            type="button"
                            onClick={() => alert(`Tracking ${order.trackingNumber || order.id}: Cold-chain shipment verified.`)}
                            className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                          >
                            Track Live Dispatch →
                          </button>
                          <Link
                            href={`/receipt/${encodeURIComponent(order.id)}`}
                            target="_blank"
                            className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-[#16a6a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>View &amp; Print Receipt ↗</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[24px] w-full lg:w-[420px] shrink-0">
              {/* Order History & Spend Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[16px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">
                    Order History &amp; Spend
                  </p>
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#0b1f3a] text-[11px] font-bold px-[8px] py-[3px] rounded-[12px]">
                    2026 YTD
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-[10px] w-full">
                  <div className="bg-[#f8fafc] p-[10px] rounded-[8px]">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">{orders.length} Orders</p>
                    <p className="text-[#64748b] text-[11px]">Total Orders</p>
                  </div>
                  <div className="bg-[#f8fafc] p-[10px] rounded-[8px]">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">
                      £{orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-[#64748b] text-[11px]">Total Spend</p>
                  </div>
                  <div className="bg-[#f8fafc] p-[10px] rounded-[8px]">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">
                      {orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} Files
                    </p>
                    <p className="text-[#64748b] text-[11px]">COA Reports</p>
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9] w-full" />

                {orders.length > 0 ? (
                  <div className="flex flex-col gap-[10px] text-[13px]">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#0b1f3a]">#{o.id}</p>
                          <p className="text-[#64748b] text-[11.5px]">{o.displayDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0b1f3a]">£{o.total?.toFixed(2)}</p>
                          <p className="text-[#16a6a3] text-[11px] font-medium">{o.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748b] text-[12.5px] text-center py-2">
                    No order history recorded for 2026.
                  </p>
                )}

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => alert("Exporting 2026 Statement...")}
                    className="font-semibold text-[#0b1f3a] hover:text-[#16a6a3] text-[12.5px] text-left transition-colors pt-1 cursor-pointer"
                  >
                    Download 2026 Annual Statement (PDF) ↓
                  </button>
                )}
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">Delivery Address</p>
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#64748b] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                    DEFAULT
                  </span>
                </div>
                {effectiveAddresses && effectiveAddresses.length > 0 ? (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {effectiveAddresses[0].first_name} {effectiveAddresses[0].last_name}
                    </p>
                    {effectiveAddresses[0].company && <p>{effectiveAddresses[0].company}</p>}
                    <p>{effectiveAddresses[0].address_1}</p>
                    {effectiveAddresses[0].address_2 && <p>{effectiveAddresses[0].address_2}</p>}
                    <p>{effectiveAddresses[0].city}, {effectiveAddresses[0].postal_code}</p>
                    <p>{effectiveAddresses[0].country_code?.toUpperCase() === "GB" ? "United Kingdom" : effectiveAddresses[0].country_code?.toUpperCase()}</p>
                  </div>
                ) : (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {customer.metadata?.title ? `${customer.metadata.title} ` : ""}
                      {customer.first_name} {customer.last_name}
                    </p>
                    {customer.company_name && <p>{customer.company_name}</p>}
                    <p className="text-[#64748b] italic">No delivery address saved yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ACTIVE SUBSCRIPTIONS (Node 52:9548 & 52:11602) */}
        {/* ========================================================= */}
        {activeTab === "subscriptions" && token && (
          <SubscriptionDashboard token={token} onSwitchTab={handleTabChange} />
        )}

        {activeTab === "addresses" && (
          <div className="flex flex-col gap-[24px] w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#0b1f3a] text-[18px]">
                  Saved Laboratory Addresses
                </h2>
                <p className="font-normal text-[#64748b] text-[13px] mt-0.5">
                  Manage cold-chain delivery destinations for automated refills and laboratory orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(true)}
                className="bg-[#0b1f3a] hover:bg-[#162a45] text-white font-semibold text-[13px] px-[16px] py-[10px] rounded-[6px] transition-colors cursor-pointer shrink-0"
              >
                + Add New Address
              </button>
            </div>

            {effectiveAddresses && effectiveAddresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                {effectiveAddresses.map((addr, index) => (
                  <div
                    key={addr.id || index}
                    className="bg-white rounded-[16px] p-6 sm:p-[28px] border border-slate-100 shadow-xs flex flex-col justify-between gap-[18px] min-h-[276px]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#0b1f3a] text-[15px]">
                        {addr.address_name || addr.company || `Laboratory Facility ${index + 1}`}
                      </p>
                      {addr.is_default_shipping && (
                        <span className="bg-[#e6fffa] text-[#16a6a3] font-bold text-[10.5px] px-[8px] py-[3px] rounded-[12px]">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-[5px] text-[13px]">
                      <p className="font-semibold text-[#0b1f3a]">
                        {addr.first_name} {addr.last_name}
                      </p>
                      {addr.company && <p className="text-[#64748b]">{addr.company}</p>}
                      <p className="text-[#64748b]">{addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ""}</p>
                      <p className="text-[#64748b]">{addr.city}, {addr.postal_code}, {addr.country_code?.toUpperCase() === "GB" ? "United Kingdom" : addr.country_code?.toUpperCase()}</p>
                      {addr.phone && <p className="text-[#64748b]">{addr.phone}</p>}
                    </div>

                    <div className="bg-[#f8fafc] px-[14px] py-[10px] rounded-[8px]">
                      <p className="text-[#64748b] text-[12px] leading-relaxed">
                        ✓ Refrigerated Parcel Delivery Authorized · Reception Open 08:00 - 18:00 GMT
                      </p>
                    </div>

                    <div className="flex gap-[16px] items-center text-[12.5px] pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={openEditProfileModal}
                        className="font-semibold text-[#16a6a3] hover:underline cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this delivery address?")) {
                            deleteAddress(addr.id)
                          }
                        }}
                        className="font-medium text-[#94a3b8] hover:text-rose-600 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[16px] p-10 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                <p className="font-bold text-[#0b1f3a] text-[16px]">No Saved Delivery Addresses</p>
                <p className="text-sm text-[#64748b] max-w-[420px]">
                  Add a verified delivery location for your laboratory cold-chain parcel dispatches and automated refills.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(true)}
                  className="mt-2 bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[8px] transition-colors cursor-pointer"
                >
                  + Add New Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PAYMENT METHODS (Node 52:10035) */}
        {/* ========================================================= */}
        {activeTab === "payment" && token && <AccountBilling token={token} />}
      </main>

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-[500px] w-full p-6 sm:p-8 border border-[#e2e8f0] shadow-xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1f3a]">
                  Edit Research Profile
                </h3>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  Update your researcher title, name, and affiliated institution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editSuccess && (
              <div className="bg-[#e6fffa] border border-[#16a6a3] text-[#0b1f3a] text-xs font-semibold p-3 rounded-[8px]">
                ✓ Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Avatar Row in Edit Profile */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-[12px] border border-slate-100">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-[#16a6a3] bg-[#0b1f3a] flex items-center justify-center">
                  {customer?.metadata?.avatar_url ? (
                    <img
                      src={customer.metadata.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {getInitials(editFirstName, editLastName)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[12px] font-semibold text-[#0b1f3a]">Profile Avatar</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0b1f3a] text-white hover:bg-[#162a45] transition-colors cursor-pointer"
                    >
                      {isUploadingAvatar ? "Uploading..." : "Upload New Photo"}
                    </button>
                    {customer?.metadata?.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Title</label>
                  <select
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-[#cbd5e1] rounded-[8px] px-2.5 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden bg-white"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Affiliated Institution / Facility
                </label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="e.g. Cambridge Biomedical Research Hub"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Laboratory Contact Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+44 1223 928 401"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-[8px] border border-slate-200 text-[#64748b] hover:text-[#0b1f3a] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn-press px-5 py-2 rounded-[8px] bg-[#0b1f3a] hover:bg-[#162a45] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD ADDRESS MODAL */}
      {/* ========================================================= */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[20px] max-w-[540px] w-full p-6 sm:p-8 border border-[#e2e8f0] shadow-xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1f3a]">
                  Add Laboratory Delivery Address
                </h3>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  Designate a verified destination for cold-chain parcels and refills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Address Label / Facility Name
                </label>
                <input
                  type="text"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="e.g. Cambridge Science Park Lab"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">First Name</label>
                  <input
                    type="text"
                    value={addrFirstName}
                    onChange={(e) => setAddrFirstName(e.target.value)}
                    placeholder={customer?.first_name || "First Name"}
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Last Name</label>
                  <input
                    type="text"
                    value={addrLastName}
                    onChange={(e) => setAddrLastName(e.target.value)}
                    placeholder={customer?.last_name || "Last Name"}
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Department / Company
                </label>
                <input
                  type="text"
                  value={addrCompany}
                  onChange={(e) => setAddrCompany(e.target.value)}
                  placeholder="e.g. Molecular Biology Facility"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Street Address (Line 1) *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="e.g. 10 Innovation Way"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Suite / Floor / Unit (Line 2)
                </label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="e.g. Unit 4B, Science Wing"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Cambridge"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addrPostcode}
                    onChange={(e) => setAddrPostcode(e.target.value)}
                    placeholder="e.g. CB4 0GF"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Country</label>
                  <select
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    className="border border-[#cbd5e1] rounded-[8px] px-2.5 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden bg-white"
                  >
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="US">United States (US)</option>
                    <option value="IE">Ireland (IE)</option>
                    <option value="DE">Germany (DE)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Phone</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+44 20 7123 4567"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 rounded-[8px] border border-slate-200 text-[#64748b] hover:text-[#0b1f3a] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addrSaving}
                  className="btn-press px-5 py-2 rounded-[8px] bg-[#0b1f3a] hover:bg-[#162a45] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {addrSaving ? "Adding..." : "Save Delivery Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a6a3]" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  )
}
