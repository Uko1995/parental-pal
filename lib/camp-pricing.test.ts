import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateCampPricing } from "./camp-pricing";
import { HOTR26_PROMO_CODE } from "./camp-seasons";

describe("camp-pricing summer discounts", () => {
  it("applies 7% to a single child with 6 weeks", () => {
    const result = calculateCampPricing("holidays-that-rock-2026", "lekki", [
      { childId: "c1", age: 8, weekCount: 6, boarding: false },
    ]);

    assert.equal(result.discountPercent, 7);
    assert.equal(result.subtotal, 600_000);
    assert.equal(result.discount, 42_000);
    assert.equal(result.total, 558_000);
  });

  it("does not discount a child with fewer than 6 weeks", () => {
    const result = calculateCampPricing("holidays-that-rock-2026", "lekki", [
      { childId: "c1", age: 8, weekCount: 3, boarding: false },
    ]);

    assert.equal(result.discountPercent, 0);
    assert.equal(result.discount, 0);
    assert.equal(result.total, 300_000);
  });

  it("discounts only the child with 6 weeks when siblings differ", () => {
    const result = calculateCampPricing("holidays-that-rock-2026", "lekki", [
      { childId: "c1", age: 8, weekCount: 6, boarding: false },
      { childId: "c2", age: 6, weekCount: 2, boarding: false },
    ]);

    assert.equal(result.discountPercent, 7);
    assert.equal(result.subtotal, 800_000);
    assert.equal(result.discount, 42_000);
    assert.equal(result.total, 758_000);
  });
});

describe("camp-pricing HOTR26 packages", () => {
  it("applies builder package for 3 weeks at Gbagada with HOTR'26", () => {
    const result = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [{ childId: "c1", age: 4, weekCount: 3, boarding: false }],
      undefined,
      { promoCode: HOTR26_PROMO_CODE },
    );

    assert.equal(result.promoCode, HOTR26_PROMO_CODE);
    assert.equal(result.subtotal, 120_000);
    assert.equal(result.discount, 20_000);
    assert.equal(result.total, 100_000);
    assert.equal(result.packageDiscounts?.[0]?.packageName, "builder");
  });

  it("applies champion package for 6 weeks older child with boarding add-on", () => {
    const result = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [{ childId: "c1", age: 10, weekCount: 6, boarding: true }],
      undefined,
      { promoCode: "HOTR26" },
    );

    assert.equal(result.subtotal, 780_000);
    assert.equal(result.discount, 30_000);
    assert.equal(result.total, 750_000);
    assert.equal(result.packageDiscounts?.[0]?.packageName, "champion");
  });

  it("uses champion package instead of 7% for 6-week young child", () => {
    const withPromo = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [{ childId: "c1", age: 4, weekCount: 6, boarding: false }],
      undefined,
      { promoCode: HOTR26_PROMO_CODE },
    );
    const withoutPromo = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [{ childId: "c1", age: 4, weekCount: 6, boarding: false }],
    );

    assert.equal(withPromo.total, 220_000);
    assert.equal(withoutPromo.total, 223_200);
  });

  it("ignores HOTR26 promo at Lekki", () => {
    const result = calculateCampPricing(
      "holidays-that-rock-2026",
      "lekki",
      [{ childId: "c1", age: 8, weekCount: 3, boarding: false }],
      undefined,
      { promoCode: HOTR26_PROMO_CODE },
    );

    assert.equal(result.promoCode, undefined);
    assert.equal(result.discount, 0);
    assert.equal(result.total, 300_000);
  });

  it("does not apply package pricing for non-3/6 week counts", () => {
    const result = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [{ childId: "c1", age: 8, weekCount: 4, boarding: false }],
      undefined,
      { promoCode: HOTR26_PROMO_CODE },
    );

    assert.equal(result.promoCode, undefined);
    assert.equal(result.discount, 0);
    assert.equal(result.total, 260_000);
  });

  it("applies builder to one sibling and normal pricing to another", () => {
    const result = calculateCampPricing(
      "holidays-that-rock-2026",
      "gbagada",
      [
        { childId: "c1", age: 4, weekCount: 3, boarding: false },
        { childId: "c2", age: 8, weekCount: 2, boarding: false },
      ],
      undefined,
      { promoCode: HOTR26_PROMO_CODE },
    );

    assert.equal(result.subtotal, 250_000);
    assert.equal(result.discount, 20_000);
    assert.equal(result.total, 230_000);
  });
});
