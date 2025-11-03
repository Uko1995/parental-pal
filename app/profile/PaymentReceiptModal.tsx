"use client";

import {
  XMarkIcon,
  CheckCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";
import Image from "next/image";

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

interface PaymentReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentReceiptModal({
  payment,
  isOpen,
  onClose,
}: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Payment Receipt - ${
                payment.transactionId || payment._id
              }</title>
              <style>
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: white;
                }
                .receipt-container {
                  max-width: 600px;
                  margin: 0 auto;
                  border: 1px solid #e5e7eb;
                  padding: 30px;
                  border-radius: 8px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #90AC19;
                  padding-bottom: 20px;
                }
                .logo-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  margin-bottom: 10px;
                }
                .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #90AC19;
                }
                .receipt-title {
                  font-size: 20px;
                  color: #374151;
                  margin-top: 10px;
                }
                .success-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  background: #D1FAE5;
                  color: #065F46;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 600;
                  margin-top: 10px;
                }
                .info-section {
                  margin-bottom: 20px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #f3f4f6;
                }
                .info-label {
                  color: #6b7280;
                  font-weight: 500;
                }
                .info-value {
                  color: #111827;
                  font-weight: 600;
                  text-align: right;
                }
                .amount-section {
                  background: #F0F9FF;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: center;
                }
                .amount-label {
                  color: #6b7280;
                  font-size: 14px;
                  margin-bottom: 5px;
                }
                .amount-value {
                  color: #90AC19;
                  font-size: 32px;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                  color: #6b7280;
                  font-size: 12px;
                }
                .print-logo {
                  width: 50px;
                  height: 50px;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleDownload = () => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll just trigger print which allows "Save as PDF"
    handlePrint();
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg shadow-2xl w-[80vw] h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
            <h3 className="text-2xl font-bold text-base-content">
              Payment Receipt
            </h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Receipt Content (Printable) */}
            <div ref={receiptRef}>
              <div className="receipt-container">
                {/* Header */}
                <div className="header">
                  <div className="logo-container flex items-center justify-center gap-3 mb-3">
                    <Image
                      src="/parentalpalLOGO.webp"
                      alt="ParentalPal Logo"
                      width={50}
                      height={50}
                      className="print-logo"
                    />
                    <div className="logo">PARENTALPAL</div>
                  </div>
                  <div className="receipt-title">Payment Receipt</div>
                  <div className="success-badge">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Payment Successful</span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Transaction ID:</span>
                    <span className="info-value font-mono">
                      {payment.transactionId || payment._id}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Booking ID:</span>
                    <span className="info-value font-mono">
                      {payment.bookingId}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Service Type:</span>
                    <span className="info-value capitalize">
                      {payment.serviceType.replace("-", " ")}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Description:</span>
                    <span className="info-value">
                      {payment.description || "Service payment"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value capitalize">
                      {payment.method
                        ? payment.method.replace("_", " ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Payment Date:</span>
                    <span className="info-value">
                      {payment.paidDate
                        ? formatDate(payment.paidDate)
                        : formatDate(payment.createdAt)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value text-success uppercase">
                      {payment.status}
                    </span>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="amount-section">
                  <div className="amount-label">Total Amount Paid</div>
                  <div className="amount-value">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </div>

                {/* Footer */}
                <div className="footer">
                  <p>
                    <strong>PARENTALPAL</strong> - Your trusted childcare
                    solution partner
                  </p>
                  <p>
                    For inquiries, contact us at admin@parentalpal.org | +234
                    806 539 4795
                  </p>
                  <p className="mt-2">
                    This is an official receipt. Please keep it for your
                    records.
                  </p>
                  <p className="mt-2 text-xs">
                    Receipt generated on {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 no-print">
              <button
                onClick={handlePrint}
                className="btn btn-primary flex-1 gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Receipt
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-secondary flex-1 gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            {/* Info Text */}
            <p className="text-sm text-base-content/70 text-center mt-4 no-print">
              You can print this receipt or save it as a PDF for your records.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
