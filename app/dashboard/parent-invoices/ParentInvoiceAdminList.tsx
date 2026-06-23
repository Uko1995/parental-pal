"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { formatPaymentDueDateLine } from "@/lib/booking-payment-due";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";
import ParentInvoiceDetailsModal, {
  type ParentInvoiceDetails,
} from "@/app/profile/ParentInvoiceDetailsModal";

interface AdminInvoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  parentName: string;
  parentEmail: string;
  status: string;
  lineItems: ParentInvoiceLineItem[];
  subtotal?: number;
  totalAmount: number;
  currency: string;
  paymentDueDate?: string;
  linkedBookingId?: string;
  createdAt?: string;
  approval?: { rejectionReason?: string };
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-ghost",
  pending_approval: "badge-warning",
  approved: "badge-info",
  pending_payment: "badge-info",
  rejected: "badge-error",
  paid: "badge-success",
  cancelled: "badge-neutral",
};

const ITEMS_PER_PAGE = 10;

export default function ParentInvoiceAdminList() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<ParentInvoiceDetails | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/parent-invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices((data.invoices || []) as AdminInvoice[]);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesStatus = !statusFilter || inv.status === statusFilter;
      const matchesSearch =
        !query ||
        inv.parentName.toLowerCase().includes(query) ||
        inv.parentEmail.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Invoices ({filtered.length} of {invoices.length})
          </h2>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={fetchInvoices}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="form-control md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by parent name, email, or invoice #..."
                className="input input-bordered w-full pr-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <select
            className="select select-bordered w-full"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Parent</th>
                <th className="text-left">Invoice #</th>
                <th className="text-left">Status</th>
                <th className="text-left">Total</th>
                <th className="text-left">Due</th>
                <th className="text-left">Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-base-200">
                  <td>
                    <div className="font-bold">
                      {invoice.parentName || "Unknown parent"}
                    </div>
                    <div className="text-sm opacity-50">
                      {invoice.parentEmail || invoice.userId}
                    </div>
                  </td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>
                    <span
                      className={`badge badge-sm whitespace-nowrap h-auto py-1 ${
                        STATUS_BADGE[invoice.status] || "badge-ghost"
                      }`}
                    >
                      {invoice.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="font-semibold">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="text-sm">
                    {invoice.paymentDueDate
                      ? formatPaymentDueDateLine(invoice.paymentDueDate)
                      : "—"}
                  </td>
                  <td>{formatDate(invoice.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-1"
                        onClick={() => setSelected(invoice)}
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {invoices.length === 0
                ? "No invoices found"
                : "No invoices match your filters"}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length} invoices
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`join-item btn btn-sm ${
                    currentPage === i + 1 ? "btn-active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="join-item btn btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ParentInvoiceDetailsModal
        invoice={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
