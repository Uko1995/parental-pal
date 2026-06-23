import type {
  ParentInvoiceInterface,
  ParentInvoiceLineItem,
} from "@/models/ParentInvoice";
import { computeInvoicePaymentDueDate } from "@/lib/booking-payment-due";

export function generateParentInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PINV-${timestamp}-${random}`;
}

export function calculateParentInvoiceTotals(lineItems: ParentInvoiceLineItem[]) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  return {
    subtotal,
    totalAmount: subtotal,
    currency: "NGN" as const,
    paymentDueDate: computeInvoicePaymentDueDate(lineItems),
  };
}

export function validateParentInvoiceLineItems(
  lineItems: ParentInvoiceLineItem[],
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!lineItems.length) {
    errors.push("Add at least one session line item");
  }

  lineItems.forEach((item, index) => {
    const row = index + 1;
    // Past sessions are already completed, so a date is optional. Future
    // sessions still need a date to compute the payment due date.
    if (item.sessionKind === "future" && !item.date)
      errors.push(`Line ${row}: date is required`);
    if (!item.childName?.trim())
      errors.push(`Line ${row}: child name is required`);
    if (!item.serviceType?.trim())
      errors.push(`Line ${row}: service type is required`);
    if (!item.description?.trim())
      errors.push(`Line ${row}: description is required`);
    if (!Number.isFinite(item.quantity) || item.quantity <= 0)
      errors.push(`Line ${row}: quantity must be greater than 0`);
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0)
      errors.push(`Line ${row}: unit price is invalid`);
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.total - expectedTotal) > 0.01) {
      errors.push(`Line ${row}: total must equal quantity × unit price`);
    }
  });

  return { ok: errors.length === 0, errors };
}

export function validatePastOnlyLineItems(
  lineItems: ParentInvoiceLineItem[],
): { ok: boolean; errors: string[] } {
  const base = validateParentInvoiceLineItems(lineItems);
  if (!base.ok) {
    return base;
  }

  const errors: string[] = [];
  lineItems.forEach((item, index) => {
    if (item.sessionKind !== "past") {
      errors.push(`Line ${index + 1}: only past sessions are allowed`);
    }
  });

  return { ok: errors.length === 0, errors };
}

export function normalizeParentInvoiceLineItem(
  raw: Partial<ParentInvoiceLineItem>,
): ParentInvoiceLineItem {
  const quantity = Number(raw.quantity) || 0;
  const unitPrice = Number(raw.unitPrice) || 0;
  return {
    date: String(raw.date || ""),
    childName: String(raw.childName || "").trim(),
    serviceType: String(raw.serviceType || "").trim(),
    description: String(raw.description || "").trim(),
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    sessionKind: raw.sessionKind === "future" ? "future" : "past",
  };
}

const CANCELLABLE_INVOICE_STATUSES = new Set([
  "draft",
  "pending_payment",
  "paid",
  "cancelled",
]);

export function canParentCancelInvoice(
  invoice: Pick<ParentInvoiceInterface, "status" | "payment">,
): boolean {
  if (invoice.status === "cancelled" || invoice.status === "paid") {
    return false;
  }
  if (invoice.payment?.status === "paid") {
    return false;
  }
  return CANCELLABLE_INVOICE_STATUSES.has(invoice.status);
}

export function getParentCancelInvoiceBlockReason(
  invoice: Pick<ParentInvoiceInterface, "status" | "payment">,
): string | null {
  if (invoice.status === "cancelled") {
    return "Invoice is already cancelled";
  }
  if (invoice.status === "paid" || invoice.payment?.status === "paid") {
    return "Cannot cancel a paid invoice";
  }
  if (!canParentCancelInvoice(invoice)) {
    return "This invoice cannot be cancelled";
  }
  return null;
}
