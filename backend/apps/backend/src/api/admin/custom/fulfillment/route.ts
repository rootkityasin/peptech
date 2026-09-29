import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const CLICK_AND_DROP_BASE_URL = process.env.ROYAL_MAIL_CLICK_AND_DROP_URL || "https://api.parcel.royalmail.com/api/v1";
const CLICK_AND_DROP_TOKEN =
  process.env.CLICKANDDROP_AUTH_KYE ||
  process.env.CLICKANDDROP_AUTH_KEY ||
  process.env.ROYAL_MAIL_CLICK_AND_DROP_TOKEN ||
  "";

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
    const query = scope.resolve(ContainerRegistrationKeys.QUERY) || scope.resolve("query");
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
    console.warn("[FULFILLMENT] query.graph retrieval error, using fallback:", err.message);
  }

  const orderModule: any = scope.resolve(Modules.ORDER);
  return await orderModule.retrieveOrder(orderId, {
    relations: ["items", "shipping_address", "shipping_methods"],
  }).catch(() => null);
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
  const metaPaymentStatus = String(order.metadata?.payment_status || "").toLowerCase();

  // 1. Direct payment_status field
  if (SUCCESS_PAYMENT_STATUSES.includes(rawPaymentStatus)) return true;

  // 2. Metadata payment status flags
  if (SUCCESS_PAYMENT_STATUSES.includes(metaPaymentStatus)) return true;
  if (order.metadata?.settled === true || order.metadata?.is_paid === true) return true;

  // 3. Completed order workflow status
  if (rawOrderStatus === "completed") return true;

  // 4. Order Summary paid total
  const summaryPaid = Number(order.summary?.paid_total ?? order.summary?.raw_paid_total?.value ?? 0);
  if (summaryPaid > 0) return true;

  // 5. Payment Collections and Payments
  if (Array.isArray(order.payment_collections) && order.payment_collections.length > 0) {
    for (const pc of order.payment_collections) {
      const pcStatus = String(pc?.status || "").toLowerCase();
      if (SUCCESS_PAYMENT_STATUSES.includes(pcStatus)) return true;
      if (Number(pc?.captured_amount || 0) > 0 || Number(pc?.authorized_amount || 0) > 0) return true;

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
  if (order.payment_status && order.payment_status !== "not_paid") return order.payment_status;
  if (order.metadata?.payment_status) return order.metadata.payment_status;
  if (Array.isArray(order.payment_collections) && order.payment_collections.length > 0) {
    const pc = order.payment_collections[0];
    if (pc?.status) return pc.status;
    if (Array.isArray(pc?.payments) && pc.payments[0]?.status) return pc.payments[0].status;
  }
  return order.payment_status || order.status || "unpaid";
}

/**
 * Generates a valid 6x4 PDF base64 string (4in x 6in / 288pt x 432pt) conforming to PDF-1.4 standard
 */
function generateLabelBase64(reference: string, trackingNumber: string, serviceName: string, recipientName: string, city: string, countryCode: string, orderId: string | number): string {
  const safeRef = String(reference).replace(/[()]/g, "");
  const safeTrack = String(trackingNumber).replace(/[()]/g, "");
  const safeService = String(serviceName).replace(/[()]/g, "");
  const safeName = String(recipientName).replace(/[()]/g, "");
  const safeCity = String(city).replace(/[()]/g, "");
  const safeCountry = String(countryCode).replace(/[()]/g, "");
  const safeId = String(orderId).replace(/[()]/g, "");

  const streamBody = `BT
/F1 15 Tf 20 405 Td (PEPTECH DISPATCH SUMMARY) Tj
/F1 10 Tf 20 385 Td (Order Ref: ${safeRef} | Click & Drop ID: #${safeId}) Tj
/F1 11 Tf 20 355 Td (Carrier: ${safeService}) Tj
/F1 11 Tf 20 335 Td (Tracking Ref: ${safeTrack}) Tj
/F1 10 Tf 20 295 Td (DELIVERY DESTINATION:) Tj
/F1 12 Tf 20 275 Td (${safeName}) Tj
/F1 10 Tf 20 255 Td (${safeCity}, ${safeCountry}) Tj
/F1 9 Tf 20 195 Td ([INTERNAL DISPATCH SLIP]) Tj
/F1 8 Tf 20 175 Td (Print official Royal Mail 2D barcode label in Click & Drop portal) Tj
/F1 9 Tf 20 60 Td (Discreet Protective Packaging - PEPTECH Laboratory Dispatch) Tj
ET
`;
  const streamLength = Buffer.byteLength(streamBody);

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];

  offsets.push(Buffer.byteLength(out));
  out += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

  offsets.push(Buffer.byteLength(out));
  out += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

  offsets.push(Buffer.byteLength(out));
  out += "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 288 432] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";

  offsets.push(Buffer.byteLength(out));
  out += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamBody}endstream\nendobj\n`;

  offsets.push(Buffer.byteLength(out));
  out += "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  const xrefOffset = Buffer.byteLength(out);
  out += `xref\n0 6\n0000000000 65535 f \n`;
  for (const off of offsets) {
    out += off.toString().padStart(10, "0") + " 00000 n \n";
  }
  out += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(out).toString("base64");
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { orderId, orderIdentifier, documentType = "postageLabel", format = "json" } = (req.query || {}) as any;

  // Dedicated label retrieval / reprint support
  if (orderId || orderIdentifier) {
    let labelBase64 = "";
    let isUk = true;

    if (orderId) {
      const order: any = await fetchOrderWithPaymentDetails(req.scope, orderId);

      if (order) {
        labelBase64 = order.metadata?.shipping_label_pdf || "";
        const country = order.shipping_address?.country_code || order.metadata?.shipping_country_code || "GB";
        isUk = String(country).toUpperCase() === "GB";
      }
    }

    // Attempt live fetch from Click & Drop API if token is configured
    if (CLICK_AND_DROP_TOKEN && orderIdentifier) {
      try {
        const isNumeric = /^\d+$/.test(String(orderIdentifier));
        const formattedId = isNumeric ? String(orderIdentifier) : encodeURIComponent(`"${orderIdentifier}"`);
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
              res.setHeader("Content-Disposition", `inline; filename="RM-Label-${orderIdentifier}.pdf"`);
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
        const cleanBase64 = labelBase64.replace(/^data:application\/pdf;base64,/, "").trim();
        const buf = Buffer.from(cleanBase64, "base64");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="RM-Label-${orderIdentifier || orderId}.pdf"`);
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

    return res.status(404).json({ message: "Shipping label not found for the requested order." });
  }

  return res.status(200).json({
    carrier: "Royal Mail",
    services: [
      { code: "AUTO", name: "Auto (Click & Drop Rules / Default)", is_default: true },
      { code: "OLP1", name: "Royal Mail 24 (Online Postage)", region: "UK" },
      { code: "OLP2", name: "Royal Mail 48 (Online Postage)", region: "UK" },
      { code: "TPN", name: "Royal Mail Tracked 24 (OBA Contract)", region: "UK" },
      { code: "TPS", name: "Royal Mail Tracked 48 (OBA Contract)", region: "UK" },
      { code: "TRM", name: "Royal Mail Tracked 24 with Signature", region: "UK" },
      { code: "SD1", name: "Special Delivery Guaranteed by 1pm", region: "UK" },
      { code: "OTA", name: "Royal Mail International Tracked (OBA)", region: "INTL" },
      { code: "OTC", name: "Royal Mail International Tracked & Signed (OBA)", region: "INTL" },
      { code: "OLS", name: "Royal Mail International Signed (OBA)", region: "INTL" },
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

    // Gate 1: Check Payment Status (supports Medusa 2.0 captured, authorized, completed, summary paid total, collections, and metadata)
    const isPaid = isOrderPaymentSuccessful(order);

    if (!isPaid) {
      const currentStatus = getOrderPaymentStatusDisplay(order);
      return res.status(400).json({
        message: `Order payment status is '${currentStatus}'. Payment must be captured, authorized, or marked as paid before generating a shipping fulfillment label.`,
      });
    }

    const shipping: any = order.shipping_address || {};
    const rawCountryCode = shipping.country_code || order.metadata?.shipping_country_code || "GB";
    const countryCode = String(rawCountryCode).toUpperCase();
    const isUk = countryCode === "GB";
    const rawServiceCode = String(serviceCode || "AUTO").toUpperCase();
    const carrierName = SERVICE_NAMES[rawServiceCode] || (isUk ? "Royal Mail 24" : "Royal Mail International");
    const orderRef = order.display_id ? `PEP-${order.display_id}` : String(order.id);

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
            shippingCostCharged: Number(order.shipping_methods?.[0]?.amount || (isUk ? 4.95 : 15.0)),
            total: Number(order.total || 0),
            currencyCode: (order.currency_code || "GBP").toUpperCase(),
            recipient: {
              address: {
                fullName: `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() || "Researcher",
                companyName: shipping.company || undefined,
                addressLine1: shipping.address_1 || "Laboratory Delivery Address",
                addressLine2: shipping.address_2 || undefined,
                city: shipping.city || "Cambridge",
                county: shipping.province || undefined,
                postcode: shipping.postal_code || (isUk ? "CB4 0AB" : "90210"),
                countryCode,
              },
              phoneNumber: shipping.phone || undefined,
              emailAddress: order.email,
            },
            packages: [
              {
                weightInGrams: Math.max(1, Number(weightInGrams || 240)),
                packageFormatIdentifier: packageFormatIdentifier || "smallParcel",
                dimensions: dimensions
                  ? {
                      heightInMms: Math.max(1, Number(dimensions.heightInMms || 80)),
                      widthInMms: Math.max(1, Number(dimensions.widthInMms || 160)),
                      depthInMms: Math.max(1, Number(dimensions.depthInMms || 220)),
                    }
                  : undefined,
                contents: (order.items || []).map((it: any) => ({
                  name: (it.title || "RUO Peptide Compound").slice(0, 50),
                  SKU: (it.variant_sku || it.metadata?.sku || "PEP-LAB-01").slice(0, 40),
                  quantity: Math.max(1, Number(it.quantity || 1)),
                  unitValue: Number(it.unit_price || 0),
                  unitWeightInGrams: Math.max(1, Math.round(Number(weightInGrams || 240) / Math.max(1, order.items?.length || 1))),
                  customsDescription: "Synthetic biochemical peptides for RUO use".slice(0, 50),
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
        if ((!cndResponse.ok || cndData.errorsCount > 0) && rawServiceCode !== "AUTO") {
          console.warn("[CLICK & DROP RETRY]: Specific service code rejected, falling back to AUTO rules...", cndData);
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
          const errMsg = cndData.failedOrders?.[0]?.errors?.[0]?.errorMessage || cndData.message || "Failed to create shipment in Royal Mail Click & Drop";
          return res.status(400).json({ message: errMsg, details: cndData });
        }

        const createdOrder = cndData.createdOrders?.[0];
        orderIdentifier = createdOrder?.orderIdentifier || `RM-ORD-${Date.now()}`;
        trackingNumber = createdOrder?.trackingNumber || createdOrder?.packages?.[0]?.trackingNumber || "";
        labelBase64 = createdOrder?.label || "";
        labelErrors = createdOrder?.labelErrors || [];
        if (labelErrors.length > 0) {
          console.warn("[CLICK AND DROP LABEL GENERATION ERRORS]:", JSON.stringify(labelErrors));
        }

        officialCarrierLabelReceived = Boolean(createdOrder?.label);

        // If label was requested but not returned directly, try fetching from dedicated /label endpoint
        if (includeLabelInResponse && !labelBase64 && orderIdentifier) {
          try {
            const isNumeric = /^\d+$/.test(String(orderIdentifier));
            const formattedId = isNumeric ? String(orderIdentifier) : encodeURIComponent(`"${orderIdentifier}"`);
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
              console.warn(`[CLICK AND DROP LABEL FETCH WARN ${labelRes.status}]:`, errText);
              if (labelRes.status === 403 || errText.includes("Forbidden")) {
                labelErrors.push({
                  code: "OBA_REQUIRED",
                  message: "Royal Mail API label printing requires an active OBA account. Order was saved to Click & Drop.",
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
            message: "Royal Mail API label printing requires an active OBA account. Order was saved to Click & Drop.",
          });
        }
      } catch (apiErr: any) {
        return res.status(502).json({
          message: `Royal Mail Click & Drop API communication error: ${apiErr.message}`,
        });
      }
    }

    // If no tracking number was returned by API yet (e.g. pending manifest or standard postage), generate reference
    if (!trackingNumber) {
      const random9 = Math.floor(100000000 + Math.random() * 900000000);
      const prefix = isUk ? "VQ" : "RN";
      trackingNumber = `${prefix}${random9}GB`;
    }

    if (!orderIdentifier) {
      orderIdentifier = Math.floor(10000000 + Math.random() * 90000000);
    }

    // Only generate simulated 6x4 PDF if the user explicitly requested a label and no carrier label was returned
    if (includeLabelInResponse && !labelBase64) {
      labelBase64 = generateLabelBase64(
        orderRef,
        trackingNumber,
        carrierName,
        `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() || "Researcher",
        shipping.city || "Cambridge",
        countryCode,
        orderIdentifier
      );
    }

    const trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;

    // Update Medusa 2.0 Order Record in PostgreSQL
    const existingFulfillments = Array.isArray(order.metadata?.fulfillments) ? [...order.metadata.fulfillments] : [];
    const isOfficialLabel = officialCarrierLabelReceived;
    const newFulfillmentObj = {
      id: `${order.display_id || order.id}-RM${existingFulfillments.length + 1}`,
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
    return res.status(500).json({ message: err.message || "Internal fulfillment error" });
  }
}
