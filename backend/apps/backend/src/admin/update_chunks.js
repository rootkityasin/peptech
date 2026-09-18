const fs = require('fs');

const detailSource = fs.readFileSync('C:/Users/Rootkit/Desktop/project/peptech/backend/apps/backend/src/admin/ShopifyOrderDetail.jsx', 'utf8');

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

fs.writeFileSync('C:/Users/Rootkit/Desktop/project/peptech/backend/node_modules/@medusajs/dashboard/dist/order-detail-D5MN4DFC.mjs', updatedDetail, 'utf8');
console.log('Successfully updated order-detail-D5MN4DFC.mjs');
