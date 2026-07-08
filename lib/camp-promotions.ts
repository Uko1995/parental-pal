import {
  type CampLocation,
  type CampSeasonId,
  HOTR26_PACKAGES,
  HOTR26_PROMO_CODE,
} from "@/lib/camp-seasons";
import { HTR26_SEASON_ID } from "@/lib/htr-camp";

export type Hotr26PackageName = "builder" | "champion";

export function normalizeHotrPromoCode(code: string): string {
  return code.trim().toUpperCase().replace(/[''’]/g, "");
}

export function isHotr26PromoCode(code: string): boolean {
  return normalizeHotrPromoCode(code) === "HOTR26";
}

export function getHotr26PackageCampTotal(
  age: number,
  weekCount: number,
): { packageName: Hotr26PackageName; total: number } | null {
  if (weekCount === HOTR26_PACKAGES.builder.weeks) {
    return {
      packageName: "builder",
      total:
        age <= 5
          ? HOTR26_PACKAGES.builder.youngTotal
          : HOTR26_PACKAGES.builder.olderTotal,
    };
  }

  if (weekCount === HOTR26_PACKAGES.champion.weeks) {
    return {
      packageName: "champion",
      total:
        age <= 5
          ? HOTR26_PACKAGES.champion.youngTotal
          : HOTR26_PACKAGES.champion.olderTotal,
    };
  }

  return null;
}

export interface Hotr26PromoValidationInput {
  seasonId: CampSeasonId;
  location: CampLocation | null | undefined;
  code: string;
}

export interface Hotr26PromoValidationResult {
  valid: boolean;
  promoCode?: string;
  message?: string;
}

export function validateHotr26PromoApplication(
  input: Hotr26PromoValidationInput,
): Hotr26PromoValidationResult {
  const code = String(input.code || "").trim();

  if (!code) {
    return { valid: false, message: "Promo code is required." };
  }

  if (!isHotr26PromoCode(code)) {
    return { valid: false, message: "Invalid promo code." };
  }

  if (input.seasonId !== HTR26_SEASON_ID) {
    return {
      valid: false,
      message: "This promo code is only valid for Holidays That Rock 2026.",
    };
  }

  if (input.location !== "gbagada") {
    return {
      valid: false,
      message: "This promo code is only valid for Gbagada camp bookings.",
    };
  }

  return {
    valid: true,
    promoCode: HOTR26_PROMO_CODE,
    message: "Promo applied. Builder and Champion package pricing is available.",
  };
}

export function resolveAppliedHotr26PromoCode(
  input: Hotr26PromoValidationInput,
): string | undefined {
  const result = validateHotr26PromoApplication(input);
  return result.valid ? result.promoCode : undefined;
}
