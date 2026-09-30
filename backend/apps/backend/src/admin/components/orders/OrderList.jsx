import { useState, useMemo, useEffect } from "react";
import "../../styles/custom.css";
import { Link, useNavigate } from "react-router-dom";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useOrders } from "../../lib/order-queries";
import { paymentStatus as getPaymentStatus, fulfillmentStatus as getFulfillmentStatus, customerName as getCustomerName, isSubscriptionOrder, statusLabel } from "../../lib/order-data";

export function OrderList() {
  const navigate = useNavigate();

  // Active tab: 'all' | 'open' | 'unfulfilled' | 'unpaid' | 'subscriptions' | 'returns'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterFulfillment, setFilterFulfillment] = useState("all");
  const [filterReturn, setFilterReturn] = useState("all");
  const [filterPromotion, setFilterPromotion] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortField, setSortField] = useState("date"); // "date" | "order"
  const [sortDirection, setSortDirection] = useState("desc"); // "desc" | "asc"

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Fetch orders (latest first)
  const { orders: effectiveOrders, isLoading, error, refetch } = useOrders();

  // Filter and sort orders logic
  const filteredOrders = useMemo(() => {
    const list = (effectiveOrders || []).filter((order) => {
      const meta = order.metadata || {};
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      const paymentStatus = getPaymentStatus(order);
      const fulfillmentStatus = getFulfillmentStatus(order);
      const returns = Array.isArray(meta.returns) ? meta.returns : [];
      const returnStatus = meta.return_status || (returns.some((r) => r.status === "open") ? "return_requested" : returns.some((r) => r.status === "received") ? "returned" : null);

      // Tab filter
      if (activeTab === "open" && order.status === "completed") return false;
      if (activeTab === "unfulfilled" && !["not_fulfilled", "partially_fulfilled"].includes(fulfillmentStatus)) return false;
      if (activeTab === "unpaid" && !["not_paid", "awaiting", "authorized", "partially_authorized", "partially_captured"].includes(paymentStatus)) return false;
      if (activeTab === "subscriptions" && !isSubscriptionOrder(order)) return false;
      if (activeTab === "returns" && !returnStatus && returns.length === 0) return false;

      // Dropdown filters
      if (filterPayment !== "all" && paymentStatus !== filterPayment) return false;
      if (filterFulfillment !== "all" && fulfillmentStatus !== (filterFulfillment === "unfulfilled" ? "not_fulfilled" : filterFulfillment)) return false;
      if (filterReturn !== "all") {
        if (filterReturn === "return_requested" && returnStatus !== "return_requested") return false;
        if (filterReturn === "returned" && returnStatus !== "returned") return false;
        if (filterReturn === "none" && returnStatus) return false;
      }
      if (filterPromotion !== "all") {
        const hasSub28 = meta.promotion?.code === "SUB28-10";
        if (filterPromotion === "SUB28-10" && !hasSub28) return false;
        if (filterPromotion === "none" && hasSub28) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayId = String(order.display_id || "").toLowerCase();
        const name = getCustomerName(order).toLowerCase();
        const email = (order.email || "").toLowerCase();
        const tagsStr = tags.join(" ").toLowerCase();
        if (!(displayId.includes(q) || name.includes(q) || email.includes(q) || tagsStr.includes(q))) {
          return false;
        }
      }

      return true;
    });

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
  }, [effectiveOrders, activeTab, searchQuery, filterPayment, filterFulfillment, filterReturn, filterPromotion, sortField, sortDirection]);

  // Tab counts
  const counts = useMemo(() => {
    const all = effectiveOrders.length;
    const open = effectiveOrders.filter((o) => o.status !== "completed").length;
    const unfulfilled = effectiveOrders.filter((o) => ["not_fulfilled", "partially_fulfilled"].includes(getFulfillmentStatus(o))).length;
    const unpaid = effectiveOrders.filter((o) => ["not_paid", "awaiting", "authorized", "partially_authorized", "partially_captured"].includes(getPaymentStatus(o))).length;
    const subOrdersCount = effectiveOrders.filter(isSubscriptionOrder).length;
    const subscriptionsTotal = subOrdersCount;
    const returnsCount = effectiveOrders.filter((o) => {
      const meta = o.metadata || {};
      const rets = Array.isArray(meta.returns) ? meta.returns : [];
      return meta.return_status || rets.length > 0;
    }).length;
    return { all, open, unfulfilled, unpaid, subscriptions: subscriptionsTotal, returns: returnsCount };
  }, [effectiveOrders]);

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

  // Format Date (e.g. "Sep 29, 11:00 PM")
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
    const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0)) || 0;
    if (currency.toUpperCase() === "USD") {
      return `US$${num.toFixed(2)}`;
    }
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(num);
  };

  return _jsxs("div", {
    className: "min-h-screen bg-[#f6f6f7] p-4 sm:p-6 text-[#202223] font-sans antialiased orders-theme-root",
    children: [
      error && _jsxs("div", { role: "alert", children: ["Unable to load orders: ", error.message, _jsx("button", { onClick: () => refetch(), children: "Retry" })] }),
      // Top Header: Title & Export
      _jsxs("div", {
        className: "flex items-center justify-between mb-5",
        children: [
          _jsx("h1", {
            className: "text-2xl font-bold tracking-tight text-[#202223]",
            children: "Orders",
          }),
          _jsxs("button", {
            onClick: () => window.print(),
            className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded-lg shadow-sm transition-colors cursor-pointer",
            children: [
              _jsx("svg", {
                className: "w-3.5 h-3.5 text-[#5c5f62]",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }),
              }),
              "Export",
            ],
          }),
        ],
      }),

      // Main Container
      _jsxs("div", {
        className: "bg-white rounded-xl border border-[#e1e3e5] shadow-xs overflow-hidden",
        children: [
          // Tabs Bar
          _jsx("div", {
            className: "flex border-b border-[#e1e3e5] px-5 pt-2 gap-7 text-xs font-medium overflow-x-auto bg-white",
            children: [
              { key: "all", label: "All Orders", count: counts.all },
              { key: "open", label: "Open", count: counts.open },
              { key: "unfulfilled", label: "Unfulfilled", count: counts.unfulfilled },
              { key: "unpaid", label: "Unpaid", count: counts.unpaid },
              { key: "subscriptions", label: "Subscriptions", count: counts.subscriptions },
              { key: "returns", label: "Returns", count: counts.returns },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return _jsxs(
                "button",
                {
                  onClick: () => setActiveTab(tab.key),
                  className: `pb-3 pt-1 text-xs font-medium transition-colors relative inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive ? "text-[#202223] font-semibold" : "text-[#5c5f62] hover:text-[#202223]"
                  }`,
                  children: [
                    tab.label,
                    tab.count !== undefined &&
                      _jsx("span", {
                        className: `px-1.5 py-0.5 rounded-full text-[11px] font-medium leading-none ${
                          isActive ? "bg-[#f1f2f3] text-[#202223] font-semibold" : "bg-[#f1f2f3] text-[#5c5f62]"
                        }`,
                        children: tab.count,
                      }),
                    isActive &&
                      _jsx("span", {
                        className: "absolute bottom-0 left-0 right-0 h-0.5 bg-[#202223] rounded-t-sm",
                      }),
                  ],
                },
                tab.key
              );
            }),
          }),

          // Filter & Search Toolbar
          _jsxs("div", {
            className: "p-3.5 border-b border-[#e1e3e5] flex flex-wrap items-center gap-3 bg-white",
            children: [
              // Filter orders dropdown
              _jsxs("div", {
                className: "relative",
                children: [
                  _jsxs("button", {
                    onClick: () => setShowFilterMenu(!showFilterMenu),
                    className: "inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded-lg shadow-xs cursor-pointer transition-colors",
                    children: [
                      "Filter orders",
                      _jsx("svg", {
                        className: "w-3 h-3 text-[#5c5f62]",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" }),
                      }),
                    ],
                  }),

                  // Dropdown Menu
                  showFilterMenu &&
                    _jsxs("div", {
                      className: "absolute left-0 mt-2 w-72 bg-white border border-[#e1e3e5] rounded-lg shadow-xl z-50 p-3.5 text-xs space-y-3",
                      children: [
                        _jsxs("div", {
                          children: [
                            _jsx("div", { className: "font-semibold text-[#202223] mb-1.5", children: "Payment status" }),
                            _jsxs("select", {
                              value: filterPayment,
                              onChange: (e) => setFilterPayment(e.target.value),
                              className: "w-full border border-[#c9cccf] rounded-md p-1.5 text-xs bg-white text-[#202223]",
                              children: [
                                _jsx("option", { value: "all", children: "All" }),
                                _jsx("option", { value: "paid", children: "Paid" }),
                                _jsx("option", { value: "pending", children: "Pending" }),
                                _jsx("option", { value: "refunded", children: "Refunded" }),
                              ],
                            }),
                          ],
                        }),

                        _jsxs("div", {
                          children: [
                            _jsx("div", { className: "font-semibold text-[#202223] mb-1.5", children: "Fulfillment status" }),
                            _jsxs("select", {
                              value: filterFulfillment,
                              onChange: (e) => setFilterFulfillment(e.target.value),
                              className: "w-full border border-[#c9cccf] rounded-md p-1.5 text-xs bg-white text-[#202223]",
                              children: [
                                _jsx("option", { value: "all", children: "All" }),
                                _jsx("option", { value: "unfulfilled", children: "Unfulfilled" }),
                                _jsx("option", { value: "fulfilled", children: "Fulfilled" }),
                              ],
                            }),
                          ],
                        }),

                        _jsxs("div", {
                          children: [
                            _jsx("div", { className: "font-semibold text-[#202223] mb-1.5", children: "Promotion" }),
                            _jsxs("select", {
                              value: filterPromotion,
                              onChange: (e) => setFilterPromotion(e.target.value),
                              className: "w-full border border-[#c9cccf] rounded-md p-1.5 text-xs bg-white text-[#202223]",
                              children: [
                                _jsx("option", { value: "all", children: "All" }),
                                _jsx("option", { value: "SUB28-10", children: "SUB28-10 (-10%)" }),
                                _jsx("option", { value: "none", children: "No promotion" }),
                              ],
                            }),
                          ],
                        }),

                        _jsx("button", {
                          onClick: () => {
                            setFilterPayment("all");
                            setFilterFulfillment("all");
                            setFilterReturn("all");
                            setFilterPromotion("all");
                            setSearchQuery("");
                            setShowFilterMenu(false);
                          },
                          className: "w-full text-center text-[#2c6ecb] hover:underline font-medium pt-1.5 border-t border-[#e1e3e5]",
                          children: "Clear all filters",
                        }),
                      ],
                    }),
                ],
              }),

              // Search input
              _jsxs("div", {
                className: "flex-1 relative min-w-[260px]",
                children: [
                  _jsx("svg", {
                    className: "w-3.5 h-3.5 text-[#8c9196] absolute left-3 top-3 pointer-events-none",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }),
                  }),
                  _jsx("input", {
                    type: "text",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    placeholder: "Search orders by #, customer, or tag...",
                    className: "w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#c9cccf] text-[#202223] placeholder-[#8c9196] rounded-lg shadow-2xs focus:outline-none focus:border-[#2c6ecb] transition-colors",
                  }),
                  searchQuery &&
                    _jsx("button", {
                      onClick: () => setSearchQuery(""),
                      className: "absolute right-2.5 top-2.5 text-[#8c9196] hover:text-[#202223] text-xs cursor-pointer",
                      children: "×",
                    }),
                ],
              }),
            ],
          }),

          // Orders Table
          _jsx("div", {
            className: "overflow-x-auto",
            children: _jsxs("table", {
              className: "w-full text-left text-xs text-[#202223]",
              children: [
                // Table Header
                _jsx("thead", {
                  className: "bg-[#fafbfb] border-b border-[#e1e3e5] text-[11px] font-semibold text-[#5c5f62]",
                  children: _jsxs("tr", {
                    children: [
                      _jsx("th", {
                        className: "py-3.5 px-4 w-10",
                        children: _jsx("input", {
                          type: "checkbox",
                          checked: selectedOrders.length === filteredOrders.length && filteredOrders.length > 0,
                          onChange: toggleSelectAll,
                          className: "w-3.5 h-3.5 rounded border-[#c9cccf] bg-white text-blue-600 cursor-pointer focus:ring-0",
                        }),
                      }),
                      _jsx("th", {
                        className: "py-3.5 px-4 cursor-pointer select-none hover:text-[#202223] transition-colors",
                        onClick: () => handleSort("order"),
                        title: "Sort by Order Number",
                        children: _jsxs("div", {
                          className: "inline-flex items-center gap-1 font-semibold",
                          children: [
                            "Order",
                            sortField === "order" &&
                              _jsx("span", {
                                className: "text-[#2c6ecb] font-bold text-[10px]",
                                children: sortDirection === "desc" ? "▾" : "▴",
                              }),
                          ],
                        }),
                      }),
                      _jsx("th", {
                        className: "py-3.5 px-4 cursor-pointer select-none hover:text-[#202223] transition-colors",
                        onClick: () => handleSort("date"),
                        title: `Sort by Date (${sortDirection === "desc" ? "Latest first" : "Oldest first"})`,
                        children: _jsxs("div", {
                          className: "inline-flex items-center gap-1 font-semibold",
                          children: [
                            "Date",
                            _jsx("span", {
                              className: "text-[#8c9196] font-bold text-[10px]",
                              children: sortField === "date" ? (sortDirection === "desc" ? "▾" : "▴") : "▾",
                            }),
                          ],
                        }),
                      }),
                      _jsx("th", { className: "py-3.5 px-4 font-semibold", children: "Customer" }),
                      _jsx("th", { className: "py-3.5 px-4 font-semibold", children: "Payment status" }),
                      _jsx("th", { className: "py-3.5 px-4 font-semibold", children: "Fulfillment status" }),
                      _jsx("th", { className: "py-3.5 px-4 font-semibold text-right", children: "Total" }),
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
                            className: "py-14 text-center text-[#5c5f62]",
                            children: isLoading ? "Loading orders..." : error ? "Orders could not be loaded." : "No orders found matching your filters.",
                          }),
                        })
                      : filteredOrders.map((order) => {
                          const meta = order.metadata || {};
                          const isSelected = selectedOrders.includes(order.id);
                          const customerName = getCustomerName(order);
                          const paymentStatus = getPaymentStatus(order);
                          const isRefunded = paymentStatus === "refunded";
                          const isPaid = paymentStatus === "paid";
                          const isFulfilled = ["fulfilled", "shipped", "delivered"].includes(getFulfillmentStatus(order));
                          const tags = Array.isArray(meta.tags) ? meta.tags : [];
                          const hasPromo = Boolean(meta.promotion?.code);

                          return _jsxs(
                            "tr",
                            {
                              className: `hover:bg-[#f6f6f7] transition-colors cursor-pointer ${
                                isSelected ? "bg-[#f2f7fe]" : ""
                              }`,
                              onClick: () => navigate(`/orders/${order.id}`),
                              children: [
                                // Checkbox
                                _jsx("td", {
                                  className: "py-3.5 px-4",
                                  onClick: (e) => e.stopPropagation(),
                                  children: _jsx("input", {
                                    type: "checkbox",
                                    checked: isSelected,
                                    onChange: () => toggleSelectOrder(order.id),
                                    className: "w-3.5 h-3.5 rounded border-[#c9cccf] bg-white text-blue-600 cursor-pointer focus:ring-0",
                                  }),
                                }),

                                // Order Number + Document Icon
                                _jsx("td", {
                                  className: "py-3.5 px-4 font-medium text-[#2c6ecb]",
                                  children: _jsxs("div", {
                                    className: "inline-flex items-center gap-1.5",
                                    children: [
                                      _jsxs("span", {
                                        className: "hover:underline",
                                        children: ["#", order.display_id || order.id.slice(-4)],
                                      }),
                                      _jsx("svg", {
                                        className: "w-3.5 h-3.5 text-[#8c9196]",
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
                                  className: "py-3.5 px-4 text-[#5c5f62] whitespace-nowrap",
                                  children: formatDate(order.created_at),
                                }),

                                // Customer + Sub-tags
                                _jsx("td", {
                                  className: "py-3.5 px-4 text-[#202223] font-medium",
                                  children: _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#202223] font-medium", children: customerName }),
                                      (tags.length > 0 || hasPromo) &&
                                        _jsxs("div", {
                                          className: "flex flex-wrap items-center gap-1.5 mt-1",
                                          children: [
                                            hasPromo &&
                                              _jsx("span", {
                                                className: "inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] rounded-md shadow-2xs",
                                                title: "Recorded order promotion",
                                                children: meta.promotion.code,
                                              }),
                                            tags.map((tag) =>
                                              _jsx(
                                                "span",
                                                {
                                                  className: "inline-block px-2 py-0.5 text-[11px] font-medium bg-[#f1f2f3] text-[#5c5f62] rounded-md",
                                                  children: tag,
                                                },
                                                tag
                                              )
                                            ),
                                          ],
                                        }),
                                    ],
                                  }),
                                }),

                                // Payment Status Pill
                                _jsx("td", {
                                  className: "py-3.5 px-4",
                                  children: isRefunded
                                    ? _jsxs("span", {
                                        className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#5c5f62]",
                                        children: [
                                          _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#8c9196]" }),
                                          "Refunded",
                                        ],
                                      })
                                    : isPaid
                                    ? _jsxs("span", {
                                        className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                                        children: [
                                          _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                                          "Paid",
                                        ],
                                      })
                                    : _jsxs("span", {
                                        className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#202223]",
                                        children: [
                                          _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c9196]" }),
                                          statusLabel(paymentStatus),
                                        ],
                                      }),
                                }),

                                // Fulfillment Status Pill
                                _jsx("td", {
                                  className: "py-3.5 px-4",
                                  children: isFulfilled
                                    ? _jsxs("span", {
                                        className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                                        children: [
                                          _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                                          statusLabel(getFulfillmentStatus(order)),
                                        ],
                                      })
                                    : _jsxs("span", {
                                        className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#202223]",
                                        children: [
                                          _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c9196]" }),
                                          statusLabel(getFulfillmentStatus(order)),
                                        ],
                                      }),
                                }),

                                // Total
                                _jsx("td", {
                                  className: "py-3.5 px-4 text-right font-medium text-[#202223] whitespace-nowrap",
                                  children: formatPrice(order.total, order.currency_code || "GBP"),
                                }),
                              ],
                            },
                            order.id
                          );
                        }),
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}

export { OrderList as Component };
export default OrderList;
