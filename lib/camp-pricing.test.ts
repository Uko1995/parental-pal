import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateCampPricing } from "./camp-pricing";

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
