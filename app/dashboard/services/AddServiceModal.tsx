"use client";

import { useState } from "react";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { ServiceInterface } from "@/models/Service";
import { createService } from "./action";
import toast from "react-hot-toast";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const serviceTypes = [
  { value: "childcare", label: "Childcare" },
  { value: "tutoring", label: "Tutoring" },
  { value: "homeschooling", label: "Homeschooling" },
  { value: "holiday-camps", label: "Holiday Camps" },
  { value: "space-rental", label: "Space Rental" },
  { value: "kiddies-enrichment", label: "Kids Enrichment" },
] as const;

const billingTypes = [
  { value: "hourly", label: "Per Hour" },
  { value: "daily", label: "Per Day" },
  { value: "weekly", label: "Per Week" },
  { value: "monthly", label: "Per Month" },
  { value: "term", label: "Per Term" },
  { value: "per-event", label: "Per Event" },
  { value: "custom", label: "Custom" },
] as const;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
  { value: "seasonal", label: "Seasonal" },
  { value: "discontinued", label: "Discontinued" },
] as const;

const venueTypeOptions = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "both", label: "Both" },
] as const;

const ageGroupOptions = [
  { value: "toddler", label: "Toddler (1-3)" },
  { value: "preschool", label: "Preschool (3-5)" },
  { value: "primary", label: "Primary (6-12)" },
  { value: "secondary", label: "Secondary (13-18)" },
] as const;

const availabilityOptions = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "school-breaks", label: "School Breaks" },
  { value: "midterm-breaks", label: "Midterm Breaks" },
] as const;

export default function AddServiceModal({
  isOpen,
  onClose,
  onServiceAdded,
}: AddServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "childcare" as ServiceInterface["type"],
    description: "",
    shortDescription: "",
    image: "",
    baseRate: "",
    currency: "NGN",
    billingType: "hourly" as ServiceInterface["pricing"]["billingType"],
    status: "active" as ServiceInterface["status"],
    minimumAge: 1,
    maximumAge: 10,
    keyFeatures: [] as string[],
    availability: [] as string[],
    ageGroups: [] as string[],
    packages: [] as Array<{
      name: string;
      description: string;
      duration: string;
      discountPercentage: number;
      minimumSessions?: number;
    }>,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "baseRate" || name === "minimumAge" || name === "maximumAge"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          image: result.url,
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          name: "",
          description: "",
          duration: "",
          discountPercentage: 0,
          minimumSessions: 1,
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  const updatePackage = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      ),
    }));
  };

  const handleCheckboxChange = (
    category: "availability" | "ageGroups",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const addKeyFeature = () => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ""],
    }));
  };

  const removeKeyFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  const updateKeyFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) =>
        i === index ? value : feature
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const serviceData: Omit<
        ServiceInterface,
        "_id" | "createdAt" | "updatedAt"
      > = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        shortDescription: formData.shortDescription,
        image: formData.image,
        keyFeatures: formData.keyFeatures.filter(
          (feature) => feature.trim() !== ""
        ),
        pricing: {
          baseRate: formData.baseRate,
          currency: formData.currency,
          billingType: formData.billingType,
          packages:
            formData.packages.length > 0 ? formData.packages : undefined,
        },
        availability: formData.availability,
        requirements: {
          minimumAge: formData.minimumAge,
          maximumAge: formData.maximumAge,
          ageGroups:
            formData.ageGroups.length > 0 ? formData.ageGroups : undefined,
          minimumParticipants: 1,
          maximumParticipants: 50,
        },
        status: formData.status,
        metrics: {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalReviews: 0,
          conversionRate: 0,
          repeatCustomerRate: 0,
        },
      };

      const result = await createService(serviceData);

      if (result.success) {
        toast.success("Service created successfully!");
        onServiceAdded();
        onClose();
        // Reset form
        setFormData({
          name: "",
          type: "childcare",
          description: "",
          shortDescription: "",
          image: "",
          baseRate: "",
          currency: "NGN",
          billingType: "hourly",
          status: "active",
          minimumAge: 1,
          maximumAge: 10,
          keyFeatures: [],
          packages: [],
          availability: [],
          ageGroups: [],
        });
      } else {
        toast.error(result.error || "Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Add New Service
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Service Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="e.g., Academic Tutoring"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Service Type *</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Short Description
                </span>
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Brief description for cards"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Full Description *
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-24"
                placeholder="Detailed description of the service"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Service Image</span>
              </label>
              <div className="flex flex-col space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="file-input file-input-bordered w-full"
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Uploading image...</span>
                  </div>
                )}
                {formData.image && (
                  <div className="relative">
                    <Image
                      src={formData.image}
                      alt="Service preview"
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Key Features
              </h3>
              <button
                type="button"
                onClick={addKeyFeature}
                className="btn btn-outline btn-sm"
              >
                + Add Feature
              </button>
            </div>

            {formData.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateKeyFeature(index, e.target.value)}
                  className="input input-bordered flex-1"
                  placeholder="Enter a key feature"
                />
                <button
                  type="button"
                  onClick={() => removeKeyFeature(index)}
                  className="btn btn-ghost btn-sm btn-circle text-error"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.keyFeatures.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                No key features added. Click &ldquo;Add Feature&rdquo; to start
                adding features.
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Base Rate *</span>
                </label>
                <input
                  type="text"
                  name="baseRate"
                  value={formData.baseRate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Currency</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Billing Type *</span>
                </label>
                <select
                  name="billingType"
                  value={formData.billingType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {billingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Requirements & Details
            </h3>

            {/* Age Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Min Age *</span>
                </label>
                <input
                  type="number"
                  name="minimumAge"
                  value={formData.minimumAge}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  min="0"
                  max="10"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Max Age *</span>
                </label>
                <input
                  type="number"
                  name="maximumAge"
                  value={formData.maximumAge}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  min="0"
                  max="10"
                  required
                />
              </div>
            </div>

            {/* Age Groups */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Age Groups</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ageGroupOptions.map((group) => (
                  <label key={group.value} className="cursor-pointer label">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={
                        formData.ageGroups?.includes(group.value) || false
                      }
                      onChange={() =>
                        handleCheckboxChange("ageGroups", group.value)
                      }
                    />
                    <span className="label-text ml-2">{group.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Availability</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availabilityOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer label">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.availability.includes(option.value)}
                      onChange={() =>
                        handleCheckboxChange("availability", option.value)
                      }
                    />
                    <span className="label-text ml-2">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Service Packages
              </h3>
              <button
                type="button"
                onClick={addPackage}
                className="btn btn-outline btn-sm"
              >
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Add Package
              </button>
            </div>

            {formData.packages.map((pkg, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">
                    Package {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label htmlFor={pkg.name}>Package Name</label>
                    <input
                      type="text"
                      placeholder="Package name"
                      value={pkg.name}
                      onChange={(e) =>
                        updatePackage(index, "name", e.target.value)
                      }
                      className="input input-bordered input-sm"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label htmlFor={pkg.name}>Duration</label>
                    <input
                      type="text"
                      placeholder="Duration (e.g., 1 month)"
                      value={pkg.duration}
                      onChange={(e) =>
                        updatePackage(index, "duration", e.target.value)
                      }
                      className="input input-bordered input-sm"
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor={pkg.name}>Percentage</label>
                    <input
                      type="string"
                      placeholder="Discount %"
                      value={Number(pkg.discountPercentage) || ""}
                      onChange={(e) =>
                        updatePackage(
                          index,
                          "discountPercentage",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="input input-bordered input-sm"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor={pkg.name}>Minimum Sessions</label>
                    <input
                      type="text"
                      placeholder="Min sessions"
                      value={Number(pkg.minimumSessions) || ""}
                      onChange={(e) =>
                        updatePackage(
                          index,
                          "minimumSessions",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="input input-bordered input-sm"
                      min="1"
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor={pkg.name}>Description</label>
                    <textarea
                      placeholder="Package description"
                      value={pkg.description}
                      onChange={(e) =>
                        updatePackage(index, "description", e.target.value)
                      }
                      className="textarea w-full textarea-bordered textarea-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="space-y-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status *</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Service"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
