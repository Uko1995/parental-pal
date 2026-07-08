import {
  CampLocation,
  CampSeasonId,
  EASTER_CAMP_RATES,
  HOTR26_PROMO_CODE,
  SUMMER_CAMP_RATES,
  getCampSeason,
} from "@/lib/camp-seasons";
import {
  type Hotr26PackageName,
  getHotr26PackageCampTotal,
  isHotr26PromoCode,
} from "@/lib/camp-promotions";

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

export interface CampPackageDiscount {
  childId: string;
  packageName: Hotr26PackageName;
  amount: number;
}

export interface CampPricingOptions {
  promoCode?: string;
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
  promoCode?: string;
  packageDiscounts?: CampPackageDiscount[];
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
  options?: CampPricingOptions,
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

  const hotrPromoActive =
    location === "gbagada" &&
    isHotr26PromoCode(options?.promoCode ?? "");

  let campFees = 0;
  let boardingFees = 0;
  const packageDiscounts: CampPackageDiscount[] = [];
  const packageChildIds = new Set<string>();

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

    if (hotrPromoActive) {
      const packagePricing = getHotr26PackageCampTotal(
        child.age,
        child.weekCount,
      );
      if (packagePricing) {
        const packageSavings = campSubtotal - packagePricing.total;
        if (packageSavings > 0) {
          packageDiscounts.push({
            childId: child.childId,
            packageName: packagePricing.packageName,
            amount: packageSavings,
          });
          packageChildIds.add(child.childId);
        }
      }
    }

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

  const packageDiscountTotal = packageDiscounts.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  let autoDiscount = 0;
  let anyChildQualifiesForAuto = false;

  for (const child of children) {
    if (packageChildIds.has(child.childId)) {
      continue;
    }
    if (child.weekCount < SUMMER_CAMP_RATES.multiWeekDiscountMinWeeks) {
      continue;
    }

    anyChildQualifiesForAuto = true;
    const line = lines.find((l) => l.childId === child.childId);
    if (line) {
      autoDiscount += Math.round(
        (line.lineSubtotal * SUMMER_CAMP_RATES.multiWeekDiscountPercent) / 100,
      );
    }
  }

  const discount = packageDiscountTotal + autoDiscount;
  const discountPercent = anyChildQualifiesForAuto
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
    promoCode:
      hotrPromoActive && packageDiscountTotal > 0
        ? HOTR26_PROMO_CODE
        : undefined,
    packageDiscounts:
      packageDiscounts.length > 0 ? packageDiscounts : undefined,
  };
}
