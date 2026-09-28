import { fail } from "./policy"
import type { Quote } from "./quote"

// Use the immutable Checkout session, never the customer's subsequently edited profile.
export function checkoutDelivery(session:any, quote:Quote):Quote {
  if(!["hosted","hosted_page"].includes(session.ui_mode) || session.status!=="complete") return quote
  const shipping=session.collected_information?.shipping_details || session.shipping_details
  const contact=session.customer_details
  function address(details:any) {
    const a=details?.address
    if(!details?.name?.trim() || !a?.line1 || !a?.city || !a?.country) fail("Checkout delivery details are incomplete",409)
    const [first_name,...rest]=details.name.trim().split(/\s+/)
    return {first_name,last_name:rest.join(" "),address_1:a.line1,address_2:a.line2||"",city:a.city,
      postal_code:a.postal_code||"",country_code:a.country.toLowerCase(),province:a.state||"",phone:contact?.phone||""}
  }
  const delivery=address(shipping)
  if(delivery.country_code!==quote.address.country_code) fail("Checkout delivery destination changed",409)
  return {...quote,address:delivery,billing_address:address(contact),delivery_collected:true}
}
