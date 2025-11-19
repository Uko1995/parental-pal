"use client";

import { UserInterface } from "@/models/User";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect } from "react";

interface TutorDetailsModalProps {
  tutor: UserInterface | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorDetailsModal({
  tutor,
  isOpen,
  onClose,
}: TutorDetailsModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
    }

    // Cleanup on unmount
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

  if (!isOpen || !tutor) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Tutor Details</h2>
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
                      {tutor?.userData?.user?.image ? (
                        <Image
                          src={tutor?.userData?.user?.image}
                          alt={tutor.userData.user.name || "Tutor"}
                          width={40}
                          height={40}
                        />
                      ) : (
                        tutor.userData?.user?.name?.charAt(0) || "?"
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {tutor.userData?.user?.name || "N/A"}
                  </h3>
                  <p className="text-gray-600">
                    {tutor.userData?.user?.email || "N/A"}
                  </p>
                  <div
                    className={`badge ${
                      tutor.isActive ? "badge-success" : "badge-error"
                    } mt-2`}
                  >
                    {tutor.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900">
                    {tutor.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900">{tutor.role || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership Type
                  </label>
                  <p className="text-gray-900">
                    {tutor.membershipType || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">
                    {tutor._id?.toString() || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tutor Profile */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Tutor Profile
              </h4>

              {tutor.tutorProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-lg font-semibold">
                        {tutor.tutorProfile.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subjects
                    </label>
                    {tutor.tutorProfile.subjects &&
                    tutor.tutorProfile.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tutor.tutorProfile.subjects.map((subject, idx) => (
                          <span key={idx} className="badge badge-outline">
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No subjects specified</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <p className="text-gray-900">
                      {tutor.tutorProfile.experience
                        ? `${tutor.tutorProfile.experience} ${
                            tutor.tutorProfile.experience === 1
                              ? "year"
                              : "years"
                          }`
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <p className="text-gray-900">
                      {tutor.tutorProfile.specialty || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualifications & Certifications
                    </label>
                    {tutor.tutorProfile.qualifications &&
                    Array.isArray(tutor.tutorProfile.qualifications) &&
                    tutor.tutorProfile.qualifications.length > 0 ? (
                      <ul className="space-y-2 list-none">
                        {tutor.tutorProfile.qualifications.map((qual, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-gray-900"
                          >
                            <span className="text-[#E8931A] font-bold mt-0.5">
                              •
                            </span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No qualifications listed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {tutor.tutorProfile.bio || "No bio provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <p className="text-gray-900">
                      {tutor.tutorProfile.hourlyRate
                        ? `₦${tutor.tutorProfile.hourlyRate.toLocaleString()}/hour`
                        : "Not specified"}
                    </p>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Status
                    </label>
                    <div
                      className={`badge ${
                        tutor.tutorProfile.isVerified
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {tutor.tutorProfile.isVerified
                        ? "✓ Verified"
                        : "Pending Verification"}
                    </div>
                  </div>

                  {/* Total Reviews */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Reviews
                    </label>
                    <p className="text-gray-900">
                      {tutor.tutorProfile.totalReviews || 0} reviews
                    </p>
                  </div>

                  {/* Availability */}
                  {tutor.tutorProfile.availability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <div className="space-y-2">
                        {tutor.tutorProfile.availability.days &&
                        tutor.tutorProfile.availability.days.length > 0 ? (
                          <>
                            <div>
                              <span className="text-sm text-gray-600">
                                Days:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tutor.tutorProfile.availability.days.map(
                                  (day, idx) => (
                                    <span
                                      key={idx}
                                      className="badge badge-primary badge-sm"
                                    >
                                      {day}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                            {tutor.tutorProfile.availability.hours && (
                              <div>
                                <span className="text-sm text-gray-600">
                                  Hours:{" "}
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {tutor.tutorProfile.availability.hours.start}{" "}
                                  - {tutor.tutorProfile.availability.hours.end}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No availability set
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uploaded Documents
                    </label>
                    {tutor.tutorProfile.documents &&
                    tutor.tutorProfile.documents.length > 0 ? (
                      <div className="space-y-2">
                        {tutor.tutorProfile.documents.map((docUrl, idx) => {
                          const fileName =
                            docUrl.split("/").pop()?.split(".")[0] ||
                            `Document ${idx + 1}`;
                          const fileExtension =
                            docUrl.split(".").pop()?.toUpperCase() || "FILE";

                          return (
                            <a
                              key={idx}
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <span className="text-xs font-bold text-blue-600">
                                  {fileExtension}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Click to view document
                                </p>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No documents uploaded
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No tutor profile information available
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Created
                </label>
                <p className="text-gray-900">
                  {tutor.createdAt ? formatDate(tutor.createdAt) : "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {tutor.updatedAt ? formatDate(tutor.updatedAt) : "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <div
                  className={`badge ${
                    tutor.isActive ? "badge-success" : "badge-warning"
                  }`}
                >
                  {tutor.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {tutor.googleId || "Not connected"}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          {tutor.preferences && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Notifications
                  </label>
                  <div
                    className={`badge ${
                      tutor.preferences.notifications?.email
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {tutor.preferences.notifications?.email
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMS Notifications
                  </label>
                  <div
                    className={`badge ${
                      tutor.preferences.notifications?.sms
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {tutor.preferences.notifications?.sms
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Push Notifications
                  </label>
                  <div
                    className={`badge ${
                      tutor.preferences.notifications?.push
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {tutor.preferences.notifications?.push
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Services
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {tutor.preferences.preferredServices?.map(
                      (service, idx) => (
                        <span
                          key={idx}
                          className="badge badge-outline badge-xs"
                        >
                          {service}
                        </span>
                      )
                    ) || <span className="text-gray-500">None specified</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
          <button className="btn btn-primary">Edit Tutor</button>
        </div>
      </div>
    </div>
  );
}
