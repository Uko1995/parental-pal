import type { BookingInterface } from "@/models/Booking";
import { resolveBookingScheduleDates } from "@/lib/booking-schedule";
import { addDays } from "@/lib/booking-calendar";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";

export const PAYMENT_DUE_DAYS_BEFORE_LAST_SESSION = 5;

export function getLastSessionDateFromBooking(
  booking: Pick<BookingInterface, "serviceType" | "serviceData" | "schedule">,
): string | undefined {
  const resolved = resolveBookingScheduleDates(booking);
  return resolved.endDate || resolved.startDate;
}

export function computePaymentDueDate(lastSessionDate?: string): string | undefined {
  if (!lastSessionDate) return undefined;
  return addDays(lastSessionDate, -PAYMENT_DUE_DAYS_BEFORE_LAST_SESSION);
}

export function computeBookingPaymentDueDate(
  booking: Pick<BookingInterface, "serviceType" | "serviceData" | "schedule">,
): string | undefined {
  const lastSession = getLastSessionDateFromBooking(booking);
  return computePaymentDueDate(lastSession);
}

export function computeInvoicePaymentDueDate(
  lineItems: Pick<ParentInvoiceLineItem, "date">[],
): string | undefined {
  if (!lineItems.length) return undefined;
  const sorted = [...lineItems]
    .map((item) => item.date)
    .filter(Boolean)
    .sort();
  const latest = sorted[sorted.length - 1];
  return computePaymentDueDate(latest);
}

export function isPaymentOverdue(
  paymentDueDate?: string,
  paymentStatus?: string,
): boolean {
  if (!paymentDueDate || paymentStatus === "paid") return false;
  const due = new Date(paymentDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return today > due;
}

export function formatPaymentDueDateLine(paymentDueDate?: string): string {
  if (!paymentDueDate) return "Pay on or before your last session";
  const due = new Date(paymentDueDate);
  return `Pay on or before ${due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function formatPaymentDueLabel(paymentDueDate?: string): string {
  const dateLine = formatPaymentDueDateLine(paymentDueDate);
  if (!paymentDueDate) return dateLine;
  return `${dateLine} (5 days before last session)`;
}

export function formatPaymentDueToastMessage(
  paymentDueDate?: string,
  prefix = "Booking confirmed",
): string {
  if (!paymentDueDate) {
    return `${prefix}. Pay on or before your due date from Profile → Payments.`;
  }
  return `${prefix}. Pay on or before ${new Date(paymentDueDate).toLocaleDateString()} from Profile → Payments.`;
}
