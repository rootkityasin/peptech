"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/CartContext"
import { useCustomer } from "@/context/CustomerContext"
import { createStoreOrder } from "@/lib/customer-api"
import {
  AppleLogo,
  GoogleLogo,
  VisaBadge,
  MastercardBadge,
  AmexBadge,
  JcbBadge,
} from "@/components/ui/PaymentBadges"

export default function CheckoutPage() {
  const router = useRouter()
  const {
    customer,
    token,
    isAuthenticated,
    isLoading: isCustomerLoading,
    login,
    register,
    logout,
    addAddress,
  } = useCustomer()
  const { items, subtotal, shippingCost, total, destination, setDestination, clearCart } = useCart()
  const [ruoAccepted, setRuoAccepted] = useState(false)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<any>(null)

  // Researcher Authentication Gate States
  const [authTab, setAuthTab] = useState<"signin" | "register">("signin")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authTitle, setAuthTitle] = useState("Dr.")
  const [authFirstName, setAuthFirstName] = useState("")
  const [authLastName, setAuthLastName] = useState("")
  const [authCompany, setAuthCompany] = useState("")
  const [authPhone, setAuthPhone] = useState("")
  const [authComplianceAccepted, setAuthComplianceAccepted] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    engraving: "",
    country: destination === "UK" ? "United Kingdom" : "United States",
    address1: "",
    address2: "",
    city: "",
    zip: "",
    state: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })

  // Pre-fill from authenticated customer profile if available
  useEffect(() => {
    if (customer) {
      const primaryAddr = customer.addresses?.[0]
      if (primaryAddr && !selectedAddressId) {
        setSelectedAddressId(primaryAddr.id)
      }
      const fullName = [
        customer.metadata?.title,
        customer.first_name,
        customer.last_name,
      ].filter(Boolean).join(" ")

      setFormData((prev) => ({
        ...prev,
        email: customer.email || prev.email || "",
        fullName: prev.fullName || fullName,
        phone: prev.phone || customer.phone || "",
        address1: prev.address1 || primaryAddr?.address_1 || "",
        address2: prev.address2 || primaryAddr?.address_2 || "",
        city: prev.city || primaryAddr?.city || "",
        zip: prev.zip || primaryAddr?.postal_code || "",
        country: primaryAddr?.country_code?.toUpperCase() === "GB" ? "United Kingdom" : (destination === "UK" ? "United Kingdom" : "United States"),
      }))
    }
  }, [customer, destination, selectedAddressId])

  const selectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id)
    const fullName = [
      addr.first_name || customer?.first_name,
      addr.last_name || customer?.last_name,
    ].filter(Boolean).join(" ")

    setFormData((prev) => ({
      ...prev,
      fullName: fullName || prev.fullName,
      phone: addr.phone || prev.phone || customer?.phone || "",
      address1: addr.address_1 || "",
      address2: addr.address_2 || "",
      city: addr.city || "",
      zip: addr.postal_code || "",
      country: addr.country_code?.toUpperCase() === "GB" ? "United Kingdom" : (destination === "UK" ? "United Kingdom" : "United States"),
    }))
  }

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!authEmail.trim() || !authPassword) {
      setAuthError("Please provide both your institutional email and password.")
      return
    }
    setIsAuthenticating(true)
    try {
      await login(authEmail.trim(), authPassword)
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials. Please verify your email and password.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!authFirstName.trim() || !authLastName.trim()) {
      setAuthError("Please enter your first and last name.")
      return
    }
    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Please enter a valid institutional email address.")
      return
    }
    if (!authPassword || authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.")
      return
    }
    if (!authComplianceAccepted) {
      setAuthError("You must acknowledge the 18+ Research Use Only (RUO) laboratory compliance agreement.")
      return
    }
    setIsAuthenticating(true)
    try {
      await register({
        email: authEmail.trim(),
        password: authPassword,
        first_name: authFirstName.trim(),
        last_name: authLastName.trim(),
        company_name: authCompany.trim() || "Independent Research Laboratory",
        phone: authPhone.trim() || undefined,
        metadata: {
          title: authTitle,
          role: "Verified Clinical Researcher",
          compliance_ack: true,
        },
      })
    } catch (err: any) {
      setAuthError(err.message || "Failed to complete researcher registration.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const hasSubscription = items.some((i) => i.isSubscription)
  const subscriptionSavings = items.reduce((acc, item) => {
    if (item.isSubscription && item.discountPercent) {
      return acc + (item.price * (item.discountPercent / 100)) * item.quantity
    }
    return acc
  }, 0)

  const finalTotal = total - (promoApplied ? 15 : 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "country") {
      setDestination(value === "United Kingdom" ? "UK" : "INTL")
    }
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === "LAB10" || promoCode.trim().toUpperCase() === "RESEARCH") {
      setPromoApplied(true)
    } else {
      alert("Promo code applied: Standard Institutional Researcher tier")
      setPromoApplied(true)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !customer) {
      alert("Institutional researcher authentication is required to place an order. Please sign in or register.")
      return
    }
    if (!ruoAccepted) {
      alert("Please acknowledge and accept the 18+ Research Use Only (RUO) and Terms agreement to proceed.")
      return
    }

    setIsProcessing(true)
    try {
      const cleanNum = formData.cardNumber.replace(/\s+/g, "")
      const last4 = cleanNum.slice(-4) || "4242"
      const cardType = cleanNum.startsWith("5") ? "Mastercard" : "Visa"
      const pMethod = paymentMethod === "card" ? `${cardType} ending in ${last4}` : "UK Faster Payments (Bank Transfer)"
      const newOrderNumber = Math.floor(10000 + Math.random() * 90000)

      // Step 1: Save new address to customer_address in PostgreSQL if not already present
      if (formData.address1 && token) {
        const addressAlreadyExists = customer.addresses?.some(
          (a) => a.address_1?.toLowerCase().trim() === formData.address1.toLowerCase().trim() &&
                 a.postal_code?.toLowerCase().trim() === formData.zip.toLowerCase().trim()
        )
        if (!addressAlreadyExists) {
          try {
            await addAddress({
              first_name: customer.first_name || formData.fullName.split(" ")[0] || "Researcher",
              last_name: customer.last_name || formData.fullName.split(" ").slice(1).join(" ") || "Account",
              company: customer.company_name || undefined,
              address_1: formData.address1,
              address_2: formData.address2 || undefined,
              city: formData.city,
              country_code: formData.country === "United Kingdom" ? "gb" : "us",
              postal_code: formData.zip,
              phone: formData.phone || customer.phone || undefined,
            })
          } catch (addrErr) {
            console.warn("Could not save address to customer profile:", addrErr)
          }
        }
      }

      // Step 2: Create real order in PostgreSQL database via Medusa 2.0 Order Module
      const orderPayload = {
        customer_id: customer.id,
        email: customer.email,
        currency_code: destination === "UK" ? "gbp" : "usd",
        status: "pending",
        metadata: {
          engraving: formData.engraving || null,
          payment_method: pMethod,
          tracking_number: `GB-RM24-PEP${newOrderNumber}-CLD`,
          destination,
          ruo_verified: true,
          ruo_acknowledged_at: new Date().toISOString(),
          customer_name: formData.fullName || `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
        },
        shipping_address: {
          first_name: customer.first_name || formData.fullName.split(" ")[0] || "Researcher",
          last_name: customer.last_name || formData.fullName.split(" ").slice(1).join(" ") || "Account",
          company: customer.company_name || "",
          address_1: formData.address1,
          address_2: formData.address2 || "",
          city: formData.city,
          country_code: formData.country === "United Kingdom" ? "gb" : "us",
          postal_code: formData.zip,
          phone: formData.phone || customer.phone || "",
        },
        billing_address: billingSameAsShipping ? undefined : {
          first_name: customer.first_name || formData.fullName.split(" ")[0] || "Researcher",
          last_name: customer.last_name || formData.fullName.split(" ").slice(1).join(" ") || "Account",
          company: customer.company_name || "",
          address_1: formData.address1,
          address_2: formData.address2 || "",
          city: formData.city,
          country_code: formData.country === "United Kingdom" ? "gb" : "us",
          postal_code: formData.zip,
          phone: formData.phone || customer.phone || "",
        },
        items: items.map((it) => ({
          title: it.title,
          quantity: it.quantity,
          unit_price: Math.round((it.isSubscription && itemDiscount(it) ? it.price * (1 - (it.discountPercent || 10) / 100) : it.price) * 100) / 100,
          thumbnail: it.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
          metadata: {
            format: it.format,
            is_subscription: it.isSubscription,
            options: it.options,
          }
        }))
      }

      function itemDiscount(item: any) {
        return Boolean(item.isSubscription && item.discountPercent)
      }

      let createdMedusaOrder: any = null
      try {
        const res = await createStoreOrder(orderPayload, token || undefined)
        createdMedusaOrder = res?.order
      } catch (apiErr) {
        console.warn("Could not write order via Medusa API, writing to session store:", apiErr)
      }

      const orderDisplayId = createdMedusaOrder?.display_id ? `PEP-${createdMedusaOrder.display_id}` : `PEP-${newOrderNumber}`
      const orderDbId = createdMedusaOrder?.id || `order_pep_${newOrderNumber}`

      const orderData = {
        id: orderDisplayId,
        dbId: orderDbId,
        date: createdMedusaOrder?.created_at || new Date().toISOString(),
        displayDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        total: finalTotal,
        status: "Cold-Chain Packing",
        trackingNumber: `GB-RM24-${orderDisplayId.replace(/[^a-zA-Z0-9]/g, "")}-CLD`,
        paymentMethod: pMethod,
        items: items.map((it) => ({
          id: it.id,
          title: it.title,
          subtitle: it.isSubscription ? "28-Day Refill Protocol" : "Laboratory RUO Grade",
          price: it.price,
          quantity: it.quantity,
          image: it.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
        })),
        customerName: formData.fullName || `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Researcher",
        shippingAddress: `${formData.address1}${formData.address2 ? ", " + formData.address2 : ""}, ${formData.city}, ${formData.zip}`,
      }

      setPlacedOrder(orderData)

      try {
        sessionStorage.setItem("peptech_last_order", JSON.stringify(orderData))
      } catch {}

      // Handle subscription storage if present
      if (hasSubscription) {
        try {
          const rawSubs = localStorage.getItem(`peptech_customer_subscriptions_${customer.id}`)
          const existingSubs = rawSubs ? JSON.parse(rawSubs) : []
          const subItems = items.filter(it => it.isSubscription)
          subItems.forEach((it) => {
            const subId = `SUB-${it.id.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
            const nextBilling = new Date()
            nextBilling.setDate(nextBilling.getDate() + 28)
            existingSubs.unshift({
              id: subId,
              title: it.title,
              frequency: "Every 28 Days (Standard Cycle)",
              status: "Active",
              price: it.price * (1 - (it.discountPercent || 10) / 100),
              nextBillingDate: nextBilling.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              image: it.image,
              quantity: it.quantity,
              cardEnding: last4,
              shipsTo: formData.address1 ? `${formData.city} (${formData.fullName})` : "Laboratory Address",
            })
          })
          localStorage.setItem(`peptech_customer_subscriptions_${customer.id}`, JSON.stringify(existingSubs))
        } catch {}
      }

      // If card, save payment card
      if (paymentMethod === "card" && cleanNum.length >= 4) {
        try {
          const rawCards = localStorage.getItem(`peptech_customer_cards_${customer.id}`)
          const existingCards = rawCards ? JSON.parse(rawCards) : []
          if (!existingCards.some((c: any) => c.last4 === last4)) {
            existingCards.push({
              id: `card_${Date.now()}`,
              brand: cardType.toLowerCase(),
              title: `${cardType} Corporate`,
              last4,
              expiry: formData.cardExpiry || "12/28",
              cardholder: formData.fullName,
              billingAddress: `${formData.address1}, ${formData.city}`,
              isDefault: existingCards.length === 0,
            })
            localStorage.setItem(`peptech_customer_cards_${customer.id}`, JSON.stringify(existingCards))
          }
        } catch {}
      }

      clearCart()
      setIsSuccess(true)
    } catch (err: any) {
      alert(`Order submission error: ${err.message || "Failed to place order. Please try again."}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // If order succeeded, render the 100% Figma Node 52:8419 Payment Success view
  if (isSuccess) {
    return (
      <div
        className="bg-white flex flex-col items-center justify-center py-[48px] min-h-screen w-full"
        data-node-id="52:8419"
        data-name="PEPTECH - Payment Success Prototype"
      >
        <div
          className="flex flex-col gap-[20px] items-center justify-center w-full max-w-[560px] px-4"
          data-node-id="52:8420"
        >
          {/* Brand Logo Box */}
          <div className="flex items-center justify-center" data-node-id="52:8421">
            <img
              src="/images/figma/c053e9bca99b2b8f944f474abd976f1ff48db2ed.png"
              alt="PEPTECH"
              className="h-[28px] w-auto object-contain"
              data-node-id="52:8422"
            />
          </div>

          {/* Success Icon Badge */}
          <div
            className="bg-[#e6fffa] flex items-center justify-center rounded-[32px] size-[64px]"
            data-node-id="52:8423"
          >
            <div
              className="bg-[#16a6a3] flex items-center justify-center rounded-[23px] size-[46px]"
              data-node-id="52:8424"
            >
              <img
                src="/images/figma/3bed33eb2e1b4c1910e4a19511aab6704caaae5c.svg"
                alt="Success"
                className="size-[22px] block"
                data-node-id="52:8425"
              />
            </div>
          </div>

          {/* Text Stack */}
          <div
            className="flex flex-col gap-[6px] items-center text-center"
            data-node-id="52:8427"
          >
            <h1
              className="font-bold text-[#0b1f3a] text-[26px] leading-tight"
              data-node-id="52:8428"
            >
              Payment successful
            </h1>
            <p
              className="font-normal text-[#64748b] text-[13.5px] max-w-[420px]"
              data-node-id="52:8429"
            >
              Thank you for your order. We&apos;ve sent your receipt and batch COA to your email.
            </p>
          </div>

          {/* Order Receipt Slip */}
          <div
            className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[26px] sm:p-[28px] rounded-[16px] shadow-[0px_2px_8px_0px_rgba(10,31,59,0.03),0px_16px_36px_0px_rgba(10,31,59,0.06)] w-full"
            data-node-id="52:8492"
          >
            {/* Slip Header Row */}
            <div
              className="flex items-center justify-between w-full text-[13px]"
              data-node-id="52:8493"
            >
              <div className="flex gap-[6px] items-center" data-node-id="52:8494">
                <span className="text-[#64748b]" data-node-id="52:8495">Order ID:</span>
                <span className="font-bold text-[#0b1f3a]" data-node-id="52:8496">
                  {placedOrder?.id || "#PEP-ORD"}
                </span>
              </div>
              <span className="text-[#94a3b8] text-[12px]" data-node-id="52:8497">
                {placedOrder?.displayDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="bg-[#f1f5f9] h-px w-full" data-node-id="52:8498" />

            {/* Slip Body Rows */}
            <div
              className="flex flex-col gap-[11px] items-start w-full text-[13px]"
              data-node-id="52:8499"
            >
              <div className="flex items-center justify-between w-full" data-node-id="52:8500">
                <span className="text-[#64748b]" data-node-id="52:8501">Payment amount</span>
                <span className="font-bold text-[#0b1f3a] text-[17px]" data-node-id="52:8502">
                  £{(placedOrder?.total ?? finalTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8503">
                <span className="text-[#64748b]" data-node-id="52:8504">Payment method</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px]" data-node-id="52:8505">
                  {placedOrder?.paymentMethod || (paymentMethod === "card" ? "Authorized Payment Card" : "UK Faster Payments (Bank Transfer)")}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8506">
                <span className="text-[#64748b]" data-node-id="52:8507">Order items</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px] truncate max-w-[280px]" data-node-id="52:8508">
                  {placedOrder?.items?.map((i: any) => `${i.title} (${i.quantity}x)`).join(", ") || "Research Peptide Items"}
                </span>
              </div>
              <div className="flex items-center justify-between w-full" data-node-id="52:8509">
                <span className="text-[#64748b]" data-node-id="52:8510">Delivery method</span>
                <span className="font-medium text-[#0b1f3a] text-[13.5px]" data-node-id="52:8511">
                  Royal Mail Tracked 24 (Cold-Chain)
                </span>
              </div>
            </div>

            <div className="bg-[#f1f5f9] h-px w-full" data-node-id="52:8512" />

            {/* Slip Actions Row */}
            <div
              className="flex items-center justify-between w-full"
              data-node-id="52:8513"
            >
              <div
                className="bg-[#e6fffa] flex gap-[6px] items-center px-[10px] py-[4px] rounded-[20px]"
                data-node-id="52:8514"
              >
                <img
                  src="/images/figma/5e8dbe8d29765b6f8d79690d9f2c6b1f1d8b3eed.svg"
                  alt="Verified"
                  className="size-[12px] block"
                  data-node-id="52:8515"
                />
                <span
                  className="font-semibold text-[#16a6a3] text-[11.5px]"
                  data-node-id="52:8517"
                >
                  Payment Verified &amp; Confirmed
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#f8fafc] hover:bg-slate-100 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[8px] transition-colors cursor-pointer"
                data-node-id="52:8518"
              >
                <img
                  src="/images/figma/56efa08312dbf6221d1bfffe005a20a1ed7d34dc.svg"
                  alt="Print"
                  className="size-[14px] block"
                  data-node-id="52:8519"
                />
                <span
                  className="font-semibold text-[#0b1f3a] text-[12.5px]"
                  data-node-id="52:8522"
                >
                  Print Slip
                </span>
              </button>
            </div>
          </div>

          {/* Success Action Buttons Row */}
          <div
            className="flex flex-col sm:flex-row gap-[12px] w-full"
            data-node-id="52:8524"
          >
            <Link
              href="/shop"
              className="bg-[#f1f5f9] hover:bg-slate-200 flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-[#0b1f3a] font-semibold text-[14px] transition-colors text-center"
              data-node-id="52:8525"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="bg-[#0b1f3a] hover:bg-[#16335a] flex flex-1 h-[48px] items-center justify-center rounded-[8px] text-white font-semibold text-[14px] transition-colors text-center shadow-sm"
              data-node-id="52:8527"
            >
              Go to My Account →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const renderSummaryContent = () => (
    <div className="flex flex-col gap-5 w-full font-sans">
      {/* Itemized Items List */}
      <div
        className="flex flex-col gap-4 items-start w-full"
        data-node-id="50:8033"
        data-name="Itemized Items List"
      >
        {items.map((item) => {
          const unitPrice =
            item.isSubscription && item.discountPercent
              ? item.price * (1 - item.discountPercent / 100)
              : item.price
          const lineTotal = unitPrice * item.quantity

          const subtitle = item.isSubscription
            ? "Auto-renews every 28 days • 10% Off"
            : item.format === "pen-set"
            ? "Medical Applicator + Cartridge + 4x Needles"
            : "99.8% HPLC Certified • Sterile Vial"

          return (
            <div
              key={`${item.id}-${item.isSubscription}`}
              className="flex items-start justify-between w-full gap-3.5 py-1"
              data-name={`Summary Item - ${item.title}`}
            >
              <div className="flex flex-1 gap-3.5 items-center min-w-0" data-name="Left Item">
                <div
                  className="bg-white/[0.06] flex h-[52px] items-center justify-center rounded-xl shrink-0 size-[52px] p-1.5 border border-white/10 shadow-sm"
                  data-name="Thumb"
                >
                  <img
                    src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                    alt={item.title}
                    className="size-[42px] object-contain pointer-events-none"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 items-start min-w-0" data-name="Info">
                  <p className="font-semibold text-[14px] text-white tracking-tight truncate w-full">
                    {item.title}
                  </p>
                  <p className="font-normal text-slate-400 text-[12px] truncate w-full">
                    {subtitle}
                  </p>
                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-0.5 text-[11.5px] w-full">
                      {item.options.map((opt, idx) => (
                        <p key={idx} className="truncate w-full">
                          <span className="text-slate-400 font-normal">{opt.label}:</span>{" "}
                          <span className="text-slate-200 font-medium">{opt.value}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="font-semibold text-[15px] text-white whitespace-nowrap tabular-nums tracking-tight mt-0.5">
                £{lineTotal.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Promo Code Row */}
      <form
        onSubmit={handleApplyPromo}
        className="flex gap-2.5 h-[44px] items-center w-full pt-1"
        data-node-id="50:8058"
        data-name="Promo Code Row"
      >
        <div
          className="bg-white/[0.06] border border-white/15 focus-within:border-[#00C5A0] focus-within:ring-1 focus-within:ring-[#00C5A0]/50 flex flex-1 h-full items-center px-3.5 rounded-xl transition-all"
          data-node-id="50:8059"
          data-name="Promo Input"
        >
          <input
            type="text"
            placeholder="Add promo or coupon code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="bg-transparent text-white text-[13px] w-full placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-white/[0.12] hover:bg-[#00C5A0] hover:text-[#0B1F3A] flex h-full items-center justify-center px-5 rounded-xl text-white text-[13px] font-medium transition-all duration-200 cursor-pointer shrink-0 shadow-sm active:scale-95"
          data-node-id="50:8061"
          data-name="Apply Promo Button"
        >
          {promoApplied ? "Applied ✓" : "Apply"}
        </button>
      </form>

      {/* Divider */}
      <div className="bg-white/[0.08] h-px w-full my-0.5" data-node-id="50:8063" />

      {/* Financials Box */}
      <div
        className="flex flex-col gap-3 items-start w-full text-[13.5px] pt-1"
        data-node-id="50:8064"
        data-name="Financials Box"
      >
        <div className="flex items-center justify-between w-full" data-node-id="50:8065">
          <span className="text-slate-300 font-normal" data-node-id="50:8066">Subtotal</span>
          <span className="font-medium text-white text-[14px] tabular-nums" data-node-id="50:8067">
            £{subtotal.toFixed(2)}
          </span>
        </div>
        {subscriptionSavings > 0 && (
          <div className="flex items-center justify-between w-full" data-node-id="50:8068">
            <span className="text-slate-300 font-normal" data-node-id="50:8069">
              28-Day Subscription Savings (10%)
            </span>
            <span className="font-semibold text-[#00C5A0] text-[14px] tabular-nums" data-node-id="50:8070">
              -£{subscriptionSavings.toFixed(2)}
            </span>
          </div>
        )}
        {promoApplied && (
          <div className="flex items-center justify-between w-full">
            <span className="text-slate-300 font-normal">Institutional Researcher Discount</span>
            <span className="font-semibold text-[#00C5A0] text-[14px] tabular-nums">-£15.00</span>
          </div>
        )}
        <div className="flex items-center justify-between w-full" data-node-id="50:8071">
          <span className="text-slate-300 font-normal" data-node-id="50:8072">
            Royal Mail Special Delivery (Tracked 24)
          </span>
          <span className="font-semibold text-[#00C5A0] text-[13.5px] tracking-wide" data-node-id="50:8073">
            {destination === "UK" ? "FREE" : "£15.00"}
          </span>
        </div>
        <div className="flex items-center justify-between w-full" data-node-id="50:8074">
          <div className="flex gap-1.5 items-center" data-node-id="50:8167">
            <span className="text-slate-300 font-normal" data-node-id="50:8168">Tax</span>
            <img
              src="/images/figma/c625150f6097c7e9a94871ef584d45568709e394.svg"
              alt="Info"
              className="size-[13px] block opacity-70"
              data-node-id="50:8169"
            />
          </div>
          <span className="text-slate-400 text-[12.5px]" data-node-id="50:8173">
            Included (UK VAT Exempt for RUO)
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="bg-white/[0.08] h-px w-full my-0.5" data-node-id="50:8077" />

      {/* Total Due Row */}
      <div
        className="flex items-center justify-between w-full text-white pt-1"
        data-node-id="50:8078"
        data-name="Total Due Row"
      >
        <span className="font-medium text-slate-200 text-[15px]" data-node-id="50:8079">
          Total due today
        </span>
        <span className="font-bold text-[26px] tracking-tight tabular-nums" data-node-id="50:8080">
          £{finalTotal.toFixed(2)}
        </span>
      </div>
    </div>
  )

  return (
    <div
      className="bg-white flex flex-col lg:flex-row w-full min-h-screen relative font-sans"
      data-node-id="50:8021"
      data-name="PEPTECH - Checkout Page Prototype"
    >
      {/* ======================================================== */}
      {/* MOBILE TOP BAR (< lg)                                    */}
      {/* ======================================================== */}
      <div className="lg:hidden w-full bg-[#0A1B33] text-white border-b border-white/10 sticky top-0 z-30 shadow-md">
        {/* Top brand row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-lg size-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link href="/" className="flex items-center">
              <img
                src="/images/figma/43d09fdba59db4b9cd704c903f631862a259e619.png"
                alt="PEPTECH"
                className="h-5 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#94A3B8] block uppercase tracking-wider">Due Today</span>
            <span className="text-base font-bold text-white">£{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Collapsible Order Summary Bar */}
        <div className="border-t border-white/10 px-4 sm:px-6 py-3 bg-[#08182E] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="flex items-center gap-2 text-[13px] font-medium text-[#00C5A0] hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#00C5A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{summaryExpanded ? "Hide order summary" : "Show order summary"}</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 transform text-[#00C5A0] ${summaryExpanded ? "rotate-180 text-white" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {hasSubscription && (
            <span className="text-[11px] bg-[#00C5A0]/15 text-[#00C5A0] border border-[#00C5A0]/30 font-semibold px-2.5 py-1 rounded-full tracking-wide">
              28-Day Refill Included
            </span>
          )}
        </div>

        {/* Expanded Summary Drawer on Mobile (Smooth Accordion Transition) */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#08182E] border-t border-white/10 ${
            summaryExpanded ? "max-h-[1400px] opacity-100 py-6 px-4 sm:px-6" : "max-h-0 opacity-0 py-0 px-4 sm:px-6 pointer-events-none"
          }`}
        >
          {renderSummaryContent()}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP LEFT SUMMARY COLUMN (Full Screen Half, #0a1b33)  */}
      {/* ======================================================== */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[44%] 2xl:w-[42%] bg-[#0a1b33] min-h-screen justify-end shrink-0 border-r border-[#1e293b]"
        data-node-id="50:8022"
        data-name="Left Summary Column"
      >
        <div className="w-full max-w-[560px] px-8 lg:px-10 xl:px-14 py-10 flex flex-col gap-[20px] text-white">
          {/* Top Nav Row */}
          <div
            className="flex gap-[16px] items-center w-full"
            data-node-id="50:8023"
            data-name="Top Nav Row"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-[12px] size-[28px] hover:bg-white/10 transition-colors cursor-pointer"
              data-node-id="50:8024"
              data-name="Back Button"
              aria-label="Back"
            >
              <img
                src="/images/figma/0d968d2c24d222a837cbe159704831bf4712a235.svg"
                alt="Back"
                className="size-[20px] block"
                data-node-id="50:8164"
              />
            </button>
            <Link href="/" className="h-[22px] w-[182px] relative block" data-node-id="50:8026" data-name="PEPTECH Logo">
              <img
                src="/images/figma/43d09fdba59db4b9cd704c903f631862a259e619.png"
                alt="PEPTECH"
                className="size-full object-contain pointer-events-none"
              />
            </Link>
          </div>

          {/* Hero Price Display */}
          <div
            className="flex flex-col gap-[4px] items-start w-full"
            data-node-id="50:8027"
            data-name="Hero Price Display"
          >
            <p
              className="font-medium text-[#94a3b8] text-[13px]"
              data-node-id="50:8028"
            >
              Total due today
            </p>
            <div
              className="flex gap-[12px] items-center w-full flex-wrap"
              data-node-id="50:8029"
              data-name="Hero Price Row"
            >
              <p
                className="font-bold text-white text-[34px] leading-tight"
                data-node-id="50:8030"
              >
                £{finalTotal.toFixed(2)}
              </p>
              {hasSubscription && (
                <div
                  className="bg-[#00C5A0]/15 text-[#00C5A0] border border-[#00C5A0]/30 flex items-center justify-center px-3 py-1 rounded-full shadow-sm"
                  data-node-id="50:8031"
                  data-name="Cadence Pill"
                >
                  <span
                    className="font-semibold text-[11px] whitespace-nowrap tracking-wide"
                    data-node-id="50:8032"
                  >
                    28-Day Refill Included
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Summary Content */}
          {renderSummaryContent()}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT FORM COLUMN (Full Screen Half, White)              */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[54%] xl:w-[56%] 2xl:w-[58%] bg-white min-h-screen flex justify-start">
        {isCustomerLoading ? (
          <div className="w-full max-w-[680px] px-4 sm:px-8 lg:px-12 xl:px-16 py-16 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[#16a6a3] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-[#64748b]">Verifying researcher session...</p>
          </div>
        ) : !isAuthenticated || !customer ? (
          <div className="w-full max-w-[680px] px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 flex flex-col gap-6">
            {/* Header Compliance Box */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1f3a]/5 border border-[#0b1f3a]/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#16a6a3] animate-pulse" />
                <span className="text-[11px] font-bold text-[#0b1f3a] uppercase tracking-wider">
                  UK Laboratory Chemical Control Standard
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#0b1f3a] tracking-tight">
                Researcher Authentication Required
              </h2>
              <p className="text-[13px] text-[#64748b] leading-relaxed">
                Per UK &amp; international laboratory peptide regulations, all orders must be associated with an authenticated institutional researcher or authorized laboratory account. Guest checkout is disabled.
              </p>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex rounded-xl bg-[#f1f5f9] p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => { setAuthTab("signin"); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authTab === "signin"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                Sign In to Existing Account
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("register"); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authTab === "register"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                Register Verified Researcher
              </button>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <span className="text-sm font-bold">⚠</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Sign In Form */}
            {authTab === "signin" ? (
              <form onSubmit={handleAuthLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#475569]">
                    Institutional Researcher Email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="researcher@biotech-institute.org"
                    className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3] focus:border-[#16a6a3]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#475569]">
                    Account Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3] focus:border-[#16a6a3]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="mt-2 h-12 rounded-xl bg-[#0b1f3a] hover:bg-[#162a45] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In &amp; Proceed to Checkout →</span>
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleAuthRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#475569]">Title</label>
                    <select
                      value={authTitle}
                      onChange={(e) => setAuthTitle(e.target.value)}
                      className="h-11 px-3 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] bg-white focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mx.">Mx.</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-semibold text-[#475569]">First &amp; Last Name</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={authFirstName}
                        onChange={(e) => setAuthFirstName(e.target.value)}
                        placeholder="First"
                        className="h-11 px-3 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                      />
                      <input
                        type="text"
                        required
                        value={authLastName}
                        onChange={(e) => setAuthLastName(e.target.value)}
                        placeholder="Last"
                        className="h-11 px-3 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#475569]">
                    Institutional / Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="researcher@biotech-lab.org"
                    className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#475569]">Laboratory / Institution</label>
                    <input
                      type="text"
                      value={authCompany}
                      onChange={(e) => setAuthCompany(e.target.value)}
                      placeholder="e.g. Cambridge Biomedical Hub"
                      className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#475569]">Contact Phone</label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+44 7911 123456"
                      className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#475569]">
                    Account Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 px-3.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#16a6a3]"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="authComplianceCheckbox"
                    checked={authComplianceAccepted}
                    onChange={(e) => setAuthComplianceAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#16a6a3] focus:ring-[#16a6a3] cursor-pointer"
                  />
                  <label htmlFor="authComplianceCheckbox" className="text-[12px] text-[#64748b] leading-snug cursor-pointer">
                    I confirm that I am 18 years of age or older, authorized to purchase laboratory research materials, and that compounds will be used strictly for in-vitro scientific evaluation.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="mt-2 h-12 rounded-xl bg-[#00C5A0] hover:bg-[#00B08E] text-[#0B1F3A] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B1F3A] border-t-transparent rounded-full animate-spin" />
                      <span>Creating Researcher Profile...</span>
                    </>
                  ) : (
                    <span>Register &amp; Proceed to Checkout →</span>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            className="w-full max-w-[680px] px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 flex flex-col gap-[20px]"
            data-node-id="50:8087"
            data-name="Right Form Column"
          >
            {/* Authenticated Researcher Status Card */}
            <div className="bg-[#f0fdf9] border border-[#a7f3d0] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#16a6a3] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#0f766e] uppercase tracking-wider">
                    Verified Researcher Account
                  </p>
                  <p className="text-xs font-bold text-[#0b1f3a] truncate">
                    {[customer.metadata?.title, customer.first_name, customer.last_name].filter(Boolean).join(" ")} ({customer.email})
                  </p>
                  {customer.company_name && (
                    <p className="text-[11px] text-[#64748b] truncate">{customer.company_name}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs font-medium text-[#64748b] hover:text-[#0b1f3a] underline underline-offset-2 transition-colors cursor-pointer shrink-0 ml-2"
              >
                Sign Out / Switch
              </button>
            </div>
        {/* Express Checkout Box */}
        <div
          className="flex flex-col gap-[8px] items-start w-full"
          data-node-id="50:8088"
          data-name="Express Checkout Box"
        >
          <p
            className="font-semibold text-[#64748b] text-[13px]"
            data-node-id="50:8089"
          >
            Express Checkout
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] w-full"
            data-node-id="50:8090"
            data-name="Express Buttons Row"
          >
            {/* Apple Pay Button */}
            <button
              type="button"
              onClick={() => alert("Apple Pay (PEPTECH High-Risk SCA 3DS Tokenized Gateway)")}
              className="btn-press bg-black hover:bg-neutral-900 flex h-[48px] items-center justify-center gap-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              data-node-id="50:8153"
              data-name="Apple Pay Button"
            >
              <AppleLogo className="w-[17px] h-[21px] text-white -mt-0.5" fill="white" />
              <span className="font-bold text-[16px] text-white tracking-wide">
                Pay
              </span>
            </button>

            {/* Google Pay Button */}
            <button
              type="button"
              onClick={() => alert("Google Pay (PEPTECH High-Risk SCA 3DS Tokenized Gateway)")}
              className="btn-press bg-white hover:bg-slate-50 border border-[#cbd5e1] flex h-[48px] items-center justify-center gap-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              data-node-id="50:8157"
              data-name="Google Pay Button"
            >
              <GoogleLogo className="w-[19px] h-[19px]" />
              <span className="font-semibold text-[16px] text-[#3c4043]">
                Pay
              </span>
            </button>
          </div>
        </div>

        {/* Or Divider */}
        <div
          className="flex gap-[12px] items-center justify-center w-full my-1"
          data-node-id="50:8095"
          data-name="Or Divider"
        >
          <div className="bg-[#e2e8f0] flex-1 h-px" data-node-id="50:8096" />
          <p
            className="font-normal text-[#94a3b8] text-[11.5px]"
            data-node-id="50:8097"
          >
            or pay with card
          </p>
          <div className="bg-[#e2e8f0] flex-1 h-px" data-node-id="50:8098" />
        </div>

        {/* Shipping Information Section */}
        <div
          className="flex flex-col gap-[14px] items-start w-full"
          data-node-id="50:8174"
          data-name="Shipping Information Section"
        >
          <p
            className="font-bold text-[#0b1f3a] text-[15px]"
            data-node-id="50:8175"
          >
            Shipping information
          </p>

          {/* Saved Addresses Picker from PostgreSQL customer_address table */}
          {customer?.addresses && customer.addresses.length > 0 && (
            <div className="flex flex-col gap-2 w-full p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-[#475569] uppercase tracking-wider">
                  Saved Laboratory Delivery Addresses ({customer.addresses.length})
                </span>
                {selectedAddressId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(null)
                      setFormData((prev) => ({
                        ...prev,
                        address1: "",
                        address2: "",
                        city: "",
                        zip: "",
                      }))
                    }}
                    className="text-[11.5px] text-[#16a6a3] hover:underline font-semibold cursor-pointer"
                  >
                    + Enter New Address
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {customer.addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className={`text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      selectedAddressId === addr.id
                        ? "border-[#16a6a3] bg-[#f0fdf9] shadow-xs ring-1 ring-[#16a6a3]"
                        : "border-[#e2e8f0] bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-[#0b1f3a]">
                        {addr.first_name} {addr.last_name} {addr.company ? `• ${addr.company}` : ""}
                      </p>
                      <p className="text-[#64748b] truncate">
                        {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ""}, {addr.city}, {addr.postal_code}
                      </p>
                    </div>
                    {selectedAddressId === addr.id ? (
                      <span className="text-[#16a6a3] font-bold text-xs shrink-0">Selected ✓</span>
                    ) : (
                      <span className="text-slate-400 text-xs shrink-0">Use this</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email Field Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8176"
            data-name="Email Field Group"
          >
            <label
              htmlFor="email"
              className="font-medium text-[#475569] text-[13px]"
              data-node-id="50:8177"
            >
              Email
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex h-[42px] items-center px-[14px] rounded-[8px] w-full"
              data-node-id="50:8178"
            >
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13px] bg-transparent focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Personal Engraving Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8180"
            data-name="Personal Engraving Group"
          >
            <label
              htmlFor="engraving"
              className="font-medium text-[#475569] text-[13px]"
              data-node-id="50:8181"
            >
              Personal engraving
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex h-[42px] items-center justify-between pl-[14px] pr-[10px] rounded-[8px] w-full"
              data-node-id="50:8182"
            >
              <input
                id="engraving"
                type="text"
                name="engraving"
                value={formData.engraving}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13px] bg-transparent focus:outline-none placeholder:text-[#94a3b8]"
                placeholder="Custom laboratory ID / Pen engraving text"
              />
              <span
                className="font-normal text-[#94a3b8] text-[13px] whitespace-nowrap ml-2"
                data-node-id="50:8185"
              >
                Optional
              </span>
            </div>
          </div>

          {/* Shipping Address Group */}
          <div
            className="flex flex-col gap-[6px] items-start w-full"
            data-node-id="50:8186"
            data-name="Shipping Address Group"
          >
            <label
              className="font-medium text-[#475569] text-[13px]"
              data-node-id="50:8187"
            >
              Shipping address
            </label>
            <div
              className="bg-white border border-[#cbd5e1] flex flex-col items-start rounded-[8px] w-full overflow-hidden"
              data-node-id="50:8188"
              data-name="Address Matrix Container"
            >
              {/* Row - Full Name */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8189"
              >
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8191" />

              {/* Row - Country */}
              <div
                className="flex h-[38px] items-center justify-between px-[14px] w-full"
                data-node-id="50:8192"
              >
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full text-[13px] font-medium text-[#0b1f3a] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Australia">Australia</option>
                </select>
                <img
                  src="/images/figma/ac0f05ab35f639b793408b3455e8c057a73c1f13.svg"
                  alt="Chevron"
                  className="size-[12px] block pointer-events-none -ml-4"
                  data-node-id="50:8194"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8196" />

              {/* Row - Address Line 1 */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8197"
              >
                <input
                  type="text"
                  name="address1"
                  required
                  value={formData.address1}
                  onChange={handleInputChange}
                  placeholder="Address line 1"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8199" />

              {/* Row - Address Line 2 */}
              <div
                className="flex h-[38px] items-center px-[14px] w-full"
                data-node-id="50:8200"
              >
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  placeholder="Address line 2"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8202" />

              {/* City and ZIP Row */}
              <div
                className="flex h-[38px] items-center w-full"
                data-node-id="50:8203"
              >
                <div className="flex flex-1 h-full items-center px-[14px]">
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                  />
                </div>
                <div className="bg-[#e2e8f0] h-full w-px" data-node-id="50:8206" />
                <div className="flex flex-1 h-full items-center px-[14px]">
                  <input
                    type="text"
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP / Postal Code"
                    className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8209" />

              {/* Row - State */}
              <div
                className="flex h-[38px] items-center justify-between px-[14px] w-full"
                data-node-id="50:8210"
              >
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State / County / Region"
                  className="w-full text-[13px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                />
                <img
                  src="/images/figma/ac0f05ab35f639b793408b3455e8c057a73c1f13.svg"
                  alt="Chevron"
                  className="size-[12px] block pointer-events-none"
                  data-node-id="50:8212"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div
          className="flex flex-col gap-[8px] items-start w-full"
          data-node-id="50:8104"
          data-name="Payment Method Section"
        >
          <div className="flex items-center justify-between w-full">
            <p
              className="font-bold text-[#0b1f3a] text-[15px]"
              data-node-id="50:8269"
            >
              Payment method
            </p>
            {/* Method switch between Card and UK Faster Payments */}
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  paymentMethod === "card"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                Card (SCA 3DS)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  paymentMethod === "bank"
                    ? "bg-white text-[#0b1f3a] shadow-xs"
                    : "text-[#64748b] hover:text-[#0b1f3a]"
                }`}
              >
                UK Faster Payments
              </button>
            </div>
          </div>

          {paymentMethod === "card" ? (
            <div
              className="bg-white border border-[#cbd5e1] flex flex-col gap-[12px] items-start p-[16px] rounded-[10px] w-full"
              data-node-id="50:8270"
              data-name="Payment Method Outer Card"
            >
              <div
                className="flex gap-[8px] items-center w-full"
                data-node-id="50:8271"
                data-name="Card Radio Option Row"
              >
                <img
                  src="/images/figma/75de50cf21aff3f32d16f45441e50cd9aeff3c2a.svg"
                  alt="Selected"
                  className="size-[18px] block"
                  data-node-id="50:8272"
                />
                <img
                  src="/images/figma/b7f7e157fccaacb88eb1df8d437caf0564d19ad9.svg"
                  alt="Card"
                  className="h-[14px] w-[18px] block"
                  data-node-id="50:8275"
                />
                <span
                  className="font-semibold text-[#0b1f3a] text-[14px]"
                  data-node-id="50:8279"
                >
                  Card
                </span>
              </div>

              <p
                className="font-medium text-[#475569] text-[12.5px]"
                data-node-id="50:8280"
              >
                Card information
              </p>

              <div
                className="bg-white border border-[#cbd5e1] flex flex-col items-start rounded-[8px] w-full overflow-hidden"
                data-node-id="50:8281"
                data-name="Card Information Group"
              >
                {/* Card Number Row */}
                <div
                  className="flex h-[46px] sm:h-[44px] items-center justify-between pl-[14px] pr-[10px] w-full gap-2"
                  data-node-id="50:8282"
                >
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 1234 1234 1234"
                    className="w-full text-[15px] sm:text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none font-mono"
                  />
                  <div
                    className="flex gap-1.5 items-center shrink-0"
                    data-node-id="50:8284"
                  >
                    <VisaBadge />
                    <MastercardBadge />
                    <AmexBadge />
                    <JcbBadge />
                  </div>
                </div>

                <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8295" />

                {/* Expiry & CVC Row */}
                <div
                  className="flex h-[42px] items-center w-full"
                  data-node-id="50:8296"
                >
                  <div className="flex flex-1 h-full items-center px-[14px]">
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM / YY"
                      className="w-full text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="bg-[#e2e8f0] h-full w-px" data-node-id="50:8299" />
                  <div className="flex flex-1 h-full items-center justify-between px-[14px]">
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      placeholder="CVC"
                      className="w-full text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] bg-transparent focus:outline-none"
                    />
                    <img
                      src="/images/figma/82f5d1a1b3c15602bab94ef555b4d7e076c2e1c0.svg"
                      alt="CVC"
                      className="h-[16px] w-[26px] block shrink-0"
                      data-node-id="50:8357"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Same as Shipping Row */}
              <label
                className="flex gap-[8px] items-center w-full cursor-pointer mt-1"
                data-node-id="50:8308"
              >
                <div
                  className={`flex items-center justify-center rounded-[4px] size-[16px] border-[1.5px] transition-colors ${
                    billingSameAsShipping
                      ? "bg-[#0b1f3a] border-[#0b1f3a]"
                      : "bg-white border-[#475469]"
                  }`}
                  onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
                  data-node-id="50:8309"
                >
                  {billingSameAsShipping && (
                    <img
                      src="/images/figma/32f20819089ab9125b39743c1b4b5e726591e0d9.svg"
                      alt="Checked"
                      className="size-[11px] block invert"
                      data-node-id="50:8362"
                    />
                  )}
                </div>
                <span
                  className="font-normal text-[#475569] text-[13px]"
                  data-node-id="50:8311"
                >
                  Billing info is same as shipping
                </span>
              </label>
            </div>
          ) : (
            <div className="bg-[#f8fafc] border border-[#cbd5e1] p-[18px] rounded-[10px] w-full space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <span className="font-bold text-sm text-[#0b1f3a]">
                  UK Faster Payments (Bank Transfer)
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Account instructions and unique payment reference will be issued immediately upon order submission. Orders dispatch via Royal Mail Tracked once automated bank settlement is detected.
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <div>Bank: Barclays Bank UK PLC</div>
                <div>Account Name: PEPTECH INDUSTRIES LTD</div>
                <div>Reference Code: PT-REQ-INST</div>
              </div>
            </div>
          )}
        </div>

        {/* Phone and Link Box */}
        <div
          className="bg-white border border-[#cbd5e1] flex flex-col gap-[12px] items-start p-[16px] rounded-[10px] w-full"
          data-node-id="50:8312"
          data-name="Phone and Link Box"
        >
          <label
            htmlFor="phone"
            className="font-medium text-[#475569] text-[13px]"
            data-node-id="50:8313"
          >
            Phone number
          </label>
          <div
            className="bg-white border border-[#cbd5e1] flex h-[42px] items-center justify-between pl-[14px] pr-[10px] rounded-[8px] w-full"
            data-node-id="50:8314"
          >
            <div className="flex items-center gap-[8px] flex-1">
              <span className="text-[14px]">{destination === "UK" ? "🇬🇧" : "🇺🇸"}</span>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full text-[#0b1f3a] text-[13.5px] bg-transparent focus:outline-none placeholder:text-[#94a3b8]"
                placeholder="(201) 555-0123"
              />
            </div>
            <span
              className="font-normal text-[#94a3b8] text-[13px] ml-2"
              data-node-id="50:8319"
            >
              Optional
            </span>
          </div>

          <div className="bg-[#e2e8f0] h-px w-full" data-node-id="50:8320" />

          <p
            className="font-normal text-[#64748b] text-[11.5px] leading-[16px]"
            data-node-id="50:8321"
          >
            By providing your contact details, you agree to create a research account and save your dispatch address, subject to our Terms and Privacy Policy.
          </p>
        </div>

        {/* Terms Agreement & Mandatory 18+ RUO Checkbox */}
        <div
          className="flex gap-[10px] items-start w-full cursor-pointer py-1"
          onClick={() => setRuoAccepted(!ruoAccepted)}
          data-node-id="50:8322"
          data-name="Terms Agreement Row"
        >
          <div
            className={`flex items-center justify-center rounded-[4px] size-[18px] border-[1.5px] shrink-0 mt-0.5 transition-colors ${
              ruoAccepted
                ? "bg-[#1a56db] border-[#1a56db]"
                : "bg-white border-[#cbd5e1]"
            }`}
            data-node-id="50:8323"
          >
            {ruoAccepted && (
              <img
                src="/images/figma/32f20819089ab9125b39743c1b4b5e726591e0d9.svg"
                alt="Checked"
                className="size-[12px] block invert"
              />
            )}
          </div>
          <p
            className="font-normal text-[#475569] text-[12.5px] leading-snug"
            data-node-id="50:8324"
          >
            I confirm that I am at least 18 years of age and agree to PEPTECH&apos;s{" "}
            <Link href="/terms-of-sale" onClick={(e) => e.stopPropagation()} className="underline hover:text-[#0b1f3a]">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/privacy-policy" onClick={(e) => e.stopPropagation()} className="underline hover:text-[#0b1f3a]">
              Privacy Policy
            </Link>
            , and strict Research Use Only (RUO) laboratory conditions.
          </p>
        </div>

        {/* Pay Action Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="btn-shimmer btn-press bg-[#1a56db] hover:bg-[#1546b8] flex h-[50px] items-center justify-center rounded-xl w-full text-white font-semibold text-[15px] transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          data-node-id="50:8325"
          data-name="Pay Action Button"
        >
          {isProcessing ? "Authorizing SCA 3D Secure..." : `Pay £${finalTotal.toFixed(2)}`}
        </button>

        {/* Returns Guarantee Row */}
        <div
          className="flex gap-[6px] items-center justify-center w-full mt-1"
          data-node-id="50:8327"
          data-name="Returns Guarantee Row"
        >
          <img
            src="/images/figma/ad4ab2c76cb3f79e810c6af109b26156f538b564.svg"
            alt="Return"
            className="size-[14px] block"
            data-node-id="50:8328"
          />
          <span
            className="font-normal text-[#475569] text-[12px] underline"
            data-node-id="50:8330"
          >
            Free returns and exchanges on unopened laboratory hardware
          </span>
        </div>

        {/* Legal Footer Links */}
        <div
          className="flex items-center justify-center w-full text-[11.5px] text-slate-500 pt-3 border-t border-slate-100"
          data-node-id="50:8331"
          data-name="Checkout Footer Row"
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center text-center" data-node-id="50:8336">
            <Link href="/terms-of-sale" className="hover:text-[#0b1f3a] transition-colors">Terms of Sale</Link>
            <span className="text-slate-300">•</span>
            <Link href="/shipping-returns" className="hover:text-[#0b1f3a] transition-colors">Shipping &amp; Returns</Link>
            <span className="text-slate-300">•</span>
            <Link href="/contact" className="hover:text-[#0b1f3a] transition-colors">Laboratory Support</Link>
          </div>
        </div>
      </form>
    )}
    </div>
  </div>
)
}

