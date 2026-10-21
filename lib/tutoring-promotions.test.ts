import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VIRTUAL_TUTORING_DISCOUNT_END,
  VIRTUAL_TUTORING_DISCOUNT_PERCENT,
  VIRTUAL_TUTORING_DISCOUNT_START,
  VIRTUAL_TUTORING_PROMO_CODE,
  getVirtualTutoringDiscountLabel,
  getVirtualTutoringPromoValidity,
} from "@/lib/tutoring-promotions";

describe("virtual tutoring promo seed metadata", () => {
  it("keeps the Oct 2026 window and 15.3% amount", () => {
    assert.equal(VIRTUAL_TUTORING_PROMO_CODE, "VIRTUAL15");
    assert.equal(VIRTUAL_TUTORING_DISCOUNT_PERCENT, 15.3);
    assert.equal(VIRTUAL_TUTORING_DISCOUNT_START, "2026-10-14");
    assert.equal(VIRTUAL_TUTORING_DISCOUNT_END, "2026-10-31");
    assert.match(getVirtualTutoringDiscountLabel(), /15\.3%/);
  });

  it("builds Lagos-aligned validity dates covering the full window", () => {
    const { validFrom, validUntil } = getVirtualTutoringPromoValidity();
    assert.ok(validFrom < validUntil);
    // 14 Oct 2026 00:00 WAT == 13 Oct 23:00 UTC
    assert.equal(validFrom.toISOString(), "2026-10-13T23:00:00.000Z");
    // 31 Oct 2026 23:59:59.999 WAT == 31 Oct 22:59:59.999 UTC
    assert.equal(validUntil.toISOString(), "2026-10-31T22:59:59.999Z");
  });
});
