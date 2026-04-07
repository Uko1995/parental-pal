"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ChildActions from "./ChildActions";

interface Child {
  childId?: string;
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
  subjects?: string[];
  parentId: string;
  parentName: string | null;
  parentEmail: string | null;
  services: Array<{
    serviceType: string;
    status: string;
    bookingId: string;
    createdAt: Date;
  }>;
}

interface ChildrenTableProps {
  childrenData: Child[];
}

export default function ChildrenTable({ childrenData }: ChildrenTableProps) {
  const [children, setChildren] = useState<Child[]>(childrenData || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState({ min: "", max: "" });
  const [genderFilter, setGenderFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"most-recent" | "oldest">(
    "most-recent",
  );
  const [showFilters, setShowFilters] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasModifiedSort = sortOrder !== "most-recent";

  // Function to scroll to top of table
  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Update local state when props change
  useEffect(() => {
    setChildren(childrenData || []);
  }, [childrenData]);

  const handleChildUpdated = (updatedChild: Child) => {
    // Update child in local state instead of page reload
    setChildren((prev) =>
      prev.map((child) =>
        child.childId === updatedChild.childId ? updatedChild : child,
      ),
    );
  };

  // Get unique services for filter dropdown
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    children.forEach((child) => {
      child.services.forEach((service) => {
        services.add(service.serviceType);
      });
    });
    return Array.from(services).sort();
  }, [children]);

  // Filter children based on current filters
  const filteredChildren = useMemo(() => {
    const getObjectIdTimestamp = (id: string) => {
      if (!/^[a-f\d]{24}$/i.test(id)) {
        return 0;
      }

      return parseInt(id.slice(0, 8), 16) * 1000;
    };

    const getChildTimestamp = (child: Child) => {
      const latestServiceTimestamp = child.services.reduce((latest, service) => {
        const timestamp = new Date(service.createdAt).getTime();
        return Number.isFinite(timestamp)
          ? Math.max(latest, timestamp)
          : latest;
      }, 0);

      return latestServiceTimestamp || getObjectIdTimestamp(child.parentId);
    };

    const filtered = children.filter((child) => {
      // Name filter
      if (
        nameFilter &&
        !child.name.toLowerCase().includes(nameFilter.toLowerCase())
      ) {
        return false;
      }

      // Age filter
      if (ageFilter.min && child.age < parseInt(ageFilter.min)) {
        return false;
      }
      if (ageFilter.max && child.age > parseInt(ageFilter.max)) {
        return false;
      }

      // Gender filter
      if (genderFilter && child.gender !== genderFilter) {
        return false;
      }

      // Service filter
      if (
        serviceFilter &&
        !child.services.some((service) => service.serviceType === serviceFilter)
      ) {
        return false;
      }

      return true;
    });
    return filtered.sort((a, b) =>
      sortOrder === "most-recent"
        ? getChildTimestamp(b) - getChildTimestamp(a)
        : getChildTimestamp(a) - getChildTimestamp(b),
    );
  }, [
    children,
    nameFilter,
    ageFilter,
    genderFilter,
    serviceFilter,
    sortOrder,
  ]);

  // Client-side pagination
  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredChildren.slice(startIndex, endIndex);
  }, [filteredChildren, currentPage, itemsPerPage]);

  // Calculate pagination info for client-side pagination
  const clientPagination = useMemo(() => {
    const totalItems = filteredChildren.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages,
      totalChildren: totalItems,
      childrenPerPage: itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [filteredChildren.length, currentPage, itemsPerPage]);

  const clearFilters = () => {
    setNameFilter("");
    setAgeFilter({ min: "", max: "" });
    setGenderFilter("");
    setServiceFilter("");
    setSortOrder("most-recent");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
    // Optional: Update URL without causing re-render
    // const params = new URLSearchParams(searchParams.toString());
    // params.set("page", page.toString());
    // router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    nameFilter ||
    ageFilter.min ||
    ageFilter.max ||
    genderFilter ||
    serviceFilter ||
    hasModifiedSort;

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="card-title">Children Profiles</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {paginatedChildren.length} of {filteredChildren.length}{" "}
              children
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-sm ${
                showFilters ? "btn-primary" : "btn-outline"
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-1" />
              Filters
            </button>
            <button className="btn btn-sm btn-outline btn-primary">
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Child
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-base-200 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filter Children</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-xs btn-ghost">
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Name Filter */}
              <div>
                <label className="label">
                  <span className="label-text text-sm">Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="input input-sm input-bordered w-full pl-8"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
                </div>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="label">
                  <span className="label-text text-sm">Min Age</span>
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  className="input input-sm input-bordered w-full"
                  value={ageFilter.min}
                  onChange={(e) =>
                    setAgeFilter((prev) => ({ ...prev, min: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-sm">Max Age</span>
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  className="input input-sm input-bordered w-full"
                  value={ageFilter.max}
                  onChange={(e) =>
                    setAgeFilter((prev) => ({ ...prev, max: e.target.value }))
                  }
                />
              </div>

              {/* Gender Filter */}
              <div>
                <label className="label">
                  <span className="label-text text-sm">Gender</span>
                </label>
                <select
                  className="select select-sm select-bordered w-full"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Service Filter */}
              <div>
                <label className="label">
                  <span className="label-text text-sm">Service</span>
                </label>
                <select
                  className="select select-sm select-bordered w-full"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="">All Services</option>
                  {uniqueServices.map((service) => (
                    <option key={service} value={service}>
                      {service.charAt(0).toUpperCase() +
                        service.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-sm">Sort</span>
                </label>
                <select
                  className="select select-sm select-bordered w-full"
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

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-base-300">
                <span className="text-xs text-gray-600">Active filters:</span>
                {nameFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Name: {nameFilter}
                    <button onClick={() => setNameFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {ageFilter.min && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Min Age: {ageFilter.min}
                    <button
                      onClick={() =>
                        setAgeFilter((prev) => ({ ...prev, min: "" }))
                      }
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {ageFilter.max && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Max Age: {ageFilter.max}
                    <button
                      onClick={() =>
                        setAgeFilter((prev) => ({ ...prev, max: "" }))
                      }
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {genderFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Gender:{" "}
                    {genderFilter.charAt(0).toUpperCase() +
                      genderFilter.slice(1)}
                    <button onClick={() => setGenderFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {serviceFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Service: {serviceFilter}
                    <button onClick={() => setServiceFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {hasModifiedSort && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Sort: Oldest First
                    <button onClick={() => setSortOrder("most-recent")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Parent</th>
                <th>Services</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {hasActiveFilters
                        ? "No children match your filters"
                        : "No children found"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {hasActiveFilters
                        ? "Try adjusting your filter criteria"
                        : "Add some children profiles to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedChildren.map((child, index) => (
                  <tr key={child.childId || index}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold">{child.name}</div>
                          <div className="text-sm opacity-50">
                            {child.class}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{child.age}</td>
                    <td>
                      <div
                        className={`badge badge-sm ${
                          child.gender === "male"
                            ? "badge-info"
                            : "badge-secondary"
                        }`}
                      >
                        {child.gender?.charAt(0).toUpperCase() +
                          child.gender?.slice(1) || "N/A"}
                      </div>
                    </td>
                    <td>{child.parentName || "N/A"}</td>
                    <td>
                      <div className="flex space-x-1 flex-wrap gap-1">
                        {child.services && child.services.length > 0 ? (
                          child.services.map((service, serviceIndex) => (
                            <div
                              key={serviceIndex}
                              className="badge badge-primary badge-sm"
                            >
                              {service.serviceType}
                            </div>
                          ))
                        ) : (
                          <div className="badge badge-ghost badge-sm">
                            No Services yet
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td>
                      <ChildActions
                        child={child}
                        onChildUpdated={handleChildUpdated}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-info/10 rounded-lg">
            <p className="text-sm text-info">
              📊 Showing {filteredChildren.length} of {children.length} children
              based on your filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredChildren.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(clientPagination.currentPage - 1) *
                  clientPagination.childrenPerPage +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  clientPagination.currentPage *
                    clientPagination.childrenPerPage,
                  clientPagination.totalChildren,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {clientPagination.totalChildren}
              </span>{" "}
              children
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
                  (_, i) => i + 1,
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
      </div>
    </div>
  );
}
