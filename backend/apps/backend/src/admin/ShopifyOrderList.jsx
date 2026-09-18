import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useOrders } from "./chunk-CHQR6GOM.mjs";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

export function OrderList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab: 'all' | 'open' | 'unfulfilled' | 'unpaid'
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterFulfillment, setFilterFulfillment] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Fetch orders
  const { orders = [], count = 0, isLoading, refetch } = useOrders({
    limit: 50,
    fields: "id,display_id,created_at,email,total,currency_code,status,metadata,shipping_address,items,fulfillments",
  });

  // Filter logic
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const meta = order.metadata || {};
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      const paymentStatus = (meta.payment_status || (order.status === "completed" ? "paid" : "pending")).toLowerCase();
      const fulfillmentStatus = (meta.fulfillment_status || (order.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")).toLowerCase();

      // Tab filter
      if (activeTab === "open" && order.status === "completed") return false;
      if (activeTab === "unfulfilled" && fulfillmentStatus === "fulfilled") return false;
      if (activeTab === "unpaid" && paymentStatus === "paid") return false;

      // Dropdown filters
      if (filterPayment !== "all" && paymentStatus !== filterPayment) return false;
      if (filterFulfillment !== "all" && fulfillmentStatus !== filterFulfillment) return false;

      // Search query (matches #display_id, customer name, email, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayId = String(order.display_id || "").toLowerCase();
        const name = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.toLowerCase();
        const email = (order.email || "").toLowerCase();
        const tagsStr = tags.join(" ").toLowerCase();
        const matches = displayId.includes(q) || name.includes(q) || email.includes(q) || tagsStr.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery, filterPayment, filterFulfillment]);

  // Tab counts
  const counts = useMemo(() => {
    const all = orders.length;
    const open = orders.filter((o) => o.status !== "completed").length;
    const unfulfilled = orders.filter((o) => (o.metadata?.fulfillment_status || (o.fulfillments?.length > 0 ? "fulfilled" : "unfulfilled")) !== "fulfilled").length;
    const unpaid = orders.filter((o) => (o.metadata?.payment_status || "pending") !== "paid").length;
    return { all, open, unfulfilled, unpaid };
  }, [orders]);

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

  // Format Date (e.g. Apr 4, 5:48pm CEST)
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
  const formatPrice = (amount, currency = "USD") => {
    const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
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
          // Shopify Tabs Bar
          _jsx("div", {
            className: "flex border-b border-[#e1e3e5] px-4 pt-1 gap-6 text-sm font-medium",
            children: [
              { key: "all", label: "All Orders" },
              { key: "open", label: "Open" },
              { key: "unfulfilled", label: "Unfulfilled" },
              { key: "unpaid", label: "Unpaid" },
            ].map((tab) =>
              _jsx(
                "button",
                {
                  key: tab.key,
                  onClick: () => setActiveTab(tab.key),
                  className: `pb-3 pt-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? "text-[#2c6ecb] font-semibold"
                      : "text-[#5c5f62] hover:text-[#202223]"
                  }`,
                  children: [
                    tab.label,
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

          // Filter & Search Toolbar (Matching user's red box!)
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

              // Search input with magnifying glass
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
                    placeholder: "Search orders by #, customer, or tag (e.g. Walmart)...",
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
                      _jsx("th", { className: "py-3 px-4", children: "Order" }),
                      _jsx("th", { className: "py-3 px-4", children: "Date ▾" }),
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
                          const customerName = order.shipping_address
                            ? `${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}`.trim()
                            : order.email || "Guest Customer";
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
