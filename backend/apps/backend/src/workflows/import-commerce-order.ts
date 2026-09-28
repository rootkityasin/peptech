import { createWorkflow,WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createOrdersStep } from "@medusajs/medusa/core-flows"
// Input is the immutable server quote. Native order records and reservations keep
// the existing Medusa fulfillment and returns workflows usable.
export const importCommerceOrder=createWorkflow({name:"peptech-import-commerce-order",store:true,retentionTime:60*60*24*365},
  (input:any)=>{const orders=createOrdersStep([input]);return new WorkflowResponse(orders)})
