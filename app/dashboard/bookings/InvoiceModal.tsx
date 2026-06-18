"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  buildInvoiceLineItems,
  type InvoiceLineItem,
} from "@/lib/booking-invoice";
import type { BookingInterface } from "@/models/Booking";

interface Child {
  name: string;
  age: number;
  gender?: "male" | "female";
  class?: string;
  schoolName?: string;
}

interface Booking {
  _id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  serviceType: string;
  status: string;
  totalCost: number;
  createdAt: string;
  children?: Child[];
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
    transactionId?: string;
    method?: string;
  };
}

interface InvoiceModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({
  booking,
  isOpen,
  onClose,
}: InvoiceModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceLineItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [sendToEmail, setSendToEmail] = useState("");

  useEffect(() => {
    if (!isOpen || !booking) {
      setInvoiceItems([]);
      setSendToEmail("");
      return;
    }

    setSendToEmail(booking.parentEmail || "");

    let cancelled = false;
    setLoadingItems(true);

    fetch(`/api/bookings/${booking._id}`)
      .then((response) => response.json())
      .then((data: { booking?: BookingInterface }) => {
        if (!cancelled && data.booking) {
          setInvoiceItems(buildInvoiceLineItems(data.booking));
        }
      })
      .catch(() => {
        if (!cancelled) setInvoiceItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, booking?._id]);

  if (!isOpen || !booking) return null;

  // Check if payment is confirmed
  const isPaymentConfirmed =
    booking.status === "confirmed" || booking.payment?.status === "paid";
  const documentType = isPaymentConfirmed ? "Receipt" : "Invoice";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `INV-${timestamp}-${random}`;
  };

  const invoiceNumber = generateInvoiceNumber();
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const positiveSubtotal = invoiceItems
    .filter((item) => item.total > 0)
    .reduce((sum, item) => sum + item.total, 0);
  const discountTotal = invoiceItems
    .filter((item) => item.total < 0)
    .reduce((sum, item) => sum + item.total, 0);

  const handleSendInvoice = async () => {
    if (!sendToEmail.trim()) {
      toast.error("Enter a recipient email address");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/bookings/${booking._id}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendTo: sendToEmail.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        const docType =
          result.documentType === "receipt" ? "Receipt" : "Invoice";
        toast.success(`${docType} sent to ${result.sentTo}!`, {
          duration: 3000,
        });
        onClose();
      } else {
        const error = await response.json();
        toast.error(
          error.error || `Failed to send ${documentType.toLowerCase()}`
        );
      }
    } catch {
      toast.error(`Error sending ${documentType.toLowerCase()}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {isPaymentConfirmed ? (
              <>
                <h3 className="font-bold text-2xl text-green-600">
                  ✅ PAYMENT RECEIPT
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Receipt #{invoiceNumber.replace("INV", "RCT")}
                </p>
                <span className="badge badge-success mt-2">✓ PAID IN FULL</span>
              </>
            ) : (
              <>
                <h3 className="font-bold text-2xl text-[#90AC19]">
                  📋 INVOICE
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Invoice #{invoiceNumber}
                </p>
              </>
            )}
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Details */}
        <div className="space-y-6">
          {/* Company & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Bill To:
              </p>
              <p className="font-bold text-lg">{booking.parentName}</p>
              <p className="text-sm text-gray-600">{booking.parentEmail}</p>
              {booking.parentPhone && (
                <p className="text-sm text-gray-600">{booking.parentPhone}</p>
              )}
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Invoice Date:
              </p>
              <p className="text-sm">{formatDate(invoiceDate.toISOString())}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold mt-2 mb-1">
                Due Date:
              </p>
              <p className="text-sm">{formatDate(dueDate.toISOString())}</p>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Service Type:
            </p>
            <p className="text-lg font-bold text-[#90AC19]">
              {booking.serviceType
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
          </div>

          {/* Children Information */}
          {booking.children && booking.children.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                Children Enrolled:
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.children.map((child, index) => (
                  <div
                    key={index}
                    className="badge badge-lg bg-white border-[#90AC19] text-gray-700"
                  >
                    {child.name} ({child.age} years old)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice Items Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-[#90AC19] text-white">
                <tr>
                  <th className="text-left">Description</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loadingItems ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      Loading line items...
                    </td>
                  </tr>
                ) : invoiceItems.length > 0 ? (
                  invoiceItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td>{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">
                        {formatCurrency(Math.abs(item.unitPrice))}
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b">
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No line items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(positiveSubtotal || booking.totalCost)}</span>
              </div>
              {discountTotal < 0 && (
                <div className="flex justify-between py-2 border-b text-success">
                  <span className="font-medium">Discount:</span>
                  <span>{formatCurrency(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-[#90AC19] text-white px-4 rounded-lg mt-2">
                <span className="font-bold text-lg">
                  {isPaymentConfirmed
                    ? "TOTAL AMOUNT PAID:"
                    : "TOTAL AMOUNT DUE:"}
                </span>
                <span className="font-bold text-lg">
                  {formatCurrency(booking.totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions or Confirmation */}
          {isPaymentConfirmed ? (
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-bold">Payment Confirmed</h4>
                <p className="text-sm">
                  This receipt confirms that payment has been received for the
                  services listed above. Thank you for your payment!
                </p>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="font-bold">Payment Instructions</h4>
                <p className="text-sm">
                  Please log in to your ParentalPal account to make payment for
                  this invoice. Visit your profile and navigate to the Payments
                  section.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="form-control mt-4">
          <label className="label py-1">
            <span className="label-text font-medium">Send to email</span>
          </label>
          <input
            type="email"
            className="input input-bordered"
            value={sendToEmail}
            onChange={(e) => setSendToEmail(e.target.value)}
            placeholder="parent@example.com"
          />
          <label className="label py-1">
            <span className="label-text-alt text-gray-500">
              Receipt or invoice is emailed to this address. Check spam if it
              does not arrive within a few minutes.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className={`btn ${
              isPaymentConfirmed ? "btn-success" : "btn-primary"
            } ${isSending ? "loading" : ""}`}
            onClick={handleSendInvoice}
            disabled={isSending}
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send {documentType} to {sendToEmail || "recipient"}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
