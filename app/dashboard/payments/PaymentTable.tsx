"use client";

import { useState, useRef } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PaymentInterface } from "./page";
import toast from "react-hot-toast";

interface PaymentTableProps {
  payments: PaymentInterface[];
  onRefresh: () => void;
}

export default function PaymentTable({
  payments,
  onRefresh,
}: PaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] =
    useState<PaymentInterface | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPayment, setViewPayment] = useState<PaymentInterface | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Get unique services and statuses for filters
  const uniqueServices = [...new Set(payments.map((p) => p.service))];
  const uniqueStatuses = [...new Set(payments.map((p) => p.paymentStatus))];

  // Filter payments based on search criteria
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.parentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      payment.childName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      payment.parentEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus =
      !statusFilter || payment.paymentStatus === statusFilter;
    const matchesService = !serviceFilter || payment.service === serviceFilter;

    const matchesAmount =
      (!amountFilter.min || payment.amount >= parseFloat(amountFilter.min)) &&
      (!amountFilter.max || payment.amount <= parseFloat(amountFilter.max));

    return matchesSearch && matchesStatus && matchesService && matchesAmount;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const clearFilters = () => {
    setSearchFilter("");
    setStatusFilter("");
    setServiceFilter("");
    setAmountFilter({ min: "", max: "" });
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string, dueDate?: Date) => {
    const isOverdue =
      dueDate &&
      new Date() > new Date(dueDate) &&
      status !== "completed" &&
      status !== "refunded";

    const statusClasses = {
      completed: "badge-success",
      pending: "badge-warning",
      partial: "badge-info",
      failed: "badge-error",
      refunded: "badge-neutral",
    };

    return (
      <div
        className={`badge badge-sm ${
          isOverdue
            ? "badge-error text-red-600"
            : statusClasses[status as keyof typeof statusClasses] ||
              "badge-ghost"
        }`}
      >
        {isOverdue
          ? "Overdue"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      // Since payments are derived from bookings, we'll update the booking
      const response = await fetch(`/api/bookings/${paymentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment record");
      }

      toast.success("Payment record deleted successfully");
      onRefresh();
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment record");
    }
  };

  const openDeleteModal = (payment: PaymentInterface) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const openViewModal = (payment: PaymentInterface) => {
    setViewPayment(payment);
    setShowViewModal(true);
  };

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="card-title text-xl">Payment Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredPayments.length)} of{" "}
              {filteredPayments.length} payments
              {(searchFilter ||
                statusFilter ||
                serviceFilter ||
                amountFilter.min ||
                amountFilter.max) &&
                " (filtered)"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {(searchFilter ||
              statusFilter ||
              serviceFilter ||
              amountFilter.min ||
              amountFilter.max) && (
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-base-200 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Search</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Name, email, or booking ID..."
                    className="input input-bordered w-full pr-10"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Payment Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Service Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="">All Services</option>
                  {uniqueServices.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Range Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Amount Range (₦)
                  </span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input input-bordered w-full"
                    value={amountFilter.min}
                    onChange={(e) =>
                      setAmountFilter((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input input-bordered w-full"
                    value={amountFilter.max}
                    onChange={(e) =>
                      setAmountFilter((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Booking ID</th>
                <th className="text-left">Parent / Child</th>
                <th className="text-left">Service</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status</th>
                <th className="text-left">Due Date</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">No payments found</p>
                      {(searchFilter ||
                        statusFilter ||
                        serviceFilter ||
                        amountFilter.min ||
                        amountFilter.max) && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={clearFilters}
                        >
                          Clear filters to show all payments
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-base-200">
                    <td>
                      <span className="font-mono text-sm">
                        #{payment.bookingId}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold">
                          {payment.parentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.childName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm">{payment.service}</span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>

                    <td>
                      {getStatusBadge(payment.paymentStatus, payment.dueDate)}
                    </td>
                    <td>
                      <span className="text-sm">
                        {formatDate(payment.dueDate)}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-xs">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                          <li>
                            <a onClick={() => openViewModal(payment)}>
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </a>
                          </li>
                          <li>
                            <a
                              className="text-error"
                              onClick={() => openDeleteModal(payment)}
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete Record
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="btn-group">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <input
        type="checkbox"
        id="delete-payment-modal"
        className="modal-toggle"
        checked={showDeleteModal}
        onChange={() => setShowDeleteModal(!showDeleteModal)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Delete Payment Record</h3>
          <p className="mb-4">
            Are you sure you want to delete the payment record for{" "}
            <strong>{paymentToDelete?.parentName}</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            This action cannot be undone and will remove the payment record
            permanently.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() =>
                paymentToDelete && handleDeletePayment(paymentToDelete._id)
              }
            >
              Delete Record
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="delete-payment-modal">
          Close
        </label>
      </div>

      {/* View Payment Modal */}
      <input
        type="checkbox"
        id="view-payment-modal"
        className="modal-toggle"
        checked={showViewModal}
        onChange={() => setShowViewModal(!showViewModal)}
      />
      <div className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Payment Details</h3>
          {viewPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label font-medium">Booking ID</label>
                  <p className="font-mono text-sm">#{viewPayment.bookingId}</p>
                </div>
                <div>
                  <label className="label font-medium">Payment Status</label>
                  <div>
                    {getStatusBadge(
                      viewPayment.paymentStatus,
                      viewPayment.dueDate
                    )}
                  </div>
                </div>
                <div>
                  <label className="label font-medium">Parent Name</label>
                  <p>{viewPayment.parentName}</p>
                </div>
                <div>
                  <label className="label font-medium">Child Name</label>
                  <p>{viewPayment.childName}</p>
                </div>
                <div>
                  <label className="label font-medium">Service</label>
                  <p>{viewPayment.service}</p>
                </div>
                <div>
                  <label className="label font-medium">Payment Method</label>
                  <p>
                    {viewPayment.paymentMethod
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <label className="label font-medium">Total Amount</label>
                  <p className="font-semibold text-lg">
                    {formatCurrency(viewPayment.amount)}
                  </p>
                </div>
                <div>
                  <label className="label font-medium">Amount Paid</label>
                  <p className="font-semibold text-lg text-success">
                    {formatCurrency(viewPayment.amountPaid)}
                  </p>
                </div>
                <div>
                  <label className="label font-medium">Due Date</label>
                  <p>{formatDate(viewPayment.dueDate)}</p>
                </div>
                {viewPayment.paymentDate && (
                  <div>
                    <label className="label font-medium">Payment Date</label>
                    <p>{formatDate(viewPayment.paymentDate)}</p>
                  </div>
                )}
              </div>

              {viewPayment.notes && (
                <div>
                  <label className="label font-medium">Notes</label>
                  <p className="text-sm bg-base-200 p-3 rounded">
                    {viewPayment.notes}
                  </p>
                </div>
              )}

              {viewPayment.installments &&
                viewPayment.installments.length > 0 && (
                  <div>
                    <label className="label font-medium">Installments</label>
                    <div className="space-y-2">
                      {viewPayment.installments.map((installment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-base-200 rounded"
                        >
                          <span>
                            Installment {index + 1}:{" "}
                            {formatCurrency(installment.amount)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              Due: {formatDate(installment.dueDate)}
                            </span>
                            <div
                              className={`badge badge-sm ${
                                installment.status === "paid"
                                  ? "badge-success"
                                  : installment.status === "overdue"
                                  ? "badge-error"
                                  : "badge-warning"
                              }`}
                            >
                              {installment.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <div className="modal-action">
            <button className="btn" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="view-payment-modal">
          Close
        </label>
      </div>
    </div>
  );
}
