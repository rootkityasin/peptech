"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCart, getItemSubtitle } from "@/components/cart/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import {
  fetchPaymentGateways,
  prepareCheckout,
  type PaymentGatewayOption,
} from "@/lib/commerce-checkout";
import { getCustomerOrders, getCustomerAddresses } from "@/lib/customer-api";
import {
  findCountryByCode,
  findCountryByName,
  formatCountryCode,
} from "@/lib/regions";
import { CheckoutSkeleton } from "@/components/ui/Skeletons";
import { resolveProductImage } from "@/lib/product-images";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { VisaBadge, MastercardBadge } from "@/components/ui/PaymentBadges";
import { trackAddShippingInfo, trackAddPaymentInfo, trackBeginCheckout } from "@/lib/tracking";

function CheckoutContent() {
  const {
    items,
    subtotal,
    subscriptionSavings,
    promoDiscount,
    totalSavings,
    finalSubtotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    autoSavings,
    featuredPromo,
    shippingCost,
    destination,
    country,
    setCountry,
    countryCode,
    countryOptions,
    currency,
    removeItem,
    convertSubscriptionsToOneTime,
    clearCart,
    shippingOptions,
    shippingOptionId,
    setShippingOptionId,
    selectedShippingOption,
    shippingAvailable,
    shippingReady,
    isOptionEligibleForFree,
  } = useCart();

  const {
    customer,
    token,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
  } = useCustomer();

  // Checkout states
  const [ruo, setRuo] = useState(false);

  // GA4 / CAPI E-Commerce: Begin Checkout tracking
  const hasTrackedBeginCheckoutRef = React.useRef(false);
  useEffect(() => {
    if (items.length > 0 && finalSubtotal > 0 && !hasTrackedBeginCheckoutRef.current) {
      hasTrackedBeginCheckoutRef.current = true;
      trackBeginCheckout(
        items.map((it) => ({
          item_id: it.id,
          item_name: it.title,
          price: it.price,
          quantity: it.quantity,
          format: it.format,
          subscription_type: it.isSubscription ? "28_day_subscription" : "one_time",
        })),
        finalSubtotal
      );
    }
  }, [items, finalSubtotal]);
  const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [availableGateways, setAvailableGateways] = useState<PaymentGatewayOption[]>([
    { id: "bank_transfer", name: "UK Faster Payments (Bank Transfer)" },
  ]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("bank_transfer");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPaymentGateways().then((res) => {
      if (!active || !res.gateways.length) return;
      setAvailableGateways(res.gateways);
      setSelectedPaymentMethod((current) =>
        res.gateways.some((g) => g.id === current) ? current : res.gateways[0].id
      );
    });
    return () => {
      active = false;
    };
  }, []);

  // Keep coupon input in sync with applied promo code
  useEffect(() => {
    if (appliedPromo?.code && !couponCode) {
      setCouponCode(appliedPromo.code);
    }
  }, [appliedPromo?.code]);

  // Auth Portal States (Inline Sign In / Register)
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Registration Form States
  const [regTitle, setRegTitle] = useState("Dr.");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regAgreeCompliance, setRegAgreeCompliance] = useState(false);

  // Selected Address State (Auto-filled from customer)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [remoteOrders, setRemoteOrders] = useState<any[]>([]);
  const [remoteAddresses, setRemoteAddresses] = useState<any[]>([]);
  const [customAddress, setCustomAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    phone: "",
  });
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const isUserManualCountryChangeRef = React.useRef(false);

  const handleCountryChange = (newCountryName: string) => {
    isUserManualCountryChangeRef.current = true;
    setCountry(newCountryName);

    const newCountryCode = (
      findCountryByName(countryOptions, newCountryName)?.code || countryCode
    ).toLowerCase();

    // Check if researcher has a saved address in this selected country
    const matchingSavedIndex = availableAddresses.findIndex(
      (addr) =>
        addr.country_code && addr.country_code.toLowerCase() === newCountryCode,
    );

    if (matchingSavedIndex !== -1) {
      setSelectedAddressIndex(matchingSavedIndex);
      setUseCustomAddress(false);
    } else {
      // Switching to a destination country without a saved profile address:
      // Enable custom address entry so researcher can provide the destination address
      setUseCustomAddress(true);
    }
  };

  // Fetch remote orders and addresses when customer or token is active
  useEffect(() => {
    if (!customer?.id) return;
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("peptech_customer_token")
        : null);

    // Load customer order history to extract delivery destinations
    getCustomerOrders(activeToken || undefined, customer.id, customer.email)
      .then((orders) => {
        if (Array.isArray(orders) && orders.length > 0) {
          setRemoteOrders(orders);
        }
      })
      .catch(() => {});

    // Load registered customer addresses
    if (activeToken) {
      getCustomerAddresses(activeToken)
        .then((addrs) => {
          if (Array.isArray(addrs) && addrs.length > 0) {
            setRemoteAddresses(addrs);
          }
        })
        .catch(() => {});
    }
  }, [customer?.id, customer?.email, token]);

  // Derived available addresses from customer profile, remote addresses, orders, or local fallback
  const availableAddresses = React.useMemo(() => {
    const direct = [...(customer?.addresses || []), ...remoteAddresses];

    const allSources: any[] = [...direct];

    // Add addresses extracted from remote orders
    for (const o of remoteOrders) {
      const addr =
        typeof o.shippingAddress === "object"
          ? o.shippingAddress
          : typeof o.shipping_address === "object"
            ? o.shipping_address
            : null;
      if (addr && (addr.address_1 || addr.address1)) {
        allSources.push(addr);
      }
    }

    // Add cached local storage orders
    if (typeof window !== "undefined" && customer?.id) {
      try {
        const stored = JSON.parse(
          localStorage.getItem(`peptech_customer_orders_${customer.id}`) ||
            "[]",
        );
        for (const o of stored) {
          const addr =
            typeof o.shippingAddress === "object"
              ? o.shippingAddress
              : typeof o.shipping_address === "object"
                ? o.shipping_address
                : null;
          if (addr && (addr.address_1 || addr.address1)) {
            allSources.push(addr);
          }
        }
      } catch {}
    }

    // Add last saved delivery address fallback
    if (typeof window !== "undefined") {
      try {
        const last = JSON.parse(
          localStorage.getItem("peptech_last_delivery_address") || "null",
        );
        if (last && (last.address_1 || last.address1)) {
          allSources.push(last);
        }
      } catch {}
    }

    const extracted: any[] = [];
    const seen = new Set<string>();
    for (const addr of allSources) {
      const addr1 = addr.address_1 || addr.address1 || "";
      const postCode = addr.postal_code || addr.postalCode || "";
      if (!addr1 && !postCode) continue;
      const key = `${addr1.trim().toLowerCase()}_${postCode.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        extracted.push({
          id: addr.id || `addr_${extracted.length + 1}`,
          first_name: addr.first_name || customer?.first_name || "",
          last_name: addr.last_name || customer?.last_name || "",
          company: addr.company || customer?.company_name || "",
          address_1: addr1,
          address_2: addr.address_2 || addr.address2 || "",
          city: addr.city || "",
          postal_code: postCode,
          province: addr.province || "",
          country_code: addr.country_code || "gb",
          phone: addr.phone || customer?.phone || "",
        });
      }
    }

    return extracted;
  }, [
    customer?.addresses,
    remoteAddresses,
    remoteOrders,
    customer?.id,
    customer?.first_name,
    customer?.last_name,
    customer?.company_name,
    customer?.phone,
  ]);

  // Auto-fill address from customer profile when customer or availableAddresses load
  useEffect(() => {
    if (customer) {
      if (availableAddresses.length > 0) {
        const defaultShippingIdx = availableAddresses.findIndex(
          (a) => a.is_default_shipping,
        );
        const activeIdx =
          selectedAddressIndex >= 0 &&
          selectedAddressIndex < availableAddresses.length
            ? selectedAddressIndex
            : defaultShippingIdx !== -1
              ? defaultShippingIdx
              : 0;

        const defaultAddr =
          availableAddresses[activeIdx] || availableAddresses[0];
        setCustomAddress({
          first_name: defaultAddr.first_name || customer.first_name || "",
          last_name: defaultAddr.last_name || customer.last_name || "",
          address_1: defaultAddr.address_1 || "",
          address_2: defaultAddr.address_2 || "",
          city: defaultAddr.city || "",
          postal_code: defaultAddr.postal_code || "",
          province: defaultAddr.province || "",
          phone: defaultAddr.phone || customer.phone || "",
        });
        if (!isUserManualCountryChangeRef.current && defaultAddr.country_code) {
          const matched = findCountryByCode(
            countryOptions,
            defaultAddr.country_code,
          );
          if (matched && country !== matched.name) setCountry(matched.name);
        }
      } else {
        setCustomAddress((prev) => ({
          ...prev,
          first_name: prev.first_name || customer.first_name || "",
          last_name: prev.last_name || customer.last_name || "",
          phone: prev.phone || customer.phone || "",
        }));
      }
    }
  }, [customer, availableAddresses, selectedAddressIndex, countryOptions]);

  // Rate Limiting Security Cooldown
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const diff = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setLockedUntil(null);
        setLockCountdown(0);
        setFailedAttempts(0);
      } else {
        setLockCountdown(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const hasSubscription = items.some((i) => i.isSubscription);
  const money = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

  // Inline Sign-In Handler
  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (lockedUntil && Date.now() < lockedUntil) {
      setAuthError(
        `Security pause active. Please wait ${lockCountdown}s before attempting again.`,
      );
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setAuthError("Please enter your email and password.");
      return;
    }

    setAuthSubmitting(true);
    try {
      await login(cleanEmail, loginPassword);
      setFailedAttempts(0);
      setLockedUntil(null);
    } catch (err: any) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockedUntil(Date.now() + 60000);
        setLockCountdown(60);
        setAuthError(
          "Security threshold reached (5 failed attempts). Account access paused for 60s.",
        );
      } else {
        setAuthError(
          err.message || "Invalid credentials. Please verify and try again.",
        );
      }
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Inline Registration Handler
  async function handleInlineRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = regEmail.trim().toLowerCase();
    if (
      !cleanEmail ||
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regCompany.trim()
    ) {
      setAuthError("All required researcher fields (*) must be completed.");
      return;
    }

    if (regPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (!regAgreeCompliance) {
      setAuthError(
        "You must certify that you are 18+ and orders are for In-Vitro Laboratory Research Use Only (RUO).",
      );
      return;
    }

    setAuthSubmitting(true);
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
      });
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  const isBankTransferSelected = selectedPaymentMethod === "bank_transfer";
  const totalDue = finalSubtotal + (shippingAvailable ? shippingCost : 0);

  // Start Order / Payment Checkout Process
  async function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !token || !customer) return;

    if (!items.length) {
      setError("Your research basket is empty.");
      return;
    }
    if (isBankTransferSelected && hasSubscription) {
      setError(
        "28-day recurring subscriptions require an active card payment method. Use the button above to convert items to a one-time purchase to pay via UK Faster Payments (Bank Transfer)."
      );
      return;
    }
    if (hasSubscription && !isBankTransferSelected && !recurring) {
      setError("Please authorise the 28-day recurring refill consent checkbox before continuing.");
      return;
    }
    if (!ruo) {
      setError("Please accept the Terms of Sale, Privacy Policy, and 18+ Research Use Only conditions.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!shippingReady) {
        throw new Error(
          "Shipping rates are still loading. Please try again in a moment.",
        );
      }
      if (countryOptions.length === 0) {
        throw new Error(
          "Delivery countries could not be loaded from Medusa regions. Please refresh and try again.",
        );
      }
      if (!shippingAvailable || !shippingOptionId) {
        throw new Error(
          "Shipping is unavailable for this destination. Choose another destination.",
        );
      }

      const currentCountryCode = (
        findCountryByName(countryOptions, country)?.code || countryCode
      ).toLowerCase();
      const selectedAddr = availableAddresses[selectedAddressIndex];
      const isSavedAddrCountryMatching =
        selectedAddr?.country_code &&
        selectedAddr.country_code.toLowerCase() === currentCountryCode;
      const useSaved =
        availableAddresses.length > 0 &&
        !useCustomAddress &&
        isSavedAddrCountryMatching;
      const deliveryCountryCode = currentCountryCode;

      const resolvedAddress = useSaved
        ? {
            id: selectedAddr?.id,
            first_name: selectedAddr?.first_name || customer.first_name || "",
            last_name: selectedAddr?.last_name || customer.last_name || "",
            company:
              selectedAddr?.company || customer.company_name || undefined,
            address_1: selectedAddr?.address_1 || "",
            address_2: selectedAddr?.address_2 || undefined,
            city: selectedAddr?.city || "",
            postal_code: selectedAddr?.postal_code || "",
            country_code: deliveryCountryCode,
            province: selectedAddr?.province || undefined,
            phone: selectedAddr?.phone || customer.phone || undefined,
          }
        : {
            first_name: customAddress.first_name || customer.first_name || "",
            last_name: customAddress.last_name || customer.last_name || "",
            company: customer.company_name || undefined,
            address_1: customAddress.address_1,
            address_2: customAddress.address_2 || undefined,
            city: customAddress.city,
            postal_code: customAddress.postal_code,
            country_code: deliveryCountryCode,
            province: customAddress.province || undefined,
            phone: customAddress.phone || customer.phone || undefined,
          };

      trackAddPaymentInfo(
        items.map((it) => ({
          item_id: it.id,
          item_name: it.title,
          price: it.price,
          quantity: it.quantity,
          format: it.format,
          subscription_type: it.isSubscription ? "28_day_subscription" : "one_time",
        })),
        totalDue,
        selectedPaymentMethod
      );

      const session = await prepareCheckout({
        items,
        token,
        email: customer.email,
        countryCode: deliveryCountryCode,
        address: resolvedAddress.address_1 ? resolvedAddress : undefined,
        ruoAccepted: ruo,
        recurringAccepted: !isBankTransferSelected && recurring,
        paymentMethod: selectedPaymentMethod,
        uiMode: isBankTransferSelected ? "hosted_page" : "embedded",
        shippingOptionId,
        promoCode: appliedPromo?.code || undefined,
      });

      if (session.state === "awaiting_transfer") {
        try {
          const ref = session.transferReference || session.orderNumber || session.attemptId;
          const existingRaw = localStorage.getItem("peptech_bank_orders");
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          const list = Array.isArray(existing) ? existing : [];
          const filtered = list.filter((o: any) => o?.orderReference !== ref);
          filtered.unshift({
            orderReference: ref,
            placedAt: new Date().toISOString(),
            total: session.total,
            currency: session.currency || "gbp",
            customer: {
              email: customer.email,
              name: `${resolvedAddress.first_name || ""} ${resolvedAddress.last_name || ""}`.trim() || undefined,
            },
            address: resolvedAddress.address_1 ? resolvedAddress : undefined,
            items: items.map((it) => ({
              id: it.id,
              title: it.title,
              subtitle: it.strength || "Laboratory RUO Grade",
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              options: it.options,
            })),
          });
          localStorage.setItem("peptech_bank_orders", JSON.stringify(filtered.slice(0, 25)));
          localStorage.removeItem("peptech_checkout_revision");
        } catch {}

        window.location.assign(
          `/checkout/success?attempt_id=${encodeURIComponent(session.attemptId)}`,
        );
      } else if (session.checkoutUrl) {
        window.location.assign(session.checkoutUrl);
      } else if (
        ["processing", "paid", "confirmed", "held"].includes(session.state)
      ) {
        window.location.assign(
          `/checkout/success?attempt_id=${encodeURIComponent(session.attemptId)}`,
        );
      } else {
        throw new Error(
          "This checkout session could not be opened. Please refresh and retry.",
        );
      }
    } catch (e: any) {
      setError(
        e instanceof Error
          ? e.message
          : "Checkout could not open. Please retry.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-slate-100 flex flex-col lg:flex-row">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Dark Navy Summary & Cart Items (#0B1F3A)                     */}
      {/* ========================================================================= */}
      <aside aria-label="Order Summary" className="w-full lg:w-[48%] min-h-0 lg:min-h-screen bg-[#0B1F3A] p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return</span>
            </Link>
            <img
              src="/images/figma/peptech-logo.png"
              alt="PEPTECH®"
              className="h-5 sm:h-6 w-auto object-contain block brightness-0 invert"
            />
          </div>

          {/* Total Due Big Display */}
          <div className="pt-2">
            <p className="text-sm font-medium text-slate-400">
              Total due today
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
              {money(finalSubtotal + (shippingAvailable ? shippingCost : 0))}
            </h2>
          </div>

          {/* Itemized Cart List */}
          {!items.length ? (
            <div className="py-8 text-center text-slate-400">
              <p>Your research basket is empty.</p>
              <Link
                href="/shop"
                className="inline-block mt-3 text-sm text-[#00C5A0] underline"
              >
                Browse catalogue
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/80 my-2">
              {items.map((item) => (
                <li
                  key={`${item.id}:${item.isSubscription}`}
                  className="py-4 flex gap-4 items-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-800/60 border border-slate-700/60 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    <img
                      src={resolveProductImage(item)}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fallback = "/images/placeholder.svg";
                        if (!target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white text-sm truncate">
                        {item.title}
                      </p>
                      <p className="font-bold text-white text-sm whitespace-nowrap">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {getItemSubtitle(item)}
                    </p>
                    {item.isSubscription && (
                      <p className="text-[11px] text-[#00C5A0] mt-0.5 font-medium">
                        Every 28 days ·{" "}
                        {item.discountPercent
                          ? `${item.discountPercent}% auto-savings`
                          : autoSavings.text}
                      </p>
                    )}
                    {item.options
                      ?.filter(
                        (o) => !o.label.toLowerCase().includes("cartridge"),
                      )
                      .map((opt, idx) => (
                        <p
                          key={idx}
                          className="text-[11px] text-slate-400 mt-0.5"
                        >
                          <span className="text-slate-300 font-medium">
                            {opt.label}:
                          </span>{" "}
                          <span className="text-[#00C5A0]">{opt.value}</span>
                        </p>
                      ))}

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
          <div className="space-y-2">
            {featuredPromo && !appliedPromo && (
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="bg-[#16A6A3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    CODE
                  </span>
                  <span className="text-xs text-slate-300 truncate">
                    Active promo:{" "}
                    <strong className="text-white">{featuredPromo.code}</strong>{" "}
                    ({featuredPromo.badgeText})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setCouponLoading(true);
                    setCouponError("");
                    const res = await applyPromoCode(featuredPromo.code);
                    setCouponLoading(false);
                    if (!res.success) {
                      setCouponError(res.message || "Failed to apply code.");
                    } else {
                      setCouponCode(featuredPromo.code);
                    }
                  }}
                  className="text-xs text-[#00C5A0] hover:underline font-semibold shrink-0 ml-2 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label htmlFor="checkout-promo-code" className="sr-only">
                Promo or coupon code
              </label>
              <input
                id="checkout-promo-code"
                name="promo_code"
                type="text"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError("");
                }}
                placeholder="Add promo or coupon code"
                className="flex-1 min-h-[48px] rounded-xl bg-slate-900/60 border border-slate-700/80 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
              />
              {appliedPromo &&
              (!couponCode.trim() ||
                couponCode.trim().toUpperCase() ===
                  appliedPromo.code.toUpperCase()) ? (
                <button
                  type="button"
                  onClick={() => {
                    removePromoCode();
                    setCouponCode("");
                    setCouponError("");
                  }}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-rose-300 text-slate-300 px-5 py-2.5 text-xs font-semibold tracking-wide border border-slate-700 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  disabled={couponLoading || !couponCode.trim()}
                  onClick={async () => {
                    if (!couponCode.trim()) return;
                    setCouponLoading(true);
                    setCouponError("");
                    const res = await applyPromoCode(couponCode);
                    setCouponLoading(false);
                    if (!res.success) {
                      setCouponError(
                        res.message || "Invalid promotional code.",
                      );
                    } else {
                      setCouponCode(couponCode.trim().toUpperCase());
                    }
                  }}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 text-xs font-semibold tracking-wide border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              )}
            </div>

            {appliedPromo && (
              <p className="text-xs text-[#00C5A0] font-medium flex items-center gap-1.5 pt-0.5">
                <span>✓</span>
                <span>
                  {appliedPromo.code} applied (
                  {appliedPromo.discountType === "percentage"
                    ? `${appliedPromo.discountValue}% Off`
                    : money(appliedPromo.discountValue)}
                  )
                </span>
              </p>
            )}

            {couponError && (
              <p className="text-xs text-rose-400">{couponError}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                {money(subtotal)}
              </span>
            </div>

            {/* Automatic Subscribe & Save Auto-Savings */}
            {subscriptionSavings > 0 && (
              <div className="flex justify-between text-[#00C5A0]">
                <span>Subscribe &amp; Save ({autoSavings.text})</span>
                <span className="font-semibold">
                  -{money(subscriptionSavings)}
                </span>
              </div>
            )}

            {/* Manual Promotional Code Discount */}
            {appliedPromo && promoDiscount > 0 && (
              <div className="flex justify-between text-[#00C5A0]">
                <span>Promo Code ({appliedPromo.code})</span>
                <span className="font-semibold">-{money(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <span>
                {shippingAvailable
                  ? selectedShippingOption?.name || "Shipping"
                  : "Shipping unavailable"}
              </span>
              <span className="font-semibold text-white">
                {!shippingAvailable
                  ? "—"
                  : shippingCost === 0
                    ? "FREE"
                    : money(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs items-center gap-4">
              <span>Tax / Import Duties</span>
              <span className="text-right">£0.00 (Local duties/VAT on import if applicable)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800/80">
              <span>Total due today</span>
              <span className="text-xl text-[#00C5A0]">
                {money(finalSubtotal + (shippingAvailable ? shippingCost : 0))}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: White Background (#FFFFFF) & Inline Auth / Payment Checkout */}
      {/* ========================================================================= */}
      <main className="w-full lg:w-[52%] min-h-0 lg:min-h-screen bg-white text-[#0B1F3A] p-6 sm:p-10 lg:p-14 flex flex-col justify-start lg:justify-center">
        <div className="max-w-xl mx-auto w-full">
          {isAuthLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#16A6A3] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                Verifying researcher session...
              </p>
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
                  Per UK &amp; international laboratory peptide regulations, all
                  orders must be associated with an authenticated institutional
                  researcher or authorized laboratory account. Guest checkout is
                  disabled.
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError(null);
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
                    setAuthMode("register");
                    setAuthError(null);
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
                <form
                  onSubmit={handleInlineLogin}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="checkout-login-email" className="text-xs font-bold text-[#0B1F3A]">
                      Institutional Researcher Email
                    </label>
                    <input
                      id="checkout-login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="researcher@biotech-institute.org"
                      className="w-full min-h-[48px] border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-sm text-[#0B1F3A] focus:border-[#16A6A3] focus:ring-1 focus:ring-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="checkout-login-password" className="text-xs font-bold text-[#0B1F3A]">
                        Account Password
                      </label>
                      <button
                        type="button"
                        aria-pressed={showLoginPassword}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="text-xs font-semibold text-[#16A6A3] hover:underline cursor-pointer"
                      >
                        {showLoginPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <input
                      id="checkout-login-password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full min-h-[48px] border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-sm text-[#0B1F3A] focus:border-[#16A6A3] focus:ring-1 focus:ring-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3] outline-none"
                    />
                  </div>

                  {lockedUntil && Date.now() < lockedUntil && (
                    <div role="status" className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
                      Security cooldown: Access paused for {lockCountdown}s
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      authSubmitting ||
                      (!!lockedUntil && Date.now() < lockedUntil)
                    }
                    className="mt-2 w-full min-h-[48px] rounded-xl bg-[#0B1F3A] hover:bg-[#162A45] text-white p-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    {authSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In &amp; Proceed to Checkout</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Form 2: Inline Registration */
                <form
                  onSubmit={handleInlineRegister}
                  className="flex flex-col gap-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-reg-title" className="text-xs font-bold text-[#0B1F3A]">
                        Title
                      </label>
                      <CustomSelect
                        value={regTitle}
                        onChange={(val) => setRegTitle(val)}
                        options={["Dr.", "Prof.", "Mr.", "Ms.", "Ph.D."]}
                        variant="compact"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-reg-first" className="text-xs font-bold text-[#0B1F3A]">
                        First Name *
                      </label>
                      <input
                        id="checkout-reg-first"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Alexander"
                        className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-reg-last" className="text-xs font-bold text-[#0B1F3A]">
                        Last Name *
                      </label>
                      <input
                        id="checkout-reg-last"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Wright"
                        className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-reg-company" className="text-xs font-bold text-[#0B1F3A]">
                      Institution / Facility Name *
                    </label>
                    <input
                      id="checkout-reg-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      required
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="e.g. Cambridge Biomedical Research Centre"
                      className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-reg-email" className="text-xs font-bold text-[#0B1F3A]">
                      Institutional Email *
                    </label>
                    <input
                      id="checkout-reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="alexander.wright@cambridge-biotech.ac.uk"
                      className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-reg-phone" className="text-xs font-bold text-[#0B1F3A]">
                      Direct Phone / Lab Ext.{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="checkout-reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+44 1223 928 401"
                      className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <label htmlFor="checkout-reg-password" className="text-xs font-bold text-[#0B1F3A]">
                          Password *
                        </label>
                        <button
                          type="button"
                          aria-pressed={showRegPassword}
                          aria-label={showRegPassword ? "Hide passwords" : "Show passwords"}
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          className="text-[11px] font-semibold text-[#16A6A3] hover:underline cursor-pointer"
                        >
                          {showRegPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <input
                        id="checkout-reg-password"
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 chars"
                        className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-reg-confirm-password" className="text-xs font-bold text-[#0B1F3A]">
                        Confirm *
                      </label>
                      <input
                        id="checkout-reg-confirm-password"
                        name="confirm_password"
                        type={showRegPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
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
                      I certify that I am at least 18 years old and represent an
                      accredited laboratory or scientific facility. All
                      purchases are strictly for{" "}
                      <strong className="text-[#0B1F3A]">
                        In-Vitro Laboratory Research Use Only (RUO)
                      </strong>
                      .
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
                      <span>Create Account &amp; Proceed to Checkout</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ===================================================================== */
            /* STATE B: AUTHENTICATED CHECKOUT (DELIVERY & PAYMENT METHOD SELECTION) */
            /* ===================================================================== */
            <form
              onSubmit={handleProceedToPayment}
              className="flex flex-col gap-5 animate-in fade-in duration-200"
            >
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1F3A] tracking-tight">
                Delivery &amp; Payment Checkout
              </h1>

              {/* Authenticated Researcher Badge */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Signed in researcher
                  </p>
                  <p className="text-sm font-bold text-[#0B1F3A]">
                    {customer.metadata?.title
                      ? `${customer.metadata.title} `
                      : ""}
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
                <div className="mt-1.5 font-normal">
                  <CustomSelect
                    value={country}
                    onChange={(val) => handleCountryChange(val)}
                    disabled={busy || countryOptions.length === 0}
                    placeholder={countryOptions.length === 0 ? "Loading countries..." : "Select country"}
                    options={countryOptions.map((c) => ({ value: c.name, label: c.name }))}
                  />
                </div>
                {countryOptions.length === 0 && (
                  <span className="mt-1 block text-[11px] font-medium text-amber-700">
                    Loading countries&hellip;
                  </span>
                )}
                {destination === "INTL" && (
                  <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <span className="text-[#16A6A3] font-bold">ℹ</span>
                    <span>
                      {isBankTransferSelected ? (
                        <>
                          International orders are priced in{" "}
                          <strong>GBP (£)</strong>. Please ensure international wire transfers settle in full in GBP.
                        </>
                      ) : (
                        <>
                          International orders are processed securely in{" "}
                          <strong>GBP (£)</strong>. Your card provider will convert automatically at live exchange rates.
                        </>
                      )}
                    </span>
                  </div>
                )}
              </label>

              {/* Shipping Method Selection */}
              <fieldset className="block text-xs font-bold text-[#0B1F3A] border-0 p-0 m-0">
                <legend className="text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Shipping Method
                </legend>
                {!shippingReady ? (
                  <div className="rounded-xl border border-slate-200 p-3.5 text-sm text-slate-500 animate-pulse">
                    Loading available shipping methods&hellip;
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-800 font-medium">
                    No shipping method is available for this destination. Choose
                    another country to continue.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {shippingOptions.map((option) => {
                      const active = option.id === shippingOptionId;
                      const inputId = `shipping-option-${option.id}`;
                      return (
                        <div key={option.id} className="relative">
                          <input
                            id={inputId}
                            name="shipping_method"
                            type="radio"
                            value={option.id}
                            checked={active}
                            disabled={busy}
                            onChange={() => {
                              setShippingOptionId(option.id);
                              trackAddShippingInfo(
                                items.map((it) => ({
                                  item_id: it.id,
                                  item_name: it.title,
                                  price: it.price,
                                  quantity: it.quantity,
                                  format: it.format,
                                  subscription_type: it.isSubscription ? "28_day_subscription" : "one_time",
                                })),
                                finalSubtotal,
                                option.name
                              );
                            }}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor={inputId}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 min-h-[48px] text-left transition-colors cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#16A6A3] ${
                              active
                                ? "border-[#16A6A3] bg-teal-50/60 ring-1 ring-[#16A6A3]"
                                : "border-slate-300 bg-white hover:border-slate-400"
                            }`}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <span
                                aria-hidden="true"
                                className={`inline-block h-4 w-4 shrink-0 rounded-full border-2 ${
                                  active
                                    ? "border-[#16A6A3] bg-[#16A6A3]"
                                    : "border-slate-300"
                                }`}
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-[#0B1F3A] truncate">
                                  {option.name}
                                </span>
                                {option.description ? (
                                  <span className="block text-xs font-normal text-slate-500 truncate">
                                    {option.description}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            {(() => {
                              const isFree = isOptionEligibleForFree(option);
                              if (isFree) {
                                return (
                                  <span className="text-sm font-bold text-[#00C5A0] shrink-0 flex items-center gap-1.5">
                                    <span>FREE</span>
                                    {option.amount > 0 && (
                                      <span className="text-xs line-through text-slate-400 font-normal">
                                        {money(option.amount)}
                                      </span>
                                    )}
                                  </span>
                                );
                              }
                              return (
                                <span className="text-sm font-bold text-[#0B1F3A] shrink-0">
                                  {option.amount === 0
                                    ? "FREE"
                                    : money(option.amount)}
                                </span>
                              );
                            })()}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              {/* Auto-filled Delivery Address Details */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F3A]">
                    Laboratory Delivery Address
                  </span>
                  {availableAddresses.length > 0 && !useCustomAddress ? (
                    <span className="text-[11px] text-[#00C5A0] font-semibold">
                      ● Auto-filled from Profile
                    </span>
                  ) : customAddress.address_1 ? (
                    <span className="text-[11px] text-[#00C5A0] font-semibold">
                      ● Saved Details Loaded
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      ● Enter Laboratory Destination
                    </span>
                  )}
                </div>

                {availableAddresses.length > 1 && !useCustomAddress && (
                  <div className="flex gap-2 items-center overflow-x-auto pb-1">
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                      Saved Addresses:
                    </span>
                    {availableAddresses.map((addr, idx) => (
                      <button
                        key={addr.id || idx}
                        type="button"
                        onClick={() => {
                          setSelectedAddressIndex(idx);
                          isUserManualCountryChangeRef.current = false;
                          setUseCustomAddress(false);
                          if (addr.country_code) {
                            const matched = findCountryByCode(
                              countryOptions,
                              addr.country_code,
                            );
                            if (matched) setCountry(matched.name);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 border ${
                          selectedAddressIndex === idx
                            ? "bg-[#0B1F3A] text-white border-[#0B1F3A] font-semibold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {addr.address_1?.slice(0, 18) || `Address #${idx + 1}`}{" "}
                        ({addr.city || addr.postal_code})
                      </button>
                    ))}
                  </div>
                )}

                {availableAddresses.length > 0 && !useCustomAddress ? (
                  <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50/80 p-3.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#0B1F3A]">
                        {availableAddresses[selectedAddressIndex]?.first_name}{" "}
                        {availableAddresses[selectedAddressIndex]?.last_name}
                      </p>
                      <span className="bg-[#e6fffa] border border-[#16a6a3]/40 text-[#0b1f3a] text-[10px] font-bold px-1.5 py-0.5 rounded">
                        DEFAULT DESTINATION
                      </span>
                    </div>
                    <p className="font-medium text-[#0f172a]">
                      {availableAddresses[selectedAddressIndex]?.address_1}
                    </p>
                    {availableAddresses[selectedAddressIndex]?.address_2 && (
                      <p className="text-slate-600">
                        {availableAddresses[selectedAddressIndex]?.address_2}
                      </p>
                    )}
                    <p className="text-slate-600">
                      {availableAddresses[selectedAddressIndex]?.city}
                      {availableAddresses[selectedAddressIndex]?.city
                        ? ", "
                        : ""}
                      {availableAddresses[selectedAddressIndex]?.postal_code}
                      {(() => {
                        const cCode =
                          availableAddresses[selectedAddressIndex]
                            ?.country_code;
                        const cName = formatCountryCode(cCode, countryOptions);
                        return cName ? ` · ${cName}` : "";
                      })()}
                    </p>
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setUseCustomAddress(true)}
                        className="text-xs text-[#16A6A3] hover:text-[#138d8a] font-semibold underline cursor-pointer"
                      >
                        Edit or Enter Different Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {availableAddresses.length > 0 && (
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[11.5px] text-slate-500 font-medium">
                          Custom Destination
                        </span>
                        <button
                          type="button"
                          onClick={() => setUseCustomAddress(false)}
                          className="text-xs text-[#16A6A3] hover:underline font-semibold cursor-pointer"
                        >
                          ← Use Saved Profile Address
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-address-1" className="text-[11px] font-semibold text-[#0B1F3A]">
                        Street Address (Line 1) *
                      </label>
                      <input
                        id="checkout-address-1"
                        name="address_1"
                        type="text"
                        autoComplete="address-line1"
                        placeholder="e.g. 10 Innovation Way"
                        value={customAddress.address_1}
                        onChange={(e) =>
                          setCustomAddress({
                            ...customAddress,
                            address_1: e.target.value,
                          })
                        }
                        required
                        className="w-full min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="checkout-address-2" className="text-[11px] font-semibold text-[#0B1F3A]">
                        Suite / Lab Wing (Line 2)
                      </label>
                      <input
                        id="checkout-address-2"
                        name="address_2"
                        type="text"
                        autoComplete="address-line2"
                        placeholder="Optional building or laboratory suite"
                        value={customAddress.address_2}
                        onChange={(e) =>
                          setCustomAddress({
                            ...customAddress,
                            address_2: e.target.value,
                          })
                        }
                        className="w-full min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="checkout-city" className="text-[11px] font-semibold text-[#0B1F3A]">
                          City *
                        </label>
                        <input
                          id="checkout-city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          placeholder="City"
                          value={customAddress.city}
                          onChange={(e) =>
                            setCustomAddress({
                              ...customAddress,
                              city: e.target.value,
                            })
                          }
                          required
                          className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="checkout-postal-code" className="text-[11px] font-semibold text-[#0B1F3A]">
                          Postal Code *
                        </label>
                        <input
                          id="checkout-postal-code"
                          name="postal_code"
                          type="text"
                          autoComplete="postal-code"
                          autoCorrect="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          placeholder="Postal Code"
                          value={customAddress.postal_code}
                          onChange={(e) =>
                            setCustomAddress({
                              ...customAddress,
                              postal_code: e.target.value,
                            })
                          }
                          required
                          className="min-h-[48px] border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-xs text-[#0B1F3A] outline-none focus:border-[#16A6A3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <fieldset className="block border-0 p-0 m-0">
                <legend className="text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Payment Method
                </legend>
                <div className="flex flex-col gap-2">
                  {availableGateways.map((gw) => {
                    const active = selectedPaymentMethod === gw.id;
                    const inputId = `payment-gateway-${gw.id}`;
                    const isBank = gw.id === "bank_transfer";
                    return (
                      <div key={gw.id} className="relative">
                        <input
                          id={inputId}
                          name="payment_method"
                          type="radio"
                          value={gw.id}
                          checked={active}
                          disabled={busy}
                          onChange={() => {
                            setSelectedPaymentMethod(gw.id);
                            setError("");
                          }}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={inputId}
                          className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 min-h-[48px] text-left transition-colors cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#16A6A3] ${
                            active
                              ? "border-[#16A6A3] bg-teal-50/60 ring-1 ring-[#16A6A3]"
                              : "border-slate-300 bg-white hover:border-slate-400"
                          }`}
                        >
                          <span className="flex items-start gap-3 min-w-0">
                            <span
                              aria-hidden="true"
                              className={`mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border-2 ${
                                active
                                  ? "border-[#16A6A3] bg-[#16A6A3]"
                                  : "border-slate-300"
                              }`}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-[#0B1F3A]">
                                {gw.name}
                              </span>
                              <span className="block text-xs font-normal text-slate-500 mt-0.5 leading-snug">
                                {isBank
                                  ? "Reserve your PEP-XXXXXX order reference now and settle via UK bank transfer. Dispatched upon clearance."
                                  : "Authenticated 3-D Secure checkout supporting one-time purchases and 28-day Subscribe & Save refills."}
                              </span>
                            </span>
                          </span>
                          {isBank && (
                            <span className="shrink-0 text-[10.5px] font-bold text-[#0B1F3A] bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                              Direct BACS
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              {/* Subscription-vs-Bank-Transfer Guard Notice */}
              {hasSubscription && isBankTransferSelected && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2.5 text-xs text-amber-950"
                >
                  <p className="font-bold text-amber-900">
                    One-Time Purchase Required for UK Faster Payments
                  </p>
                  <p className="leading-relaxed text-amber-900/90">
                    28-day automated Subscribe &amp; Save plans require an active tokenised card rail. Convert the recurring items in your basket to a one-time order to complete checkout via UK Faster Payments (Bank Transfer).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      convertSubscriptionsToOneTime();
                      setRecurring(false);
                      setError("");
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#162A45] text-white font-semibold text-xs transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    Convert All Items to One-Time Purchase
                  </button>
                </div>
              )}

              {/* 28-day Subscription Consent Checkbox (when card gateway + recurring items active) */}
              {hasSubscription && !isBankTransferSelected && (
                <label className="flex gap-3 text-xs text-slate-700 bg-teal-50/60 border border-teal-200/80 p-3.5 rounded-xl cursor-pointer">
                  <input
                    id="checkout-recurring-consent"
                    name="recurring_accepted"
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#16A6A3] focus:ring-[#16A6A3]"
                  />
                  <span className="leading-snug">
                    I authorise payment today and recurring renewal charges every 28 days for subscription items at {autoSavings.badgeText} discounted research pricing plus delivery and applicable tax. I retain the statutory right to pause, skip intervals, adjust delivery dates, or cancel renewals at any time without penalty via the PEPTECH Researcher Portal or by contacting support@peptech.bio at least 3 business days prior to renewal.
                  </span>
                </label>
              )}

              {/* RUO Conditions Checkbox */}
              <label className="flex gap-3 text-xs text-slate-700 cursor-pointer">
                <input
                  id="checkout-ruo-consent"
                  name="ruo_accepted"
                  type="checkbox"
                  checked={ruo}
                  onChange={(e) => {
                    setRuo(e.target.checked);
                    if (e.target.checked && error.includes("Research Use Only")) {
                      setError("");
                    }
                  }}
                  className="mt-0.5 rounded border-slate-300 text-[#16A6A3] focus:ring-[#16A6A3]"
                />
                <span className="leading-snug">
                  I agree to the{" "}
                  <Link
                    href="/terms-of-sale"
                    className="underline font-medium text-[#0B1F3A]"
                  >
                    Terms of Sale
                  </Link>
                  ,{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline font-medium text-[#0B1F3A]"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and strictly In-Vitro Laboratory Research Use Only conditions.
                </span>
              </label>

              {/* Error Message */}
              {error && (
                <p
                  role="alert"
                  className="text-xs text-red-700 bg-red-50 p-3.5 rounded-lg border border-red-200 font-medium"
                >
                  {error}
                </p>
              )}

              {/* Submit CTA Button */}
              <button
                disabled={
                  busy ||
                  !items.length ||
                  !shippingReady ||
                  !shippingAvailable
                }
                type="submit"
                className="w-full min-h-[52px] rounded-xl bg-[#0B1F3A] hover:bg-[#162A45] p-4 font-bold text-sm text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {isBankTransferSelected
                        ? "Reserving Order Reference…"
                        : "Opening Secure Payment Session…"}
                    </span>
                  </>
                ) : (
                  <span>
                    {isBankTransferSelected
                      ? `Place Order & View Bank Details · ${money(totalDue)}`
                      : `Continue to Card Payment · ${money(totalDue)}`}
                  </span>
                )}
              </button>

              {shippingReady && !shippingAvailable && (
                <p
                  role="alert"
                  className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200"
                >
                  No shipping method is available for this destination. Select a
                  different delivery country.
                </p>
              )}

              <p className="text-center text-xs text-slate-500">
                {isBankTransferSelected
                  ? "Your PEP-XXXXXX transfer reference and bank settlement instructions are displayed immediately after submission."
                  : "Payment details will automatically pre-populate with your verified researcher account."}
              </p>
            </form>
          )}

          {/* Merchant Disclosure Card (Acquirer & Consumer Transparency) */}
          <article className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 text-xs text-slate-600 space-y-3">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A]">
                  Merchant &amp; Settlement Disclosure
                </h2>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                  PEPTECH LIMITED · Statement Descriptor:{" "}
                  <span className="font-mono text-[#0B1F3A]">PEPTECH.BIO</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <VisaBadge />
                <MastercardBadge />
                <span className="text-[10px] font-bold text-[#0B1F3A] bg-white border border-[#CBD5E1] rounded-[3px] px-1.5 py-0.5">
                  UK Faster Payments
                </span>
              </div>
            </header>

            <dl className="grid grid-cols-1 gap-1.5 text-[11px] leading-relaxed">
              <div>
                <dt className="inline font-semibold text-[#0B1F3A]">
                  Hong Kong Registered Office:{" "}
                </dt>
                <dd className="inline">
                  807A, 8/F, Two Harbourfront, 22 Tak Fung Street, Hung Hom, Kowloon, Hong Kong
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-[#0B1F3A]">
                  UK Correspondence &amp; Returns Office:{" "}
                </dt>
                <dd className="inline">
                  Office 17 Ips Innovate, Chartermark Way, Colburn Business Park, DL9 4QJ, Colburn, United Kingdom
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-[#0B1F3A]">
                  Merchant Support:{" "}
                </dt>
                <dd className="inline">
                  <a
                    href="mailto:support@peptech.bio"
                    className="text-[#16A6A3] font-semibold underline rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    support@peptech.bio
                  </a>{" "}
                  · Approved refunds settle in 5–10 business days to the original payment method.
                </dd>
              </div>
            </dl>

            <footer className="pt-2 border-t border-slate-200/80">
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-600">
                <li>
                  <Link
                    href="/terms-of-sale"
                    className="underline hover:text-[#0B1F3A] rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    Terms of Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-[#0B1F3A] rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping-returns"
                    className="underline hover:text-[#0B1F3A] rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    Shipping &amp; Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/research-disclaimer"
                    className="underline hover:text-[#0B1F3A] rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A6A3]"
                  >
                    RUO Disclaimer
                  </Link>
                </li>
              </ul>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
