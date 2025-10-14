"use client";

import { useState, useMemo } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import ParentDetailsModal from "./ParentDetailsModal";
import toast from "react-hot-toast";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] =
    useState<SerializedParentWithStats | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "bookings" | "spent" | "children"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const matchesSearch =
        parent.userData?.user?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        parent.userData?.user?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        parent.phone?.includes(searchTerm);

      const matchesMembership =
        membershipFilter === "all" ||
        parent.membershipType === membershipFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && parent.isActive) ||
        (statusFilter === "inactive" && !parent.isActive);

      return matchesSearch && matchesMembership && matchesStatus;
    });
  }, [parents, searchTerm, membershipFilter, statusFilter]);

  // Sort logic
  const sortedParents = useMemo(() => {
    return [...filteredParents].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.userData?.user?.name || "";
          bValue = b.userData?.user?.name || "";
          break;
        case "email":
          aValue = a.userData?.user?.email || "";
          bValue = b.userData?.user?.email || "";
          break;
        case "bookings":
          aValue = a.stats?.totalBookings || 0;
          bValue = b.stats?.totalBookings || 0;
          break;
        case "spent":
          aValue = a.stats?.totalSpent || 0;
          bValue = b.stats?.totalSpent || 0;
          break;
        case "children":
          aValue = a.stats?.childrenCount || 0;
          bValue = b.stats?.childrenCount || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
  }, [filteredParents, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParents = sortedParents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle sort
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

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

  // Handle edit parent (placeholder)
  const handleEditParent = () => {
    toast("Edit functionality coming soon!", { icon: "🚧" });
  };

  return (
    <>
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                className="select select-bordered w-auto"
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
              >
                <option value="all">All Memberships</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="none">None</option>
              </select>

              <select
                className="select select-bordered w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {paginatedParents.length} of {sortedParents.length}{" "}
              parents
            </p>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {sortedParents.length} filtered results
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:bg-base-200"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Parent Name
                      {sortBy === "name" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="cursor-pointer hover:bg-base-200">
                    <div className="flex items-center gap-2">Details</div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-base-200"
                    onClick={() => handleSort("children")}
                  >
                    <div className="flex items-center gap-2">
                      Children
                      {sortBy === "children" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    className="cursor-pointer hover:bg-base-200"
                    onClick={() => handleSort("spent")}
                  >
                    <div className="flex items-center gap-2">
                      Total Spent
                      {sortBy === "spent" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
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
                          <div className="bg-neutral text-neutral-content rounded-lg w-10 h-10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {parent.userData?.user?.name
                                ?.split(" ")[0]
                                .charAt(0) +
                                (parent.userData?.user?.name
                                  ?.split(" ")[1]
                                  ?.charAt(0) || "") || "U"}
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
                              onClick={handleEditParent}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      className={`join-item btn ${
                        currentPage === page ? "btn-active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className="join-item btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
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
