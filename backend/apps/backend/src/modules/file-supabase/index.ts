import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SupabaseFileService } from "./service"

export { SupabaseFileService }

export default ModuleProvider(Modules.FILE, {
  services: [SupabaseFileService],
})

