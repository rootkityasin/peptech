"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { VisaBadge, MastercardBadge } from "@/components/ui/PaymentBadges"
import { useCustomer } from "@/context/CustomerContext"

type AccountTab = "overview" | "orders" | "subscriptions" | "addresses" | "payment"

function AccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") as AccountTab | null
  const [activeTab, setActiveTab] = useState<AccountTab>(tabParam || "overview")

  const {
    customer,
    isAuthenticated,
    isLoading,
    login,
    loginAsDemo,
    register,
    logout,
    updateProfile,
    addAddress,
    deleteAddress,
  } = useCustomer()

  // Auth Portal States
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSubmitting, setAuthSubmitting] = useState(false)

  // Registration Form States
  const [regTitle, setRegTitle] = useState("Dr.")
  const [regFirstName, setRegFirstName] = useState("")
  const [regLastName, setRegLastName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regCompany, setRegCompany] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")

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
    setAuthSubmitting(true)
    try {
      await login(loginEmail, loginPassword)
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in.")
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setAuthError(null)
    setAuthSubmitting(true)
    try {
      await loginAsDemo()
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in as demo researcher.")
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSubmitting(true)
    try {
      await register({
        email: regEmail,
        password: regPassword,
        first_name: regFirstName,
        last_name: regLastName,
        company_name: regCompany,
        phone: regPhone,
        metadata: {
          title: regTitle,
          role: "Verified Clinical Researcher",
        },
      })
    } catch (err: any) {
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
          <div className="flex flex-col gap-1.5 text-center">
            <div className="inline-flex items-center justify-center gap-2 self-center px-3 py-1 bg-[#f1f5f9] rounded-full text-[11px] font-semibold text-[#0b1f3a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a6a3] animate-pulse" />
              PEPTECH® RESEARCH PORTAL
            </div>
            <h1 className="text-[22px] font-bold text-[#0b1f3a] tracking-tight mt-1">
              Researcher Portal Access
            </h1>
            <p className="text-[12.5px] text-[#64748b] leading-relaxed">
              Access active cold-chain orders, manage automated 28-day refill protocols, and download certified batch COA certificates.
            </p>
          </div>

          {/* 1-Tap Quick Demo Access Box */}
          <div className="bg-[#e6fffa] border border-[#16a6a3]/30 rounded-[12px] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide uppercase text-[#16a6a3]">
                Instant Demo Access
              </span>
              <span className="text-[11.5px] text-[#0b1f3a] font-semibold">Dr. Alexander Wright</span>
            </div>
            <p className="text-[12px] text-[#64748b]">
              Cambridge Biomedical Research Hub · Pre-configured with active semaglutide refill protocol &amp; batch COA certificates.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={authSubmitting}
              className="btn-press mt-1 w-full bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13px] font-semibold py-2.5 rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {authSubmitting ? (
                <span>Authenticating with Medusa 2.0...</span>
              ) : (
                <span>1-Tap Sign In as Dr. Alexander Wright →</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11.5px] text-slate-400 font-medium whitespace-nowrap">
              or enter research credentials
            </span>
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

          {/* Error Message */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 rounded-[8px] p-3 text-[12.5px] text-rose-700">
              {authError}
            </div>
          )}

          {/* Sign In Form */}
          {authMode === "signin" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-[#0b1f3a]">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. researcher@cambridge-biotech.ac.uk"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3] outline-hidden placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-semibold text-[#0b1f3a]">
                    Password
                  </label>
                  <span className="text-[11.5px] text-[#64748b]">Min. 8 characters</span>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3] outline-hidden placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="btn-press mt-2 w-full bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13.5px] font-semibold py-2.5 rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {authSubmitting ? "Verifying..." : "Sign In to Research Account"}
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
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">First Name</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Jane"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Smith"
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Institution / Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Oxford Genomics Laboratory"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="j.smith@oxford-genomics.ac.uk"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">
                  Direct Phone / Lab Extension
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+44 1865 270 000"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#0b1f3a]">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="btn-press mt-2 w-full bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[13.5px] font-semibold py-2.5 rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {authSubmitting ? "Creating Account..." : "Create Verified Research Account"}
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
              <div className="relative shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-slate-100 shadow-2xs">
                <img
                  alt={`${customer.first_name || ""} ${customer.last_name || ""}`}
                  className="w-full h-full object-cover"
                  src={customer.metadata?.avatar_url || "/images/figma/d7ba35eef589d74712ad429f3bd1612dfa66c973.png"}
                />
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-[#0b1f3a] text-[20px] sm:text-[22px] tracking-tight">
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
                  {customer.metadata?.role || "Verified Clinical Researcher"} · Member since {customer.metadata?.member_since || "Sep 2025"} · Customer ID: {customer.metadata?.customer_id_code || customer.id}
                  {customer.company_name ? ` · ${customer.company_name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-[#f1f5f9] flex items-center px-[12px] py-[8px] rounded-[8px]">
                <p className="font-medium text-[#0b1f3a] text-[12.5px] whitespace-nowrap">
                  Next Dispatch: <span className="font-bold text-[#16a6a3]">14 Oct 2026</span>
                </p>
              </div>
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
          <div className="flex gap-[24px] sm:gap-[32px] items-center overflow-x-auto no-scrollbar w-full border-b border-transparent">
            {/* Dashboard Overview */}
            <button
              type="button"
              onClick={() => handleTabChange("overview")}
              className={`flex items-center pb-[14px] cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === "overview"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] font-medium text-[14px]"
              }`}
            >
              Dashboard Overview
            </button>

            {/* Orders & Tracking */}
            <button
              type="button"
              onClick={() => handleTabChange("orders")}
              className={`flex items-center gap-[6px] pb-[14px] cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === "orders"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] font-medium text-[14px]"
              }`}
            >
              <span>Orders &amp; Tracking</span>
              <span
                className={`flex items-center justify-center px-[6px] py-[2px] rounded-[10px] text-[10px] font-bold leading-none ${
                  activeTab === "orders" ? "bg-[#0b1f3a] text-white" : "bg-[#e2e8f0] text-[#64748b]"
                }`}
              >
                1
              </span>
            </button>

            {/* Active Subscriptions */}
            <button
              type="button"
              onClick={() => handleTabChange("subscriptions")}
              className={`flex items-center gap-[6px] pb-[14px] cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === "subscriptions"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] font-medium text-[14px]"
              }`}
            >
              <span>Active Subscriptions</span>
              <span
                className={`flex items-center justify-center px-[6px] py-[2px] rounded-[10px] text-[10px] font-bold leading-none ${
                  activeTab === "subscriptions" ? "bg-[#0b1f3a] text-white" : "bg-[#e2e8f0] text-[#64748b]"
                }`}
              >
                1
              </span>
            </button>

            {/* Saved Addresses */}
            <button
              type="button"
              onClick={() => handleTabChange("addresses")}
              className={`flex items-center pb-[14px] cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === "addresses"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] font-medium text-[14px]"
              }`}
            >
              Saved Addresses
            </button>

            {/* Payment Methods */}
            <button
              type="button"
              onClick={() => handleTabChange("payment")}
              className={`flex items-center pb-[14px] cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === "payment"
                  ? "border-[#0b1f3a] text-[#0b1f3a] font-bold text-[14px]"
                  : "border-transparent text-[#64748b] hover:text-[#0b1f3a] font-medium text-[14px]"
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
              {/* Card 1: Latest Order #PEP-89241 */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[20px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[3px]">
                    <p className="font-bold text-[#0b1f3a] text-[17px]">
                      Latest Order #PEP-89241
                    </p>
                    <p className="font-normal text-[#64748b] text-[12.5px]">
                      Placed Today, 18:34 GMT · 3 Line Items · Royal Mail Tracked 24
                    </p>
                  </div>
                  <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                    <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                      Cold-Chain Packing
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

                  {/* Step 2 (Active) */}
                  <div className="flex gap-[8px] items-center shrink-0">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#0b1f3a] text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-[#0b1f3a]/10">
                      2
                    </div>
                    <span className="font-bold text-[#0b1f3a] text-[12px] whitespace-nowrap">
                      Cold-Chain Packing
                    </span>
                  </div>
                  <div className="flex-1 h-[2px] min-w-[20px] bg-[#e2e8f0] rounded-full" />

                  {/* Step 3 */}
                  <div className="flex gap-[8px] items-center shrink-0">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold text-[11px]">
                      3
                    </div>
                    <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                      Dispatched (Tracked 24)
                    </span>
                  </div>
                  <div className="flex-1 h-[2px] min-w-[20px] bg-[#e2e8f0] rounded-full" />

                  {/* Step 4 */}
                  <div className="flex gap-[8px] items-center shrink-0">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold text-[11px]">
                      4
                    </div>
                    <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                      Delivered
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9] w-full" />

                {/* Ordered Items List */}
                <div className="flex flex-col gap-[14px]">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-[14px] items-center">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src="/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"
                        />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                          Semaglutide Starter Kit (5mg)
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px]">
                          1x Pen + 28-Day Cartridge Included · Free Micro-Needles
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1f3a] text-[14px]">£129.00</p>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-[14px] items-center">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                        />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                          Tirzepatide Cartridge Refill (10mg)
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px]">
                          1x Multi-Dose Cartridge · Batch #TRZ-2026-08B
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1f3a] text-[14px]">£95.00</p>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-[14px] items-center">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src="/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png"
                        />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                          BPC-157 Research Grade (5mg)
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px]">
                          1x Reconstituted Lyophilized Vial · 99.91% Purity
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1f3a] text-[14px]">£44.50</p>
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9] w-full" />

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex gap-[8px] items-center text-[13px]">
                    <span className="text-[#64748b]">Total Paid:</span>
                    <span className="font-bold text-[#0b1f3a] text-[16px]">£278.50</span>
                    <span className="text-[#94a3b8] text-[12.5px]">(Visa •••• 1234)</span>
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
                      href="/checkout/success"
                      className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors"
                    >
                      View Receipt Slip
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2: Active Refill Protocol */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[18px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[3px]">
                    <p className="font-bold text-[#0b1f3a] text-[17px]">
                      Active Refill Protocol · 28-Day Automated Cycle
                    </p>
                    <p className="font-normal text-[#64748b] text-[12.5px]">
                      Ensures uninterrupted cold-chain peptide supply with 15% subscriber savings
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
                        src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                      />
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-bold text-[#0b1f3a] text-[14px]">
                        Semaglutide 5mg 28-Day Refill Cartridge
                      </p>
                      <p className="font-normal text-[#64748b] text-[12px]">
                        Next auto-billing &amp; dispatch: 14 October 2026 · Protocol: 0.25mg / week
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[15px] whitespace-nowrap">
                    £110.00 / cycle
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
                    onClick={() => alert("Upcoming 14 Oct cycle skipped. Next cycle set to 11 Nov.")}
                    className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Skip Next Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("subscriptions")}
                    className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Update Dosage Protocol
                  </button>
                </div>
              </div>

              {/* Card 3: Digital COA Vault */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[18px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[17px]">
                    Digital Certificate of Analysis (COA) Vault
                  </p>
                  <p className="font-medium text-[#64748b] text-[12.5px]">
                    3 Verified Batch Certificates
                  </p>
                </div>

                <div className="flex flex-col gap-[10px]">
                  {/* COA 1 */}
                  <div className="bg-[#f8fafc] rounded-[8px] px-[14px] py-[10px] flex items-center justify-between">
                    <div className="flex gap-[12px] items-center flex-wrap">
                      <span className="font-bold text-[#0b1f3a] text-[13px]">
                        Batch #SMG-2026-09A
                      </span>
                      <span className="font-medium text-[#0f172a] text-[13px]">
                        Semaglutide 5mg
                      </span>
                      <span className="bg-[#e6fffa] text-[#16a6a3] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                        99.82% HPLC
                      </span>
                    </div>
                    <Link
                      href="/lab-reports"
                      className="bg-white border border-slate-200 hover:border-slate-300 text-[#0b1f3a] font-semibold text-[11.5px] px-[10px] py-[5px] rounded-[6px] transition-colors"
                    >
                      Download PDF ↓
                    </Link>
                  </div>

                  {/* COA 2 */}
                  <div className="bg-[#f8fafc] rounded-[8px] px-[14px] py-[10px] flex items-center justify-between">
                    <div className="flex gap-[12px] items-center flex-wrap">
                      <span className="font-bold text-[#0b1f3a] text-[13px]">
                        Batch #TRZ-2026-08B
                      </span>
                      <span className="font-medium text-[#0f172a] text-[13px]">
                        Tirzepatide 10mg
                      </span>
                      <span className="bg-[#e6fffa] text-[#16a6a3] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                        99.64% HPLC
                      </span>
                    </div>
                    <Link
                      href="/lab-reports"
                      className="bg-white border border-slate-200 hover:border-slate-300 text-[#0b1f3a] font-semibold text-[11.5px] px-[10px] py-[5px] rounded-[6px] transition-colors"
                    >
                      Download PDF ↓
                    </Link>
                  </div>

                  {/* COA 3 */}
                  <div className="bg-[#f8fafc] rounded-[8px] px-[14px] py-[10px] flex items-center justify-between">
                    <div className="flex gap-[12px] items-center flex-wrap">
                      <span className="font-bold text-[#0b1f3a] text-[13px]">
                        Batch #BPC-2026-07F
                      </span>
                      <span className="font-medium text-[#0f172a] text-[13px]">
                        BPC-157 5mg
                      </span>
                      <span className="bg-[#e6fffa] text-[#16a6a3] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                        99.91% HPLC
                      </span>
                    </div>
                    <Link
                      href="/lab-reports"
                      className="bg-white border border-slate-200 hover:border-slate-300 text-[#0b1f3a] font-semibold text-[11.5px] px-[10px] py-[5px] rounded-[6px] transition-colors"
                    >
                      Download PDF ↓
                    </Link>
                  </div>
                </div>
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
                {customer.addresses && customer.addresses.length > 0 ? (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {customer.addresses[0].first_name} {customer.addresses[0].last_name}
                    </p>
                    {customer.addresses[0].company && <p>{customer.addresses[0].company}</p>}
                    <p>{customer.addresses[0].address_1}</p>
                    {customer.addresses[0].address_2 && <p>{customer.addresses[0].address_2}</p>}
                    <p>{customer.addresses[0].city}, {customer.addresses[0].postal_code}</p>
                    <p>{customer.addresses[0].country_code?.toUpperCase() === "GB" ? "United Kingdom" : customer.addresses[0].country_code?.toUpperCase()}</p>
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
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#16a6a3] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                    ACTIVE
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-[8px] py-1">
                    <VisaBadge className="w-[32px] h-[20px]" monochrome />
                    <p className="font-semibold text-[#0f172a] text-[13.5px]">
                      Visa ending in ...1234
                    </p>
                  </div>
                  <p className="font-normal text-[#64748b] text-[12px]">
                    Expires: 08/2028 · Verified 3D Secure
                  </p>
                </div>
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
                <div className="flex gap-[8px] items-center">
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("all")}
                    className={`h-[36px] px-[16px] rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                      ordersFilter === "all"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    All Orders (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("transit")}
                    className={`h-[36px] px-[16px] rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                      ordersFilter === "transit"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    In Transit (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter("delivered")}
                    className={`h-[36px] px-[16px] rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                      ordersFilter === "delivered"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    Delivered (2)
                  </button>
                </div>

                <div className="flex gap-[8px] items-center">
                  <div className="bg-white border border-[#e2e8f0] flex gap-[8px] h-[36px] items-center px-[14px] rounded-[8px] w-full sm:w-[250px] shadow-2xs">
                    <img
                      alt=""
                      className="w-[14px] h-[14px] opacity-60"
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
                    className="bg-[#0b1f3a] hover:bg-[#162a45] text-white font-semibold text-[12.5px] px-[18px] h-[36px] rounded-[8px] transition-colors cursor-pointer"
                  >
                    Track
                  </button>
                </div>
              </div>

              {/* Order Card 1: #PEP-89241 (In Transit / Packing) */}
              {(ordersFilter === "all" || ordersFilter === "transit") && (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[20px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-bold text-[#0b1f3a] text-[17px]">
                        Order #PEP-89241
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px]">
                        Placed Today, 16 Sep 2026, 18:34 GMT · Tracking: GB-RM24-89241-CLD
                      </p>
                    </div>
                    <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                      <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                        Cold-Chain Packing
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
                      <div className="w-[22px] h-[22px] rounded-full bg-[#0b1f3a] text-white flex items-center justify-center font-bold text-[11px]">
                        2
                      </div>
                      <span className="font-bold text-[#0b1f3a] text-[12px] whitespace-nowrap">
                        Cold-Chain Packing
                      </span>
                    </div>
                    <div className="flex-1 h-[2px] min-w-[20px] bg-[#e2e8f0] rounded-full" />
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold text-[11px]">
                        3
                      </div>
                      <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                        Dispatched (Tracked 24)
                      </span>
                    </div>
                    <div className="flex-1 h-[2px] min-w-[20px] bg-[#e2e8f0] rounded-full" />
                    <div className="flex gap-[8px] items-center shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] text-white flex items-center justify-center font-bold text-[11px]">
                        4
                      </div>
                      <span className="font-medium text-[#94a3b8] text-[12px] whitespace-nowrap">
                        Delivered
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-[14px] items-center">
                        <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                          <img
                            alt=""
                            className="w-full h-full object-contain"
                            src="/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"
                          />
                        </div>
                        <div className="flex flex-col gap-[3px]">
                          <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                            Semaglutide Starter Kit (5mg)
                          </p>
                          <p className="font-normal text-[#64748b] text-[12px]">
                            1x Pen + 28-Day Cartridge Included · Free Micro-Needles
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-[#0b1f3a] text-[14px]">£129.00</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-[14px] items-center">
                        <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                          <img
                            alt=""
                            className="w-full h-full object-contain"
                            src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                          />
                        </div>
                        <div className="flex flex-col gap-[3px]">
                          <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                            Tirzepatide Cartridge Refill (10mg)
                          </p>
                          <p className="font-normal text-[#64748b] text-[12px]">
                            1x Multi-Dose Cartridge · Batch #TRZ-2026-08B
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-[#0b1f3a] text-[14px]">£95.00</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-[14px] items-center">
                        <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                          <img
                            alt=""
                            className="w-full h-full object-contain"
                            src="/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png"
                          />
                        </div>
                        <div className="flex flex-col gap-[3px]">
                          <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                            BPC-157 Research Grade (5mg)
                          </p>
                          <p className="font-normal text-[#64748b] text-[12px]">
                            1x Reconstituted Lyophilized Vial · 99.91% Purity
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-[#0b1f3a] text-[14px]">£44.50</p>
                    </div>
                  </div>

                  <div className="h-px bg-[#f1f5f9] w-full" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">
                      Total Paid: £278.50 (Visa ...1234)
                    </p>
                    <div className="flex gap-[10px] items-center">
                      <button
                        type="button"
                        onClick={() => alert("Tracking GB-RM24-89241-CLD: Departs Cambridge Hub at 22:00 GMT.")}
                        className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                      >
                        Track Live Dispatch →
                      </button>
                      <Link
                        href="/checkout/success"
                        className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors"
                      >
                        View Receipt Slip
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Card 2: #PEP-77412 (Delivered) */}
              {(ordersFilter === "all" || ordersFilter === "delivered") && (
                <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[24px] shadow-xs border border-slate-100 flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-bold text-[#0b1f3a] text-[16px]">
                        Order #PEP-77412
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px]">
                        Delivered 16 Aug 2026 · Royal Mail Tracked 24 (Signed: A. Wright)
                      </p>
                    </div>
                    <div className="bg-[#f8fafc] border border-slate-200 px-[12px] py-[6px] rounded-[20px]">
                      <p className="font-semibold text-[#64748b] text-[12px] whitespace-nowrap">
                        ✓ Delivered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-[14px] items-center">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-contain"
                          src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                        />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        <p className="font-semibold text-[#0b1f3a] text-[13.5px]">
                          Semaglutide 5mg 28-Day Refill Cartridge
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px]">
                          1x Cartridge · Batch #SMG-2026-07D
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#0b1f3a] text-[14px]">£110.00</p>
                  </div>

                  <div className="h-px bg-[#f1f5f9] w-full" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="font-bold text-[#0b1f3a] text-[14px]">
                      Total Paid: £110.00 (Visa ...1234)
                    </p>
                    <div className="flex gap-[10px] items-center">
                      <Link
                        href="/refills"
                        className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors"
                      >
                        Reorder Cartridge ↻
                      </Link>
                      <button
                        type="button"
                        onClick={() => alert("Downloading official VAT receipt for #PEP-77412...")}
                        className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
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
                    <p className="font-bold text-[#0b1f3a] text-[15px]">3 Orders</p>
                    <p className="text-[#64748b] text-[11px]">Total Orders</p>
                  </div>
                  <div className="bg-[#f8fafc] p-[10px] rounded-[8px]">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">£537.50</p>
                    <p className="text-[#64748b] text-[11px]">Total Spend</p>
                  </div>
                  <div className="bg-[#f8fafc] p-[10px] rounded-[8px]">
                    <p className="font-bold text-[#0b1f3a] text-[15px]">5 Files</p>
                    <p className="text-[#64748b] text-[11px]">COA Reports</p>
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9] w-full" />

                <div className="flex flex-col gap-[10px] text-[13px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0b1f3a]">#PEP-89241</p>
                      <p className="text-[#64748b] text-[11.5px]">16 Sep 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0b1f3a]">£278.50</p>
                      <p className="text-[#16a6a3] text-[11px] font-medium">Packing (Cold-Chain)</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0b1f3a]">#PEP-77412</p>
                      <p className="text-[#64748b] text-[11.5px]">14 Aug 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0b1f3a]">£110.00</p>
                      <p className="text-[#94a3b8] text-[11px] font-medium">Delivered</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0b1f3a]">#PEP-64109</p>
                      <p className="text-[#64748b] text-[11.5px]">10 Jul 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0b1f3a]">£149.00</p>
                      <p className="text-[#94a3b8] text-[11px] font-medium">Delivered</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Exporting 2026 Statement...")}
                  className="font-semibold text-[#0b1f3a] hover:text-[#16a6a3] text-[12.5px] text-left transition-colors pt-1 cursor-pointer"
                >
                  Download 2026 Annual Statement (PDF) ↓
                </button>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">Delivery Address</p>
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#64748b] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                    DEFAULT
                  </span>
                </div>
                <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                  <p className="font-semibold text-[#0b1f3a]">Dr. Alexander Wright</p>
                  <p>Dept. of Molecular Pharmacology</p>
                  <p>Cambridge Science Park, Milton Rd</p>
                  <p>Cambridge, CB4 0GZ</p>
                  <p>United Kingdom</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ACTIVE SUBSCRIPTIONS (Node 52:9548 & 52:11602) */}
        {/* ========================================================= */}
        {activeTab === "subscriptions" && (
          <div className="flex flex-col lg:flex-row gap-[32px] items-start w-full">
            {/* Left Main Column */}
            <div className="flex flex-col gap-[24px] w-full lg:flex-1">
              {/* Filter Pills & Add CTA */}
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-[8px] items-center">
                  <button
                    type="button"
                    onClick={() => setSubFilter("active")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                      subFilter === "active"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    Active Protocols (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubFilter("paused")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
                      subFilter === "paused"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    Paused (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubFilter("ended")}
                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
                      subFilter === "ended"
                        ? "bg-[#0b1f3a] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-slate-300"
                    }`}
                  >
                    Past / Ended (0)
                  </button>
                </div>
                <Link
                  href="/refills"
                  className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors"
                >
                  + Add Cartridge Refill
                </Link>
              </div>

              {/* Main Subscription Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[20px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[3px]">
                    <p className="font-bold text-[#0b1f3a] text-[17px]">
                      Semaglutide 5mg 28-Day Cartridge Refill
                    </p>
                    <p className="font-normal text-[#64748b] text-[12.5px]">
                      28-Day Automated Cycle · Subscription ID #SUB-SMG-8902
                    </p>
                  </div>
                  <div className="bg-[#e6fffa] px-[12px] py-[6px] rounded-[20px]">
                    <p className="font-semibold text-[#16a6a3] text-[12px] whitespace-nowrap">
                      Active Subscription
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] px-4 sm:px-[28px] py-[22px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-[16px] items-center">
                    <div className="w-[54px] h-[54px] rounded-[8px] bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        alt=""
                        className="w-[46px] h-[46px] object-contain"
                        src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                      />
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <p className="font-bold text-[#0b1f3a] text-[14px]">
                        Semaglutide Multi-Dose Cartridge (5mg)
                      </p>
                      <p className="font-normal text-[#64748b] text-[12.5px]">
                        Protocol: 0.25mg Weekly Escalation Protocol · 4 Doses / Refill
                      </p>
                      <p className="font-normal text-[#94a3b8] text-[12px]">
                        Ships to: Cambridge Science Park (Dr. Alexander Wright)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0b1f3a] text-[17px]">£110.00</p>
                    <p className="font-medium text-[#16a6a3] text-[11.5px]">per 28-day cycle (-15%)</p>
                  </div>
                </div>

                <div className="bg-[#e6fffa] px-[16px] py-[12px] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="font-semibold text-[#0b1f3a] text-[12.5px]">
                    Next Cold-Chain Dispatch: Wednesday, 14 October 2026
                  </p>
                  <p className="font-normal text-[#64748b] text-[12px]">
                    Auto-billed to Visa ...1234 on 13 Oct
                  </p>
                </div>

                {/* Sub Actions Row */}
                <div className="flex flex-wrap gap-[10px] items-center">
                  <button
                    type="button"
                    onClick={() => setScheduleExpanded(!scheduleExpanded)}
                    className="bg-[#0b1f3a] hover:bg-[#162a45] text-white text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    {scheduleExpanded ? "Hide Refill Schedule ▲" : "Manage Refill Schedule ▼"}
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Upcoming 14 Oct cycle skipped. Next cycle set to 11 Nov.")}
                    className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Skip Next Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Dosage Protocol updated: 0.50mg / dose.")}
                    className="bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1f3a] text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Update Dosage Protocol
                  </button>
                </div>

                {/* Expanded Refill Schedule Panel (Figma Node 52:11602 / 52:11825) */}
                {scheduleExpanded && (
                  <div className="border-t border-[#f1f5f9] pt-[18px] flex flex-col gap-[16px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#0b1f3a] text-[15px]">
                          Refill Schedule Configuration
                        </p>
                        <p className="font-normal text-[#64748b] text-[12px] mt-0.5">
                          Adjust automated cadence, upcoming dispatch dates, and facility receiving hours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScheduleExpanded(false)}
                        className="text-[#64748b] hover:text-[#0b1f3a] text-[12.5px] font-semibold cursor-pointer"
                      >
                        ✕ Close Schedule
                      </button>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                      <p className="font-semibold text-[#0b1f3a] text-[13px]">
                        1. Automated Refill Frequency
                      </p>

                      {/* Cadence 1: 28 Days */}
                      <div
                        onClick={() => setSelectedCadence("28")}
                        className={`rounded-[8px] px-[14px] py-[10px] flex items-center justify-between cursor-pointer border transition-all ${
                          selectedCadence === "28"
                            ? "bg-[#e6fffa] border-[#16a6a3]"
                            : "bg-[#f8fafc] border-transparent hover:border-slate-300"
                        }`}
                      >
                        <div className="flex gap-[10px] items-center">
                          <div
                            className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center ${
                              selectedCadence === "28" ? "border-[#16a6a3]" : "border-slate-400"
                            }`}
                          >
                            {selectedCadence === "28" && (
                              <div className="w-[6px] h-[6px] rounded-full bg-[#16a6a3]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0b1f3a] text-[13px]">
                              Every 28 Days (Standard Cycle)
                            </p>
                            <p className="font-normal text-[#64748b] text-[11.5px]">
                              Weekly 0.25mg titration protocol · 4 doses per cycle
                            </p>
                          </div>
                        </div>
                        <span className="bg-white text-[#16a6a3] font-bold text-[10px] px-[8px] py-[3px] rounded-[10px] shadow-2xs">
                          CURRENT CADENCE
                        </span>
                      </div>

                      {/* Cadence 2: 14 Days */}
                      <div
                        onClick={() => setSelectedCadence("14")}
                        className={`rounded-[8px] px-[14px] py-[10px] flex items-center justify-between cursor-pointer border transition-all ${
                          selectedCadence === "14"
                            ? "bg-[#e6fffa] border-[#16a6a3]"
                            : "bg-[#f8fafc] border-transparent hover:border-slate-300"
                        }`}
                      >
                        <div className="flex gap-[10px] items-center">
                          <div
                            className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center ${
                              selectedCadence === "14" ? "border-[#16a6a3]" : "border-slate-400"
                            }`}
                          >
                            {selectedCadence === "14" && (
                              <div className="w-[6px] h-[6px] rounded-full bg-[#16a6a3]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0b1f3a] text-[13px]">
                              Every 14 Days (Accelerated Protocol)
                            </p>
                            <p className="font-normal text-[#64748b] text-[11.5px]">
                              Bi-weekly automated dispatch for dual-subject parallel protocols
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cadence 3: 56 Days */}
                      <div
                        onClick={() => setSelectedCadence("56")}
                        className={`rounded-[8px] px-[14px] py-[10px] flex items-center justify-between cursor-pointer border transition-all ${
                          selectedCadence === "56"
                            ? "bg-[#e6fffa] border-[#16a6a3]"
                            : "bg-[#f8fafc] border-transparent hover:border-slate-300"
                        }`}
                      >
                        <div className="flex gap-[10px] items-center">
                          <div
                            className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center ${
                              selectedCadence === "56" ? "border-[#16a6a3]" : "border-slate-400"
                            }`}
                          >
                            {selectedCadence === "56" && (
                              <div className="w-[6px] h-[6px] rounded-full bg-[#16a6a3]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0b1f3a] text-[13px]">
                              Every 56 Days (8-Week Maintenance)
                            </p>
                            <p className="font-normal text-[#64748b] text-[11.5px]">
                              Extended replenishment schedule for established baseline experiments
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-500">
                        Changes take effect on your next cycle on 14 October 2026.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Schedule cadence saved: Every ${selectedCadence} days.`)
                          setScheduleExpanded(false)
                        }}
                        className="bg-[#16a6a3] hover:bg-[#138e8c] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Save Schedule Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscriber Perks Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <p className="font-bold text-[#0b1f3a] text-[15px]">
                  Active Subscriber Protection &amp; Benefits
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                  <div className="bg-[#f8fafc] p-[14px] rounded-[10px]">
                    <p className="font-bold text-[#0b1f3a] text-[12.5px]">
                      ✓ Guaranteed Cold Stock
                    </p>
                    <p className="font-normal text-[#64748b] text-[11.5px] mt-1 leading-relaxed">
                      Reserved batch vials prioritized before public catalog availability.
                    </p>
                  </div>
                  <div className="bg-[#f8fafc] p-[14px] rounded-[10px]">
                    <p className="font-bold text-[#0b1f3a] text-[12.5px]">
                      ✓ Free Tracked 24 Cold-Chain
                    </p>
                    <p className="font-normal text-[#64748b] text-[11.5px] mt-1 leading-relaxed">
                      Refrigerated thermal shipper included free on every 28-day cycle.
                    </p>
                  </div>
                  <div className="bg-[#f8fafc] p-[14px] rounded-[10px]">
                    <p className="font-bold text-[#0b1f3a] text-[12.5px]">
                      ✓ -15% Locked Pricing
                    </p>
                    <p className="font-normal text-[#64748b] text-[11.5px] mt-1 leading-relaxed">
                      Discounted subscription rate locked for the lifetime of the active protocol.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[24px] w-full lg:w-[420px] shrink-0">
              {/* Subscription Summary */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[16px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">
                    Refill Subscription Overview
                  </p>
                  <span className="bg-[#e6fffa] text-[#16a6a3] text-[11px] font-bold px-[8px] py-[3px] rounded-[12px]">
                    1 ACTIVE
                  </span>
                </div>

                <div className="flex flex-col gap-[10px] text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Active Cycles</span>
                    <span className="font-semibold text-[#0b1f3a]">1 Protocol</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Replenishment Cycle</span>
                    <span className="font-semibold text-[#0b1f3a]">Every {selectedCadence} Days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Next Billing Date</span>
                    <span className="font-semibold text-[#0b1f3a]">13 Oct 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Estimated Delivery</span>
                    <span className="font-semibold text-[#0b1f3a]">15 Oct 2026</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Recurring Total</span>
                    <span className="font-bold text-[#0b1f3a] text-[14px]">£110.00 / cycle</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-[16px] px-6 sm:px-[28px] py-[26px] shadow-xs border border-slate-100 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#0b1f3a] text-[15px]">Delivery Address</p>
                  <span className="bg-[#f8fafc] border border-slate-200 text-[#64748b] text-[10.5px] font-medium px-[6px] py-[2px] rounded-[4px]">
                    DEFAULT
                  </span>
                </div>
                {customer.addresses && customer.addresses.length > 0 ? (
                  <div className="text-[#0f172a] text-[13px] leading-[20px] font-normal">
                    <p className="font-semibold text-[#0b1f3a]">
                      {customer.addresses[0].first_name} {customer.addresses[0].last_name}
                    </p>
                    {customer.addresses[0].company && <p>{customer.addresses[0].company}</p>}
                    <p>{customer.addresses[0].address_1}</p>
                    {customer.addresses[0].address_2 && <p>{customer.addresses[0].address_2}</p>}
                    <p>{customer.addresses[0].city}, {customer.addresses[0].postal_code}</p>
                    <p>{customer.addresses[0].country_code?.toUpperCase() === "GB" ? "United Kingdom" : customer.addresses[0].country_code?.toUpperCase()}</p>
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
        {/* TAB 4: SAVED ADDRESSES (Node 52:9816) */}
        {/* ========================================================= */}
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

            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                {customer.addresses.map((addr, index) => (
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
        {activeTab === "payment" && (
          <div className="flex flex-col gap-[24px] w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#0b1f3a] text-[18px]">
                  Payment Methods &amp; Billing
                </h2>
                <p className="font-normal text-[#64748b] text-[13px] mt-0.5">
                  Manage corporate laboratory cards, automated refill billing sources, and institutional credit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Add payment method modal opened.")}
                className="bg-[#0b1f3a] hover:bg-[#162a45] text-white font-semibold text-[13px] px-[16px] py-[10px] rounded-[6px] transition-colors cursor-pointer shrink-0"
              >
                + Add Payment Method
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full">
              {/* Card 1 */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[22px] shadow-xs flex flex-col justify-between gap-[16px]">
                <div className="flex items-start justify-between">
                  <div className="flex gap-[10px] items-center">
                    <div className="w-[42px] h-[26px] relative shrink-0 flex items-center">
                      <VisaBadge className="w-full h-full" monochrome />
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-bold text-[#0b1f3a] text-[14px]">Visa Corporate</p>
                      <p className="font-normal text-[#64748b] text-[12px]">
                        Ending in •••• 1234 · Exp: 08/2028
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#ecfdf5] border border-[#a7f4d0] text-[#059669] font-bold text-[10px] px-[8px] py-[4px] rounded-[4px] whitespace-nowrap">
                    DEFAULT BILLING
                  </span>
                </div>

                <div className="bg-[#f8fafc] px-[14px] py-[12px] rounded-[8px] flex flex-col gap-[4px] text-[11px] text-[#64748b]">
                  <p className="font-semibold text-[#0b1f3a] text-[12px]">
                    Cardholder: Dr. Alexander Wright
                  </p>
                  <p>Billing Address: Cambridge Science Park, Milton Rd, Suite 4B, Cambridge, CB4 0GZ</p>
                </div>

                <div className="flex gap-[16px] items-center text-[12px] pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert("Edit card modal.")}
                    className="font-semibold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Default billing method cannot be removed.")}
                    className="text-[#94a3b8] hover:text-slate-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[22px] shadow-xs flex flex-col justify-between gap-[16px]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-[12px] items-center">
                    <div className="w-[42px] h-[26px] relative shrink-0 flex items-center">
                      <MastercardBadge className="w-full h-full" monochrome />
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-bold text-[#0b1f3a] text-[14px]">Mastercard Grant Account</p>
                      <p className="font-normal text-[#64748b] text-[12px]">
                        Ending in •••• 8890 · Exp: 11/2027
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] px-[14px] py-[12px] rounded-[8px] flex flex-col gap-[4px] text-[11px] text-[#64748b]">
                  <p className="font-semibold text-[#0b1f3a] text-[12px]">
                    Cardholder: Cambridge Biomedical Research Trust
                  </p>
                  <p>Billing Address: The Old Schools, Trinity Lane, Cambridge, CB2 1TN</p>
                </div>

                <div className="flex gap-[16px] items-center text-[12px] pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert("Edit card modal.")}
                    className="font-semibold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Set as default card.")}
                    className="font-medium text-[#64748b] hover:text-[#0b1f3a] cursor-pointer"
                  >
                    Set as Default
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Card removed.")}
                    className="text-[#94a3b8] hover:text-rose-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[22px] shadow-xs flex flex-col justify-between gap-[16px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-bold text-[#0b1f3a] text-[14px]">
                      Institutional Purchase Order
                    </p>
                    <p className="font-normal text-[#64748b] text-[12px]">
                      Ref: PEP-PO-6629 · Net-30 PO
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8fafc] px-[14px] py-[12px] rounded-[8px] flex flex-col gap-[4px] text-[11px] text-[#64748b]">
                  <p className="font-semibold text-[#0b1f3a] text-[12px]">
                    Cardholder: Univ. of Cambridge Pharmacology Dept.
                  </p>
                  <p>Billing Address: Biomedical Campus, Hills Rd, Cambridge, CB2 0QQ</p>
                </div>

                <div className="flex gap-[16px] items-center text-[12px] pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert("Edit PO details.")}
                    className="font-semibold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Set as default billing.")}
                    className="font-medium text-[#64748b] hover:text-[#0b1f3a] cursor-pointer"
                  >
                    Set as Default
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Purchase Order reference removed.")}
                    className="text-[#94a3b8] hover:text-rose-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                ✓ Profile saved and synchronized with Medusa backend!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
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
                    placeholder={customer?.first_name || "Alexander"}
                    className="border border-[#cbd5e1] rounded-[8px] px-3 py-2 text-sm text-[#0b1f3a] focus:border-[#16a6a3] outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#0b1f3a]">Last Name</label>
                  <input
                    type="text"
                    value={addrLastName}
                    onChange={(e) => setAddrLastName(e.target.value)}
                    placeholder={customer?.last_name || "Wright"}
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
                  placeholder="Dept. of Molecular Pharmacology"
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
                  placeholder="Cambridge Science Park, Milton Rd"
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
                  placeholder="Suite 4B, Reception Wing"
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
                    placeholder="Cambridge"
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
                    placeholder="CB4 0GZ"
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
                    placeholder="+44 1223 982 401"
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
