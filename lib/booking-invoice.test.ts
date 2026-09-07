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

  it("rebuilds homeschool invoice lines from the stored price breakdown", () => {
    const booking = baseBooking({
      serviceType: "homeschooling",
      pricing: { baseAmount: 680000, totalAmount: 680000, currency: "₦" },
      children: [{ name: "Zara", age: 7 }],
      serviceData: {
        childrenData: [{ childId: "child-1", track: "gradeSchool" }],
        homeschoolLines: [
          {
            childId: "child-1",
            childName: "Child #1",
            track: "gradeSchool",
            code: "tuition",
            description: "Grade School tuition — Child #1",
            quantity: 2,
            unitPrice: 300000,
            total: 600000,
          },
          {
            childId: "child-1",
            childName: "Child #1",
            track: "gradeSchool",
            code: "learningMaterials",
            description: "Learning materials — Child #1",
            quantity: 1,
            unitPrice: 80000,
            total: 80000,
          },
        ],
      },
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(items.length, 2);
    assert.equal(items[0].quantity, 2);
    assert.equal(items[0].total, 600000);
    assert.match(items[0].description, /Zara/);
    assert.equal(items[1].total, 80000);
    assert.equal(
      items.reduce((sum, item) => sum + item.total, 0),
      booking.pricing.totalAmount,
    );
  });

  it("multiplies legacy homeschool bookings by their term count", () => {
    const booking = baseBooking({
      serviceType: "homeschooling",
      pricing: { baseAmount: 500000, totalAmount: 500000, currency: "₦" },
      children: [{ name: "Zara", age: 7 }],
      serviceData: {
        termRate: 250000,
        childrenData: [
          {
            childId: "child-1",
            selectedSubjects: ["Mathematics"],
            gradeLevel: "Primary 1-3 (Ages 6-9)",
            selectedTerms: ["first", "second"],
          },
        ],
      },
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(items[0].quantity, 2);
    assert.equal(items[0].total, 500000);
  });

  it("prices creche care by cadence from the stored breakdown", () => {
    const booking = baseBooking({
      serviceType: "homeschooling",
      pricing: { baseAmount: 75000, totalAmount: 75000, currency: "₦" },
      children: [{ name: "Tobi", age: 2 }],
      serviceData: {
        childrenData: [
          {
            childId: "child-1",
            track: "creche",
            crecheCadence: "week",
            crecheQuantity: 3,
          },
        ],
        homeschoolLines: [
          {
            childId: "child-1",
            childName: "Child #1",
            track: "creche",
            code: "crecheCare",
            description: "Creche care — Child #1 (3 weeks)",
            quantity: 3,
            unitPrice: 25000,
            total: 75000,
          },
        ],
      },
    });

    const items = buildInvoiceLineItems(booking);
    assert.equal(items[0].quantity, 3);
    assert.equal(items[0].unitPrice, 25000);
    assert.match(items[0].description, /Tobi/);
  });
});
