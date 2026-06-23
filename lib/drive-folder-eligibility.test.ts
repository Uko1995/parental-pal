import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isHtrSummerCampBooking } from "./htr-camp";

describe("drive-folder eligibility", () => {
  it("allows only holidays-that-rock-2026 holiday camp bookings", () => {
    assert.equal(
      isHtrSummerCampBooking("holiday-camps", "holidays-that-rock-2026"),
      true,
    );
    assert.equal(
      isHtrSummerCampBooking("holiday-camps", "alive-in-me-easter-2026"),
      false,
    );
    assert.equal(isHtrSummerCampBooking("tutoring", "holidays-that-rock-2026"), false);
  });
});
