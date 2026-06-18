import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addCalendarMonths,
  addDays,
  countChildcareMonthDays,
  formatLocalDate,
  getWeekdayDatesInMonth,
  inclusiveDayCount,
  parseDateString,
  shiftDateRangeByMonths,
} from "./booking-calendar";

describe("booking-calendar", () => {
  it("formats local dates without UTC shift", () => {
    const date = new Date(2026, 2, 15, 23, 30, 0);
    assert.equal(formatLocalDate(date), "2026-03-15");
  });

  it("counts Monday sessions in March 2026 from the 1st", () => {
    const dates = getWeekdayDatesInMonth("monday", "2026-03-01");
    assert.equal(dates.length, 5);
    assert.equal(dates[0], "2026-03-02");
    assert.equal(dates[dates.length - 1], "2026-03-30");
  });

  it("starts weekday sessions on or after a mid-month start date", () => {
    const dates = getWeekdayDatesInMonth("wednesday", "2026-03-18");
    assert.deepEqual(dates, ["2026-03-18", "2026-03-25"]);
  });

  it("snaps Jan 31 forward one month to Feb 28 in a non-leap year", () => {
    assert.equal(addCalendarMonths("2025-01-31", 1), "2025-02-28");
  });

  it("preserves inclusive range length when shifting months", () => {
    const shifted = shiftDateRangeByMonths("2026-07-20", "2026-07-24", 1);
    assert.equal(inclusiveDayCount(shifted.startDate, shifted.endDate), 5);
    assert.equal(shifted.startDate, "2026-08-20");
    assert.equal(shifted.endDate, "2026-08-24");
  });

  it("does not collapse short ranges that would clamp to the same day", () => {
    const shifted = shiftDateRangeByMonths("2025-01-28", "2025-01-31", 1);
    assert.equal(inclusiveDayCount(shifted.startDate, shifted.endDate), 4);
    assert.equal(shifted.startDate, "2025-02-28");
    assert.equal(shifted.endDate, addDays("2025-02-28", 3));
  });

  it("counts childcare month days for February 2026", () => {
    assert.equal(countChildcareMonthDays("2026-02-01"), 24);
  });

  it("parses ISO date strings in local time", () => {
    const parsed = parseDateString("2026-04-07");
    assert.equal(parsed.getFullYear(), 2026);
    assert.equal(parsed.getMonth(), 3);
    assert.equal(parsed.getDate(), 7);
  });
});
