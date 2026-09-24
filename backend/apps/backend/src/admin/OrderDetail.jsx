import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useUpdateOrder } from "./chunk-CHQR6GOM.mjs";
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
    if (typeof SubscriptionDetail !== "undefined") {
      return _jsx(SubscriptionDetail, { subscriptionId: id });
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

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReasons, setRefundReasons] = useState([
    { id: "refr_shipping_issue", code: "shipping_issue", label: "Shipping Issue" },
    { id: "refr_customer_care", code: "customer_care_adjustment", label: "Customer Care Adjustment" },
    { id: "refr_pricing_error", code: "pricing_error", label: "Pricing Error" },
    { id: "refr_product_defect", code: "product_defect", label: "Product Defect / Return" },
  ]);
  const [selectedReasonId, setSelectedReasonId] = useState("refr_customer_care");
  const [refundNote, setRefundNote] = useState("");
  const [restockItems, setRestockItems] = useState(true);
  const [itemRefundQuantities, setItemRefundQuantities] = useState({});
  const [shippingRefundAmount, setShippingRefundAmount] = useState("0");

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnReasons, setReturnReasons] = useState([
    { id: "ret_reason_damaged", label: "Damaged in Transit" },
    { id: "ret_reason_defective", label: "Defective Precision Pen Device" },
    { id: "ret_reason_wrong_item", label: "Incorrect Item Received" },
    { id: "ret_reason_unopened", label: "Unopened Parcel Return" },
    { id: "ret_reason_other", label: "Other Reason" },
  ]);
  const [selectedReturnReasonId, setSelectedReturnReasonId] = useState("ret_reason_damaged");
  const [itemReturnQuantities, setItemReturnQuantities] = useState({});
  const [returnCarrier, setReturnCarrier] = useState("Royal Mail Tracked Return");
  const [returnTracking, setReturnTracking] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [activeReturnToReceive, setActiveReturnToReceive] = useState(null);
  const [receiveRestock, setReceiveRestock] = useState(true);
  const [receiveRefund, setReceiveRefund] = useState(true);

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
  const paymentStatus = (meta.payment_status || (order.status === "completed" ? "paid" : "pending")).toLowerCase();
  const isRefunded = paymentStatus === "refunded";
  const isPartiallyRefunded = paymentStatus === "partially_refunded";
  const isPaid = paymentStatus === "paid";
  const refunds = Array.isArray(meta.refunds) ? meta.refunds : [];
  const refundedTotal = Number(meta.refunded_total || 0);
  const returns = Array.isArray(meta.returns) ? meta.returns : [];
  const returnStatus = meta.return_status || (returns.some((r) => r.status === "open") ? "return_requested" : returns.some((r) => r.status === "received") ? "returned" : null);
  const isReturnRequested = returnStatus === "return_requested";
  const isReturned = returnStatus === "returned";
  const orderPromotion = meta.promotion || (meta.has_subscription ? {
    code: "SUB28-10",
    name: "Subscribe & Save (28-Day Protocol)",
    discount_percent: 10,
  } : null);

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

  const openRefundModal = async () => {
    const initialQtys = {};
    items.forEach((it) => {
      initialQtys[it.id] = 0;
    });
    setItemRefundQuantities(initialQtys);
    setShippingRefundAmount("0");
    setRefundNote("");
    setShowRefundModal(true);

    try {
      const res = await fetch("/admin/custom/refund");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.refund_reasons) && data.refund_reasons.length > 0) {
          setRefundReasons(data.refund_reasons);
          setSelectedReasonId(data.refund_reasons[0].id);
        }
      }
    } catch (e) {
      // Keep preloaded reasons
    }
  };

  const calculatedItemsTotal = items.reduce((acc, it) => {
    const qty = Number(itemRefundQuantities[it.id] || 0);
    const maxQty = it.quantity || 1;
    const unitPrice = it.unit_price != null ? Number(it.unit_price) : (it.total ? Number(it.total) / maxQty : 0);
    return acc + (qty * unitPrice);
  }, 0);

  const calculatedTotalRefund = Number((calculatedItemsTotal + Number(shippingRefundAmount || 0)).toFixed(2));

  const handleProcessRefund = async () => {
    if (calculatedTotalRefund <= 0) {
      alert("Please select at least one item quantity or enter a shipping amount to refund.");
      return;
    }
    const maxRefundable = Math.max(0, total - refundedTotal);
    if (calculatedTotalRefund > maxRefundable + 0.05) {
      alert(`The maximum remaining amount you can refund for this order is ${formatPrice(maxRefundable)}.`);
      return;
    }
    setIsRefunding(true);
    try {
      const selectedReasonObj = refundReasons.find((r) => r.id === selectedReasonId);
      const refundItemsList = items
        .filter((it) => (itemRefundQuantities[it.id] || 0) > 0)
        .map((it) => ({
          id: it.id,
          title: it.title,
          quantity: itemRefundQuantities[it.id],
          unit_price: it.unit_price != null ? Number(it.unit_price) : (it.total ? Number(it.total) / (it.quantity || 1) : 0),
        }));

      const res = await fetch("/admin/custom/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          amount: calculatedTotalRefund,
          refund_reason_id: selectedReasonId,
          reason_label: selectedReasonObj?.label || "Customer Care Adjustment",
          items: refundItemsList,
          note: refundNote.trim(),
          restock: restockItems,
          shipping_refund: Number(shippingRefundAmount || 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process refund");
      }

      setShowRefundModal(false);
      await refetch();
      alert(`Refund of ${formatPrice(calculatedTotalRefund)} was successfully processed!`);
    } catch (err) {
      console.error("Refund error:", err);
      alert(`Error processing refund: ${err.message}`);
    } finally {
      setIsRefunding(false);
    }
  };

  const openReturnModal = async () => {
    const initialQtys = {};
    items.forEach((it) => {
      initialQtys[it.id] = 0;
    });
    setItemReturnQuantities(initialQtys);
    setReturnTracking("");
    setReturnNote("");
    setShowReturnModal(true);

    try {
      const res = await fetch("/admin/custom/return");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.return_reasons) && data.return_reasons.length > 0) {
          setReturnReasons(data.return_reasons);
          setSelectedReturnReasonId(data.return_reasons[0].id);
        }
      }
    } catch (e) {
      // keep default reasons
    }
  };

  const handleRequestReturn = async () => {
    const returnItemsList = items
      .filter((it) => (itemReturnQuantities[it.id] || 0) > 0)
      .map((it) => ({
        id: it.id,
        title: it.title,
        quantity: itemReturnQuantities[it.id],
        unit_price: it.unit_price != null ? Number(it.unit_price) : (it.total ? Number(it.total) / (it.quantity || 1) : 0),
      }));

    if (returnItemsList.length === 0) {
      alert("Please select at least one item quantity to return.");
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const selectedReasonObj = returnReasons.find((r) => r.id === selectedReturnReasonId);
      const res = await fetch("/admin/custom/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          order_id: order.id,
          items: returnItemsList,
          reason_id: selectedReturnReasonId,
          reason_label: selectedReasonObj?.label || "Other Reason",
          carrier: returnCarrier,
          tracking_number: returnTracking.trim(),
          note: returnNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create return request");
      }

      setShowReturnModal(false);
      await refetch();
      alert("Return request created successfully! The return is now in progress.");
    } catch (err) {
      console.error("Return error:", err);
      alert(`Error creating return: ${err.message}`);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const openReceiveModal = (ret) => {
    setActiveReturnToReceive(ret);
    setReceiveRestock(true);
    setReceiveRefund(true);
    setShowReceiveModal(true);
  };

  const handleConfirmReceiveReturn = async () => {
    if (!activeReturnToReceive) return;
    setIsSubmittingReturn(true);
    try {
      const refundAmount = activeReturnToReceive.items_value || (activeReturnToReceive.items || []).reduce((acc, it) => acc + ((it.unit_price || 0) * (it.quantity || 1)), 0);
      const res = await fetch("/admin/custom/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "receive",
          order_id: order.id,
          return_id: activeReturnToReceive.id,
          restock: receiveRestock,
          issue_refund: receiveRefund,
          refund_amount: refundAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to mark return as received");
      }

      setShowReceiveModal(false);
      setActiveReturnToReceive(null);
      await refetch();
      alert("Return marked as received! Warehouse inspection completed.");
    } catch (err) {
      console.error("Receive return error:", err);
      alert(`Error receiving return: ${err.message}`);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleCancelReturn = async (retId) => {
    if (!confirm("Are you sure you want to cancel this return request?")) return;
    try {
      const res = await fetch("/admin/custom/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          order_id: order.id,
          return_id: retId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel return");
      }
      await refetch();
      alert("Return request has been cancelled.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return _jsxs("div", {
    className: "min-h-screen bg-[#f6f6f7] p-6 text-[#202223] font-sans antialiased orders-theme-root",
    children: [
      _jsx("style", { children: DARK_MODE_CSS }),
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
              isRefunded ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1f2f3] text-[#5c5f62] border border-[#d2d5d8]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#8c9196]" }),
                    "Refunded",
                  ],
                })
              ) : isPartiallyRefunded ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff8e6] text-[#8a6116] border border-[#ffea8a]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#ffb800]" }),
                    "Partially refunded",
                  ],
                })
              ) : isPaid ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4e5e7] text-[#202223]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5c5f62]" }),
                    "Paid",
                  ],
                })
              ) : (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffea8a] text-[#5c3e00]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full border border-[#8c6b00]" }),
                    "Pending",
                  ],
                })
              ),
              isReturnRequested ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#0284c7]" }),
                    "Return in progress",
                  ],
                })
              ) : isReturned ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]",
                  children: [
                    _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#16a34a]" }),
                    "Returned",
                  ],
                })
              ) : null,
              orderPromotion ? (
                _jsxs("span", {
                  className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]",
                  children: [
                    _jsx("span", { children: "🏷️" }),
                    orderPromotion.code || "SUB28-10",
                    _jsx("span", { className: "text-[11px] font-normal text-[#166534]", children: "(-10%)" }),
                  ],
                })
              ) : null,
            ],
          }),

          // Header Actions
          _jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              _jsxs("button", {
                type: "button",
                onClick: openReturnModal,
                className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] rounded shadow-sm flex items-center gap-1.5 transition",
                children: [
                  _jsx("svg", {
                    className: "w-3.5 h-3.5 text-[#5c5f62]",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: _jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                    }),
                  }),
                  "Return items",
                ],
              }),
              !isRefunded && _jsxs("button", {
                type: "button",
                onClick: openRefundModal,
                className: "px-3 py-1.5 text-xs font-medium bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] rounded shadow-sm flex items-center gap-1.5 transition",
                children: [
                  _jsx("svg", {
                    className: "w-3.5 h-3.5 text-[#5c5f62]",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: _jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
                    }),
                  }),
                  "Refund items",
                ],
              }),
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
                          orderPromotion &&
                            _jsxs("div", {
                              className: "flex justify-between",
                              children: [
                                _jsx("span", {
                                  children: `Promotion (${orderPromotion.code || "SUB28-10"}${orderPromotion.name ? ` · ${orderPromotion.name}` : ""})`,
                                }),
                                _jsx("span", {
                                  className: "font-semibold text-[#202223]",
                                  children: orderPromotion.amount ? `-${formatPrice(orderPromotion.amount)}` : `-${orderPromotion.discount_percent || 10}%`,
                                }),
                              ],
                            }),
                          _jsxs("div", {
                            className: "flex justify-between",
                            children: [
                              _jsx("span", { children: "Shipping Cost" }),
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
                                className: `font-semibold ${isPaid || isRefunded || isPartiallyRefunded ? "text-[#008060]" : "text-[#5c5f62]"}`,
                                children: (isPaid || isRefunded || isPartiallyRefunded) ? formatPrice(total) : "$0.00",
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "flex justify-between pt-1 text-[11px] text-[#5c5f62]",
                            children: [
                              _jsx("span", { children: "Payment Gateway" }),
                              _jsx("span", {
                                className: "font-medium text-[#202223]",
                                children: meta.payment_method || (meta.payment_gateway === "stripe" ? "Stripe (Card / SCA)" : "Bank Transfer"),
                              }),
                            ],
                          }),
                          meta.stripe_payment_intent_id &&
                            _jsxs("div", {
                              className: "flex justify-between pt-0.5 text-[10px] text-[#5c5f62] font-mono",
                              children: [
                                _jsx("span", { children: "Stripe Intent ID" }),
                                _jsx("span", { className: "text-[#2c6ecb]", children: meta.stripe_payment_intent_id }),
                              ],
                            }),
                          refundedTotal > 0 &&
                            _jsxs("div", {
                              className: "flex justify-between pt-1 text-xs text-[#d72c0d] font-semibold",
                              children: [
                                _jsx("span", { children: "Refunded" }),
                                _jsx("span", { children: `-${formatPrice(refundedTotal)}` }),
                              ],
                            }),
                          refundedTotal > 0 &&
                            _jsxs("div", {
                              className: "flex justify-between pt-1 text-xs font-bold text-[#202223] border-t border-[#e1e3e5] mt-1 pt-1",
                              children: [
                                _jsx("span", { children: "Net payment" }),
                                _jsx("span", { children: formatPrice(Math.max(0, total - refundedTotal)) }),
                              ],
                            }),
                          _jsxs("div", {
                            className: "flex items-center justify-between pt-2 mt-2 border-t border-[#e1e3e5]",
                            children: [
                              _jsx("span", {
                                className: "text-[11px] text-[#5c5f62]",
                                children: isRefunded
                                  ? "Order fully refunded"
                                  : isPartiallyRefunded
                                  ? `${refunds.length} partial refund(s) issued`
                                  : "Need to issue a refund?",
                              }),
                              !isRefunded &&
                                _jsx("button", {
                                  type: "button",
                                  onClick: openRefundModal,
                                  className: "text-xs font-semibold text-[#008060] hover:underline",
                                  children: "Refund payment",
                                }),
                            ],
                          }),
                          refunds.length > 0 &&
                            _jsx("div", {
                              className: "mt-3 space-y-1.5 pt-2 border-t border-[#e1e3e5]",
                              children: refunds.map((ref) =>
                                _jsxs(
                                  "div",
                                  {
                                    className: "p-2 rounded bg-[#f6f6f7] border border-[#e1e3e5] text-xs",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex justify-between font-medium text-[#202223]",
                                        children: [
                                          _jsx("span", { children: ref.reason_label || "Refund issued" }),
                                          _jsxs("span", {
                                            className: "text-[#d72c0d] font-semibold",
                                            children: ["-", formatPrice(ref.amount)],
                                          }),
                                        ],
                                      }),
                                      ref.note &&
                                        _jsxs("p", {
                                          className: "text-[11px] text-[#5c5f62] italic mt-0.5",
                                          children: ['"', ref.note, '"'],
                                        }),
                                      _jsx("p", {
                                        className: "text-[10px] text-[#8c9196] mt-0.5",
                                        children: formatDate(ref.created_at),
                                      }),
                                    ],
                                  },
                                  ref.id
                                )
                              ),
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

              // Card 3: Returns Management Section
              _jsxs("div", {
                className: "bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden",
                children: [
                  _jsxs("div", {
                    className: "p-4 border-b border-[#e1e3e5] flex items-center justify-between",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx("h2", {
                            className: "text-base font-semibold text-[#202223]",
                            children: "Returns",
                          }),
                          returns.length > 0 &&
                            _jsx("span", {
                              className: "inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-[#f1f2f3] text-[#5c5f62]",
                              children: returns.length,
                            }),
                        ],
                      }),
                      _jsx("button", {
                        onClick: openReturnModal,
                        className: "text-xs font-semibold text-[#2c6ecb] hover:underline",
                        children: "+ Request return",
                      }),
                    ],
                  }),

                  returns.length === 0
                    ? _jsxs("div", {
                        className: "p-6 text-center text-xs text-[#8c9196]",
                        children: [
                          "No returns requested for this order.",
                          _jsx("div", {
                            className: "mt-2",
                            children: _jsx("button", {
                              onClick: openReturnModal,
                              className: "px-3 py-1.5 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] rounded shadow-sm hover:bg-[#f6f6f7]",
                              children: "Create Return Request",
                            }),
                          }),
                        ],
                      })
                    : returns.map((ret, idx) => {
                        const isOpen = ret.status === "open";
                        const isRecv = ret.status === "received";

                        return _jsxs(
                          "div",
                          {
                            key: ret.id || idx,
                            className: "p-4 border-b last:border-b-0 border-[#e1e3e5] space-y-3",
                            children: [
                              // Return header: #RET-1, status pill, actions
                              _jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [
                                  _jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      _jsxs("span", {
                                        className: "text-sm font-bold text-[#202223]",
                                        children: ["#RET-", order.display_id || order.id.slice(-4), "-", ret.display_id || idx + 1],
                                      }),
                                      isOpen ? (
                                        _jsxs("span", {
                                          className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
                                          children: [
                                            _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#0284c7]" }),
                                            "Return in progress",
                                          ],
                                        })
                                      ) : isRecv ? (
                                        _jsxs("span", {
                                          className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]",
                                          children: [
                                            _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#16a34a]" }),
                                            "Received & Inspected",
                                          ],
                                        })
                                      ) : (
                                        _jsxs("span", {
                                          className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1f2f3] text-[#5c5f62]",
                                          children: [
                                            _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#8c9196]" }),
                                            "Cancelled",
                                          ],
                                        })
                                      ),
                                    ],
                                  }),

                                  // Action buttons
                                  isOpen &&
                                    _jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        _jsx("button", {
                                          type: "button",
                                          onClick: () => openReceiveModal(ret),
                                          className: "px-2.5 py-1 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm transition",
                                          children: "Receive return",
                                        }),
                                        _jsx("button", {
                                          type: "button",
                                          onClick: () => handleCancelReturn(ret.id),
                                          className: "text-xs text-[#d82c0d] hover:underline",
                                          children: "Cancel return",
                                        }),
                                      ],
                                    }),
                                ],
                              }),

                              // Return metadata grid: Reason, Carrier, Tracking, Requested Date
                              _jsxs("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#fafbfb] p-3 rounded border border-[#e1e3e5]",
                                children: [
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#5c5f62] mb-0.5", children: "Reason" }),
                                      _jsx("div", { className: "font-semibold text-[#202223]", children: ret.reason_label || "Other Reason" }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#5c5f62] mb-0.5", children: "Return Carrier & Tracking" }),
                                      _jsxs("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                          _jsx("span", { className: "text-[#202223]", children: ret.carrier || "Royal Mail Tracked Return" }),
                                          ret.tracking_number ? (
                                            _jsx("a", {
                                              href: `https://www.royalmail.com/track-your-item#/tracking-results/${ret.tracking_number}`,
                                              target: "_blank",
                                              rel: "noreferrer",
                                              className: "font-semibold text-[#2c6ecb] hover:underline",
                                              children: `(${ret.tracking_number})`,
                                            })
                                          ) : (
                                            _jsx("span", { className: "text-[#8c9196] italic", children: "(Label pending)" })
                                          ),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("div", { className: "text-[#5c5f62] mb-0.5", children: "Requested Date" }),
                                      _jsx("div", { className: "text-[#202223]", children: formatDate(ret.requested_at) }),
                                    ],
                                  }),
                                ],
                              }),

                              // Items in this return
                              Array.isArray(ret.items) && ret.items.length > 0 &&
                                _jsxs("div", {
                                  className: "space-y-1.5",
                                  children: [
                                    _jsx("div", { className: "text-xs font-semibold text-[#5c5f62]", children: "Returned Items:" }),
                                    _jsx("div", {
                                      className: "divide-y divide-[#e1e3e5] border border-[#e1e3e5] rounded bg-white overflow-hidden text-xs",
                                      children: ret.items.map((it, iIdx) =>
                                        _jsxs(
                                          "div",
                                          {
                                            className: "p-2.5 flex items-center justify-between",
                                            children: [
                                              _jsxs("div", {
                                                children: [
                                                  _jsx("span", { className: "font-medium text-[#202223]", children: it.title || "Product Item" }),
                                                  it.variant_title && _jsx("span", { className: "text-[11px] text-[#71717a] ml-1.5", children: it.variant_title }),
                                                ],
                                              }),
                                              _jsxs("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                  _jsxs("span", { className: "text-[#5c5f62]", children: ["Qty: ", it.quantity || 1] }),
                                                  _jsx("span", { className: "font-semibold text-[#202223]", children: formatPrice((it.unit_price || 0) * (it.quantity || 1)) }),
                                                ],
                                              }),
                                            ],
                                          },
                                          it.id || iIdx
                                        )
                                      ),
                                    }),
                                  ],
                                }),

                              // Staff Note if present
                              ret.note &&
                                _jsxs("div", {
                                  className: "text-xs text-[#5c5f62] italic",
                                  children: ["Staff note: \"", ret.note, "\""],
                                }),

                              // Inspection / Warehouse status banner
                              isRecv &&
                                _jsxs("div", {
                                  className: "p-2.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#15803d] flex items-center justify-between",
                                  children: [
                                    _jsxs("div", {
                                      className: "flex items-center gap-1.5",
                                      children: [
                                        _jsx("svg", {
                                          className: "w-4 h-4 text-[#16a34a]",
                                          fill: "currentColor",
                                          viewBox: "0 0 20 20",
                                          children: _jsx("path", {
                                            fillRule: "evenodd",
                                            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                            clipRule: "evenodd",
                                          }),
                                        }),
                                        _jsxs("span", {
                                          children: [
                                            "Parcel received and inspected on ",
                                            formatDate(ret.received_at),
                                            ret.restocked ? " (Restocked to inventory)" : "",
                                          ],
                                        }),
                                      ],
                                    }),
                                    ret.refund_issued &&
                                      _jsx("span", {
                                        className: "font-semibold text-[#15803d]",
                                        children: "Refund issued",
                                      }),
                                  ],
                                }),
                            ],
                          },
                          ret.id || idx
                        );
                      }),
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
                      _jsx("div", { children: order.metadata?.shipping_country || (shipping.country_code ? shipping.country_code.toUpperCase() : "United Kingdom") }),
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
                          _jsx("option", { value: "Royal Mail Tracked 24 / 48", children: "Royal Mail Tracked 24 / 48 (Domestic UK - £4.95)" }),
                          _jsx("option", { value: "Royal Mail International Tracked", children: "Royal Mail International Tracked (Worldwide - £15.00)" }),
                          _jsx("option", { value: "FedEx International Priority", children: "FedEx International Priority" }),
                          _jsx("option", { value: "DHL Express Worldwide", children: "DHL Express Worldwide" }),
                          _jsx("option", { value: "UPS Worldwide Saver", children: "UPS Worldwide Saver" }),
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

      // Refund Modal
      showRefundModal &&
        _jsx("div", {
          className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-2xl border border-[#e1e3e5] max-w-xl w-full p-6 space-y-4 my-8",
            children: [
              // Modal Header
              _jsxs("div", {
                className: "flex items-center justify-between border-b pb-3",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsxs("h3", {
                        className: "text-base font-bold text-[#202223]",
                        children: ["Refund items — #", order.display_id || order.id.slice(-4)],
                      }),
                      _jsx("p", {
                        className: "text-xs text-[#5c5f62] mt-0.5",
                        children: "Select items, quantities, and reasons to refund.",
                      }),
                    ],
                  }),
                  _jsx("button", {
                    onClick: () => setShowRefundModal(false),
                    className: "text-[#8c9196] hover:text-[#202223] text-lg font-bold",
                    children: "✕",
                  }),
                ],
              }),

              // Items Table
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsx("label", {
                    className: "block text-xs font-semibold text-[#202223]",
                    children: "Items to refund",
                  }),
                  _jsx("div", {
                    className: "border border-[#e1e3e5] rounded overflow-hidden max-h-52 overflow-y-auto",
                    children: _jsxs("table", {
                      className: "w-full text-left border-collapse text-xs",
                      children: [
                        _jsx("thead", {
                          children: _jsxs("tr", {
                            className: "bg-[#f6f6f7] border-b border-[#e1e3e5] text-[#5c5f62]",
                            children: [
                              _jsx("th", { className: "p-2 font-medium", children: "Product" }),
                              _jsx("th", { className: "p-2 font-medium text-right", children: "Price" }),
                              _jsx("th", { className: "p-2 font-medium text-center", children: "Refund Qty" }),
                              _jsx("th", { className: "p-2 font-medium text-right", children: "Subtotal" }),
                            ],
                          }),
                        }),
                        _jsx("tbody", {
                          className: "divide-y divide-[#e1e3e5]",
                          children: items.map((it) => {
                            const maxQty = it.quantity || 1;
                            const unitPrice = it.unit_price != null ? Number(it.unit_price) : (it.total ? Number(it.total) / maxQty : 0);
                            const currentQty = itemRefundQuantities[it.id] || 0;
                            const lineTotal = currentQty * unitPrice;
                            return _jsxs("tr", {
                              className: "hover:bg-[#fafbfb]",
                              children: [
                                _jsxs("td", {
                                  className: "p-2",
                                  children: [
                                    _jsx("div", { className: "font-medium text-[#202223]", children: it.title }),
                                    it.variant_title && _jsx("div", { className: "text-[11px] text-[#71717a]", children: it.variant_title }),
                                    _jsxs("div", { className: "text-[10px] text-[#8c9196]", children: ["Ordered: ", maxQty] }),
                                  ],
                                }),
                                _jsx("td", { className: "p-2 text-right text-[#5c5f62]", children: formatPrice(unitPrice) }),
                                _jsx("td", {
                                  className: "p-2 text-center",
                                  children: _jsx("input", {
                                    type: "number",
                                    min: "0",
                                    max: String(maxQty),
                                    value: currentQty,
                                    onChange: (e) => {
                                      const val = Math.max(0, Math.min(maxQty, parseInt(e.target.value) || 0));
                                      setItemRefundQuantities({ ...itemRefundQuantities, [it.id]: val });
                                    },
                                    className: "w-16 p-1 border border-[#c9cccf] rounded text-center text-xs bg-white text-[#202223]",
                                  }),
                                }),
                                _jsx("td", { className: "p-2 text-right font-semibold text-[#202223]", children: formatPrice(lineTotal) }),
                              ],
                            }, it.id);
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),

              // Shipping & Reason
              _jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsxs("label", {
                        className: "block text-xs font-semibold text-[#202223] mb-1",
                        children: ["Refund shipping (", formatPrice(shippingAmount), " max)"],
                      }),
                      _jsxs("div", {
                        className: "relative",
                        children: [
                          _jsx("span", { className: "absolute left-2.5 top-2 text-xs text-[#5c5f62]", children: "£" }),
                          _jsx("input", {
                            type: "number",
                            step: "0.01",
                            min: "0",
                            max: String(shippingAmount),
                            value: shippingRefundAmount,
                            onChange: (e) => setShippingRefundAmount(e.target.value),
                            placeholder: "0.00",
                            className: "w-full pl-6 pr-2 py-1.5 border border-[#c9cccf] rounded text-xs bg-white text-[#202223]",
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("label", {
                        className: "block text-xs font-semibold text-[#202223] mb-1",
                        children: "Reason for refund",
                      }),
                      _jsx("select", {
                        value: selectedReasonId,
                        onChange: (e) => setSelectedReasonId(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded p-1.5 text-xs bg-white text-[#202223]",
                        children: refundReasons.map((r) =>
                          _jsx("option", { value: r.id, children: r.label }, r.id)
                        ),
                      }),
                    ],
                  }),
                ],
              }),

              // Restock Checkbox
              _jsxs("div", {
                className: "flex items-center gap-2 pt-1",
                children: [
                  _jsx("input", {
                    type: "checkbox",
                    id: "restock_items_check",
                    checked: restockItems,
                    onChange: (e) => setRestockItems(e.target.checked),
                    className: "rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060]",
                  }),
                  _jsx("label", {
                    htmlFor: "restock_items_check",
                    className: "text-xs text-[#202223] select-none cursor-pointer",
                    children: "Restock items back into available inventory",
                  }),
                ],
              }),

              // Note Textarea
              _jsxs("div", {
                children: [
                  _jsx("label", {
                    className: "block text-xs font-semibold text-[#202223] mb-1",
                    children: "Staff note (reason for customer refund)",
                  }),
                  _jsx("textarea", {
                    rows: 2,
                    value: refundNote,
                    onChange: (e) => setRefundNote(e.target.value),
                    placeholder: "E.g. Customer cancelled order prior to dispatch / courier transit delay.",
                    className: "w-full border border-[#c9cccf] rounded p-2 text-xs resize-none bg-white text-[#202223]",
                  }),
                ],
              }),

              // Summary Box
              _jsxs("div", {
                className: "bg-[#fafbfb] border border-[#e1e3e5] rounded p-3 text-xs space-y-1.5",
                children: [
                  _jsxs("div", {
                    className: "flex justify-between text-[#5c5f62]",
                    children: [
                      _jsx("span", { children: "Items to refund:" }),
                      _jsx("span", { children: formatPrice(calculatedItemsTotal) }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "flex justify-between text-[#5c5f62]",
                    children: [
                      _jsx("span", { children: "Shipping to refund:" }),
                      _jsx("span", { children: formatPrice(Number(shippingRefundAmount || 0)) }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "flex justify-between font-bold text-sm text-[#d72c0d] border-t border-[#e1e3e5] pt-1.5 mt-1.5",
                    children: [
                      _jsx("span", { children: "Total refund amount:" }),
                      _jsxs("span", { children: ["-", formatPrice(calculatedTotalRefund)] }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "flex justify-between text-[11px] text-[#5c5f62] pt-0.5",
                    children: [
                      _jsx("span", { children: "Remaining order balance after refund:" }),
                      _jsx("span", { children: formatPrice(Math.max(0, total - (refundedTotal + calculatedTotalRefund))) }),
                    ],
                  }),
                ],
              }),

              // Modal Footer Buttons
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-3 border-t",
                children: [
                  _jsx("button", {
                    type: "button",
                    onClick: () => setShowRefundModal(false),
                    className: "px-4 py-2 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] rounded hover:bg-[#f6f6f7]",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    type: "button",
                    disabled: isRefunding || calculatedTotalRefund <= 0,
                    onClick: handleProcessRefund,
                    className: `px-4 py-2 text-xs font-semibold text-white rounded shadow-sm transition ${
                      calculatedTotalRefund <= 0 || isRefunding
                        ? "bg-[#c9cccf] cursor-not-allowed"
                        : "bg-[#d72c0d] hover:bg-[#bc2200]"
                    }`,
                    children: isRefunding ? "Processing refund..." : `Refund ${formatPrice(calculatedTotalRefund)}`,
                  }),
                ],
              }),
            ],
          }),
        }),

      // ==================== RETURN MODAL ====================
      showReturnModal &&
        _jsx("div", {
          className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-2xl border border-[#e1e3e5] max-w-xl w-full p-6 space-y-4 my-8",
            children: [
              // Header
              _jsxs("div", {
                className: "flex items-center justify-between border-b pb-3",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsxs("h3", {
                        className: "text-base font-bold text-[#202223]",
                        children: ["Request return — #", order.display_id || order.id.slice(-4)],
                      }),
                      _jsx("p", {
                        className: "text-xs text-[#5c5f62] mt-0.5",
                        children: "Select products and quantities to return, and assign return carrier details.",
                      }),
                    ],
                  }),
                  _jsx("button", {
                    onClick: () => setShowReturnModal(false),
                    className: "text-[#8c9196] hover:text-[#202223] text-lg font-bold",
                    children: "✕",
                  }),
                ],
              }),

              // Items to return
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsx("label", {
                    className: "block text-xs font-semibold text-[#202223]",
                    children: "Select items to return",
                  }),
                  _jsx("div", {
                    className: "border border-[#e1e3e5] rounded overflow-hidden max-h-52 overflow-y-auto",
                    children: _jsxs("table", {
                      className: "w-full text-left border-collapse text-xs",
                      children: [
                        _jsx("thead", {
                          children: _jsxs("tr", {
                            className: "bg-[#f6f6f7] border-b border-[#e1e3e5] text-[#5c5f62]",
                            children: [
                              _jsx("th", { className: "p-2 font-medium", children: "Product" }),
                              _jsx("th", { className: "p-2 font-medium text-right", children: "Unit Price" }),
                              _jsx("th", { className: "p-2 font-medium text-center", children: "Return Qty" }),
                              _jsx("th", { className: "p-2 font-medium text-right", children: "Total" }),
                            ],
                          }),
                        }),
                        _jsx("tbody", {
                          className: "divide-y divide-[#e1e3e5]",
                          children: items.map((it) => {
                            const maxQty = it.quantity || 1;
                            const unitPrice = it.unit_price != null ? Number(it.unit_price) : (it.total ? Number(it.total) / maxQty : 0);
                            const currentQty = itemReturnQuantities[it.id] || 0;
                            const lineTotal = currentQty * unitPrice;

                            return _jsxs(
                              "tr",
                              {
                                className: "hover:bg-[#fafbfb]",
                                children: [
                                  _jsxs("td", {
                                    className: "p-2",
                                    children: [
                                      _jsx("div", { className: "font-medium text-[#202223]", children: it.title }),
                                      it.variant_title && _jsx("div", { className: "text-[11px] text-[#71717a]", children: it.variant_title }),
                                      _jsxs("div", { className: "text-[10px] text-[#8c9196]", children: ["Ordered: ", maxQty] }),
                                    ],
                                  }),
                                  _jsx("td", { className: "p-2 text-right text-[#5c5f62]", children: formatPrice(unitPrice) }),
                                  _jsx("td", {
                                    className: "p-2 text-center",
                                    children: _jsx("input", {
                                      type: "number",
                                      min: "0",
                                      max: String(maxQty),
                                      value: currentQty,
                                      onChange: (e) => {
                                        const val = Math.max(0, Math.min(maxQty, parseInt(e.target.value) || 0));
                                        setItemReturnQuantities({ ...itemReturnQuantities, [it.id]: val });
                                      },
                                      className: "w-16 p-1 border border-[#c9cccf] rounded text-center text-xs bg-white text-[#202223]",
                                    }),
                                  }),
                                  _jsx("td", { className: "p-2 text-right font-semibold text-[#202223]", children: formatPrice(lineTotal) }),
                                ],
                              },
                              it.id
                            );
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),

              // Reason selection & Carrier
              _jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx("label", {
                        className: "block text-xs font-semibold text-[#202223] mb-1",
                        children: "Return reason",
                      }),
                      _jsx("select", {
                        value: selectedReturnReasonId,
                        onChange: (e) => setSelectedReturnReasonId(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded p-1.5 text-xs bg-white text-[#202223]",
                        children: returnReasons.map((r) =>
                          _jsx("option", { value: r.id, children: r.label }, r.id)
                        ),
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("label", {
                        className: "block text-xs font-semibold text-[#202223] mb-1",
                        children: "Return Carrier",
                      }),
                      _jsxs("select", {
                        value: returnCarrier,
                        onChange: (e) => setReturnCarrier(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded p-1.5 text-xs bg-white text-[#202223]",
                        children: [
                          _jsx("option", { value: "Royal Mail Tracked Return", children: "Royal Mail Tracked Return" }),
                          _jsx("option", { value: "Royal Mail International Tracked Return", children: "Royal Mail International Tracked Return" }),
                          _jsx("option", { value: "FedEx Return", children: "FedEx Return" }),
                          _jsx("option", { value: "DHL Express Return", children: "DHL Express Return" }),
                          _jsx("option", { value: "Customer Self-Dispatch", children: "Customer Self-Dispatch" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Tracking Number
              _jsxs("div", {
                children: [
                  _jsx("label", {
                    className: "block text-xs font-semibold text-[#202223] mb-1",
                    children: "Return Tracking Number (Optional / Generated)",
                  }),
                  _jsx("input", {
                    type: "text",
                    value: returnTracking,
                    onChange: (e) => setReturnTracking(e.target.value),
                    placeholder: "e.g. RM882910243GB or leave blank if prepaid label pending",
                    className: "w-full border border-[#c9cccf] rounded p-2 text-xs bg-white text-[#202223]",
                  }),
                ],
              }),

              // Staff Note
              _jsxs("div", {
                children: [
                  _jsx("label", {
                    className: "block text-xs font-semibold text-[#202223] mb-1",
                    children: "Return notes / Lab instructions",
                  }),
                  _jsx("textarea", {
                    rows: 2,
                    value: returnNote,
                    onChange: (e) => setReturnNote(e.target.value),
                    placeholder: "Details regarding item defect, batch verification, or package condition...",
                    className: "w-full border border-[#c9cccf] rounded p-2 text-xs resize-none bg-white text-[#202223]",
                  }),
                ],
              }),

              // Footer Buttons
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-3 border-t",
                children: [
                  _jsx("button", {
                    type: "button",
                    onClick: () => setShowReturnModal(false),
                    className: "px-4 py-2 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] rounded hover:bg-[#f6f6f7]",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    type: "button",
                    disabled: isSubmittingReturn,
                    onClick: handleRequestReturn,
                    className: "px-4 py-2 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm transition disabled:opacity-50",
                    children: isSubmittingReturn ? "Creating return..." : "Submit Return Request",
                  }),
                ],
              }),
            ],
          }),
        }),

      // ==================== RECEIVE RETURN MODAL ====================
      showReceiveModal && activeReturnToReceive &&
        _jsx("div", {
          className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto",
          children: _jsxs("div", {
            className: "bg-white rounded-lg shadow-2xl border border-[#e1e3e5] max-w-md w-full p-6 space-y-4 my-8",
            children: [
              // Header
              _jsxs("div", {
                className: "flex items-center justify-between border-b pb-3",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx("h3", {
                        className: "text-base font-bold text-[#202223]",
                        children: "Receive & Inspect Returned Parcel",
                      }),
                      _jsxs("p", {
                        className: "text-xs text-[#5c5f62] mt-0.5",
                        children: ["Confirm physical receipt at lab for return #RET-", order.display_id || order.id.slice(-4), "-", activeReturnToReceive.display_id || 1],
                      }),
                    ],
                  }),
                  _jsx("button", {
                    onClick: () => setShowReceiveModal(false),
                    className: "text-[#8c9196] hover:text-[#202223] text-lg font-bold",
                    children: "✕",
                  }),
                ],
              }),

              // Items summary
              _jsxs("div", {
                className: "p-3 bg-[#fafbfb] border border-[#e1e3e5] rounded text-xs space-y-2",
                children: [
                  _jsx("div", { className: "font-semibold text-[#202223]", children: "Returned Items to Receive:" }),
                  (activeReturnToReceive.items || []).map((it, idx) =>
                    _jsxs("div", {
                      key: it.id || idx,
                      className: "flex justify-between text-[#5c5f62]",
                      children: [
                        _jsxs("span", { children: [it.title, " × ", it.quantity || 1] }),
                        _jsx("span", { className: "font-medium text-[#202223]", children: formatPrice((it.unit_price || 0) * (it.quantity || 1)) }),
                      ],
                    })
                  ),
                ],
              }),

              // Restock Checkbox
              _jsxs("div", {
                className: "flex items-center gap-2 pt-1",
                children: [
                  _jsx("input", {
                    type: "checkbox",
                    id: "receive_restock_check",
                    checked: receiveRestock,
                    onChange: (e) => setReceiveRestock(e.target.checked),
                    className: "rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060]",
                  }),
                  _jsx("label", {
                    htmlFor: "receive_restock_check",
                    className: "text-xs text-[#202223] select-none cursor-pointer",
                    children: "Restock verified items back into warehouse inventory",
                  }),
                ],
              }),

              // Issue Refund Checkbox
              _jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  _jsx("input", {
                    type: "checkbox",
                    id: "receive_refund_check",
                    checked: receiveRefund,
                    onChange: (e) => setReceiveRefund(e.target.checked),
                    className: "rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060]",
                  }),
                  _jsxs("label", {
                    htmlFor: "receive_refund_check",
                    className: "text-xs text-[#202223] select-none cursor-pointer",
                    children: [
                      "Automatically issue refund for returned items (",
                      formatPrice(activeReturnToReceive.items_value || (activeReturnToReceive.items || []).reduce((acc, it) => acc + ((it.unit_price || 0) * (it.quantity || 1)), 0)),
                      ")",
                    ],
                  }),
                ],
              }),

              // Action buttons
              _jsxs("div", {
                className: "flex items-center justify-end gap-2 pt-3 border-t",
                children: [
                  _jsx("button", {
                    type: "button",
                    onClick: () => setShowReceiveModal(false),
                    className: "px-4 py-2 text-xs font-medium text-[#202223] bg-white border border-[#c9cccf] rounded hover:bg-[#f6f6f7]",
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    type: "button",
                    disabled: isSubmittingReturn,
                    onClick: handleConfirmReceiveReturn,
                    className: "px-4 py-2 text-xs font-semibold text-white bg-[#008060] hover:bg-[#006e52] rounded shadow-sm transition disabled:opacity-50",
                    children: isSubmittingReturn ? "Processing intake..." : "Confirm & Receive Return",
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
