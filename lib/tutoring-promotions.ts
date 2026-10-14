/** Automatic virtual-tutoring discount (no promo code required). */
export const VIRTUAL_TUTORING_DISCOUNT_PERCENT = 15.3;
/** Inclusive window, evaluated in Lagos time (YYYY-MM-DD). */
export const VIRTUAL_TUTORING_DISCOUNT_START = "2026-10-14";
export const VIRTUAL_TUTORING_DISCOUNT_END = "2026-10-31";

const LAGOS_DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lagos",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toLagosDateKey(date: Date): string {
  return LAGOS_DATE_FORMAT.format(date);
}

export function isVirtualTutoringDiscountActive(now: Date = new Date()): boolean {
  const today = toLagosDateKey(now);
  return (
    today >= VIRTUAL_TUTORING_DISCOUNT_START &&
    today <= VIRTUAL_TUTORING_DISCOUNT_END
  );
}

export function applyVirtualTutoringDiscount(rate: number): number {
  return Math.round(rate * (1 - VIRTUAL_TUTORING_DISCOUNT_PERCENT / 100));
}

/** Discounted virtual rate when the window is open, otherwise the base rate. */
export function getEffectiveVirtualRate(
  baseVirtualRate: number,
  now: Date = new Date(),
): number {
  return isVirtualTutoringDiscountActive(now)
    ? applyVirtualTutoringDiscount(baseVirtualRate)
    : baseVirtualRate;
}

export function getVirtualTutoringDiscountLabel(): string {
  return `${VIRTUAL_TUTORING_DISCOUNT_PERCENT}% off virtual tutoring (until 31 Oct)`;
}
