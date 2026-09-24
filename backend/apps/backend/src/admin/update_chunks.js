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

  // 0.1 Remove Documentation and Changelog from User Menu in app.js
  const appJsFile = path.resolve(distDir, 'app.js');
  if (fs.existsSync(appJsFile)) {
    let appJs = fs.readFileSync(appJsFile, 'utf8');
    if (appJs.includes('docs.medusajs.com') || appJs.includes('medusajs.com/changelog')) {
      const docsAndChangelogRegex = /\/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.DropdownMenu\.Item, \{ asChild: true, children: \/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.Link, \{ to: "https:\/\/docs\.medusajs\.com"[\s\S]*?t5\("app\.menus\.user\.changelog"\)\s*\] \}\) \}\),?/;
      if (docsAndChangelogRegex.test(appJs)) {
        appJs = appJs.replace(docsAndChangelogRegex, '/* docs & changelog removed */ null, null,');
        fs.writeFileSync(appJsFile, appJs, 'utf8');
        console.log('[PEPTECH] Successfully removed Documentation and Changelog from app.js');
      } else {
        console.warn('[PEPTECH WARN] docsAndChangelogRegex did not match in app.js');
      }
    }
  }

  // 1. Update Order Detail
  const detailPath = path.resolve(__dirname, 'ShopifyOrderDetail.jsx');
  const subDetailPath = path.resolve(__dirname, 'ShopifySubscriptionDetail.jsx');

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
      .replace(/export\s+function\s+ShopifySubscriptionDetail/g, 'function ShopifySubscriptionDetail')
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
  const listPath = path.resolve(__dirname, 'ShopifyOrderList.jsx');
  if (fs.existsSync(listPath)) {
    const listSource = fs.readFileSync(listPath, 'utf8');
    const targetListFile = path.resolve(distDir, 'order-list-XGUCTQTG.mjs');
    fs.writeFileSync(targetListFile, listSource, 'utf8');
    console.log('[PEPTECH] Successfully updated order-list-XGUCTQTG.mjs');
  }
}
