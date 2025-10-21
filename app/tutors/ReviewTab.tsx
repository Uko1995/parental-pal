"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { TutorFormData } from "./TutorRegistrationForm";

interface ReviewTabProps {
  formData: TutorFormData;
  onSubmit: () => void;
  isSubmitting: boolean;
  onTermsChange?: (allAccepted: boolean) => void;
}

export default function ReviewTab({
  formData,
  onSubmit,
  isSubmitting,
  onTermsChange,
}: ReviewTabProps) {
  // State for terms and conditions checkboxes
  const [termsAccepted, setTermsAccepted] = useState({
    accurateInfo: false,
    termsAndPrivacy: false,
    applicationReview: false,
    backgroundCheck: false,
  });

  // Check if all terms are accepted
  const allTermsAccepted = Object.values(termsAccepted).every(Boolean);

  // Notify parent when terms acceptance changes
  useEffect(() => {
    onTermsChange?.(allTermsAccepted);
  }, [allTermsAccepted, onTermsChange]);

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Review Your Application
        </h3>
        <p className="text-gray-600">
          Please review all information before submitting your tutor application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="card bg-base-100 border border-gray-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center">
              <UserIcon className="w-5 h-5 text-primary" />
              Personal Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {formData.userData.user.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {formData.userData.user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-sm mt-1">
                  {formData.address}
                </span>
              </div>
              {formData.emergencyContact.name && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact:
                  </p>
                  <div className="text-sm space-y-1">
                    <div>{formData.emergencyContact.name}</div>
                    <div>{formData.emergencyContact.phone}</div>
                    <div className="capitalize">
                      {formData.emergencyContact.relationship}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="card bg-base-100 border border-gray-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center">
              <AcademicCapIcon className="w-5 h-5 text-secondary" />
              Professional Info
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Specialty:</span>
                <span className="font-medium">{formData.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{formData.experience} years</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Hourly Rate:</span>
                <span className="font-medium">
                  {formatCurrency(formData.hourlyRate)}
                </span>
              </div> */}

              {formData.qualifications.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-600">Qualifications:</span>
                  <div className="mt-1">
                    {formData.qualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="badge badge-outline badge-sm mr-1 mb-1"
                      >
                        {qual}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-gray-600">Subjects:</span>
                <div className="mt-1">
                  {formData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="badge badge-[#FFEACF]/200 shadow-sm mr-1 mb-1"
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card bg-base-100 border border-gray-200 lg:col-span-2">
          <div className="card-body">
            <h4 className="card-title text-lg">Professional Bio</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {formData.bio}
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="card bg-base-100 border border-gray-200">
          <div className="card-body">
            <h4 className="card-title text-lg flex items-center">
              <CalendarDaysIcon className="w-5 h-5 text-accent" />
              Availability
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-gray-600">Available Days:</span>
                <div className="mt-1">
                  {formData.availability.days.map((day, index) => (
                    <div
                      key={index}
                      className="badge badge-[#FFEACF]/200 shadow-sm mr-1 mb-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Working Hours:</span>
                <span className="font-medium">
                  {formatTime(formData.availability.hours.start)} -{" "}
                  {formatTime(formData.availability.hours.end)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Preferences */}
        <div className="card bg-base-100 border border-gray-200">
          <div className="card-body">
            <h4 className="card-title text-lg">Service Preferences</h4>
            <div className="space-y-3">
              {formData.preferredServices.length > 0 ? (
                <div className="flex flex-col">
                  <span className="text-gray-600">Preferred Services:</span>
                  <div className="mt-1">
                    {formData.preferredServices.map((service, index) => (
                      <div
                        key={index}
                        className="badge badge-[#FFEACF]/200 shadow-sm mr-1 mb-1 capitalize"
                      >
                        {service.replace("-", " ")}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No specific service preferences
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="card bg-base-100 border border-gray-200">
        <div className="card-body">
          <h4 className="card-title text-lg">Terms & Conditions</h4>
          <div className="space-y-4 text-sm text-gray-900">
            <label className="cursor-pointer label justify-start">
              <input
                type="checkbox"
                className="checkbox"
                checked={termsAccepted.accurateInfo}
                onChange={(e) =>
                  setTermsAccepted((prev) => ({
                    ...prev,
                    accurateInfo: e.target.checked,
                  }))
                }
                required
              />
              <span className="label-text text-gray-900 ml-3">
                I confirm that all information provided is accurate and complete
                to the best of my knowledge.
              </span>
            </label>

            <label className="cursor-pointer label justify-start">
              <input
                type="checkbox"
                className="checkbox "
                checked={termsAccepted.termsAndPrivacy}
                onChange={(e) =>
                  setTermsAccepted((prev) => ({
                    ...prev,
                    termsAndPrivacy: e.target.checked,
                  }))
                }
                required
              />
              <span className="label-text text-gray-900 ml-3">
                I agree to ParentalPal&apos;s Terms of Service and Privacy
                Policy.
              </span>
            </label>

            <label className="cursor-pointer label justify-start">
              <input
                type="checkbox"
                className="checkbox "
                checked={termsAccepted.applicationReview}
                onChange={(e) =>
                  setTermsAccepted((prev) => ({
                    ...prev,
                    applicationReview: e.target.checked,
                  }))
                }
                required
              />
              <span className="label-text text-gray-900 ml-3">
                I understand that my application will be reviewed and I may be
                contacted for additional verification.
              </span>
            </label>

            <label className="cursor-pointer label justify-start">
              <input
                type="checkbox"
                className="checkbox "
                checked={termsAccepted.backgroundCheck}
                onChange={(e) =>
                  setTermsAccepted((prev) => ({
                    ...prev,
                    backgroundCheck: e.target.checked,
                  }))
                }
                required
              />
              <span className="label-text text-gray-900 ml-3">
                I consent to background checks as part of the verification
                process.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="alert alert-[#FFEACF]/200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">What happens next?</h3>
          <div className="text-xs">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Your application will be reviewed by our team within 2-3
                business days
              </li>
              <li>
                We may contact you for additional information or an interview
              </li>
              <li>
                Upon approval, you&apos;ll receive access to your tutor
                dashboard
              </li>
              <li>You can start receiving booking requests from families</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
