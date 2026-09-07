import { getDb } from "@/lib/mongodb";
import {
  buildServicePricingMap,
  type ServiceDoc,
  type ServicePricingMap,
} from "@/lib/service-pricing";

export async function fetchServicePricingMap(): Promise<ServicePricingMap> {
  const db = await getDb();
  const services = await db
    .collection("services")
    .find({ status: "active" }, { projection: { type: 1, pricing: 1 } })
    .toArray();

  return buildServicePricingMap(services as unknown as ServiceDoc[]);
}
