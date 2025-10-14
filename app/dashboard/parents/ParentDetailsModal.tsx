"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

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

interface ParentDetailsModalProps {
  parent: SerializedParentWithStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentDetailsModal({
  parent,
  isOpen,
  onClose,
}: ParentDetailsModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !parent) return null;

  const formatDate = (date: string | Date | number) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Parent Details</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-20 h-20">
                    <span className="text-2xl">
                      {parent.userData?.user?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {parent.userData?.user?.name || "N/A"}
                  </h3>
                  <p className="text-gray-600">
                    {parent.userData?.user?.email || "N/A"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <div
                      className={`badge ${
                        parent.isActive ? "badge-success" : "badge-error"
                      }`}
                    >
                      {parent.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="badge badge-outline">
                      {parent.membershipType || "None"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900">
                    {parent.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <p className="text-gray-900">
                    {parent.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-gray-900">
                    {parent.lastLoginAt
                      ? formatDate(parent.lastLoginAt)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-sm">Total Bookings</div>
                  <div className="stat-value text-lg text-[#90AC19]">
                    {parent.stats?.totalBookings || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-sm">Active Bookings</div>
                  <div className="stat-value text-lg text-[#E8931A]">
                    {parent.stats?.activeBookings || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-sm">Total Spent</div>
                  <div className="stat-value text-lg text-[#A25F97]">
                    {formatCurrency(parent.stats?.totalSpent || 0)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-sm">Children</div>
                  <div className="stat-value text-lg text-blue-600">
                    {parent.stats?.childrenCount || 0}
                  </div>
                </div>
              </div>

              {parent.stats?.lastBookingDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Booking
                  </label>
                  <p className="text-gray-900">
                    {formatDate(parent.stats.lastBookingDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Children Information */}
          {parent.children && parent.children.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Children Information
              </h4>
              <div className="grid gap-4">
                {parent.children.map((child, index) => (
                  <div key={index} className="card bg-base-100 border">
                    <div className="card-body p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <p className="text-gray-900 font-medium">
                            {child.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age
                          </label>
                          <p className="text-gray-900">{child.age} years</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class
                          </label>
                          <p className="text-gray-900">
                            {child.class || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            School
                          </label>
                          <p className="text-gray-900">
                            {child.schoolName || "N/A"}
                          </p>
                        </div>
                      </div>
                      {child.subjects && child.subjects.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subjects
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {child.subjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="badge badge-outline badge-sm"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {parent._id || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{parent.role}</p>
              </div>
              {parent.googleId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">
                    {parent.googleId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
          <button className="btn btn-primary">View Bookings</button>
        </div>
      </div>
    </div>
  );
}
