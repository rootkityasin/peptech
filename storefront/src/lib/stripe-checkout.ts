import type { CartItem } from "@/components/cart/CartContext"
import { getBackendUrl } from "./customer-api"
const publishableKey=process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY||""
export type CheckoutSession={attemptId:string;checkoutUrl?:string;clientSecret?:string;publishableKey?:string;state:string;orderId?:string;
  revision:string;taxStatus?:string;tax:number;taxInclusive:boolean;bankInstructions?:{account_name:string;sort_code:string;account_number:string};total:number;currency:string;renewalTotal:number;shipping:number;paymentMethod:string;reference:string;
  items:{name:string;quantity:number;recurring:boolean;unitPrice:number}[];subscriptionId?:string}
export type CheckoutAddress={first_name:string;last_name:string;address_1:string;address_2?:string;city:string;
  postal_code:string;country_code:string;province?:string;phone?:string}
export async function commerceRequest(path:string,token:string,body?:unknown,method="POST") {
  const response=await fetch(`${getBackendUrl()}${path}`,{method:body===undefined?"GET":method,
    headers:{"Content-Type":"application/json","x-publishable-api-key":publishableKey,Authorization:`Bearer ${token}`},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),cache:"no-store"})
  const data=await response.json()
  if(!response.ok) throw new Error(data.message||"The operation could not finish. Retry the same request.")
  return data
}
export async function prepareStripeCheckout(input:{items:CartItem[];address?:CheckoutAddress;countryCode?:string;email:string;token:string;
  ruoAccepted:boolean;recurringAccepted?:boolean;paymentMethod?:"stripe"}):Promise<CheckoutSession> {
  const items=await Promise.all(input.items.map(async item=>{
    let variantId=item.variantId
    if(!variantId) {
      const handle=item.productHandle||item.id.replace(/-(one-time|subscription)$/," ").trim()
      if(handle.includes("?")) throw new Error(`Please re-add ${item.title} from the current catalogue.`)
      const selector=handle.startsWith("prod_")?`id=${encodeURIComponent(handle)}`:`handle=${encodeURIComponent(handle)}`
      const result=await commerceRequest(`/store/products?${selector}&fields=*variants&limit=2`,input.token)
      if(result.products.length!==1 || result.products[0].variants?.length!==1) throw new Error(`${item.title} is no longer available in the connected catalogue. Remove it from your basket and choose a current product.`)
      variantId=result.products[0].variants[0].id
    }
    return {variant_id:variantId,quantity:item.quantity,recurring:item.isSubscription}
  }))
  const body={items,...(input.address?{address:input.address}:{}),country_code:input.countryCode||input.address?.country_code||"gb",ruo_accepted:input.ruoAccepted,recurring_accepted:input.recurringAccepted===true,
    payment_method:input.paymentMethod||"stripe"}
  const fingerprint=JSON.stringify({body,email:input.email})
  let saved:{fingerprint:string;revision:string}|null=null
  try {saved=JSON.parse(localStorage.getItem("peptech_checkout_revision")||"null")} catch {}
  const revision=saved?.fingerprint===fingerprint?saved.revision:crypto.randomUUID()
  localStorage.setItem("peptech_checkout_revision",JSON.stringify({fingerprint,revision}))
  let result:CheckoutSession
  try {result=await commerceRequest("/store/custom/checkout",input.token,{...body,revision})}
  catch(error){if(error instanceof Error&&error.message.startsWith("Checkout has expired"))localStorage.removeItem("peptech_checkout_revision");throw error}
  if(result.state==="expired"){localStorage.removeItem("peptech_checkout_revision");throw new Error("Checkout expired. Please continue again to create a new payment session.")}
  // No credentials or card data are persisted. The snapshot only scopes basket cleanup.
  sessionStorage.setItem(`peptech_checkout_cart:${result.attemptId}`,JSON.stringify(input.items))
  return result
}
export async function checkoutStatus(attemptId:string,token:string):Promise<CheckoutSession> {
  return commerceRequest(`/store/custom/checkout?attempt_id=${encodeURIComponent(attemptId)}`,token)
}
// Legacy native carts retain their original completion path while old payments drain.
export async function completeStripeCheckout(cartId:string,token:string) {
  const result=await commerceRequest(`/store/carts/${encodeURIComponent(cartId)}/complete`,token,{})
  if(result.type!=="order") throw new Error("Payment confirmation is pending. Do not start another payment.")
  return result.order
}
