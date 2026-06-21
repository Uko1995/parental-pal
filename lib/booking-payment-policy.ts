export type BookingServiceType =
  | "childcare"
  | "tutoring"
  | "homeschooling"
  | "holiday-camps"
  | "space-rental"
  | "kiddies-enrichment";

const ALL_SERVICES: BookingServiceType[] = [
  "childcare",
  "tutoring",
  "homeschooling",
  "holiday-camps",
  "space-rental",
  "kiddies-enrichment",
];

export const MAX_BILLING_PERIOD_MONTHS = 6;

export function isBookingServiceType(value: string): value is BookingServiceType {
  return ALL_SERVICES.includes(value as BookingServiceType);
}

/** All services use pay-later at checkout (confirmed + payment pending). */
export function requiresImmediatePayment(_serviceType?: string): boolean {
  return false;
}

export function getSubmitButtonLabel(
  totalAmount: number,
  billingPeriodMonths = 1,
): string {
  if (totalAmount <= 0) {
    return "Confirm Booking — Pay Later";
  }
  const period =
    billingPeriodMonths > 1 ? ` for ${billingPeriodMonths} months` : "";
  return `Confirm Booking — ₦${totalAmount.toLocaleString()} due${period}`;
}

export function clampBillingPeriodMonths(months: number): number {
  if (!Number.isFinite(months) || months < 1) return 1;
  return Math.min(Math.floor(months), MAX_BILLING_PERIOD_MONTHS);
}

export function supportsBillingPeriodMonths(
  serviceType: string,
): boolean {
  return [
    "tutoring",
    "childcare",
    "kiddies-enrichment",
  ].includes(serviceType);
}

export function usesMultiTermBooking(serviceType: string): boolean {
  return serviceType === "homeschooling";
}
