"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ParentInvoiceBuilder from "./ParentInvoiceBuilder";
import { initializeParentInvoicePayment } from "@/lib/booking-payment";
import {
  formatPaymentDueDateLine,
  isPaymentOverdue,
} from "@/lib/booking-payment-due";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";

interface ParentInvoice {
  _id: string;
  invoiceNumber: string;
  status: string;
  lineItems: ParentInvoiceLineItem[];
  totalAmount: number;
  currency: string;
  paymentDueDate?: string;
  linkedBookingId?: string;
  approval?: { rejectionReason?: string };
}

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-ghost",
  pending_approval: "badge-warning",
  approved: "badge-info",
  pending_payment: "badge-info",
  rejected: "badge-error",
  paid: "badge-success",
  cancelled: "badge-neutral",
};

export default function ParentInvoicesSection() {
  const [invoices, setInvoices] = useState<ParentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/parent-invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const saveInvoice = async (
    lineItems: ParentInvoiceLineItem[],
    invoiceId?: string,
  ) => {
    setSaving(true);
    try {
      const url = invoiceId
        ? `/api/parent-invoices/${invoiceId}`
        : "/api/parent-invoices";
      const res = await fetch(url, {
        method: invoiceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.errors?.join(", ") || data.error || "Save failed");
        return;
      }
      toast.success("Invoice saved");
      setShowBuilder(false);
      setEditingId(null);
      await fetchInvoices();
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async (
    lineItems: ParentInvoiceLineItem[],
    invoiceId?: string,
  ) => {
    let id = invoiceId;
    if (!id) {
      setSaving(true);
      const res = await fetch("/api/parent-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        toast.error(data.errors?.join(", ") || "Could not create invoice");
        return;
      }
      id = data.invoice?._id;
    } else {
      await saveInvoice(lineItems, id);
    }

    if (!id) return;

    const res = await fetch(`/api/parent-invoices/${id}/submit`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Submitted for admin approval");
      setShowBuilder(false);
      setEditingId(null);
      await fetchInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Submit failed");
    }
  };

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    const result = await initializeParentInvoicePayment(invoiceId, {
      toastId: `pay-invoice-${invoiceId}`,
    });
    if (!result.ok) setPayingId(null);
  };

  const editingInvoice = editingId
    ? invoices.find((i) => i._id === editingId)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-[#90AC19]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Session Invoices
          </h2>
          <p className="text-sm text-base-content/70 mt-1">
            Add past sessions manually, optionally include future sessions, and
            submit for admin approval before paying.
          </p>
        </div>
        {!showBuilder && !editingId && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowBuilder(true)}
          >
            New invoice
          </button>
        )}
      </div>

      {(showBuilder || editingInvoice) && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-6">
          <h3 className="font-semibold mb-4">
            {editingInvoice ? "Edit invoice" : "Build invoice"}
          </h3>
          <ParentInvoiceBuilder
            linkedBookingId={editingInvoice?.linkedBookingId}
            initialLineItems={editingInvoice?.lineItems}
            saving={saving}
            onSave={(items) =>
              saveInvoice(items, editingInvoice?._id)
            }
            onSubmitForApproval={(items) =>
              submitForApproval(items, editingInvoice?._id)
            }
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-4"
            onClick={() => {
              setShowBuilder(false);
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {invoices.length === 0 && !showBuilder ? (
        <p className="text-base-content/60 text-center py-8">
          No session invoices yet.
        </p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice._id}
              className="bg-base-100 border border-base-300 rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-base-content/70">
                    {invoice.lineItems.length} line
                    {invoice.lineItems.length !== 1 ? "s" : ""} • ₦
                    {invoice.totalAmount.toLocaleString()}
                  </p>
                  {invoice.paymentDueDate && invoice.status !== "paid" && (
                    <div
                      className={`text-xs mt-1 leading-snug break-words max-w-full ${
                        isPaymentOverdue(
                          invoice.paymentDueDate,
                          invoice.status === "paid" ? "paid" : "pending",
                        )
                          ? "text-error font-medium"
                          : "text-base-content/60"
                      }`}
                    >
                      {formatPaymentDueDateLine(invoice.paymentDueDate)}
                      {!isPaymentOverdue(
                        invoice.paymentDueDate,
                        invoice.status === "paid" ? "paid" : "pending",
                      ) && (
                        <span className="block text-base-content/50 mt-0.5">
                          Due 5 days before your last session
                        </span>
                      )}
                    </div>
                  )}
                  {invoice.status === "rejected" &&
                    invoice.approval?.rejectionReason && (
                      <p className="text-sm text-error mt-2">
                        Rejected: {invoice.approval.rejectionReason}
                      </p>
                    )}
                </div>
                <span
                  className={`badge ${STATUS_BADGE[invoice.status] || "badge-ghost"}`}
                >
                  {invoice.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {(invoice.status === "draft" ||
                  invoice.status === "rejected") && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setEditingId(invoice._id);
                      setShowBuilder(false);
                    }}
                  >
                    Edit
                  </button>
                )}
                {(invoice.status === "pending_payment" ||
                  invoice.status === "approved") && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={payingId === invoice._id}
                    onClick={() => handlePay(invoice._id)}
                  >
                    {payingId === invoice._id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Pay now"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
