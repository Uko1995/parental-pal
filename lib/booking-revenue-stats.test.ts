import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  aggregateRevenueStats,
  formatServiceTypeLabel,
  getPaidAmount,
} from "./booking-revenue-stats";
import type { BookingInterface } from "@/models/Booking";

describe("booking-revenue-stats", () => {
  it("formats service type labels", () => {
    assert.equal(formatServiceTypeLabel("holiday-camps"), "Holiday Camps");
    assert.equal(formatServiceTypeLabel("tutoring"), "Tutoring");
  });

  it("returns paid amount only for paid bookings", () => {
    const paid = {
      payment: { status: "paid", paidAmount: 48000 },
      pricing: { totalAmount: 48000 },
    } as BookingInterface;

    const pending = {
      payment: { status: "pending" },
      pricing: { totalAmount: 48000 },
    } as BookingInterface;

    assert.equal(getPaidAmount(paid), 48000);
    assert.equal(getPaidAmount(pending), 0);
  });

  it("aggregates revenue by service type", () => {
    const stats = new Map([
      [
        "tutoring",
        {
          totalRevenue: 48000,
          paidBookings: 1,
          totalBookings: 2,
          pendingRevenue: 30000,
        },
      ],
      [
        "childcare",
        {
          totalRevenue: 15000,
          paidBookings: 1,
          totalBookings: 1,
          pendingRevenue: 0,
        },
      ],
    ]);

    const result = aggregateRevenueStats(stats);
    assert.equal(result.totalRevenue, 63000);
    assert.equal(result.totalBookings, 3);
    assert.equal(result.paymentsByService.length, 2);
    assert.equal(result.paymentsByService[0].service, "Tutoring");
    assert.equal(result.paymentsByService[0].amount, 48000);
  });
});
