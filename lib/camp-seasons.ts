export type CampSeasonId =
  | "alive-in-me-easter-2026"
  | "holidays-that-rock-2026";

export type CampLocation = "gbagada" | "lekki";

export interface CampWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  label: string;
  dateLabel: string;
}

export interface CampSeason {
  id: CampSeasonId;
  name: string;
  shortName: string;
  tagline?: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  registrationDeadline: string;
  showcaseDates?: string;
  weeks: CampWeek[];
  promoBannerStart: string;
  promoBannerEnd: string;
  landingPath: string;
  bookingQuery: string;
  enquiryPhone: string;
  isSummer: boolean;
}

const EASTER_WEEKS: CampWeek[] = [
  {
    weekNumber: 1,
    startDate: "2026-04-07",
    endDate: "2026-04-11",
    label: "Week 1",
    dateLabel: "April 7 – April 11",
  },
  {
    weekNumber: 2,
    startDate: "2026-04-13",
    endDate: "2026-04-18",
    label: "Week 2",
    dateLabel: "April 13 – April 18",
  },
  {
    weekNumber: 3,
    startDate: "2026-04-20",
    endDate: "2026-04-25",
    label: "Week 3",
    dateLabel: "April 20 – April 25",
  },
];

const SUMMER_WEEKS: CampWeek[] = [
  {
    weekNumber: 1,
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    label: "Week 1",
    dateLabel: "July 20 – July 24",
  },
  {
    weekNumber: 2,
    startDate: "2026-07-27",
    endDate: "2026-07-31",
    label: "Week 2",
    dateLabel: "July 27 – July 31",
  },
  {
    weekNumber: 3,
    startDate: "2026-08-03",
    endDate: "2026-08-07",
    label: "Week 3",
    dateLabel: "August 3 – August 7",
  },
  {
    weekNumber: 4,
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    label: "Week 4",
    dateLabel: "August 10 – August 14",
  },
  {
    weekNumber: 5,
    startDate: "2026-08-17",
    endDate: "2026-08-21",
    label: "Week 5",
    dateLabel: "August 17 – August 21",
  },
  {
    weekNumber: 6,
    startDate: "2026-08-24",
    endDate: "2026-08-28",
    label: "Week 6",
    dateLabel: "August 24 – August 28",
  },
];

export const CAMP_SEASONS: Record<CampSeasonId, CampSeason> = {
  "alive-in-me-easter-2026": {
    id: "alive-in-me-easter-2026",
    name: "Alive in Me Easter Camp",
    shortName: "Alive in Me",
    startDate: "2026-04-07",
    endDate: "2026-04-25",
    dateLabel: "April 7 – April 25, 2026",
    registrationDeadline: "2026-04-01",
    weeks: EASTER_WEEKS,
    promoBannerStart: "2026-01-01",
    promoBannerEnd: "2026-04-25",
    landingPath: "/booking?service=holiday-camps&camp=alive-in-me-easter-2026",
    bookingQuery: "camp=alive-in-me-easter-2026",
    enquiryPhone: "07038024541",
    isSummer: false,
  },
  "holidays-that-rock-2026": {
    id: "holidays-that-rock-2026",
    name: "Holidays That Rock 2026",
    shortName: "Holidays That Rock",
    tagline:
      "Raising Future-Ready Children Through Creativity, Skills & Hands-On Learning",
    startDate: "2026-07-20",
    endDate: "2026-08-29",
    dateLabel: "July 20 – August 29, 2026",
    registrationDeadline: "2026-07-10",
    showcaseDates: "August 28 – 29, 2026",
    weeks: SUMMER_WEEKS,
    promoBannerStart: "2026-04-26",
    promoBannerEnd: "2026-08-29",
    landingPath: "/services/holidays-that-rock-2026",
    bookingQuery: "camp=holidays-that-rock-2026",
    enquiryPhone: "07038024541",
    isSummer: true,
  },
};

export const DEFAULT_CAMP_SEASON: CampSeasonId = "alive-in-me-easter-2026";

export const SUMMER_CAMP_RATES = {
  gbagadaYoungWeekly: 40_000,
  gbagadaOlderWeekly: 65_000,
  lekkiWeekly: 100_000,
  boardingWeekly: 65_000,
  multiWeekDiscountPercent: 10,
  multiWeekDiscountMinWeeks: 3,
} as const;

export const EASTER_CAMP_RATES = {
  earlyBirdWeekly: 25_000,
  regularWeekly: 30_000,
  earlyBirdEndIso: "2026-04-01T00:00:00",
} as const;

export function getCampSeason(id?: string | null): CampSeason {
  if (id && id in CAMP_SEASONS) {
    return CAMP_SEASONS[id as CampSeasonId];
  }
  return CAMP_SEASONS[DEFAULT_CAMP_SEASON];
}

export function resolveCampSeasonId(
  campParam?: string | null,
  date: Date = new Date(),
): CampSeasonId {
  if (campParam && campParam in CAMP_SEASONS) {
    return campParam as CampSeasonId;
  }

  const active = getActivePromoCampSeason(date);
  if (active) return active;

  return DEFAULT_CAMP_SEASON;
}

export function isDateInRange(isoStart: string, isoEnd: string, date: Date): boolean {
  const start = new Date(`${isoStart}T00:00:00`);
  const end = new Date(`${isoEnd}T23:59:59`);
  return date >= start && date <= end;
}

export function getActivePromoCampSeason(
  date: Date = new Date(),
): CampSeasonId | null {
  for (const season of Object.values(CAMP_SEASONS)) {
    if (
      isDateInRange(season.promoBannerStart, season.promoBannerEnd, date)
    ) {
      return season.id;
    }
  }
  return null;
}

export function getCampBookingUrl(seasonId: CampSeasonId): string {
  return `/booking?service=holiday-camps&camp=${seasonId}`;
}

export function canChildBoard(age: number): boolean {
  return age >= 6 && age <= 14;
}

export function getAgeBandLabel(age: number): "0-5" | "6-14" {
  return age <= 5 ? "0-5" : "6-14";
}
