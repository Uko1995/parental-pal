import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { BookingInterface } from "@/models/Booking";
import { resolveBookingScheduleDates } from "./booking-schedule";

describe("booking-schedule", () => {
  it("uses first tutoring session date, not the form start date", () => {
    const booking = {
      serviceType: "tutoring",
      schedule: { startDate: "2026-03-01", isRecurring: true },
      serviceData: {
        childrenData: [
          {
            schedule: [
              {
                day: "monday",
                dates: [
                  { date: "2026-03-02" },
                  { date: "2026-03-09" },
                  { date: "2026-03-16" },
                ],
              },
            ],
          },
        ],
      },
    } as unknown as BookingInterface;

    const bounds = resolveBookingScheduleDates(booking);
    assert.equal(bounds.startDate, "2026-03-02");
    assert.equal(bounds.endDate, "2026-03-16");
  });

  it("uses earliest camp week start and latest camp week end", () => {
    const booking = {
      serviceType: "holiday-camps",
      schedule: { startDate: "2026-07-01", isRecurring: false },
      serviceData: {
        childrenData: [
          {
            campWeeks: [
              { startDate: "2026-07-20", endDate: "2026-07-24" },
              { startDate: "2026-07-27", endDate: "2026-07-31" },
            ],
          },
        ],
      },
    } as unknown as BookingInterface;

    const bounds = resolveBookingScheduleDates(booking);
    assert.equal(bounds.startDate, "2026-07-20");
    assert.equal(bounds.endDate, "2026-07-31");
  });

  it("uses space rental event date as service start", () => {
    const booking = {
      serviceType: "space-rental",
      schedule: { startDate: "2026-06-01", isRecurring: false },
      serviceData: { eventDate: "2026-06-15" },
    } as unknown as BookingInterface;

    const bounds = resolveBookingScheduleDates(booking);
    assert.equal(bounds.startDate, "2026-06-15");
    assert.equal(bounds.endDate, "2026-06-15");
  });
});
