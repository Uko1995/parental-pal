"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  formatPaymentDueDateLine,
  isPaymentOverdue,
} from "@/lib/booking-payment-due";
import { canParentCancelInvoice } from "@/lib/parent-invoice";
import type {
  ParentInvoiceLineItem,
  ParentInvoiceStatus,
} from "@/models/ParentInvoice";

export interface ParentInvoiceDetails {
  _id: string;
  invoiceNumber: string;
  status: string;
  lineItems: ParentInvoiceLineItem[];
  totalAmount: number;
  subtotal?: number;
  currency: string;
  paymentDueDate?: string;
  linkedBookingId?: string;
  createdAt?: string;
  approval?: { rejectionReason?: string };
}

interface ParentInvoiceDetailsModalProps {
  invoice: ParentInvoiceDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onPay?: (invoiceId: string) => void;
  onEdit?: (invoiceId: string) => void;
  onCancel?: (invoiceId: string) => void;
  payingId?: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  tutoring: "Tutoring",
  childcare: "Childcare",
  homeschooling: "Homeschooling",
  "holiday-camps": "Holiday Camps",
  "space-rental": "Space Rental",
  "kiddies-enrichment": "Kiddies Enrichment",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-ghost",
  pending_approval: "badge-warning",
  approved: "badge-info",
  pending_payment: "badge-info",
  rejected: "badge-error",
  paid: "badge-success",
  cancelled: "badge-neutral",
};

export default function ParentInvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
  onPay,
  onEdit,
  onCancel,
  payingId,
}: ParentInvoiceDetailsModalProps) {
  if (!invoice || !isOpen) return null;

  const canCancel = canParentCancelInvoice({
    status: invoice.status as ParentInvoiceStatus,
  });
  const canEdit =
    invoice.status === "draft" || invoice.status === "rejected";
  const canPay =
    invoice.status !== "cancelled" &&
    invoice.status !== "paid" &&
    (invoice.status === "pending_payment" ||
      invoice.status === "approved" ||
      invoice.status === "pending_approval");
  const subtotal =
    invoice.subtotal ??
    invoice.lineItems.reduce((sum, line) => sum + line.total, 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 p-6 border-b border-base-300 shrink-0">
          <div>
            <h3 className="text-2xl font-bold">{invoice.invoiceNumber}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`badge ${STATUS_BADGE[invoice.status] || "badge-ghost"}`}
              >
                {invoice.status.replace(/_/g, " ")}
              </span>
              {invoice.createdAt && (
                <span className="text-sm text-base-content/60">
                  Created{" "}
                  {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {invoice.paymentDueDate && invoice.status !== "paid" && (
            <div
              className={`text-sm ${
                isPaymentOverdue(
                  invoice.paymentDueDate,
                  invoice.status === "paid" ? "paid" : "pending",
                )
                  ? "text-error font-medium"
                  : "text-base-content/70"
              }`}
            >
              {formatPaymentDueDateLine(invoice.paymentDueDate)}
            </div>
          )}

          {invoice.status === "rejected" && invoice.approval?.rejectionReason && (
            <p className="text-sm text-error">
              Rejected: {invoice.approval.rejectionReason}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Child</th>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                  <th>Kind</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((line, index) => (
                  <tr key={index}>
                    <td>{line.date || "—"}</td>
                    <td>{line.childName}</td>
                    <td>
                      {SERVICE_LABELS[line.serviceType] || line.serviceType}
                    </td>
                    <td className="max-w-xs truncate" title={line.description}>
                      {line.description || "—"}
                    </td>
                    <td>{line.quantity}</td>
                    <td>₦{line.unitPrice.toLocaleString()}</td>
                    <td>₦{line.total.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge badge-xs ${
                          line.sessionKind === "future"
                            ? "badge-info"
                            : "badge-neutral"
                        }`}
                      >
                        {line.sessionKind}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1 text-sm">
            <p className="text-base-content/70">
              Subtotal: ₦{subtotal.toLocaleString()}
            </p>
            <p className="text-lg font-bold">
              Invoice total: ₦{invoice.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-6 border-t border-base-300 shrink-0">
          {canEdit && onEdit && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onEdit(invoice._id)}
            >
              Edit
            </button>
          )}
          {canPay && onPay && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={payingId === invoice._id}
              onClick={() => onPay(invoice._id)}
            >
              {payingId === invoice._id ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Pay now"
              )}
            </button>
          )}
          {canCancel && onCancel && (
            <button
              type="button"
              className="btn btn-outline btn-error btn-sm"
              onClick={() => onCancel(invoice._id)}
            >
              Cancel invoice
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
