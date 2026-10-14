import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyVirtualTutoringDiscount,
  getEffectiveVirtualRate,
  isVirtualTutoringDiscountActive,
} from "@/lib/tutoring-promotions";

describe("virtual tutoring discount", () => {
  it("is active from 14 Oct through 31 Oct 2026 (Lagos time)", () => {
    assert.equal(
      isVirtualTutoringDiscountActive(new Date("2026-10-13T22:59:00Z")),
      false,
    );
    assert.equal(
      isVirtualTutoringDiscountActive(new Date("2026-10-13T23:00:00Z")),
      true,
    );
    assert.equal(
      isVirtualTutoringDiscountActive(new Date("2026-10-31T22:59:00Z")),
      true,
    );
    assert.equal(
      isVirtualTutoringDiscountActive(new Date("2026-10-31T23:00:00Z")),
      false,
    );
  });

  it("takes 15.3% off and rounds to the nearest naira", () => {
    assert.equal(applyVirtualTutoringDiscount(13000), 11011);
    assert.equal(applyVirtualTutoringDiscount(11000), 9317);
  });

  it("returns the base rate outside the window", () => {
    assert.equal(
      getEffectiveVirtualRate(13000, new Date("2026-11-05T10:00:00Z")),
      13000,
    );
    assert.equal(
      getEffectiveVirtualRate(13000, new Date("2026-10-20T10:00:00Z")),
      11011,
    );
  });
});
