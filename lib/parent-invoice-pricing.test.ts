import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyServiceDefaultsToLine,
  computeLineTotal,
  countHolidayCampWeeks,
  getTutoringRatesFromPricing,
  parseHoursFromDescription,
  suggestSummerCampDiscountLine,
} from "./parent-invoice-pricing";
import {
  TUTORING_PHYSICAL_FALLBACK,
  TUTORING_VIRTUAL_FALLBACK,
  type ServicePricingMap,
} from "./service-pricing";

const pricing: ServicePricingMap = {
  tutoring: {
    baseRate: TUTORING_PHYSICAL_FALLBACK,
    currency: "NGN",
    billingType: "hourly",
    virtualRate: TUTORING_VIRTUAL_FALLBACK,
    physicalRate: TUTORING_PHYSICAL_FALLBACK,
  },
  "kiddies-enrichment": {
    baseRate: 8000,
    currency: "NGN",
    billingType: "hourly",
  },
};

describe("parent-invoice-pricing", () => {
  it("computes line total from quantity and unit price", () => {
    assert.equal(computeLineTotal(2, 15000), 30000);
  });

  it("parses hours from session description", () => {
    assert.equal(parseHoursFromDescription("Monday session (2h)"), 2);
    assert.equal(parseHoursFromDescription("No hours here"), undefined);
  });

  it("uses virtual and physical tutoring rates from pricing map", () => {
    const rates = getTutoringRatesFromPricing(pricing);
    assert.equal(rates.virtual, 13000);
    assert.equal(rates.physical, 15000);
  });

  it("applies physical tutoring rate by default", () => {
    const line = applyServiceDefaultsToLine(
      {
        date: "2026-06-01",
        childName: "Ada",
        serviceType: "tutoring",
        description: "Monday session (2h)",
        quantity: 2,
        unitPrice: 0,
        total: 0,
        sessionKind: "past",
      },
      pricing,
      { tutoringLocation: "physical" },
    );
    assert.equal(line.unitPrice, 15000);
    assert.equal(line.quantity, 2);
    assert.equal(line.total, 30000);
  });

  it("applies virtual tutoring rate when selected", () => {
    const line = applyServiceDefaultsToLine(
      {
        date: "2026-06-01",
        childName: "Ada",
        serviceType: "tutoring",
        description: "Monday session (1h)",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        sessionKind: "future",
        tutoringLocation: "virtual",
      },
      pricing,
    );
    assert.equal(line.unitPrice, 13000);
    assert.equal(line.total, 13000);
  });

  it("counts holiday camp weeks across lines", () => {
    const weeks = countHolidayCampWeeks([
      {
        date: "2026-07-01",
        childName: "Ada",
        serviceType: "holiday-camps",
        description: "Week 1",
        quantity: 3,
        unitPrice: 50000,
        total: 150000,
        sessionKind: "future",
      },
      {
        date: "2026-07-08",
        childName: "Ada",
        serviceType: "holiday-camps",
        description: "Week 2",
        quantity: 3,
        unitPrice: 50000,
        total: 150000,
        sessionKind: "future",
      },
    ]);
    assert.equal(weeks, 6);
  });

  it("suggests summer camp discount when a child has 6+ weeks", () => {
    const lines = [
      {
        date: "2026-07-01",
        childName: "Ada",
        serviceType: "holiday-camps",
        description: "Summer camp weeks",
        quantity: 6,
        unitPrice: 100000,
        total: 600000,
        sessionKind: "future" as const,
      },
    ];
    const discount = suggestSummerCampDiscountLine(lines);
    assert.ok(discount);
    assert.equal(discount!.unitPrice, -42000);
    assert.equal(discount!.total, -42000);
  });
});
