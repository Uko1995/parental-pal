"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { UserInterface } from "@/models/User";
import TutorDetailsModal from "./TutorDetailsModal";
import toast from "react-hot-toast";
import Image from "next/image";

interface TutorTableProps {
  tutors: UserInterface[];
}

export default function TutorTable({ tutors: initialTutors }: TutorTableProps) {
  // State for filtering and pagination
  const [tutors, setTutors] = useState<UserInterface[]>(initialTutors);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<UserInterface | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<UserInterface | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Filter and sort tutors
  const filteredAndSortedTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      const matchesSearch =
        tutor.userData?.user?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tutor.userData?.user?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tutor.phone?.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && tutor.isActive) ||
        (statusFilter === "inactive" && !tutor.isActive);

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered tutors
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortField) {
        case "name":
          aValue = a.userData?.user?.name || "";
          bValue = b.userData?.user?.name || "";
          break;
        case "email":
          aValue = a.userData?.user?.email || "";
          bValue = b.userData?.user?.email || "";
          break;
        case "phone":
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;

        case "joinDate":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.userData?.user?.name || "";
          bValue = b.userData?.user?.name || "";
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tutors, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTutors = filteredAndSortedTutors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDropdownToggle = (tutorId: string) => {
    setOpenDropdown(openDropdown === tutorId ? null : tutorId);
  };

  const handleViewDetails = async (tutor: UserInterface) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tutors/${tutor._id?.toString()}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedTutor(data.data);
        setShowDetailsModal(true);
      } else {
        toast.error(
          "Failed to load tutor details: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error loading tutor details:", error);
      toast.error("Error loading tutor details");
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleEditTutor = (tutor: UserInterface) => {
    // TODO: Implement edit tutor functionality
    console.log("Edit tutor:", tutor);
    setOpenDropdown(null);
    toast.success("Edit functionality coming soon!");
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
        }
      );
      const data = await response.json();

      if (data.success) {
        // Remove tutor from local state to rerender table
        setTutors((prevTutors) =>
          prevTutors.filter((tutor) => tutor._id !== tutorToDelete._id)
        );
        toast.success("Tutor deleted successfully");
      } else {
        toast.error(
          "Failed to delete tutor: " + (data.error || "Unknown error")
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="card-title">
            All Tutors ({filteredAndSortedTutors.length})
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors..."
                className="input input-bordered pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          <table className="table table-zebra">
            <thead>
              <tr>
                <th
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Name <SortIcon field="name" />
                  </div>
                </th>

                <th
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center gap-2">
                    Phone <SortIcon field="phone" />
                  </div>
                </th>

                <th>Status</th>
                <th
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("joinDate")}
                >
                  <div className="flex items-center gap-2">
                    Join Date <SortIcon field="joinDate" />
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTutors.map((tutor) => (
                <tr key={tutor._id?.toString()}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                          <span className="text-sm">
                            {tutor?.userData?.user?.image ? (
                              <Image
                                src={tutor?.userData?.user?.image}
                                alt={tutor?.userData?.user?.name || "Tutor"}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              tutor.userData?.user?.name?.charAt(0) || "?"
                            )}
                          </span>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="flex items-center justify-start w-1/2 gap-2">
            <span className="text-sm w-full text-gray-600">
              {startIndex + 1} to{" "}
              {Math.min(
                startIndex + itemsPerPage,
                filteredAndSortedTutors.length
              )}{" "}
              of {filteredAndSortedTutors.length}
            </span>
            <select
              className="select w-full select-bordered select-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    className={`btn btn-sm ${
                      currentPage === totalPages ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
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
