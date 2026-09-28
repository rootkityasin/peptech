import type {MedusaRequest,MedusaResponse,MedusaNextFunction} from "@medusajs/framework/http"
import {Modules} from "@medusajs/framework/utils"
export async function guardFulfillment(req:MedusaRequest,res:MedusaResponse,next:MedusaNextFunction) {
  try {
    const order=await req.scope.resolve(Modules.ORDER).retrieveOrder(req.params.id)
    if(order.metadata?.peptech_receipt_id && order.metadata?.fulfillment_hold!==false) {
      res.status(409).json({message:"This order requires verified payment and batch/COA release before fulfillment"});return
    }
    next()
  } catch {res.status(503).json({message:"Fulfillment eligibility could not be verified"})}
}
export async function guardNativeRefund(req:MedusaRequest,res:MedusaResponse,next:MedusaNextFunction) {
  try {
    const payment=await req.scope.resolve(Modules.PAYMENT).retrievePayment(req.params.id)
    if(payment.provider_id.startsWith("pp_peptech-checkout_")) {
      res.status(409).json({message:"Use the audited commerce refund action with an operation ID"});return
    }
    next()
  } catch {res.status(503).json({message:"Payment ownership could not be verified"})}
}
export function retiredPaymentCreation(_req:MedusaRequest,res:MedusaResponse) {
  res.status(410).json({message:"Start payment from the authenticated PEPTECH checkout"})
}
