const fs = require('fs');
const path = require('path');

const possibleDistDirs = [
  path.resolve(__dirname, '../../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../node_modules/@medusajs/dashboard/dist'),
];

let distDir = possibleDistDirs.find(d => fs.existsSync(d));

console.log('[PEPTECH] Updating dashboard chunks in:', distDir);

if (!distDir) {
  console.warn('[PEPTECH] Could not locate @medusajs/dashboard/dist directory. Checked:', possibleDistDirs);
} else {
  const dashboardRoot = path.dirname(distDir);

  // 0. Append Dark Theme CSS to app.css
  const darkThemeFile = path.resolve(__dirname, 'dark_theme.css');
  const appCssFile = path.resolve(distDir, 'app.css');
  if (fs.existsSync(darkThemeFile) && fs.existsSync(appCssFile)) {
    const darkCss = fs.readFileSync(darkThemeFile, 'utf8');
    let appCss = fs.readFileSync(appCssFile, 'utf8');
    if (!appCss.includes('PEPTECH® Dark Mode Styles')) {
      appCss += '\n\n' + darkCss;
      fs.writeFileSync(appCssFile, appCss, 'utf8');
      console.log('[PEPTECH] Successfully appended dark theme styles to app.css');
    }
  }

  // 0.1 Remove Documentation and Changelog, and Brand Login Page in app.js
  const appJsFile = path.resolve(distDir, 'app.js');
  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    let appJsModified = false;

    if (appJs.includes('docs.medusajs.com') || appJs.includes('medusajs.com/changelog')) {
      const docsAndChangelogRegex = /\/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.DropdownMenu\.Item, \{ asChild: true, children: \/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.Link, \{ to: "https:\/\/docs\.medusajs\.com"[\s\S]*?t5\("app\.menus\.user\.changelog"\)\s*\] \}\) \}\),?/;
      if (docsAndChangelogRegex.test(appJs)) {
        appJs = appJs.replace(docsAndChangelogRegex, '/* docs & changelog removed */ null, null,');
        appJsModified = true;
        console.log('[PEPTECH] Successfully removed Documentation and Changelog from app.js');
      }
    }

    if (appJs.includes('Welcome to Medusa')) {
      appJs = appJs.split('Welcome to Medusa').join('Welcome to PEPTECH®');
      appJsModified = true;
      console.log('[PEPTECH] Successfully updated Welcome to Medusa -> Welcome to PEPTECH® in app.js');
    }

    const avatarBoxRegex = /function AvatarBox\(\{ checked \}\) \{[\s\S]*?\n\}/;
    if (avatarBoxRegex.test(appJs)) {
      const peptechAvatarBox = `function AvatarBox() {
  return /* @__PURE__ */ (0, import_jsx_runtime858.jsx)("div", {
    className: "peptech-logo-badge mb-4 flex items-center justify-center rounded-[14px] bg-[#0B1F3A] border border-[#16A6A3]/50 px-4 py-2 shadow-lg",
    children: /* @__PURE__ */ (0, import_jsx_runtime858.jsx)("img", {
      src: "/app/logo.webp",
      alt: "PEPTECH®",
      style: { height: "32px", width: "auto", objectFit: "contain", display: "block" }
    })
  });
}`;
      appJs = appJs.replace(avatarBoxRegex, peptechAvatarBox);
      appJsModified = true;
      console.log('[PEPTECH] Successfully replaced Medusa AvatarBox with PEPTECH® logo badge in app.js');
    }

    if (appJsModified) {
      fs.writeFileSync(appJsFile, appJs, 'utf8');
    }
  }

  // 0.2 Brand app.mjs
  const appMjsFile = path.resolve(distDir, 'app.mjs');
  if (fs.existsSync(appMjsFile)) {
    let appMjs = fs.readFileSync(appMjsFile, 'utf8');
    if (appMjs.includes('Welcome to Medusa')) {
      appMjs = appMjs.split('Welcome to Medusa').join('Welcome to PEPTECH®');
      fs.writeFileSync(appMjsFile, appMjs, 'utf8');
      console.log('[PEPTECH] Successfully updated Welcome to Medusa -> Welcome to PEPTECH® in app.mjs');
    }
  }

  // 0.3 Brand chunk-O333RR6K.mjs (AvatarBox ESM chunk)
  const avatarBoxMjsFile = path.resolve(distDir, 'chunk-O333RR6K.mjs');
  if (fs.existsSync(avatarBoxMjsFile)) {
    let mjs = fs.readFileSync(avatarBoxMjsFile, 'utf8');
    const mjsAvatarBoxRegex = /function AvatarBox\(\{ checked \}\) \{[\s\S]*?\n\}/;
    const peptechMjsAvatarBox = `function AvatarBox() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "peptech-logo-badge mb-4 flex items-center justify-center rounded-[14px] bg-[#0B1F3A] border border-[#16A6A3]/50 px-4 py-2 shadow-lg",
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "/app/logo.webp",
          alt: "PEPTECH®",
          style: { height: "32px", width: "auto", objectFit: "contain", display: "block" }
        }
      )
    }
  );
}`;
    if (mjsAvatarBoxRegex.test(mjs)) {
      mjs = mjs.replace(mjsAvatarBoxRegex, peptechMjsAvatarBox);
      fs.writeFileSync(avatarBoxMjsFile, mjs, 'utf8');
      console.log('[PEPTECH] Successfully updated AvatarBox in chunk-O333RR6K.mjs');
    }
  }

  // 0.4 Brand chunk-ZT6PMEES.mjs (Translation ESM chunk)
  const translationMjsFile = path.resolve(distDir, 'chunk-ZT6PMEES.mjs');
  if (fs.existsSync(translationMjsFile)) {
    let tMjs = fs.readFileSync(translationMjsFile, 'utf8');
    if (tMjs.includes('Welcome to Medusa')) {
      tMjs = tMjs.split('Welcome to Medusa').join('Welcome to PEPTECH®');
      fs.writeFileSync(translationMjsFile, tMjs, 'utf8');
      console.log('[PEPTECH] Successfully updated Welcome to Medusa -> Welcome to PEPTECH® in chunk-ZT6PMEES.mjs');
    }
  }

  // 0.5 Brand Source TypeScript Component (avatar-box.tsx)
  const avatarTsxFile = path.resolve(dashboardRoot, 'src/components/common/logo-box/avatar-box.tsx');
  if (fs.existsSync(avatarTsxFile)) {
    const peptechTsx = `import React from "react";

export default function AvatarBox({ checked }: { checked?: boolean }) {
  return (
    <div className="peptech-logo-badge mb-4 flex items-center justify-center rounded-[14px] bg-[#0B1F3A] border border-[#16A6A3]/50 px-4 py-2 shadow-lg">
      <img
        src="/app/logo.webp"
        alt="PEPTECH®"
        style={{ height: "32px", width: "auto", objectFit: "contain", display: "block" }}
      />
    </div>
  );
}
`;
    fs.writeFileSync(avatarTsxFile, peptechTsx, 'utf8');
    console.log('[PEPTECH] Successfully updated source avatar-box.tsx with PEPTECH® logo');
  }

  // 0.6 Brand Source Translations (en.json and enGB.json)
  const translationsDir = path.resolve(dashboardRoot, 'src/i18n/translations');
  ['en.json', 'enGB.json'].forEach(transFile => {
    const fullPath = path.resolve(translationsDir, transFile);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Welcome to Medusa')) {
        content = content.split('Welcome to Medusa').join('Welcome to PEPTECH®');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[PEPTECH] Successfully updated Welcome to Medusa in ${transFile}`);
      }
    }
  });

  // 0.7 Purge Vite dev cache in backend to prevent serving old cached chunks
  const viteCacheDir = path.resolve(__dirname, '../../node_modules/.vite');
  if (fs.existsSync(viteCacheDir)) {
    try {
      fs.rmSync(viteCacheDir, { recursive: true, force: true });
      console.log('[PEPTECH] Successfully cleared stale Vite dependency cache');
    } catch (e) {
      console.warn('[PEPTECH WARN] Could not clear .vite cache:', e.message);
    }
  }

  // 0.8 Enhance Thumbnail component in dashboard with fallback and error handling
  const thumbnailMjsFile = path.resolve(distDir, 'chunk-MNXC6Q4F.mjs');
  if (fs.existsSync(thumbnailMjsFile)) {
    const peptechThumbnailMjs = `// src/components/common/thumbnail/thumbnail.tsx
import { Photo } from "@medusajs/icons";
import { clx } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var resolveThumbnail = (s, a) => {
  const title = (a || "").toLowerCase();
  const defaultImg = title.includes("pen") || title.includes("set")
    ? "/images/peptech/mockup1.webp"
    : title.includes("vial") || title.includes("lyophilised")
    ? "/images/peptech/mockup2.webp"
    : "/images/peptech/cartridge.webp";
  if (!s || s === "null") return defaultImg;
  let clean = s.replace("cartridge.png", "peptech/cartridge.webp");
  if (clean.includes("localhost:3000/images/")) {
    clean = clean.replace(/https?:\\/\\/localhost:3000/, "");
  }
  return clean;
};
var Thumbnail = ({ src, alt, size = "base" }) => {
  const imgSrc = resolveThumbnail(src, alt);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx(
        "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border",
        {
          "h-8 w-6": size === "base",
          "h-5 w-4": size === "small"
        }
      ),
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: imgSrc,
          alt,
          className: "h-full w-full object-cover object-center",
          onError: (e) => {
            e.currentTarget.onerror = null;
            const t = (alt || "").toLowerCase();
            e.currentTarget.src = t.includes("pen") || t.includes("set")
              ? "/images/peptech/mockup1.webp"
              : t.includes("vial") || t.includes("lyophilised")
              ? "/images/peptech/mockup2.webp"
              : "/images/peptech/cartridge.webp";
          }
        }
      )
    }
  );
};
export {
  Thumbnail
};
`;
    fs.writeFileSync(thumbnailMjsFile, peptechThumbnailMjs, 'utf8');
    console.log('[PEPTECH] Successfully updated Thumbnail with fallback in chunk-MNXC6Q4F.mjs');
  }

  const thumbnailTsxFile = path.resolve(dashboardRoot, 'src/components/common/thumbnail/thumbnail.tsx');
  if (fs.existsSync(thumbnailTsxFile)) {
    const peptechThumbnailTsx = `import { Photo } from "@medusajs/icons"
import { clx } from "@medusajs/ui"

type ThumbnailProps = {
  src?: string | null
  alt?: string
  size?: "small" | "base"
}

const resolveThumbnail = (s?: string | null, a?: string) => {
  const title = (a || "").toLowerCase()
  const defaultImg = title.includes("pen") || title.includes("set")
    ? "/images/peptech/mockup1.webp"
    : title.includes("vial") || title.includes("lyophilised")
    ? "/images/peptech/mockup2.webp"
    : "/images/peptech/cartridge.webp"

  if (!s || s === "null") return defaultImg

  let clean = s.replace("cartridge.png", "peptech/cartridge.webp")
  if (clean.includes("localhost:3000/images/")) {
    clean = clean.replace(/https?:\\/\\/localhost:3000/, "")
  }
  return clean
}

export const Thumbnail = ({ src, alt, size = "base" }: ThumbnailProps) => {
  const imgSrc = resolveThumbnail(src, alt)
  return (
    <div
      className={clx(
        "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border",
        {
          "h-8 w-6": size === "base",
          "h-5 w-4": size === "small",
        }
      )}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="h-full w-full object-cover object-center"
        onError={(e) => {
          e.currentTarget.onerror = null
          const t = (alt || "").toLowerCase()
          e.currentTarget.src = t.includes("pen") || t.includes("set")
            ? "/images/peptech/mockup1.webp"
            : t.includes("vial") || t.includes("lyophilised")
            ? "/images/peptech/mockup2.webp"
            : "/images/peptech/cartridge.webp"
        }}
      />
    </div>
  )
}
`;
    fs.writeFileSync(thumbnailTsxFile, peptechThumbnailTsx, 'utf8');
    console.log('[PEPTECH] Successfully updated source thumbnail.tsx with fallback');
  }

  // 0.9 Enhance Product Detail and Variant Media Galleries with resilient error fallbacks
  const prodDetailMjsFile = path.resolve(distDir, 'product-detail-7NWBD52L.mjs');
  if (fs.existsSync(prodDetailMjsFile)) {
    let pd = fs.readFileSync(prodDetailMjsFile, 'utf8');
    const targetImg = '/* @__PURE__ */ jsx4(\n              "img",\n              {\n                src: i.url,\n                alt: `${product.title} image`,\n                className: "size-full object-cover"\n              }\n            )';
    const replacementImg = `/* @__PURE__ */ jsx4(
              "img",
              {
                src: i.url,
                alt: \`\${product.title} image\`,
                className: "size-full object-cover",
                onError: (e) => {
                  e.currentTarget.onerror = null;
                  const t = (product?.title || "").toLowerCase();
                  e.currentTarget.src = t.includes("pen") || t.includes("set")
                    ? "/images/peptech/mockup1.webp"
                    : t.includes("vial") || t.includes("lyophilised")
                    ? "/images/peptech/mockup2.webp"
                    : "/images/peptech/cartridge.webp";
                }
              }
            )`;
    if (pd.includes('src: i.url') && !pd.includes('e.currentTarget.src = t.includes("pen")')) {
      pd = pd.replace(targetImg, replacementImg);
      fs.writeFileSync(prodDetailMjsFile, pd, 'utf8');
      console.log('[PEPTECH] Successfully updated product-detail-7NWBD52L.mjs with media fallback');
    }
  }

  const prodMediaSectionTsx = path.resolve(dashboardRoot, 'src/routes/products/product-detail/components/product-media-section/product-media-section.tsx');
  if (fs.existsSync(prodMediaSectionTsx)) {
    let pms = fs.readFileSync(prodMediaSectionTsx, 'utf8');
    if (!pms.includes('e.currentTarget.src = t.includes("pen")')) {
      const oldImg = `<img\n                    src={i.url}\n                    alt={\`\${product.title} image\`}\n                    className="size-full object-cover"\n                  />`;
      const newImg = `<img
                    src={i.url}
                    alt={\`\${product.title} image\`}
                    className="size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      const t = (product?.title || "").toLowerCase()
                      e.currentTarget.src = t.includes("pen") || t.includes("set")
                        ? "/images/peptech/mockup1.webp"
                        : t.includes("vial") || t.includes("lyophilised")
                        ? "/images/peptech/mockup2.webp"
                        : "/images/peptech/cartridge.webp"
                    }}
                  />`;
      pms = pms.replace(oldImg, newImg);
      fs.writeFileSync(prodMediaSectionTsx, pms, 'utf8');
      console.log('[PEPTECH] Successfully updated source product-media-section.tsx with fallback');
    }
  }

  const variantDetailMjsFile = path.resolve(distDir, 'product-variant-detail-SALD6PSA.mjs');
  if (fs.existsSync(variantDetailMjsFile)) {
    let vd = fs.readFileSync(variantDetailMjsFile, 'utf8');
    const oldVd = '/* @__PURE__ */ jsx6("img", { src: i.url, className: "size-full object-cover" })';
    const newVd = `/* @__PURE__ */ jsx6("img", {
                  src: i.url,
                  className: "size-full object-cover",
                  onError: (e) => {
                    e.currentTarget.onerror = null;
                    const t = (variant?.title || "").toLowerCase();
                    e.currentTarget.src = t.includes("pen") || t.includes("set")
                      ? "/images/peptech/mockup1.webp"
                      : t.includes("vial") || t.includes("lyophilised")
                      ? "/images/peptech/mockup2.webp"
                      : "/images/peptech/cartridge.webp";
                  }
                })`;
    if (vd.includes(oldVd)) {
      vd = vd.replace(oldVd, newVd);
      fs.writeFileSync(variantDetailMjsFile, vd, 'utf8');
      console.log('[PEPTECH] Successfully updated product-variant-detail-SALD6PSA.mjs with media fallback');
    }
  }

  const variantMediaSectionTsx = path.resolve(dashboardRoot, 'src/routes/product-variants/product-variant-detail/components/variant-media-section/variant-media-section.tsx');
  if (fs.existsSync(variantMediaSectionTsx)) {
    let vms = fs.readFileSync(variantMediaSectionTsx, 'utf8');
    const oldVms = '<img src={i.url} className="size-full object-cover" />';
    const newVms = `<img
                  src={i.url}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    const t = (variant?.title || "").toLowerCase()
                    e.currentTarget.src = t.includes("pen") || t.includes("set")
                      ? "/images/peptech/mockup1.webp"
                      : t.includes("vial") || t.includes("lyophilised")
                      ? "/images/peptech/mockup2.webp"
                      : "/images/peptech/cartridge.webp"
                  }}
                />`;
    if (vms.includes(oldVms)) {
      vms = vms.replace(oldVms, newVms);
      fs.writeFileSync(variantMediaSectionTsx, vms, 'utf8');
      console.log('[PEPTECH] Successfully updated source variant-media-section.tsx with fallback');
    }
  }

  // 1. Update Order Detail
  const detailPath = path.resolve(__dirname, 'OrderDetail.jsx');
  const subDetailPath = path.resolve(__dirname, 'SubscriptionDetail.jsx');

  if (fs.existsSync(detailPath)) {
    const detailSource = fs.readFileSync(detailPath, 'utf8');

    let subDetailSource = '';
    if (fs.existsSync(subDetailPath)) {
      subDetailSource = fs.readFileSync(subDetailPath, 'utf8');
    }

    const importRegex = /^import\s+[^;]+;\s*$/gm;

    // Header imports (all hoisted to the very top)
    const headerImports = [
      'import { useState, useEffect, useMemo } from "react";',
      'import { useParams, Link, useNavigate } from "react-router-dom";',
      'import { useOrder, useUpdateOrder } from "./chunk-CHQR6GOM.mjs";',
      'import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";',
    ].join('\n');

    // Strip imports from both files
    const cleanSubDetail = subDetailSource
      .replace(importRegex, '')
      .replace(/export\s+default\s+[^;]+;\s*/g, '')
      .replace(/export\s+function\s+SubscriptionDetail/g, 'function SubscriptionDetail')
      .trim();

    const cleanDetail = detailSource
      .replace(importRegex, '')
      .replace(/const DARK_MODE_CSS = `[\s\S]*?`;\r?\n?/, '')
      .replace('export { OrderDetail as Component };', '')
      .trim();

    const exportSuffix = `
const OrderDetailBreadcrumb = () => "Order / Subscription";
const orderLoader = async () => null;
const seo = () => ({ title: "Details - PEPTECH" });

export {
  OrderDetail as Component,
  OrderDetailBreadcrumb as Breadcrumb,
  orderLoader as loader,
  seo
};
`;

    const combined = [
      headerImports,
      cleanSubDetail,
      cleanDetail,
      exportSuffix
    ].filter(Boolean).join('\n\n');

    const targetDetailFile = path.resolve(distDir, 'order-detail-D5MN4DFC.mjs');
    fs.writeFileSync(targetDetailFile, combined, 'utf8');
    console.log('[PEPTECH] Successfully updated order-detail-D5MN4DFC.mjs with Subscription Detail support');
  }

  // 2. Update Order List
  const listPath = path.resolve(__dirname, 'OrderList.jsx');
  if (fs.existsSync(listPath)) {
    const listSource = fs.readFileSync(listPath, 'utf8');
    const targetListFile = path.resolve(distDir, 'order-list-XGUCTQTG.mjs');
    fs.writeFileSync(targetListFile, listSource, 'utf8');
    console.log('[PEPTECH] Successfully updated order-list-XGUCTQTG.mjs');
  }

  // 3. Update Order Create Fulfillment Focus Modal
  const fulfillmentChunkFile = path.resolve(distDir, 'order-create-fulfillment-IF6OCW3B.mjs');
  if (fs.existsSync(fulfillmentChunkFile)) {
    const royalMailModalJs = `import { RouteFocusModal, useRouteModal } from "./chunk-GXJ5J364.mjs";
import { useOrder } from "./chunk-CHQR6GOM.mjs";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Input, Heading, Text, Badge, toast } from "@medusajs/ui";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";

function downloadPdf(base64Data, filename) {
  if (!base64Data) return;
  try {
    const cleanBase64 = base64Data.replace(/^data:application\\/pdf;base64,/, "").trim();
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
  } catch (e) {
    console.error("PDF Download Error:", e);
  }
}

function openPdfPrint(base64Data) {
  if (!base64Data) return;
  try {
    const cleanBase64 = base64Data.replace(/^data:application\\/pdf;base64,/, "").trim();
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, "_blank");
    if (win) win.focus();
  } catch (e) {
    console.error("PDF Print Error:", e);
  }
}

function OrderCreateFulfillment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleSuccess } = useRouteModal();
  const { order, isLoading } = useOrder(id, {
    fields: "*items,*shipping_address,*shipping_methods,metadata,status,payment_status",
  });

  const [serviceCode, setServiceCode] = useState("AUTO");
  const [weightInGrams, setWeightInGrams] = useState(240);
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [dimHeight, setDimHeight] = useState(80);
  const [dimWidth, setDimWidth] = useState(160);
  const [dimDepth, setDimDepth] = useState(220);
  const [includeLabel, setIncludeLabel] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  if (isLoading || !order) {
    return jsx2(RouteFocusModal, {
      children: jsx2("div", {
        className: "p-8 text-center text-sm text-[#5c5f62]",
        children: "Loading order details...",
      }),
    });
  }

  const shipping = order.shipping_address || {};
  const countryCode = String(shipping.country_code || order.metadata?.shipping_country_code || "GB").toUpperCase();
  const isUk = countryCode === "GB";
  const paymentStatus = order.metadata?.payment_status || (order.status === "completed" ? "paid" : "unpaid");
  const isPaid = paymentStatus === "paid" || order.status === "completed";

  const handleCreate = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create shipment in Royal Mail Click & Drop");
      }

      setSuccessData(data);
      if (toast) {
        toast.success("Shipment Created", {
          description: \`Royal Mail tracking: \${data.trackingNumber} (C&D #\${data.orderIdentifier})\`,
        });
      }
    } catch (err) {
      setErrorMsg(err.message || "Fulfillment creation error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (handleSuccess) {
      handleSuccess();
    } else {
      navigate(-1);
    }
  };

  return jsxs2(RouteFocusModal, {
    children: [
      jsx2(RouteFocusModal.Header, {
        children: jsxs2("div", {
          className: "flex items-center justify-between w-full pr-6",
          children: [
            jsxs2("div", {
              className: "flex items-center gap-3",
              children: [
                jsx2("div", {
                  className: "flex items-center justify-center w-8 h-8 rounded-md bg-[#0B1F3A] text-[#00C5A0] font-bold text-xs",
                  children: "RM",
                }),
                jsxs2("div", {
                  children: [
                    jsxs2("div", {
                      className: "flex items-center gap-2",
                      children: [
                        jsx2(Heading, {
                          level: "h2",
                          className: "text-base font-semibold text-[#202223]",
                          children: "Royal Mail Click & Drop Fulfillment",
                        }),
                        jsx2(Badge, {
                          color: isPaid ? "green" : "orange",
                          size: "small",
                          children: isPaid ? "Paid — Ready to Dispatch" : "Payment Required",
                        }),
                      ],
                    }),
                    jsxs2(Text, {
                      size: "small",
                      className: "text-[#5c5f62]",
                      children: [
                        "Order #",
                        order.display_id || order.id,
                        " • Destination: ",
                        shipping.city || "Cambridge",
                        ", ",
                        countryCode,
                        isUk ? " 🇬🇧" : " 🌐",
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),

      jsx2(RouteFocusModal.Body, {
        className: "p-6 max-w-2xl mx-auto space-y-6 overflow-y-auto",
        children: successData ? (
          jsxs2("div", {
            className: "p-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl space-y-4 text-center",
            children: [
              jsx2("div", { className: "text-4xl", children: "📦" }),
              jsx2(Heading, { level: "h2", className: "text-lg font-bold text-[#15803d]", children: "Royal Mail Shipment Created!" }),
              jsxs2("div", {
                className: "p-4 bg-white rounded-lg border border-[#bbf7d0] text-xs space-y-2 text-left",
                children: [
                  jsxs2("div", { className: "flex justify-between", children: [jsx2("span", { className: "text-[#5c5f62]", children: "Tracking Number:" }), jsx2("span", { className: "font-mono font-bold text-[#0b1f3a]", children: successData.trackingNumber })] }),
                  jsxs2("div", { className: "flex justify-between", children: [jsx2("span", { className: "text-[#5c5f62]", children: "Click & Drop Order ID:" }), jsxs2("span", { className: "font-mono font-semibold text-[#16a6a3]", children: ["#", successData.orderIdentifier] })] }),
                  jsxs2("div", { className: "flex justify-between", children: [jsx2("span", { className: "text-[#5c5f62]", children: "Carrier & Service:" }), jsx2("span", { className: "font-medium text-[#202223]", children: successData.carrier })] }),
                ],
              }),
              jsxs2("div", {
                className: "flex items-center justify-center gap-3 pt-2",
                children: [
                  jsx2(Button, {
                    size: "small",
                    variant: "primary",
                    onClick: () => openPdfPrint(successData.labelBase64),
                    children: "🖨️ Print 6x4 Label",
                  }),
                  jsx2(Button, {
                    size: "small",
                    variant: "secondary",
                    onClick: () => downloadPdf(successData.labelBase64, \`Royal-Mail-Label-\${order.display_id || order.id}.pdf\`),
                    children: "⬇️ Download PDF",
                  }),
                ],
              }),
            ],
          })
        ) : (
          jsxs2("div", {
            className: "space-y-4",
            children: [
              !isPaid &&
                jsx2("div", {
                  className: "p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-900",
                  children: "⚠️ Order payment status is currently unpaid. Mark order as paid before generating postage.",
                }),

              // Destination summary
              jsxs2("div", {
                className: "p-4 bg-[#fafbfb] rounded-lg border border-[#e1e3e5] text-xs space-y-1.5",
                children: [
                  jsx2("div", { className: "font-semibold text-[#5c5f62]", children: "Delivery Address" }),
                  jsxs2("div", { className: "font-bold text-[#202223]", children: [\`\${shipping.first_name || ""} \${shipping.last_name || ""}\`.trim() || "Customer", shipping.company ? \` (\${shipping.company})\` : ""] }),
                  jsxs2("div", { className: "text-[#5c5f62]", children: [shipping.address_1, shipping.city ? \`, \${shipping.city}\` : "", shipping.postal_code ? \` \${shipping.postal_code}\` : "", \`, \${countryCode}\`] }),
                ],
              }),

              // Items to fulfill
              jsxs2("div", {
                className: "border border-[#e1e3e5] rounded-lg divide-y divide-[#e1e3e5] overflow-hidden text-xs",
                children: [
                  jsx2("div", { className: "p-2.5 bg-[#f6f6f7] font-semibold text-[#5c5f62]", children: "Package Contents (Laboratory Peptides RUO)" }),
                  (order.items || []).map((it) =>
                    jsxs2("div", {
                      className: "p-3 flex items-center justify-between",
                      children: [
                        jsxs2("div", {
                          children: [
                            jsx2("div", { className: "font-semibold text-[#202223]", children: it.title }),
                            jsxs2("div", { className: "text-[11px] text-[#8c9196]", children: ["SKU: ", it.variant_sku || it.metadata?.sku || "PEP-LAB-01"] }),
                          ],
                        }),
                        jsxs2("div", { className: "font-bold text-[#008060]", children: ["Qty: ", it.quantity] }),
                      ],
                    }, it.id)
                  ),
                ],
              }),

              // Service Code
              jsxs2("div", {
                children: [
                  jsx2("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Royal Mail Service" }),
                  jsxs2("select", {
                    value: serviceCode,
                    onChange: (e) => setServiceCode(e.target.value),
                    className: "w-full border border-[#c9cccf] rounded-md p-2 text-xs bg-white text-[#202223] font-medium",
                    children: [
                      jsx2("option", { value: "AUTO", children: "AUTO — Default Account Rules (Recommended)" }),
                      jsx2("option", { value: "OLP1", children: "OLP1 — Royal Mail 24 (Online Postage)" }),
                      jsx2("option", { value: "OLP2", children: "OLP2 — Royal Mail 48 (Online Postage)" }),
                      jsx2("option", { value: "TPN", children: "TPN — Royal Mail Tracked 24 (OBA Contract)" }),
                      jsx2("option", { value: "TPS", children: "TPS — Royal Mail Tracked 48 (OBA Contract)" }),
                      jsx2("option", { value: "TRM", children: "TRM — Royal Mail Tracked 24 with Signature (OBA)" }),
                      jsx2("option", { value: "SD1", children: "SD1 — Special Delivery Guaranteed by 1pm" }),
                      jsx2("option", { value: "OTA", children: "OTA — Royal Mail International Tracked (OBA)" }),
                      jsx2("option", { value: "OTC", children: "OTC — Royal Mail International Tracked & Signed (OBA)" }),
                      jsx2("option", { value: "OLS", children: "OLS — Royal Mail International Signed (OBA)" }),
                    ],
                  }),
                ],
              }),

              // Weight & Format
              jsxs2("div", {
                className: "grid grid-cols-2 gap-3",
                children: [
                  jsxs2("div", {
                    children: [
                      jsx2("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Gross Weight (grams)" }),
                      jsx2(Input, {
                        type: "number",
                        value: weightInGrams,
                        onChange: (e) => setWeightInGrams(Math.max(1, parseInt(e.target.value, 10) || 1)),
                        placeholder: "240",
                      }),
                    ],
                  }),
                  jsxs2("div", {
                    children: [
                      jsx2("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Package Format" }),
                      jsxs2("select", {
                        value: packageFormat,
                        onChange: (e) => setPackageFormat(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded-md p-2 text-xs bg-white text-[#202223]",
                        children: [
                          jsx2("option", { value: "smallParcel", children: "Small Parcel (Cold-Chain Box)" }),
                          jsx2("option", { value: "mediumParcel", children: "Medium Parcel" }),
                          jsx2("option", { value: "largeLetter", children: "Large Letter (Vial Box)" }),
                          jsx2("option", { value: "parcel", children: "Parcel" }),
                          jsx2("option", { value: "largeParcel", children: "Large Parcel" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Outer Dimensions
              jsxs2("div", {
                children: [
                  jsx2("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Outer Dimensions (mm)" }),
                  jsxs2("div", {
                    className: "grid grid-cols-3 gap-2",
                    children: [
                      jsxs2("div", {
                        children: [
                          jsx2("span", { className: "text-[10px] text-[#5c5f62] block", children: "Height (H)" }),
                          jsx2(Input, {
                            type: "number",
                            value: dimHeight,
                            onChange: (e) => setDimHeight(Math.max(1, parseInt(e.target.value, 10) || 1)),
                            placeholder: "80",
                          }),
                        ],
                      }),
                      jsxs2("div", {
                        children: [
                          jsx2("span", { className: "text-[10px] text-[#5c5f62] block", children: "Width (W)" }),
                          jsx2(Input, {
                            type: "number",
                            value: dimWidth,
                            onChange: (e) => setDimWidth(Math.max(1, parseInt(e.target.value, 10) || 1)),
                            placeholder: "160",
                          }),
                        ],
                      }),
                      jsxs2("div", {
                        children: [
                          jsx2("span", { className: "text-[10px] text-[#5c5f62] block", children: "Depth (D)" }),
                          jsx2(Input, {
                            type: "number",
                            value: dimDepth,
                            onChange: (e) => setDimDepth(Math.max(1, parseInt(e.target.value, 10) || 1)),
                            placeholder: "220",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Include thermal label checkbox
              jsxs2("label", {
                className: "flex items-center gap-2 text-xs text-[#202223] cursor-pointer pt-1",
                children: [
                  jsx2("input", {
                    type: "checkbox",
                    checked: includeLabel,
                    onChange: (e) => setIncludeLabel(e.target.checked),
                    className: "rounded text-[#008060]",
                  }),
                  jsx2("span", { children: "Generate 6x4 thermal PDF label in API response" }),
                ],
              }),

              errorMsg &&
                jsxs2("div", {
                  className: "p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs",
                  children: [jsx2("strong", { children: "Error: " }), errorMsg],
                }),
            ],
          })
        ),
      }),

      jsx2(RouteFocusModal.Footer, {
        children: jsxs2("div", {
          className: "flex items-center justify-end gap-x-2",
          children: [
            jsx2(Button, {
              size: "small",
              variant: "secondary",
              onClick: handleClose,
              children: successData ? "Close" : "Cancel",
            }),
            !successData &&
              jsx2(Button, {
                size: "small",
                variant: "primary",
                disabled: isSubmitting || !isPaid,
                onClick: handleCreate,
                children: isSubmitting
                  ? includeLabel
                    ? "Generating Label in Click & Drop..."
                    : "Creating Shipment in Click & Drop..."
                  : includeLabel
                    ? "Confirm & Generate Label"
                    : "Confirm",
              }),
          ],
        }),
      }),
    ],
  });
}

export { OrderCreateFulfillment as Component };
`;
    fs.writeFileSync(fulfillmentChunkFile, royalMailModalJs, 'utf8');
    console.log('[PEPTECH] Successfully updated order-create-fulfillment-IF6OCW3B.mjs with Royal Mail Click & Drop modal');
  }
}
