import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { emailTemplates } from "./email-service";
import { BANK_TRANSFER_DETAILS } from "./payment-instructions";

function assertPaymentOptions(html: string, text?: string) {
  for (const value of [
    BANK_TRANSFER_DETAILS.accountNumber,
    BANK_TRANSFER_DETAILS.bankName,
    BANK_TRANSFER_DETAILS.accountName,
    "Paystack checkout",
    "official contact channels",
    "+234 806 539 4795",
  ]) {
    assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    if (text) {
      assert.match(text, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
}

describe("bookingConfirmation drive folder section", () => {
  it("includes drive folder section when driveFolderUrl is provided", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "holiday-camps",
      driveFolderUrl: "https://drive.google.com/drive/folders/test-folder",
    });

    assert.match(html, /Holiday Camp Folder/);
    assert.match(html, /handbook, camp materials, and photos/);
    assert.match(html, /test-folder/);
    assert.match(text ?? "", /Holiday Camp Folder: https:\/\/drive\.google\.com\/drive\/folders\/test-folder/);
  });

  it("omits drive folder section when driveFolderUrl is absent", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "holiday-camps",
    });

    assert.doesNotMatch(html, /Holiday Camp Folder/);
    assert.doesNotMatch(text ?? "", /Holiday Camp Folder:/);
  });

  it("includes Paystack and bank transfer options when payment is unpaid", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "tutoring",
      payment: { status: "pending" },
    });

    assert.match(html, /Your booking is confirmed/);
    assertPaymentOptions(html, text);
  });

  it("omits bank transfer details when the booking is already paid", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "tutoring",
      payment: { status: "paid" },
    });

    assert.match(html, /fully confirmed and paid/);
    assert.doesNotMatch(html, /0125232203/);
    assert.doesNotMatch(text ?? "", /0125232203/);
  });
});

describe("payment request copy", () => {
  it("includes Paystack checkout and bank transfer on payment reminders", () => {
    const { html, text } = emailTemplates.paymentReminder({
      parentName: "Jane Doe",
      serviceLabel: "Tutoring",
      amount: 15000,
      dueDate: "2026-10-01",
      dueLine: "Payment is due 5 days before your last session",
      daysRemaining: 4,
      profileUrl: "https://example.com/profile?tab=payments",
    });

    assert.match(html, /Pay from Profile/);
    assertPaymentOptions(html, text);
  });

  it("includes Paystack checkout and bank transfer on invoices", () => {
    const { html, text } = emailTemplates.invoice("Jane Doe", {
      invoiceNumber: "INV-1",
      bookingId: "booking-1",
      invoiceDate: new Date("2026-09-25"),
      dueDate: new Date("2026-10-02"),
      serviceType: "tutoring",
      children: [],
      items: [
        {
          description: "Tutoring",
          quantity: 1,
          unitPrice: 15000,
          total: 15000,
        },
      ],
      subtotal: 15000,
      totalAmount: 15000,
      currency: "₦",
    });

    assert.match(html, /Payment Instructions/);
    assertPaymentOptions(html, text);
  });
});
