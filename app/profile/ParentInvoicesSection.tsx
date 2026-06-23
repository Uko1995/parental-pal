"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ParentInvoiceBuilder, {
  type BookingPricingContext,
} from "@/components/parent-invoices/ParentInvoiceBuilder";
import ParentInvoiceDetailsModal, {
  type ParentInvoiceDetails,
} from "./ParentInvoiceDetailsModal";
import { initializeParentInvoicePayment } from "@/lib/booking-payment";
import {
  formatPaymentDueDateLine,
  isPaymentOverdue,
} from "@/lib/booking-payment-due";
import { canParentCancelInvoice } from "@/lib/parent-invoice";
import type {
  ParentInvoiceLineItem,
  ParentInvoiceStatus,
} from "@/models/ParentInvoice";

interface ParentInvoice extends Omit<ParentInvoiceDetails, "status"> {
  status: ParentInvoiceStatus;
}

interface BookingOption {
  _id: string;
  serviceType: string;
  status: string;
  schedule?: { startDate?: string };
  children?: Array<{ name: string }>;
  serviceData?: Record<string, unknown>;
  pricing?: {
    discount?: { type: string; value: number; reason?: string };
  };
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

export default function ParentInvoicesSection() {
  const [invoices, setInvoices] = useState<ParentInvoice[]>([]);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        const list = (data.bookings || data || []) as BookingOption[];
        setBookings(
          list.filter(
            (b) =>
              b.status !== "cancelled" &&
              b.status !== "completed" &&
              b.status !== "in-progress",
          ),
        );
      }
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchBookings();
  }, []);

  const activeBookingId = editingId
    ? invoices.find((i) => i._id === editingId)?.linkedBookingId
    : selectedBookingId || undefined;

  const selectedBooking = bookings.find((b) => b._id === activeBookingId);

  const bookingContext: BookingPricingContext | undefined = selectedBooking
    ? {
        hourlyRate: selectedBooking.serviceData?.hourlyRate as
          | number
          | undefined,
        tutoringLocation: selectedBooking.serviceData?.tutoringLocation as
          | "virtual"
          | "physical"
          | undefined,
        virtualRate: selectedBooking.serviceData?.virtualRate as
          | number
          | undefined,
        physicalRate: selectedBooking.serviceData?.physicalRate as
          | number
          | undefined,
        serviceData: selectedBooking.serviceData,
      }
    : undefined;

  const saveInvoice = async (
    lineItems: ParentInvoiceLineItem[],
    linkedBookingId?: string,
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
        body: JSON.stringify({
          lineItems,
          linkedBookingId: linkedBookingId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.errors?.join(", ") || data.error || "Save failed");
        return false;
      }
      toast.success("Invoice saved");
      setShowBuilder(false);
      setEditingId(null);
      setSelectedBookingId("");
      await fetchInvoices();
      return true;
    } finally {
      setSaving(false);
    }
  };

  const submitInvoice = async (
    lineItems: ParentInvoiceLineItem[],
    linkedBookingId?: string,
    invoiceId?: string,
  ) => {
    let id = invoiceId;
    if (!id) {
      setSaving(true);
      const res = await fetch("/api/parent-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          linkedBookingId: linkedBookingId || undefined,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        toast.error(data.errors?.join(", ") || "Could not create invoice");
        return;
      }
      id = data.invoice?._id;
    } else {
      const saved = await saveInvoice(lineItems, linkedBookingId, id);
      if (!saved) return;
    }

    if (!id) return;

    const res = await fetch(`/api/parent-invoices/${id}/submit`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Invoice submitted — you can pay now");
      setShowBuilder(false);
      setEditingId(null);
      setSelectedBookingId("");
      await fetchInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || data.errors?.join(", ") || "Submit failed");
    }
  };

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    const result = await initializeParentInvoicePayment(invoiceId, {
      toastId: `pay-invoice-${invoiceId}`,
    });
    if (!result.ok) setPayingId(null);
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    setCancellingId(invoiceId);
    try {
      const res = await fetch(`/api/parent-invoices/${invoiceId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not cancel invoice");
        return;
      }
      toast.success("Invoice cancelled");
      setCancelConfirmId(null);
      setViewingInvoiceId(null);
      await fetchInvoices();
    } catch {
      toast.error("Could not cancel invoice");
    } finally {
      setCancellingId(null);
    }
  };

  const editingInvoice = editingId
    ? invoices.find((i) => i._id === editingId)
    : null;

  const viewingInvoice = viewingInvoiceId
    ? (invoices.find((i) => i._id === viewingInvoiceId) ?? null)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-[#90AC19]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Session Invoices
          </h2>
          <p className="text-sm text-base-content/70 mt-1 max-w-2xl">
            Add <strong>past sessions</strong> your child has already attended,
            and <strong>future sessions</strong> that are coming up. Link a
            booking to import upcoming sessions and use your booked rates, then
            submit and pay.
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
        <div className="bg-base-100 border border-base-300 rounded-xl p-6 max-w-full overflow-hidden">
          <h3 className="font-semibold mb-4">
            {editingInvoice ? "Edit invoice" : "Build invoice"}
          </h3>

          <div className="mb-6 max-w-md">
            <label className="text-sm font-medium text-base-content/80">
              Link to booking (optional)
            </label>
            <p className="text-xs text-base-content/60 mb-2">
              Link a booking to import future sessions and apply your booked
              rates and discounts.
            </p>
            <select
              className="select select-bordered select-sm w-full"
              value={editingInvoice?.linkedBookingId ?? selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              disabled={!!editingInvoice?.linkedBookingId && !!editingId}
            >
              <option value="">No linked booking</option>
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {SERVICE_LABELS[b.serviceType] || b.serviceType}
                  {b.children?.[0]?.name ? ` — ${b.children[0].name}` : ""}
                  {b.schedule?.startDate
                    ? ` (${b.schedule.startDate})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <ParentInvoiceBuilder
            linkedBookingId={activeBookingId}
            bookingContext={bookingContext}
            initialLineItems={editingInvoice?.lineItems}
            saving={saving}
            onSave={async (items, linkedId) => {
              await saveInvoice(items, linkedId, editingId ?? undefined);
            }}
            onSubmitInvoice={(items, linkedId) =>
              submitInvoice(items, linkedId, editingId ?? undefined)
            }
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-4"
            onClick={() => {
              setShowBuilder(false);
              setEditingId(null);
              setSelectedBookingId("");
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
          {invoices.map((invoice: ParentInvoice) => (
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
                        isPaymentOverdue(invoice.paymentDueDate, "pending")
                          ? "text-error font-medium"
                          : "text-base-content/60"
                      }`}
                    >
                      {formatPaymentDueDateLine(invoice.paymentDueDate)}
                      {!isPaymentOverdue(invoice.paymentDueDate, "pending") && (
                        <span className="block text-base-content/50 mt-0.5">
                          Due 5 days before your last session
                        </span>
                      )}
                    </div>
                  )}
                  
                </div>
                <span
                  className={`badge ${STATUS_BADGE[invoice.status] || "badge-ghost"}`}
                >
                  {invoice.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setViewingInvoiceId(invoice._id)}
                >
                  View
                </button>
                {(invoice.status === "draft") && (
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
                {(invoice.status === "pending_payment") && (
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
                {canParentCancelInvoice({ status: invoice.status }) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-error btn-sm"
                    onClick={() => setCancelConfirmId(invoice._id)}
                  >
                    Cancel invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ParentInvoiceDetailsModal
        invoice={viewingInvoice}
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoiceId(null)}
        onPay={handlePay}
        onEdit={(id) => {
          setViewingInvoiceId(null);
          setEditingId(id);
          setShowBuilder(false);
        }}
        onCancel={(id) => setCancelConfirmId(id)}
        payingId={payingId}
      />

      {cancelConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold">Cancel invoice?</h3>
            <p className="text-sm text-base-content/70 mt-2">
              This invoice will be cancelled and cannot be paid.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={cancellingId === cancelConfirmId}
                onClick={() => setCancelConfirmId(null)}
              >
                Keep invoice
              </button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                disabled={cancellingId === cancelConfirmId}
                onClick={() => handleCancelInvoice(cancelConfirmId)}
              >
                {cancellingId === cancelConfirmId ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Cancel invoice"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
