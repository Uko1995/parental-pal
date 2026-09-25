import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isBookingPaymentReceived } from "./booking-payment-policy";
import { buildDownloadDocumentHtml } from "./download-html-document";

describe("booking documents", () => {
  it("treats a confirmed unpaid booking as an invoice", () => {
    assert.equal(
      isBookingPaymentReceived({ payment: { status: "pending" } }),
      false,
    );
  });

  it("treats a paid booking as a receipt", () => {
    assert.equal(
      isBookingPaymentReceived({ payment: { status: "paid" } }),
      true,
    );
  });

  it("wraps invoice markup in a downloadable document", () => {
    const html = buildDownloadDocumentHtml("Invoice INV-1", "<h1>Invoice</h1>");
    assert.match(html, /<title>Invoice INV-1<\/title>/);
    assert.match(html, /<h1>Invoice<\/h1>/);
  });
});
