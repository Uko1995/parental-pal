export interface ServicePricingEntry {
  baseRate: number;
  currency: string;
  billingType: string;
  virtualRate?: number;
  physicalRate?: number;
}

export type ServicePricingMap = Record<string, ServicePricingEntry>;

export const TUTORING_VIRTUAL_FALLBACK = 13000;
export const TUTORING_PHYSICAL_FALLBACK = 15000;

type ServiceDoc = {
  type: string;
  pricing?: {
    baseRate?: number;
    currency?: string;
    billingType?: string;
    locationRates?: { virtual?: number; physical?: number };
  };
};

export function buildServicePricingMap(
  services: ServiceDoc[],
): ServicePricingMap {
  const pricingMap: ServicePricingMap = {};

  for (const service of services) {
    if (!service.pricing) continue;

    pricingMap[service.type] = {
      baseRate: service.pricing.baseRate ?? 0,
      currency: service.pricing.currency ?? "NGN",
      billingType: service.pricing.billingType ?? "hourly",
    };

    if (service.type === "tutoring" && service.pricing.locationRates) {
      pricingMap[service.type].virtualRate =
        service.pricing.locationRates.virtual ?? TUTORING_VIRTUAL_FALLBACK;
      pricingMap[service.type].physicalRate =
        service.pricing.locationRates.physical ?? TUTORING_PHYSICAL_FALLBACK;
    }
  }

  if (!pricingMap.tutoring) {
    pricingMap.tutoring = {
      baseRate: TUTORING_PHYSICAL_FALLBACK,
      currency: "NGN",
      billingType: "hourly",
      virtualRate: TUTORING_VIRTUAL_FALLBACK,
      physicalRate: TUTORING_PHYSICAL_FALLBACK,
    };
  } else {
    pricingMap.tutoring.virtualRate =
      pricingMap.tutoring.virtualRate ?? TUTORING_VIRTUAL_FALLBACK;
    pricingMap.tutoring.physicalRate =
      pricingMap.tutoring.physicalRate ?? TUTORING_PHYSICAL_FALLBACK;
  }

  return pricingMap;
}

export function getTutoringHourlyRate(
  pricing: ServicePricingMap,
  location: "virtual" | "physical",
): number {
  const entry = pricing.tutoring;
  if (!entry) {
    return location === "virtual"
      ? TUTORING_VIRTUAL_FALLBACK
      : TUTORING_PHYSICAL_FALLBACK;
  }
  return location === "virtual"
    ? (entry.virtualRate ?? TUTORING_VIRTUAL_FALLBACK)
    : (entry.physicalRate ?? TUTORING_PHYSICAL_FALLBACK);
}

export interface ServiceUnitPriceOptions {
  tutoringLocation?: "virtual" | "physical";
  bookingHourlyRate?: number;
}

export function getServiceUnitPrice(
  pricing: ServicePricingMap,
  serviceType: string,
  options?: ServiceUnitPriceOptions,
): number {
  if (options?.bookingHourlyRate && options.bookingHourlyRate > 0) {
    return options.bookingHourlyRate;
  }

  if (serviceType === "tutoring") {
    return getTutoringHourlyRate(
      pricing,
      options?.tutoringLocation ?? "physical",
    );
  }

  const entry = pricing[serviceType];
  return entry?.baseRate ?? 0;
}
