"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  BoltIcon,
} from "@heroicons/react/24/outline";
import {
  BOOKING_PROMO_SERVICE_TYPES,
  type CouponTarget,
} from "@/models/Coupon";

type WindowStatus = "scheduled" | "active" | "expired";

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  target: CouponTarget;
  autoApply: boolean;
  applicableServiceTypes: string[];
  tutoringLocation?: "virtual" | "physical";
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  firstTimeOnly: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CouponFormData {
  code: string;
  description: string;
  target: CouponTarget;
  autoApply: boolean;
  applicableServiceTypes: string[];
  tutoringLocation: "any" | "virtual" | "physical";
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  maxUsesPerUser: number;
  firstTimeOnly: boolean;
  isActive: boolean;
}

const SERVICE_LABELS: Record<string, string> = {
  tutoring: "Tutoring",
  childcare: "Childcare",
  homeschooling: "Homeschooling",
  "holiday-camps": "Holiday camps",
  "kiddies-enrichment": "Kiddies enrichment",
  "space-rental": "Space rental",
};

const LAGOS_OFFSET = "+01:00";

function toLagosDateInput(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function getWindowStatus(coupon: Coupon, now = new Date()): WindowStatus {
  if (now < new Date(coupon.validFrom)) return "scheduled";
  if (now > new Date(coupon.validUntil)) return "expired";
  return "active";
}

const EMPTY_FORM: CouponFormData = {
  code: "",
  description: "",
  target: "bookings",
  autoApply: false,
  applicableServiceTypes: [],
  tutoringLocation: "any",
  discountType: "percentage",
  discountValue: 10,
  minimumOrderAmount: 0,
  maximumDiscount: 0,
  validFrom: "",
  validUntil: "",
  maxUses: 0,
  maxUsesPerUser: 0,
  firstTimeOnly: false,
  isActive: true,
};

function formatDiscount(coupon: Pick<Coupon, "discountType" | "discountValue">) {
  return coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : `₦${coupon.discountValue.toLocaleString()}`;
}

function describeScope(coupon: Coupon) {
  if (coupon.target === "products") return "Shop products";
  const services = coupon.applicableServiceTypes.length
    ? coupon.applicableServiceTypes.map((s) => SERVICE_LABELS[s] ?? s).join(", ")
    : "All services";
  const location =
    coupon.tutoringLocation &&
    (coupon.applicableServiceTypes.length === 0 ||
      coupon.applicableServiceTypes.includes("tutoring"))
      ? ` (${coupon.tutoringLocation} tutoring)`
      : "";
  return `${services}${location}`;
}

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-800 mb-1.5"
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1.5 leading-snug">{children}</p>;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function ChoiceButton({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full text-left rounded-lg border-2 px-4 py-3 transition-colors ${
        selected
          ? "border-[#90AC19] bg-[#90AC19]/10"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <span
        className={`block text-sm font-semibold ${
          selected ? "text-[#5f7310]" : "text-gray-800"
        }`}
      >
        {title}
      </span>
      <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
        {subtitle}
      </span>
    </button>
  );
}

const INPUT_CLASS = "input input-bordered w-full";

export default function DiscountsAndPromosPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "scheduled" | "expired"
  >("all");
  const [targetFilter, setTargetFilter] = useState<"all" | CouponTarget>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"most-recent" | "oldest">(
    "most-recent"
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CouponFormData>(EMPTY_FORM);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data);
      } else {
        toast.error(data.error || "Failed to load promos");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load promos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingCoupon(null);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      target: coupon.target,
      autoApply: coupon.autoApply,
      applicableServiceTypes: coupon.applicableServiceTypes,
      tutoringLocation: coupon.tutoringLocation ?? "any",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount || 0,
      maximumDiscount: coupon.maximumDiscount || 0,
      validFrom: toLagosDateInput(coupon.validFrom),
      validUntil: toLagosDateInput(coupon.validUntil),
      maxUses: coupon.maxUses || 0,
      maxUsesPerUser: coupon.maxUsesPerUser || 0,
      firstTimeOnly: coupon.firstTimeOnly,
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableServiceTypes: prev.applicableServiceTypes.includes(service)
        ? prev.applicableServiceTypes.filter((s) => s !== service)
        : [...prev.applicableServiceTypes, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.validFrom &&
      formData.validUntil &&
      formData.validUntil < formData.validFrom
    ) {
      toast.error("End date must be on or after the start date");
      return;
    }

    setSaving(true);

    try {
      const url = editingCoupon
        ? `/api/coupons/${editingCoupon._id}`
        : "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const isBookings = formData.target === "bookings";
      const tutoringApplies =
        formData.applicableServiceTypes.length === 0 ||
        formData.applicableServiceTypes.includes("tutoring");

      const payload = {
        code: formData.code,
        description: formData.description,
        target: formData.target,
        autoApply: formData.autoApply,
        applicableServiceTypes: isBookings ? formData.applicableServiceTypes : [],
        tutoringLocation:
          isBookings && tutoringApplies ? formData.tutoringLocation : "any",
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minimumOrderAmount: formData.minimumOrderAmount,
        maximumDiscount: formData.maximumDiscount,
        maxUses: formData.maxUses,
        maxUsesPerUser: formData.maxUsesPerUser,
        firstTimeOnly: formData.firstTimeOnly,
        isActive: formData.isActive,
        validFrom: formData.validFrom
          ? `${formData.validFrom}T00:00:00${LAGOS_OFFSET}`
          : undefined,
        validUntil: formData.validUntil
          ? `${formData.validUntil}T23:59:59.999${LAGOS_OFFSET}`
          : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCoupon ? "Promo updated!" : "Promo created!");
        fetchCoupons();
        setShowForm(false);
        resetForm();
      } else {
        toast.error(data.error || "Failed to save promo");
      }
    } catch {
      toast.error("Failed to save promo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this promo?")) return;

    setDeleting(couponId);
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Promo deleted");
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      } else {
        toast.error(data.error || "Failed to delete promo");
      }
    } catch {
      toast.error("Failed to delete promo");
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
        toast.success(`Promo ${coupon.isActive ? "paused" : "activated"}`);
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to update promo status");
      }
    } catch {
      toast.error("Failed to update promo status");
    }
  };

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const filtered = coupons.filter((coupon) => {
      if (statusFilter === "active" && !coupon.isActive) return false;
      if (statusFilter === "inactive" && coupon.isActive) return false;
      if (
        (statusFilter === "scheduled" || statusFilter === "expired") &&
        getWindowStatus(coupon, now) !== statusFilter
      ) {
        return false;
      }
      if (targetFilter !== "all" && coupon.target !== targetFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          coupon.code.toLowerCase().includes(query) ||
          coupon.description?.toLowerCase().includes(query)
        );
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const aTimestamp = new Date(a.createdAt).getTime();
      const bTimestamp = new Date(b.createdAt).getTime();
      const first = Number.isFinite(aTimestamp) ? aTimestamp : 0;
      const second = Number.isFinite(bTimestamp) ? bTimestamp : 0;

      return sortOrder === "most-recent" ? second - first : first - second;
    });
  }, [coupons, statusFilter, targetFilter, searchQuery, sortOrder]);

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

  const liveCount = coupons.filter(
    (c) => c.isActive && getWindowStatus(c) === "active"
  ).length;
  const autoLiveCount = coupons.filter(
    (c) => c.isActive && c.autoApply && getWindowStatus(c) === "active"
  ).length;

  const tutoringApplies =
    formData.applicableServiceTypes.length === 0 ||
    formData.applicableServiceTypes.includes("tutoring");

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
            Discounts &amp; Promos
          </h1>
          <p className="text-gray-600 mt-1">
            Create promo codes and automatic discounts for bookings and shop
            products
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
          New Promo
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
              <p className="text-sm text-gray-500">Live now</p>
              <p className="text-2xl font-bold text-gray-900">{liveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BoltIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Automatic (live)</p>
              <p className="text-2xl font-bold text-gray-900">
                {autoLiveCount}
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
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
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
              <p className="text-sm text-gray-500">Total Promos</p>
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
              placeholder="Search promos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Switched on</option>
                  <option value="inactive">Paused</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applies to
                </label>
                <select
                  value={targetFilter}
                  onChange={(e) => {
                    setTargetFilter(e.target.value as typeof targetFilter);
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-sm"
                >
                  <option value="all">All</option>
                  <option value="bookings">Service bookings</option>
                  <option value="products">Shop products</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "most-recent" | "oldest")
                  }
                  className="select select-bordered select-sm"
                >
                  <option value="most-recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promos Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Promo</th>
                  <th>Applies to</th>
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
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No promos found
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((coupon) => {
                    const windowStatus = getWindowStatus(coupon);
                    return (
                      <tr key={coupon._id} className="hover:bg-base-200">
                        <td>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-bold text-[#90AC19]">
                                {coupon.code}
                              </p>
                              {coupon.autoApply ? (
                                <span className="badge badge-warning badge-xs gap-1">
                                  <BoltIcon className="w-3 h-3" />
                                  Auto
                                </span>
                              ) : (
                                <span className="badge badge-ghost badge-xs">
                                  Code
                                </span>
                              )}
                            </div>
                            {coupon.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              coupon.target === "bookings"
                                ? "badge-info"
                                : "badge-secondary"
                            }`}
                          >
                            {coupon.target === "bookings" ? "Bookings" : "Products"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1 max-w-[14rem]">
                            {describeScope(coupon)}
                          </p>
                        </td>
                        <td>
                          <span className="font-semibold">
                            {formatDiscount(coupon)}
                          </span>
                          {(coupon.minimumOrderAmount ?? 0) > 0 && (
                            <p className="text-xs text-gray-500">
                              Min: ₦{coupon.minimumOrderAmount!.toLocaleString()}
                            </p>
                          )}
                          {(coupon.maximumDiscount ?? 0) > 0 &&
                            coupon.discountType === "percentage" && (
                              <p className="text-xs text-gray-500">
                                Max: ₦{coupon.maximumDiscount!.toLocaleString()}
                              </p>
                            )}
                        </td>
                        <td>
                          <span>
                            {coupon.usedCount || 0}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm">
                            <p>
                              {new Date(coupon.validFrom).toLocaleDateString()} –{" "}
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </p>
                            {windowStatus === "scheduled" && (
                              <span className="badge badge-info badge-xs">
                                Scheduled
                              </span>
                            )}
                            {windowStatus === "active" && (
                              <span className="badge badge-success badge-xs">
                                Running
                              </span>
                            )}
                            {windowStatus === "expired" && (
                              <span className="badge badge-error badge-xs">
                                Expired
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleCouponStatus(coupon)}
                            className={`badge ${
                              coupon.isActive ? "badge-success" : "badge-ghost"
                            } cursor-pointer`}
                            title="Click to switch on or pause"
                          >
                            {coupon.isActive ? "On" : "Paused"}
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
                    );
                  })
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

      {/* Promo Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col">
            <div className="px-6 sm:px-8 py-5 border-b flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCoupon ? "Edit Promo" : "Create New Promo"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fields marked <span className="text-red-500">*</span> are
                  required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg shrink-0"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
                <FormSection title="Type of promo">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel required>Applies to</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        <ChoiceButton
                          selected={formData.target === "bookings"}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, target: "bookings" }))
                          }
                          title="Service bookings"
                          subtitle="Tutoring, childcare, camps and more"
                        />
                        <ChoiceButton
                          selected={formData.target === "products"}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, target: "products" }))
                          }
                          title="Shop products"
                          subtitle="Books in the cart or bought directly"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel required>How it&apos;s applied</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        <ChoiceButton
                          selected={!formData.autoApply}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, autoApply: false }))
                          }
                          title="Promo code"
                          subtitle="Customer types the code"
                        />
                        <ChoiceButton
                          selected={formData.autoApply}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, autoApply: true }))
                          }
                          title="Automatic"
                          subtitle="Applied for everyone eligible"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 leading-relaxed">
                    {formData.autoApply
                      ? "Automatic promos apply to every eligible checkout during the dates below. The code is only used as a label for your records."
                      : "Customers type the code at checkout to get the discount."}{" "}
                    If several discounts qualify, only the biggest one applies.
                  </p>
                </FormSection>

                <FormSection title="Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel htmlFor="promo-code" required>
                        {formData.autoApply ? "Promo name / label" : "Promo code"}
                      </FieldLabel>
                      <input
                        id="promo-code"
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                          }))
                        }
                        placeholder={formData.autoApply ? "e.g. EASTER10" : "e.g. SAVE20"}
                        className={`${INPUT_CLASS} font-mono uppercase`}
                      />
                      <FieldHint>Letters, numbers, dashes or underscores. No spaces.</FieldHint>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-description">Description</FieldLabel>
                      <input
                        id="promo-description"
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g. Easter holiday discount"
                        className={INPUT_CLASS}
                      />
                      <FieldHint>Shown to customers next to the discount.</FieldHint>
                    </div>
                  </div>
                </FormSection>

                {formData.target === "bookings" && (
                  <FormSection
                    title="Services"
                    description="Leave all unticked to apply the promo to every service."
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {BOOKING_PROMO_SERVICE_TYPES.map((service) => {
                        const checked =
                          formData.applicableServiceTypes.includes(service);
                        return (
                          <label
                            key={service}
                            className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                              checked
                                ? "border-[#90AC19] bg-[#90AC19]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={checked}
                              onChange={() => toggleService(service)}
                            />
                            <span className="text-sm text-gray-800">
                              {SERVICE_LABELS[service] ?? service}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {tutoringApplies && (
                      <div className="max-w-sm">
                        <FieldLabel htmlFor="promo-tutoring-location">
                          Tutoring location
                        </FieldLabel>
                        <select
                          id="promo-tutoring-location"
                          value={formData.tutoringLocation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tutoringLocation: e.target
                                .value as CouponFormData["tutoringLocation"],
                            }))
                          }
                          className="select select-bordered w-full"
                        >
                          <option value="any">Virtual and physical</option>
                          <option value="virtual">Virtual only</option>
                          <option value="physical">Physical only</option>
                        </select>
                      </div>
                    )}
                  </FormSection>
                )}

                <FormSection title="Discount">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <FieldLabel htmlFor="promo-discount-type" required>
                        Discount type
                      </FieldLabel>
                      <select
                        id="promo-discount-type"
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
                        <option value="fixed">Fixed amount (₦)</option>
                      </select>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-discount-value" required>
                        {formData.discountType === "percentage"
                          ? "Discount (%)"
                          : "Discount (₦)"}
                      </FieldLabel>
                      <input
                        id="promo-discount-value"
                        type="number"
                        required
                        min="1"
                        max={
                          formData.discountType === "percentage" ? 100 : undefined
                        }
                        step="any"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            discountValue: Number(e.target.value),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      {formData.discountType === "percentage" && (
                        <FieldHint>Between 1 and 100.</FieldHint>
                      )}
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-min-amount">
                        {formData.target === "bookings"
                          ? "Minimum booking (₦)"
                          : "Minimum order (₦)"}
                      </FieldLabel>
                      <input
                        id="promo-min-amount"
                        type="number"
                        min="0"
                        value={formData.minimumOrderAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            minimumOrderAmount: Number(e.target.value),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>0 = no minimum.</FieldHint>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-max-discount">
                        Maximum discount (₦)
                      </FieldLabel>
                      <input
                        id="promo-max-discount"
                        type="number"
                        min="0"
                        disabled={formData.discountType !== "percentage"}
                        value={formData.maximumDiscount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maximumDiscount: Number(e.target.value),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>
                        {formData.discountType === "percentage"
                          ? "0 = no cap."
                          : "Only used for percentage discounts."}
                      </FieldHint>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Dates and limits">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <FieldLabel htmlFor="promo-valid-from">Starts on</FieldLabel>
                      <input
                        id="promo-valid-from"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            validFrom: e.target.value,
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>Leave blank to start today.</FieldHint>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-valid-until">
                        Ends on (inclusive)
                      </FieldLabel>
                      <input
                        id="promo-valid-until"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            validUntil: e.target.value,
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>Leave blank for 30 days from now.</FieldHint>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-max-uses">Total uses</FieldLabel>
                      <input
                        id="promo-max-uses"
                        type="number"
                        min="0"
                        value={formData.maxUses}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxUses: Number(e.target.value),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>0 = unlimited.</FieldHint>
                    </div>

                    <div>
                      <FieldLabel htmlFor="promo-max-per-user">
                        Uses per customer
                      </FieldLabel>
                      <input
                        id="promo-max-per-user"
                        type="number"
                        min="0"
                        value={formData.maxUsesPerUser}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxUsesPerUser: Number(e.target.value),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                      <FieldHint>0 = unlimited.</FieldHint>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Options">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:border-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.firstTimeOnly}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstTimeOnly: e.target.checked,
                          }))
                        }
                        className="checkbox checkbox-primary checkbox-sm mt-0.5"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-800">
                          {formData.target === "bookings"
                            ? "First booking only"
                            : "First-time buyers only"}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                          {formData.target === "bookings"
                            ? "Only parents who have never booked before qualify."
                            : "Only customers with no previous paid order qualify."}
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:border-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="checkbox checkbox-success checkbox-sm mt-0.5"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-800">
                          Switched on
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                          Untick to save the promo without making it live.
                        </span>
                      </span>
                    </label>
                  </div>
                </FormSection>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 sm:px-8 py-4 border-t bg-gray-50 rounded-b-xl">
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
                  className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white border-none min-w-36"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : editingCoupon ? (
                    "Update Promo"
                  ) : (
                    "Create Promo"
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
