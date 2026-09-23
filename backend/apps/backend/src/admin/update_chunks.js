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
  // 1. Update Order Detail
  const detailPath = path.resolve(__dirname, 'ShopifyOrderDetail.jsx');
  if (fs.existsSync(detailPath)) {
    const detailSource = fs.readFileSync(detailPath, 'utf8');
    const exportSuffix = `
const OrderDetailBreadcrumb = () => "Order";
const orderLoader = async () => null;
const seo = () => ({ title: "Order - PEPTECH" });

export {
  OrderDetail as Component,
  OrderDetailBreadcrumb as Breadcrumb,
  orderLoader as loader,
  seo
};
`;
    const updatedDetail = detailSource.replace('export { OrderDetail as Component };', exportSuffix);
    const targetDetailFile = path.resolve(distDir, 'order-detail-D5MN4DFC.mjs');
    fs.writeFileSync(targetDetailFile, updatedDetail, 'utf8');
    console.log('[PEPTECH] Successfully updated order-detail-D5MN4DFC.mjs');
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
