"use client";

import { useState } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface ServiceFiltersProps {
  onFilterChange: (filters: ServiceFilters) => void;
  categoryCounts: Record<string, number>;
  totalServices: number;
}

export interface ServiceFilters {
  search: string;
  category: string;
  status: string;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
}

const formatServiceType = (type: string) => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ServiceFilters({
  onFilterChange,
  categoryCounts,
  totalServices,
}: ServiceFiltersProps) {
  const [filters, setFilters] = useState<ServiceFilters>({
    search: "",
    category: "",
    status: "",
    priceRange: { min: 0, max: 100000 },
    sortBy: "name",
    sortOrder: "asc",
    viewMode: "grid",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilters = (newFilters: Partial<ServiceFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: ServiceFilters = {
      search: "",
      category: "",
      status: "",
      priceRange: { min: 0, max: 100000 },
      sortBy: "name",
      sortOrder: "asc",
      viewMode: filters.viewMode, // Keep view mode
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.status ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 100000;

  return (
    <div className="bg-base-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Search and basic filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className=" max-w-md">
            <input
              type="text"
              placeholder="Search services..."
              className="input input-bordered pl-10 w-full"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Category Filter */}
          <select
            className="select select-bordered min-w-40"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {Object.entries(categoryCounts).map(([category, count]) => (
              <option key={category} value={category}>
                {formatServiceType(category)} ({count})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="select select-bordered min-w-32"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="seasonal">Seasonal</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Right side - View controls and actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="join">
            <button
              className={`btn btn-sm join-item ${
                filters.viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => updateFilters({ viewMode: "grid" })}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              className={`btn btn-sm join-item ${
                filters.viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => updateFilters({ viewMode: "list" })}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            className={`btn btn-outline btn-sm ${
              showAdvancedFilters ? "btn-active" : ""
            }`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-sm text-error"
              onClick={clearFilters}
            >
              <XMarkIcon className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Price Range (NGN)
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input input-bordered input-sm flex-1"
                  value={filters.priceRange.min || ""}
                  onChange={(e) =>
                    updateFilters({
                      priceRange: {
                        ...filters.priceRange,
                        min: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input input-bordered input-sm flex-1"
                  value={filters.priceRange.max || ""}
                  onChange={(e) =>
                    updateFilters({
                      priceRange: {
                        ...filters.priceRange,
                        max: Number(e.target.value) || 100000,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Sort By</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
              >
                <option value="name">Name</option>
                <option value="createdAt">Date Created</option>
                <option value="pricing.baseRate">Price</option>
                <option value="metrics.totalBookings">Bookings</option>
                <option value="metrics.averageRating">Rating</option>
                <option value="metrics.totalRevenue">Revenue</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Order</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.sortOrder}
                onChange={(e) =>
                  updateFilters({ sortOrder: e.target.value as "asc" | "desc" })
                }
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4">
            <label className="label">
              <span className="label-text font-medium">Quick Filters</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-outline btn-xs"
                onClick={() =>
                  updateFilters({
                    sortBy: "metrics.totalBookings",
                    sortOrder: "desc",
                  })
                }
              >
                Most Popular
              </button>
              <button
                className="btn btn-outline btn-xs"
                onClick={() =>
                  updateFilters({
                    sortBy: "metrics.averageRating",
                    sortOrder: "desc",
                  })
                }
              >
                Highest Rated
              </button>
              <button
                className="btn btn-outline btn-xs"
                onClick={() =>
                  updateFilters({
                    sortBy: "metrics.totalRevenue",
                    sortOrder: "desc",
                  })
                }
              >
                Top Revenue
              </button>
              <button
                className="btn btn-outline btn-xs"
                onClick={() =>
                  updateFilters({
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  })
                }
              >
                Newest First
              </button>
              <button
                className="btn btn-outline btn-xs"
                onClick={() =>
                  updateFilters({
                    sortBy: "pricing.baseRate",
                    sortOrder: "asc",
                  })
                }
              >
                Lowest Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {totalServices} service{totalServices !== 1 ? "s" : ""}
            {hasActiveFilters && " (filtered)"}
          </span>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-xs">Active filters:</span>
              <div className="flex space-x-1">
                {filters.search && (
                  <span className="badge badge-primary badge-xs">
                    Search: {filters.search}
                  </span>
                )}
                {filters.category && (
                  <span className="badge badge-secondary badge-xs">
                    {formatServiceType(filters.category)}
                  </span>
                )}
                {filters.status && (
                  <span className="badge badge-accent badge-xs">
                    {filters.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
