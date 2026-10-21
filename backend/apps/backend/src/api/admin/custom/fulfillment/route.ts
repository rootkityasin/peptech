import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  cancelOrderFulfillmentWorkflow,
} from "@medusajs/core-flows";

const CLICK_AND_DROP_BASE_URL =
  process.env.ROYAL_MAIL_CLICK_AND_DROP_URL ||
  "https://api.parcel.royalmail.com/api/v1";
const CLICK_AND_DROP_TOKEN =
  process.env.CLICKANDDROP_AUTH_KEY || process.env.CLICKANDDROP_AUTH_KYE;

/**
 * Service name mapping for display and order tracking
 */
const SERVICE_NAMES: Record<string, string> = {
  AUTO: "Royal Mail (Click & Drop Automatic Rules)",
  OLP1: "Royal Mail 24 (Online Postage)",
  OLP2: "Royal Mail 48 (Online Postage)",
  TPN: "Royal Mail Tracked 24",
  TPS: "Royal Mail Tracked 48",
  TRM: "Royal Mail Tracked 24 (Signature)",
  TRN: "Royal Mail Tracked 48 (Signature)",
  SD1: "Royal Mail Special Delivery Guaranteed by 1pm",
  OTA: "Royal Mail International Tracked",
  OTC: "Royal Mail International Tracked & Signed",
  OLS: "Royal Mail International Signed",
  MP1: "Royal Mail International Standard",
};

/**
 * Helper to fetch order with complete cross-module links (payments, collections, captures, summary)
 */
async function fetchOrderWithPaymentDetails(scope: any, orderId: string) {
  try {
    const query =
      scope.resolve(ContainerRegistrationKeys.QUERY) || scope.resolve("query");
    if (query) {
      const { data } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "status",
          "payment_status",
          "fulfillment_status",
          "total",
          "subtotal",
          "currency_code",
          "metadata",
          "email",
          "items.*",
          "shipping_address.*",
          "shipping_methods.*",
          "payment_collections.*",
          "payment_collections.status",
          "payment_collections.captured_amount",
          "payment_collections.authorized_amount",
          "payment_collections.payments.*",
          "payment_collections.payments.status",
          "payment_collections.payments.captured_at",
          "payment_collections.payments.captures.*",
          "summary.*",
        ],
        filters: { id: orderId },
      });
      if (data && data.length > 0) {
        return data[0];
      }
    }
  } catch (err: any) {
    console.warn(
      "[FULFILLMENT] query.graph retrieval error, using fallback:",
      err.message,
    );
  }

  const orderModule: any = scope.resolve(Modules.ORDER);
  return await orderModule
    .retrieveOrder(orderId, {
      relations: ["items", "shipping_address", "shipping_methods"],
    })
    .catch(() => null);
}

const SUCCESS_PAYMENT_STATUSES = [
  "paid",
  "captured",
  "authorized",
  "partially_captured",
  "settled",
  "succeeded",
  "completed",
];

function isOrderPaymentSuccessful(order: any): boolean {
  if (!order) return false;

  const rawPaymentStatus = String(order.payment_status || "").toLowerCase();
  const rawOrderStatus = String(order.status || "").toLowerCase();
  const metaPaymentStatus = String(
    order.metadata?.payment_status || "",
  ).toLowerCase();

  // 1. Direct payment_status field
  if (SUCCESS_PAYMENT_STATUSES.includes(rawPaymentStatus)) return true;

  // 2. Metadata payment status flags
  if (SUCCESS_PAYMENT_STATUSES.includes(metaPaymentStatus)) return true;
  if (order.metadata?.settled === true || order.metadata?.is_paid === true)
    return true;

  // 3. Completed order workflow status
  if (rawOrderStatus === "completed") return true;

  // 4. Order Summary paid total
  const summaryPaid = Number(
    order.summary?.paid_total ?? order.summary?.raw_paid_total?.value ?? 0,
  );
  if (summaryPaid > 0) return true;

  // 5. Payment Collections and Payments
  if (
    Array.isArray(order.payment_collections) &&
    order.payment_collections.length > 0
  ) {
    for (const pc of order.payment_collections) {
      const pcStatus = String(pc?.status || "").toLowerCase();
      if (SUCCESS_PAYMENT_STATUSES.includes(pcStatus)) return true;
      if (
        Number(pc?.captured_amount || 0) > 0 ||
        Number(pc?.authorized_amount || 0) > 0
      )
        return true;

      if (Array.isArray(pc.payments)) {
        for (const p of pc.payments) {
          const pStatus = String(p?.status || "").toLowerCase();
          if (SUCCESS_PAYMENT_STATUSES.includes(pStatus)) return true;
          if (p?.captured_at != null) return true;
          if (Array.isArray(p.captures) && p.captures.length > 0) return true;
          if (Number(p?.captured_amount || 0) > 0) return true;
        }
      }
    }
  }

  return false;
}

function getOrderPaymentStatusDisplay(order: any): string {
  if (!order) return "unpaid";
  if (order.payment_status && order.payment_status !== "not_paid")
    return order.payment_status;
  if (order.metadata?.payment_status) return order.metadata.payment_status;
  if (
    Array.isArray(order.payment_collections) &&
    order.payment_collections.length > 0
  ) {
    const pc = order.payment_collections[0];
    if (pc?.status) return pc.status;
    if (Array.isArray(pc?.payments) && pc.payments[0]?.status)
      return pc.payments[0].status;
  }
  return order.payment_status || order.status || "unpaid";
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const {
    orderId,
    orderIdentifier,
    documentType = "postageLabel",
    format = "json",
  } = (req.query || {}) as any;

  // Dedicated label retrieval / reprint support
  if (orderId || orderIdentifier) {
    let labelBase64 = "";
    let isUk = true;

    if (orderId) {
      const order: any = await fetchOrderWithPaymentDetails(req.scope, orderId);

      if (order) {
        labelBase64 = order.metadata?.shipping_label_pdf || "";
        const country =
          order.shipping_address?.country_code ||
          order.metadata?.shipping_country_code ||
          "GB";
        isUk = String(country).toUpperCase() === "GB";
      }
    }

    // Attempt live fetch from Click & Drop API if token is configured
    if (CLICK_AND_DROP_TOKEN && orderIdentifier) {
      try {
        const isNumeric = /^\d+$/.test(String(orderIdentifier));
        const formattedId = isNumeric
          ? String(orderIdentifier)
          : encodeURIComponent(`"${orderIdentifier}"`);
        const query = new URLSearchParams({
          documentType: String(documentType),
          includeReturnsLabel: "false",
          includeCN: String(!isUk),
        });
        const labelUrl = `${CLICK_AND_DROP_BASE_URL}/orders/${formattedId}/label?${query.toString()}`;
        const labelRes = await fetch(labelUrl, {
          headers: {
            Authorization: `Bearer ${CLICK_AND_DROP_TOKEN}`,
            Accept: "application/pdf, application/json",
          },
        });

        if (labelRes.ok) {
          const contentType = labelRes.headers.get("content-type") || "";
          if (contentType.includes("application/pdf")) {
            const buf = await labelRes.arrayBuffer();
            if (format === "pdf") {
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                `inline; filename="RM-Label-${orderIdentifier}.pdf"`,
              );
              return res.status(200).send(Buffer.from(buf));
            }
            labelBase64 = Buffer.from(buf).toString("base64");
          }
        }
      } catch (err: any) {
        console.warn("[CLICK AND DROP LABEL GET ERROR]:", err.message);
      }
    }

    if (labelBase64) {
      if (format === "pdf") {
        const cleanBase64 = labelBase64
          .replace(/^data:application\/pdf;base64,/, "")
          .trim();
        const buf = Buffer.from(cleanBase64, "base64");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="RM-Label-${orderIdentifier || orderId}.pdf"`,
        );
        return res.status(200).send(buf);
      }

      return res.status(200).json({
        success: true,
        orderId,
        orderIdentifier,
        documentType,
        labelBase64,
      });
    }

    return res
      .status(404)
      .json({ message: "Shipping label not found for the requested order." });
  }

  return res.status(200).json({
    carrier: "Royal Mail",
    services: [
      {
        code: "AUTO",
        name: "Auto (Click & Drop Rules / Default)",
        is_default: true,
      },
      { code: "OLP1", name: "Royal Mail 24 (Online Postage)", region: "UK" },
      { code: "OLP2", name: "Royal Mail 48 (Online Postage)", region: "UK" },
      {
        code: "TPN",
        name: "Royal Mail Tracked 24 (OBA Contract)",
        region: "UK",
      },
      {
        code: "TPS",
        name: "Royal Mail Tracked 48 (OBA Contract)",
        region: "UK",
      },
      {
        code: "TRM",
        name: "Royal Mail Tracked 24 with Signature",
        region: "UK",
      },
      { code: "SD1", name: "Special Delivery Guaranteed by 1pm", region: "UK" },
      {
        code: "OTA",
        name: "Royal Mail International Tracked (OBA)",
        region: "INTL",
      },
      {
        code: "OTC",
        name: "Royal Mail International Tracked & Signed (OBA)",
        region: "INTL",
      },
      {
        code: "OLS",
        name: "Royal Mail International Signed (OBA)",
        region: "INTL",
      },
    ],
    is_live_configured: Boolean(CLICK_AND_DROP_TOKEN),
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      orderId,
      serviceCode = "AUTO",
      weightInGrams = 240,
      packageFormatIdentifier = "smallParcel",
      dimensions,
      includeLabelInResponse = true,
    } = req.body as any;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const orderModule: any = req.scope.resolve(Modules.ORDER);
    const order: any = await fetchOrderWithPaymentDetails(req.scope, orderId);

    if (!order) {
      return res.status(404).json({ message: `Order '${orderId}' not found` });
    }

    // Gate 1: Check Fulfillment Hold Status
    if (order.metadata?.fulfillment_hold === true || (order.metadata?.peptech_receipt_id && order.metadata?.fulfillment_hold !== false)) {
      return res.status(400).json({
        message: "Order is currently on fulfillment hold (RUO allocation / compliance review pending). Release the hold before dispatch.",
      });
    }

    // Gate 2: Check Payment Status (supports Medusa 2.0 captured, authorized, completed, summary paid total, collections, and metadata)
    const isPaid = isOrderPaymentSuccessful(order);

    if (!isPaid) {
      const currentStatus = getOrderPaymentStatusDisplay(order);
      return res.status(400).json({
        message: `Order payment status is '${currentStatus}'. Payment must be captured, authorized, or marked as paid before generating a shipping fulfillment label.`,
      });
    }

    const shipping: any = order.shipping_address || {};
    const rawCountryCode =
      shipping.country_code || order.metadata?.shipping_country_code || "GB";
    const countryCode = String(rawCountryCode).toUpperCase();
    const isUk = countryCode === "GB";
    const rawServiceCode = String(serviceCode || "AUTO").toUpperCase();
    const carrierName =
      SERVICE_NAMES[rawServiceCode] ||
      (isUk ? "Royal Mail 24" : "Royal Mail International");
    const orderRef = order.display_id
      ? `PEP-${order.display_id}`
      : String(order.id);

    // Helper to build Click & Drop payload
    const buildPayload = (sCode: string) => {
      const isAuto = !sCode || sCode === "AUTO";
      const isOlp = sCode === "OLP1" || sCode === "OLP2";

      const postageDetails = isAuto
        ? undefined
        : {
            serviceCode: sCode,
            sendNotificationsTo: "recipient",
            receiveEmailNotification: !isOlp,
            receiveSmsNotification: Boolean(shipping.phone && !isOlp),
          };

      return {
        items: [
          {
            orderReference: `${orderRef}-${Date.now().toString().slice(-4)}`,
            orderDate: new Date().toISOString(),
            subtotal: Number(order.subtotal || order.total || 0),
            shippingCostCharged: Number(
              order.shipping_methods?.[0]?.amount || (isUk ? 4.95 : 15.0),
            ),
            total: Number(order.total || 0),
            currencyCode: (order.currency_code || "GBP").toUpperCase(),
            recipient: {
              address: {
                fullName:
                  `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() ||
                  "Researcher",
                companyName: shipping.company || undefined,
                addressLine1:
                  shipping.address_1 || "Laboratory Delivery Address",
                addressLine2: shipping.address_2 || undefined,
                city: shipping.city || "",
                county: shipping.province || undefined,
                postcode: shipping.postal_code || "",
                countryCode,
              },
              phoneNumber: shipping.phone || undefined,
              emailAddress: order.email,
            },
            packages: [
              {
                weightInGrams: Math.max(1, Number(weightInGrams || 240)),
                packageFormatIdentifier:
                  packageFormatIdentifier || "smallParcel",
                dimensions: dimensions
                  ? {
                      heightInMms: Math.max(
                        1,
                        Number(dimensions.heightInMms || 80),
                      ),
                      widthInMms: Math.max(
                        1,
                        Number(dimensions.widthInMms || 160),
                      ),
                      depthInMms: Math.max(
                        1,
                        Number(dimensions.depthInMms || 220),
                      ),
                    }
                  : undefined,
                contents: (order.items || []).map((it: any) => ({
                  name: "Laboratory Chemical Reagents (RUO)",
                  SKU: (
                    it.variant_sku ||
                    it.metadata?.sku ||
                    "PEP-LAB-01"
                  ).slice(0, 40),
                  quantity: Math.max(1, Number(it.quantity || 1)),
                  unitValue: Number(it.unit_price || 0),
                  unitWeightInGrams: Math.max(
                    1,
                    Math.round(
                      Number(weightInGrams || 240) /
                        Math.max(1, order.items?.length || 1),
                    ),
                  ),
                  customsDescription:
                    "Synthetic biochemical reagents for research (RUO)".slice(0, 50),
                  customsCode: "29371900",
                  originCountryCode: "GB",
                })),
              },
            ],
            ...(postageDetails ? { postageDetails } : {}),
            label: {
              includeLabelInResponse: Boolean(includeLabelInResponse),
              includeCN: !isUk,
              includeReturnsLabel: false,
            },
          },
        ],
      };
    };

    let trackingNumber = "";
    let orderIdentifier: number | string = "";
    let labelBase64 = "";
    let cndData: any = null;
    let labelErrors: any[] = [];
    let officialCarrierLabelReceived = false;

    if (CLICK_AND_DROP_TOKEN) {
      try {
        let payload = buildPayload(rawServiceCode);
        let cndResponse = await fetch(`${CLICK_AND_DROP_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CLICK_AND_DROP_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        cndData = await cndResponse.json().catch(() => ({}));

        // If specific service code failed (error code 31 or 55), retry with AUTO default
        if (
          (!cndResponse.ok || cndData.errorsCount > 0) &&
          rawServiceCode !== "AUTO"
        ) {
          console.warn(
            "[CLICK & DROP RETRY]: Specific service code rejected, falling back to AUTO rules...",
            cndData,
          );
          payload = buildPayload("AUTO");
          cndResponse = await fetch(`${CLICK_AND_DROP_BASE_URL}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CLICK_AND_DROP_TOKEN}`,
            },
            body: JSON.stringify(payload),
          });
          cndData = await cndResponse.json().catch(() => ({}));
        }

        if (!cndResponse.ok || cndData.errorsCount > 0) {
          const errMsg =
            cndData.failedOrders?.[0]?.errors?.[0]?.errorMessage ||
            cndData.message ||
            "Failed to create shipment in Royal Mail Click & Drop";
          return res.status(400).json({ message: errMsg, details: cndData });
        }

        const createdOrder = cndData.createdOrders?.[0];
        orderIdentifier =
          createdOrder?.orderIdentifier || `RM-ORD-${Date.now()}`;
        trackingNumber =
          createdOrder?.trackingNumber ||
          createdOrder?.packages?.[0]?.trackingNumber ||
          "";
        labelBase64 = createdOrder?.label || "";
        labelErrors = createdOrder?.labelErrors || [];
        if (labelErrors.length > 0) {
          console.warn(
            "[CLICK AND DROP LABEL GENERATION ERRORS]:",
            JSON.stringify(labelErrors),
          );
        }

        officialCarrierLabelReceived = Boolean(createdOrder?.label);

        // If label was requested but not returned directly, try fetching from dedicated /label endpoint
        if (includeLabelInResponse && !labelBase64 && orderIdentifier) {
          try {
            const isNumeric = /^\d+$/.test(String(orderIdentifier));
            const formattedId = isNumeric
              ? String(orderIdentifier)
              : encodeURIComponent(`"${orderIdentifier}"`);
            const labelParams = new URLSearchParams({
              documentType: "postageLabel",
              includeReturnsLabel: "false",
              includeCN: String(!isUk),
            });
            const labelUrl = `${CLICK_AND_DROP_BASE_URL}/orders/${formattedId}/label?${labelParams.toString()}`;
            const labelRes = await fetch(labelUrl, {
              headers: {
                Authorization: `Bearer ${CLICK_AND_DROP_TOKEN}`,
                Accept: "application/pdf, application/json",
              },
            });
            if (labelRes.ok) {
              const contentType = labelRes.headers.get("content-type") || "";
              if (contentType.includes("application/pdf")) {
                const arrayBuffer = await labelRes.arrayBuffer();
                labelBase64 = Buffer.from(arrayBuffer).toString("base64");
                officialCarrierLabelReceived = true;
              } else {
                const jsonResp = await labelRes.json().catch(() => ({}));
                if (typeof jsonResp.label === "string") {
                  labelBase64 = jsonResp.label;
                  officialCarrierLabelReceived = true;
                }
              }
            } else {
              const errText = await labelRes.text().catch(() => "");
              console.warn(
                `[CLICK AND DROP LABEL FETCH WARN ${labelRes.status}]:`,
                errText,
              );
              if (labelRes.status === 403 || errText.includes("Forbidden")) {
                labelErrors.push({
                  code: "OBA_REQUIRED",
                  message:
                    "Royal Mail API label printing requires an active OBA account. Order was saved to Click & Drop.",
                });
              }
            }
          } catch (lblErr) {
            console.warn("[CLICK AND DROP LABEL FETCH WARN]:", lblErr);
          }
        }

        if (!officialCarrierLabelReceived && labelErrors.length === 0) {
          labelErrors.push({
            code: "OBA_REQUIRED",
            message:
              "Royal Mail API label printing requires an active OBA account. Order was saved to Click & Drop.",
          });
        }
      } catch (apiErr: any) {
        return res.status(502).json({
          message: `Royal Mail Click & Drop API communication error: ${apiErr.message}`,
        });
      }
    }

    // Tracking and Label: only record genuine carrier data, never synthetic VQ...GB labels
    if (!orderIdentifier) {
      orderIdentifier = Math.floor(10000000 + Math.random() * 90000000);
    }

    const trackingUrl = trackingNumber
      ? `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`
      : undefined;

    const body = (req.body || {}) as any;
    const isOfficialLabel = officialCarrierLabelReceived;
    if (!isOfficialLabel) {
      labelBase64 = "";
    }

    // Resolve items to fulfill
    let itemsToFulfill: Array<{ id: string; quantity: number }> = [];
    if (Array.isArray(body.items) && body.items.length > 0) {
      itemsToFulfill = body.items.map((it: any) => ({
        id: String(it.id),
        quantity: Math.max(1, Number(it.quantity || 1)),
      }));
    } else if (body.quantity && typeof body.quantity === "object") {
      itemsToFulfill = Object.entries(body.quantity)
        .map(([id, quantity]) => ({ id, quantity: Number(quantity) }))
        .filter((it) => it.quantity > 0);
    } else {
      itemsToFulfill = (order.items || [])
        .map((it: any) => {
          const qty = Number(it.quantity || 1);
          const fulfilled = Number(it.detail?.fulfilled_quantity || 0);
          return {
            id: it.id,
            quantity: Math.max(0, qty - fulfilled),
          };
        })
        .filter((it: any) => it.quantity > 0);
    }

    // Resolve Location ID
    let locationId = body.location_id;
    if (!locationId) {
      try {
        const stockLocationModule: any = req.scope.resolve(
          Modules.STOCK_LOCATION,
        );
        const [locations] = await stockLocationModule.listStockLocations(
          {},
          { take: 1 },
        );
        if (locations?.id) {
          locationId = locations.id;
        }
      } catch (e) {
        locationId = "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ";
      }
    }
    if (!locationId) {
      locationId = "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ";
    }

    // Resolve Shipping Option ID from the request, the order, then commerce settings
    let shippingOptionId =
      body.shipping_option_id ||
      order.shipping_methods?.[0]?.shipping_option_id;
    if (!shippingOptionId) {
      try {
        const settings = await (req.scope
          .resolve("peptechCommerce") as any)
          .get("commerce_settings");
        shippingOptionId = settings?.data?.shipping_option_id || null;
      } catch {
        shippingOptionId = null;
      }
    }
    if (!shippingOptionId) {
      return res.status(409).json({
        message:
          "No shipping option is recorded on this order. Set a default shipping option in Commerce settings before fulfilling.",
      });
    }

    // Execute Medusa 2.0 Core Workflows
    let createdFulfillment: any = null;
    if (itemsToFulfill.length > 0) {
      try {
        const { result: fResult } = await createOrderFulfillmentWorkflow(
          req.scope,
        ).run({
          input: {
            order_id: order.id,
            items: itemsToFulfill,
            location_id: locationId,
            shipping_option_id: shippingOptionId,
            no_notification: body.no_notification === true,
            metadata: {
              carrier: carrierName,
              service_code: rawServiceCode,
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
              royal_mail_order_identifier: orderIdentifier,
              shipping_label_pdf: labelBase64,
              is_official_carrier_label: isOfficialLabel,
            },
          },
        });
        createdFulfillment = fResult;

        if (createdFulfillment?.id) {
          try {
            await createOrderShipmentWorkflow(req.scope).run({
              input: {
                order_id: order.id,
                fulfillment_id: createdFulfillment.id,
                items: itemsToFulfill,
                labels: trackingNumber
                  ? [
                      {
                        tracking_number: trackingNumber,
                        tracking_url: trackingUrl || "",
                        label_url: labelBase64
                          ? `/admin/custom/fulfillment?orderIdentifier=${orderIdentifier}&format=pdf`
                          : (trackingUrl || ""),
                      },
                    ]
                  : [],
                no_notification: body.no_notification === true,
                metadata: {
                  carrier: carrierName,
                  service_code: rawServiceCode,
                  royal_mail_order_identifier: orderIdentifier,
                  shipping_label_pdf: labelBase64,
                },
              },
            });
          } catch (shipErr: any) {
            console.warn("[FULFILLMENT SHIPMENT STEP WARN]:", shipErr.message);
          }
        }
      } catch (flowErr: any) {
        console.warn("[MEDUSA FULFILLMENT WORKFLOW WARN]:", flowErr.message);
      }
    }

    // Update Medusa 2.0 Order Record Metadata for complete compatibility
    const existingFulfillments = Array.isArray(order.metadata?.fulfillments)
      ? [...order.metadata.fulfillments]
      : [];
    const newFulfillmentObj = {
      id:
        createdFulfillment?.id ||
        `${order.display_id || order.id}-RM${existingFulfillments.length + 1}`,
      carrier: carrierName,
      service_code: rawServiceCode,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      order_identifier: orderIdentifier,
      weight_in_grams: weightInGrams,
      package_format: packageFormatIdentifier,
      shipping_label_pdf: labelBase64,
      shipped_at: new Date().toISOString(),
      status: "fulfilled",
      is_official_carrier_label: isOfficialLabel,
      label_errors: labelErrors.length > 0 ? labelErrors : undefined,
    };

    await orderModule.updateOrders(order.id, {
      metadata: {
        ...(order.metadata || {}),
        fulfillment_status: "fulfilled",
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipping_carrier: carrierName,
        shipping_service_code: rawServiceCode,
        shipping_label_pdf: labelBase64,
        royal_mail_order_identifier: orderIdentifier,
        is_official_carrier_label: isOfficialLabel,
        label_errors: labelErrors.length > 0 ? labelErrors : undefined,
        fulfillments: [...existingFulfillments, newFulfillmentObj],
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      fulfillmentId: createdFulfillment?.id,
      orderReference: orderRef,
      carrier: carrierName,
      serviceCode: rawServiceCode,
      trackingNumber,
      trackingUrl,
      labelBase64,
      orderIdentifier,
      shippedAt: newFulfillmentObj.shipped_at,
      isOfficialCarrierLabel: isOfficialLabel,
      labelErrors: labelErrors.length > 0 ? labelErrors : undefined,
      portalUrl: "https://business.parcel.royalmail.com/orders",
    });
  } catch (err: any) {
    console.error("[PEPTECH FULFILLMENT ERROR]:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal fulfillment error" });
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { orderId, fulfillmentId, orderIdentifier, orderReference } = {
      ...(req.query || {}),
      ...(req.body || {}),
    } as any;

    if (!orderId) {
      return res
        .status(400)
        .json({ message: "orderId is required to delete fulfillment" });
    }

    const orderModule: any = req.scope.resolve(Modules.ORDER);
    const order: any = await fetchOrderWithPaymentDetails(req.scope, orderId);

    if (!order) {
      return res.status(404).json({ message: `Order '${orderId}' not found` });
    }

    const existingFulfillments = Array.isArray(order.metadata?.fulfillments)
      ? [...order.metadata.fulfillments]
      : [];

    // Find target fulfillment
    const targetFulfillment =
      existingFulfillments.find(
        (f: any) =>
          (fulfillmentId &&
            (f.id === fulfillmentId || f.tracking_number === fulfillmentId)) ||
          (orderIdentifier &&
            String(f.order_identifier) === String(orderIdentifier)),
      ) ||
      existingFulfillments[0] ||
      null;

    const resolvedOrderIdentifier =
      orderIdentifier ||
      targetFulfillment?.order_identifier ||
      order.metadata?.royal_mail_order_identifier;

    const resolvedOrderRef =
      orderReference ||
      (order.display_id ? `PEP-${order.display_id}` : String(order.id));

    let cndDeletedOrders: any[] = [];
    let cndErrors: any[] = [];
    let cndCalled = false;

    // 1. Delete from Royal Mail Click & Drop API if token is configured
    if (CLICK_AND_DROP_TOKEN && (resolvedOrderIdentifier || resolvedOrderRef)) {
      try {
        let identifierPath = "";
        if (
          resolvedOrderIdentifier &&
          /^\d+$/.test(String(resolvedOrderIdentifier))
        ) {
          identifierPath = String(resolvedOrderIdentifier);
        } else if (resolvedOrderRef) {
          identifierPath = encodeURIComponent(`"${resolvedOrderRef}"`);
        } else if (resolvedOrderIdentifier) {
          identifierPath = encodeURIComponent(`"${resolvedOrderIdentifier}"`);
        }

        if (identifierPath) {
          const cndUrl = `${CLICK_AND_DROP_BASE_URL}/orders/${identifierPath}`;
          const cndRes = await fetch(cndUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${CLICK_AND_DROP_TOKEN}`,
              Accept: "application/json",
            },
          });

          cndCalled = true;
          const cndData = await cndRes.json().catch(() => ({}));
          cndDeletedOrders = cndData.deletedOrders || [];
          cndErrors = cndData.errors || [];

          if (!cndRes.ok && cndRes.status !== 404) {
            console.warn("[CLICK & DROP DELETE ERROR]:", cndData);
          }
        }
      } catch (cndErr: any) {
        console.warn("[CLICK & DROP DELETE API CALL FAILED]:", cndErr.message);
      }
    }

    // 2. Cancel / Delete in Medusa 2.0 Workflows
    const resolvedFulfillmentId = fulfillmentId || targetFulfillment?.id;
    if (resolvedFulfillmentId && !resolvedFulfillmentId.includes("-RM")) {
      try {
        await cancelOrderFulfillmentWorkflow(req.scope).run({
          input: {
            order_id: order.id,
            fulfillment_id: resolvedFulfillmentId,
          },
        });
      } catch (flowErr: any) {
        console.warn(
          "[MEDUSA CANCEL FULFILLMENT WORKFLOW WARN]:",
          flowErr.message,
        );
        try {
          const fulfillmentModule: any = req.scope.resolve(Modules.FULFILLMENT);
          if (fulfillmentModule?.cancelFulfillment) {
            await fulfillmentModule.cancelFulfillment(resolvedFulfillmentId);
          }
        } catch (fErr: any) {
          console.warn("[MEDUSA DIRECT CANCEL WARN]:", fErr.message);
        }
      }
    }

    // 3. Update order metadata
    const remainingFulfillments = existingFulfillments.filter(
      (f: any) =>
        f.id !== resolvedFulfillmentId &&
        f.order_identifier !== resolvedOrderIdentifier &&
        (fulfillmentId
          ? f.id !== fulfillmentId && f.tracking_number !== fulfillmentId
          : true),
    );

    const hasRemaining = remainingFulfillments.length > 0;
    const latestFul = hasRemaining
      ? remainingFulfillments[remainingFulfillments.length - 1]
      : null;

    await orderModule.updateOrders(order.id, {
      metadata: {
        ...(order.metadata || {}),
        fulfillments: remainingFulfillments,
        fulfillment_status: hasRemaining
          ? "partially_fulfilled"
          : "not_fulfilled",
        tracking_number: latestFul ? latestFul.tracking_number : null,
        tracking_url: latestFul ? latestFul.tracking_url : null,
        shipping_carrier: latestFul ? latestFul.carrier : null,
        shipping_service_code: latestFul ? latestFul.service_code : null,
        shipping_label_pdf: latestFul ? latestFul.shipping_label_pdf : null,
        royal_mail_order_identifier: latestFul
          ? latestFul.order_identifier
          : null,
        is_official_carrier_label: latestFul
          ? latestFul.is_official_carrier_label
          : null,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Royal Mail Click & Drop fulfillment cancelled and deleted successfully.",
      orderId: order.id,
      deletedFulfillmentId: resolvedFulfillmentId,
      royalMailDeleted: cndCalled,
      deletedRoyalMailOrders: cndDeletedOrders,
      cndErrors: cndErrors.length > 0 ? cndErrors : undefined,
    });
  } catch (err: any) {
    console.error("[PEPTECH DELETE FULFILLMENT ERROR]:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to delete fulfillment" });
  }
}
