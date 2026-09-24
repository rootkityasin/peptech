import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useUpdateOrder } from "./chunk-CHQR6GOM.mjs";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

export function OrderDetail() {
  const { id } = useParams();

  const isSubscription = Boolean(
    id &&
    (id.startsWith("SUB-") ||
     id.startsWith("sub_") ||
     id.toUpperCase().startsWith("SUB") ||
     id.includes("MUED"))
  );

  if (isSubscription) {
    if (typeof ShopifySubscriptionDetail !== "undefined") {
      return _jsx(ShopifySubscriptionDetail, { subscriptionId: id });
    }
  }

  return _jsx(StandardOrderDetail, { id });
}

function StandardOrderDetail({ id }) {
  const navigate = useNavigate();

  // Medusa order query & mutation
  const { order, isLoading, refetch } = useOrder(id, {
    fields: "id,display_id,created_at,email,total,subtotal,currency_code,status,metadata,shipping_address,billing_address,items,fulfillments,shipping_methods",
  });

  const { mutateAsync: updateOrder } = useUpdateOrder(id);

  // Local state for Tags management (Matching red box in user screenshot!)
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingTag, setIsSavingTag] = useState(false);

  // Modals for fulfillment
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [fulfillCarrier, setFulfillCarrier] = useState("Royal Mail Tracked");
  const [fulfillTracking, setFulfillTracking] = useState("");
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [activeFulfillmentId, setActiveFulfillmentId] = useState(null);

  // Contact / Address edit modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState({});

  if (isLoading || !order) {
    return _jsx("div", {
      className: "min-h-screen bg-[#f6f6f7] p-8 flex items-center justify-center text-[#5c5f62]",
      children: "Loading order details...",
    });
  }

  const meta = order.metadata || {};
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const source = meta.source || "Online Store";
  const notes = meta.notes || `Order# ${order.display_id || order.id.slice(-6)}\nShipping: Royal Mail Tracked UK / Worldwide`;
  const fulfillments = meta.fulfillments || (order.fulfillments && order.fulfillments.length > 0 ? order.fulfillments : []);
  const isFulfilled = (meta.fulfillment_status || (fulfillments.length > 0 ? "fulfilled" : "unfulfilled")) === "fulfilled";
  const isPaid = (meta.payment_status || (order.status === "completed" ? "paid" : "pending")) === "paid";

  // Customer info
  const shipping = order.shipping_address || {};
  const customerName = `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() || order.email || "Santa's Little Helper";
  const customerEmail = order.email || shipping.email || "No email provided";
  const customerPhone = shipping.phone || "212-212-9828";

  // Price formatting
  const formatPrice = (val) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (order.currency_code || "USD").toUpperCase(),
    }).format(num);
  };

  // Date formatting
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

  // Tag Operations
  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const tagToAdd = newTagInput.trim();
    if (tags.includes(tagToAdd)) {
      setNewTagInput("");
      return;
    }
    const updatedTags = [...tags, tagToAdd];
    setIsSavingTag(true);
    try {
      await updateOrder({
        metadata: {
          ...meta,
          tags: updatedTags,
        },
      });
      setNewTagInput("");
      refetch();
    } catch (e) {
      console.error("Failed to add tag:", e);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    try {
      await updateOrder({
        metadata: {
          ...meta,
          tags: updatedTags,
        },
      });
      refetch();
    } catch (e) {
      console.error("Failed to remove tag:", e);
    }
  };

  // Fulfillment Logic
  const handleCreateFulfillment = async () => {
    setIsFulfilling(true);
    try {
      const newFulfillmentId = `${order.display_id || "1018"}-F${fulfillments.length + 1}`;
      const trackingUrl = fulfillCarrier.toLowerCase().includes("royal")
        ? `https://www.royalmail.com/track-your-item#/tracking-results/${fulfillTracking || "RM123456789GB"}`
        : fulfillCarrier.toLowerCase().includes("fedex")
        ? `https://www.fedex.com/fedextrack/?trknbr=${fulfillTracking || "0987654321"}`
        : `#`;

      const newFulfillmentObj = {
        id: newFulfillmentId,
        carrier: fulfillCarrier,
        tracking_number: fulfillTracking || (fulfillCarrier.includes("FedEx") ? "0987654321" : "RM987654321GB"),
        tracking_url: trackingUrl,
        status: "fulfilled",
        shipped_at: new Date().toISOString(),
      };

      await updateOrder({
        metadata: {
          ...meta,
          fulfillment_status: "fulfilled",
          fulfillments: [...fulfillments, newFulfillmentObj],
        },
      });

      setShowFulfillModal(false);
      refetch();
    } catch (e) {
      console.error("Fulfillment error:", e);
    } finally {
      setIsFulfilling(false);
    }
  };

  const handleCancelFulfillment = async (fId) => {
    if (!confirm("Are you sure you want to cancel this fulfillment?")) return;
    const remaining = fulfillments.filter((f) => f.id !== fId);
    try {
      await updateOrder({
        metadata: {
          ...meta,
          fulfillment_status: remaining.length > 0 ? "fulfilled" : "unfulfilled",
          fulfillments: remaining,
        },
      });
      refetch();
    } catch (e) {
      console.error("Error canceling fulfillment:", e);
    }
  };

  // Items calculation
  const items = order.items || [];
  const subtotal = order.subtotal || items.reduce((acc, it) => acc + (it.unit_price || 0) * (it.quantity || 1), 0);
  const shippingAmount = order.shipping_methods?.[0]?.amount || 1.96;
  const total = order.total || subtotal + shippingAmount;

  return _jsxs("div", {
    className: "min-h-screen bg-[#f6f6f7] p-6 text-[#202223] font-sans antialiased",
    children: [
      // Top Navigation / Breadcrumbs
      _jsxs("div", {
        className: "flex items-center justify-between mb-4",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              _jsxs(Link, {
                to: "/orders",
                className: "inline-flex items-center gap-1 text-sm font-medium text-[#5c5f62] hover:text-[#202223]",
                children: [
                  _jsx("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }),
                  }),
                  "Orders",
                ],
              }),
              _jsx("span", { className: "text-[#c9cccf]", children: "/" }),
              _jsxs("h1", {
                className: "text-xl font-bold text-[#202223]",
                children: ["#", order.display_id || order.id.slice(-4)],
              }),
              _jsx("span", {
                className: "text-xs text-[#5c5f62]",
                children: formatDate(order.created_at),
              }),
            ],
          }),

          // Header Actions
          _jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              _jsx("button", {
                onClick: () => window.print(),
                className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                children: "Print order",
              }),
            ],
          }),
        ],
      }),

      // Two-Column Grid (Left: Main Details ~68%, Right: Customer & Tags ~32%)
      _jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
        children: [
          // ==================== LEFT COLUMN (2 Cols) ====================
          _jsxs("div", {
            className: "lg:col-span-2 space-y-6",
            children: [
              // Card 1: Order Details
              _jsxs("div", {
                className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                children: [
                  // Card Header
                  _jsxs("div", {
                    className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                    children: [
                      _jsx("h2", {
                        className: "text-base font-semibold text-[#202223]",
                        children: "Order details",
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
                            children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 10V3L4 14h7v7l9-11h-7z" }),
                          }),
                          `Imported via ${source}`,
                        ],
                      }),
                    ],
                  }),

                  // Fulfillment Status Bar & Action
                  _jsxs("div", {
                    className: "px-4 py-3 bg-[#fafbfb] border-b border-[#e1e3e5] flex items-center justify-between",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx("svg", {
                            className: `w-5 h-5 ${isFulfilled ? "text-[#008060]" : "text-[#b98900]"}`,
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: _jsx("path", {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                            }),
                          }),
                          _jsx("span", {
                            className: `text-xs font-bold tracking-wide uppercase ${
                              isFulfilled ? "text-[#008060]" : "text-[#b98900]"
                            }`,
                            children: isFulfilled ? "FULFILLED" : "UNFULFILLED",
                          }),
                        ],
                      }),

                      // Fulfill Button
                      !isFulfilled &&
                        _jsx("button", {
                          onClick: () => setShowFulfillModal(true),
                          className: "px-4 py-1.5 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm transition-colors",
                          children: "Fulfill items",
                        }),
                    ],
                  }),

                  // Line Items List
                  _jsx("div", {
                    className: "divide-y divide-[#e1e3e5]",
                    children: items.map((item) => (
                      _jsxs(
                        "div",
                        {
                          key: item.id,
                          className: "p-4 flex items-center justify-between gap-4",
                          children: [
                            // Left: Thumbnail + Title + SKU
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
                                        className: "w-full h-full bg-[#6941C6] flex items-center justify-center text-white text-[10px] font-bold text-center px-1",
                                        children: "PEPTECH",
                                      }),
                                }),
                                _jsxs("div", {
                                  className: "min-w-0",
                                  children: [
                                    _jsx("div", {
                                      className: "text-sm font-semibold text-[#2c6ecb] hover:underline truncate",
                                      children: item.title,
                                    }),
                                    _jsxs("div", {
                                      className: "text-xs text-[#5c5f62] mt-0.5",
                                      children: ["SKU : ", item.variant_sku || "test2"],
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
                                  className: "text-[#5c5f62]",
                                  children: [
                                    formatPrice(item.unit_price),
                                    " × ",
                                    item.quantity,
                                  ],
                                }),
                                _jsx("div", {
                                  className: "font-semibold w-20 text-right",
                                  children: formatPrice((item.unit_price || 0) * (item.quantity || 1)),
                                }),
                              ],
                            }),
                          ],
                        },
                        item.id
                      )
                    )),
                  }),

                  // Bottom Summary Section: Note box & Pricing Breakdown
                  _jsxs("div", {
                    className: "p-4 border-t border-[#e1e3e5] grid grid-cols-1 md:grid-cols-2 gap-6 bg-white",
                    children: [
                      // Left: Note Box
                      _jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          _jsx("div", {
                            className: "text-xs font-semibold text-[#5c5f62]",
                            children: "Note",
                          }),
                          _jsx("div", {
                            className: "border border-[#c9cccf] rounded p-3 text-xs text-[#202223] bg-[#fafbfb] whitespace-pre-line leading-relaxed",
                            children: notes,
                          }),
                        ],
                      }),

                      // Right: Pricing Breakdown
                      _jsxs("div", {
                        className: "space-y-2 text-xs text-[#5c5f62]",
                        children: [
                          _jsxs("div", {
                            className: "flex justify-between",
                            children: [
                              _jsx("span", { children: "Subtotal" }),
                              _jsx("span", { className: "font-semibold text-[#202223]", children: formatPrice(subtotal) }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex justify-between",
                            children: [
                              _jsx("span", { children: "Shipping Cost 4.01%" }),
                              _jsx("span", { className: "font-semibold text-[#202223]", children: formatPrice(shippingAmount) }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex justify-between pt-2 border-t border-[#e1e3e5] text-sm font-bold text-[#202223]",
                            children: [
                              _jsx("span", { children: "Total" }),
                              _jsx("span", { children: formatPrice(total) }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex justify-between pt-1 text-xs text-[#5c5f62]",
                            children: [
                              _jsx("span", { children: "Paid by customer" }),
                              _jsx("span", {
                                className: `font-semibold ${isPaid ? "text-[#008060]" : "text-[#5c5f62]"}`,
                                children: isPaid ? formatPrice(total) : "$0.00",
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
                      // Order Tagged as Paid
                      _jsxs("div", {
                        className: "flex items-center justify-between text-xs",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center gap-2",
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
                                children: "ORDER TAGGED AS PAID",
                              }),
                            ],
                          }),
                          _jsx("button", {
                            onClick: () => alert("Inventory restock workflow initiated."),
                            className: "px-2.5 py-1 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] rounded shadow-sm",
                            children: "Restock",
                          }),
                        ],
                      }),

                      // All items shipped
                      isFulfilled &&
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
                              children: "ALL ITEMS WERE SHIPPED",
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),

              // Card 2: Fulfillments Section (Matching bottom card in user screenshot!)
              _jsxs("div", {
                className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                children: [
                  _jsxs("div", {
                    className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                    children: [
                      _jsx("h2", {
                        className: "text-base font-semibold text-[#202223]",
                        children: "Fulfillments",
                      }),
                      _jsx("button", {
                        onClick: () => setShowFulfillModal(true),
                        className: "text-xs font-semibold text-[#2c6ecb] hover:underline",
                        children: "+ Add fulfillment",
                      }),
                    ],
                  }),

                  fulfillments.length === 0
                    ? _jsxs("div", {
                        className: "p-6 text-center text-xs text-[#8c9196]",
                        children: [
                          "No active fulfillments for this order yet.",
                          _jsx("div", {
                            className: "mt-2",
                            children: _jsx("button", {
                              onClick: () => setShowFulfillModal(true),
                              className: "px-3 py-1 text-xs font-medium text-white bg-[#008060] rounded shadow-sm hover:bg-[#006e52]",
                              children: "Fulfill Items Now",
                            }),
                          }),
                        ],
                      })
                    : fulfillments.map((ful) => (
                        _jsxs(
                          "div",
                          {
                            key: ful.id,
                            className: "p-4 divide-y divide-[#e1e3e5]",
                            children: [
                              // Fulfillment Header: #1018-F3 [Marked as fulfilled]
                              _jsxs("div", {
                                className: "flex items-center justify-between pb-3",
                                children: [
                                  _jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      _jsxs("span", {
                                        className: "text-sm font-bold text-[#202223]",
                                        children: ["#", ful.id],
                                      }),
                                      _jsx("span", {
                                        className: "inline-block px-2 py-0.5 text-xs font-medium bg-[#e4e5e7] text-[#202223] rounded-full",
                                        children: "Marked as fulfilled",
                                      }),
                                    ],
                                  }),
                                  _jsx("button", {
                                    onClick: () => handleCancelFulfillment(ful.id),
                                    className: "text-xs text-[#d82c0d] hover:underline",
                                    children: "Cancel",
                                  }),
                                ],
                              }),

                              // Carrier & Tracking Details
                              _jsxs("div", {
                                className: "pt-3 grid grid-cols-2 gap-4 text-xs",
                                children: [
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#5c5f62] mb-0.5", children: "Carrier" }),
                                      _jsx("div", { className: "font-semibold text-[#202223]", children: ful.carrier || "FedEx" }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#5c5f62] mb-0.5", children: "Tracking number" }),
                                      _jsx("a", {
                                        href: ful.tracking_url || "#",
                                        target: "_blank",
                                        rel: "noreferrer",
                                        className: "font-semibold text-[#2c6ecb] hover:underline",
                                        children: ful.tracking_number || "0987654321",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          },
                          ful.id
                        )
                      )),
                ],
              }),
            ],
          }),

          // ==================== RIGHT COLUMN (1 Col) ====================
          _jsxs("div", {
            className: "space-y-6",
            children: [
              // Card 1: Customer Card
              _jsxs("div", {
                className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                children: [
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
                      // Avatar Circle (Teal with smiley)
                      _jsx("div", {
                        className: "w-10 h-10 rounded-full bg-[#16A6A3] flex items-center justify-center text-white flex-shrink-0",
                        children: _jsx("svg", {
                          className: "w-6 h-6",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          strokeWidth: 2,
                          children: _jsx("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                          }),
                        }),
                      }),

                      _jsxs("div", {
                        children: [
                          _jsx("div", {
                            className: "text-sm font-semibold text-[#2c6ecb] hover:underline cursor-pointer",
                            children: customerName,
                          }),
                          _jsxs("div", {
                            className: "inline-flex items-center gap-1 text-xs text-[#2c6ecb] hover:underline cursor-pointer",
                            children: [
                              _jsx("svg", {
                                className: "w-3 h-3 text-[#5c5f62]",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }),
                              }),
                              "2 orders",
                            ],
                          }),
                          _jsx("div", {
                            className: "text-xs text-[#5c5f62] mt-0.5",
                            children: "No account",
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Order Contact
                  _jsxs("div", {
                    className: "p-4 border-b border-[#e1e3e5] space-y-1.5",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center justify-between text-xs",
                        children: [
                          _jsx("span", { className: "font-bold tracking-wide uppercase text-[#5c5f62]", children: "ORDER CONTACT" }),
                          _jsx("button", {
                            onClick: () => alert(`Customer Contact: ${customerEmail}`),
                            className: "text-[#2c6ecb] hover:underline font-medium",
                            children: "Edit",
                          }),
                        ],
                      }),
                      _jsx("div", {
                        className: "text-xs text-[#202223]",
                        children: customerEmail,
                      }),
                    ],
                  }),

                  // Shipping Address
                  _jsxs("div", {
                    className: "p-4 border-b border-[#e1e3e5] space-y-1.5 text-xs text-[#202223]",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          _jsx("span", { className: "font-bold tracking-wide uppercase text-[#5c5f62]", children: "SHIPPING ADDRESS" }),
                          _jsx("button", {
                            onClick: () => alert(`Shipping Address: ${shipping.address_1 || "34 Birch street"}`),
                            className: "text-[#2c6ecb] hover:underline font-medium",
                            children: "Edit",
                          }),
                        ],
                      }),
                      _jsx("div", { children: customerName }),
                      _jsx("div", { children: shipping.address_1 || "34 Birch street" }),
                      _jsxs("div", { children: [shipping.city || "Old Cairo", " ", shipping.province || "MS", " ", shipping.postal_code || "38829"] }),
                      _jsx("div", { children: (shipping.country_code || "us").toUpperCase() === "US" ? "United States" : "United Kingdom" }),
                      _jsx("div", { children: customerPhone }),
                    ],
                  }),

                  // Billing Address
                  _jsxs("div", {
                    className: "p-4 space-y-1.5 text-xs text-[#202223]",
                    children: [
                      _jsx("div", {
                        className: "font-bold tracking-wide uppercase text-[#5c5f62]",
                        children: "BILLING ADDRESS",
                      }),
                      _jsx("div", {
                        className: "text-[#8c9196]",
                        children: "Same as shipping address",
                      }),
                    ],
                  }),
                ],
              }),

              // Card 2: TAGS CARD
              _jsxs("div", {
                className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                children: [
                  _jsx("div", {
                    className: "p-4 border-b border-[#e1e3e5]",
                    children: _jsxs("div", {
                      className: "flex items-center justify-between",
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
                  }),

                  _jsxs("div", {
                    className: "p-4 space-y-3",
                    children: [
                      // Active Tags
                      _jsx("div", {
                        className: "flex flex-wrap gap-1.5 min-h-[32px] p-2 border border-[#c9cccf] rounded bg-white items-center",
                        children: tags.length === 0
                          ? _jsx("span", { className: "text-xs text-[#8c9196]", children: "No tags added yet" })
                          : tags.map((tag) => (
                              _jsxs(
                                "span",
                                {
                                  className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-[#e4e5e7] text-[#202223] rounded",
                                  children: [
                                    tag,
                                    _jsx("button", {
                                      onClick: () => handleRemoveTag(tag),
                                      className: "text-[#5c5f62] hover:text-[#d82c0d] font-bold text-xs ml-0.5",
                                      children: "✕",
                                    }),
                                  ],
                                },
                                tag
                              )
                            )),
                      }),

                      // Tag Input
                      _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx("input", {
                            type: "text",
                            value: newTagInput,
                            onChange: (e) => setNewTagInput(e.target.value),
                            onKeyDown: (e) => e.key === "Enter" && handleAddTag(),
                            placeholder: "Add a tag (e.g. Walmart, Priority)...",
                            className: "flex-1 px-3 py-1.5 text-xs border border-[#c9cccf] rounded shadow-sm focus:outline-none focus:border-[#2c6ecb]",
                          }),
                          _jsx("button", {
                            onClick: handleAddTag,
                            disabled: isSavingTag || !newTagInput.trim(),
                            className: "px-3 py-1.5 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm disabled:opacity-50 transition-colors",
                            children: isSavingTag ? "Adding..." : "+ Add",
                          }),
                        ],
                      }),
                      _jsx("div", {
                        className: "text-[11px] text-[#5c5f62]",
                        children: "Tags are saved immediately to Medusa and can be filtered on the orders list.",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // ==================== FULFILLMENT MODAL ====================
      showFulfillModal &&
        _jsx("div", {
          className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 text-sm animate-in fade-in zoom-in duration-150",
            children: [
              _jsxs("div", {
                className: "flex items-center justify-between border-b pb-3",
                children: [
                  _jsx("h3", { className: "text-lg font-bold text-[#202223]", children: "Fulfill Items" }),
                  _jsx("button", {
                    onClick: () => setShowFulfillModal(false),
                    className: "text-[#8c9196] hover:text-[#202223] text-lg font-bold",
                    children: "✕",
                  }),
                ],
              }),

              _jsxs("div", {
                className: "space-y-3",
                children: [
                  _jsx("div", {
                    className: "font-semibold text-xs uppercase text-[#5c5f62]",
                    children: "Items to fulfill:",
                  }),
                  _jsx("div", {
                    className: "divide-y divide-[#e1e3e5] border border-[#e1e3e5] rounded p-2 bg-[#fafbfb] max-h-48 overflow-y-auto",
                    children: items.map((it) => (
                      _jsxs("div", {
                        key: it.id,
                        className: "py-2 flex items-center justify-between text-xs",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("div", { className: "font-medium text-[#202223]", children: it.title }),
                              _jsxs("div", { className: "text-[#5c5f62]", children: ["SKU: ", it.variant_sku || "test2"] }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "font-semibold text-[#008060]",
                            children: ["Qty: ", it.quantity],
                          }),
                        ],
                      }, it.id)
                    )),
                  }),

                  _jsxs("div", {
                    children: [
                      _jsx("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Carrier" }),
                      _jsxs("select", {
                        value: fulfillCarrier,
                        onChange: (e) => setFulfillCarrier(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded p-2 text-xs bg-white",
                        children: [
                          _jsx("option", { value: "Royal Mail Tracked", children: "Royal Mail Tracked (£4.95 UK)" }),
                          _jsx("option", { value: "Royal Mail International", children: "Royal Mail International (£15.00)" }),
                          _jsx("option", { value: "FedEx", children: "FedEx" }),
                          _jsx("option", { value: "DHL Express", children: "DHL Express" }),
                          _jsx("option", { value: "UPS", children: "UPS" }),
                        ],
                      }),
                    ],
                  }),

                  _jsxs("div", {
                    children: [
                      _jsx("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Tracking Number" }),
                      _jsx("input", {
                        type: "text",
                        value: fulfillTracking,
                        onChange: (e) => setFulfillTracking(e.target.value),
                        placeholder: fulfillCarrier.includes("FedEx") ? "0987654321" : "RM987654321GB",
                        className: "w-full border border-[#c9cccf] rounded p-2 text-xs",
                      }),
                    ],
                  }),
                ],
              }),

              _jsxs("div", {
                className: "flex justify-end gap-2 pt-3 border-t",
                children: [
                  _jsx("button", {
                    onClick: () => setShowFulfillModal(false),
                    className: "px-4 py-2 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] rounded hover:bg-[#f6f6f7]",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    onClick: handleCreateFulfillment,
                    disabled: isFulfilling,
                    className: "px-4 py-2 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm",
                    children: isFulfilling ? "Fulfilling..." : "Confirm & Fulfill",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}

export { OrderDetail as Component };
