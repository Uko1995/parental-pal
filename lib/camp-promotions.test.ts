import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getHotr26PackageCampTotal,
  isHotr26PromoCode,
  normalizeHotrPromoCode,
  validateHotr26PromoApplication,
} from "./camp-promotions";

describe("camp-promotions", () => {
  it("normalizes HOTR promo code variants", () => {
    assert.equal(normalizeHotrPromoCode(" hotr'26 "), "HOTR26");
    assert.equal(normalizeHotrPromoCode("HOTR26"), "HOTR26");
    assert.equal(isHotr26PromoCode("HOTR'26"), true);
    assert.equal(isHotr26PromoCode("INVALID"), false);
  });

  it("returns builder and champion package totals by age band", () => {
    assert.deepEqual(getHotr26PackageCampTotal(4, 3), {
      packageName: "builder",
      total: 100_000,
    });
    assert.deepEqual(getHotr26PackageCampTotal(8, 3), {
      packageName: "builder",
      total: 180_000,
    });
    assert.deepEqual(getHotr26PackageCampTotal(5, 6), {
      packageName: "champion",
      total: 220_000,
    });
    assert.deepEqual(getHotr26PackageCampTotal(10, 6), {
      packageName: "champion",
      total: 360_000,
    });
    assert.equal(getHotr26PackageCampTotal(8, 4), null);
  });

  it("validates HOTR26 promo for Gbagada summer camp only", () => {
    assert.equal(
      validateHotr26PromoApplication({
        seasonId: "holidays-that-rock-2026",
        location: "gbagada",
        code: "HOTR'26",
      }).valid,
      true,
    );

    assert.equal(
      validateHotr26PromoApplication({
        seasonId: "holidays-that-rock-2026",
        location: "lekki",
        code: "HOTR'26",
      }).valid,
      false,
    );

    assert.equal(
      validateHotr26PromoApplication({
        seasonId: "alive-in-me-easter-2026",
        location: "gbagada",
        code: "HOTR'26",
      }).valid,
      false,
    );
  });
});
