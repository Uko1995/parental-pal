import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isBookingPaymentReceived } from "./booking-payment-policy";
import { pdfFilename } from "./download-html-document";

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

  it("saves invoices and receipts with a pdf extension", () => {
    assert.equal(pdfFilename("Invoice-INV-1.html"), "Invoice-INV-1.pdf");
    assert.equal(pdfFilename("Receipt-1"), "Receipt-1.pdf");
  });
});
