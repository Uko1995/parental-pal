import type { BookingInterface } from "@/models/Booking";
import {
  CHILDCARE_MONTHLY_WEEKDAYS,
  formatLocalDate,
  getWeekdayDatesInMonth,
} from "./booking-calendar";

function sortDates(dates: string[]): string[] {
  return [...new Set(dates.filter(Boolean))].sort();
}

function boundsFromDates(dates: string[]): {
  startDate?: string;
  endDate?: string;
} {
  const sorted = sortDates(dates);
  if (sorted.length === 0) return {};
  return {
    startDate: sorted[0],
    endDate: sorted[sorted.length - 1],
  };
}

export function getCampScheduleBounds(
  childrenCampData: Array<{
    campWeeks?: Array<{ startDate: string; endDate: string }>;
  }>,
): { startDate: string; endDate: string } | null {
  const allWeeks = childrenCampData.flatMap((child) => child.campWeeks ?? []);
  if (allWeeks.length === 0) return null;

  const starts = allWeeks.map((w) => w.startDate);
  const ends = allWeeks.map((w) => w.endDate);
  const sortedStarts = sortDates(starts);
  const sortedEnds = sortDates(ends);
  return {
    startDate: sortedStarts[0],
    endDate: sortedEnds[sortedEnds.length - 1],
  };
}

/** Earliest and latest actual service dates derived from session/camp/event data. */
export function resolveBookingScheduleDates(
  booking: Pick<BookingInterface, "serviceType" | "serviceData" | "schedule">,
): { startDate?: string; endDate?: string } {
  const sd = booking.serviceData || {};
  const formStart = booking.schedule?.startDate;
  const allDates: string[] = [];

  switch (booking.serviceType) {
    case "tutoring": {
      for (const child of (sd.childrenData as Array<{
        schedule?: Array<{ dates?: Array<{ date: string }> }>;
      }>) || []) {
        for (const block of child.schedule || []) {
          for (const session of block.dates || []) {
            if (session.date) allDates.push(session.date);
          }
        }
      }
      break;
    }

    case "childcare": {
      const startDate = formStart || formatLocalDate(new Date());

      for (const wd of booking.schedule?.weekdays || []) {
        for (const session of wd.dates || []) {
          if (session.date) allDates.push(session.date);
        }
      }

      if (allDates.length === 0) {
        const childrenData = (sd.childrenData as Array<{
          careType?: string;
          isMonthSelected?: boolean;
        }>) || [];
        const isMonthly = childrenData.some(
          (c) => c.careType === "monthly" || c.isMonthSelected,
        );
        const weekdayNames = isMonthly
          ? [...CHILDCARE_MONTHLY_WEEKDAYS]
          : (booking.schedule?.weekdays || []).map((w) => w.day);

        for (const weekday of weekdayNames) {
          allDates.push(...getWeekdayDatesInMonth(weekday, startDate));
        }
      }
      break;
    }

    case "holiday-camps": {
      for (const child of (sd.childrenData as Array<{
        campWeeks?: Array<{ startDate: string; endDate: string }>;
      }>) || []) {
        for (const week of child.campWeeks || []) {
          allDates.push(week.startDate, week.endDate);
        }
      }
      break;
    }

    case "space-rental": {
      if (sd.eventDate) allDates.push(String(sd.eventDate));
      break;
    }

    case "kiddies-enrichment": {
      for (const child of (sd.childrenData as Array<{ eventDate?: string }>) ||
        []) {
        if (child.eventDate) allDates.push(child.eventDate);
      }
      break;
    }

    default:
      break;
  }

  const fromSessions = boundsFromDates(allDates);
  if (fromSessions.startDate) return fromSessions;

  if (formStart) {
    return {
      startDate: formStart,
      endDate: booking.schedule?.endDate,
    };
  }

  return {};
}

export function resolveBookingSchedule(
  booking: Pick<BookingInterface, "serviceType" | "serviceData" | "schedule">,
): BookingInterface["schedule"] {
  const resolved = resolveBookingScheduleDates(booking);
  return {
    ...booking.schedule,
    startDate: resolved.startDate || booking.schedule?.startDate || "",
    endDate: resolved.endDate || booking.schedule?.endDate,
    isRecurring: booking.schedule?.isRecurring ?? false,
  };
}
