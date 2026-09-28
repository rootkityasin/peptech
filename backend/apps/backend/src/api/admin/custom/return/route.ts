import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {Modules} from "@medusajs/framework/utils"
import {operator,endpoint} from "../../../../lib/commerce/http"
export async function GET(req:AuthenticatedMedusaRequest,res:MedusaResponse){
 return endpoint(res,async()=>{operator(req);return {return_reasons:await req.scope.resolve(Modules.ORDER).listReturnReasons({})}})
}
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse){
 return endpoint(res,async()=>{operator(req);const error:any=new Error("Use the native Medusa return workflow. Receiving goods does not issue a refund; use Payments and billing for an audited Stripe refund.");error.status=410;throw error})
}
