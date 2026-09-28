"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/CartContext"
import { useCustomer } from "@/context/CustomerContext"
import { prepareStripeCheckout, type CheckoutSession } from "@/lib/stripe-checkout"
import { COUNTRIES, getCountryByName } from "@/lib/countries"
import { EmbeddedStripeCheckout } from "@/components/checkout/EmbeddedStripeCheckout"

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, country, setCountry, removeItem } = useCart()
  const {
    customer,
    token,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
  } = useCustomer()

  // Checkout states
  const [ruo, setRuo] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [embeddedSession, setEmbeddedSession] = useState<CheckoutSession | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)

  // Auth Portal States (Inline Sign In / Register)
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
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
  const [regAgreeCompliance, setRegAgreeCompliance] = useState(false)

  // Selected Address State (Auto-filled from customer)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const [customAddress, setCustomAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    phone: "",
  })
  const [useCustomAddress, setUseCustomAddress] = useState(false)

  // Auto-fill address from customer profile when customer loads
  useEffect(() => {
    if (customer) {
      if (customer.addresses && customer.addresses.length > 0) {
        const defaultAddr = customer.addresses[0]
        setCustomAddress({
          first_name: defaultAddr.first_name || customer.first_name || "",
          last_name: defaultAddr.last_name || customer.last_name || "",
          address_1: defaultAddr.address_1 || "",
          address_2: defaultAddr.address_2 || "",
          city: defaultAddr.city || "",
          postal_code: defaultAddr.postal_code || "",
          province: defaultAddr.province || "",
          phone: defaultAddr.phone || customer.phone || "",
        })
      } else {
        setCustomAddress({
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          address_1: "",
          address_2: "",
          city: "",
          postal_code: "",
          province: "",
          phone: customer.phone || "",
        })
      }
    }
  }, [customer])

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

  const hasSubscription = items.some((i) => i.isSubscription)
  const money = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

  // Inline Sign-In Handler
  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    if (lockedUntil && Date.now() < lockedUntil) {
      setAuthError(`Security pause active. Please wait ${lockCountdown}s before attempting again.`)
      return
    }

    const cleanEmail = loginEmail.trim().toLowerCase()
    if (!cleanEmail || !loginPassword) {
      setAuthError("Please enter your email and password.")
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
        setLockedUntil(Date.now() + 60000)
        setLockCountdown(60)
        setAuthError("Security threshold reached (5 failed attempts). Account access paused for 60s.")
      } else {
        setAuthError(err.message || "Invalid credentials. Please verify and try again.")
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  // Inline Registration Handler
  async function handleInlineRegister(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)

    const cleanEmail = regEmail.trim().toLowerCase()
    if (!cleanEmail || !regFirstName.trim() || !regLastName.trim() || !regCompany.trim()) {
      setAuthError("All required researcher fields (*) must be completed.")
      return
    }

    if (regPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.")
      return
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.")
      return
    }

    if (!regAgreeCompliance) {
      setAuthError("You must certify that you are 18+ and orders are for In-Vitro Laboratory Research Use Only (RUO).")
      return
    }

    setAuthSubmitting(true)
    try {
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
          compliance_ack: true,
        },
      })
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.")
    } finally {
      setAuthSubmitting(false)
    }
  }

  // Start Stripe Checkout Process
  async function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault()
    if (busy || !token || !customer) return
    setBusy(true)
    setError("")

    try {
      const countryCode = getCountryByName(country).code.toLowerCase()
      const resolvedAddress =
        customer.addresses && customer.addresses.length > 0 && !useCustomAddress
          ? {
              first_name: customer.addresses[selectedAddressIndex]?.first_name || customer.first_name || "",
              last_name: customer.addresses[selectedAddressIndex]?.last_name || customer.last_name || "",
              address_1: customer.addresses[selectedAddressIndex]?.address_1 || "",
              address_2: customer.addresses[selectedAddressIndex]?.address_2 || undefined,
              city: customer.addresses[selectedAddressIndex]?.city || "",
              postal_code: customer.addresses[selectedAddressIndex]?.postal_code || "",
              country_code: customer.addresses[selectedAddressIndex]?.country_code || countryCode,
              province: customer.addresses[selectedAddressIndex]?.province || undefined,
              phone: customer.addresses[selectedAddressIndex]?.phone || customer.phone || undefined,
            }
          : {
              first_name: customAddress.first_name || customer.first_name || "",
              last_name: customAddress.last_name || customer.last_name || "",
              address_1: customAddress.address_1,
              address_2: customAddress.address_2 || undefined,
              city: customAddress.city,
              postal_code: customAddress.postal_code,
              country_code: countryCode,
              province: customAddress.province || undefined,
              phone: customAddress.phone || customer.phone || undefined,
            }

      const session = await prepareStripeCheckout({
        items,
        token,
        email: customer.email,
        countryCode,
        address: resolvedAddress.address_1 ? resolvedAddress : undefined,
        ruoAccepted: ruo,
        recurringAccepted: recurring,
        paymentMethod: "stripe",
        uiMode: "embedded",
      })

      if (session.clientSecret) {
        setEmbeddedSession(session)
        setBusy(false)
      } else if (session.checkoutUrl) {
        window.location.assign(session.checkoutUrl)
      } else if (["processing", "paid", "confirmed", "held"].includes(session.state)) {
        window.location.assign(`/checkout/success?attempt_id=${encodeURIComponent(session.attemptId)}`)
      } else {
        throw new Error("This checkout session could not be opened. Please refresh and retry.")
      }
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Checkout could not open. Please retry.")
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-slate-100 flex flex-col lg:flex-row">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Dark Navy Summary & Cart Items (#0B1F3A)                     */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[48%] min-h-screen bg-[#0B1F3A] p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="tracking-widest font-extrabold text-lg text-white">PEPTECH®</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#16A6A3]/20 text-[#00C5A0] border border-[#16A6A3]/30">
              Laboratory Research Checkout
            </span>
          </div>

          {/* Total Due Big Display */}
          <div className="pt-2">
            <p className="text-sm font-medium text-slate-400">Total due today</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
              {money(subtotal + shippingCost)}
            </h2>
          </div>

          {/* Itemized Cart List */}
          {!items.length ? (
            <div className="py-8 text-center text-slate-400">
              <p>Your research basket is empty.</p>
              <Link href="/shop" className="inline-block mt-3 text-sm text-[#00C5A0] underline">
                Browse catalogue
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/80 my-2">
              {items.map((item) => (
                <li key={`${item.id}:${item.isSubscription}`} className="py-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-800/60 border border-slate-700/60 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    <img
                      src={item.image || "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                      <p className="font-bold text-white text-sm whitespace-nowrap">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.isSubscription
                        ? "Every 28 days · 10% auto-savings"
                        : "Medical Applicator + Cartridge + Sterile Needles"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>Qty: {item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.isSubscription)}
                        className="text-slate-500 hover:text-rose-400 transition-colors underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Promo / Coupon Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Add promo or coupon code"
              className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#16A6A3]"
            />
            <button
              type="button"
              onClick={() => {
                if (couponCode.trim()) {
                  setCouponApplied(true)
                  setTimeout(() => setCouponApplied(false), 3000)
                }
              }}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 text-xs font-semibold tracking-wide border border-slate-700 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
          {couponApplied && (
            <p className="text-xs text-[#00C5A0]">Institutional promo code applied to order verification.</p>
          )}

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Royal Mail Tracked 24 (Domestic UK)</span>
              <span className="font-semibold text-white">
                {shippingCost === 0 ? "FREE" : money(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs items-center">
              <span>Tax ⓘ</span>
              <span>Included (UK VAT Exempt for RUO)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800/80">
              <span>Total due today</span>
              <span className="text-xl text-[#00C5A0]">{money(subtotal + shippingCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: White Background (#FFFFFF) & Inline Auth / Stripe Checkout  */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[52%] min-h-screen bg-white text-[#0B1F3A] p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full">
          {/* If Embedded Checkout is Active */}
          {embeddedSession?.clientSecret ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#0B1F3A]">
                    {customer?.first_name} {customer?.last_name} · {customer?.email}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Delivery: {country} · Royal Mail Tracked
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmbeddedSession(null)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Edit details
                </button>
              </div>
              <EmbeddedStripeCheckout
                clientSecret={embeddedSession.clientSecret}
                publishableKey={embeddedSession.publishableKey}
                onClose={() => setEmbeddedSession(null)}
              />
            </div>
          ) : isAuthLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#16A6A3] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Verifying researcher session...</p>
            </div>
          ) : !isAuthenticated || !customer ? (
            /* ===================================================================== */
            /* STATE A: UNAUTHENTICATED INLINE AUTH PORTAL                           */
            /* ===================================================================== */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
                  Researcher Authentication Required
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Per UK &amp; international laboratory peptide regulations, all orders must be associated with an
                  authenticated institutional researcher or authorized laboratory account. Guest checkout is disabled.
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin")
                    setAuthError(null)
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === "signin"
                      ? "bg-white text-[#0B1F3A] shadow-xs"
                      : "text-slate-600 hover:text-[#0B1F3A]"
                  }`}
                >
                  Sign In to Existing Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register")
                    setAuthError(null)
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === "register"
                      ? "bg-white text-[#0B1F3A] shadow-xs"
                      : "text-slate-600 hover:text-[#0B1F3A]"
                  }`}
                >
                  Register Verified Researcher
                </button>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs sm:text-sm text-rose-700 flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{authError}</span>
                </div>
              )}

              {/* Form 1: Inline Sign In */}
              {authMode === "signin" ? (
                <form onSubmit={handleInlineLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B1F3A]">Institutional Researcher Email</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="researcher@biotech-institute.org"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#0B1F3A] focus:border-[#16A6A3] focus:ring-1 focus:ring-[#16A6A3] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B1F3A]">Account Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#0B1F3A] focus:border-[#16A6A3] focus:ring-1 focus:ring-[#16A6A3] outline-none"
                    />
                  </div>

                  {lockedUntil && Date.now() < lockedUntil && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
                      Security cooldown: Access paused for {lockCountdown}s
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authSubmitting || (!!lockedUntil && Date.now() < lockedUntil)}
                    className="mt-2 w-full rounded-xl bg-[#0B1F3A] hover:bg-[#162A45] text-white p-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {authSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In &amp; Proceed to Checkout →</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Form 2: Inline Registration */
                <form onSubmit={handleInlineRegister} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#0B1F3A]">Title</label>
                      <select
                        value={regTitle}
                        onChange={(e) => setRegTitle(e.target.value)}
                        className="border border-slate-300 rounded-lg px-2.5 py-2.5 text-xs text-[#0B1F3A] bg-white outline-none"
                      >
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Ph.D.">Ph.D.</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#0B1F3A]">First Name *</label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Alexander"
                        className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#0B1F3A]">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Wright"
                        className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#0B1F3A]">Institution / Facility Name *</label>
                    <input
                      type="text"
                      required
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="e.g. Cambridge Biomedical Research Centre"
                      className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#0B1F3A]">Institutional Email *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="alexander.wright@cambridge-biotech.ac.uk"
                      className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#0B1F3A]">
                      Direct Phone / Lab Ext. <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+44 1223 928 401"
                      className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#0B1F3A]">Password *</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 chars"
                        className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#0B1F3A]">Confirm *</label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className="border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={regAgreeCompliance}
                      onChange={(e) => setRegAgreeCompliance(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#16A6A3] focus:ring-[#16A6A3]"
                    />
                    <span>
                      I certify that I am at least 18 years old and represent an accredited laboratory or scientific
                      facility. All purchases are strictly for{" "}
                      <strong className="text-[#0B1F3A]">In-Vitro Laboratory Research Use Only (RUO)</strong>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={authSubmitting || !regAgreeCompliance}
                    className="mt-2 w-full rounded-xl bg-[#0B1F3A] hover:bg-[#162A45] text-white p-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {authSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account &amp; Proceed to Checkout →</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ===================================================================== */
            /* STATE B: AUTHENTICATED CHECKOUT (AUTO-FILLED FIELDS & STRIPE MOUNT)   */
            /* ===================================================================== */
            <form onSubmit={handleProceedToPayment} className="flex flex-col gap-5 animate-in fade-in duration-200">
              {/* Authenticated Researcher Badge */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Signed in researcher</p>
                  <p className="text-sm font-bold text-[#0B1F3A]">
                    {customer.metadata?.title ? `${customer.metadata.title} ` : ""}
                    {customer.first_name} {customer.last_name}
                    {customer.company_name ? ` · ${customer.company_name}` : ""}
                  </p>
                  <p className="text-xs text-slate-600">{customer.email}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-slate-600 hover:text-[#0B1F3A] underline cursor-pointer"
                >
                  Switch
                </button>
              </div>

              {/* Delivery Country Selection */}
              <label className="block text-xs font-bold text-[#0B1F3A]">
                Delivery Destination Country
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={busy}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm text-[#0B1F3A] bg-white outline-none focus:border-[#16A6A3]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Auto-filled Delivery Address Details */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F3A]">Laboratory Delivery Address</span>
                  <span className="text-[11px] text-[#00C5A0] font-semibold">● Auto-filled from Profile</span>
                </div>

                {customer.addresses && customer.addresses.length > 0 && !useCustomAddress ? (
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-[#0B1F3A]">
                      {customer.addresses[selectedAddressIndex]?.first_name}{" "}
                      {customer.addresses[selectedAddressIndex]?.last_name}
                    </p>
                    <p>{customer.addresses[selectedAddressIndex]?.address_1}</p>
                    {customer.addresses[selectedAddressIndex]?.address_2 && (
                      <p>{customer.addresses[selectedAddressIndex]?.address_2}</p>
                    )}
                    <p>
                      {customer.addresses[selectedAddressIndex]?.city},{" "}
                      {customer.addresses[selectedAddressIndex]?.postal_code}
                    </p>
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(true)}
                      className="text-xs text-[#16A6A3] underline pt-1 cursor-pointer"
                    >
                      Use different address for this order
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <input
                      type="text"
                      placeholder="Street Address (Line 1)"
                      value={customAddress.address_1}
                      onChange={(e) => setCustomAddress({ ...customAddress, address_1: e.target.value })}
                      required
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-[#0B1F3A] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Suite / Lab Wing (Line 2)"
                      value={customAddress.address_2}
                      onChange={(e) => setCustomAddress({ ...customAddress, address_2: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-[#0B1F3A] outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        required
                        className="border border-slate-300 rounded-lg p-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={customAddress.postal_code}
                        onChange={(e) => setCustomAddress({ ...customAddress, postal_code: e.target.value })}
                        required
                        className="border border-slate-300 rounded-lg p-2.5 text-xs text-[#0B1F3A] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 28-day Subscription Consent Checkbox */}
              {hasSubscription && (
                <label className="flex gap-3 text-xs text-slate-700 bg-teal-50/60 border border-teal-200/80 p-3.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#16A6A3] focus:ring-[#16A6A3]"
                  />
                  <span className="leading-snug">
                    I authorise payment today and every 28 days for recurring items, with 10% off product prices plus
                    delivery and applicable tax. I can pause, skip or cancel future renewals at any time in my account.
                  </span>
                </label>
              )}

              {/* RUO Conditions Checkbox */}
              <label className="flex gap-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={ruo}
                  onChange={(e) => setRuo(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#16A6A3] focus:ring-[#16A6A3]"
                />
                <span className="leading-snug">
                  I agree to the{" "}
                  <Link href="/terms-of-sale" className="underline font-medium text-[#0B1F3A]">
                    Terms of Sale
                  </Link>
                  ,{" "}
                  <Link href="/privacy-policy" className="underline font-medium text-[#0B1F3A]">
                    Privacy Policy
                  </Link>{" "}
                  and strictly In-Vitro Laboratory Research Use Only conditions.
                </span>
              </label>

              {/* Error Message */}
              {error && <p role="alert" className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

              {/* Submit CTA Button */}
              <button
                disabled={busy || !ruo || (hasSubscription && !recurring)}
                type="submit"
                className="w-full rounded-xl bg-[#0B1F3A] hover:bg-[#162A45] p-4 font-bold text-sm text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading Stripe Secure Payment Form…</span>
                  </>
                ) : (
                  <span>Continue to Stripe Checkout →</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Payment fields will automatically pre-populate with your verified researcher details.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
