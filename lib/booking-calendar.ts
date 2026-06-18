const DAY_MAP: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

/** Parse YYYY-MM-DD as a local calendar date (no UTC shift). */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as YYYY-MM-DD in local timezone. */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthBounds(startDate: string): {
  first: string;
  last: string;
} {
  const start = parseDateString(startDate);
  const first = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { first: formatLocalDate(first), last: formatLocalDate(last) };
}

/** All occurrences of a weekday within the month of startDate, on or after startDate. */
export function getWeekdayDatesInMonth(
  weekday: string,
  startDate: string,
): string[] {
  const targetDay = DAY_MAP[weekday.toLowerCase()];
  if (targetDay === undefined) return [];

  const start = parseDateString(startDate);
  const dates: string[] = [];

  const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
  const daysUntilTarget = (targetDay - firstDay.getDay() + 7) % 7;
  const firstOccurrence = new Date(
    start.getFullYear(),
    start.getMonth(),
    1 + daysUntilTarget,
  );

  const currentDate = new Date(firstOccurrence);
  while (currentDate < start) {
    currentDate.setDate(currentDate.getDate() + 7);
  }

  while (currentDate.getMonth() === start.getMonth()) {
    dates.push(formatLocalDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

/** Sum session days for selected weekdays in the billing month. */
export function countWeekdaysInMonth(
  startDate: string,
  weekdays: string[],
): number {
  const unique = [...new Set(weekdays.map((w) => w.toLowerCase()))];
  return unique.reduce(
    (sum, wd) => sum + getWeekdayDatesInMonth(wd, startDate).length,
    0,
  );
}

/** Default Mon–Sat operating days for monthly childcare billing. */
export const CHILDCARE_MONTHLY_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function countChildcareMonthDays(startDate: string): number {
  return countWeekdaysInMonth(startDate, [...CHILDCARE_MONTHLY_WEEKDAYS]);
}

/**
 * Move to the same day-of-month in the target month; snap to month end if needed.
 * Never overflows into a third month (e.g. Jan 31 → Feb 28, not Mar 3).
 */
export function addCalendarMonths(dateStr: string, months: number): string {
  const d = parseDateString(dateStr);
  const targetMonth = d.getMonth() + months;
  const year = d.getFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(d.getDate(), lastDay);
  return formatLocalDate(new Date(year, month, day));
}

export function inclusiveDayCount(start: string, end: string): number {
  const s = parseDateString(start);
  const e = parseDateString(end);
  return Math.round((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/** Shift an inclusive date range by N months, preserving day span. */
export function shiftDateRangeByMonths(
  start: string,
  end: string,
  months: number,
): { startDate: string; endDate: string } {
  const span = inclusiveDayCount(start, end);
  const startDate = addCalendarMonths(start, months);
  const endDate = addDays(startDate, span - 1);
  return { startDate, endDate };
}

export function getTargetMonthStart(now: Date = new Date()): string {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return formatLocalDate(next);
}

export function getTargetMonthLabel(targetMonthStart: string): string {
  const d = parseDateString(targetMonthStart);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}
