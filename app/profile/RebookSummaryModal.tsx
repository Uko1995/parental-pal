"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPaymentDueToastMessage } from "@/lib/booking-payment-due";

interface RebookSummaryModalProps {
  bookingId: string;
  serviceLabel: string;
  childrenSummary: string;
  targetMonthLabel: string;
  scheduleSummary?: string;
  pricePreview: { totalAmount: number; currency: string };
  onClose: () => void;
}

export default function RebookSummaryModal({
  bookingId,
  serviceLabel,
  childrenSummary,
  targetMonthLabel,
  scheduleSummary,
  pricePreview,
  onClose,
}: RebookSummaryModalProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "NGN") return `₦${amount.toLocaleString()}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleConfirm = async () => {
    setLoading(true);
    toast.loading("Creating your booking...", { id: "rebook-submit" });

    try {
      const res = await fetch(`/api/bookings/${bookingId}/rebook`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.bookingId) {
        toast.dismiss("rebook-submit");
        toast.error(data.error || "Re-book failed");
        return;
      }

      toast.dismiss("rebook-submit");
      toast.success(
        data.paymentDueDate
          ? formatPaymentDueToastMessage(data.paymentDueDate, "Re-book confirmed")
          : "Re-book confirmed. Pay from Profile → Payments.",
        { duration: 5000 },
      );
      window.location.href = "/profile?tab=bookings&rebooked=1";
    } catch (error) {
      console.error("Rebook confirm error:", error);
      toast.dismiss("rebook-submit");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-2">Re-book for {targetMonthLabel}</h3>
        <p className="text-sm text-base-content/70 mb-4">
          We&apos;ll copy your last booking with updated dates. Promo codes are
          not applied on quick re-book — use Edit &amp; re-book to add one.
        </p>

        <dl className="space-y-2 text-sm mb-4">
          <div className="flex justify-between gap-4">
            <dt className="text-base-content/70">Service</dt>
            <dd className="font-medium text-right">{serviceLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-base-content/70">Children</dt>
            <dd className="font-medium text-right">{childrenSummary}</dd>
          </div>
          {scheduleSummary && (
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/70">Schedule</dt>
              <dd className="font-medium text-right">{scheduleSummary}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-base-300 pt-2 mt-2">
            <dt className="text-base-content/70">Amount due</dt>
            <dd className="font-bold text-lg">
              {formatCurrency(pricePreview.totalAmount, pricePreview.currency)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-base-content/60 mb-4">
          Your booking will be confirmed immediately. Pay anytime from Profile →
          Payments before the due date.
        </p>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Confirm re-book"
            )}
          </button>
        </div>

        <p className="text-xs text-center mt-2">
          <Link href="/profile?tab=payments" className="link link-primary">
            View payments
          </Link>
        </p>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
