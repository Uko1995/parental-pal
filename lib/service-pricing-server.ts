import { getDb } from "@/lib/mongodb";
import {
  buildServicePricingMap,
  type ServicePricingMap,
} from "@/lib/service-pricing";

type ServiceDoc = {
  type: string;
  pricing?: {
    baseRate?: number;
    currency?: string;
    billingType?: string;
    locationRates?: { virtual?: number; physical?: number };
  };
};

export async function fetchServicePricingMap(): Promise<ServicePricingMap> {
  const db = await getDb();
  const services = await db
    .collection("services")
    .find({ status: "active" }, { projection: { type: 1, pricing: 1 } })
    .toArray();

  return buildServicePricingMap(services as unknown as ServiceDoc[]);
}
