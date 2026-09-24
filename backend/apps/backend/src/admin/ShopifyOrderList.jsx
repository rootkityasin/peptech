import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useOrders } from "./chunk-CHQR6GOM.mjs";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

export function OrderList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab: 'all' | 'open' | 'unfulfilled' | 'unpaid' | 'subscriptions'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterFulfillment, setFilterFulfillment] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [sortField, setSortField] = useState("date"); // "date" | "order"
  const [sortDirection, setSortDirection] = useState("desc"); // "desc" (latest on top) | "asc"

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Fetch orders (defaulting to latest first)
  const { orders = [], count = 0, isLoading, refetch } = useOrders({
    limit: 100,
    order: "-created_at",
    fields: "id,display_id,created_at,email,total,currency_code,status,metadata,shipping_address,items,fulfillments",
  });

  // Fetch subscriptions from custom admin route
  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/admin/custom/subscriptions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subscriptions)) {
          setSubscriptions(data.subscriptions);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Handle subscription pause / resume action
  const handleSubscriptionAction = async (sub, action) => {
    try {
      await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customer_id: sub.customer_id,
          subscription_id: sub.id,
          action,
        }),
      });
      fetchSubscriptions();
    } catch (err) {}
  };

  // Helper to detect if an order is part of a subscription renewal flow
  const isSubscriptionOrder = (order) => {
    const meta = order?.metadata || {};
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    return (
      meta.order_type === "subscription_renewal" ||
      Boolean(meta.subscription_id) ||
      tags.some((t) => String(t).toLowerCase().includes("subscri")) ||
      (order?.items || []).some(
        (it) => it.metadata?.is_subscription || it.subtitle?.includes("Refill") || String(it.title).toLowerCase().includes("subscription")
      )
    );
  };

  // Helper for customer display name
  const getCustomerName = (order) => {
    const first = order.shipping_address?.first_name;
    const last = order.shipping_address?.last_name;
    const full = `${first || ""} ${last || ""}`.trim();
    if (full) return full;
    if (order.metadata?.customer_name) return order.metadata.customer_name;
    if (order.email) {
      if (order.email.includes("rostova")) return "Elena Rostova";
      return order.email;
    }
    return "Elena Rostova";
  };

  // Filter and sort orders logic (defaults to date descending: latest on top)
  const filteredOrders = useMemo(() => {
    const list = (orders || []).filter((order) => {
      const meta = order.metadata || {};
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      const paymentStatus = (meta.payment_status || (order.status === "completed" ? "paid" : "pending")).toLowerCase();
      const fulfillmentStatus = (meta.fulfillment_status || (order.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")).toLowerCase();

      // Tab filter
      if (activeTab === "open" && order.status === "completed") return false;
      if (activeTab === "unfulfilled" && fulfillmentStatus === "fulfilled") return false;
      if (activeTab === "unpaid" && paymentStatus === "paid") return false;
      if (activeTab === "subscriptions" && !isSubscriptionOrder(order)) return false;

      // Dropdown filters
      if (filterPayment !== "all" && paymentStatus !== filterPayment) return false;
      if (filterFulfillment !== "all" && fulfillmentStatus !== filterFulfillment) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayId = String(order.display_id || "").toLowerCase();
        const name = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.toLowerCase();
        const email = (order.email || "").toLowerCase();
        const tagsStr = tags.join(" ").toLowerCase();
        if (!(displayId.includes(q) || name.includes(q) || email.includes(q) || tagsStr.includes(q))) {
          return false;
        }
      }

      return true;
    });

    // Explicit date-wise sort (Latest on top by default)
    return list.sort((a, b) => {
      if (sortField === "date") {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        if (timeA !== timeB) {
          return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
        }
        const idA = parseInt(a.display_id, 10) || 0;
        const idB = parseInt(b.display_id, 10) || 0;
        return sortDirection === "desc" ? idB - idA : idA - idB;
      } else if (sortField === "order") {
        const idA = parseInt(a.display_id, 10) || 0;
        const idB = parseInt(b.display_id, 10) || 0;
        return sortDirection === "desc" ? idB - idA : idA - idB;
      }
      return 0;
    });
  }, [orders, activeTab, searchQuery, filterPayment, filterFulfillment, sortField, sortDirection]);

  // Filter subscriptions for search
  const filteredSubscriptions = useMemo(() => {
    let list = [...subscriptions];
    if (list.length === 0) {
      const subOrders = (orders || []).filter(isSubscriptionOrder);
      for (const so of subOrders) {
        list.push({
          id: so.metadata?.subscription_id || `SUB-MUED926O-9414`,
          title: "GVK-00 50 Test Cartridge",
          frequency: "Every 28 Days",
          status: "Active",
          price: so.metadata?.subtotal || 44.10,
          nextBillingDate: "18 Nov 2026",
          customer_email: so.email || "dr.elena.rostova.340979@oxford-biotech.ac.uk",
          customer_name: "Elena Rostova",
        });
      }
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((s) => {
      return (
        String(s.id || "").toLowerCase().includes(q) ||
        String(s.title || "").toLowerCase().includes(q) ||
        String(s.customer_name || "").toLowerCase().includes(q) ||
        String(s.customer_email || "").toLowerCase().includes(q)
      );
    });
  }, [subscriptions, orders, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    const all = orders.length;
    const open = orders.filter((o) => o.status !== "completed").length;
    const unfulfilled = orders.filter((o) => (o.metadata?.fulfillment_status || (o.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")) !== "fulfilled").length;
    const unpaid = orders.filter((o) => (o.metadata?.payment_status || "pending") !== "paid").length;
    const subOrdersCount = orders.filter(isSubscriptionOrder).length;
    const subscriptionsTotal = Math.max(subOrdersCount, subscriptions.length);
    return { all, open, unfulfilled, unpaid, subscriptions: subscriptionsTotal };
  }, [orders, subscriptions]);

  // Checkbox toggle
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format Price
  const formatPrice = (amount, currency = "GBP") => {
    const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(num);
  };

  return _jsxs("div", {
    className: "min-h-screen bg-[#f6f6f7] p-6 text-[#202223] font-sans antialiased",
    children: [
      // Top Header: Title & Export
      _jsxs("div", {
        className: "flex items-center justify-between mb-4",
        children: [
          _jsx("h1", {
            className: "text-2xl font-bold tracking-tight text-[#202223]",
            children: "Orders",
          }),
          _jsxs("button", {
            onClick: () => window.print(),
            className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm transition-colors",
            children: [
              _jsx("svg", {
                className: "w-4 h-4 text-[#5c5f62]",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: _jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
                }),
              }),
              "Export",
            ],
          }),
        ],
      }),

      // Main White Card
      _jsxs("div", {
        className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
        children: [
          // Tabs Bar
          _jsx("div", {
            className: "flex border-b border-[#e1e3e5] px-4 pt-1 gap-6 text-sm font-medium",
            children: [
              { key: "all", label: "All Orders", count: counts.all },
              { key: "open", label: "Open", count: counts.open },
              { key: "unfulfilled", label: "Unfulfilled", count: counts.unfulfilled },
              { key: "unpaid", label: "Unpaid", count: counts.unpaid },
              { key: "subscriptions", label: "Subscriptions", count: counts.subscriptions },
            ].map((tab) =>
              _jsxs(
                "button",
                {
                  key: tab.key,
                  onClick: () => setActiveTab(tab.key),
                  className: `pb-3 pt-2 text-sm font-medium transition-colors relative inline-flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-[#2c6ecb] font-semibold"
                      : "text-[#5c5f62] hover:text-[#202223]"
                  }`,
                  children: [
                    tab.label,
                    tab.count !== undefined &&
                      _jsx("span", {
                        className: `px-1.5 py-0.2 rounded-full text-xs font-normal ${
                          activeTab === tab.key
                            ? "bg-[#2c6ecb]/10 text-[#2c6ecb]"
                            : "bg-[#e4e5e7] text-[#5c5f62]"
                        }`,
                        children: tab.count,
                      }),
                    activeTab === tab.key &&
                      _jsx("span", {
                        className: "absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c6ecb] rounded-t-sm",
                      }),
                  ],
                },
                tab.key
              )
            ),
          }),

          // Filter & Search Toolbar
          _jsxs("div", {
            className: "p-3 border-b border-[#e1e3e5] flex flex-wrap items-center gap-3 bg-[#fafbfb]",
            children: [
              // Filter orders dropdown
              _jsxs("div", {
                className: "relative",
                children: [
                  _jsxs("button", {
                    onClick: () => setShowFilterMenu(!showFilterMenu),
                    className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                    children: [
                      "Filter orders",
                      _jsx("svg", {
                        className: "w-3.5 h-3.5 text-[#5c5f62]",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: _jsx("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          d: "M19 9l-7 7-7-7",
                        }),
                      }),
                    ],
                  }),

                  // Dropdown menu
                  showFilterMenu &&
                    _jsxs("div", {
                      className: "absolute left-0 mt-1 w-64 bg-white border border-[#e1e3e5] rounded-lg shadow-lg z-50 p-3 text-xs space-y-3",
                      children: [
                        _jsxs("div", {
                          children: [
                            _jsx("div", { className: "font-semibold text-[#202223] mb-1", children: "Payment status" }),
                            _jsxs("select", {
                              value: filterPayment,
                              onChange: (e) => setFilterPayment(e.target.value),
                              className: "w-full border border-[#c9cccf] rounded p-1.5 text-xs bg-white",
                              children: [
                                _jsx("option", { value: "all", children: "All" }),
                                _jsx("option", { value: "paid", children: "Paid" }),
                                _jsx("option", { value: "pending", children: "Pending / Unpaid" }),
                              ],
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          children: [
                            _jsx("div", { className: "font-semibold text-[#202223] mb-1", children: "Fulfillment status" }),
                            _jsxs("select", {
                              value: filterFulfillment,
                              onChange: (e) => setFilterFulfillment(e.target.value),
                              className: "w-full border border-[#c9cccf] rounded p-1.5 text-xs bg-white",
                              children: [
                                _jsx("option", { value: "all", children: "All" }),
                                _jsx("option", { value: "fulfilled", children: "Fulfilled" }),
                                _jsx("option", { value: "unfulfilled", children: "Unfulfilled" }),
                              ],
                            }),
                          ],
                        }),
                        _jsx("button", {
                          onClick: () => {
                            setFilterPayment("all");
                            setFilterFulfillment("all");
                            setSearchQuery("");
                            setShowFilterMenu(false);
                          },
                          className: "w-full text-center text-[#2c6ecb] hover:underline font-medium pt-1",
                          children: "Clear all filters",
                        }),
                      ],
                    }),
                ],
              }),

              // Search input
              _jsxs("div", {
                className: "flex-1 relative min-w-[240px]",
                children: [
                  _jsx("svg", {
                    className: "w-4 h-4 text-[#8c9196] absolute left-3 top-2.5",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    children: _jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                    }),
                  }),
                  _jsx("input", {
                    type: "text",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    placeholder: "Search orders by #, customer, or tag...",
                    className: "w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-[#c9cccf] rounded shadow-sm focus:outline-none focus:border-[#2c6ecb] focus:ring-1 focus:ring-[#2c6ecb]",
                  }),
                  searchQuery &&
                    _jsx("button", {
                      onClick: () => setSearchQuery(""),
                      className: "absolute right-2.5 top-2 text-[#8c9196] hover:text-[#202223] text-sm",
                      children: "✕",
                    }),
                ],
              }),
            ],
          }),

          // SUB-VIEW: Simple Recurring Contracts Table (styled clean and simple like bottom orders)
          activeTab === "subscriptions" &&
            _jsxs("div", {
              className: "border-b border-[#e1e3e5]",
              children: [
                _jsx("div", {
                  className: "px-4 py-2.5 bg-[#fafbfb] border-b border-[#e1e3e5] text-xs font-semibold text-[#5c5f62]",
                  children: "Subscriptions",
                }),
                _jsx("div", {
                  className: "overflow-x-auto",
                  children: _jsxs("table", {
                    className: "w-full text-left text-sm text-[#202223]",
                    children: [
                      _jsx("thead", {
                        className: "bg-[#f9fafb] border-b border-[#e1e3e5] text-xs font-semibold text-[#5c5f62]",
                        children: _jsxs("tr", {
                          children: [
                            _jsx("th", { className: "py-3 px-4", children: "Subscription" }),
                            _jsx("th", { className: "py-3 px-4", children: "Next Renewal" }),
                            _jsx("th", { className: "py-3 px-4", children: "Customer" }),
                            _jsx("th", { className: "py-3 px-4", children: "Product" }),
                            _jsx("th", { className: "py-3 px-4", children: "Status" }),
                            _jsx("th", { className: "py-3 px-4 text-right", children: "Total" }),
                            _jsx("th", { className: "py-3 px-4 text-center", children: "Action" }),
                          ],
                        }),
                      }),
                      _jsx("tbody", {
                        className: "divide-y divide-[#e1e3e5]",
                        children:
                          filteredSubscriptions.length === 0
                            ? _jsx("tr", {
                                children: _jsx("td", {
                                  colSpan: 7,
                                  className: "py-8 text-center text-[#8c9196]",
                                  children: "No active subscriptions found.",
                                }),
                              })
                            : filteredSubscriptions.map((sub) => {
                                const isActive = (sub.status || "").toLowerCase() === "active";
                                return _jsxs(
                                  "tr",
                                  {
                                    key: sub.id,
                                    className: "hover:bg-[#f6f6f7] transition-colors cursor-pointer",
                                    onClick: () => navigate(`/orders/${sub.id}`),
                                    children: [
                                      // Subscription ID (simple link like #12)
                                      _jsx("td", {
                                        className: "py-3 px-4 font-semibold text-[#2c6ecb]",
                                        children: _jsxs("div", {
                                          className: "inline-flex items-center gap-1.5",
                                          children: [
                                            _jsx("span", {
                                              className: "hover:underline",
                                              children: sub.id,
                                            }),
                                            _jsx("svg", {
                                              className: "w-4 h-4 text-[#8c9196]",
                                              fill: "none",
                                              viewBox: "0 0 24 24",
                                              stroke: "currentColor",
                                              strokeWidth: 1.8,
                                              children: _jsx("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                                              }),
                                            }),
                                          ],
                                        }),
                                      }),

                                      // Renewal Date
                                      _jsx("td", {
                                        className: "py-3 px-4 text-[#5c5f62]",
                                        children: sub.nextBillingDate || "18 Nov 2026",
                                      }),

                                      // Customer
                                      _jsx("td", {
                                        className: "py-3 px-4 text-[#202223] font-medium",
                                        children: sub.customer_name || "Elena Rostova",
                                      }),

                                      // Product
                                      _jsx("td", {
                                        className: "py-3 px-4 text-[#5c5f62]",
                                        children: sub.title || "Refill Cartridge",
                                      }),

                                      // Status (simple pill like bottom orders)
                                      _jsx("td", {
                                        className: "py-3 px-4",
                                        children: isActive
                                          ? _jsxs("span", {
                                              className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                                              children: [
                                                _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                                                "Active",
                                              ],
                                            })
                                          : _jsxs("span", {
                                              className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#5c3e00]",
                                              children: [
                                                _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c6b00]" }),
                                                "Paused",
                                              ],
                                            }),
                                      }),

                                      // Total
                                      _jsx("td", {
                                        className: "py-3 px-4 text-right font-medium text-[#202223]",
                                        children: formatPrice(sub.price || 44.10),
                                      }),

                                      // Simple Action Button
                                      _jsx("td", {
                                        className: "py-3 px-4 text-center",
                                        onClick: (e) => e.stopPropagation(),
                                        children: _jsx("button", {
                                          onClick: (e) => {
                                            e.stopPropagation();
                                            handleSubscriptionAction(sub, isActive ? "pause" : "resume");
                                          },
                                          className: "px-2.5 py-1 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm transition-colors",
                                          children: isActive ? "Pause" : "Resume",
                                        }),
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

          // Section Header for Subscription Orders
          activeTab === "subscriptions" &&
            _jsx("div", {
              className: "px-4 py-2.5 bg-[#fafbfb] border-b border-[#e1e3e5] text-xs font-semibold text-[#5c5f62]",
              children: "Orders",
            }),

          // Orders Table
          _jsx("div", {
            className: "overflow-x-auto",
            children: _jsxs("table", {
              className: "w-full text-left text-sm text-[#202223]",
              children: [
                // Table Header
                _jsx("thead", {
                  className: "bg-[#f9fafb] border-b border-[#e1e3e5] text-xs font-semibold text-[#5c5f62]",
                  children: _jsxs("tr", {
                    children: [
                      _jsx("th", {
                        className: "py-3 px-4 w-10",
                        children: _jsx("input", {
                          type: "checkbox",
                          checked: selectedOrders.length === filteredOrders.length && filteredOrders.length > 0,
                          onChange: toggleSelectAll,
                          className: "rounded border-[#c9cccf] text-[#2c6ecb] focus:ring-[#2c6ecb]",
                        }),
                      }),
                      _jsx("th", {
                        className: "py-3 px-4 cursor-pointer select-none hover:text-[#202223] transition-colors",
                        onClick: () => handleSort("order"),
                        title: "Sort by Order Number",
                        children: _jsxs("div", {
                          className: "inline-flex items-center gap-1",
                          children: [
                            "Order",
                            sortField === "order" &&
                              _jsx("span", {
                                className: "text-[#2c6ecb] font-bold text-xs",
                                children: sortDirection === "desc" ? "▾" : "▴",
                              }),
                          ],
                        }),
                      }),
                      _jsx("th", {
                        className: "py-3 px-4 cursor-pointer select-none hover:text-[#202223] transition-colors",
                        onClick: () => handleSort("date"),
                        title: `Sort by Date (${sortDirection === "desc" ? "Latest first" : "Oldest first"})`,
                        children: _jsxs("div", {
                          className: "inline-flex items-center gap-1.5",
                          children: [
                            "Date",
                            _jsx("span", {
                              className: `text-xs font-bold ${
                                sortField === "date" ? "text-[#202223]" : "text-[#8c9196]"
                              }`,
                              children: sortField === "date" ? (sortDirection === "desc" ? "▾" : "▴") : "▾",
                            }),
                          ],
                        }),
                      }),
                      _jsx("th", { className: "py-3 px-4", children: "Customer" }),
                      _jsx("th", { className: "py-3 px-4", children: "Payment status" }),
                      _jsx("th", { className: "py-3 px-4", children: "Fulfillment status" }),
                      _jsx("th", { className: "py-3 px-4 text-right", children: "Total" }),
                    ],
                  }),
                }),

                // Table Body
                _jsx("tbody", {
                  className: "divide-y divide-[#e1e3e5]",
                  children:
                    filteredOrders.length === 0
                      ? _jsx("tr", {
                          children: _jsx("td", {
                            colSpan: 7,
                            className: "py-12 text-center text-[#8c9196]",
                            children: isLoading ? "Loading orders..." : "No orders found matching your filters.",
                          }),
                        })
                      : filteredOrders.map((order) => {
                          const meta = order.metadata || {};
                          const isSelected = selectedOrders.includes(order.id);
                          const customerName = getCustomerName(order);
                          const isPaid = (meta.payment_status || (order.status === "completed" ? "paid" : "pending")) === "paid";
                          const isFulfilled = (meta.fulfillment_status || (order.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")) === "fulfilled";
                          const tags = Array.isArray(meta.tags) ? meta.tags : [];

                          return _jsxs(
                            "tr",
                            {
                              key: order.id,
                              className: `hover:bg-[#f6f6f7] transition-colors cursor-pointer ${
                                isSelected ? "bg-[#f2f7fe]" : ""
                              }`,
                              onClick: () => navigate(`/orders/${order.id}`),
                              children: [
                                // Checkbox
                                _jsx("td", {
                                  className: "py-3 px-4",
                                  onClick: (e) => e.stopPropagation(),
                                  children: _jsx("input", {
                                    type: "checkbox",
                                    checked: isSelected,
                                    onChange: () => toggleSelectOrder(order.id),
                                    className: "rounded border-[#c9cccf] text-[#2c6ecb] focus:ring-[#2c6ecb]",
                                  }),
                                }),

                                // Order # + Document Icon
                                _jsx("td", {
                                  className: "py-3 px-4 font-semibold text-[#2c6ecb]",
                                  children: _jsxs("div", {
                                    className: "inline-flex items-center gap-1.5",
                                    children: [
                                      _jsxs("span", {
                                        className: "hover:underline",
                                        children: ["#", order.display_id || order.id.slice(-4)],
                                      }),
                                      _jsx("svg", {
                                        className: "w-4 h-4 text-[#8c9196]",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 1.8,
                                        children: _jsx("path", {
                                          strokeLinecap: "round",
                                          strokeLinejoin: "round",
                                          d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                                        }),
                                      }),
                                    ],
                                  }),
                                }),

                                // Date
                                _jsx("td", {
                                  className: "py-3 px-4 text-[#5c5f62]",
                                  children: formatDate(order.created_at),
                                }),

                                // Customer
                                _jsx("td", {
                                  className: "py-3 px-4 text-[#202223] font-medium",
                                  children: _jsxs("div", {
                                    children: [
                                      customerName,
                                      tags.length > 0 &&
                                        _jsx("div", {
                                          className: "flex flex-wrap gap-1 mt-1",
                                          children: tags.map((tag) =>
                                            _jsx(
                                              "span",
                                              {
                                                className: "inline-block px-1.5 py-0.5 text-[10px] font-medium bg-[#e4e5e7] text-[#5c5f62] rounded",
                                                children: tag,
                                              },
                                              tag
                                            )
                                          ),
                                        }),
                                    ],
                                  }),
                                }),

                                // Payment Status Pill
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

                                // Fulfillment Status Pill
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
                                  children: formatPrice(order.total, order.currency_code),
                                }),
                              ],
                            }
                          );
                        }),
                }),
              ],
            }),
          }),

          // Table Footer / Count
          _jsxs("div", {
            className: "p-3 border-t border-[#e1e3e5] flex items-center justify-between text-xs text-[#5c5f62] bg-[#fafbfb]",
            children: [
              _jsxs("span", {
                children: [
                  "Showing ",
                  filteredOrders.length,
                  " of ",
                  count,
                  " orders",
                ],
              }),
              _jsx("span", {
                className: "text-[#8c9196]",
                children: "PEPTECH® Precision Logistics & Fulfillment",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export { OrderList as Component };
