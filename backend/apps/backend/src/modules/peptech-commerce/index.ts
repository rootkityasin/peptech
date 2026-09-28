import { Module } from "@medusajs/framework/utils"
import CommerceService from "./service"
export const COMMERCE_MODULE = "peptechCommerce"
export default Module(COMMERCE_MODULE, { service: CommerceService })
