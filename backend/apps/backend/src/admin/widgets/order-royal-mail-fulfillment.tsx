import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Button, Badge, Input, Label, toast, Toaster } from "@medusajs/ui";
import { useState, useMemo } from "react";

interface OrderWidgetProps {
  data: any;
}

/**
 * Downloads base64 string as a PDF file in the browser
 */
function downloadPdf(base64Data: string, filename: string) {
  if (!base64Data) {
    alert("No label PDF data available to download.");
    return;
  }
  try {
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "").trim();
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "Royal-Mail-Label.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err: any) {
    console.error("PDF Download Error:", err);
    alert("Could not download PDF label: " + err.message);
  }
}

/**
 * Opens 6x4 PDF in a printable modal, new tab, or streams directly from endpoint
 */
function openPdfPrintWindow(base64Data?: string, orderIdentifier?: string | number) {
  if (base64Data) {
    try {
      const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "").trim();
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const win = window.open(blobUrl, "_blank");
      if (win) {
        win.focus();
      } else {
        // Fallback if popup blocked: download
        downloadPdf(base64Data, "Royal-Mail-Label.pdf");
      }
      return;
    } catch (err: any) {
      console.error("PDF Print Preview Error:", err);
    }
  }

  if (orderIdentifier) {
    window.open(`/admin/custom/fulfillment?orderIdentifier=${orderIdentifier}&format=pdf`, "_blank");
    return;
  }

  alert("No shipping label PDF available to print.");
}

export default function OrderRoyalMailFulfillmentWidget({ data: order }: OrderWidgetProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const shipping = order?.shipping_address || {};
  const countryCode = (shipping.country_code || order?.metadata?.shipping_country_code || "GB").toUpperCase();
  const isUk = countryCode === "GB";

  // Form State
  const [serviceCode, setServiceCode] = useState("AUTO");
  const [weightInGrams, setWeightInGrams] = useState(240);
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [dimHeight, setDimHeight] = useState(80);
  const [dimWidth, setDimWidth] = useState(160);
  const [dimDepth, setDimDepth] = useState(220);
  const [includeLabel, setIncludeLabel] = useState(true);

  // Local state for instant UI update after label creation
  const [localFulfillments, setLocalFulfillments] = useState<any[]>([]);

  // Payment Status check
  const paymentStatus = order?.metadata?.payment_status || (order?.payment_status === "captured" || order?.status === "completed" ? "paid" : "unpaid");
  const isPaid = paymentStatus === "paid" || order?.status === "completed";

  // Existing Fulfillments from order metadata or order.fulfillments
  const fulfillments = useMemo(() => {
    const metaFulfillments = Array.isArray(order?.metadata?.fulfillments) ? order.metadata.fulfillments : [];
    const combined = [...metaFulfillments, ...localFulfillments];
    // Deduplicate by id or tracking_number
    const seen = new Set();
    return combined.filter((f) => {
      const key = f.id || f.tracking_number;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [order?.metadata?.fulfillments, localFulfillments]);

  const handleCreateFulfillment = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/admin/custom/fulfillment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          serviceCode,
          weightInGrams: Number(weightInGrams) || 240,
          packageFormatIdentifier: packageFormat,
          dimensions: {
            heightInMms: Number(dimHeight) || 80,
            widthInMms: Number(dimWidth) || 160,
            depthInMms: Number(dimDepth) || 220,
          },
          includeLabelInResponse: Boolean(includeLabel),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to generate Royal Mail shipment label");
      }

      // Add to local state
      const newFul = {
        id: `${order.display_id || order.id}-RM${fulfillments.length + 1}`,
        carrier: resData.carrier || "Royal Mail Tracked 24",
        service_code: resData.serviceCode || serviceCode,
        tracking_number: resData.trackingNumber,
        tracking_url: resData.trackingUrl,
        order_identifier: resData.orderIdentifier,
        weight_in_grams: weightInGrams,
        package_format: packageFormat,
        shipping_label_pdf: resData.labelBase64,
        shipped_at: resData.shippedAt || new Date().toISOString(),
        status: "fulfilled",
        is_official_carrier_label: resData.isOfficialCarrierLabel,
        label_errors: resData.labelErrors,
      };

      setLocalFulfillments((prev) => [...prev, newFul]);
      setShowModal(false);

      if (toast) {
        toast.success("Shipment Created", {
          description: `Royal Mail tracking: ${resData.trackingNumber}`,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Fulfillment creation error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="divide-y p-0 overflow-hidden rounded-lg border shadow-sm">
      <Toaster />
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#0B1F3A] text-[#00C5A0] font-bold text-xs">
            RM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
                Royal Mail Click & Drop Fulfillment
              </Heading>
              <Badge color={fulfillments.length > 0 ? "green" : isPaid ? "blue" : "orange"} size="small">
                {fulfillments.length > 0 ? "Fulfilled" : isPaid ? "Ready to Fulfill" : "Payment Pending"}
              </Badge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              Official carrier integration for domestic & international peptide dispatch
            </Text>
          </div>
        </div>

        <div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setErrorMessage("");
              setShowModal(true);
            }}
          >
            + Create Royal Mail Shipment
          </Button>
        </div>
      </div>

      {/* Payment Gate Notice if Unpaid */}
      {!isPaid && (
        <div className="p-4 bg-orange-50/60 border-l-4 border-orange-500 text-xs text-orange-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">⚠️ Payment Gate:</span>
            <span>Order payment status is currently unpaid. Mark as paid before generating postage labels.</span>
          </div>
          <Badge color="orange" size="small">Unpaid</Badge>
        </div>
      )}

      {/* Active Fulfillments List */}
      <div className="p-4 space-y-3">
        {fulfillments.length === 0 ? (
          <div className="py-6 text-center text-xs text-ui-fg-muted">
            <Text size="small" className="text-ui-fg-muted">No Royal Mail shipments created for this order yet.</Text>
            {isPaid && (
              <div className="mt-3">
                <Button size="small" variant="primary" onClick={() => setShowModal(true)}>
                  Generate Royal Mail 6x4 Label
                </Button>
              </div>
            )}
          </div>
        ) : (
          fulfillments.map((ful, idx) => {
            const labelPdf = ful.shipping_label_pdf || order?.metadata?.shipping_label_pdf;
            return (
              <div key={ful.id || idx} className="p-4 rounded-lg border bg-ui-bg-base space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ui-fg-base">#{ful.id || `RM-PKG-${idx + 1}`}</span>
                    <Badge color={ful.is_official_carrier_label !== false ? "green" : "orange"} size="small">
                      {ful.is_official_carrier_label !== false ? "Royal Mail Label Ready" : "Simulated Preview"}
                    </Badge>
                    {ful.service_code && <Badge color="grey" size="small">{ful.service_code}</Badge>}
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {ful.shipped_at ? new Date(ful.shipped_at).toLocaleDateString("en-GB") : "Recently created"}
                  </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-ui-fg-muted text-[11px]">Carrier & Service</div>
                    <div className="font-semibold text-ui-fg-base mt-0.5">{ful.carrier || "Royal Mail"}</div>
                    <div className="text-[11px] text-ui-fg-subtle mt-0.5">
                      Format: {ful.package_format || "smallParcel"} ({ful.weight_in_grams || 240}g)
                    </div>
                  </div>

                  <div>
                    <div className="text-ui-fg-muted text-[11px]">Tracking & Click & Drop ID</div>
                    <div className="font-mono font-semibold text-ui-fg-interactive mt-0.5">
                      {ful.tracking_number || "Generated"}
                    </div>
                    {ful.order_identifier && (
                      <div className="text-[11px] text-ui-fg-subtle mt-0.5 font-mono">
                        C&D Order #{ful.order_identifier}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-ui-fg-muted text-[11px]">Destination</div>
                    <div className="font-medium text-ui-fg-base mt-0.5">
                      {shipping.city || "Cambridge"}, {countryCode} {isUk ? "🇬🇧" : "🌐"}
                    </div>
                  </div>
                </div>

                {(!ful.is_official_carrier_label || (ful.label_errors && ful.label_errors.length > 0)) && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>ℹ️</span>
                      <span>
                        <strong>Royal Mail API Notice:</strong> {ful.label_errors?.[0]?.message || `Official 2D barcode thermal label generation via API requires an active Royal Mail OBA account. Order #${ful.order_identifier} was saved to Click & Drop.`}
                      </span>
                    </div>
                    <a
                      href="https://business.parcel.royalmail.com/orders"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-ui-fg-interactive hover:underline shrink-0 ml-2"
                    >
                      Print in Click & Drop ↗
                    </a>
                  </div>
                )}

                {/* Print & Download Action Buttons */}
                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => openPdfPrintWindow(labelPdf, ful.order_identifier)}
                      className="font-medium"
                    >
                      {ful.is_official_carrier_label ? "🖨️ Print 6x4 Label" : "📄 View Dispatch Slip"}
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => downloadPdf(labelPdf, `Royal-Mail-Label-${order.display_id || order.id}.pdf`)}
                    >
                      ⬇️ Download PDF
                    </Button>
                  </div>

                  {ful.tracking_number && (
                    <a
                      href={ful.tracking_url || `https://www.royalmail.com/track-your-item#/tracking-results/${ful.tracking_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-ui-fg-interactive hover:underline inline-flex items-center gap-1"
                    >
                      Track on Royal Mail ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Shipment Creation Modal / Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-ui-bg-base rounded-xl shadow-2xl border max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Generate Royal Mail Shipment
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Order #{order.display_id || order.id} • Destination: {shipping.city || "Cambridge"}, {countryCode}
                </Text>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-ui-fg-muted hover:text-ui-fg-base text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Recipient Summary */}
            <div className="p-3 bg-ui-bg-subtle rounded-lg border text-xs space-y-1">
              <div className="font-semibold text-ui-fg-base">
                {shipping.first_name || ""} {shipping.last_name || ""} {shipping.company ? `(${shipping.company})` : ""}
              </div>
              <div className="text-ui-fg-subtle">
                {shipping.address_1 || "Address Line 1"}, {shipping.city || "Cambridge"}, {shipping.postal_code || "CB4 0AB"}, {countryCode}
              </div>
              <div className="text-ui-fg-muted text-[11px]">
                Items in package: {order?.items?.length || 1} line item(s) (RUO Synthetic Peptides)
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Service Code */}
              <div>
                <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Royal Mail Service</Label>
                <select
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  className="w-full border rounded-md p-2 text-xs bg-ui-bg-base text-ui-fg-base font-medium"
                >
                  <option value="AUTO">AUTO — Default Account Rules (Recommended)</option>
                  <option value="OLP1">OLP1 — Royal Mail 24 (Online Postage)</option>
                  <option value="OLP2">OLP2 — Royal Mail 48 (Online Postage)</option>
                  <option value="TPN">TPN — Royal Mail Tracked 24 (OBA Contract)</option>
                  <option value="TPS">TPS — Royal Mail Tracked 48 (OBA Contract)</option>
                  <option value="TRM">TRM — Royal Mail Tracked 24 with Signature (OBA)</option>
                  <option value="SD1">SD1 — Special Delivery Guaranteed by 1pm</option>
                  <option value="OTA">OTA — Royal Mail International Tracked (OBA)</option>
                  <option value="OTC">OTC — Royal Mail International Tracked & Signed (OBA)</option>
                  <option value="OLS">OLS — Royal Mail International Signed (OBA)</option>
                </select>
              </div>

              {/* Weight & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Gross Weight (grams)</Label>
                  <Input
                    type="number"
                    value={weightInGrams}
                    onChange={(e) => setWeightInGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    placeholder="240"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Package Format</Label>
                  <select
                    value={packageFormat}
                    onChange={(e) => setPackageFormat(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs bg-ui-bg-base text-ui-fg-base"
                  >
                    <option value="smallParcel">Small Parcel (Cold-Chain Box)</option>
                    <option value="mediumParcel">Medium Parcel</option>
                    <option value="largeLetter">Large Letter (Vial Box)</option>
                    <option value="parcel">Parcel</option>
                    <option value="largeParcel">Large Parcel</option>
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Outer Dimensions (mm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-ui-fg-muted block">Height (H)</span>
                    <Input
                      type="number"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-ui-fg-muted block">Width (W)</span>
                    <Input
                      type="number"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="160"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-ui-fg-muted block">Depth (D)</span>
                    <Input
                      type="number"
                      value={dimDepth}
                      onChange={(e) => setDimDepth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="220"
                    />
                  </div>
                </div>
              </div>

              {/* Include Label Checkbox */}
              <label className="flex items-center gap-2 text-xs text-ui-fg-base cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeLabel}
                  onChange={(e) => setIncludeLabel(e.target.checked)}
                  className="rounded text-ui-fg-interactive"
                />
                <span>Generate 6x4 thermal PDF label in API response</span>
              </label>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                  <strong>Error: </strong> {errorMessage}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button size="small" variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="primary"
                disabled={isSubmitting || !isPaid}
                onClick={handleCreateFulfillment}
              >
                {isSubmitting
                  ? includeLabel
                    ? "Generating Label in Click & Drop..."
                    : "Creating Shipment in Click & Drop..."
                  : includeLabel
                    ? "Confirm & Generate Label"
                    : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
});
