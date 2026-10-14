import type {
  CouponInterface,
  CouponTarget,
  CouponTutoringLocation,
} from "@/models/Coupon";

type DiscountFields = Pick<
  CouponInterface,
  "discountType" | "discountValue" | "maximumDiscount" | "minimumOrderAmount"
>;

/** Amount off `amount` (0 if below the minimum). Never exceeds `amount`. */
export function computeCouponDiscount(
  coupon: DiscountFields,
  amount: number,
): number {
  if (amount <= 0) return 0;
  if (amount < (coupon.minimumOrderAmount || 0)) return 0;

  let discount =
    coupon.discountType === "percentage"
      ? Math.round((amount * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (
    coupon.discountType === "percentage" &&
    coupon.maximumDiscount &&
    coupon.maximumDiscount > 0
  ) {
    discount = Math.min(discount, coupon.maximumDiscount);
  }

  return Math.max(0, Math.min(Math.round(discount), amount));
}

export function getCouponTarget(coupon: Pick<CouponInterface, "target">): CouponTarget {
  return coupon.target ?? "products";
}

export type CouponWindowStatus = "scheduled" | "active" | "expired";

export function getCouponWindowStatus(
  coupon: Pick<CouponInterface, "validFrom" | "validUntil">,
  now: Date = new Date(),
): CouponWindowStatus {
  if (now < new Date(coupon.validFrom)) return "scheduled";
  if (now > new Date(coupon.validUntil)) return "expired";
  return "active";
}

export function isCouponUsable(
  coupon: Pick<
    CouponInterface,
    "isActive" | "validFrom" | "validUntil" | "maxUses" | "usedCount"
  >,
  now: Date = new Date(),
): { ok: true } | { ok: false; error: string } {
  if (!coupon.isActive) {
    return { ok: false, error: "This promo is no longer active" };
  }
  const status = getCouponWindowStatus(coupon, now);
  if (status === "scheduled") {
    return { ok: false, error: "This promo is not yet valid" };
  }
  if (status === "expired") {
    return { ok: false, error: "This promo has expired" };
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "This promo has reached its usage limit" };
  }
  return { ok: true };
}

export function matchesBookingScope(
  coupon: Pick<
    CouponInterface,
    "target" | "applicableServiceTypes" | "tutoringLocation"
  >,
  serviceType: string,
  tutoringLocation?: CouponTutoringLocation | null,
): boolean {
  if (getCouponTarget(coupon) !== "bookings") return false;

  const services = coupon.applicableServiceTypes ?? [];
  if (services.length > 0 && !services.includes(serviceType)) return false;

  if (
    serviceType === "tutoring" &&
    coupon.tutoringLocation &&
    coupon.tutoringLocation !== tutoringLocation
  ) {
    return false;
  }
  return true;
}

/** Highest discount wins; ties keep the earliest candidate. */
export function pickBestDiscount<T extends { discountAmount: number }>(
  candidates: T[],
): T | null {
  return candidates.reduce<T | null>(
    (best, candidate) =>
      candidate.discountAmount > 0 &&
      (!best || candidate.discountAmount > best.discountAmount)
        ? candidate
        : best,
    null,
  );
}
