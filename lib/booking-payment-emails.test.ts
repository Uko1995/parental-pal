import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { BookingInterface } from "@/models/Booking";
import { buildBookingReceiptDetails } from "./booking-payment-emails";

describe("booking-payment-emails", () => {
  it("builds tutoring receipt details with session line items", () => {
    const booking = {
      _id: "booking-tutoring-1",
      serviceType: "tutoring",
      status: "confirmed",
      children: [{ name: "Ada", age: 10 }],
      schedule: {
        startDate: "2026-03-01",
        endDate: "2026-03-31",
      },
      serviceData: {
        hourlyRate: 12000,
        tutoringLocation: "physical",
        childrenData: [
          {
            childId: "child-1",
            subjects: ["Math", "English"],
            totalHours: 4,
            schedule: [
              {
                day: "monday",
                hours: 2,
                startTime: "10:00",
                dates: [
                  { date: "2026-03-02", startTime: "10:00" },
                  { date: "2026-03-09", startTime: "10:00" },
                ],
              },
            ],
          },
        ],
      },
      pricing: {
        totalAmount: 48000,
        currency: "NGN",
      },
      payment: {
        status: "paid",
        paidAmount: 48000,
        method: "card",
        transactionId: "T1234567890",
        paymentDate: "2026-03-01T10:00:00.000Z",
      },
    } as unknown as BookingInterface;

    const receipt = buildBookingReceiptDetails(booking, {
      reference: "T1234567890",
      amount: 48000,
      currency: "NGN",
      method: "Card Payment",
    });

    assert.match(receipt.receiptNumber, /^RCT-/);
    assert.equal(receipt.serviceType, "Tutoring");
    assert.equal(receipt.items.length, 1);
    assert.equal(receipt.items[0].quantity, 2);
    assert.match(receipt.serviceSummary, /Ada: 2 sessions/);
    assert.equal(receipt.totalAmount, 48000);
    assert.equal(receipt.currency, "₦");
  });

  it("builds receipt details for non-tutoring services", () => {
    const booking = {
      _id: "booking-childcare-1",
      serviceType: "childcare",
      status: "confirmed",
      children: [{ name: "Ben", age: 5 }],
      schedule: { startDate: "2026-03-01" },
      serviceData: {
        dailyRate: 5000,
        childrenData: [
          {
            childId: "child-1",
            careType: "daily",
            totalDays: 3,
            dropoffTime: "08:00",
            pickupTime: "15:00",
          },
        ],
      },
      pricing: { totalAmount: 15000, currency: "NGN" },
    } as unknown as BookingInterface;

    const receipt = buildBookingReceiptDetails(booking, {
      reference: "manual-123",
      amount: 15000,
      currency: "NGN",
      method: "bank transfer",
    });

    assert.equal(receipt.serviceType, "Childcare");
    assert.equal(receipt.items.length, 1);
    assert.equal(receipt.totalAmount, 15000);
  });
});
