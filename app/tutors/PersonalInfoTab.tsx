"use client";

/*
 * CLOUDINARY SETUP INSTRUCTIONS:
 *
 * 1. Go to your Cloudinary dashboard
 * 2. Navigate to Settings > Upload
 * 3. Scroll down to "Upload presets"
 * 4. Click "Add upload preset"
 * 5. Set preset name to "tutor_profiles"
 * 6. Set signing mode to "Unsigned"
 * 7. Set folder to "tutor-profiles"
 * 8. Set max file size to 5MB
 * 9. Add allowed formats: jpg, jpeg, png, webp
 * 10. Save the preset
 *
 * Environment variables needed:
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */

import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import CloudinaryImage from "@/components/CloudinaryImage";
import { TutorFormData } from "./TutorRegistrationForm";

interface PersonalInfoTabProps {
  formData: TutorFormData;
  updateFormData: (updates: Partial<TutorFormData>) => void;
}

export default function PersonalInfoTab({
  formData,
  updateFormData,
}: PersonalInfoTabProps) {
  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Image upload state
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Helper functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Nigerian phone number: 10 digits after +234
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Take only first 10 digits
    return digits.slice(0, 10);
  };

  const handleInputChange = (
    field: keyof TutorFormData,
    value: string | TutorFormData["emergencyContact"]
  ) => {
    updateFormData({ [field]: value });
  };

  const handleNestedInputChange = (path: string, value: string) => {
    const pathParts = path.split(".");
    const updates = { ...formData };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = updates;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    updateFormData(updates);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Personal Information
        </h3>
        <p className="text-gray-600">
          Let&apos;s start with some basic information about you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="form-control">
          <label className="label mb-1.5">
            <span className="label-text font-medium ">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Full Name *
            </span>
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className={`input input-bordered w-full ${
              validationErrors.name ? "input-error" : ""
            }`}
            value={formData.userData.user.name}
            onChange={(e) => {
              const value = e.target.value;
              handleNestedInputChange("userData.user.name", value);

              // Validate name
              const newErrors = { ...validationErrors };
              if (validateName(value)) {
                delete newErrors.name;
              } else if (value.trim() !== "") {
                newErrors.name = "Name must be at least 2 characters long";
              }
              setValidationErrors(newErrors);
            }}
          />
          {(validationErrors.name ||
            (!formData.userData.user.name.trim() &&
              formData.userData.user.name !== "")) && (
            <label className="label">
              <span className="label-text-alt text-error flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {validationErrors.name || "Full name is required"}
              </span>
            </label>
          )}
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label mb-2">
            <span className="label-text font-medium">
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email Address *
            </span>
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            className={`input input-bordered w-full ${
              validationErrors.email ? "input-error" : ""
            }`}
            value={formData.userData.user.email}
            onChange={(e) => {
              const value = e.target.value;
              handleNestedInputChange("userData.user.email", value);

              // Validate email
              const newErrors = { ...validationErrors };
              if (value === "" || validateEmail(value)) {
                delete newErrors.email;
              } else {
                newErrors.email = "Please enter a valid email address";
              }
              setValidationErrors(newErrors);
            }}
          />
          {(validationErrors.email ||
            (!formData.userData.user.email.trim() &&
              formData.userData.user.email !== "")) && (
            <label className="label">
              <span className="label-text-alt text-error flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {validationErrors.email || "Email address is required"}
              </span>
            </label>
          )}
        </div>

        {/* Phone Number */}
        <div className="form-control">
          <label className="label mb-2">
            <span className="label-text font-medium">
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Phone Number *
            </span>
          </label>
          <div className="flex items-center">
            <span className="bg-base-200 px-3 py-2 rounded-l-lg border text-sm font-mono">
              +234
            </span>
            <input
              type="tel"
              placeholder="8012345678"
              className={`input input-bordered w-full rounded-l-none font-mono ${
                validationErrors.phone ? "input-error" : ""
              }`}
              value={
                formData.phone.startsWith("+234")
                  ? formData.phone.slice(4)
                  : formData.phone
              }
              maxLength={10}
              onChange={(e) => {
                const value = formatPhoneNumber(e.target.value);
                const fullNumber = `+234${value}`;
                handleInputChange("phone", fullNumber);

                // Validate phone
                const newErrors = { ...validationErrors };
                if (value === "" || validatePhoneNumber(value)) {
                  delete newErrors.phone;
                } else {
                  newErrors.phone =
                    "Please enter a valid 10-digit phone number";
                }
                setValidationErrors(newErrors);
              }}
            />
          </div>
          {(validationErrors.phone ||
            (!formData.phone.trim() && formData.phone !== "")) && (
            <label className="label">
              <span className="label-text-alt text-error flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {validationErrors.phone || "Phone number is required"}
              </span>
            </label>
          )}
          <label className="label mt-1">
            <span className="label-text-alt text-gray-500">
              Enter 10 digits (e.g., 8012345678 for +2348012345678)
            </span>
          </label>
        </div>

        {/* Profile Image Upload */}
        <div className="form-control col-span-full md:col-span-1">
          <label className="label mb-2">
            <span className="label-text font-medium">
              <PhotoIcon className="w-4 h-4 inline mr-2" />
              Profile Image (Optional)
            </span>
          </label>

          <div className="flex flex-col items-center space-y-4">
            {/* Image Preview */}
            {formData.userData.user.image && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                <CloudinaryImage
                  src={formData.userData.user.image}
                  alt="Profile preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority={true}
                />
              </div>
            )}

            {/* Upload Widget */}
            <CldUploadWidget
              uploadPreset="tutor_profiles" // You'll need to create this preset in Cloudinary
              onOpen={() => {
                setImageLoading(true);
                setImageError(null);
              }}
              onSuccess={(result: CloudinaryUploadWidgetResults) => {
                setImageLoading(false);
                if (
                  result.event === "success" &&
                  result.info &&
                  typeof result.info !== "string"
                ) {
                  handleNestedInputChange(
                    "userData.user.image",
                    result.info.secure_url
                  );
                  setImageError(null);
                }
              }}
              onError={(error) => {
                setImageLoading(false);
                setImageError("Failed to upload image. Please try again.");
                console.error("Upload error:", error);
              }}
              options={{
                maxFiles: 1,
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxFileSize: 5000000, // 5MB
                folder: "tutor-profiles",
                cropping: true,
                croppingAspectRatio: 1, // Square aspect ratio
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={imageLoading}
                  className="btn btn-outline btn-sm w-full max-w-xs"
                >
                  {imageLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      {formData.userData.user.image
                        ? "Change Photo"
                        : "Upload Photo"}
                    </>
                  )}
                </button>
              )}
            </CldUploadWidget>

            {imageError && (
              <div className="alert alert-error alert-sm">
                <ExclamationCircleIcon className="w-4 h-4" />
                <span className="text-xs">{imageError}</span>
              </div>
            )}

            {formData.userData.user.image && (
              <button
                type="button"
                onClick={() => {
                  handleNestedInputChange("userData.user.image", "");
                  setImageError(null);
                }}
                className="btn btn-ghost btn-xs text-error"
              >
                Remove Photo
              </button>
            )}
          </div>

          <label className="label mt-1">
            Max size: 5MB. Formats: JPG, PNG, WebP, JPEG
          </label>
        </div>
      </div>

      {/* Address */}
      <div className="form-control">
        <label className="label mb-2">
          <span className="label-text font-medium">
            <MapPinIcon className="w-4 h-4 inline mr-2" />
            Home Address *
          </span>
        </label>
        <textarea
          placeholder="Enter your complete home address"
          className="textarea textarea-bordered w-full h-24"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
        />
        {!formData.address.trim() && (
          <label className="label">
            <span className="label-text-alt text-error">
              Home address is required
            </span>
          </label>
        )}
      </div>

      {/* Info Box */}
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
          <h3 className="font-bold">Privacy & Security</h3>
          <div className="text-sm">
            Your personal information is encrypted and secure. We only share
            necessary details with families you&apos;ll be working with.
          </div>
        </div>
      </div>
    </div>
  );
}
