import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canParentCancelBooking,
  getParentCancelBlockReason,
  haveBookingSessionsStarted,
} from "./booking-cancellation";

describe("booking-cancellation", () => {
  it("allows cancel for confirmed booking before sessions start", () => {
    const booking = {
      status: "confirmed",
      serviceType: "tutoring",
      schedule: { startDate: "2099-06-01" },
      serviceData: {},
    };

    assert.equal(canParentCancelBooking(booking), true);
    assert.equal(getParentCancelBlockReason(booking), null);
  });

  it("blocks cancel once the first session date has passed", () => {
    const booking = {
      status: "confirmed",
      serviceType: "tutoring",
      schedule: { startDate: "2020-01-01" },
      serviceData: {},
    };

    assert.equal(haveBookingSessionsStarted(booking), true);
    assert.equal(canParentCancelBooking(booking), false);
    assert.match(
      getParentCancelBlockReason(booking) || "",
      /Sessions have already started/,
    );
  });

  it("blocks cancel for completed bookings", () => {
    const booking = {
      status: "completed",
      serviceType: "tutoring",
      schedule: { startDate: "2099-06-01" },
      serviceData: {},
    };

    assert.equal(canParentCancelBooking(booking), false);
  });
});
