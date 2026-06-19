"use client";

import {
  BanknotesIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PaymentReceiptModal from "./PaymentReceiptModal";
import PaymentDetailsModal from "./PaymentDetailsModal";
import { initializeBookingPayment } from "@/lib/booking-payment";
import type { InvoiceLineItem } from "@/lib/booking-invoice";

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
  lineItems?: InvoiceLineItem[];
  serviceSummary?: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  totalPayments: number;
}

const PAYMENT_STATUS_COLORS = {
  pending: "badge-warning",
  paid: "badge-success",
  failed: "badge-error",
  refunded: "badge-info",
};

export default function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalPaid: 0,
    totalPending: 0,
    totalRefunded: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [paymentInProgress, setPaymentInProgress] = useState<string | null>(
    null
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        const paymentsData = data.payments || [];
        setPayments(paymentsData);

        // Calculate summary
        const summary = paymentsData.reduce(
          (acc: PaymentSummary, payment: Payment) => {
            acc.totalPayments++;
            switch (payment.status) {
              case "paid":
                acc.totalPaid += payment.amount;
                break;
              case "pending":
                acc.totalPending += payment.amount;
                break;
              case "refunded":
                acc.totalRefunded += payment.amount;
                break;
            }
            return acc;
          },
          { totalPaid: 0, totalPending: 0, totalRefunded: 0, totalPayments: 0 }
        );
        setSummary(summary);
      } else {
        toast.error("Failed to load payments");
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (bookingId: string, amount: number) => {
    setPaymentInProgress(bookingId);
    try {
      const result = await initializeBookingPayment(
        { bookingId, amount, currency: "NGN" },
        { toastId: `pay-${bookingId}` },
      );
      if (!result.ok) {
        setPaymentInProgress(null);
      }
    } catch (error) {
      console.error("Failed to initialize payment:", error);
      toast.error("Failed to initialize payment");
      setPaymentInProgress(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const filteredPayments = payments.filter(
    (payment) => filterStatus === "all" || payment.status === filterStatus
  );

  const openReceiptModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const openDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedPayment(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-lg shadow-md p-6 border border-base-300">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base-content">Payments</h2>
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select select-bordered select-sm px-3"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-success text-success-content rounded-lg">
          <div className="stat-title text-success-content/70">Total Paid</div>
          <div className="stat-value text-lg">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="stat-desc text-success-content/70">
            Successfully processed
          </div>
        </div>

        <div className="stat bg-warning text-warning-content rounded-lg">
          <div className="stat-title text-warning-content/70">Pending</div>
          <div className="stat-value text-lg">
            {formatCurrency(summary.totalPending)}
          </div>
          <div className="stat-desc text-warning-content/70">
            Awaiting payment
          </div>
        </div>

        <div className="stat bg-info text-info-content rounded-lg">
          <div className="stat-title text-info-content/70">Refunded</div>
          <div className="stat-value text-lg">
            {formatCurrency(summary.totalRefunded)}
          </div>
          <div className="stat-desc text-info-content/70">Money returned</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Transactions</div>
          <div className="stat-value text-lg">{summary.totalPayments}</div>
          <div className="stat-desc">All payments</div>
        </div>
      </div>

      {/* Payment History */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl text-base-content/20 mb-4">💳</div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            {filterStatus === "all"
              ? "No payments yet"
              : `No ${filterStatus} payments`}
          </h3>
          <p className="text-base-content/70 mb-4">
            {filterStatus === "all"
              ? "Make your first booking to see payment information here."
              : `No payments with ${filterStatus} status found.`}
          </p>
          {filterStatus === "all" && (
            <a href="/booking" className="btn btn-primary">
              Make a Booking
            </a>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover">
                  <td>
                    <div className="text-sm">
                      {formatDate(payment.createdAt)}
                      {payment.paidDate && payment.status === "paid" && (
                        <div className="text-xs text-base-content/50">
                          Paid: {formatDate(payment.paidDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium capitalize">
                      {payment.serviceType.replace("-", " ")}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {payment.description || "Service payment"}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm capitalize">
                      {payment.method || "Not specified"}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`badge ${
                        PAYMENT_STATUS_COLORS[payment.status]
                      } badge-sm`}
                    >
                      {payment.status}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-mono">
                      {payment.transactionId || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {payment.status === "pending" ? (
                        <button
                          onClick={() =>
                            initiatePayment(payment.bookingId, payment.amount)
                          }
                          disabled={paymentInProgress === payment.bookingId}
                          className="btn btn-primary btn-xs"
                        >
                          {paymentInProgress === payment.bookingId ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Pay Now"
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openDetailsModal(payment)}
                            className="btn btn-ghost btn-xs"
                          >
                            View
                          </button>
                          {payment.status === "paid" && (
                            <button
                              onClick={() => openReceiptModal(payment)}
                              className="btn btn-ghost btn-xs"
                            >
                              Receipt
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="mt-8 p-4 bg-base-100 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Card Payment</p>
              <p className="text-base-content/70">Visa, Mastercard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 text-secondary rounded flex items-center justify-center">
              <BuildingOffice2Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Bank Transfer</p>
              <p className="text-base-content/70">Direct transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 text-accent-content rounded flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Cash Payment</p>
              <p className="text-base-content/70">Pay on service</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-info/10 text-info-content rounded flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Installments</p>
              <p className="text-base-content/70">Split payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">
          Need Help with Payments?
        </h4>
        <p className="text-blue-800 text-sm mb-3">
          If you have any questions about your payments or need assistance,
          we&apos;re here to help.
        </p>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary">Contact Support</button>
          <button className="btn btn-sm btn-ghost">FAQ</button>
        </div>
      </div>

      {/* Modals */}
      <PaymentReceiptModal
        payment={selectedPayment}
        isOpen={isReceiptModalOpen}
        onClose={closeReceiptModal}
      />
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
      />
    </div>
  );
}
