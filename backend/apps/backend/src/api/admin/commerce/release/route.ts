import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {Modules} from "@medusajs/framework/utils"
import {z} from "zod"
import {operator,commerce,endpoint} from "../../../../lib/commerce/http"
import {fail,assertEligibility,assertProduct} from "../../../../lib/commerce/policy"
import {recordId} from "../../../../modules/peptech-commerce/service"
const schema=z.object({order_id:z.string(),allocations:z.array(z.object({line_id:z.string(),quantity:z.number().int().positive(),
  batch_id:z.string().min(1),coa_reference:z.string().min(1)}).strict()).min(1)}).strict()
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    const admin=operator(req),input=schema.parse(req.body),ledger=commerce(req)
    return ledger.locked(`fulfillment:${input.order_id}`,async()=>{
      const orders=req.scope.resolve(Modules.ORDER)
      const order=await orders.retrieveOrder(input.order_id,{relations:["items"]})
      const receipt=await ledger.get(String(order.metadata?.peptech_receipt_id))
      if(receipt?.state!=="confirmed"||order.metadata?.refund_review)fail("Payment requires review before dispatch",409)
      assertEligibility(await req.scope.resolve(Modules.CUSTOMER).retrieveCustomer(receipt.owner_id!))
      for(const line of receipt.data.quote.lines)assertProduct(await ledger.get(recordId("catalog",line.variant_id)),receipt.data.quote.address.country_code,line.recurring)
      for(const item of order.items||[]) {
        const total=input.allocations.filter(a=>a.line_id===item.id).reduce((sum,a)=>sum+a.quantity,0)
        if(total!==Number(item.quantity))fail("Batch allocation must cover every order line exactly")
      }
      if(input.allocations.some(a=>!order.items?.some(i=>i.id===a.line_id)))fail("Unknown order line")
      const mapping=await ledger.create({id:recordId("shipment",order.id),kind:"shipment",profile:receipt.profile,
        owner_id:receipt.owner_id,state:"released",data:{order_id:order.id,allocations:input.allocations,reviewer:admin}})
      await ledger.audit(mapping.id,admin,"release-for-packing",{allocations:input.allocations})
      await orders.updateOrders(order.id,{metadata:{...order.metadata,fulfillment_hold:false,batch_allocation_ref:mapping.id}})
      return {released:true,shipment:mapping.id}
    })
  })
}
