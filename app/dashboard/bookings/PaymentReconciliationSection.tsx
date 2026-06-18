"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface PaymentReconciliationSectionProps {
  bookingId: string;
  totalAmount: number;
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
    transactionId?: string;
    method?: string;
    paymentDate?: string;
  };
  onSuccess?: () => void;
}

export default function PaymentReconciliationSection({
  bookingId,
  totalAmount,
  payment,
  onSuccess,
}: PaymentReconciliationSectionProps) {
  const [showManual, setShowManual] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [method, setMethod] = useState<
    "bank_transfer" | "cash" | "installments"
  >("bank_transfer");
  const [paidAmount, setPaidAmount] = useState(String(totalAmount));
  const [notes, setNotes] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paystackRef, setPaystackRef] = useState("");

  if (payment?.status === "paid") {
    return (
      <div className="card bg-success/10 border border-success/30">
        <div className="card-body py-4">
          <h5 className="font-semibold text-success">Payment received</h5>
          <p className="text-sm text-gray-600 mt-1">
            ₦{(payment.paidAmount || totalAmount).toLocaleString()}
            {payment.method ? ` via ${payment.method.replace("_", " ")}` : ""}
            {payment.transactionId
              ? ` — Ref: ${payment.transactionId}`
              : ""}
          </p>
        </div>
      </div>
    );
  }

  const handleManualConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "manual",
          method,
          paidAmount: parseFloat(paidAmount),
          notes: notes || undefined,
          transactionId: transactionId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to confirm payment");
        return;
      }
      toast.success(
        data.alreadyPaid ? "Booking was already paid" : "Payment marked as received",
      );
      setShowManual(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to confirm payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReconcile = async () => {
    if (!paystackRef.trim()) {
      toast.error("Enter a Paystack reference");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "paystack_reconcile",
          reference: paystackRef.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reconciliation failed");
        return;
      }
      toast.success(
        data.alreadyPaid
          ? "Booking was already paid"
          : "Paystack payment reconciled successfully",
      );
      setShowReconcile(false);
      onSuccess?.();
    } catch {
      toast.error("Reconciliation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 border border-warning/30">
      <div className="card-body py-4">
        <h5 className="card-title text-base">Payment reconciliation</h5>
        <p className="text-sm text-gray-600">
          Payment status:{" "}
          <span className="badge badge-warning badge-sm">
            {payment?.status || "pending"}
          </span>
          {" · "}
          Amount due: ₦{totalAmount.toLocaleString()}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setShowManual(!showManual);
              setShowReconcile(false);
            }}
          >
            Mark as paid (offline)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => {
              setShowReconcile(!showReconcile);
              setShowManual(false);
            }}
          >
            Reconcile Paystack payment
          </button>
        </div>

        {showManual && (
          <div className="mt-4 space-y-3 p-4 bg-base-100 rounded-lg">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Payment method</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={method}
                onChange={(e) =>
                  setMethod(
                    e.target.value as "bank_transfer" | "cash" | "installments",
                  )
                }
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="installments">Installments</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Amount received (₦)</span>
              </label>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">
                  Bank / transfer reference (optional)
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. GTB-12345"
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Notes (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Direct transfer received 12 Mar"
              />
            </div>
            <button
              type="button"
              className={`btn btn-sm btn-success ${submitting ? "loading" : ""}`}
              disabled={submitting}
              onClick={handleManualConfirm}
            >
              Confirm offline payment
            </button>
          </div>
        )}

        {showReconcile && (
          <div className="mt-4 space-y-3 p-4 bg-base-100 rounded-lg">
            <p className="text-xs text-gray-600">
              Paste the Paystack transaction reference from the Paystack dashboard
              or the parent&apos;s receipt. The server will verify with Paystack
              before confirming this booking.
            </p>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Paystack reference</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm font-mono"
                value={paystackRef}
                onChange={(e) => setPaystackRef(e.target.value)}
                placeholder="e.g. T1234567890"
              />
            </div>
            <button
              type="button"
              className={`btn btn-sm btn-success ${submitting ? "loading" : ""}`}
              disabled={submitting}
              onClick={handleReconcile}
            >
              Verify and confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
