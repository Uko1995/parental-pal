import { getCampSeason, type CampSeasonId } from "@/lib/camp-seasons";
import { HOMESCHOOL_PROGRAM_NAME } from "@/lib/homeschool-program";
import { ServiceInterface } from "@/models/Service";

export const PUBLIC_SERVICE_TYPES = [
  "childcare",
  "tutoring",
  "homeschooling",
  "holiday-camps",
  "space-rental",
  "kiddies-enrichment",
] as const;

export type PublicServiceType = (typeof PUBLIC_SERVICE_TYPES)[number];

export function isPublicServiceType(
  value: string,
): value is PublicServiceType {
  return (PUBLIC_SERVICE_TYPES as readonly string[]).includes(value);
}

export function getPublicServicePath(type: string): string {
  return `/services/${type}`;
}

export function getPublicServiceRevalidatePaths(type?: string): string[] {
  if (type && isPublicServiceType(type)) {
    return ["/services", getPublicServicePath(type)];
  }
  return ["/services", ...PUBLIC_SERVICE_TYPES.map(getPublicServicePath)];
}

/** Canonical public URL. Holiday camps use the active promo landing when provided. */
export function getPublicServiceHref(
  service: { type: string },
  promoSeasonId?: CampSeasonId | null,
): string {
  if (service.type === "holiday-camps" && promoSeasonId) {
    return getCampSeason(promoSeasonId).landingPath;
  }
  return getPublicServicePath(service.type);
}

export function formatCurrency(
  amount: number,
  currency: string = "NGN",
): string {
  const currencySymbol = currency === "NGN" ? "₦" : "$";
  const formattedAmount = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${currencySymbol}${formattedAmount}`;
}

export function formatPricing(service: {
  type: string;
  name?: string | null;
  pricing: {
    baseRate: string | number;
    currency: string;
    billingType: string;
  };
}): string {
  const { baseRate, currency, billingType } = service.pricing;
  const currencySymbol = currency === "NGN" ? "₦" : "$";
  const isEduvantaTutoring =
    service.type === "tutoring" && isEduvantaService(service);
  const isJunePromoWindow = new Date().getMonth() === 5;
  const effectiveRate =
    isEduvantaTutoring && isJunePromoWindow ? 11000 : Number(baseRate);
  const billingSuffix = formatBillingSuffix(billingType);
  const formattedRate = effectiveRate.toLocaleString("en-US");
  return `${currencySymbol}${formattedRate}${billingSuffix}`;
}

export function getPackageDisplayPrice(
  service: { type: string; pricing: { baseRate: string | number } },
  pkg: { discountPercentage: number },
): number {
  const basePrice = Number(service.pricing.baseRate) || 0;
  if (service.type === "childcare") {
    return basePrice * 26 * (1 - pkg.discountPercentage / 100);
  }
  if (service.type === "space-rental") {
    return basePrice * 2 * (1 - pkg.discountPercentage / 100);
  }
  return basePrice;
}

export function formatAvailability(
  availability: string | string[] | undefined | null,
): string {
  if (!availability) return "";
  if (Array.isArray(availability)) return availability.filter(Boolean).join(", ");
  return String(availability);
}

// Normalize values that may have been saved incorrectly (e.g., "hourly" instead of "hour").
// This ensures the frontend uses consistent billing types even if the DB contains legacy values.

const billingTypeMap: Record<
  string,
  ServiceInterface["pricing"]["billingType"]
> = {
  hourly: "hour",
  daily: "day",
  weekly: "week",
  monthly: "month",
  "per-event": "event",
  term: "term",
  session: "session",
  event: "event",
  custom: "custom",
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

export function normalizeBillingType(
  raw?: string | null,
): ServiceInterface["pricing"]["billingType"] {
  if (!raw) return "custom";
  const key = raw.toString().trim().toLowerCase();
  return billingTypeMap[key] || "custom";
}

export function formatBillingTypeLabel(raw?: string | null): string {
  const normalized = normalizeBillingType(raw);
  switch (normalized) {
    case "hour":
      return "per hour";
    case "day":
      return "per day";
    case "week":
      return "per week";
    case "month":
      return "per month";
    case "term":
      return "per term";
    case "session":
      return "per session";
    case "event":
      return "per event";
    case "custom":
    default:
      return "";
  }
}

export function formatBillingSuffix(raw?: string | null): string {
  const label = formatBillingTypeLabel(raw);
  return label ? `/${label.replace(/^per\s+/i, "")}` : "";
}

/**
 * Legacy homeschooling services were named generically. Until an admin renames
 * the record, show the explicit programme name so parents know what is offered.
 */
const LEGACY_HOMESCHOOL_NAMES = new Set([
  "homeschooling",
  "homeschooling support",
  "homeschooling program",
  "homeschooling programme",
  "homeschooling services",
]);

export function getServiceDisplayName(service: {
  type: string;
  name?: string | null;
}): string {
  const name = (service.name || "").trim();

  if (
    service.type === "homeschooling" &&
    (!name || LEGACY_HOMESCHOOL_NAMES.has(name.toLowerCase()))
  ) {
    return HOMESCHOOL_PROGRAM_NAME;
  }

  return name;
}

export const EDUVANTA_SERVICE_NAME = "Eduvanta Tutoring and Prep";

export function isEduvantaService(service: { name?: string | null }): boolean {
  return (
    (service.name || "").trim().toLowerCase() ===
    EDUVANTA_SERVICE_NAME.toLowerCase()
  );
}

/** Stable sort: Eduvanta first, preserve relative order of other services. */
export function sortServicesWithEduvantaFirst<T extends { name?: string | null }>(
  services: T[],
): T[] {
  const eduvanta: T[] = [];
  const others: T[] = [];

  for (const service of services) {
    if (isEduvantaService(service)) {
      eduvanta.push(service);
    } else {
      others.push(service);
    }
  }

  return [...eduvanta, ...others];
}
