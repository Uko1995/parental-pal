import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPhoneE164,
  isValidInternationalPhone,
  parseStoredPhone,
} from "./phone";

describe("phone numbers", () => {
  it("drops a Nigerian trunk 0 and formats E.164", () => {
    assert.equal(formatPhoneE164("NG", "08012345678"), "+2348012345678");
    assert.equal(isValidInternationalPhone("+2348012345678"), true);
  });

  it("formats a UK number", () => {
    assert.equal(formatPhoneE164("GB", "02079460958"), "+442079460958");
    const parsed = parseStoredPhone("+442079460958");
    assert.equal(parsed.country, "GB");
    assert.equal(parsed.nationalNumber, "2079460958");
  });

  it("formats a US number", () => {
    assert.equal(formatPhoneE164("US", "2025550123"), "+12025550123");
    assert.equal(parseStoredPhone("+12025550123").country, "US");
  });

  it("rejects a too-short number", () => {
    assert.equal(isValidInternationalPhone("+23480"), false);
    assert.equal(isValidInternationalPhone("8012345678"), false);
  });

  it("resolves a legacy 080 number to Nigeria", () => {
    const parsed = parseStoredPhone("08000000000");
    assert.equal(parsed.country, "NG");
    assert.equal(parsed.nationalNumber, "8000000000");
  });
});
