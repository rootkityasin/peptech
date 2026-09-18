import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function test({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  logger.info("Fulfillment methods: " + Object.getOwnPropertyNames(Object.getPrototypeOf(fulfillmentModule)).slice(0, 15).join(", "));
}
