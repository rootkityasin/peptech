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

  // 2. Update Locations & Shipping LinksSection with Packaging Profiles link
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

  // Also update source location-list.tsx
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
}
