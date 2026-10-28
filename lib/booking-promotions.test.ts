import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ObjectId } from "mongodb";
import type { CouponInterface } from "@/models/Coupon";
import {
  computeCouponDiscount,
  getCouponWindowStatus,
  matchesBookingScope,
} from "@/lib/coupon-discount";
import {
  listEligibleBookingPromotions,
  resolveBestBookingPromotion,
  resolveBookingPromotion,
  type BookingPromotionDeps,
} from "@/lib/booking-promotions";

const NOW = new Date("2026-10-20T10:00:00Z");

function makeCoupon(overrides: Partial<CouponInterface> = {}): CouponInterface {
  return {
    _id: new ObjectId(),
    code: "TEST",
    description: "",
    target: "bookings",
    autoApply: false,
    applicableServiceTypes: [],
    discountType: "percentage",
    discountValue: 10,
    maxUses: 0,
    usedCount: 0,
    maxUsesPerUser: 0,
    minimumOrderAmount: 0,
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    applicableUsers: [],
    firstTimeOnly: false,
    validFrom: new Date("2026-10-01T00:00:00Z"),
    validUntil: new Date("2026-10-31T23:59:59Z"),
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: new ObjectId(),
    ...overrides,
  };
}

function makeDeps(
  coupons: CouponInterface[],
  overrides: Partial<BookingPromotionDeps> = {},
): BookingPromotionDeps {
  return {
    getCouponByCode: async (code) =>
      coupons.find((c) => c.code === code.toUpperCase()) ?? null,
    getActiveAutoBookingCoupons: async () =>
      coupons.filter((c) => c.autoApply && c.target === "bookings"),
    getActiveBookingCoupons: async () =>
      coupons.filter((c) => c.target === "bookings"),
    getUserUsageCount: async () => 0,
    hasPriorBooking: async () => false,
    ...overrides,
  };
}

describe("computeCouponDiscount", () => {
  it("applies a percentage with a cap", () => {
    const coupon = makeCoupon({ discountValue: 20, maximumDiscount: 5000 });
    assert.equal(computeCouponDiscount(coupon, 10000), 2000);
    assert.equal(computeCouponDiscount(coupon, 100000), 5000);
  });

  it("caps a fixed discount at the amount and respects the minimum", () => {
    const coupon = makeCoupon({ discountType: "fixed", discountValue: 8000 });
    assert.equal(computeCouponDiscount(coupon, 5000), 5000);
    const withMin = makeCoupon({ minimumOrderAmount: 20000 });
    assert.equal(computeCouponDiscount(withMin, 10000), 0);
  });
});

describe("coupon scope and window", () => {
  it("reports scheduled / active / expired", () => {
    const coupon = makeCoupon();
    assert.equal(getCouponWindowStatus(coupon, new Date("2026-09-01")), "scheduled");
    assert.equal(getCouponWindowStatus(coupon, NOW), "active");
    assert.equal(getCouponWindowStatus(coupon, new Date("2026-11-05")), "expired");
  });

  it("filters by service type and tutoring location", () => {
    const coupon = makeCoupon({
      applicableServiceTypes: ["tutoring"],
      tutoringLocation: "virtual",
    });
    assert.equal(matchesBookingScope(coupon, "tutoring", "virtual"), true);
    assert.equal(matchesBookingScope(coupon, "tutoring", "physical"), false);
    assert.equal(matchesBookingScope(coupon, "childcare", null), false);
    assert.equal(
      matchesBookingScope(makeCoupon({ target: "products" }), "childcare"),
      false,
    );
  });
});

describe("resolveBookingPromotion", () => {
  it("picks the biggest automatic promo for the service", async () => {
    const small = makeCoupon({ code: "AUTO5", autoApply: true, discountValue: 5 });
    const big = makeCoupon({ code: "AUTO15", autoApply: true, discountValue: 15 });
    const otherService = makeCoupon({
      code: "CAMP50",
      autoApply: true,
      discountValue: 50,
      applicableServiceTypes: ["holiday-camps"],
    });
    const result = await resolveBookingPromotion(
      { serviceType: "childcare", baseAmount: 60000, now: NOW },
      makeDeps([small, big, otherService]),
    );
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.promotion?.coupon.code, "AUTO15");
    assert.equal(result.ok && result.promotion?.discountAmount, 9000);
  });

  it("returns null when no automatic promo applies", async () => {
    const result = await resolveBookingPromotion(
      { serviceType: "childcare", baseAmount: 60000, now: NOW },
      makeDeps([makeCoupon({ autoApply: true, isActive: false })]),
    );
    assert.deepEqual(result, { ok: true, promotion: null });
  });

  it("rejects codes that are expired, used up, or product-only", async () => {
    const expired = makeCoupon({
      code: "OLD",
      validUntil: new Date("2026-10-05T00:00:00Z"),
    });
    const usedUp = makeCoupon({ code: "FULL", maxUses: 2, usedCount: 2 });
    const product = makeCoupon({ code: "SHOP", target: "products" });
    const deps = makeDeps([expired, usedUp, product]);

    for (const code of ["OLD", "FULL", "SHOP", "MISSING"]) {
      const result = await resolveBookingPromotion(
        { serviceType: "childcare", baseAmount: 50000, promoCode: code, now: NOW },
        deps,
      );
      assert.equal(result.ok, false, `${code} should be rejected`);
    }
  });

  it("enforces per-user and first-time limits", async () => {
    const perUser = makeCoupon({ code: "ONCE", maxUsesPerUser: 1 });
    const firstTime = makeCoupon({ code: "NEW", firstTimeOnly: true });
    const deps = makeDeps([perUser, firstTime], {
      getUserUsageCount: async () => 1,
      hasPriorBooking: async () => true,
    });
    for (const code of ["ONCE", "NEW"]) {
      const result = await resolveBookingPromotion(
        {
          serviceType: "childcare",
          baseAmount: 50000,
          promoCode: code,
          userId: new ObjectId().toString(),
          now: NOW,
        },
        deps,
      );
      assert.equal(result.ok, false, `${code} should be rejected`);
    }
  });
});

describe("resolveBestBookingPromotion", () => {
  const input = { serviceType: "childcare", baseAmount: 60000, now: NOW };

  it("uses the code when it beats the automatic promo", async () => {
    const auto = makeCoupon({ code: "AUTO5", autoApply: true, discountValue: 5 });
    const code = makeCoupon({ code: "SAVE20", discountValue: 20 });
    const result = await resolveBestBookingPromotion(
      { ...input, promoCode: "save20" },
      makeDeps([auto, code]),
    );
    assert.equal(result.promotion?.coupon.code, "SAVE20");
    assert.equal(result.promotion?.automatic, false);
    assert.equal(result.codeError, null);
  });

  it("keeps the bigger automatic promo (no stacking)", async () => {
    const auto = makeCoupon({ code: "AUTO25", autoApply: true, discountValue: 25 });
    const code = makeCoupon({ code: "SAVE10", discountValue: 10 });
    const result = await resolveBestBookingPromotion(
      { ...input, promoCode: "SAVE10" },
      makeDeps([auto, code]),
    );
    assert.equal(result.promotion?.coupon.code, "AUTO25");
    assert.equal(result.promotion?.discountAmount, 15000);
  });

  it("falls back to the automatic promo when the code is invalid", async () => {
    const auto = makeCoupon({ code: "AUTO5", autoApply: true, discountValue: 5 });
    const result = await resolveBestBookingPromotion(
      { ...input, promoCode: "NOPE" },
      makeDeps([auto]),
    );
    assert.equal(result.promotion?.coupon.code, "AUTO5");
    assert.equal(result.codeError, "Invalid promo code");
  });
});

describe("listEligibleBookingPromotions", () => {
  it("returns every matching booking promo, not only the largest", async () => {
    const autoSmall = makeCoupon({
      code: "VIRTUAL10",
      autoApply: true,
      discountValue: 10,
      applicableServiceTypes: ["tutoring"],
      tutoringLocation: "virtual",
    });
    const autoBig = makeCoupon({
      code: "VIRTUAL15",
      autoApply: true,
      discountValue: 15.3,
      applicableServiceTypes: ["tutoring"],
      tutoringLocation: "virtual",
    });
    const codeOnly = makeCoupon({
      code: "SAVE5",
      autoApply: false,
      discountValue: 5,
      applicableServiceTypes: ["tutoring"],
    });
    const otherService = makeCoupon({
      code: "CARE20",
      autoApply: true,
      discountValue: 20,
      applicableServiceTypes: ["childcare"],
    });

    const listed = await listEligibleBookingPromotions(
      {
        serviceType: "tutoring",
        tutoringLocation: "virtual",
        baseAmount: 100000,
        now: NOW,
      },
      makeDeps([autoSmall, autoBig, codeOnly, otherService]),
    );

    assert.deepEqual(
      listed.map((p) => p.code),
      ["VIRTUAL15", "VIRTUAL10", "SAVE5"],
    );
    assert.equal(listed[0].discountAmount, 15300);
  });

  it("returns an empty list when nothing matches", async () => {
    const listed = await listEligibleBookingPromotions(
      { serviceType: "childcare", baseAmount: 50000, now: NOW },
      makeDeps([
        makeCoupon({
          code: "VIRT",
          autoApply: true,
          applicableServiceTypes: ["tutoring"],
          tutoringLocation: "virtual",
        }),
      ]),
    );
    assert.equal(listed.length, 0);
  });
});
