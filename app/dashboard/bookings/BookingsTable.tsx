"use client";

import { useState, useRef } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Child {
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
}

interface Schedule {
  startDate: string;
  endDate?: string;
  weekdays?: Array<{
    day:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    hours: number;
    startTime?: string;
    endTime?: string;
  }>;
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
}

interface Booking {
  _id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  serviceType:
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalCost: number;
  createdAt: string;
  schedule?: Schedule;
  children?: Child[];
}

interface BookingsTableProps {
  bookings: Booking[];
  onView: (booking: Booking) => void;
  onBookingDeleted?: (bookingId: string) => void;
}

export default function BookingsTable({
  bookings,
  onView,
  onBookingDeleted,
}: BookingsTableProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });

  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);

  // Get unique services and statuses for filters
  const uniqueServices = [...new Set(bookings.map((b) => b.serviceType))];
  const uniqueStatuses = [...new Set(bookings.map((b) => b.status))];

  // Apply filters
  const filteredBookings = bookings.filter((booking) => {
    const matchesName = booking.parentName
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesService =
      !serviceFilter || booking.serviceType === serviceFilter;

    return matchesName && matchesStatus && matchesService;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  const clearFilters = () => {
    setNameFilter("");
    setStatusFilter("");
    setServiceFilter("");
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
      completed: "badge-info",
    };

    return (
      <div
        className={`badge badge-sm ${
          statusStyles[status as keyof typeof statusStyles] || "badge-neutral"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const openDeleteModal = (booking: Booking) => {
    // Prevent deletion of non-pending bookings
    if (booking.status !== "pending") {
      toast.error(
        `Cannot delete ${booking.status} booking. Only pending bookings can be deleted.`
      );
      return;
    }

    setDeleteModal({ isOpen: true, booking });
  };

  const handleDelete = async () => {
    const booking = deleteModal.booking;
    if (!booking) return;

    setDeletingIds((prev) => new Set(prev).add(booking._id));

    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted successfully");
        if (onBookingDeleted) {
          onBookingDeleted(booking._id);
        }
      } else {
        toast.error("Failed to delete booking");
      }
    } catch {
      toast.error("Error deleting booking");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(booking._id);
        return newSet;
      });
      setDeleteModal({ isOpen: false, booking: null });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, booking: null });
  };

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Bookings ({filteredBookings.length} of {bookings.length})
          </h2>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-1" />
              Filters
            </button>
            {(nameFilter || statusFilter || serviceFilter) && (
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-base-200 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Search by Parent Name
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter parent name..."
                    className="input input-bordered w-full pr-10"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
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
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Parent</th>
                <th className="text-left">Service</th>
                <th className="text-left">Status</th>
                <th className="text-left">Cost</th>
                <th className="text-left">Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className={`hover:bg-base-200 ${
                    booking.status === "pending"
                      ? "border-l-4 border-l-warning"
                      : booking.status === "confirmed"
                      ? "border-l-4 border-l-success"
                      : booking.status === "cancelled"
                      ? "border-l-4 border-l-error"
                      : "border-l-4 border-l-info"
                  }`}
                >
                  <td>
                    <div>
                      <div className="font-bold">{booking.parentName}</div>
                      <div className="text-sm opacity-50">
                        {booking.parentEmail}
                      </div>
                    </div>
                  </td>
                  <td>{booking.serviceType}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td className="font-semibold">
                    {formatCurrency(booking.totalCost)}
                  </td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-sm"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu menu-sm bg-base-100 rounded-box w-40 p-2 shadow-lg border z-50"
                        >
                          <li>
                            <a onClick={() => onView(booking)}>
                              <EyeIcon className="w-4 h-4" />
                              View
                            </a>
                          </li>

                          <li>
                            {booking.status === "pending" ? (
                              <a
                                onClick={() => openDeleteModal(booking)}
                                className="text-error"
                              >
                                {deletingIds.has(booking._id) ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                                Delete
                              </a>
                            ) : (
                              <a
                                className="text-gray-400 cursor-not-allowed"
                                title={`Cannot delete ${booking.status} booking`}
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                              </a>
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {bookings.length === 0
                  ? "No bookings found"
                  : "No bookings match your filters"}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of{" "}
              {filteredBookings.length} bookings
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.booking && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center mb-4">
              <div className="shrink-0 w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mr-4">
                <TrashIcon className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-error">Delete Booking</h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the booking for{" "}
                <span className="font-semibold">
                  {deleteModal.booking.parentName}
                </span>
                ?
              </p>

              <div className="bg-base-200 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>
                    <p>{deleteModal.booking.serviceType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span>
                    <p>{formatCurrency(deleteModal.booking.totalCost)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div>{getStatusBadge(deleteModal.booking.status)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{formatDate(deleteModal.booking.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closeDeleteModal}
                disabled={deletingIds.has(deleteModal.booking._id)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deletingIds.has(deleteModal.booking._id)}
              >
                {deletingIds.has(deleteModal.booking._id) ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete Booking
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeDeleteModal}></div>
        </div>
      )}
    </div>
  );
}
