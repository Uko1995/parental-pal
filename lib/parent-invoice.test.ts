import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateParentInvoiceLineItems,
  canParentCancelInvoice,
  getParentCancelInvoiceBlockReason,
} from "./parent-invoice";
import type { ParentInvoiceStatus } from "@/models/ParentInvoice";

describe("parent-invoice validation", () => {
  it("allows past sessions without a date", () => {
    const result = validateParentInvoiceLineItems([
      {
        date: "",
        childName: "Ada",
        serviceType: "tutoring",
        description: "",
        quantity: 3,
        unitPrice: 15000,
        total: 45000,
        sessionKind: "past",
      },
    ]);
    assert.equal(result.ok, true);
  });

  it("requires a date for future sessions", () => {
    const result = validateParentInvoiceLineItems([
      {
        date: "",
        childName: "Ada",
        serviceType: "tutoring",
        description: "Monday session (2h)",
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
        sessionKind: "future",
      },
    ]);
    assert.equal(result.ok, false);
    assert.match(result.errors.join(" "), /session date is required/i);
  });

  it("requires session details for future sessions", () => {
    const result = validateParentInvoiceLineItems([
      {
        date: "2026-07-01",
        childName: "Ada",
        serviceType: "tutoring",
        description: "",
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
        sessionKind: "future",
      },
    ]);
    assert.equal(result.ok, false);
    assert.match(result.errors.join(" "), /session details are required/i);
  });
});

describe("canParentCancelInvoice", () => {
  const cancellable: ParentInvoiceStatus[] = [
    "draft",
    "pending_payment",
    "approved",
    "pending_approval",
    "rejected",
  ];

  for (const status of cancellable) {
    it(`allows cancel for ${status}`, () => {
      assert.equal(canParentCancelInvoice({ status }), true);
      assert.equal(getParentCancelInvoiceBlockReason({ status }), null);
    });
  }

  it("blocks paid invoices", () => {
    assert.equal(canParentCancelInvoice({ status: "paid" }), false);
    assert.match(
      getParentCancelInvoiceBlockReason({ status: "paid" }) || "",
      /paid/i,
    );
  });

  it("blocks already cancelled invoices", () => {
    assert.equal(canParentCancelInvoice({ status: "cancelled" }), false);
    assert.match(
      getParentCancelInvoiceBlockReason({ status: "cancelled" }) || "",
      /already cancelled/i,
    );
  });

  it("blocks when payment record is paid", () => {
    assert.equal(
      canParentCancelInvoice({
        status: "pending_payment",
        payment: { status: "paid" },
      }),
      false,
    );
  });
});
