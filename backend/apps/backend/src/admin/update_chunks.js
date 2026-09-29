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
    if (appJs.includes(appJsCrumbsOld)) {
      appJs = appJs.replace(appJsCrumbsOld, appJsCrumbsNew);
      fs.writeFileSync(appJsFile, appJs, 'utf8');
      console.log('[PEPTECH] Successfully added breadcrumb deduplication to app.js');
    }
  }

  // 4.5 Merge settings and locations extension routes before :location_id in getRouteMap
  if (fs.existsSync(ztChunkFile)) {
    let ztJs = fs.readFileSync(ztChunkFile, 'utf8');
    const ztLocTarget = `                {
                  path: ":location_id",`;
    const ztLocReplacement = `                ...((() => {
                  const extLoc = (settingsRoutes || []).flatMap((r) => r?.children || []).find((c) => c && c.path === "locations");
                  return extLoc?.children || [];
                })()),
                {
                  path: ":location_id",`;
    if (ztJs.includes(ztLocTarget) && !ztJs.includes('const extLoc = (settingsRoutes || [])')) {
      ztJs = ztJs.replace(ztLocTarget, ztLocReplacement);
    }
    const ztSettingsTarget = `            ...settingsRoutes.flatMap((r) => r?.children || [])`;
    const ztSettingsReplacement = `            ...(settingsRoutes || []).flatMap((r) => r?.children || []).filter((r) => r && r.path !== "locations")`;
    if (ztJs.includes(ztSettingsTarget)) {
      ztJs = ztJs.replace(ztSettingsTarget, ztSettingsReplacement);
    }
    fs.writeFileSync(ztChunkFile, ztJs, 'utf8');
    console.log('[PEPTECH] Successfully patched locations route merging in chunk-ZT6PMEES.mjs');
  }

  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    const appLocTarget = `                {
                  path: ":location_id",`;
    const appLocReplacement = `                ...((() => {
                  const extLoc = (settingsRoutes || []).flatMap((r) => r?.children || []).find((c) => c && c.path === "locations");
                  return extLoc?.children || [];
                })()),
                {
                  path: ":location_id",`;
    if (appJs.includes(appLocTarget) && !appJs.includes('const extLoc = (settingsRoutes || [])')) {
      appJs = appJs.replace(appLocTarget, appLocReplacement);
    }
    const appSettingsTarget = `            ...settingsRoutes.flatMap((r) => r?.children || [])`;
    const appSettingsReplacement = `            ...(settingsRoutes || []).flatMap((r) => r?.children || []).filter((r) => r && r.path !== "locations")`;
    if (appJs.includes(appSettingsTarget)) {
      appJs = appJs.replace(appSettingsTarget, appSettingsReplacement);
    }
    fs.writeFileSync(appJsFile, appJs, 'utf8');
    console.log('[PEPTECH] Successfully patched locations route merging in app.js');
  }

  const getRouteMapTsx = path.resolve(dashboardRoot, 'src/dashboard-app/routes/get-route.map.tsx');
  if (fs.existsSync(getRouteMapTsx)) {
    let grmTsx = fs.readFileSync(getRouteMapTsx, 'utf8');
    const tsxLocTarget = `                {
                  path: ":location_id",`;
    const tsxLocReplacement = `                ...((() => {
                  const extLoc = (settingsRoutes || []).flatMap((r) => r?.children || []).find((c) => c && c.path === "locations");
                  return extLoc?.children || [];
                })()),
                {
                  path: ":location_id",`;
    if (grmTsx.includes(tsxLocTarget) && !grmTsx.includes('const extLoc = (settingsRoutes || [])')) {
      grmTsx = grmTsx.replace(tsxLocTarget, tsxLocReplacement);
    }
    const tsxSettingsTarget = `            ...settingsRoutes.flatMap((r) => r?.children || []),`;
    const tsxSettingsReplacement = `            ...(settingsRoutes || []).flatMap((r) => r?.children || []).filter((r) => r && r.path !== "locations"),`;
    if (grmTsx.includes(tsxSettingsTarget)) {
      grmTsx = grmTsx.replace(tsxSettingsTarget, tsxSettingsReplacement);
    }
    fs.writeFileSync(getRouteMapTsx, grmTsx, 'utf8');
    console.log('[PEPTECH] Successfully patched locations route merging in get-route.map.tsx');
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
      fs.rmSync(viteCacheDir, { recursive: true, force: true });
      console.log('[PEPTECH] Successfully cleared stale Vite dependency cache');
    } catch (e) {
      console.warn('[PEPTECH WARN] Could not clear .vite cache:', e.message);
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
}
