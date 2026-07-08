import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateBoardingCapacity,
  getBoardingCapacityError,
  isBoardingCapacityApplicable,
  isValidBoardingChild,
} from "./boarding-capacity";

describe("boarding-capacity", () => {
  it("identifies when boarding capacity applies", () => {
    assert.equal(
      isBoardingCapacityApplicable(
        "holidays-that-rock-2026",
        "gbagada",
      ),
      true,
    );
    assert.equal(
      isBoardingCapacityApplicable("holidays-that-rock-2026", "lekki"),
      false,
    );
    assert.equal(
      isBoardingCapacityApplicable("alive-in-me-easter-2026", "gbagada"),
      false,
    );
  });

  it("validates boarding child age and location", () => {
    assert.equal(isValidBoardingChild(8, "gbagada"), true);
    assert.equal(isValidBoardingChild(5, "gbagada"), false);
    assert.equal(isValidBoardingChild(8, "lekki"), false);
  });

  it("marks capacity full when used reaches 20", () => {
    const status = evaluateBoardingCapacity(20);
    assert.equal(status.isFull, true);
    assert.equal(status.remaining, 0);
  });

  it("rejects a boarding child when capacity is full", () => {
    const status = evaluateBoardingCapacity(20);
    const error = getBoardingCapacityError(status, 1);
    assert.match(error ?? "", /fully booked/);
  });

  it("rejects two boarding children when only one slot remains", () => {
    const status = evaluateBoardingCapacity(19);
    const error = getBoardingCapacityError(status, 2);
    assert.match(error ?? "", /Only 1 boarding spot/);
  });

  it("allows one boarding child when one slot remains", () => {
    const status = evaluateBoardingCapacity(19);
    assert.equal(getBoardingCapacityError(status, 1), null);
  });

  it("allows day-camp-only submissions regardless of capacity", () => {
    const status = evaluateBoardingCapacity(20);
    assert.equal(getBoardingCapacityError(status, 0), null);
  });
});
