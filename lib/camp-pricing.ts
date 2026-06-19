import {
  CampLocation,
  CampSeasonId,
  EASTER_CAMP_RATES,
  SUMMER_CAMP_RATES,
  getCampSeason,
} from "@/lib/camp-seasons";

export interface ChildCampPricingInput {
  childId: string;
  age: number;
  weekCount: number;
  boarding: boolean;
}

export interface ChildCampPricingLine {
  childId: string;
  age: number;
  weeks: number;
  campFeePerWeek: number;
  campSubtotal: number;
  boardingSubtotal: number;
  lineSubtotal: number;
}

export interface CampPricingResult {
  campFees: number;
  boardingFees: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  totalWeeks: number;
  lines: ChildCampPricingLine[];
}

export function isEasterEarlyBirdActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(EASTER_CAMP_RATES.earlyBirdEndIso).getTime();
}

export function getEasterWeeklyRate(now: Date = new Date()): number {
  return isEasterEarlyBirdActive(now)
    ? EASTER_CAMP_RATES.earlyBirdWeekly
    : EASTER_CAMP_RATES.regularWeekly;
}

export function getSummerWeeklyCampRate(
  location: CampLocation,
  age: number,
): number {
  if (location === "lekki") {
    return SUMMER_CAMP_RATES.lekkiWeekly;
  }
  return age <= 5
    ? SUMMER_CAMP_RATES.gbagadaYoungWeekly
    : SUMMER_CAMP_RATES.gbagadaOlderWeekly;
}

export function calculateCampPricing(
  seasonId: CampSeasonId,
  location: CampLocation | null,
  children: ChildCampPricingInput[],
  now: Date = new Date(),
): CampPricingResult {
  const season = getCampSeason(seasonId);
  const lines: ChildCampPricingLine[] = [];

  if (!season.isSummer) {
    const weeklyRate = getEasterWeeklyRate(now);
    let campFees = 0;

    for (const child of children) {
      const campSubtotal = child.weekCount * weeklyRate;
      campFees += campSubtotal;
      lines.push({
        childId: child.childId,
        age: child.age,
        weeks: child.weekCount,
        campFeePerWeek: weeklyRate,
        campSubtotal,
        boardingSubtotal: 0,
        lineSubtotal: campSubtotal,
      });
    }

    const totalWeeks = children.reduce((sum, c) => sum + c.weekCount, 0);
    return {
      campFees,
      boardingFees: 0,
      subtotal: campFees,
      discount: 0,
      discountPercent: 0,
      total: campFees,
      totalWeeks,
      lines,
    };
  }

  if (!location) {
    return {
      campFees: 0,
      boardingFees: 0,
      subtotal: 0,
      discount: 0,
      discountPercent: 0,
      total: 0,
      totalWeeks: 0,
      lines: [],
    };
  }

  let campFees = 0;
  let boardingFees = 0;

  for (const child of children) {
    const campFeePerWeek = getSummerWeeklyCampRate(location, child.age);
    const campSubtotal = child.weekCount * campFeePerWeek;
    const boardingSubtotal =
      location === "gbagada" &&
      child.boarding &&
      child.age >= 6 &&
      child.age <= 14
        ? child.weekCount * SUMMER_CAMP_RATES.boardingWeekly
        : 0;

    campFees += campSubtotal;
    boardingFees += boardingSubtotal;

    lines.push({
      childId: child.childId,
      age: child.age,
      weeks: child.weekCount,
      campFeePerWeek,
      campSubtotal,
      boardingSubtotal,
      lineSubtotal: campSubtotal + boardingSubtotal,
    });
  }

  const subtotal = campFees + boardingFees;
  const totalWeeks = children.reduce((sum, c) => sum + c.weekCount, 0);

  let discount = 0;
  let anyChildQualifies = false;

  for (const child of children) {
    if (child.weekCount >= SUMMER_CAMP_RATES.multiWeekDiscountMinWeeks) {
      anyChildQualifies = true;
      const line = lines.find((l) => l.childId === child.childId);
      if (line) {
        discount += Math.round(
          (line.lineSubtotal * SUMMER_CAMP_RATES.multiWeekDiscountPercent) / 100,
        );
      }
    }
  }

  const discountPercent = anyChildQualifies
    ? SUMMER_CAMP_RATES.multiWeekDiscountPercent
    : 0;
  const total = Math.max(0, subtotal - discount);

  return {
    campFees,
    boardingFees,
    subtotal,
    discount,
    discountPercent,
    total,
    totalWeeks,
    lines,
  };
}
