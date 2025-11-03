"use client";

import {
  XMarkIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  method?: "card" | "bank_transfer" | "cash" | "installments";
  transactionId?: string;
  paidDate?: string;
  createdAt: string;
  serviceType: string;
  description: string;
}

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_STATUS_COLORS = {
  pending: "badge-warning",
  paid: "badge-success",
  failed: "badge-error",
  refunded: "badge-info",
};

const PAYMENT_STATUS_ICONS = {
  pending: ClockIcon,
  paid: CheckCircleIcon,
  failed: XCircleIcon,
  refunded: ArrowUturnLeftIcon,
};

export default function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
}: PaymentDetailsModalProps) {
  if (!payment || !isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const StatusIcon = PAYMENT_STATUS_ICONS[payment.status];

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg shadow-2xl w-[80vw] h-[80vh] flex flex-col max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
            <div>
              <h3 className="text-2xl font-bold text-base-content">
                Payment Details
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Transaction information
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Status Badge */}
            <div className="flex justify-center">
              <div
                className={`badge ${
                  PAYMENT_STATUS_COLORS[payment.status]
                } badge-lg gap-2 px-6 py-4`}
              >
                <StatusIcon className="w-6 h-6" />
                <span className="text-base font-semibold uppercase">
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-linear-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
              <p className="text-sm text-base-content/70 mb-2">Amount</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(payment.amount, payment.currency)}
              </p>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              {/* Transaction ID */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold break-all">
                    {payment.transactionId || payment._id}
                  </p>
                </div>
              </div>

              {/* Booking ID */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Booking ID</p>
                  <p className="font-mono text-sm font-semibold break-all">
                    {payment.bookingId}
                  </p>
                </div>
              </div>

              {/* Service Type */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <BanknotesIcon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Service Type</p>
                  <p className="font-semibold capitalize">
                    {payment.serviceType.replace("-", " ")}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Description</p>
                  <p className="font-semibold">
                    {payment.description || "Service payment"}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCardIcon className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Payment Method</p>
                  <p className="font-semibold capitalize">
                    {payment.method
                      ? payment.method.replace("_", " ")
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Created On</p>
                  <p className="font-semibold">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Paid Date (if paid) */}
              {payment.paidDate && payment.status === "paid" && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-base-content/70">Paid On</p>
                    <p className="font-semibold">
                      {formatDate(payment.paidDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 bg-base-50 shrink-0">
            <button onClick={onClose} className="btn btn-primary w-full">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
