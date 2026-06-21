import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";
import {
  type ServicePricingMap,
  type ServiceUnitPriceOptions,
  getServiceUnitPrice,
  getTutoringHourlyRate,
} from "@/lib/service-pricing";
import { SUMMER_CAMP_RATES } from "@/lib/camp-seasons";

export function computeLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function parseHoursFromDescription(description: string): number | undefined {
  const match = description.match(/\((\d+(?:\.\d+)?)\s*h\)/i);
  if (!match) return undefined;
  const hours = Number(match[1]);
  return Number.isFinite(hours) && hours > 0 ? hours : undefined;
}

export function resolveLineUnitPrice(
  pricing: ServicePricingMap,
  serviceType: string,
  options?: ServiceUnitPriceOptions,
): number {
  return getServiceUnitPrice(pricing, serviceType, options);
}

export function applyServiceDefaultsToLine(
  line: ParentInvoiceLineItem,
  pricing: ServicePricingMap,
  options?: ServiceUnitPriceOptions,
): ParentInvoiceLineItem {
  const tutoringLocation =
    options?.tutoringLocation ??
    (line.tutoringLocation as "virtual" | "physical" | undefined);

  const unitPrice = resolveLineUnitPrice(pricing, line.serviceType, {
    tutoringLocation,
    bookingHourlyRate: options?.bookingHourlyRate,
  });

  const parsedHours = parseHoursFromDescription(line.description);
  const useParsedHours =
    line.sessionKind !== "past" &&
    (line.serviceType === "tutoring" ||
      line.serviceType === "kiddies-enrichment");
  const quantity = useParsedHours
    ? parsedHours ?? line.quantity
    : line.quantity;

  return {
    ...line,
    tutoringLocation: line.serviceType === "tutoring" ? tutoringLocation : undefined,
    quantity: quantity > 0 ? quantity : 1,
    unitPrice,
    total: computeLineTotal(quantity > 0 ? quantity : 1, unitPrice),
  };
}

export function countHolidayCampWeeks(lineItems: ParentInvoiceLineItem[]): number {
  return lineItems
    .filter((line) => line.serviceType === "holiday-camps" && line.unitPrice >= 0)
    .reduce((sum, line) => sum + line.quantity, 0);
}

export function suggestSummerCampDiscountLine(
  lineItems: ParentInvoiceLineItem[],
): ParentInvoiceLineItem | null {
  const campLines = lineItems.filter(
    (line) =>
      line.serviceType === "holiday-camps" &&
      line.unitPrice >= 0 &&
      !line.description.toLowerCase().includes("discount"),
  );

  if (!campLines.length) return null;

  const qualifyingLines = campLines.filter(
    (line) => line.quantity >= SUMMER_CAMP_RATES.multiWeekDiscountMinWeeks,
  );

  if (!qualifyingLines.length) return null;

  const discountBase = qualifyingLines.reduce((sum, line) => sum + line.total, 0);
  const discountAmount = Math.round(
    (discountBase * SUMMER_CAMP_RATES.multiWeekDiscountPercent) / 100,
  );

  if (discountAmount <= 0) return null;

  const hasDiscountLine = lineItems.some(
    (line) =>
      line.unitPrice < 0 &&
      line.description.toLowerCase().includes("summer camp discount"),
  );
  if (hasDiscountLine) return null;

  return {
    date: campLines[0].date,
    childName: campLines[0].childName,
    serviceType: "holiday-camps",
    description: `Summer camp discount (${SUMMER_CAMP_RATES.multiWeekDiscountPercent}%)`,
    quantity: 1,
    unitPrice: -discountAmount,
    total: -discountAmount,
    sessionKind: "future",
  };
}

export function getTutoringRatesFromPricing(pricing: ServicePricingMap) {
  return {
    virtual: getTutoringHourlyRate(pricing, "virtual"),
    physical: getTutoringHourlyRate(pricing, "physical"),
  };
}

export interface BookingPricingContext {
  hourlyRate?: number;
  tutoringLocation?: "virtual" | "physical";
  virtualRate?: number;
  physicalRate?: number;
}

export function resolveBookingPricingContext(
  serviceData?: Record<string, unknown>,
): BookingPricingContext {
  if (!serviceData) return {};
  return {
    hourlyRate:
      typeof serviceData.hourlyRate === "number"
        ? serviceData.hourlyRate
        : undefined,
    tutoringLocation:
      serviceData.tutoringLocation === "virtual" ||
      serviceData.tutoringLocation === "physical"
        ? serviceData.tutoringLocation
        : undefined,
    virtualRate:
      typeof serviceData.virtualRate === "number"
        ? serviceData.virtualRate
        : undefined,
    physicalRate:
      typeof serviceData.physicalRate === "number"
        ? serviceData.physicalRate
        : undefined,
  };
}

export function getBookingHourlyRateForLocation(
  bookingCtx: BookingPricingContext,
  pricing: ServicePricingMap,
  location: "virtual" | "physical",
): number {
  if (bookingCtx.hourlyRate && bookingCtx.tutoringLocation === location) {
    return bookingCtx.hourlyRate;
  }
  if (location === "virtual" && bookingCtx.virtualRate) {
    return bookingCtx.virtualRate;
  }
  if (location === "physical" && bookingCtx.physicalRate) {
    return bookingCtx.physicalRate;
  }
  if (bookingCtx.hourlyRate) {
    return bookingCtx.hourlyRate;
  }
  return getServiceUnitPrice(pricing, "tutoring", { tutoringLocation: location });
}
