import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  narrationLine,
  paymentOptionsHtml,
  paymentOptionsText,
} from "@/lib/payment-instructions";
import { DEFAULT_BANK_TRANSFER } from "@/models/PlatformSettings";

const editedBank = {
  accountName: "ParentalPal Test Ltd",
  accountNumber: "9999999999",
  bankName: "Test Bank",
  narrationHint: "Quote your booking ID",
};

describe("payment options with admin-editable bank details", () => {
  it("defaults to the seeded Wema account", () => {
    const text = paymentOptionsText();
    assert.match(text, new RegExp(DEFAULT_BANK_TRANSFER.accountNumber));
    assert.match(text, /Wema Bank/);
  });

  it("uses edited bank details and the narration reference", () => {
    const html = paymentOptionsHtml({
      bank: editedBank,
      narrationReference: "Booking #abc123",
    });
    assert.match(html, /9999999999/);
    assert.match(html, /Test Bank/);
    assert.match(html, /Booking #abc123/);
    assert.doesNotMatch(html, /0125232203/);
  });

  it("keeps both payment options", () => {
    const text = paymentOptionsText({ bank: editedBank });
    assert.match(text, /Option 1: Pay online/);
    assert.match(text, /Option 2: Direct bank transfer/);
  });

  it("falls back to the narration hint without a reference", () => {
    assert.equal(narrationLine(editedBank), "Quote your booking ID");
  });
});
