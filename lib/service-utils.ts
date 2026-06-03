import { ServiceInterface } from "@/models/Service";

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
