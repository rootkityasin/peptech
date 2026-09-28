import { ModuleProvider,Modules } from "@medusajs/framework/utils"
import StripeCheckoutProvider from "./service"
export default ModuleProvider(Modules.PAYMENT,{services:[StripeCheckoutProvider]})
