import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { operator, commerce, endpoint } from "../../../lib/commerce/http"
import { recordId } from "../../../modules/peptech-commerce/service"
const review = z.object({ variant_id:z.string().min(1), state:z.enum(["approved","held"]),
  canonical_name:z.string().trim().min(1).max(200), canonical_sku:z.string().trim().min(1).max(100),
  format:z.enum(["pen","refill","vial"]), evidence_ref:z.string().trim().min(1).max(300),
  destinations:z.array(z.string().regex(/^[a-z]{2}$/)).min(1), version:z.string().min(1),
  tax_code:z.string().optional(), }).strict()
export async function GET(req: AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    operator(req)
    const allowed=["catalog","attempt","subscription","receipt","event","operation","shipment","reconciliation"]
    const kind=String(req.query.kind || "catalog")
    if (!allowed.includes(kind)) return {records:[]}
    return {records:await commerce(req).list(kind,{limit:100,offset:Number(req.query.offset)||0})}
  })
}
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    const admin=operator(req);const input=review.parse(req.body);const ledger=commerce(req)
    const id=recordId("catalog",input.variant_id)
    return ledger.locked(id,async()=>{
      const record=await ledger.create({id,kind:"catalog",profile:"catalog",owner_id:null,state:input.state,data:input})
      record.state=input.state;record.data={...input,reviewer:admin,reviewed_at:new Date().toISOString()}
      // Audit intent precedes the change; a failed mutation is safely repeatable.
      await ledger.audit(id,admin,"catalog-review",record.data)
      return {record:await ledger.save(record)}
    })
  })
}
