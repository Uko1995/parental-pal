import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { BookingInterface } from "@/models/Booking";
import {
  buildPaymentReminderEmail,
  getDueDateForReminderType,
  getTargetDueDatesForToday,
  isEligibleForPaymentReminder,
  wasReminderAlreadySent,
} from "./booking-payment-reminders";

describe("booking-payment-reminders", () => {
  it("computes target due dates from today", () => {
    const today = new Date(2026, 5, 3);
    const targets = getTargetDueDatesForToday(today);
    assert.equal(targets.fourDayDue, "2026-06-07");
    assert.equal(targets.oneDayDue, "2026-06-04");
  });

  it("maps reminder types to due dates", () => {
    const today = new Date(2026, 5, 3);
    assert.equal(getDueDateForReminderType(today, "4_day"), "2026-06-07");
    assert.equal(getDueDateForReminderType(today, "1_day"), "2026-06-04");
  });

  it("detects when a reminder was already sent", () => {
    const booking = {
      paymentReminders: { fourDaySentAt: "2026-06-03" },
    } as BookingInterface;
    assert.equal(wasReminderAlreadySent(booking, "4_day"), true);
    assert.equal(wasReminderAlreadySent(booking, "1_day"), false);
  });

  it("skips ineligible bookings", () => {
    const base = {
      payment: { status: "pending" as const, paymentDueDate: "2026-06-07", paidAmount: 0 },
      pricing: { totalAmount: 15000, currency: "NGN", baseAmount: 15000 },
      status: "confirmed" as const,
    } as BookingInterface;

    assert.equal(
      isEligibleForPaymentReminder(base, "4_day", "parent@example.com").ok,
      true,
    );
    assert.equal(
      isEligibleForPaymentReminder(
        { ...base, payment: { ...base.payment, status: "paid" } },
        "4_day",
        "parent@example.com",
      ).ok,
      false,
    );
    assert.equal(
      isEligibleForPaymentReminder(
        { ...base, status: "cancelled" },
        "4_day",
        "parent@example.com",
      ).ok,
      false,
    );
    assert.equal(
      isEligibleForPaymentReminder(base, "4_day", "").ok,
      false,
    );
    assert.equal(
      isEligibleForPaymentReminder(
        {
          ...base,
          paymentReminders: { fourDaySentAt: "2026-06-03" },
        },
        "4_day",
        "parent@example.com",
      ).ok,
      false,
    );
  });

  it("builds payment reminder email content", () => {
    const booking = {
      serviceType: "tutoring",
      pricing: { totalAmount: 48000, currency: "NGN", baseAmount: 48000 },
      payment: {
        status: "pending",
        paidAmount: 0,
        paymentDueDate: "2026-06-07",
      },
    } as BookingInterface;

    const email = buildPaymentReminderEmail(booking, "Ada", 4);
    assert.match(email.subject, /Payment reminder/i);
    assert.match(email.subject, /4 days left/i);
    assert.match(email.html, /₦48,000/);
    assert.match(email.text, /Profile → Payments/i);
  });
});
