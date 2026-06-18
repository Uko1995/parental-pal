import type { CampSeason, CampWeek } from "@/lib/camp-seasons";
import {
  formatLocalDate,
  inclusiveDayCount,
  parseDateString,
} from "@/lib/booking-calendar";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type CampWeekRuleSet = "easter" | "summer";

export interface CampWeekValidationRules {
  ruleSet: CampWeekRuleSet;
  weekNumber: number;
}

function getWeekdayName(dateStr: string): string {
  return DAY_NAMES[parseDateString(dateStr).getDay()];
}

function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = parseDateString(start);
  const endDate = parseDateString(end);
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(formatLocalDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatDateLabelFromIso(start: string, end: string): string {
  const startDate = parseDateString(start);
  const endDate = parseDateString(end);

  if (startDate.getMonth() === endDate.getMonth()) {
    const month = startDate.toLocaleDateString("en-US", { month: "long" });
    return `${month} ${startDate.getDate()} – ${month} ${endDate.getDate()}`;
  }

  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export function validateCampWeek(
  week: CampWeek,
  rules: CampWeekValidationRules,
): string[] {
  const errors: string[] = [];

  if (week.endDate < week.startDate) {
    errors.push(
      `Week ${week.weekNumber}: endDate ${week.endDate} is before startDate ${week.startDate}`,
    );
    return errors;
  }

  const span = inclusiveDayCount(week.startDate, week.endDate);
  const weekdays = enumerateDates(week.startDate, week.endDate).map(
    getWeekdayName,
  );

  if (rules.ruleSet === "summer") {
    if (span !== 5) {
      errors.push(`Summer week ${week.weekNumber}: expected 5 days, got ${span}`);
    }
    if (
      weekdays.some(
        (day) => day === "saturday" || day === "sunday",
      )
    ) {
      errors.push(
        `Summer week ${week.weekNumber}: must be Mon–Fri only (${weekdays.join(", ")})`,
      );
    }
    if (getWeekdayName(week.startDate) !== "monday") {
      errors.push(
        `Summer week ${week.weekNumber}: must start on Monday (starts ${getWeekdayName(week.startDate)})`,
      );
    }
  }

  if (rules.ruleSet === "easter") {
    if (rules.weekNumber === 1) {
      if (span !== 5) {
        errors.push(`Easter week 1: expected 5 days, got ${span}`);
      }
      if (getWeekdayName(week.startDate) !== "tuesday") {
        errors.push(
          `Easter week 1: must start Tuesday (starts ${getWeekdayName(week.startDate)})`,
        );
      }
      if (getWeekdayName(week.endDate) !== "saturday") {
        errors.push(
          `Easter week 1: must end Saturday (ends ${getWeekdayName(week.endDate)})`,
        );
      }
    } else {
      if (span !== 6) {
        errors.push(`Easter week ${rules.weekNumber}: expected 6 days, got ${span}`);
      }
      if (getWeekdayName(week.startDate) !== "monday") {
        errors.push(
          `Easter week ${rules.weekNumber}: must start Monday (starts ${getWeekdayName(week.startDate)})`,
        );
      }
      if (getWeekdayName(week.endDate) !== "saturday") {
        errors.push(
          `Easter week ${rules.weekNumber}: must end Saturday (ends ${getWeekdayName(week.endDate)})`,
        );
      }
    }
  }

  const expectedLabel = formatDateLabelFromIso(week.startDate, week.endDate);
  if (week.dateLabel !== expectedLabel) {
    errors.push(
      `Week ${week.weekNumber}: dateLabel "${week.dateLabel}" does not match dates (expected "${expectedLabel}")`,
    );
  }

  return errors;
}

export function assertSeasonBounds(season: CampSeason): string[] {
  const errors: string[] = [];
  const weeks = season.weeks;

  if (!weeks.length) {
    errors.push(`${season.id}: season has no weeks`);
    return errors;
  }

  if (season.startDate !== weeks[0].startDate) {
    errors.push(
      `${season.id}: season.startDate ${season.startDate} !== first week start ${weeks[0].startDate}`,
    );
  }

  const lastWeekEnd = weeks[weeks.length - 1].endDate;
  if (lastWeekEnd > season.endDate) {
    errors.push(
      `${season.id}: last week ends ${lastWeekEnd} after season.endDate ${season.endDate}`,
    );
  }

  for (let i = 1; i < weeks.length; i++) {
    const prev = weeks[i - 1];
    const curr = weeks[i];
    const prevEnd = parseDateString(prev.endDate);
    const currStart = parseDateString(curr.startDate);
    const gapDays = Math.round(
      (currStart.getTime() - prevEnd.getTime()) / (24 * 60 * 60 * 1000),
    );
    const prevEndDay = getWeekdayName(prev.endDate);
    const expectedGap = prevEndDay === "friday" ? 3 : prevEndDay === "saturday" ? 2 : null;
    if (expectedGap !== null && gapDays !== expectedGap) {
      errors.push(
        `${season.id}: gap between week ${prev.weekNumber} and ${curr.weekNumber} is ${gapDays} days (expected ${expectedGap})`,
      );
    }
  }

  return errors;
}

export function validateCampSeason(season: CampSeason): string[] {
  const ruleSet: CampWeekRuleSet = season.isSummer ? "summer" : "easter";
  const errors = assertSeasonBounds(season);

  season.weeks.forEach((week) => {
    errors.push(
      ...validateCampWeek(week, { ruleSet, weekNumber: week.weekNumber }),
    );
  });

  return errors;
}
