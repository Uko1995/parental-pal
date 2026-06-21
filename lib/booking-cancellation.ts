import type { BookingInterface } from "@/models/Booking";
import { formatLocalDate } from "@/lib/booking-calendar";
import { resolveBookingScheduleDates } from "@/lib/booking-schedule";

type BookingScheduleInput = {
  status: string;
  serviceType: string;
  serviceData?: BookingInterface["serviceData"];
  schedule?: {
    startDate?: string;
    endDate?: string;
    weekdays?: Array<{
      day: string;
      hours: number;
      startTime?: string;
      endTime?: string;
      dates?: Array<{ date: string; startTime: string; endTime?: string }>;
    }>;
  };
};

type BookingScheduleResolveInput = Pick<
  BookingInterface,
  "serviceType" | "serviceData" | "schedule"
>;

function asScheduleResolveInput(
  booking: BookingScheduleInput | BookingScheduleResolveInput,
): BookingScheduleResolveInput {
  return booking as BookingScheduleResolveInput;
}

const NON_CANCELLABLE_STATUSES = new Set([
  "cancelled",
  "completed",
  "in-progress",
]);

const PARENT_CANCELLABLE_STATUSES = new Set([
  "pending",
  "confirmed",
  "on-hold",
]);

/** Earliest calendar date for any booked session. */
export function getBookingEarliestSessionDate(
  booking: BookingScheduleInput | BookingScheduleResolveInput,
): string | undefined {
  return resolveBookingScheduleDates(asScheduleResolveInput(booking)).startDate;
}

/** True once the first session date is before today (local calendar). */
export function haveBookingSessionsStarted(
  booking: BookingScheduleInput | BookingScheduleResolveInput,
  now: Date = new Date(),
): boolean {
  const earliest = getBookingEarliestSessionDate(booking);
  if (!earliest) return false;
  return earliest < formatLocalDate(now);
}

export function canParentCancelBooking(booking: BookingScheduleInput): boolean {
  if (NON_CANCELLABLE_STATUSES.has(booking.status)) return false;
  if (!PARENT_CANCELLABLE_STATUSES.has(booking.status)) return false;
  return !haveBookingSessionsStarted(booking);
}

export function getParentCancelBlockReason(
  booking: BookingScheduleInput,
): string | null {
  if (booking.status === "cancelled") {
    return "This booking is already cancelled.";
  }
  if (booking.status === "completed") {
    return "Completed bookings cannot be cancelled.";
  }
  if (booking.status === "in-progress") {
    return "This booking is already in progress.";
  }
  if (!PARENT_CANCELLABLE_STATUSES.has(booking.status)) {
    return "This booking cannot be cancelled.";
  }
  if (haveBookingSessionsStarted(booking)) {
    return "Sessions have already started, so this booking can no longer be cancelled.";
  }
  return null;
}
