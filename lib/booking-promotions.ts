import type {
  CouponInterface,
  CouponTutoringLocation,
} from "@/models/Coupon";
import {
  computeCouponDiscount,
  isCouponUsable,
  matchesBookingScope,
  pickBestDiscount,
} from "@/lib/coupon-discount";

export interface BookingPromotionInput {
  serviceType: string;
  tutoringLocation?: CouponTutoringLocation | null;
  userId?: string | null;
  baseAmount: number;
  promoCode?: string | null;
  now?: Date;
}

export interface BookingPromotionMatch {
  coupon: CouponInterface;
  discountAmount: number;
  label: string;
  /** Applied automatically (no code entered). */
  automatic: boolean;
}

export type BookingPromotionResult =
  | { ok: true; promotion: BookingPromotionMatch | null }
  | { ok: false; error: string };

export interface BookingPromotionDeps {
  getCouponByCode: (code: string) => Promise<CouponInterface | null>;
  getActiveAutoBookingCoupons: (now: Date) => Promise<CouponInterface[]>;
  getUserUsageCount: (
    couponId: NonNullable<CouponInterface["_id"]>,
    userId: string,
  ) => Promise<number>;
  hasPriorBooking: (userId: string) => Promise<boolean>;
}

export function getPromotionLabel(coupon: CouponInterface): string {
  const value =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% off`
      : `₦${coupon.discountValue.toLocaleString()} off`;
  return coupon.description?.trim()
    ? `${coupon.description.trim()} (${value})`
    : `${coupon.code} (${value})`;
}

export function getPromotionReason(match: BookingPromotionMatch): string {
  const description = match.coupon.description?.trim();
  return description
    ? `Promo: ${match.coupon.code} (${description})`
    : `Promo: ${match.coupon.code}`;
}

async function checkUserEligibility(
  coupon: CouponInterface,
  userId: string | null | undefined,
  deps: BookingPromotionDeps,
): Promise<string | null> {
  if (coupon.applicableUsers?.length) {
    if (!userId || !coupon.applicableUsers.some((u) => u.toString() === userId)) {
      return "This promo is not valid for your account";
    }
  }
  if (coupon.maxUsesPerUser > 0 && coupon._id && userId) {
    const used = await deps.getUserUsageCount(coupon._id, userId);
    if (used >= coupon.maxUsesPerUser) {
      return "You have already used this promo";
    }
  }
  if (coupon.firstTimeOnly && userId && (await deps.hasPriorBooking(userId))) {
    return "This promo is only for first-time bookings";
  }
  return null;
}

async function evaluate(
  coupon: CouponInterface,
  input: BookingPromotionInput,
  now: Date,
  deps: BookingPromotionDeps,
  automatic: boolean,
): Promise<{ match: BookingPromotionMatch } | { error: string }> {
  const usable = isCouponUsable(coupon, now);
  if (!usable.ok) return { error: usable.error };

  if (!matchesBookingScope(coupon, input.serviceType, input.tutoringLocation)) {
    return { error: "This promo does not apply to this service" };
  }

  if (input.baseAmount < (coupon.minimumOrderAmount || 0)) {
    return {
      error: `This promo needs a minimum booking of ₦${coupon.minimumOrderAmount.toLocaleString()}`,
    };
  }

  const userError = await checkUserEligibility(coupon, input.userId, deps);
  if (userError) return { error: userError };

  const discountAmount = computeCouponDiscount(coupon, input.baseAmount);
  if (discountAmount <= 0) {
    return { error: "This promo does not reduce this booking" };
  }

  return {
    match: {
      coupon,
      discountAmount,
      label: getPromotionLabel(coupon),
      automatic,
    },
  };
}

/**
 * With a code: that promo or an error. Without: the best automatic promo
 * (or null). Bookings only — product coupons never match here.
 */
export async function resolveBookingPromotion(
  input: BookingPromotionInput,
  deps?: BookingPromotionDeps,
): Promise<BookingPromotionResult> {
  const resolvedDeps = deps ?? (await defaultDeps());
  const now = input.now ?? new Date();
  const code = input.promoCode?.trim();

  if (code) {
    const coupon = await resolvedDeps.getCouponByCode(code);
    if (!coupon || coupon.target !== "bookings") {
      return { ok: false, error: "Invalid promo code" };
    }
    const result = await evaluate(coupon, input, now, resolvedDeps, false);
    return "error" in result
      ? { ok: false, error: result.error }
      : { ok: true, promotion: result.match };
  }

  const candidates = await resolvedDeps.getActiveAutoBookingCoupons(now);
  const matches: BookingPromotionMatch[] = [];
  for (const coupon of candidates) {
    const result = await evaluate(coupon, input, now, resolvedDeps, true);
    if ("match" in result) matches.push(result.match);
  }
  return { ok: true, promotion: pickBestDiscount(matches) };
}

/**
 * Best of the entered code (if valid) and any automatic promo. An invalid
 * code never blocks: its error is returned alongside the automatic result.
 */
export async function resolveBestBookingPromotion(
  input: BookingPromotionInput,
  deps?: BookingPromotionDeps,
): Promise<{ promotion: BookingPromotionMatch | null; codeError: string | null }> {
  const resolvedDeps = deps ?? (await defaultDeps());
  const [auto, coded] = await Promise.all([
    resolveBookingPromotion({ ...input, promoCode: null }, resolvedDeps),
    input.promoCode?.trim()
      ? resolveBookingPromotion(input, resolvedDeps)
      : Promise.resolve(null),
  ]);
  const candidates = [auto, coded].flatMap((result) =>
    result?.ok && result.promotion ? [result.promotion] : [],
  );
  return {
    promotion: pickBestDiscount(candidates),
    codeError: coded && !coded.ok ? coded.error : null,
  };
}

async function defaultDeps(): Promise<BookingPromotionDeps> {
  const [{ CouponRepository }, { BookingRepository }] = await Promise.all([
    import("@/lib/CouponRepository"),
    import("@/lib/BookingRepository"),
  ]);
  return {
    getCouponByCode: (code) => CouponRepository.getCouponByCode(code),
    getActiveAutoBookingCoupons: (now) =>
      CouponRepository.getActiveAutoApplyCoupons("bookings", now),
    getUserUsageCount: (couponId, userId) =>
      CouponRepository.getUserUsageCount(couponId, userId),
    hasPriorBooking: async (userId) =>
      (await BookingRepository.findByUserId(userId)).length > 0,
  };
}
