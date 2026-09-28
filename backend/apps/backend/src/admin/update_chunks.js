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
import { useState, useEffect } from "react";
import { Button, Input, Heading, Text, Badge, toast } from "@medusajs/ui";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";

function downloadPdf(base64Data, filename) {
  if (!base64Data) return;
  try {
    const cleanBase64 = String(base64Data || "").replace("data:application/pdf;base64,", "").trim();
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
    const cleanBase64 = String(base64Data || "").replace("data:application/pdf;base64,", "").trim();
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
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profiles, setProfiles] = useState([
    { id: "pen-set", name: "Complete Pen Set Box", format: "smallParcel", formatLabel: "Small Parcel", weight: 240, h: 80, w: 160, d: 220 },
    { id: "vials-letter", name: "Freeze-Dried Vials Box", format: "largeLetter", formatLabel: "Large Letter", weight: 95, h: 24, w: 125, d: 185 },
    { id: "refill-letter", name: "Refill Cartridge Box", format: "largeLetter", formatLabel: "Large Letter", weight: 110, h: 25, w: 120, d: 160 },
    { id: "multi-parcel", name: "Multi-Item / Cold-Chain Kit", format: "mediumParcel", formatLabel: "Medium Parcel", weight: 520, h: 140, w: 220, d: 300 }
  ]);
  const [weightInGrams, setWeightInGrams] = useState(240);
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [dimHeight, setDimHeight] = useState(80);
  const [dimWidth, setDimWidth] = useState(160);
  const [dimDepth, setDimDepth] = useState(220);
  const [includeLabel, setIncludeLabel] = useState(true);

  useEffect(() => {
    fetch("/admin/custom/packaging-profiles", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.profiles) && d.profiles.length > 0) {
          setProfiles(
            d.profiles.map((p) => ({
              id: p.id,
              name: p.name,
              format: p.packageFormatIdentifier,
              formatLabel: p.packageFormatLabel || p.packageFormatIdentifier,
              weight: p.weightInGrams,
              h: p.dimensions?.heightInMms || 80,
              w: p.dimensions?.widthInMms || 160,
              d: p.dimensions?.depthInMms || 220,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleProfileChange = (pid) => {
    setSelectedProfileId(pid);
    if (!pid || pid === "custom") return;
    const target = profiles.find((p) => p.id === pid);
    if (target) {
      setWeightInGrams(target.weight);
      setPackageFormat(target.format);
      setDimHeight(target.h);
      setDimWidth(target.w);
      setDimDepth(target.d);
    }
  };

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

              // Packaging Profile Preset (Black Theme)
              jsxs2("div", {
                className: "bg-black text-white p-3.5 rounded-lg border border-neutral-800 space-y-2 shadow-sm",
                children: [
                  jsx2("label", { className: "block text-xs font-semibold text-white mb-1", children: "Packaging Profile" }),
                  jsxs2("select", {
                    value: selectedProfileId,
                    onChange: (e) => handleProfileChange(e.target.value),
                    className: "w-full border border-neutral-700 rounded-md p-2 text-xs bg-[#18181b] text-white font-medium focus:outline-none focus:border-[#00C5A0]",
                    children: [
                      jsx2("option", { value: "", className: "bg-[#18181b] text-neutral-300", children: "-- Choose a Packaging Profile (Optional) --" }),
                      profiles.map((p) =>
                        jsx2("option", {
                          value: p.id,
                          className: "bg-[#18181b] text-white",
                          children: \`\${p.name} (\${p.weight}g • \${p.formatLabel || p.format} • \${p.h}×\${p.w}×\${p.d}mm)\`
                        }, p.id)
                      ),
                      jsx2("option", { value: "custom", className: "bg-[#18181b] text-neutral-300", children: "Custom (Manual Entry)" })
                    ]
                  })
                ]
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
                        onChange: (e) => {
                          setWeightInGrams(Math.max(1, parseInt(e.target.value, 10) || 1));
                          setSelectedProfileId("custom");
                        },
                        placeholder: "240",
                      }),
                    ],
                  }),
                  jsxs2("div", {
                    children: [
                      jsx2("label", { className: "block text-xs font-semibold text-[#202223] mb-1", children: "Package Format" }),
                      jsxs2("select", {
                        value: packageFormat,
                        onChange: (e) => {
                          setPackageFormat(e.target.value);
                          setSelectedProfileId("custom");
                        },
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
                            onChange: (e) => {
                              setDimHeight(Math.max(1, parseInt(e.target.value, 10) || 1));
                              setSelectedProfileId("custom");
                            },
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
                            onChange: (e) => {
                              setDimWidth(Math.max(1, parseInt(e.target.value, 10) || 1));
                              setSelectedProfileId("custom");
                            },
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
                            onChange: (e) => {
                              setDimDepth(Math.max(1, parseInt(e.target.value, 10) || 1));
                              setSelectedProfileId("custom");
                            },
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

  // 4. Create Settings Packaging Profiles List Chunk
  const packagingProfilesChunkFile = path.resolve(distDir, 'packaging-profiles-list-PEPTECH.mjs');
  const packagingProfilesJs = `import { Container, Heading, Text, Button, Input, Label, Badge, Table } from "@medusajs/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

const DEFAULT_PACKAGING_PROFILES = [
  { id: "pen-set", name: "Complete Pen Set Box", packageFormatIdentifier: "smallParcel", packageFormatLabel: "Small Parcel", weightInGrams: 240, dimensions: { heightInMms: 80, widthInMms: 160, depthInMms: 220 }, isSystem: true },
  { id: "vials-letter", name: "Freeze-Dried Vials Box", packageFormatIdentifier: "largeLetter", packageFormatLabel: "Large Letter", weightInGrams: 95, dimensions: { heightInMms: 24, widthInMms: 125, depthInMms: 185 }, isSystem: true },
  { id: "refill-letter", name: "Refill Cartridge Box", packageFormatIdentifier: "largeLetter", packageFormatLabel: "Large Letter", weightInGrams: 110, dimensions: { heightInMms: 25, widthInMms: 120, depthInMms: 160 }, isSystem: true },
  { id: "multi-parcel", name: "Multi-Item / Cold-Chain Kit", packageFormatIdentifier: "mediumParcel", packageFormatLabel: "Medium Parcel", weightInGrams: 520, dimensions: { heightInMms: 140, widthInMms: 220, depthInMms: 300 }, isSystem: true }
];

function PackagingProfilesPage() {
  const [profiles, setProfiles] = useState(DEFAULT_PACKAGING_PROFILES);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [weight, setWeight] = useState(240);
  const [h, setH] = useState(80);
  const [w, setW] = useState(160);
  const [d, setD] = useState(220);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/admin/custom/packaging-profiles", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);
          try { localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles)); } catch {}
          return;
        }
      }
    } catch {}
    try {
      const local = localStorage.getItem("peptech_packaging_profiles");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) setProfiles(parsed);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPackageFormat(p.packageFormatIdentifier);
    setWeight(p.weightInGrams);
    setH(p.dimensions?.heightInMms || 80);
    setW(p.dimensions?.widthInMms || 160);
    setD(p.dimensions?.depthInMms || 220);
    setMessage(\`Editing "\${p.name}". Update the fields below and click "Update Packaging Profile".\`);
    setErrorMsg("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPackageFormat("smallParcel");
    setWeight(240);
    setH(80);
    setW(160);
    setD(220);
    setMessage("");
    setErrorMsg("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a profile name.");
      return;
    }
    setIsSaving(true);
    setErrorMsg("");
    setMessage("");

    try {
      const payload = {
        name: name.trim(),
        packageFormatIdentifier: packageFormat,
        weightInGrams: Number(weight) || 240,
        dimensions: {
          heightInMms: Number(h) || 80,
          widthInMms: Number(w) || 160,
          depthInMms: Number(d) || 220,
        },
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/admin/custom/packaging-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save packaging profile.");
      }

      if (Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try { localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles)); } catch {}
      }

      setMessage(editingId ? \`Successfully updated "\${name.trim()}".\` : \`Successfully created "\${name.trim()}".\`);
      cancelEdit();
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (id, profileName) => {
    if (!confirm(\`Are you sure you want to delete the packaging profile "\${profileName}"?\`)) {
      return;
    }

    try {
      const res = await fetch(\`/admin/custom/packaging-profiles?id=\${encodeURIComponent(id)}\`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete packaging profile.");
      }

      if (Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try { localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles)); } catch {}
      }
      if (editingId === id) {
        cancelEdit();
      }
      setMessage(\`Deleted "\${profileName}".\`);
    } catch (err) {
      setErrorMsg(err.message || "Could not delete profile.");
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset packaging profiles back to PEPTECH standard factory defaults?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(\`/admin/custom/packaging-profiles?action=reset\`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try { localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles)); } catch {}
        cancelEdit();
        setMessage("Packaging profiles reset to standard defaults.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  return _jsxs("div", {
    className: "space-y-4 max-w-5xl mx-auto p-4",
    children: [
      _jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          _jsxs("div", {
            className: "text-xs text-[#5c5f62] flex items-center gap-1.5",
            children: [
              _jsx(Link, { to: "/settings", className: "hover:underline text-[#5c5f62]", children: "Settings" }),
              _jsx("span", { children: "/" }),
              _jsx(Link, { to: "/settings/locations", className: "hover:underline text-[#5c5f62]", children: "Locations & Shipping" }),
              _jsx("span", { children: "/" }),
              _jsx("span", { className: "text-[#202223] font-semibold", children: "Packaging Profiles" })
            ]
          }),
          _jsx(Link, {
            to: "/settings/locations",
            className: "text-xs text-[#16a6a3] hover:underline inline-flex items-center gap-1 font-medium",
            children: "← Back to Locations & Shipping"
          })
        ]
      }),

      _jsxs(Container, {
        className: "divide-y p-0",
        children: [
          _jsxs("div", {
            className: "flex flex-col gap-2 p-6",
            children: [
              _jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx("span", { className: "text-2xl", children: "📦" }),
                          _jsx(Heading, { level: "h1", className: "text-xl font-bold text-[#202223]", children: "Packaging Profiles" })
                        ]
                      }),
                      _jsx(Text, {
                        className: "text-[#5c5f62] text-sm mt-1",
                        children: "Configure reusable box dimensions, gross weight presets, and Royal Mail formats under Locations & Shipping."
                      })
                    ]
                  }),
                  _jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      _jsx(Button, {
                        size: "small",
                        variant: "secondary",
                        onClick: handleResetDefaults,
                        disabled: isLoading,
                        children: "↺ Reset to Defaults"
                      }),
                      _jsx(Button, {
                        size: "small",
                        variant: "secondary",
                        onClick: loadProfiles,
                        disabled: isLoading,
                        children: "↻ Refresh"
                      })
                    ]
                  })
                ]
              }),
              message && _jsx("div", { className: "p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md", children: message }),
              errorMsg && _jsx("div", { className: "p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md", children: errorMsg })
            ]
          }),

          _jsxs("div", {
            className: "p-6 space-y-4",
            children: [
              _jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  _jsxs(Heading, { level: "h2", className: "text-base font-semibold text-[#202223]", children: ["Active Packaging Profiles (", profiles.length, ")"] }),
                  _jsx("span", { className: "text-xs text-[#8c9196]", children: "Auto-fills fulfillment weight and box dimensions on order dispatch." })
                ]
              }),

              _jsx("div", {
                className: "border rounded-lg overflow-hidden",
                children: _jsxs(Table, {
                  children: [
                    _jsx(Table.Header, {
                      children: _jsxs(Table.Row, {
                        children: [
                          _jsx(Table.HeaderCell, { children: "Profile Name" }),
                          _jsx(Table.HeaderCell, { children: "Package Format" }),
                          _jsx(Table.HeaderCell, { children: "Gross Weight (g)" }),
                          _jsx(Table.HeaderCell, { children: "Outer Dimensions (mm)" }),
                          _jsx(Table.HeaderCell, { children: "Type" }),
                          _jsx(Table.HeaderCell, { className: "text-right", children: "Actions" })
                        ]
                      })
                    }),
                    _jsx(Table.Body, {
                      children: profiles.map((p) =>
                        _jsxs(Table.Row, {
                          children: [
                            _jsx(Table.Cell, { className: "font-semibold text-[#202223]", children: p.name }),
                            _jsx(Table.Cell, {
                              children: _jsx(Badge, { color: "blue", size: "small", children: p.packageFormatLabel || p.packageFormatIdentifier })
                            }),
                            _jsxs(Table.Cell, { className: "font-mono text-xs", children: [p.weightInGrams, " g"] }),
                            _jsxs(Table.Cell, {
                              className: "font-mono text-xs text-[#5c5f62]",
                              children: [p.dimensions?.heightInMms || 80, " × ", p.dimensions?.widthInMms || 160, " × ", p.dimensions?.depthInMms || 220, " mm"]
                            }),
                            _jsx(Table.Cell, {
                              children: p.isSystem
                                ? _jsx(Badge, { color: "grey", size: "small", children: "Default Preset" })
                                : _jsx(Badge, { color: "green", size: "small", children: "Custom" })
                            }),
                            _jsx(Table.Cell, {
                              className: "text-right",
                              children: _jsxs("div", {
                                className: "flex items-center justify-end gap-2",
                                children: [
                                  _jsx(Button, { size: "small", variant: "secondary", onClick: () => startEdit(p), children: "Edit" }),
                                  _jsx(Button, { size: "small", variant: "danger", onClick: () => handleDeleteProfile(p.id, p.name), children: "Delete" })
                                ]
                              })
                            })
                          ]
                        }, p.id)
                      )
                    })
                  ]
                })
              })
            ]
          }),

          _jsxs("form", {
            onSubmit: handleSaveProfile,
            className: "p-6 bg-[#fafbfb] space-y-4",
            children: [
              _jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx(Heading, { level: "h2", className: "text-base font-semibold text-[#202223]", children: editingId ? "✏️ Edit Packaging Profile" : "➕ Create Packaging Profile" }),
                      _jsx(Text, { className: "text-[#5c5f62] text-xs mt-0.5", children: editingId ? "Update existing preset values." : "Add a custom packaging specification." })
                    ]
                  }),
                  editingId && _jsx(Button, { size: "small", variant: "secondary", onClick: cancelEdit, children: "✕ Cancel Edit" })
                ]
              }),

              _jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx(Label, { className: "text-xs font-medium text-[#202223] mb-1 block", children: "Profile Name" }),
                      _jsx(Input, {
                        value: name,
                        onChange: (e) => setName(e.target.value),
                        placeholder: "e.g. 5x Vial Cold Pack Mailer",
                        required: true
                      })
                    ]
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(Label, { className: "text-xs font-medium text-[#202223] mb-1 block", children: "Royal Mail Package Format" }),
                      _jsxs("select", {
                        value: packageFormat,
                        onChange: (e) => setPackageFormat(e.target.value),
                        className: "w-full border border-[#c9cccf] rounded-md p-2 text-xs bg-white text-[#202223]",
                        children: [
                          _jsx("option", { value: "smallParcel", children: "Small Parcel (Cold-Chain Box)" }),
                          _jsx("option", { value: "largeLetter", children: "Large Letter (Vial Box)" }),
                          _jsx("option", { value: "mediumParcel", children: "Medium Parcel" }),
                          _jsx("option", { value: "parcel", children: "Parcel" }),
                          _jsx("option", { value: "largeParcel", children: "Large Parcel" })
                        ]
                      })
                    ]
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(Label, { className: "text-xs font-medium text-[#202223] mb-1 block", children: "Gross Weight (grams)" }),
                      _jsx(Input, {
                        type: "number",
                        value: weight,
                        onChange: (e) => setWeight(Math.max(1, parseInt(e.target.value, 10) || 1)),
                        placeholder: "240",
                        required: true
                      })
                    ]
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx(Label, { className: "text-xs font-medium text-[#202223] mb-1 block", children: "Outer Dimensions (H × W × D mm)" }),
                      _jsxs("div", {
                        className: "grid grid-cols-3 gap-2",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("span", { className: "text-[10px] text-[#5c5f62] block", children: "Height (H)" }),
                              _jsx(Input, {
                                type: "number",
                                value: h,
                                onChange: (e) => setH(Math.max(1, parseInt(e.target.value, 10) || 1)),
                                placeholder: "80",
                                required: true
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("span", { className: "text-[10px] text-[#5c5f62] block", children: "Width (W)" }),
                              _jsx(Input, {
                                type: "number",
                                value: w,
                                onChange: (e) => setW(Math.max(1, parseInt(e.target.value, 10) || 1)),
                                placeholder: "160",
                                required: true
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("span", { className: "text-[10px] text-[#5c5f62] block", children: "Depth (D)" }),
                              _jsx(Input, {
                                type: "number",
                                value: d,
                                onChange: (e) => setD(Math.max(1, parseInt(e.target.value, 10) || 1)),
                                placeholder: "220",
                                required: true
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),

              _jsxs("div", {
                className: "flex items-center gap-2 pt-2",
                children: [
                  _jsx(Button, {
                    size: "small",
                    variant: "primary",
                    type: "submit",
                    disabled: isSaving || !name.trim(),
                    children: isSaving ? "Saving..." : editingId ? "Update Packaging Profile" : "Save Packaging Profile"
                  }),
                  editingId && _jsx(Button, { size: "small", variant: "secondary", onClick: cancelEdit, children: "Cancel" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

const packagingBreadcrumb = () => "Packaging Profiles";
const packagingLoader = async () => null;
const packagingSeo = () => ({ title: "Packaging Profiles - PEPTECH" });

export {
  PackagingProfilesPage as Component,
  packagingBreadcrumb as Breadcrumb,
  packagingLoader as loader,
  packagingSeo as seo
};
`;
  fs.writeFileSync(packagingProfilesChunkFile, packagingProfilesJs, 'utf8');
  console.log('[PEPTECH] Successfully created packaging-profiles-list-PEPTECH.mjs');

  // 5. Update Locations & Shipping LinksSection with Packaging Profiles link
  const locationListFile = path.resolve(distDir, 'location-list-WQ7ZAUO7.mjs');
  if (fs.existsSync(locationListFile)) {
    let locJs = fs.readFileSync(locationListFile, 'utf8');
    if (!locJs.includes('/settings/locations/packaging-profiles')) {
      const targetPattern = 'to: "/settings/locations/shipping-option-types",';
      const replacementPattern = `to: "/settings/locations/packaging-profiles",
        labelKey: "Packaging Profiles",
        descriptionKey: "Box dimensions, gross weight presets, and packaging formats for Royal Mail dispatch.",
        icon: /* @__PURE__ */ jsx7(ShoppingBag, {})
      }
    ),
    /* @__PURE__ */ jsx7(
      SidebarLink,
      {
        to: "/settings/locations/shipping-option-types",`;
      if (locJs.includes(targetPattern)) {
        locJs = locJs.replace(targetPattern, replacementPattern);
        fs.writeFileSync(locationListFile, locJs, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles link to location-list-WQ7ZAUO7.mjs');
      }
    }
  }

  // 6. Register packaging-profiles route under locations in chunk-ZT6PMEES.mjs
  const ztChunkFile = path.resolve(distDir, 'chunk-ZT6PMEES.mjs');
  if (fs.existsSync(ztChunkFile)) {
    let ztJs = fs.readFileSync(ztChunkFile, 'utf8');
    if (!ztJs.includes('path: "packaging-profiles"')) {
      const ztTarget = 'path: "shipping-option-types",';
      const ztReplacement = `path: "packaging-profiles",
                  lazy: () => import("./packaging-profiles-list-PEPTECH.mjs"),
                  handle: {
                    breadcrumb: () => "Packaging Profiles"
                  }
                },
                {
                  path: "shipping-option-types",`;
      if (ztJs.includes(ztTarget)) {
        ztJs = ztJs.replace(ztTarget, ztReplacement);
        fs.writeFileSync(ztChunkFile, ztJs, 'utf8');
        console.log('[PEPTECH] Successfully registered packaging-profiles route in chunk-ZT6PMEES.mjs');
      }
    }
  }
}

