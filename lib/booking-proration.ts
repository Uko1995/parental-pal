import {
  addCalendarMonths,
  countChildcareMonthDays,
  formatLocalDate,
  getMonthBounds,
  getWeekdayDatesInMonth,
  parseDateString,
} from "@/lib/booking-calendar";
import { clampBillingPeriodMonths } from "@/lib/booking-payment-policy";

export function getBillingPeriodEnd(
  startDate: string,
  months: number,
): string {
  const clamped = clampBillingPeriodMonths(months);
  if (clamped <= 1) {
    return getMonthBounds(startDate).last;
  }
  const periodStart = parseDateString(startDate);
  const endMonthDate = addCalendarMonths(
    formatLocalDate(new Date(periodStart.getFullYear(), periodStart.getMonth(), 1)),
    clamped - 1,
  );
  return getMonthBounds(endMonthDate).last;
}

/** All weekday occurrences from startDate through billing period end (inclusive). */
export function getWeekdayDatesInRange(
  weekday: string,
  startDate: string,
  endDate: string,
): string[] {
  const dates: string[] = [];
  const end = parseDateString(endDate);
  let cursor = parseDateString(startDate);
  const startMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);

  while (cursor <= end) {
    const monthStart =
      cursor.getMonth() === startMonth.getMonth() &&
      cursor.getFullYear() === startMonth.getFullYear()
        ? startDate
        : formatLocalDate(new Date(cursor.getFullYear(), cursor.getMonth(), 1));

    const monthDates = getWeekdayDatesInMonth(weekday, monthStart);
    for (const date of monthDates) {
      if (date >= startDate && date <= endDate) {
        dates.push(date);
      }
    }

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    if (cursor > end) break;
  }

  return [...new Set(dates)].sort();
}

export function countChildcareDaysInBillingPeriod(
  startDate: string,
  months: number,
): number {
  const clamped = clampBillingPeriodMonths(months);
  let total = 0;
  let monthCursor = startDate;

  for (let i = 0; i < clamped; i++) {
    const monthStart =
      i === 0
        ? monthCursor
        : formatLocalDate(
            new Date(
              parseDateString(startDate).getFullYear(),
              parseDateString(startDate).getMonth() + i,
              1,
            ),
          );
    const daysInMonth = countChildcareMonthDays(monthStart);
    if (i === 0) {
      const { first, last } = getMonthBounds(startDate);
      const allDays = getWeekdayDatesInRange("monday", first, last);
      const effectiveStart = startDate > first ? startDate : first;
      const proratedFirst = allDays.filter((d) => d >= effectiveStart).length;
      const ratio = daysInMonth > 0 ? proratedFirst / daysInMonth : 1;
      total += Math.round(daysInMonth * ratio);
    } else {
      total += daysInMonth;
    }
    monthCursor = addCalendarMonths(monthStart, 1);
  }

  return total;
}

export function prorateMonthlyChildcareTotal(
  monthlyRate: number,
  startDate: string,
  months: number,
): number {
  const clamped = clampBillingPeriodMonths(months);
  if (clamped <= 1) {
    const fullMonthDays = countChildcareMonthDays(startDate);
    const { first, last } = getMonthBounds(startDate);
    const effectiveDays = getWeekdayDatesInRange("monday", startDate, last)
      .length;
    if (fullMonthDays <= 0) return monthlyRate;
    return Math.round((monthlyRate * effectiveDays) / fullMonthDays);
  }

  let total = 0;
  for (let i = 0; i < clamped; i++) {
    const monthAnchor = addCalendarMonths(startDate, i);
    const monthRate = monthlyRate;
    if (i === 0) {
      const fullMonthDays = countChildcareMonthDays(startDate);
      const { last } = getMonthBounds(startDate);
      const weekdays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      let effectiveDays = 0;
      for (const wd of weekdays) {
        effectiveDays += getWeekdayDatesInRange(wd, startDate, last).length;
      }
      total += Math.round(
        (monthRate * effectiveDays) / Math.max(fullMonthDays, 1),
      );
    } else {
      total += monthRate;
    }
  }
  return total;
}
