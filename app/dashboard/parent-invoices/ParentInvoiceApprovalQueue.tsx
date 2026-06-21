"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";
import { formatPaymentDueLabel } from "@/lib/booking-payment-due";

interface SubmittedInvoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  status: string;
  lineItems: ParentInvoiceLineItem[];
  totalAmount: number;
  paymentDueDate?: string;
  approval?: { submittedAt?: string };
}

const SERVICE_LABELS: Record<string, string> = {
  tutoring: "Tutoring",
  childcare: "Childcare",
  homeschooling: "Homeschooling",
  "holiday-camps": "Holiday Camps",
  "space-rental": "Space Rental",
  "kiddies-enrichment": "Kiddies Enrichment",
};

export default function ParentInvoiceApprovalQueue() {
  const [invoices, setInvoices] = useState<SubmittedInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmitted = async () => {
    try {
      const res = await fetch("/api/parent-invoices/pending");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch {
      toast.error("Failed to load submitted invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmitted();
  }, []);

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
        No submitted invoices awaiting payment.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-base-content/70">
        Parents submit invoices directly for payment. This list is for review
        only — approval is not required before they pay.
      </p>
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
            <span className="badge badge-info">
              {invoice.status === "pending_approval"
                ? "Legacy pending approval"
                : "Awaiting payment"}
            </span>
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
                    <td>
                      {SERVICE_LABELS[line.serviceType] || line.serviceType}
                    </td>
                    <td>{line.description}</td>
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
        </div>
      ))}
    </div>
  );
}
