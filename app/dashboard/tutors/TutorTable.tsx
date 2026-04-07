"use client";

import { useState, useMemo, useRef } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { UserInterface } from "@/models/User";
import TutorDetailsModal from "./TutorDetailsModal";
import EditTutorModal from "./EditTutorModal";
import toast from "react-hot-toast";
import CloudinaryImage from "@/components/CloudinaryImage";

interface TutorTableProps {
  tutors: UserInterface[];
}

export default function TutorTable({ tutors: initialTutors }: TutorTableProps) {
  // State for filtering and pagination
  const [tutors, setTutors] = useState<UserInterface[]>(initialTutors);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"most-recent" | "oldest">(
    "most-recent",
  );
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<UserInterface | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<UserInterface | null>(
    null,
  );
  const [tutorToEdit, setTutorToEdit] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasModifiedSort = sortOrder !== "most-recent";

  const getTutorTimestamp = (tutor: UserInterface) => {
    const timestamp = tutor.createdAt ? new Date(tutor.createdAt).getTime() : 0;
    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  // Function to scroll to top of table
  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Filter tutors based on the search criteria
  const filteredTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      const nameMatch = nameFilter
        ? tutor.userData?.user?.name
            ?.toLowerCase()
            .includes(nameFilter.toLowerCase())
        : true;

      const phoneMatch = phoneFilter
        ? tutor.phone?.toLowerCase().includes(phoneFilter.toLowerCase())
        : true;

      const statusMatch = statusFilter
        ? statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? tutor.isActive
            : !tutor.isActive
        : true;

      // Date filtering
      let dateMatch = true;
      if (dateFromFilter || dateToFilter) {
        const tutorDate = new Date(tutor.createdAt || "");

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          dateMatch = dateMatch && tutorDate >= fromDate;
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          // Set to end of day to include the entire selected day
          toDate.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && tutorDate <= toDate;
        }
      }

      return nameMatch && phoneMatch && statusMatch && dateMatch;
    });
    return filtered.sort((a, b) =>
      sortOrder === "most-recent"
        ? getTutorTimestamp(b) - getTutorTimestamp(a)
        : getTutorTimestamp(a) - getTutorTimestamp(b),
    );
  }, [
    tutors,
    nameFilter,
    phoneFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    sortOrder,
  ]); // Client-side pagination
  const clientPagination = useMemo(() => {
    const totalItems = filteredTutors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPage,
      itemsPerPage,
    };
  }, [filteredTutors.length, currentPage, itemsPerPage]);

  // Get paginated data
  const paginatedTutors = useMemo(() => {
    return filteredTutors.slice(
      clientPagination.startIndex,
      clientPagination.endIndex,
    );
  }, [filteredTutors, clientPagination.startIndex, clientPagination.endIndex]);

  // Handle page changes with scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setPhoneFilter("");
    setStatusFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setSortOrder("most-recent");
    setCurrentPage(1);
  };

  const handleDropdownToggle = (tutorId: string) => {
    setOpenDropdown(openDropdown === tutorId ? null : tutorId);
  };

  const handleViewDetails = (tutor: UserInterface) => {
    setSelectedTutor(tutor);
    setShowDetailsModal(true);
    setOpenDropdown(null);
  };

  const handleEditTutor = (tutor: UserInterface) => {
    setTutorToEdit(tutor);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteTutor = (tutor: UserInterface) => {
    setTutorToDelete(tutor);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDeleteTutor = async () => {
    if (!tutorToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tutors/${tutorToDelete._id?.toString()}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();

      if (data.success) {
        // Remove tutor from local state to rerender table
        setTutors((prevTutors) =>
          prevTutors.filter((tutor) => tutor._id !== tutorToDelete._id),
        );
        toast.success("Tutor deleted successfully");
      } else {
        toast.error(
          "Failed to delete tutor: " + (data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error deleting tutor:", error);
      toast.error("Error deleting tutor");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setTutorToDelete(null);
    }
  };

  const cancelDeleteTutor = () => {
    setShowDeleteModal(false);
    setTutorToDelete(null);
  };

  const handleTutorUpdated = (updatedTutor: UserInterface) => {
    // Update tutor in local state instead of page reload
    setTutors((prev) =>
      prev.map((tutor) =>
        tutor._id === updatedTutor._id ? updatedTutor : tutor,
      ),
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="card-title">All Tutors ({filteredTutors.length})</h2>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {(nameFilter ||
              phoneFilter ||
              statusFilter ||
              dateFromFilter ||
              dateToFilter ||
              hasModifiedSort) && (
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
              {/* Name Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Search by Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter name..."
                    className="input input-bordered w-full pr-10"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Phone Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Search by Phone
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter phone number..."
                    className="input input-bordered w-full pr-10"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
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
                  className="select select-bordered w-full p-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Sort</span>
                </label>
                <select
                  className="select select-bordered w-full p-2"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "most-recent" | "oldest")
                  }
                >
                  <option value="most-recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Date Range Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date From Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Registration Date From
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full p-2"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              {/* Date To Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Registration Date To
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {clientPagination.startIndex + 1}-
            {clientPagination.endIndex} of {filteredTutors.length} tutors
            {(nameFilter ||
              phoneFilter ||
              statusFilter ||
              dateFromFilter ||
              dateToFilter ||
              hasModifiedSort) &&
              " (filtered)"}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Phone</th>
                <th className="text-left">Status</th>
                <th className="text-left">Join Date</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTutors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-gray-400 text-4xl">👥</div>
                      <p className="text-gray-500 font-medium">
                        No tutors found
                      </p>
                      <p className="text-sm text-gray-400">
                        {filteredTutors.length === 0 &&
                        !nameFilter &&
                        !phoneFilter &&
                        !statusFilter
                          ? "No tutors have been added yet."
                          : "Try adjusting your filters to see more results."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTutors.map((tutor) => (
                  <tr key={tutor._id?.toString()} className="hover:bg-base-200">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-linear-to-br from-primary to-secondary text-primary-content rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
                            {tutor?.userData?.user?.image ? (
                              <CloudinaryImage
                                src={tutor?.userData?.user?.image}
                                alt={tutor?.userData?.user?.name || "Tutor"}
                                width={40}
                                height={40}
                                className="rounded-full w-10 h-10 object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {tutor.userData?.user?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {tutor.userData?.user?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tutor.userData?.user?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{tutor.phone || "N/A"}</td>
                    <td>
                      <div
                        className={`badge ${
                          tutor.isActive ? "badge-success" : "badge-error"
                        }`}
                      >
                        {tutor.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td>
                      {tutor.createdAt ? formatDate(tutor.createdAt) : "N/A"}
                    </td>
                    <td>
                      <div className="relative">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            handleDropdownToggle(tutor._id?.toString() || "")
                          }
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        {openDropdown === tutor._id?.toString() && (
                          <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-48">
                            <div className="py-1">
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"
                                onClick={() => handleViewDetails(tutor)}
                              >
                                <EyeIcon className="w-4 h-4" />
                                View Full Details
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"
                                onClick={() => handleEditTutor(tutor)}
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit Tutor
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                                onClick={() => handleDeleteTutor(tutor)}
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete Tutor
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {clientPagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {clientPagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, clientPagination.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        className={`btn btn-sm ${
                          currentPage === page ? "btn-primary" : "btn-outline"
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  },
                )}
                {clientPagination.totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      className={`btn btn-sm ${
                        currentPage === clientPagination.totalPages
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() =>
                        handlePageChange(clientPagination.totalPages)
                      }
                    >
                      {clientPagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage === clientPagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tutor Details Modal */}
      <TutorDetailsModal
        tutor={selectedTutor}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTutor(null);
        }}
      />

      {/* Edit Tutor Modal */}
      <EditTutorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setTutorToEdit(null);
        }}
        onTutorUpdated={handleTutorUpdated}
        tutor={tutorToEdit}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tutorToDelete && (
        <div className="fixed inset-0  bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {tutorToDelete.userData?.user?.name || "this tutor"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={cancelDeleteTutor}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDeleteTutor}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Tutor"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
