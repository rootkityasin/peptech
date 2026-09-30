const fs = require('fs');
const path = require('path');

const possibleDistDirs = [
  path.resolve(__dirname, '../../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../../node_modules/@medusajs/dashboard/dist'),
  path.resolve(__dirname, '../node_modules/@medusajs/dashboard/dist'),
];

let distDir = possibleDistDirs.find(d => fs.existsSync(d));

console.log('[PEPTECH] Syncing dashboard chunks in:', distDir);

if (!distDir) {
  console.warn('[PEPTECH] Could not locate @medusajs/dashboard/dist directory.');
} else {
  const dashboardRoot = path.dirname(distDir);

  // 1. Update order-list chunks (dist) and order-list.tsx (src)
  const orderListSrc = path.resolve(__dirname, '../src/admin/components/orders/OrderList.jsx');
  if (fs.existsSync(orderListSrc)) {
    const listCode = fs.readFileSync(orderListSrc, 'utf8');
    const files = fs.readdirSync(distDir);
    const orderListFiles = files.filter(f => f.startsWith('order-list') && f.endsWith('.mjs'));
    for (const f of orderListFiles) {
      fs.writeFileSync(path.join(distDir, f), listCode, 'utf8');
      console.log(`[PEPTECH] Successfully updated ${f} with custom OrderList`);
    }

    // Update src/routes/orders/order-list/order-list.tsx for dev mode Vite
    const srcOrderList = path.join(dashboardRoot, 'src/routes/orders/order-list/order-list.tsx');
    if (fs.existsSync(srcOrderList)) {
      fs.writeFileSync(srcOrderList, listCode, 'utf8');
      console.log('[PEPTECH] Successfully updated dashboard src/routes/orders/order-list/order-list.tsx');
    }
    const srcOrderListIndex = path.join(dashboardRoot, 'src/routes/orders/order-list/index.ts');
    if (fs.existsSync(srcOrderListIndex)) {
      fs.writeFileSync(srcOrderListIndex, 'export * from "./order-list";\nexport { OrderList as Component } from "./order-list";\n', 'utf8');
    }
  }

  // 1.1 Update order-detail chunks (dist) and order-detail.tsx (src)
  const orderDetailSrc = path.resolve(__dirname, '../src/admin/components/orders/OrderDetail.jsx');
  if (fs.existsSync(orderDetailSrc)) {
    const detailCode = fs.readFileSync(orderDetailSrc, 'utf8');
    const files = fs.readdirSync(distDir);
    const orderDetailFiles = files.filter(f => f.startsWith('order-detail') && f.endsWith('.mjs'));
    for (const f of orderDetailFiles) {
      fs.writeFileSync(path.join(distDir, f), detailCode, 'utf8');
      console.log(`[PEPTECH] Successfully updated ${f} with custom OrderDetail`);
    }

    // Update src/routes/orders/order-detail/order-detail.tsx for dev mode Vite
    const srcOrderDetail = path.join(dashboardRoot, 'src/routes/orders/order-detail/order-detail.tsx');
    if (fs.existsSync(srcOrderDetail)) {
      fs.writeFileSync(srcOrderDetail, detailCode, 'utf8');
      console.log('[PEPTECH] Successfully updated dashboard src/routes/orders/order-detail/order-detail.tsx');
    }
    const srcOrderDetailIndex = path.join(dashboardRoot, 'src/routes/orders/order-detail/index.ts');
    if (fs.existsSync(srcOrderDetailIndex)) {
      fs.writeFileSync(srcOrderDetailIndex, 'export * from "./order-detail";\nexport { OrderDetail as Component } from "./order-detail";\n', 'utf8');
    }
  }

  // 2. Remove Documentation, Changelog, Brand Welcome, and Extension Icon Shadow Box
  const files = fs.readdirSync(distDir);

  // 2.1 Patch extension icons to remove shadow-borders-base wrapper in dist chunks
  const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  for (const f of jsFiles) {
    const filePath = path.join(distDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let mod = false;

    if (content.includes('shadow-borders-base bg-ui-bg-base flex h-5 w-5 items-center justify-center rounded-[4px]')) {
      content = content.replace(
        /type === "extension" \? \/\* @__PURE__ \*\/ [^)]*\("div", \{ className: "shadow-borders-base bg-ui-bg-base flex h-5 w-5 items-center justify-center rounded-\[4px\]", children: \/\* @__PURE__ \*\/ [^)]*\("div", \{ className: "h-\[15px\] w-\[15px\] overflow-hidden rounded-sm", children: icon \} ?\) ?\} ?\) : icon/g,
        'icon'
      );
      // Fallback regex in case of slight variance
      content = content.replace(
        /type === "extension"\s*\?[^:]*shadow-borders-base bg-ui-bg-base[^:]*children:\s*icon\s*\}\s*\)\s*\}\s*\)\s*:\s*icon/g,
        'icon'
      );
      mod = true;
      console.log(`[PEPTECH] Stripped extension icon shadow box from ${f}`);
    }

    if (f === 'app.js') {
      if (content.includes('docs.medusajs.com') || content.includes('medusajs.com/changelog')) {
        const regex = /\/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.DropdownMenu\.Item, \{ asChild: true, children: \/\* @__PURE__ \*\/ \(0, [^)]+\)\([^)]+\.Link, \{ to: "https:\/\/docs\.medusajs\.com"[\s\S]*?t5\("app\.menus\.user\.changelog"\)\s*\] \}\) \}\),?/;
        if (regex.test(content)) {
          content = content.replace(regex, '/* docs & changelog removed */ null, null,');
          mod = true;
        }
      }
    }

    if (content.includes('Welcome to Medusa')) {
      content = content.split('Welcome to Medusa').join('Welcome to PEPTECH®');
      mod = true;
    }

    if (mod) fs.writeFileSync(filePath, content, 'utf8');
  }

  // 2.2 Patch src/components/layout/nav-item/nav-item.tsx for dev mode
  const srcNavItem = path.join(dashboardRoot, 'src/components/layout/nav-item/nav-item.tsx');
  if (fs.existsSync(srcNavItem)) {
    let navContent = fs.readFileSync(srcNavItem, 'utf8');
    if (navContent.includes('className="shadow-borders-base bg-ui-bg-base')) {
      navContent = navContent.replace(
        /return type === "extension" \? \([\s\S]*?<div className="shadow-borders-base bg-ui-bg-base[\s\S]*?<\/div>[\s\S]*?\) : \(\s*icon\s*\)/g,
        'return icon'
      );
      fs.writeFileSync(srcNavItem, navContent, 'utf8');
      console.log('[PEPTECH] Successfully updated nav-item.tsx to remove extension icon shadow box');
    }
  }

  // 3. Append / Update custom CSS in app.css
  const customCssFile = path.resolve(__dirname, '../src/admin/styles/custom.css');
  const appCssFile = path.resolve(distDir, 'app.css');
  if (fs.existsSync(customCssFile) && fs.existsSync(appCssFile)) {
    const customCss = fs.readFileSync(customCssFile, 'utf8');
    let appCss = fs.readFileSync(appCssFile, 'utf8');
    const marker = '/* ========================================================\n   PEPTECH® Clean Custom Admin Design';
    if (appCss.includes(marker)) {
      appCss = appCss.substring(0, appCss.indexOf(marker)).trim() + '\n\n' + customCss;
    } else {
      appCss += '\n\n' + customCss;
    }
    fs.writeFileSync(appCssFile, appCss, 'utf8');
    console.log('[PEPTECH] Successfully updated dist/app.css with latest custom.css');
  }

  // 4. Purge Vite cache directories so dev mode Vite immediately re-optimizes
  const possibleViteCaches = [
    path.resolve(__dirname, '../node_modules/.vite'),
    path.resolve(__dirname, '../../node_modules/.vite'),
    path.resolve(__dirname, '../../../node_modules/.vite'),
    path.resolve(__dirname, '../../../../node_modules/.vite'),
    path.resolve(__dirname, '../../.vite'),
  ];
  for (const cacheDir of possibleViteCaches) {
    if (fs.existsSync(cacheDir)) {
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log(`[PEPTECH] Purged Vite cache: ${cacheDir}`);
      } catch (err) {
        console.warn(`[PEPTECH] Could not purge Vite cache ${cacheDir}:`, err.message);
      }
    }
  }

  console.log('[PEPTECH] Dashboard sync completed successfully.');
}


