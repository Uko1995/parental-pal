/**
 * Seed metadata for the automatic virtual-tutoring promo (VIRTUAL15).
 * Pricing is applied via Discounts & Promos / booking-promotions — not here.
 */
export const VIRTUAL_TUTORING_PROMO_CODE = "VIRTUAL15";
export const VIRTUAL_TUTORING_DISCOUNT_PERCENT = 15.3;
/** Inclusive window, evaluated in Lagos time (YYYY-MM-DD). */
export const VIRTUAL_TUTORING_DISCOUNT_START = "2026-10-14";
export const VIRTUAL_TUTORING_DISCOUNT_END = "2026-10-31";

export function getVirtualTutoringDiscountLabel(): string {
  return `${VIRTUAL_TUTORING_DISCOUNT_PERCENT}% off virtual tutoring (until 31 Oct)`;
}

/** Lagos midnight start / end-of-day for the seed coupon validity window. */
export function getVirtualTutoringPromoValidity(): {
  validFrom: Date;
  validUntil: Date;
} {
  return {
    validFrom: new Date(
      `${VIRTUAL_TUTORING_DISCOUNT_START}T00:00:00+01:00`,
    ),
    validUntil: new Date(
      `${VIRTUAL_TUTORING_DISCOUNT_END}T23:59:59.999+01:00`,
    ),
  };
}
