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
  const possibleViteCacheDirs = [
    path.resolve(__dirname, '../../../../node_modules/.vite'),
    path.resolve(__dirname, '../../../node_modules/.vite'),
    path.resolve(__dirname, '../../node_modules/.vite'),
  ];
  for (const vDir of possibleViteCacheDirs) {
    if (fs.existsSync(vDir)) {
      try {
        fs.rmSync(vDir, { recursive: true, force: true });
        console.log('[PEPTECH] Successfully cleared stale Vite dependency cache in:', vDir);
      } catch (e) {
        console.warn('[PEPTECH WARN] Could not clear .vite cache:', e.message);
      }
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

  // 1. Note on Order Detail & Order List:
  // We strictly preserve native Medusa 2.0 order-detail and order-list chunks so that:
  // - Native <OrderFulfillmentSection /> and actions are preserved.
  // - Medusa's <LayoutComposer widgetsZonePrefix="order.details"> mounts custom widgets (like order-royal-mail-fulfillment.tsx).
  console.log('[PEPTECH] Preserving native Medusa 2.0 Order Detail and Order List components.');

  // 2. Update Locations & Shipping LinksSection and Settings navigation with Packaging Profiles link
  // 2.1 Update all location-list-*.mjs chunks in dist
  const distFiles = fs.readdirSync(distDir);
  const locationListFiles = distFiles.filter(f => f.startsWith('location-list') && f.endsWith('.mjs'));
  for (const locFile of locationListFiles) {
    const locFilePath = path.resolve(distDir, locFile);
    let locJs = fs.readFileSync(locFilePath, 'utf8');
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
        fs.writeFileSync(locFilePath, locJs, 'utf8');
        console.log(`[PEPTECH] Successfully added Packaging Profiles link to ${locFile}`);
      }
    }
  }

  // 2.2 Update LinksSection in app.js
  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    if (!appJs.includes('/settings/locations/packaging-profiles')) {
      const appJsTarget = `to: "/settings/locations/shipping-option-types",
            labelKey: t5("stockLocations.sidebar.shippingOptionTypes.label"),`;
      const appJsReplacement = `to: "/settings/locations/packaging-profiles",
            labelKey: "Packaging Profiles",
            descriptionKey: "Box dimensions, gross weight presets, and packaging formats for Royal Mail dispatch.",
            icon: /* @__PURE__ */ (0, import_jsx_runtime672.jsx)(import_icons166.ShoppingBag, {})
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime672.jsx)(
          SidebarLink,
          {
            to: "/settings/locations/shipping-option-types",
            labelKey: t5("stockLocations.sidebar.shippingOptionTypes.label"),`;
      if (appJs.includes(appJsTarget)) {
        appJs = appJs.replace(appJsTarget, appJsReplacement);
        fs.writeFileSync(appJsFile, appJs, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles link to app.js LinksSection');
      }
    }

    // 2.3 Update useBusinessRoutes in app.js
    if (!appJs.includes('to: "/settings/locations/packaging-profiles"')) {
      const appRoutesTarget = `to: "/settings/locations"\n          },`;
      const appRoutesReplacement = `to: "/settings/locations"\n          },\n          {\n            label: "Packaging Profiles",\n            to: "/settings/locations/packaging-profiles"\n          },`;
      if (appJs.includes(appRoutesTarget)) {
        appJs = appJs.replace(appRoutesTarget, appRoutesReplacement);
        fs.writeFileSync(appJsFile, appJs, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles to app.js useBusinessRoutes');
      }
    }
  }

  // 2.4 Update useBusinessRoutes in chunk-ZT6PMEES.mjs
  const ztChunkFileEarly = path.resolve(distDir, 'chunk-ZT6PMEES.mjs');
  if (fs.existsSync(ztChunkFileEarly)) {
    let ztJs = fs.readFileSync(ztChunkFileEarly, 'utf8');
    if (!ztJs.includes('to: "/settings/locations/packaging-profiles"')) {
      const ztTarget = `to: "/settings/locations"\n      },`;
      const ztReplacement = `to: "/settings/locations"\n      },\n      {\n        label: "Packaging Profiles",\n        to: "/settings/locations/packaging-profiles"\n      },`;
      if (ztJs.includes(ztTarget)) {
        ztJs = ztJs.replace(ztTarget, ztReplacement);
        fs.writeFileSync(ztChunkFileEarly, ztJs, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles to chunk-ZT6PMEES.mjs useBusinessRoutes');
      }
    }
  }

  // 2.5 Update source settings-layout.tsx
  const settingsLayoutTsx = path.resolve(dashboardRoot, 'src/components/layout/settings-layout/settings-layout.tsx');
  if (fs.existsSync(settingsLayoutTsx)) {
    let slTsx = fs.readFileSync(settingsLayoutTsx, 'utf8');
    if (!slTsx.includes('/settings/locations/packaging-profiles')) {
      const slTarget = `to: "/settings/locations",\n      },`;
      const slReplacement = `to: "/settings/locations",\n      },\n      {\n        label: "Packaging Profiles",\n        to: "/settings/locations/packaging-profiles",\n      },`;
      if (slTsx.includes(slTarget)) {
        slTsx = slTsx.replace(slTarget, slReplacement);
        fs.writeFileSync(settingsLayoutTsx, slTsx, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles link to source settings-layout.tsx');
      }
    }
  }

  // 2.6 Also update source location-list.tsx
  const locationListTsx = path.resolve(dashboardRoot, 'src/routes/locations/location-list/location-list.tsx');
  if (fs.existsSync(locationListTsx)) {
    let locTsx = fs.readFileSync(locationListTsx, 'utf8');
    if (!locTsx.includes('/settings/locations/packaging-profiles')) {
      const tsxTarget = `<SidebarLink
        to="/settings/locations/shipping-option-types"`;
      const tsxReplacement = `<SidebarLink
        to="/settings/locations/packaging-profiles"
        labelKey="Packaging Profiles"
        descriptionKey="Box dimensions, gross weight presets, and packaging formats for Royal Mail dispatch."
        icon={<ShoppingBag />}
      />
      <SidebarLink
        to="/settings/locations/shipping-option-types"`;
      if (locTsx.includes(tsxTarget)) {
        locTsx = locTsx.replace(tsxTarget, tsxReplacement);
        fs.writeFileSync(locationListTsx, locTsx, 'utf8');
        console.log('[PEPTECH] Successfully added Packaging Profiles link to source location-list.tsx');
      }
    }
  }

  // 3. Enhance createBranchRoute in chunk-ZT6PMEES.mjs and app.js so intermediate branches have clean breadcrumbs
  const ztChunkFile = path.resolve(distDir, 'chunk-ZT6PMEES.mjs');
  if (fs.existsSync(ztChunkFile)) {
    let ztJs = fs.readFileSync(ztChunkFile, 'utf8');
    const oldBranchRoute = `var createBranchRoute = (segment) => ({
  path: segment,
  children: []
});`;
    const newBranchRoute = `var createBranchRoute = (segment) => {
  const branchLabels = {
    locations: "Locations",
    "shipping-profiles": "Shipping Profiles",
    "shipping-option-types": "Shipping Option Types",
    "packaging-profiles": "Packaging Profiles",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    regions: "Regions",
    "sales-channels": "Sales Channels",
    promotions: "Promotions",
    inventory: "Inventory"
  };
  const label = branchLabels[segment] || segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    path: segment,
    handle: {
      breadcrumb: () => label
    },
    children: []
  };
};`;
    if (ztJs.includes(oldBranchRoute)) {
      ztJs = ztJs.replace(oldBranchRoute, newBranchRoute);
      fs.writeFileSync(ztChunkFile, ztJs, 'utf8');
      console.log('[PEPTECH] Successfully enhanced createBranchRoute in chunk-ZT6PMEES.mjs');
    }

    const oldAddRoute = `let route = currentLevel.find((r) => r.path === currentSegment);
  if (!route) {
    route = createBranchRoute(currentSegment);
    currentLevel.push(route);
  }`;
    const newAddRoute = `let route = currentLevel.find((r) => r.path === currentSegment);
  if (!route) {
    route = createBranchRoute(currentSegment);
    currentLevel.push(route);
  } else if (!route.handle) {
    const branchLabels = {
      locations: "Locations",
      "shipping-profiles": "Shipping Profiles",
      "shipping-option-types": "Shipping Option Types",
      "packaging-profiles": "Packaging Profiles",
      products: "Products",
      orders: "Orders",
      customers: "Customers",
      regions: "Regions",
      "sales-channels": "Sales Channels",
      promotions: "Promotions",
      inventory: "Inventory"
    };
    const label = branchLabels[currentSegment] || currentSegment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    route.handle = {
      breadcrumb: () => label
    };
  }`;
    if (ztJs.includes(oldAddRoute) && !ztJs.includes('else if (!route.handle)')) {
      ztJs = ztJs.replace(oldAddRoute, newAddRoute);
      fs.writeFileSync(ztChunkFile, ztJs, 'utf8');
      console.log('[PEPTECH] Successfully enhanced addRoute in chunk-ZT6PMEES.mjs');
    }
  }

  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    const oldAppBranch = `createBranchRoute = (segment) => ({
      path: segment,
      children: []
    });`;
    const newAppBranch = `createBranchRoute = (segment) => {
      const branchLabels = {
        locations: "Locations",
        "shipping-profiles": "Shipping Profiles",
        "shipping-option-types": "Shipping Option Types",
        "packaging-profiles": "Packaging Profiles",
        products: "Products",
        orders: "Orders",
        customers: "Customers",
        regions: "Regions",
        "sales-channels": "Sales Channels",
        promotions: "Promotions",
        inventory: "Inventory"
      };
      const label = branchLabels[segment] || segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return {
        path: segment,
        handle: {
          breadcrumb: () => label
        },
        children: []
      };
    };`;
    if (appJs.includes(oldAppBranch)) {
      appJs = appJs.replace(oldAppBranch, newAppBranch);
      fs.writeFileSync(appJsFile, appJs, 'utf8');
      console.log('[PEPTECH] Successfully enhanced createBranchRoute in app.js');
    }
  }

  const possibleUtilsTsFiles = [
    path.resolve(__dirname, '../../../../node_modules/@medusajs/dashboard/src/dashboard-app/routes/utils.ts'),
    path.resolve(__dirname, '../../../node_modules/@medusajs/dashboard/src/dashboard-app/routes/utils.ts'),
    path.resolve(__dirname, '../../node_modules/@medusajs/dashboard/src/dashboard-app/routes/utils.ts'),
  ];
  for (const utilsTsFile of possibleUtilsTsFiles) {
    if (fs.existsSync(utilsTsFile)) {
      let utilsTs = fs.readFileSync(utilsTsFile, 'utf8');
      const oldUtilsBranch = `const createBranchRoute = (segment: string): RouteObject => ({
  path: segment,
  children: [],
})`;
      const newUtilsBranch = `const createBranchRoute = (segment: string): RouteObject => {
  const branchBreadcrumbs: Record<string, string> = {
    locations: "Locations",
    "shipping-profiles": "Shipping Profiles",
    "shipping-option-types": "Shipping Option Types",
    "packaging-profiles": "Packaging Profiles",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    regions: "Regions",
    "sales-channels": "Sales Channels",
    promotions: "Promotions",
    inventory: "Inventory",
  };
  const label = branchBreadcrumbs[segment] || segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    path: segment,
    handle: {
      breadcrumb: () => label,
    },
    children: [],
  };
};`;
      if (utilsTs.includes(oldUtilsBranch)) {
        utilsTs = utilsTs.replace(oldUtilsBranch, newUtilsBranch);
        fs.writeFileSync(utilsTsFile, utilsTs, 'utf8');
        console.log('[PEPTECH] Successfully enhanced createBranchRoute in utils.ts');
      }

      const oldUtilsAdd = `  if (!route) {
    route = createBranchRoute(currentSegment)
    currentLevel.push(route)
  }`;
      const newUtilsAdd = `  if (!route) {
    route = createBranchRoute(currentSegment)
    currentLevel.push(route)
  } else if (!route.handle) {
    route.handle = createBranchRoute(currentSegment).handle
  }`;
      if (utilsTs.includes(oldUtilsAdd) && !utilsTs.includes('else if (!route.handle)')) {
        utilsTs = utilsTs.replace(oldUtilsAdd, newUtilsAdd);
        fs.writeFileSync(utilsTsFile, utilsTs, 'utf8');
        console.log('[PEPTECH] Successfully enhanced addRoute in utils.ts');
      }
    }
  }

  // 4. Deduplicate consecutive duplicate breadcrumbs in Shell Breadcrumbs component
  const ztChunkCrumbsOld = `return {
      label,
      path: match.pathname
    };
  }).filter(Boolean);`;
  const ztChunkCrumbsNew = `return {
      label,
      path: match.pathname
    };
  }).filter(Boolean).filter((crumb, idx, arr) => idx === 0 || crumb.path !== arr[idx - 1].path || String(crumb.label) !== String(arr[idx - 1].label));`;

  if (fs.existsSync(ztChunkFile)) {
    let ztJs = fs.readFileSync(ztChunkFile, 'utf8');
    if (ztJs.includes(ztChunkCrumbsOld)) {
      ztJs = ztJs.replace(ztChunkCrumbsOld, ztChunkCrumbsNew);
      fs.writeFileSync(ztChunkFile, ztJs, 'utf8');
      console.log('[PEPTECH] Successfully added breadcrumb deduplication to chunk-ZT6PMEES.mjs');
    }
  }

  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    const appJsCrumbsOld = `return {
          label,
          path: match.pathname
        };
      }).filter(Boolean);`;
    const appJsCrumbsNew = `return {
          label,
          path: match.pathname
        };
      }).filter(Boolean).filter((crumb, idx, arr) => idx === 0 || crumb.path !== arr[idx - 1].path || String(crumb.label) !== String(arr[idx - 1].label));`;
    if (appJs.includes(appJsCrumbsOld)) {
      appJs = appJs.replace(appJsCrumbsOld, appJsCrumbsNew);
      fs.writeFileSync(appJsFile, appJs, 'utf8');
      console.log('[PEPTECH] Successfully added breadcrumb deduplication to app.js');
    }
  }

  // 5. Update OrderCreateFulfillmentForm in chunk (order-create-fulfillment-IF6OCW3B.mjs)
  const orderCreateFulfillmentMjsFile = path.resolve(distDir, 'order-create-fulfillment-IF6OCW3B.mjs');
  if (fs.existsSync(orderCreateFulfillmentMjsFile)) {
    const completeChunkCode = `import {
  getReservationsLimitCount
} from "./chunk-4XSXVVYD.mjs";
import {
  getFulfillableQuantity
} from "./chunk-WKOPGFW5.mjs";
import {
  divideDecimal
} from "./chunk-UQQD6PHX.mjs";
import {
  Combobox
} from "./chunk-53MXUSIR.mjs";
import "./chunk-IUCDCPJU.mjs";
import {
  KeyboundForm
} from "./chunk-6HTZNHPT.mjs";
import {
  useComboboxData
} from "./chunk-5IQBFJVZ.mjs";
import {
  Thumbnail
} from "./chunk-MNXC6Q4F.mjs";
import "./chunk-M6QL27ZL.mjs";
import {
  RouteFocusModal,
  useRouteModal
} from "./chunk-GXJ5J364.mjs";
import {
  Form
} from "./chunk-OBQI23QM.mjs";
import "./chunk-WWCRED3P.mjs";
import "./chunk-CXRGHH7Y.mjs";
import "./chunk-HIX2NSSN.mjs";
import "./chunk-2LVQXUFY.mjs";
import "./chunk-EYDZJ522.mjs";
import "./chunk-A4EQBFAR.mjs";
import "./chunk-QG545K2O.mjs";
import "./chunk-RW5LLFK2.mjs";
import "./chunk-ISGDOD5J.mjs";
import "./chunk-QIUJGXDT.mjs";
import "./chunk-ZB3WPQQA.mjs";
import "./chunk-DEOCXBV2.mjs";
import "./chunk-2V5DOTI3.mjs";
import "./chunk-PTP3K7TB.mjs";
import "./chunk-22ELTIVU.mjs";
import "./chunk-Y2BEKAYF.mjs";
import "./chunk-2VYWSRWQ.mjs";
import "./chunk-D3TDNKSZ.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SH6DEX5S.mjs";
import "./chunk-DSBMVN2K.mjs";
import "./chunk-RIAKFHWQ.mjs";
import "./chunk-3C2RPYDJ.mjs";
import {
  shippingOptionsQueryKeys,
  useShippingOption
} from "./chunk-4SIZ37QP.mjs";
import {
  useCreateOrderFulfillment,
  useOrder
} from "./chunk-CHQR6GOM.mjs";
import {
  useReservationItems
} from "./chunk-HWLVYKUO.mjs";
import "./chunk-BGQF2VTH.mjs";
import "./chunk-EMDIIWVL.mjs";
import "./chunk-YDJ774GR.mjs";
import "./chunk-SKQPG6BC.mjs";
import "./chunk-5N2B66CN.mjs";
import {
  useProductVariant
} from "./chunk-2G6AYJ2P.mjs";
import "./chunk-HGRIOEAR.mjs";
import "./chunk-SEMVMECK.mjs";
import {
  sdk
} from "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

import { useParams, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Switch, toast, clx, Input, Text, Tooltip } from "@medusajs/ui";
import { InformationCircleSolid } from "@medusajs/icons";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { jsx, jsxs } from "react/jsx-runtime";

// Schema
var CreateFulfillmentSchema = z.object({
  quantity: z.record(z.string(), z.number()),
  location_id: z.string(),
  shipping_option_id: z.string().optional(),
  send_notification: z.boolean().optional()
});

// Line Item Component
function OrderCreateFulfillmentItem({
  item,
  form,
  locationId,
  reservations,
  disabled
}) {
  const { t } = useTranslation();
  const { variant } = useProductVariant(
    item.product_id ?? "",
    item.variant_id ?? "",
    {
      fields: "*inventory,*inventory.location_levels,*inventory_items"
    },
    {
      enabled: !!item.variant
    }
  );
  const { availableQuantity, inStockQuantity } = useMemo(() => {
    if (!variant?.inventory_items?.length || !variant?.inventory?.length || !locationId) {
      return {};
    }
    const { inventory, inventory_items } = variant;
    const locationHasEveryInventoryItem = inventory.every(
      (i) => i.location_levels?.find((inv) => inv.location_id === locationId)
    );
    if (!locationHasEveryInventoryItem) {
      return {};
    }
    const inventoryItemRequiredQuantityMap = new Map(
      inventory_items.map((i) => [i.inventory_item_id, i.required_quantity])
    );
    const reservation = reservations?.find((r) => r.line_item_id === item.id);
    const iitemRequiredQuantity = inventory_items.find(
      (i) => i.inventory_item_id === reservation?.inventory_item_id
    )?.required_quantity;
    const reservedQuantityForItem = !reservation ? 0 : divideDecimal(reservation.quantity, iitemRequiredQuantity ?? 1);
    const locationInventoryLevels = inventory.map((i) => {
      const level = i.location_levels?.find(
        (inv) => inv.location_id === locationId
      );
      const requiredQuantity = inventoryItemRequiredQuantityMap.get(i.id);
      if (!level || !requiredQuantity) {
        return {
          availableQuantity: Number.MAX_SAFE_INTEGER,
          stockedQuantity: Number.MAX_SAFE_INTEGER
        };
      }
      const availableQuantity2 = divideDecimal(
        level.available_quantity ?? 0,
        requiredQuantity
      );
      const stockedQuantity = divideDecimal(
        level.stocked_quantity,
        requiredQuantity
      );
      return {
        availableQuantity: availableQuantity2,
        stockedQuantity
      };
    });
    const maxAvailableQuantity = Math.min(
      ...locationInventoryLevels.map((i) => i.availableQuantity)
    );
    const maxStockedQuantity = Math.min(
      ...locationInventoryLevels.map((i) => i.stockedQuantity)
    );
    if (maxAvailableQuantity === Number.MAX_SAFE_INTEGER || maxStockedQuantity === Number.MAX_SAFE_INTEGER) {
      return {};
    }
    return {
      availableQuantity: Math.floor(
        maxAvailableQuantity + reservedQuantityForItem
      ),
      inStockQuantity: Math.floor(maxStockedQuantity)
    };
  }, [variant, locationId, reservations]);
  const minValue = 0;
  const maxValue = Math.min(
    getFulfillableQuantity(item),
    availableQuantity || Number.MAX_SAFE_INTEGER
  );
  return /* @__PURE__ */ jsx("div", { className: "bg-ui-bg-subtle shadow-elevation-card-rest my-2 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center", children: [
    disabled && /* @__PURE__ */ jsx("div", { className: "ml-4 inline-flex items-center", children: /* @__PURE__ */ jsx(
      Tooltip,
      {
        content: t("orders.fulfillment.disabledItemTooltip"),
        side: "top",
        children: /* @__PURE__ */ jsx(InformationCircleSolid, { className: "text-ui-tag-orange-icon" })
      }
    ) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: clx(
          "flex flex-1 flex-col gap-x-2 gap-y-2 border-b p-3 text-sm sm:flex-row",
          disabled && "pointer-events-none opacity-50"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-x-3", children: [
            /* @__PURE__ */ jsx(Thumbnail, { src: item.thumbnail }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text, { className: "txt-small", as: "span", weight: "plus", children: item.title }),
                item.variant_sku && /* @__PURE__ */ jsxs("span", { children: [
                  "(",
                  item.variant_sku,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Text, { as: "div", className: "text-ui-fg-subtle txt-small", children: item.variant_title })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-x-1", children: [
            /* @__PURE__ */ jsx("div", { className: "mr-2 block h-[16px] w-[2px] bg-gray-200" }),
            /* @__PURE__ */ jsxs("div", { className: "text-small flex flex-1 flex-col", children: [
              /* @__PURE__ */ jsx("span", { className: "text-ui-fg-subtle font-medium", children: t("orders.fulfillment.available") }),
              /* @__PURE__ */ jsx("span", { className: "text-ui-fg-subtle", children: availableQuantity || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-x-1", children: [
              /* @__PURE__ */ jsx("div", { className: "mr-2 block h-[16px] w-[2px] bg-gray-200" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-ui-fg-subtle font-medium", children: t("orders.fulfillment.inStock") }),
                /* @__PURE__ */ jsxs("span", { className: "text-ui-fg-subtle", children: [
                  inStockQuantity || "N/A",
                  " ",
                  inStockQuantity && /* @__PURE__ */ jsxs("span", { className: "font-medium text-red-500", children: [
                    "-",
                    form.getValues(\`quantity.\${item.id}\`)
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                Form.Field,
                {
                  control: form.control,
                  name: \`quantity.\${item.id}\`,
                  rules: { required: true, min: minValue, max: maxValue },
                  render: ({ field }) => {
                    return /* @__PURE__ */ jsxs(Form.Item, { children: [
                      /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          className: "bg-ui-bg-base txt-small w-[50px] rounded-lg text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                          type: "number",
                          ...field,
                          onChange: (e) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            field.onChange(val);
                            if (val !== null && !isNaN(val)) {
                              if (val < minValue || val > maxValue) {
                                form.setError(\`quantity.\${item.id}\`, {
                                  type: "manual",
                                  message: t(
                                    "orders.fulfillment.error.wrongQuantity",
                                    {
                                      count: maxValue,
                                      number: maxValue
                                    }
                                  )
                                });
                              } else {
                                form.clearErrors(\`quantity.\${item.id}\`);
                              }
                            }
                          }
                        }
                      ) }),
                      /* @__PURE__ */ jsx(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-ui-fg-subtle", children: [
                "/ ",
                item.quantity,
                " ",
                t("fields.qty")
              ] })
            ] })
          ] })
        ]
      }
    )
  ] }) });
}

// Royal Mail Packaging Presets
var DEFAULT_PACKAGING_PROFILES = [
  {
    id: "pen-set",
    name: "Complete Pen Set Box",
    packageFormatIdentifier: "smallParcel",
    packageFormatLabel: "Small Parcel",
    weightInGrams: 240,
    dimensions: { heightInMms: 80, widthInMms: 160, depthInMms: 220 }
  },
  {
    id: "vials-letter",
    name: "Freeze-Dried Vials Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 95,
    dimensions: { heightInMms: 24, widthInMms: 125, depthInMms: 185 }
  },
  {
    id: "refill-letter",
    name: "Refill Cartridge Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 110,
    dimensions: { heightInMms: 25, widthInMms: 120, depthInMms: 160 }
  },
  {
    id: "multi-parcel",
    name: "Multi-Item / Cold-Chain Kit",
    packageFormatIdentifier: "mediumParcel",
    packageFormatLabel: "Medium Parcel",
    weightInGrams: 520,
    dimensions: { heightInMms: 140, widthInMms: 220, depthInMms: 300 }
  }
];

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
  } catch (err) {
    console.error("PDF Download Error:", err);
  }
}

// Fulfillment Form Component
function OrderCreateFulfillmentForm({
  order,
  requiresShipping
}) {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const { isPending: isMutating } = useCreateOrderFulfillment(order.id);

  const countryCode = (order.shipping_address?.country_code || order.metadata?.shipping_country_code || "GB").toUpperCase();
  const isUk = countryCode === "GB";

  const autoProfile = (() => {
    const titles = (order.items || []).map((it) => (it.title || "").toLowerCase());
    if (titles.some((ti) => ti.includes("pen") || ti.includes("set"))) return "pen-set";
    if (titles.some((ti) => ti.includes("vial") || ti.includes("lyophilised"))) return "vials-letter";
    if (titles.some((ti) => ti.includes("refill") || ti.includes("cartridge"))) return "refill-letter";
    return "pen-set";
  })();

  const [selectedProfileId, setSelectedProfileId] = useState(autoProfile);
  const [serviceCode, setServiceCode] = useState(isUk ? "AUTO" : "OTA");
  const [packageFormat, setPackageFormat] = useState(autoProfile === "pen-set" ? "smallParcel" : "largeLetter");
  const [weightInGrams, setWeightInGrams] = useState(autoProfile === "pen-set" ? 240 : 110);
  const [dimHeight, setDimHeight] = useState(autoProfile === "pen-set" ? 80 : 25);
  const [dimWidth, setDimWidth] = useState(autoProfile === "pen-set" ? 160 : 120);
  const [dimDepth, setDimDepth] = useState(autoProfile === "pen-set" ? 220 : 160);
  const [includeLabel, setIncludeLabel] = useState(true);
  const [isSubmittingRM, setIsSubmittingRM] = useState(false);

  const handleProfileChange = (profileId) => {
    setSelectedProfileId(profileId);
    const target = DEFAULT_PACKAGING_PROFILES.find((p) => p.id === profileId);
    if (target) {
      setWeightInGrams(target.weightInGrams);
      setPackageFormat(target.packageFormatIdentifier);
      setDimHeight(target.dimensions.heightInMms);
      setDimWidth(target.dimensions.widthInMms);
      setDimDepth(target.dimensions.depthInMms);
    }
  };

  const { reservations } = useReservationItems({
    line_item_id: order.items.map((i) => i.id),
    limit: getReservationsLimitCount(order)
  });
  const [fulfillableItems, setFulfillableItems] = useState(
    () => (order.items || []).filter(
      (item) => item.requires_shipping === requiresShipping && getFulfillableQuantity(item) > 0
    )
  );
  const form = useForm({
    defaultValues: {
      quantity: fulfillableItems.reduce((acc, item) => {
        acc[item.id] = getFulfillableQuantity(item);
        return acc;
      }, {}),
      send_notification: !order.no_notification
    },
    resolver: zodResolver(CreateFulfillmentSchema)
  });
  const selectedLocationId = useWatch({
    name: "location_id",
    control: form.control
  });
  const stockLocations = useComboboxData({
    queryFn: (params) => sdk.admin.stockLocation.list(params),
    queryKey: ["stock_locations"],
    getOptions: (data) => data.stock_locations.map((location) => ({
      label: location.name,
      value: location.id
    })),
    selectedValue: selectedLocationId
  });

  const initialShippingOptionId = order.shipping_methods?.[0]?.shipping_option_id;
  const { shipping_option: initialShippingOption } = useShippingOption(
    initialShippingOptionId,
    { fields: "+service_zone.fulfillment_set.location.id" },
    { enabled: !!initialShippingOptionId }
  );
  const handleSubmit = form.handleSubmit(async (data) => {
    let items = Object.entries(data.quantity).map(([id, quantity]) => ({
      id,
      quantity
    })).filter(({ quantity }) => !!quantity);

    if (items.length === 0) {
      toast.error(t("orders.fulfillment.error.noItems"));
      return;
    }

    setIsSubmittingRM(true);
    try {
      const resolvedLocationId =
        selectedLocationId ||
        stockLocations.options[0]?.value ||
        initialShippingOption?.service_zone?.fulfillment_set?.location?.id ||
        "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ";

      const resolvedShippingOptionId =
        initialShippingOptionId ||
        (isUk ? "so_01M2AQBJF4RGXHZWYACYK0FR42" : "so_01M2AQBJF4P8WHASPP2DZMC0KX");

      const res = await fetch("/admin/custom/fulfillment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          location_id: resolvedLocationId,
          shipping_option_id: resolvedShippingOptionId,
          serviceCode,
          weightInGrams: Number(weightInGrams) || 240,
          packageFormatIdentifier: packageFormat,
          dimensions: {
            heightInMms: Number(dimHeight) || 80,
            widthInMms: Number(dimWidth) || 160,
            depthInMms: Number(dimDepth) || 220
          },
          includeLabelInResponse: Boolean(includeLabel),
          no_notification: !data.send_notification,
          items
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to create Royal Mail fulfillment");
      }

      if (resData.labelBase64 && includeLabel) {
        downloadPdf(
          resData.labelBase64,
          \`Royal-Mail-Label-\${order.display_id || order.id}.pdf\`
        );
      }

      toast.success(t("orders.fulfillment.toast.created"), {
        description: resData.trackingNumber
          ? \`Royal Mail tracking: \${resData.trackingNumber}\`
          : undefined
      });

      handleSuccess(\`/orders/\${order.id}\`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("errorBoundary.defaultTitle")
      );
    } finally {
      setIsSubmittingRM(false);
    }
  });
  useEffect(() => {
    if (!initialShippingOption) {
      return;
    }
    form.setValue(
      "location_id",
      initialShippingOption.service_zone.fulfillment_set.location.id
    );
    form.setValue("shipping_option_id", initialShippingOption.id);
  }, [initialShippingOption]);
  const fulfilledQuantityArray = (order.items || []).map(
    (item) => item.requires_shipping === requiresShipping && item.detail?.fulfilled_quantity
  );
  useEffect(() => {
    const itemsToFulfill = order?.items?.filter(
      (item) => item.requires_shipping === requiresShipping && getFulfillableQuantity(item) > 0
    ) || [];
    setFulfillableItems(itemsToFulfill);
    if (itemsToFulfill.length) {
      form.clearErrors("root");
    } else {
      form.setError("root", {
        type: "manual",
        message: t("orders.fulfillment.error.noItems")
      });
    }
    const quantityMap = itemsToFulfill.reduce((acc, item) => {
      acc[item.id] = getFulfillableQuantity(item);
      return acc;
    }, {});
    form.setValue("quantity", quantityMap);
  }, [...fulfilledQuantityArray, requiresShipping]);
  return /* @__PURE__ */ jsx(RouteFocusModal.Form, { form, children: /* @__PURE__ */ jsxs(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex h-full flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsx(RouteFocusModal.Header, {}),
        /* @__PURE__ */ jsx(RouteFocusModal.Body, { className: "flex h-full w-full flex-col items-center divide-y overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex size-full flex-col items-center overflow-auto p-16", children: /* @__PURE__ */ jsx("div", { className: "flex w-full max-w-[736px] flex-col justify-center px-2 pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col divide-y divide-dashed", children: [
          /* @__PURE__ */ jsx("div", { className: "pb-8", children: /* @__PURE__ */ jsx(
            Form.Field,
            {
              control: form.control,
              name: "location_id",
              render: ({ field: { ...field } }) => {
                return /* @__PURE__ */ jsxs(Form.Item, { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 xl:flex-row xl:items-center", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsx(Form.Label, { children: t("fields.location") }),
                      /* @__PURE__ */ jsx(Form.Hint, { children: t("orders.fulfillment.locationDescription") })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                      Combobox,
                      {
                        ...field,
                        options: stockLocations.options,
                        searchValue: stockLocations.searchValue,
                        onSearchValueChange: stockLocations.onSearchValueChange,
                        disabled: stockLocations.disabled
                      }
                    ) }) })
                  ] }),
                  /* @__PURE__ */ jsx(Form.ErrorMessage, {})
                ] });
              }
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 xl:flex-row xl:items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(Form.Label, { children: t("fields.shippingMethod") }),
                /* @__PURE__ */ jsx(Form.Hint, { children: "Official carrier integration for domestic & international dispatch" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-md bg-[#0B1F3A] text-[#00C5A0] font-bold text-xs", children: "RM" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-xs font-semibold text-ui-fg-base flex items-center gap-1.5", children: [
                    "Royal Mail Click & Drop",
                    /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00C5A0]/10 text-[#00C5A0] border border-[#00C5A0]/20", children: isUk ? "Domestic UK" : "International Tracked" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-ui-fg-subtle", children: isUk ? "Royal Mail Tracked 24 / 48 (Domestic)" : "Royal Mail International Tracked (Worldwide)" })
                ] })
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle/50 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ui-fg-base mb-1", children: "Royal Mail Service Code" }),
                  /* @__PURE__ */ jsxs("select", {
                    value: serviceCode,
                    onChange: (e) => setServiceCode(e.target.value),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-2 text-ui-fg-base",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "AUTO", children: "AUTO — Default Account Rules (Recommended)" }),
                      /* @__PURE__ */ jsx("option", { value: "TPN", children: "TPN — Royal Mail Tracked 24" }),
                      /* @__PURE__ */ jsx("option", { value: "TPS", children: "TPS — Royal Mail Tracked 48" }),
                      /* @__PURE__ */ jsx("option", { value: "OLP1", children: "OLP1 — Royal Mail 24 (Online Postage)" }),
                      /* @__PURE__ */ jsx("option", { value: "OLP2", children: "OLP2 — Royal Mail 48 (Online Postage)" }),
                      /* @__PURE__ */ jsx("option", { value: "TRM", children: "TRM — Royal Mail Tracked 24 (Signature)" }),
                      /* @__PURE__ */ jsx("option", { value: "SD1", children: "SD1 — Special Delivery Guaranteed by 1pm" }),
                      /* @__PURE__ */ jsx("option", { value: "OTA", children: "OTA — Royal Mail International Tracked" }),
                      /* @__PURE__ */ jsx("option", { value: "OTC", children: "OTC — Royal Mail International Tracked & Signed" }),
                      /* @__PURE__ */ jsx("option", { value: "OLS", children: "OLS — Royal Mail International Signed" })
                    ]
                  })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ui-fg-base mb-1", children: "Packaging Profile" }),
                  /* @__PURE__ */ jsxs("select", {
                    value: selectedProfileId,
                    onChange: (e) => handleProfileChange(e.target.value),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-2 text-ui-fg-base font-medium",
                    children: [
                      DEFAULT_PACKAGING_PROFILES.map((p) => /* @__PURE__ */ jsxs("option", { value: p.id, children: [
                        p.name,
                        " (",
                        p.packageFormatLabel,
                        " · ",
                        p.weightInGrams,
                        "g)"
                      ] }, p.id)),
                      /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom Dimensions & Weight" })
                    ]
                  })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-medium text-ui-fg-subtle mb-1", children: "Gross Weight (g)" }),
                  /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: weightInGrams,
                    onChange: (e) => setWeightInGrams(Number(e.target.value)),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-1.5 text-ui-fg-base"
                  })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-medium text-ui-fg-subtle mb-1", children: "Height (mm)" }),
                  /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: dimHeight,
                    onChange: (e) => setDimHeight(Number(e.target.value)),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-1.5 text-ui-fg-base"
                  })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-medium text-ui-fg-subtle mb-1", children: "Width (mm)" }),
                  /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: dimWidth,
                    onChange: (e) => setDimWidth(Number(e.target.value)),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-1.5 text-ui-fg-base"
                  })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-medium text-ui-fg-subtle mb-1", children: "Depth (mm)" }),
                  /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: dimDepth,
                    onChange: (e) => setDimDepth(Number(e.target.value)),
                    className: "w-full text-xs rounded-md border border-ui-border-base bg-ui-bg-base p-1.5 text-ui-fg-base"
                  })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-ui-fg-base cursor-pointer pt-1", children: [
                /* @__PURE__ */ jsx("input", {
                  type: "checkbox",
                  checked: includeLabel,
                  onChange: (e) => setIncludeLabel(e.target.checked),
                  className: "rounded text-ui-fg-interactive"
                }),
                /* @__PURE__ */ jsx("span", { children: "Generate & download 6x4 thermal PDF label immediately upon fulfillment" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(Form.Item, { className: "mt-8", children: [
              /* @__PURE__ */ jsx(Form.Label, { children: t("orders.fulfillment.itemsToFulfill") }),
              /* @__PURE__ */ jsx(Form.Hint, { children: t("orders.fulfillment.itemsToFulfillDesc") }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-1", children: fulfillableItems.map((item) => {
                return /* @__PURE__ */ jsx(
                  OrderCreateFulfillmentItem,
                  {
                    form,
                    item,
                    locationId: selectedLocationId,
                    disabled: false,
                    reservations: reservations ?? [],
                    currencyCode: order.currency_code
                  },
                  item.id
                );
              }) })
            ] }),
            form.formState.errors.root && /* @__PURE__ */ jsx(
              Alert,
              {
                variant: "error",
                dismissible: false,
                className: "flex items-center",
                children: form.formState.errors.root.message
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 ", children: /* @__PURE__ */ jsx(
            Form.Field,
            {
              control: form.control,
              name: "send_notification",
              render: ({ field: { onChange, value, ...field } }) => {
                return /* @__PURE__ */ jsxs(Form.Item, { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx(Form.Label, { children: t("orders.returns.sendNotification") }),
                    /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        dir: "ltr",
                        className: "rtl:rotate-180",
                        checked: !!value,
                        onCheckedChange: onChange,
                        ...field
                      }
                    ) }) })
                  ] }),
                  /* @__PURE__ */ jsx(Form.Hint, { className: "!mt-1", children: t("orders.fulfillment.sendNotificationHint") }),
                  /* @__PURE__ */ jsx(Form.ErrorMessage, {})
                ] });
              }
            }
          ) })
        ] }) }) }) }),
        /* @__PURE__ */ jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "small", variant: "secondary", children: t("actions.cancel") }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "small",
              type: "submit",
              isLoading: isSubmittingRM || isMutating,
              children: "Confirm & Fulfill with Royal Mail"
            }
          )
        ] }) })
      ]
    }
  ) });
}

// Route Component
function OrderCreateFulfillment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requiresShipping = searchParams.get("requires_shipping") === "true";
  const { order, isLoading, isError, error } = useOrder(id, {
    fields: "currency_code,*items,*items.variant,+items.variant.product.shipping_profile.id,*shipping_address,+shipping_methods.shipping_option_id,no_notification"
  });
  if (isError) {
    throw error;
  }
  const ready = !isLoading && order;
  return /* @__PURE__ */ jsx(RouteFocusModal, { children: ready && /* @__PURE__ */ jsx(
    OrderCreateFulfillmentForm,
    {
      order,
      requiresShipping
    }
  ) });
}
export {
  OrderCreateFulfillment as Component
};
`;

    fs.writeFileSync(orderCreateFulfillmentMjsFile, completeChunkCode, 'utf8');
    console.log('[PEPTECH] Successfully updated order-create-fulfillment-IF6OCW3B.mjs with complete Royal Mail implementation');
  }
}

