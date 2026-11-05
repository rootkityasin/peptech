import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { adminFetch } from "../lib/sdk";
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  StatusBadge,
  Input,
  Label,
  Drawer,
  Checkbox,
  toast,
  Toaster,
} from "@medusajs/ui";
import { useState, useMemo, useEffect } from "react";

interface OrderWidgetProps {
  data: any;
}

export interface PackagingProfile {
  id: string;
  name: string;
  packageFormatIdentifier: string;
  packageFormatLabel?: string;
  weightInGrams: number;
  dimensions: {
    heightInMms: number;
    widthInMms: number;
    depthInMms: number;
  };
  isSystem?: boolean;
}

const DEFAULT_PACKAGING_PROFILES: PackagingProfile[] = [
  {
    id: "pen-set",
    name: "Complete Pen Set Box",
    packageFormatIdentifier: "smallParcel",
    packageFormatLabel: "Small Parcel",
    weightInGrams: 240,
    dimensions: { heightInMms: 80, widthInMms: 160, depthInMms: 220 },
    isSystem: true,
  },
  {
    id: "vials-letter",
    name: "Freeze-Dried Vials Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 95,
    dimensions: { heightInMms: 24, widthInMms: 125, depthInMms: 185 },
    isSystem: true,
  },
  {
    id: "refill-letter",
    name: "Refill Cartridge Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 110,
    dimensions: { heightInMms: 25, widthInMms: 120, depthInMms: 160 },
    isSystem: true,
  },
  {
    id: "multi-parcel",
    name: "Multi-Item / Cold-Chain Kit",
    packageFormatIdentifier: "mediumParcel",
    packageFormatLabel: "Medium Parcel",
    weightInGrams: 520,
    dimensions: { heightInMms: 140, widthInMms: 220, depthInMms: 300 },
    isSystem: true,
  },
];

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

function isOrderPaymentSuccessful(order: any): boolean {
  if (!order) return false;

  const rawPaymentStatus = String(order.payment_status || "").toLowerCase();
  const rawOrderStatus = String(order.status || "").toLowerCase();
  const metaPaymentStatus = String(order.metadata?.payment_status || "").toLowerCase();

  const successStatuses = [
    "paid",
    "captured",
    "authorized",
    "partially_captured",
    "settled",
    "succeeded",
    "completed",
  ];

  if (successStatuses.includes(rawPaymentStatus)) return true;
  if (successStatuses.includes(metaPaymentStatus)) return true;
  if (rawOrderStatus === "completed") return true;
  if (order.metadata?.settled === true || order.metadata?.is_paid === true) return true;

  // Check summary paid totals if available in Medusa 2.0 Order graph
  const summaryPaid = Number(order.summary?.paid_total ?? order.summary?.raw_paid_total?.value ?? 0);
  if (summaryPaid > 0) return true;

  if (Array.isArray(order.payment_collections) && order.payment_collections.length > 0) {
    for (const pc of order.payment_collections) {
      const pcStatus = String(pc?.status || "").toLowerCase();
      if (successStatuses.includes(pcStatus)) return true;
      if (Number(pc?.captured_amount || 0) > 0 || Number(pc?.authorized_amount || 0) > 0) return true;

      if (Array.isArray(pc.payments)) {
        for (const p of pc.payments) {
          const pStatus = String(p?.status || "").toLowerCase();
          if (successStatuses.includes(pStatus)) return true;
          if (p?.captured_at != null) return true;
          if (Array.isArray(p.captures) && p.captures.length > 0) return true;
          if (Number(p?.captured_amount || 0) > 0) return true;
        }
      }
    }
  }

  return false;
}

const OrderRoyalMailFulfillmentWidget = ({ data: order }: OrderWidgetProps) => {
  if (!order) {
    return null;
  }

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const shipping = order?.shipping_address || {};
  const countryCode = (shipping.country_code || order?.metadata?.shipping_country_code || "GB").toUpperCase();
  const isUk = countryCode === "GB";

  // Payment Status check
  const isPaid = isOrderPaymentSuccessful(order);

  // Packaging Profiles State
  const [profiles, setProfiles] = useState<PackagingProfile[]>(DEFAULT_PACKAGING_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Form State (Default to pen set specifications, but unselected profile)
  const [serviceCode, setServiceCode] = useState("AUTO");
  const [weightInGrams, setWeightInGrams] = useState(240);
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [dimHeight, setDimHeight] = useState(80);
  const [dimWidth, setDimWidth] = useState(160);
  const [dimDepth, setDimDepth] = useState(220);
  const [includeLabel, setIncludeLabel] = useState(true);

  // Fetch packaging profiles from backend API with localStorage fallback
  const fetchProfiles = async () => {
    try {
      const res = await adminFetch("/admin/custom/packaging-profiles", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);
          try {
            localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles));
          } catch {}
          return;
        }
      }
    } catch {}
    try {
      const local = localStorage.getItem("peptech_packaging_profiles");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // When user selects a profile from the dropdown
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    if (!profileId || profileId === "custom") return;

    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setWeightInGrams(target.weightInGrams);
      setPackageFormat(target.packageFormatIdentifier);
      setDimHeight(target.dimensions.heightInMms);
      setDimWidth(target.dimensions.widthInMms);
      setDimDepth(target.dimensions.depthInMms);
    }
  };

  // Local state for instant UI update after label creation
  const [localFulfillments, setLocalFulfillments] = useState<any[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDeleteFulfillment = async (ful: any) => {
    if (!order?.id) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Royal Mail shipment #${ful.id || ful.tracking_number}?\n\n` +
      `This will cancel the order in Royal Mail Click & Drop and Medusa. Any printed postage labels must be destroyed.`
    );
    if (!confirmDelete) return;

    const fulKey = ful.id || ful.tracking_number;
    setIsDeletingId(fulKey);

    try {
      const res = await adminFetch("/admin/custom/fulfillment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          fulfillmentId: ful.id,
          orderIdentifier: ful.order_identifier,
          orderReference: order.display_id ? `PEP-${order.display_id}` : String(order.id),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to delete fulfillment");
      }

      setLocalFulfillments((prev) => prev.filter((f) => f.id !== ful.id && f.tracking_number !== ful.tracking_number));

      toast.success("Shipment Cancelled & Deleted", {
        description: "Removed from Royal Mail Click & Drop and Medusa.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 750);
    } catch (err: any) {
      alert("Error deleting shipment: " + (err.message || "Unknown error"));
    } finally {
      setIsDeletingId(null);
    }
  };

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
      const response = await adminFetch("/admin/custom/fulfillment", {
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

      if (includeLabel && resData.labelBase64) {
        downloadPdf(resData.labelBase64, `Royal-Mail-Label-${order?.display_id || order?.id}.pdf`);
      }

      toast.success("Shipment Created", {
        description: `Royal Mail tracking: ${resData.trackingNumber}`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 750);
    } catch (err: any) {
      setErrorMessage(err.message || "Fulfillment creation error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <Toaster />
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Heading level="h2">Royal Mail Fulfillment</Heading>
            <StatusBadge color={fulfillments.length > 0 ? "green" : isPaid ? "blue" : "orange"}>
              {fulfillments.length > 0 ? "Fulfilled" : isPaid ? "Ready to Fulfill" : "Payment Pending"}
            </StatusBadge>
          </div>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Official carrier integration for domestic &amp; international peptide dispatch
          </Text>
        </div>

        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setErrorMessage("");
            setShowModal(true);
          }}
        >
          Create Shipment
        </Button>
      </div>

      {/* Payment Notice if Unpaid */}
      {!isPaid && (
        <div className="px-6 py-3 bg-ui-bg-subtle flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Text size="small" leading="compact" weight="plus" className="text-ui-fg-warning">
              Payment Notice:
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Order is currently unpaid. Mark as paid before generating Royal Mail postage labels.
            </Text>
          </div>
          <StatusBadge color="orange">Unpaid</StatusBadge>
        </div>
      )}

      {/* Active Fulfillments List */}
      <div className="px-6 py-4 flex flex-col gap-y-3">
        {fulfillments.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-y-2">
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              No Royal Mail shipments created for this order yet.
            </Text>
            {isPaid && (
              <Button size="small" variant="secondary" onClick={() => setShowModal(true)}>
                Create Shipment
              </Button>
            )}
          </div>
        ) : (
          fulfillments.map((ful, idx) => {
            const labelPdf = ful.shipping_label_pdf || order?.metadata?.shipping_label_pdf;
            return (
              <div
                key={ful.id || idx}
                className="shadow-elevation-card-rest bg-ui-bg-component rounded-md p-4 flex flex-col gap-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <Text size="small" leading="compact" weight="plus">
                      #{ful.id || `RM-PKG-${idx + 1}`}
                    </Text>
                    <StatusBadge color={ful.is_official_carrier_label !== false ? "green" : "orange"}>
                      {ful.is_official_carrier_label !== false ? "Ready to Dispatch" : "Saved to Click & Drop"}
                    </StatusBadge>
                    {ful.service_code && <Badge size="small">{ful.service_code}</Badge>}
                  </div>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    {ful.shipped_at ? new Date(ful.shipped_at).toLocaleDateString("en-GB") : "Recently created"}
                  </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-y-1">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      Carrier &amp; Service
                    </Text>
                    <Text size="small" leading="compact" weight="plus">
                      {ful.carrier || "Royal Mail"}
                    </Text>
                    <Text size="small" leading="compact" className="text-ui-fg-muted">
                      Format: {ful.package_format || "smallParcel"} ({ful.weight_in_grams || 240}g)
                    </Text>
                  </div>

                  <div className="flex flex-col gap-y-1">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      Tracking Reference
                    </Text>
                    <Text size="small" leading="compact" weight="plus" className="font-mono">
                      {ful.tracking_number || "Generated"}
                    </Text>
                    {ful.order_identifier && (
                      <Text size="small" leading="compact" className="text-ui-fg-subtle font-mono">
                        C&amp;D Order #{ful.order_identifier}
                      </Text>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-1">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      Destination
                    </Text>
                    <Text size="small" leading="compact" weight="plus">
                      {shipping.city ? `${shipping.city}, ` : ""}{countryCode} {isUk ? "(UK)" : "(International)"}
                    </Text>
                  </div>
                </div>

                {/* Print & Download Action Buttons */}
                <div className="pt-3 border-t border-ui-border-base flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => openPdfPrintWindow(labelPdf, ful.order_identifier)}
                    >
                      {ful.is_official_carrier_label ? "Print Label" : "View Dispatch Slip"}
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => downloadPdf(labelPdf, `Royal-Mail-Label-${order?.display_id || order?.id}.pdf`)}
                    >
                      Download PDF
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      disabled={isDeletingId === (ful.id || ful.tracking_number)}
                      onClick={() => handleDeleteFulfillment(ful)}
                    >
                      {isDeletingId === (ful.id || ful.tracking_number) ? "Deleting..." : "Delete"}
                    </Button>
                  </div>

                  {ful.tracking_number && (
                    <a
                      href={ful.tracking_url || `https://www.royalmail.com/track-your-item#/tracking-results/${ful.tracking_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover inline-flex items-center gap-x-1"
                    >
                      Track on Royal Mail &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Shipment Creation Drawer */}
      <Drawer open={showModal} onOpenChange={setShowModal}>
        <Drawer.Content className="flex flex-col">
          <Drawer.Header>
            <Drawer.Title asChild>
              <Heading>Royal Mail Click &amp; Drop Fulfillment</Heading>
            </Drawer.Title>
            <Drawer.Description asChild>
              <Text size="small" className="text-ui-fg-subtle">
                Order #{order?.display_id || order?.id} • Destination: {[shipping.city, countryCode].filter(Boolean).join(", ")}
              </Text>
            </Drawer.Description>
          </Drawer.Header>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto">
            <Drawer.Body className="flex flex-1 flex-col gap-y-4 p-6 overflow-y-auto">
              {/* Recipient Summary */}
              <div className="shadow-elevation-card-rest bg-ui-bg-subtle rounded-md p-3 flex flex-col gap-y-1">
                <Text size="small" leading="compact" weight="plus">
                  {shipping.first_name || ""} {shipping.last_name || ""} {shipping.company ? `(${shipping.company})` : ""}
                </Text>
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {[shipping.address_1, shipping.city, shipping.postal_code, countryCode].filter(Boolean).join(", ")}
                </Text>
              </div>

              {/* Service Code */}
              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Royal Mail Service
                </Label>
                <select
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-md border border-ui-border-base bg-ui-bg-field text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
                >
                  <option value="AUTO">AUTO — Default Account Rules (Recommended)</option>
                  <option value="OLP1">OLP1 — Royal Mail 24 (Online Postage)</option>
                  <option value="OLP2">OLP2 — Royal Mail 48 (Online Postage)</option>
                  <option value="TPN">TPN — Royal Mail Tracked 24 (OBA Contract)</option>
                  <option value="TPS">TPS — Royal Mail Tracked 48 (OBA Contract)</option>
                  <option value="TRM">TRM — Royal Mail Tracked 24 with Signature (OBA)</option>
                  <option value="SD1">SD1 — Special Delivery Guaranteed by 1pm</option>
                  <option value="OTA">OTA — Royal Mail International Tracked (OBA)</option>
                  <option value="OTC">OTC — Royal Mail International Tracked &amp; Signed (OBA)</option>
                  <option value="OLS">OLS — Royal Mail International Signed (OBA)</option>
                </select>
              </div>

              {/* Packaging Profile */}
              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Packaging Profile
                </Label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-md border border-ui-border-base bg-ui-bg-field text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
                >
                  <option value="">-- Standard Package --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.weightInGrams}g • {p.packageFormatLabel || p.packageFormatIdentifier})
                    </option>
                  ))}
                  <option value="custom">Custom (Manual Entry)</option>
                </select>
              </div>

              {/* Weight & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-y-2">
                  <Label weight="plus" size="small">Gross Weight (grams)</Label>
                  <Input
                    size="small"
                    type="number"
                    value={weightInGrams}
                    onChange={(e) => {
                      setWeightInGrams(Math.max(1, parseInt(e.target.value, 10) || 1));
                      setSelectedProfileId("custom");
                    }}
                    placeholder="240"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label weight="plus" size="small">Package Format</Label>
                  <select
                    value={packageFormat}
                    onChange={(e) => {
                      setPackageFormat(e.target.value);
                      setSelectedProfileId("custom");
                    }}
                    className="w-full h-8 px-2 text-xs rounded-md border border-ui-border-base bg-ui-bg-field text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
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
              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">Outer Dimensions (H × W × D mm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Height (H)</span>
                    <Input
                      size="small"
                      type="number"
                      value={dimHeight}
                      onChange={(e) => {
                        setDimHeight(Math.max(1, parseInt(e.target.value, 10) || 1));
                        setSelectedProfileId("custom");
                      }}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Width (W)</span>
                    <Input
                      size="small"
                      type="number"
                      value={dimWidth}
                      onChange={(e) => {
                        setDimWidth(Math.max(1, parseInt(e.target.value, 10) || 1));
                        setSelectedProfileId("custom");
                      }}
                      placeholder="160"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Depth (D)</span>
                    <Input
                      size="small"
                      type="number"
                      value={dimDepth}
                      onChange={(e) => {
                        setDimDepth(Math.max(1, parseInt(e.target.value, 10) || 1));
                        setSelectedProfileId("custom");
                      }}
                      placeholder="220"
                    />
                  </div>
                </div>
              </div>

              {/* Include Label Checkbox */}
              <div className="flex items-center gap-x-2 pt-1">
                <Checkbox
                  id="include-label-check"
                  checked={includeLabel}
                  onCheckedChange={(checked) => setIncludeLabel(Boolean(checked))}
                />
                <Label htmlFor="include-label-check" size="small" className="cursor-pointer">
                  Generate 6x4 thermal PDF label in API response
                </Label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-ui-bg-subtle border border-ui-border-error rounded-md text-ui-fg-error text-xs">
                  <strong>Error: </strong> {errorMessage}
                </div>
              )}
            </Drawer.Body>

            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" type="button">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                variant="primary"
                disabled={isSubmitting || !isPaid}
                isLoading={isSubmitting}
                onClick={handleCreateFulfillment}
              >
                {isSubmitting
                  ? includeLabel
                    ? "Generating Label..."
                    : "Creating Shipment..."
                  : includeLabel
                    ? "Confirm & Generate Label"
                    : "Confirm"}
              </Button>
            </Drawer.Footer>
          </div>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export default OrderRoyalMailFulfillmentWidget;

export const config = defineWidgetConfig({
  zone: "order.details.before",
});
