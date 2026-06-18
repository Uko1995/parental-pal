import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { BookingInterface } from "@/models/Booking";
import { buildInvoiceLineItems } from "./booking-invoice";

function baseBooking(
  overrides: Partial<BookingInterface>,
): BookingInterface {
  return {
    userId: undefined as never,
    serviceType: "tutoring",
    parentName: "Parent",
    parentEmail: "parent@example.com",
    parentPhone: "08000000000",
    childrenCount: 1,
    children: [{ name: "Ada", age: 10 }],
    serviceData: {},
    schedule: {
      startDate: "2026-03-01",
      isRecurring: true,
      frequency: "weekly",
    },
    pricing: {
      baseAmount: 72000,
      totalAmount: 72000,
      currency: "₦",
    },
    payment: { status: "paid", paidAmount: 72000 },
    status: "confirmed",
    source: "onlineSearch",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("booking-invoice", () => {
  it("shows tutoring session count instead of quantity 1", () => {
    const booking = baseBooking({
      serviceData: {
        hourlyRate: 12000,
        tutoringLocation: "physical",
        childrenData: [
          {
            childId: "child-1",
            subjects: ["Math"],
            academicLevel: "Primary",
            totalHours: 6,
            schedule: [
              {
                day: "monday",
                hours: 1,
                startTime: "09:00",
                dates: [
                  { date: "2026-03-02", startTime: "09:00" },
                  { date: "2026-03-09", startTime: "09:00" },
                  { date: "2026-03-16", startTime: "09:00" },
                  { date: "2026-03-23", startTime: "09:00" },
                  { date: "2026-03-30", startTime: "09:00" },
                  { date: "2026-04-06", startTime: "09:00" },
                ],
              },
            ],
          },
        ],
      },
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(items.length, 1);
    assert.equal(items[0].quantity, 6);
    assert.equal(items[0].unitPrice, 12000);
    assert.equal(items[0].total, 72000);
    assert.match(items[0].description, /Mondays @ 9:00am:/);
    assert.match(items[0].description, /Mar 2, 2026; Mar 9, 2026; Mar 16, 2026/);
  });

  it("lists each tutoring session date with plural weekday labels", () => {
    const booking = baseBooking({
      serviceData: {
        hourlyRate: 13000,
        tutoringLocation: "virtual",
        childrenData: [
          {
            childId: "child-1",
            subjects: ["English Language"],
            academicLevel: "Primary",
            totalHours: 4,
            schedule: [
              {
                day: "monday",
                hours: 1,
                startTime: "09:00am",
                dates: [
                  { date: "2026-03-02", startTime: "09:00am" },
                  { date: "2026-03-09", startTime: "09:00am" },
                  { date: "2026-03-16", startTime: "09:00am" },
                  { date: "2026-03-23", startTime: "09:00am" },
                ],
              },
            ],
          },
        ],
      },
      children: [{ name: "Donald", age: 9 }],
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(
      items[0].description,
      "English Language — Donald (Virtual) — Mondays @ 09:00am: Mar 2, 2026; Mar 9, 2026; Mar 16, 2026; Mar 23, 2026",
    );
  });

  it("lists holiday camp weeks per child", () => {
    const booking = baseBooking({
      serviceType: "holiday-camps",
      pricing: { baseAmount: 60000, totalAmount: 60000, currency: "₦" },
      serviceData: {
        weeklyRate: 30000,
        campLocation: "gbagada",
        childrenData: [
          {
            childId: "child-1",
            campWeeks: [
              {
                weekNumber: 1,
                startDate: "2026-07-20",
                endDate: "2026-07-24",
              },
              {
                weekNumber: 2,
                startDate: "2026-07-27",
                endDate: "2026-07-31",
              },
            ] as Array<{
              weekNumber: number;
              startDate: string;
              endDate: string;
              dateLabel?: string;
            }>,
          },
        ],
      },
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(items[0].quantity, 2);
    assert.match(items[0].description, /Jul 20/);
    assert.match(items[0].description, /Jul 27/);
  });
});
