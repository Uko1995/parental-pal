"use client";

import { useState, useMemo, useRef } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ParentDetailsModal from "./ParentDetailsModal";
import EditParentModal from "./EditParentModal";
import toast from "react-hot-toast";
import Image from "next/image";

interface SerializedParentWithStats {
  _id: string | undefined;
  userData: {
    expiresAt: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  phone?: string;
  address?: string;
  image?: string;
  googleId?: string;
  role: "admin" | "parent" | "tutor";
  isActive: boolean;
  lastLoginAt?: string | null;
  membershipType: "basic" | "premium" | "none";
  children?: {
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }[];
  preferences?: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
  stats: {
    totalBookings: number;
    activeBookings: number;
    totalSpent: number;
    childrenCount: number;
    lastBookingDate: number | null;
  };
}

interface ParentsTableProps {
  initialParents: SerializedParentWithStats[];
}

export default function ParentsTable({ initialParents }: ParentsTableProps) {
  const [parents, setParents] =
    useState<SerializedParentWithStats[]>(initialParents);
  const [selectedParent, setSelectedParent] =
    useState<SerializedParentWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] =
    useState<SerializedParentWithStats | null>(null);
  const [parentToEdit, setParentToEdit] =
    useState<SerializedParentWithStats | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Function to scroll to top of table
  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Filter states (matching ChildrenTable structure)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Handle page change with scroll
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  // Get unique membership types for filter dropdown
  const uniqueMembershipTypes = useMemo(() => {
    const types = new Set<string>();
    parents.forEach((parent) => {
      if (parent.membershipType) {
        types.add(parent.membershipType);
      }
    });
    return Array.from(types).sort();
  }, [parents]);

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setMembershipFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Filter parents based on current filters
  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      // Name filter
      if (
        nameFilter &&
        !parent.userData?.user?.name
          ?.toLowerCase()
          .includes(nameFilter.toLowerCase()) &&
        !parent.userData?.user?.email
          ?.toLowerCase()
          .includes(nameFilter.toLowerCase())
      ) {
        return false;
      }

      // Membership filter
      if (membershipFilter && parent.membershipType !== membershipFilter) {
        return false;
      }

      // Status filter
      if (statusFilter) {
        if (statusFilter === "active" && !parent.isActive) {
          return false;
        }
        if (statusFilter === "inactive" && parent.isActive) {
          return false;
        }
      }

      return true;
    });
  }, [parents, nameFilter, membershipFilter, statusFilter]);

  // Client-side pagination (matching ChildrenTable)
  const clientPagination = useMemo(() => {
    const totalItems = filteredParents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      startIndex,
      endIndex,
    };
  }, [filteredParents.length, currentPage, itemsPerPage]);

  // Get paginated data
  const paginatedParents = useMemo(() => {
    return filteredParents.slice(
      clientPagination.startIndex,
      clientPagination.endIndex
    );
  }, [filteredParents, clientPagination.startIndex, clientPagination.endIndex]);

  // Check if filters are active
  const hasActiveFilters = nameFilter || membershipFilter || statusFilter;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle view parent
  const handleViewParent = (parent: SerializedParentWithStats) => {
    setSelectedParent(parent);
    setIsModalOpen(true);
  };

  // Handle delete parent
  const handleDeleteClick = (parent: SerializedParentWithStats) => {
    setParentToDelete(parent);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!parentToDelete?._id) return;

    try {
      const response = await fetch(`/api/users/${parentToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setParents(parents.filter((p) => p._id !== parentToDelete._id));
        toast.success("Parent deleted successfully");
      } else {
        toast.error("Failed to delete parent");
      }
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast.error("Failed to delete parent");
    } finally {
      setIsDeleteModalOpen(false);
      setParentToDelete(null);
    }
  };

  // Handle edit parent
  const handleEditParent = (parent: SerializedParentWithStats) => {
    setParentToEdit(parent);
    setIsEditModalOpen(true);
  };

  const handleParentUpdated = () => {
    // Trigger page refresh to show the updated parent data
    window.location.reload();
  };

  return (
    <>
      <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="card-title">Parents Profiles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {paginatedParents.length} of {filteredParents.length}{" "}
                parents
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={clearFilters}
                >
                  <XMarkIcon className="w-4 h-4" />
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
                      Search by Name
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter name or email..."
                      className="input input-bordered w-full pr-10"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Membership Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Membership Type
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={membershipFilter}
                    onChange={(e) => setMembershipFilter(e.target.value)}
                  >
                    <option value="">All Memberships</option>
                    {uniqueMembershipTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
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
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-left">Parent Name</th>
                  <th className="text-left">Details</th>
                  <th className="text-left">Children</th>

                  <th className="text-left">Payments</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParents.map((parent) => (
                  <tr key={parent._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {parent.userData?.user?.image ? (
                                <Image
                                  src={parent.userData?.user?.image}
                                  alt={
                                    parent.userData?.user?.name || "User Image"
                                  }
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                parent.userData?.user?.name
                                  ?.split(" ")[0]
                                  .charAt(0) +
                                  (parent.userData?.user?.name
                                    ?.split(" ")[1]
                                    ?.charAt(0) || "") || "U"
                              )}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {parent.userData?.user?.name || "N/A"}
                          </div>
                          <div className="text-sm opacity-80">
                            {parent?.membershipType.charAt(0).toUpperCase() +
                              parent?.membershipType.slice(1) || "None"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {parent.userData?.user?.email || "N/A"}
                      </div>
                      <div className="text-sm">
                        {parent.phone || "Not provided"}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {parent?.children
                          ?.map((child) => child.name)
                          .join(", ") || "N/A"}
                      </div>
                    </td>

                    <td>
                      <div className="text-sm font-medium text-[#90AC19]">
                        {formatCurrency(parent.stats?.totalSpent || 0)}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`badge ${
                          parent.isActive ? "badge-success" : "badge-error"
                        }`}
                      >
                        {parent.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td>
                      <div className="dropdown dropdown-left">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-xs"
                        >
                          ▼
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-gray-200"
                        >
                          <li>
                            <button
                              onClick={() => handleViewParent(parent)}
                              className="flex items-center gap-2"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleEditParent(parent)}
                              className="flex items-center gap-2"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit Parent
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDeleteClick(parent)}
                              className="flex items-center gap-2 text-error"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete Parent
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-info/10 rounded-lg">
              <p className="text-sm text-info">
                📊 Showing {filteredParents.length} of {parents.length} parents
                based on your filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredParents.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(clientPagination.currentPage - 1) *
                    clientPagination.itemsPerPage +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    clientPagination.currentPage *
                      clientPagination.itemsPerPage,
                    clientPagination.totalItems
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {clientPagination.totalItems}
                </span>{" "}
                parents
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Page Button */}
                <button
                  onClick={() =>
                    handlePageChange(clientPagination.currentPage - 1)
                  }
                  disabled={!clientPagination.hasPrevPage}
                  className={`btn btn-sm ${
                    !clientPagination.hasPrevPage
                      ? "btn-disabled"
                      : "btn-ghost hover:btn-primary"
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from(
                    { length: clientPagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      // Show current page, previous page, next page, first page, and last page
                      return (
                        page === 1 ||
                        page === clientPagination.totalPages ||
                        Math.abs(page - clientPagination.currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`btn btn-sm ${
                              page === clientPagination.currentPage
                                ? "btn-primary"
                                : "btn-ghost hover:btn-primary"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Next Page Button */}
                <button
                  onClick={() =>
                    handlePageChange(clientPagination.currentPage + 1)
                  }
                  disabled={!clientPagination.hasNextPage}
                  className={`btn btn-sm ${
                    !clientPagination.hasNextPage
                      ? "btn-disabled"
                      : "btn-ghost hover:btn-primary"
                  }`}
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {paginatedParents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No parents found</div>
              <div className="text-sm text-gray-400">
                Try adjusting your search criteria
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parent Details Modal */}
      <ParentDetailsModal
        parent={selectedParent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParent(null);
        }}
      />

      {/* Edit Parent Modal */}
      <EditParentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setParentToEdit(null);
        }}
        onParentUpdated={handleParentUpdated}
        parent={parentToEdit}
      />

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${isDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {parentToDelete?.userData?.user?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setParentToDelete(null);
              }}
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={handleDeleteConfirm}>
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setIsDeleteModalOpen(false);
              setParentToDelete(null);
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
