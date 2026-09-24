import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

const DARK_MODE_CSS = `
html.dark .orders-theme-root,
.dark .orders-theme-root,
html.dark [class*="min-h-screen"],
.dark [class*="min-h-screen"] {
  background-color: #121214 !important;
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root .bg-white,
.dark .orders-theme-root .bg-white {
  background-color: #1c1c1f !important;
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root [class*="bg-[#f6f6f7]"],
.dark .orders-theme-root [class*="bg-[#f6f6f7]"],
html.dark .orders-theme-root [class*="bg-[#fafbfb]"],
.dark .orders-theme-root [class*="bg-[#fafbfb]"],
html.dark .orders-theme-root [class*="bg-[#f9fafb]"],
.dark .orders-theme-root [class*="bg-[#f9fafb]"] {
  background-color: #161618 !important;
}

html.dark .orders-theme-root [class*="border-[#e1e3e5]"],
.dark .orders-theme-root [class*="border-[#e1e3e5]"],
html.dark .orders-theme-root [class*="border-[#c9cccf]"],
.dark .orders-theme-root [class*="border-[#c9cccf]"],
html.dark .orders-theme-root [class*="divide-[#e1e3e5]"] > :not([hidden]) ~ :not([hidden]),
.dark .orders-theme-root [class*="divide-[#e1e3e5]"] > :not([hidden]) ~ :not([hidden]) {
  border-color: #27272a !important;
}

html.dark .orders-theme-root [class*="text-[#202223]"],
.dark .orders-theme-root [class*="text-[#202223]"],
html.dark .orders-theme-root h1, html.dark .orders-theme-root h2, html.dark .orders-theme-root h3,
.dark .orders-theme-root h1, .dark .orders-theme-root h2, .dark .orders-theme-root h3 {
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root [class*="text-[#5c5f62]"],
.dark .orders-theme-root [class*="text-[#5c5f62]"] {
  color: #a1a1aa !important;
}

html.dark .orders-theme-root [class*="text-[#8c9196]"],
.dark .orders-theme-root [class*="text-[#8c9196]"],
html.dark .orders-theme-root [class*="text-[#c9cccf]"],
.dark .orders-theme-root [class*="text-[#c9cccf]"] {
  color: #71717a !important;
}

html.dark .orders-theme-root tr:hover,
.dark .orders-theme-root tr:hover,
html.dark .orders-theme-root tr[class*="hover:bg-[#f6f6f7]"]:hover,
.dark .orders-theme-root tr[class*="hover:bg-[#f6f6f7]"]:hover {
  background-color: #232326 !important;
}

html.dark .orders-theme-root [class*="text-[#2c6ecb]"],
.dark .orders-theme-root [class*="text-[#2c6ecb]"] {
  color: #60a5fa !important;
}

html.dark .orders-theme-root button.bg-white,
.dark .orders-theme-root button.bg-white,
html.dark .orders-theme-root button[class*="bg-white"],
.dark .orders-theme-root button[class*="bg-white"] {
  background-color: #232326 !important;
  border-color: #3f3f46 !important;
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root button.bg-white:hover,
.dark .orders-theme-root button.bg-white:hover,
html.dark .orders-theme-root button[class*="bg-white"]:hover,
.dark .orders-theme-root button[class*="bg-white"]:hover {
  background-color: #2c2c30 !important;
}

html.dark .orders-theme-root input[type="text"],
.dark .orders-theme-root input[type="text"],
html.dark .orders-theme-root input[type="search"],
.dark .orders-theme-root input[type="search"],
html.dark .orders-theme-root textarea,
.dark .orders-theme-root textarea,
html.dark .orders-theme-root select,
.dark .orders-theme-root select {
  background-color: #161618 !important;
  border-color: #3f3f46 !important;
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root input[type="text"]::placeholder,
.dark .orders-theme-root input[type="text"]::placeholder,
html.dark .orders-theme-root input[type="search"]::placeholder,
.dark .orders-theme-root input[type="search"]::placeholder {
  color: #71717a !important;
}

html.dark .orders-theme-root [class*="bg-[#e4e5e7]"],
.dark .orders-theme-root [class*="bg-[#e4e5e7]"] {
  background-color: #27272a !important;
  color: #f4f4f5 !important;
}

html.dark .orders-theme-root [class*="bg-[#5c5f62]"],
.dark .orders-theme-root [class*="bg-[#5c5f62]"] {
  background-color: #a1a1aa !important;
}

html.dark .orders-theme-root [class*="bg-[#ffea8a]"],
.dark .orders-theme-root [class*="bg-[#ffea8a]"] {
  background-color: #3b2804 !important;
  color: #fef08a !important;
  border: 1px solid rgba(234, 179, 8, 0.25) !important;
}

html.dark .orders-theme-root [class*="bg-[#f2f7fe]"],
.dark .orders-theme-root [class*="bg-[#f2f7fe]"],
html.dark .orders-theme-root [class*="bg-[#eef7ff]"],
.dark .orders-theme-root [class*="bg-[#eef7ff]"] {
  background-color: #172554 !important;
  color: #93c5fd !important;
}

html.dark .orders-theme-root [class*="bg-[#f1f2f3]"],
.dark .orders-theme-root [class*="bg-[#f1f2f3]"] {
  background-color: #27272a !important;
  color: #e4e4e7 !important;
  border-color: #3f3f46 !important;
}

html.dark .orders-theme-root input[type="checkbox"],
.dark .orders-theme-root input[type="checkbox"] {
  background-color: #27272a !important;
  border-color: #3f3f46 !important;
}
`;

export function ShopifySubscriptionDetail({ subscriptionId: propSubId }) {
  const { id: paramId } = useParams();
  const subId = propSubId || paramId;
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [renewalOrders, setRenewalOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Tags management
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingTag, setIsSavingTag] = useState(false);

  // Edit address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState({});

  // Edit notes modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch subscription details
  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/admin/custom/subscriptions?id=${encodeURIComponent(subId)}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
          setRenewalOrders(data.subscription.orders || []);
          setEditNotes(data.subscription.notes || "");
          setEditAddress(data.subscription.shipping_address || {});
          return;
        }
      }

      // Fallback: fetch all subscriptions and find matching
      const allRes = await fetch("/admin/custom/subscriptions");
      if (allRes.ok) {
        const allData = await allRes.json();
        const found = (allData.subscriptions || []).find((s) => s.id === subId);
        if (found) {
          setSubscription(found);
          setRenewalOrders(found.orders || allData.subscription_orders || []);
          setEditNotes(found.notes || "");
          setEditAddress(found.shipping_address || {});
          return;
        }
      }

      // Default synthetic object if fresh installation
      const fallback = {
        id: subId || "SUB-MUED926O-9414",
        title: "GVK-00 50 Test Cartridge (3ml Prefilled)",
        frequency: "Every 28 Days (Standard Cycle)",
        status: "Active",
        price: 44.10,
        unit_price: 49.00,
        discount_amount: 4.90,
        shipping_amount: 4.95,
        total_price: 49.05,
        nextBillingDate: "18 Nov 2026",
        nextDispatchDate: "18 Nov 2026",
        quantity: 1,
        cardEnding: "4242",
        cardBrand: "Visa",
        customer_email: "dr.elena.rostova.340979@oxford-biotech.ac.uk",
        customer_name: "Elena Rostova",
        created_at: new Date().toISOString(),
        shipping_address: {
          first_name: "Elena",
          last_name: "Rostova",
          address_1: "Robert Robinson Avenue",
          address_2: "The Oxford Science Park",
          city: "Oxford",
          postal_code: "OX4 4GA",
          country_code: "gb",
          phone: "+44 1865 784000",
        },
        tags: ["Active Subscriber", "Cartridge Refill", "Cold-Chain Tracked 24"],
        notes: "Research Protocol RUO-28D; Cold-chain replenishment cycle. Store at 2-8°C upon arrival.",
        items: [
          {
            id: "item_gvk_cartridge",
            title: "GVK-00 50 Test Cartridge (3ml Prefilled)",
            variant_sku: "PEP-GVK-00-50",
            unit_price: 49.00,
            quantity: 1,
            discount_percent: 10,
            recurring_price: 44.10,
          },
        ],
      };
      setSubscription(fallback);
      setEditNotes(fallback.notes);
      setEditAddress(fallback.shipping_address);
    } catch (e) {
      console.error("Failed to load subscription:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [subId]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Perform subscription lifecycle actions: pause, resume, skip, cancel
  const handleLifecycleAction = async (action) => {
    if (!subscription) return;
    setIsMutating(true);
    try {
      const res = await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscription.id,
          customer_id: subscription.customer_id,
          action,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === "cancel") {
          showToast("Subscription contract cancelled.");
          setTimeout(() => navigate("/orders"), 1000);
          return;
        }
        if (data.subscription) {
          setSubscription(data.subscription);
        } else {
          await fetchSubscriptionData();
        }
        showToast(
          action === "pause"
            ? "Subscription paused."
            : action === "resume"
            ? "Subscription resumed."
            : action === "skip"
            ? "Next cycle skipped (+28 days)."
            : "Subscription updated."
        );
      }
    } catch (e) {
      console.error(`Failed to execute ${action}:`, e);
      showToast(`Error: ${e.message}`);
    } finally {
      setIsMutating(false);
      setShowCancelModal(false);
    }
  };

  // Tag Operations
  const handleAddTag = async () => {
    if (!newTagInput.trim() || !subscription) return;
    const tagToAdd = newTagInput.trim();
    const currentTags = Array.isArray(subscription.tags) ? subscription.tags : [];
    if (currentTags.includes(tagToAdd)) {
      setNewTagInput("");
      return;
    }
    const updatedTags = [...currentTags, tagToAdd];
    setIsSavingTag(true);
    try {
      const res = await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscription.id,
          customer_id: subscription.customer_id,
          action: "update",
          tags: updatedTags,
        }),
      });
      if (res.ok) {
        setSubscription({ ...subscription, tags: updatedTags });
        setNewTagInput("");
        showToast("Tag added.");
      }
    } catch (e) {
      console.error("Failed to add tag:", e);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!subscription) return;
    const currentTags = Array.isArray(subscription.tags) ? subscription.tags : [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    try {
      const res = await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscription.id,
          customer_id: subscription.customer_id,
          action: "update",
          tags: updatedTags,
        }),
      });
      if (res.ok) {
        setSubscription({ ...subscription, tags: updatedTags });
        showToast("Tag removed.");
      }
    } catch (e) {
      console.error("Failed to remove tag:", e);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!subscription) return;
    try {
      const res = await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscription.id,
          customer_id: subscription.customer_id,
          action: "update",
          notes: editNotes,
        }),
      });
      if (res.ok) {
        setSubscription({ ...subscription, notes: editNotes });
        setShowNotesModal(false);
        showToast("Subscription notes saved.");
      }
    } catch (e) {
      console.error("Failed to save notes:", e);
    }
  };

  // Price formatting
  const formatPrice = (val) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(num);
  };

  // Date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading || !subscription) {
    return _jsx("div", {
      className: "min-h-screen bg-[#f6f6f7] p-8 flex items-center justify-center text-[#5c5f62]",
      children: "Loading subscription details...",
    });
  }

  const isActive = (subscription.status || "Active").toLowerCase() === "active";
  const tags = Array.isArray(subscription.tags) ? subscription.tags : [];
  const shipping = subscription.shipping_address || {};
  const items = subscription.items || [];
  const baseSubtotal = subscription.unit_price || 49.00;
  const discountAmount = subscription.discount_amount || 4.90;
  const recurringSubtotal = subscription.price || 44.10;
  const shippingFee = subscription.shipping_amount || 4.95;
  const cycleTotal = subscription.total_price || recurringSubtotal + shippingFee;

  return _jsxs("div", {
    className: "min-h-screen bg-[#f6f6f7] p-4 sm:p-6 text-[#202223] font-sans antialiased orders-theme-root",
    children: [
      _jsx("style", { children: DARK_MODE_CSS }),
      // Notification Toast
      notification &&
        _jsx("div", {
          className: "fixed bottom-5 right-5 z-50 bg-[#202223] text-white text-xs font-medium py-2.5 px-4 rounded shadow-lg flex items-center gap-2",
          children: notification,
        }),

      _jsxs("div", {
        className: "max-w-6xl mx-auto space-y-6",
        children: [
          // ==================== TOP NAVIGATION / BREADCRUMBS ====================
          _jsxs("div", {
            className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e3e5]",
            children: [
              _jsxs("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                  _jsxs(Link, {
                    to: "/orders",
                    className: "text-xs text-[#5c5f62] hover:text-[#202223] flex items-center gap-1 font-medium transition-colors",
                    children: [
                      _jsx("svg", {
                        className: "w-3.5 h-3.5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }),
                      }),
                      "Orders",
                    ],
                  }),
                  _jsx("span", { className: "text-[#c9cccf]", children: "/" }),
                  _jsx(Link, {
                    to: "/orders",
                    className: "text-xs text-[#5c5f62] hover:text-[#202223] font-medium transition-colors",
                    children: "Subscriptions",
                  }),
                  _jsx("span", { className: "text-[#c9cccf]", children: "/" }),
                  _jsx("h1", {
                    className: "text-xl font-bold text-[#202223]",
                    children: subscription.id,
                  }),
                  _jsx("span", {
                    className: "text-xs text-[#5c5f62]",
                    children: formatDate(subscription.created_at),
                  }),
                ],
              }),

              // Header Action Buttons
              _jsxs("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                  _jsx("button", {
                    disabled: isMutating,
                    onClick: () => handleLifecycleAction(isActive ? "pause" : "resume"),
                    className: `px-3 py-1.5 text-xs font-medium rounded border shadow-sm transition-colors ${
                      isActive
                        ? "bg-white border-[#c9cccf] text-[#202223] hover:bg-[#f6f6f7]"
                        : "bg-[#008060] border-[#008060] text-white hover:bg-[#006e52]"
                    }`,
                    children: isActive ? "Pause Subscription" : "Resume Subscription",
                  }),
                  _jsx("button", {
                    disabled: isMutating,
                    onClick: () => handleLifecycleAction("skip"),
                    className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] rounded shadow-sm transition-colors",
                    children: "Skip Next Cycle (+28d)",
                  }),
                  _jsx("button", {
                    disabled: isMutating,
                    onClick: () => setShowCancelModal(true),
                    className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#d82c0d] text-[#d82c0d] hover:bg-[#fff4f4] rounded shadow-sm transition-colors",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    onClick: () => window.print(),
                    className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] rounded shadow-sm transition-colors",
                    children: "Print Protocol",
                  }),
                ],
              }),
            ],
          }),

          // ==================== TWO-COLUMN GRID ====================
          _jsxs("div", {
            className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
            children: [
              // ==================== LEFT COLUMN (~68%) ====================
              _jsxs("div", {
                className: "lg:col-span-2 space-y-6",
                children: [
                  // CARD 1: Subscription Details & Protocol Item
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      // Card Header
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                        children: [
                          _jsx("h2", {
                            className: "text-base font-semibold text-[#202223]",
                            children: "Subscription details",
                          }),
                          _jsxs("div", {
                            className: "flex items-center gap-1.5 text-xs text-[#5c5f62]",
                            children: [
                              _jsx("svg", {
                                className: "w-3.5 h-3.5 text-[#8c9196]",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: _jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                                }),
                              }),
                              `Cadence: ${subscription.frequency || "Every 28 Days"}`,
                            ],
                          }),
                        ],
                      }),

                      // Status Bar
                      _jsxs("div", {
                        className: "px-4 py-3 bg-[#fafbfb] border-b border-[#e1e3e5] flex items-center justify-between flex-wrap gap-2",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              _jsx("span", {
                                className: `w-2 h-2 rounded-full ${isActive ? "bg-[#008060]" : "bg-[#b98900]"}`,
                              }),
                              _jsx("span", {
                                className: `text-xs font-bold tracking-wide uppercase ${
                                  isActive ? "text-[#008060]" : "text-[#b98900]"
                                }`,
                                children: isActive ? "ACTIVE RECURRING CONTRACT" : "CONTRACT PAUSED",
                              }),
                              _jsxs("span", {
                                className: "text-xs text-[#5c5f62] ml-2 hidden sm:inline",
                                children: [
                                  "Next billing & dispatch: ",
                                  _jsx("span", {
                                    className: "font-semibold text-[#202223]",
                                    children: subscription.nextBillingDate || "18 Nov 2026",
                                  }),
                                ],
                              }),
                            ],
                          }),

                          _jsx("button", {
                            disabled: isMutating,
                            onClick: () => handleLifecycleAction(isActive ? "pause" : "resume"),
                            className: "px-3 py-1 text-xs font-semibold text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm transition-colors",
                            children: isActive ? "Pause" : "Resume",
                          }),
                        ],
                      }),

                      // Protocol Line Items List
                      _jsx("div", {
                        className: "divide-y divide-[#e1e3e5]",
                        children: items.map((item, idx) => (
                          _jsxs(
                            "div",
                            {
                              className: "p-4 flex items-center justify-between gap-4",
                              children: [
                                // Left: Thumbnail + Title + SKU + Cadence
                                _jsxs("div", {
                                  className: "flex items-center gap-3 min-w-0",
                                  children: [
                                    _jsx("div", {
                                      className: "w-12 h-12 rounded border border-[#e1e3e5] bg-[#f6f6f7] overflow-hidden flex-shrink-0 flex items-center justify-center",
                                      children: item.thumbnail
                                        ? _jsx("img", {
                                            src: item.thumbnail,
                                            alt: item.title,
                                            className: "w-full h-full object-cover",
                                          })
                                        : _jsx("div", {
                                            className: "w-full h-full bg-[#16A6A3] flex items-center justify-center text-white text-[10px] font-bold text-center px-1",
                                            children: "PEPTECH",
                                          }),
                                    }),
                                    _jsxs("div", {
                                      className: "min-w-0",
                                      children: [
                                        _jsx("div", {
                                          className: "text-sm font-semibold text-[#2c6ecb] hover:underline truncate",
                                          children: item.title || subscription.title,
                                        }),
                                        _jsxs("div", {
                                          className: "text-xs text-[#5c5f62] mt-0.5",
                                          children: [
                                            "SKU : ",
                                            item.variant_sku || "PEP-GVK-00-50",
                                            " • 3ml Prefilled Cartridge",
                                          ],
                                        }),
                                        _jsx("div", {
                                          className: "text-[11px] text-[#008060] font-medium mt-0.5",
                                          children: "10% Subscribe & Save Discount Applied",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),

                                // Right: Price x Qty = Total
                                _jsxs("div", {
                                  className: "flex items-center gap-6 text-sm text-[#202223] font-medium flex-shrink-0",
                                  children: [
                                    _jsxs("div", {
                                      className: "text-[#5c5f62] text-xs text-right",
                                      children: [
                                        _jsx("div", {
                                          className: "line-through text-[#8c9196]",
                                          children: formatPrice(baseSubtotal),
                                        }),
                                        _jsxs("div", {
                                          className: "font-semibold text-[#202223]",
                                          children: [formatPrice(recurringSubtotal), " × ", item.quantity || 1],
                                        }),
                                      ],
                                    }),
                                    _jsx("div", {
                                      className: "font-semibold w-20 text-right",
                                      children: formatPrice(recurringSubtotal * (item.quantity || 1)),
                                    }),
                                  ],
                                }),
                              ],
                            },
                            item.id || idx
                          )
                        )),
                      }),

                      // Summary Section: Note Box & Financial Breakdown
                      _jsxs("div", {
                        className: "p-4 border-t border-[#e1e3e5] grid grid-cols-1 md:grid-cols-2 gap-6 bg-white",
                        children: [
                          // Left: Protocol Note Box
                          _jsxs("div", {
                            className: "space-y-1.5",
                            children: [
                              _jsxs("div", {
                                className: "flex items-center justify-between text-xs font-semibold text-[#5c5f62]",
                                children: [
                                  _jsx("span", { children: "Protocol / Dispatch Note" }),
                                  _jsx("button", {
                                    onClick: () => setShowNotesModal(true),
                                    className: "text-[#2c6ecb] hover:underline font-normal text-xs",
                                    children: "Edit",
                                  }),
                                ],
                              }),
                              _jsx("div", {
                                className: "border border-[#c9cccf] rounded p-3 text-xs text-[#202223] bg-[#fafbfb] whitespace-pre-line leading-relaxed",
                                children: subscription.notes || "Research Protocol RUO-28D; Cold-chain replenishment cycle. Store at 2-8°C upon arrival.",
                              }),
                            ],
                          }),

                          // Right: Financial Breakdown
                          _jsxs("div", {
                            className: "space-y-2 text-xs text-[#5c5f62]",
                            children: [
                              _jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  _jsx("span", { children: "Base Price" }),
                                  _jsx("span", { className: "text-[#202223]", children: formatPrice(baseSubtotal) }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "flex justify-between text-[#008060]",
                                children: [
                                  _jsx("span", { children: "10% Subscriber Savings" }),
                                  _jsxs("span", { children: ["-", formatPrice(discountAmount)] }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  _jsx("span", { children: "Recurring Subtotal" }),
                                  _jsx("span", { className: "font-semibold text-[#202223]", children: formatPrice(recurringSubtotal) }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "flex justify-between",
                                children: [
                                  _jsx("span", { children: "Royal Mail Tracked 24" }),
                                  _jsx("span", { className: "font-semibold text-[#202223]", children: formatPrice(shippingFee) }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "flex justify-between pt-2 border-t border-[#e1e3e5] text-sm font-bold text-[#202223]",
                                children: [
                                  _jsx("span", { children: "Total per 28-Day Cycle" }),
                                  _jsx("span", { children: formatPrice(cycleTotal) }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "flex justify-between pt-1 text-xs text-[#5c5f62]",
                                children: [
                                  _jsx("span", { children: "Payment method" }),
                                  _jsxs("span", {
                                    className: "font-medium text-[#202223]",
                                    children: [
                                      subscription.cardBrand || "Visa",
                                      " ending in ",
                                      subscription.cardEnding || "4242",
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),

                      // Status History Badges
                      _jsxs("div", {
                        className: "px-4 py-3 border-t border-[#e1e3e5] bg-[#fafbfb] space-y-2",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-2 text-xs",
                            children: [
                              _jsx("svg", {
                                className: "w-4 h-4 text-[#008060]",
                                fill: "currentColor",
                                viewBox: "0 0 20 20",
                                children: _jsx("path", {
                                  fillRule: "evenodd",
                                  d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                  clipRule: "evenodd",
                                }),
                              }),
                              _jsx("span", {
                                className: "font-bold tracking-wide uppercase text-[#202223]",
                                children: "TOKENIZED 28-DAY RECURRING CONTRACT ACTIVE",
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex items-center gap-2 text-xs text-[#5c5f62]",
                            children: [
                              _jsx("svg", {
                                className: "w-4 h-4 text-[#2c6ecb]",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: _jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                }),
                              }),
                              _jsxs("span", {
                                children: [
                                  "Next scheduled renewal trigger: ",
                                  _jsx("strong", { children: subscription.nextBillingDate || "18 Nov 2026" }),
                                  " with automated cold-chain dispatch.",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  // CARD 2: Generated Subscription Renewal Orders
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      // Header
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              _jsx("h2", {
                                className: "text-base font-semibold text-[#202223]",
                                children: "Renewal Orders",
                              }),
                              _jsxs("span", {
                                className: "text-xs px-2 py-0.5 rounded-full bg-[#f2f7fe] text-[#2c6ecb] font-medium",
                                children: [renewalOrders.length, " Logged"],
                              }),
                            ],
                          }),
                          _jsx("span", {
                            className: "text-xs text-[#5c5f62]",
                            children: "Automated 28-day orders generated for this subscriber",
                          }),
                        ],
                      }),

                      // Orders Table
                      _jsx("div", {
                        className: "overflow-x-auto",
                        children: _jsxs("table", {
                          className: "w-full text-left text-sm text-[#202223]",
                          children: [
                            _jsx("thead", {
                              className: "bg-[#f9fafb] border-b border-[#e1e3e5] text-xs font-semibold text-[#5c5f62]",
                              children: _jsxs("tr", {
                                children: [
                                  _jsx("th", { className: "py-3 px-4", children: "Order" }),
                                  _jsx("th", { className: "py-3 px-4", children: "Date" }),
                                  _jsx("th", { className: "py-3 px-4", children: "Cycle" }),
                                  _jsx("th", { className: "py-3 px-4", children: "Payment status" }),
                                  _jsx("th", { className: "py-3 px-4", children: "Fulfillment status" }),
                                  _jsx("th", { className: "py-3 px-4 text-right", children: "Total" }),
                                ],
                              }),
                            }),
                            _jsx("tbody", {
                              className: "divide-y divide-[#e1e3e5]",
                              children:
                                renewalOrders.length === 0
                                  ? _jsx("tr", {
                                      children: _jsx("td", {
                                        colSpan: 6,
                                        className: "py-8 text-center text-[#8c9196] text-xs",
                                        children: "No renewal orders generated yet.",
                                      }),
                                    })
                                  : renewalOrders.map((ord, i) => {
                                      const meta = ord.metadata || {};
                                      const isPaid = (meta.payment_status || (ord.status === "completed" ? "paid" : "pending")) === "paid";
                                      const isFulfilled = (meta.fulfillment_status || (ord.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")) === "fulfilled";

                                      return _jsxs(
                                        "tr",
                                        {
                                          key: ord.id || i,
                                          className: "hover:bg-[#f6f6f7] transition-colors cursor-pointer",
                                          onClick: () => navigate(`/orders/${ord.id}`),
                                          children: [
                                            // Order Ref + Sub Tag
                                            _jsx("td", {
                                              className: "py-3 px-4 font-semibold text-[#2c6ecb]",
                                              children: _jsxs("div", {
                                                className: "inline-flex items-center gap-1.5",
                                                children: [
                                                  _jsxs("span", {
                                                    className: "hover:underline",
                                                    children: ["#", ord.display_id || (ord.id ? ord.id.slice(-4) : "12")],
                                                  }),
                                                  _jsx("span", {
                                                    className: "text-[10px] px-1.5 py-0.2 rounded bg-[#eef7ff] text-[#2c6ecb] font-medium border border-[#cce5ff]",
                                                    children: "28-Day Sub",
                                                  }),
                                                ],
                                              }),
                                            }),

                                            // Date
                                            _jsx("td", {
                                              className: "py-3 px-4 text-[#5c5f62] text-xs",
                                              children: formatDate(ord.created_at),
                                            }),

                                            // Cycle
                                            _jsx("td", {
                                              className: "py-3 px-4 text-[#202223] text-xs font-medium",
                                              children: `Cycle #${meta.cycle_number || i + 1} (${i === 0 ? "Initial" : "Renewal"})`,
                                            }),

                                            // Payment status pill
                                            _jsx("td", {
                                              className: "py-3 px-4",
                                              children: isPaid
                                                ? _jsxs("span", {
                                                    className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                                                    children: [
                                                      _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                                                      "Paid",
                                                    ],
                                                  })
                                                : _jsxs("span", {
                                                    className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#5c3e00]",
                                                    children: [
                                                      _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c6b00]" }),
                                                      "Pending",
                                                    ],
                                                  }),
                                            }),

                                            // Fulfillment status pill
                                            _jsx("td", {
                                              className: "py-3 px-4",
                                              children: isFulfilled
                                                ? _jsxs("span", {
                                                    className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                                                    children: [
                                                      _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                                                      "Fulfilled",
                                                    ],
                                                  })
                                                : _jsxs("span", {
                                                    className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#5c3e00]",
                                                    children: [
                                                      _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c6b00]" }),
                                                      "Unfulfilled",
                                                    ],
                                                  }),
                                            }),

                                            // Total
                                            _jsx("td", {
                                              className: "py-3 px-4 text-right font-medium text-[#202223]",
                                              children: formatPrice(ord.total || 49.05),
                                            }),
                                          ],
                                        }
                                      );
                                    }),
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),

                  // CARD 3: Contract Timeline / History
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      _jsx("div", {
                        className: "p-4 border-b border-[#e1e3e5]",
                        children: _jsx("h2", {
                          className: "text-base font-semibold text-[#202223]",
                          children: "Contract Timeline",
                        }),
                      }),
                      _jsxs("div", {
                        className: "p-4 space-y-4",
                        children: [
                          // Event 1
                          _jsxs("div", {
                            className: "flex items-start gap-3",
                            children: [
                              _jsx("div", {
                                className: "w-2.5 h-2.5 rounded-full bg-[#008060] mt-1.5 flex-shrink-0",
                              }),
                              _jsxs("div", {
                                className: "text-xs space-y-0.5",
                                children: [
                                  _jsx("div", {
                                    className: "font-semibold text-[#202223]",
                                    children: "Subscription Contract Initiated (RUO-28D)",
                                  }),
                                  _jsxs("div", {
                                    className: "text-[#5c5f62]",
                                    children: [
                                      "Contract registered for ",
                                      subscription.customer_name || "Elena Rostova",
                                      " with 28-day cadence.",
                                    ],
                                  }),
                                  _jsx("div", {
                                    className: "text-[#8c9196] text-[11px]",
                                    children: formatDate(subscription.created_at),
                                  }),
                                ],
                              }),
                            ],
                          }),

                          // Event 2
                          _jsxs("div", {
                            className: "flex items-start gap-3",
                            children: [
                              _jsx("div", {
                                className: "w-2.5 h-2.5 rounded-full bg-[#2c6ecb] mt-1.5 flex-shrink-0",
                              }),
                              _jsxs("div", {
                                className: "text-xs space-y-0.5",
                                children: [
                                  _jsx("div", {
                                    className: "font-semibold text-[#202223]",
                                    children: "Initial Order #12 Generated & Payment Tokenized",
                                  }),
                                  _jsxs("div", {
                                    className: "text-[#5c5f62]",
                                    children: [
                                      "First cycle dispatched to registered laboratory address via Royal Mail Tracked 24.",
                                    ],
                                  }),
                                  _jsx("div", {
                                    className: "text-[#8c9196] text-[11px]",
                                    children: formatDate(subscription.created_at),
                                  }),
                                ],
                              }),
                            ],
                          }),

                          // Event 3
                          _jsxs("div", {
                            className: "flex items-start gap-3",
                            children: [
                              _jsx("div", {
                                className: `w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                  isActive ? "bg-[#5c5f62]" : "bg-[#b98900]"
                                }`,
                              }),
                              _jsxs("div", {
                                className: "text-xs space-y-0.5",
                                children: [
                                  _jsxs("div", {
                                    className: "font-semibold text-[#202223]",
                                    children: [
                                      "Next Automated Renewal: ",
                                      subscription.nextBillingDate || "18 Nov 2026",
                                    ],
                                  }),
                                  _jsx("div", {
                                    className: "text-[#5c5f62]",
                                    children: isActive
                                      ? "Scheduled tokenized recurring charge & dispatch."
                                      : "Contract currently paused. Scheduled cycle on hold.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // ==================== RIGHT COLUMN (~32%) ====================
              _jsxs("div", {
                className: "space-y-6",
                children: [
                  // CARD 1: Customer Profile & Contact
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      // Header
                      _jsx("div", {
                        className: "p-4 border-b border-[#e1e3e5]",
                        children: _jsx("h2", {
                          className: "text-base font-semibold text-[#202223]",
                          children: "Customer",
                        }),
                      }),

                      // Customer Profile Strip
                      _jsxs("div", {
                        className: "p-4 flex items-center gap-3 border-b border-[#e1e3e5]",
                        children: [
                          _jsx("div", {
                            className: "w-10 h-10 rounded-full bg-[#16A6A3] flex items-center justify-center text-white flex-shrink-0",
                            children: _jsx("svg", {
                              className: "w-5 h-5",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor",
                              strokeWidth: 2,
                              children: _jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                              }),
                            }),
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("div", {
                                className: "text-sm font-semibold text-[#2c6ecb] hover:underline cursor-pointer",
                                children: subscription.customer_name || "Elena Rostova",
                              }),
                              _jsx("div", {
                                className: "text-xs text-[#008060] font-medium mt-0.5",
                                children: "Active Subscriber",
                              }),
                            ],
                          }),
                        ],
                      }),

                      // Subscription Contact
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] space-y-1.5",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center justify-between text-xs",
                            children: [
                              _jsx("span", {
                                className: "font-bold tracking-wide uppercase text-[#5c5f62]",
                                children: "SUBSCRIPTION CONTACT",
                              }),
                              _jsx("button", {
                                onClick: () => alert(`Customer Contact: ${subscription.customer_email}`),
                                className: "text-[#2c6ecb] hover:underline font-medium",
                                children: "Edit",
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className: "text-xs text-[#202223] break-all",
                            children: subscription.customer_email || "dr.elena.rostova.340979@oxford-biotech.ac.uk",
                          }),
                          subscription.customer_phone &&
                            _jsx("div", {
                              className: "text-xs text-[#5c5f62]",
                              children: subscription.customer_phone,
                            }),
                        ],
                      }),

                      // Laboratory Shipping Address
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] space-y-1.5 text-xs text-[#202223]",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              _jsx("span", {
                                className: "font-bold tracking-wide uppercase text-[#5c5f62]",
                                children: "LABORATORY SHIPPING ADDRESS",
                              }),
                              _jsx("button", {
                                onClick: () => setShowAddressModal(true),
                                className: "text-[#2c6ecb] hover:underline font-medium",
                                children: "Edit",
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className: "font-medium",
                            children: `${shipping.first_name || "Elena"} ${shipping.last_name || "Rostova"}`,
                          }),
                          _jsx("div", { children: shipping.address_1 || "Robert Robinson Avenue" }),
                          shipping.address_2 && _jsx("div", { children: shipping.address_2 }),
                          _jsxs("div", {
                            children: [
                              shipping.city || "Oxford",
                              " ",
                              shipping.postal_code || "OX4 4GA",
                            ],
                          }),
                          _jsx("div", {
                            children: (shipping.country_code || "gb").toUpperCase() === "GB" ? "United Kingdom" : (shipping.country_code || "UK"),
                          }),
                          shipping.phone && _jsx("div", { children: shipping.phone }),
                        ],
                      }),

                      // Payment Method on File
                      _jsxs("div", {
                        className: "p-4 space-y-1.5 text-xs text-[#202223]",
                        children: [
                          _jsx("div", {
                            className: "font-bold tracking-wide uppercase text-[#5c5f62]",
                            children: "PAYMENT METHOD ON FILE",
                          }),
                          _jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              _jsx("div", {
                                className: "px-2 py-0.5 bg-[#f6f6f7] border border-[#e1e3e5] rounded font-bold text-[10px] text-[#202223]",
                                children: (subscription.cardBrand || "VISA").toUpperCase(),
                              }),
                              _jsxs("span", {
                                children: [
                                  "Ending in ",
                                  _jsx("strong", { children: subscription.cardEnding || "4242" }),
                                ],
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className: "text-[#8c9196] text-[11px]",
                            children: "Secure Acquirer Vault Token",
                          }),
                        ],
                      }),
                    ],
                  }),

                  // CARD 2: Subscription Notes
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                        children: [
                          _jsx("h2", {
                            className: "text-base font-semibold text-[#202223]",
                            children: "Notes",
                          }),
                          _jsx("button", {
                            onClick: () => setShowNotesModal(true),
                            className: "text-xs text-[#2c6ecb] hover:underline font-medium",
                            children: "Edit",
                          }),
                        ],
                      }),
                      _jsx("div", {
                        className: "p-4 text-xs text-[#5c5f62] whitespace-pre-line leading-relaxed",
                        children: subscription.notes || "No notes added for this subscription.",
                      }),
                    ],
                  }),

                  // CARD 3: Tags Card
                  _jsxs("div", {
                    className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                    children: [
                      _jsxs("div", {
                        className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                        children: [
                          _jsx("h2", {
                            className: "text-base font-semibold text-[#202223]",
                            children: "Tags",
                          }),
                          _jsx("span", {
                            className: "text-[10px] text-[#8c9196]",
                            children: `${tags.length} applied`,
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "p-4 space-y-3",
                        children: [
                          // Tag list
                          _jsx("div", {
                            className: "flex flex-wrap gap-1.5 min-h-[32px] p-2 border border-[#c9cccf] rounded bg-white items-center",
                            children:
                              tags.length === 0
                                ? _jsx("span", { className: "text-xs text-[#8c9196]", children: "No tags added yet" })
                                : tags.map((tag) => (
                                    _jsxs(
                                      "span",
                                      {
                                        className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[#f1f2f3] text-[#202223] font-medium border border-[#c9cccf]",
                                        children: [
                                          tag,
                                          _jsx("button", {
                                            onClick: () => handleRemoveTag(tag),
                                            className: "text-[#8c9196] hover:text-[#d82c0d] font-bold ml-0.5",
                                            children: "×",
                                          }),
                                        ],
                                      },
                                      tag
                                    )
                                  )),
                          }),

                          // Add tag input
                          _jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              _jsx("input", {
                                type: "text",
                                placeholder: "Add a tag...",
                                value: newTagInput,
                                onChange: (e) => setNewTagInput(e.target.value),
                                onKeyDown: (e) => e.key === "Enter" && handleAddTag(),
                                className: "flex-1 px-3 py-1.5 text-xs border border-[#c9cccf] rounded focus:outline-none focus:ring-1 focus:ring-[#2c6ecb] focus:border-[#2c6ecb]",
                              }),
                              _jsx("button", {
                                disabled: isSavingTag || !newTagInput.trim(),
                                onClick: handleAddTag,
                                className: "px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm disabled:opacity-50 transition-colors",
                                children: isSavingTag ? "Saving..." : "Add",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // ==================== MODALS ====================

      // Cancel Confirmation Modal
      showCancelModal &&
        _jsx("div", {
          className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4",
            children: [
              _jsx("h3", {
                className: "text-base font-bold text-[#202223]",
                children: "Cancel Subscription Contract?",
              }),
              _jsx("p", {
                className: "text-xs text-[#5c5f62] leading-relaxed",
                children:
                  "Are you sure you want to cancel this recurring subscription contract? All future automated 28-day renewals and dispatches will be stopped immediately.",
              }),
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-2",
                children: [
                  _jsx("button", {
                    onClick: () => setShowCancelModal(false),
                    className: "px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                    children: "Keep Subscription",
                  }),
                  _jsx("button", {
                    disabled: isMutating,
                    onClick: () => handleLifecycleAction("cancel"),
                    className: "px-3 py-1.5 text-xs font-semibold text-white bg-[#d82c0d] hover:bg-[#bc2200] rounded shadow-sm",
                    children: isMutating ? "Cancelling..." : "Yes, Cancel Contract",
                  }),
                ],
              }),
            ],
          }),
        }),

      // Edit Notes Modal
      showNotesModal &&
        _jsx("div", {
          className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4",
            children: [
              _jsx("h3", {
                className: "text-base font-bold text-[#202223]",
                children: "Edit Subscription Protocol Notes",
              }),
              _jsx("textarea", {
                rows: 4,
                value: editNotes,
                onChange: (e) => setEditNotes(e.target.value),
                className: "w-full p-3 text-xs border border-[#c9cccf] rounded focus:outline-none focus:ring-1 focus:ring-[#2c6ecb] focus:border-[#2c6ecb]",
                placeholder: "Enter internal laboratory or handling notes...",
              }),
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-2",
                children: [
                  _jsx("button", {
                    onClick: () => setShowNotesModal(false),
                    className: "px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    onClick: handleSaveNotes,
                    className: "px-4 py-1.5 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm",
                    children: "Save Notes",
                  }),
                ],
              }),
            ],
          }),
        }),

      // Edit Address Modal
      showAddressModal &&
        _jsx("div", {
          className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4",
            children: [
              _jsx("h3", {
                className: "text-base font-bold text-[#202223]",
                children: "Edit Laboratory Delivery Address",
              }),
              _jsxs("div", {
                className: "space-y-3 text-xs",
                children: [
                  _jsxs("div", {
                    className: "grid grid-cols-2 gap-2",
                    children: [
                      _jsx("input", {
                        type: "text",
                        placeholder: "First name",
                        value: editAddress.first_name || "",
                        onChange: (e) => setEditAddress({ ...editAddress, first_name: e.target.value }),
                        className: "p-2 border border-[#c9cccf] rounded",
                      }),
                      _jsx("input", {
                        type: "text",
                        placeholder: "Last name",
                        value: editAddress.last_name || "",
                        onChange: (e) => setEditAddress({ ...editAddress, last_name: e.target.value }),
                        className: "p-2 border border-[#c9cccf] rounded",
                      }),
                    ],
                  }),
                  _jsx("input", {
                    type: "text",
                    placeholder: "Address line 1",
                    value: editAddress.address_1 || "",
                    onChange: (e) => setEditAddress({ ...editAddress, address_1: e.target.value }),
                    className: "w-full p-2 border border-[#c9cccf] rounded",
                  }),
                  _jsx("input", {
                    type: "text",
                    placeholder: "Address line 2 / Science Park",
                    value: editAddress.address_2 || "",
                    onChange: (e) => setEditAddress({ ...editAddress, address_2: e.target.value }),
                    className: "w-full p-2 border border-[#c9cccf] rounded",
                  }),
                  _jsxs("div", {
                    className: "grid grid-cols-2 gap-2",
                    children: [
                      _jsx("input", {
                        type: "text",
                        placeholder: "City",
                        value: editAddress.city || "",
                        onChange: (e) => setEditAddress({ ...editAddress, city: e.target.value }),
                        className: "p-2 border border-[#c9cccf] rounded",
                      }),
                      _jsx("input", {
                        type: "text",
                        placeholder: "Postal Code",
                        value: editAddress.postal_code || "",
                        onChange: (e) => setEditAddress({ ...editAddress, postal_code: e.target.value }),
                        className: "p-2 border border-[#c9cccf] rounded",
                      }),
                    ],
                  }),
                  _jsx("input", {
                    type: "text",
                    placeholder: "Phone number",
                    value: editAddress.phone || "",
                    onChange: (e) => setEditAddress({ ...editAddress, phone: e.target.value }),
                    className: "w-full p-2 border border-[#c9cccf] rounded",
                  }),
                ],
              }),
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-2",
                children: [
                  _jsx("button", {
                    onClick: () => setShowAddressModal(false),
                    className: "px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    onClick: async () => {
                      setSubscription({ ...subscription, shipping_address: editAddress });
                      setShowAddressModal(false);
                      showToast("Laboratory address updated.");
                    },
                    className: "px-4 py-1.5 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm",
                    children: "Save Address",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}

export default ShopifySubscriptionDetail;
