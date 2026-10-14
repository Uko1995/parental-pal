import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatBankTransferHtml,
  formatBankTransferText,
  formatNarrationLine,
  formatPaymentOptionsHtml,
  formatPaymentOptionsText,
} from "@/lib/bank-transfer-details";
import { DEFAULT_BANK_TRANSFER } from "@/models/PlatformSettings";

describe("bank-transfer-details", () => {
  it("includes account number and narration reference in text", () => {
    const text = formatBankTransferText(DEFAULT_BANK_TRANSFER, {
      narrationReference: "Booking #abc123",
    });
    assert.match(text, /0125232203/);
    assert.match(text, /Wema Bank/);
    assert.match(text, /ParentalPal Ltd/);
    assert.match(text, /Booking #abc123/);
  });

  it("includes account details in HTML", () => {
    const html = formatBankTransferHtml(DEFAULT_BANK_TRANSFER, {
      narrationReference: "INV-2026-001",
    });
    assert.match(html, /0125232203/);
    assert.match(html, /Option 2: Direct bank transfer/);
    assert.match(html, /INV-2026-001/);
  });

  it("combined options keep login-to-pay and bank transfer", () => {
    const html = formatPaymentOptionsHtml(DEFAULT_BANK_TRANSFER, {
      narrationReference: "#booking1",
      profileUrl: "https://example.com/profile?tab=payments",
    });
    assert.match(html, /Option 1: Pay online/);
    assert.match(html, /Option 2: Direct bank transfer/);
    assert.match(html, /profile\?tab=payments/);

    const text = formatPaymentOptionsText(DEFAULT_BANK_TRANSFER, {
      narrationReference: "#booking1",
    });
    assert.match(text, /Option 1/);
    assert.match(text, /Option 2/);
  });

  it("falls back to narration hint when no reference", () => {
    const line = formatNarrationLine(DEFAULT_BANK_TRANSFER);
    assert.match(line, /booking ID or service/i);
  });
});
