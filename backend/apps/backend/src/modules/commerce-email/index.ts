import {ModuleProvider,Modules} from "@medusajs/framework/utils"
import CommerceEmail from "./service"
export default ModuleProvider(Modules.NOTIFICATION,{services:[CommerceEmail]})
