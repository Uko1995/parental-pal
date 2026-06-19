"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { initializeBookingPayment } from "@/lib/booking-payment";

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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "NGN") return `₦${amount.toLocaleString()}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleConfirm = async () => {
    setLoading(true);
    setPaymentError(null);
    setSavedBookingId(null);
    toast.loading("Creating your booking...", { id: "rebook-submit" });

    try {
      const res = await fetch(`/api/bookings/${bookingId}/rebook`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.dismiss("rebook-submit");
        toast.error(data.error || "Re-book failed");
        return;
      }

      toast.loading("Initializing payment...", { id: "rebook-submit" });

      if (!data.success || !data.bookingId) {
        toast.dismiss("rebook-submit");
        toast.error("Re-book failed");
        return;
      }

      const paymentResult = await initializeBookingPayment(
        {
          bookingId: data.bookingId,
          userId: data.userId,
          amount: data.amount,
          currency: data.currency,
          email: data.email,
        },
        { toastId: "rebook-submit", showToast: false },
      );

      if (!paymentResult.ok) {
        toast.dismiss("rebook-submit");
        toast.error(paymentResult.error);
        setPaymentError(paymentResult.error);
        setSavedBookingId(data.bookingId);
      }
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
          <div className="flex justify-between gap-4">
            <dt className="text-base-content/70">Month</dt>
            <dd className="font-medium text-right">{targetMonthLabel}</dd>
          </div>
          {scheduleSummary && (
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/70">Schedule</dt>
              <dd className="font-medium text-right">{scheduleSummary}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t pt-2 mt-2">
            <dt className="font-semibold">Total (recalculated)</dt>
            <dd className="font-bold text-primary">
              {formatCurrency(
                pricePreview.totalAmount,
                pricePreview.currency,
              )}
            </dd>
          </div>
        </dl>

        {paymentError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="font-semibold mb-2">
              Re-book saved, but payment could not start
            </p>
            <p>{paymentError}</p>
            {savedBookingId && (
              <p className="mt-2">
                Booking reference: {savedBookingId}.{" "}
                <Link
                  href="/profile?tab=payments"
                  className="font-semibold underline"
                  onClick={onClose}
                >
                  Pay from Profile → Payments
                </Link>
              </p>
            )}
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
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
              "Confirm & pay"
            )}
          </button>
        </div>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );
}
