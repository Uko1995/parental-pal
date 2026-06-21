"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";
import { formatPaymentDueLabel } from "@/lib/booking-payment-due";

interface PendingInvoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  status: string;
  lineItems: ParentInvoiceLineItem[];
  totalAmount: number;
  paymentDueDate?: string;
  approval?: { submittedAt?: string };
}

export default function ParentInvoiceApprovalQueue() {
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/parent-invoices/pending");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch {
      toast.error("Failed to load pending invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/parent-invoices/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Invoice approved");
        await fetchPending();
      } else {
        const data = await res.json();
        toast.error(data.error || "Approve failed");
      }
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Enter a rejection reason");
      return;
    }
    setActionId(id);
    try {
      const res = await fetch(`/api/parent-invoices/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      });
      if (res.ok) {
        toast.success("Invoice rejected");
        setRejectingId(null);
        setRejectReason("");
        await fetchPending();
      } else {
        const data = await res.json();
        toast.error(data.error || "Reject failed");
      }
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <p className="text-base-content/60 text-center py-8">
        No invoices awaiting approval.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {invoices.map((invoice) => (
        <div
          key={invoice._id}
          className="bg-base-100 border border-base-300 rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-lg">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-base-content/70">
                Parent ID: {invoice.userId} • ₦
                {invoice.totalAmount.toLocaleString()}
                {invoice.paymentDueDate &&
                  ` • ${formatPaymentDueLabel(invoice.paymentDueDate)}`}
              </p>
            </div>
            <span className="badge badge-warning">Pending approval</span>
          </div>

          <div className="overflow-x-auto mb-4">
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
                {invoice.lineItems.map((line, i) => (
                  <tr key={i}>
                    <td>{line.date}</td>
                    <td>{line.childName}</td>
                    <td>{line.serviceType}</td>
                    <td>{line.description}</td>
                    <td>{line.quantity}</td>
                    <td>₦{line.unitPrice.toLocaleString()}</td>
                    <td>₦{line.total.toLocaleString()}</td>
                    <td>{line.sessionKind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rejectingId === invoice._id ? (
            <div className="flex flex-col gap-2">
              <textarea
                className="textarea textarea-bordered"
                placeholder="Rejection reason (required)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  disabled={actionId === invoice._id}
                  onClick={() => reject(invoice._id)}
                >
                  Confirm reject
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={actionId === invoice._id}
                onClick={() => approve(invoice._id)}
              >
                {actionId === invoice._id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Approve"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-error btn-sm"
                onClick={() => setRejectingId(invoice._id)}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
