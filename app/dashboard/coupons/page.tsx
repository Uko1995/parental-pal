"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  PlusIcon,
  TagIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  restrictedToUsers: string[];
  firstTimeBuyersOnly: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CouponFormData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  perUserLimit: number;
  firstTimeBuyersOnly: boolean;
  isActive: boolean;
}

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderAmount: 0,
    maximumDiscount: 0,
    validFrom: "",
    validUntil: "",
    usageLimit: 0,
    perUserLimit: 0,
    firstTimeBuyersOnly: false,
    isActive: true,
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minimumOrderAmount: 0,
      maximumDiscount: 0,
      validFrom: "",
      validUntil: "",
      usageLimit: 0,
      perUserLimit: 0,
      firstTimeBuyersOnly: false,
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount || 0,
      maximumDiscount: coupon.maximumDiscount || 0,
      validFrom: coupon.validFrom
        ? new Date(coupon.validFrom).toISOString().split("T")[0]
        : "",
      validUntil: coupon.validUntil
        ? new Date(coupon.validUntil).toISOString().split("T")[0]
        : "",
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 0,
      firstTimeBuyersOnly: coupon.firstTimeBuyersOnly,
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCoupon
        ? `/api/coupons/${editingCoupon._id}`
        : "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const payload = {
        ...formData,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        usageLimit: formData.usageLimit || undefined,
        perUserLimit: formData.perUserLimit || undefined,
        minimumOrderAmount: formData.minimumOrderAmount || undefined,
        maximumDiscount: formData.maximumDiscount || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCoupon ? "Coupon updated!" : "Coupon created!");
        fetchCoupons();
        setShowForm(false);
        resetForm();
      } else {
        toast.error(data.error || "Failed to save coupon");
      }
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    setDeleting(couponId);
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Coupon deleted");
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setDeleting(null);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/coupons/${coupon._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          `Coupon ${coupon.isActive ? "deactivated" : "activated"}`
        );
        fetchCoupons();
      }
    } catch {
      toast.error("Failed to update coupon status");
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    if (statusFilter === "active" && !coupon.isActive) return false;
    if (statusFilter === "inactive" && coupon.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        coupon.code.toLowerCase().includes(query) ||
        coupon.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" ref={tableRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TagIcon className="w-7 h-7 text-[#90AC19]" />
            Coupon Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage discount codes and promotions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-[#90AC19] hover:bg-[#7A9216] text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TagIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter((c) => c.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TagIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Coupons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter((c) => !c.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                  className="select select-bordered select-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coupons Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-base-200">
                      <td>
                        <div>
                          <p className="font-mono font-bold text-[#90AC19]">
                            {coupon.code}
                          </p>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₦${coupon.discountValue.toLocaleString()}`}
                        </span>
                        {coupon.minimumOrderAmount &&
                          coupon.minimumOrderAmount > 0 && (
                            <p className="text-xs text-gray-500">
                              Min: ₦{coupon.minimumOrderAmount.toLocaleString()}
                            </p>
                          )}
                      </td>
                      <td>
                        <span>
                          {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </span>
                      </td>
                      <td>
                        {coupon.validUntil ? (
                          <div className="text-sm">
                            <p>
                              Until{" "}
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </p>
                            {new Date(coupon.validUntil) < new Date() && (
                              <span className="badge badge-error badge-xs">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleCouponStatus(coupon)}
                          className={`badge ${
                            coupon.isActive ? "badge-success" : "badge-ghost"
                          } cursor-pointer`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(coupon)}
                            className="btn btn-ghost btn-sm"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            disabled={deleting === coupon._id}
                            className="btn btn-ghost btn-sm text-red-500"
                          >
                            {deleting === coupon._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
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
            <div className="flex justify-center mt-4">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`join-item btn btn-sm ${
                        currentPage === page ? "btn-active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Coupon Code *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., SAVE20"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Discount Type *
                    </span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountType: e.target.value as "percentage" | "fixed",
                      }))
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Discount Value *
                    </span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={
                      formData.discountType === "percentage" ? 100 : undefined
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountValue: Number(e.target.value),
                      }))
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Min Order Amount
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minimumOrderAmount: Number(e.target.value),
                      }))
                    }
                    placeholder="₦0"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Max Discount</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maximumDiscount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maximumDiscount: Number(e.target.value),
                      }))
                    }
                    placeholder="No limit"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Valid From</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validFrom: e.target.value,
                      }))
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Valid Until</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validUntil: e.target.value,
                      }))
                    }
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Total Usage Limit
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usageLimit: Number(e.target.value),
                      }))
                    }
                    placeholder="Unlimited"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Per User Limit
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.perUserLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        perUserLimit: Number(e.target.value),
                      }))
                    }
                    placeholder="Unlimited"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.firstTimeBuyersOnly}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstTimeBuyersOnly: e.target.checked,
                      }))
                    }
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">First-time buyers only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="checkbox checkbox-success"
                  />
                  <span className="label-text">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : editingCoupon ? (
                    "Update Coupon"
                  ) : (
                    "Create Coupon"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
