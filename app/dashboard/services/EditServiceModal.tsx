"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { ServiceInterface } from "@/models/Service";
import { ClientServiceInterface } from "./action";
import toast from "react-hot-toast";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceUpdated: (service: ClientServiceInterface) => void;
  service: ClientServiceInterface | null;
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

export default function EditServiceModal({
  isOpen,
  onClose,
  onServiceUpdated,
  service,
}: EditServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "childcare" as ServiceInterface["type"],
    description: "",
    shortDescription: "",
    image: "",
    baseRate: "",
    virtualRate: "11000",
    physicalRate: "12000",
    currency: "NGN",
    billingType: "hourly" as ServiceInterface["pricing"]["billingType"],
    status: "active" as ServiceInterface["status"],
    keyFeatures: [] as string[],
    availability: "",
    ageGroup: "",
    venueTypes: [] as string[],
    packages: [] as Array<{
      name: string;
      description: string;
      duration: string;
      discountPercentage: number;
      minimumSessions?: number;
    }>,
  });

  // Populate form data when service prop changes
  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        name: service.name || "",
        type: service.type || "childcare",
        description: service.description || "",
        shortDescription: service.shortDescription || "",
        image: service.image || "",
        baseRate: service.pricing?.baseRate?.toString() || "",
        virtualRate:
          service.pricing?.locationRates?.virtual?.toString() || "11000",
        physicalRate:
          service.pricing?.locationRates?.physical?.toString() || "12000",
        currency: service.pricing?.currency || "NGN",
        billingType: service.pricing?.billingType || "hourly",
        status: service.status || "active",
        keyFeatures: service.keyFeatures || [],
        availability: service.availability || "",
        ageGroup: service.requirements?.ageGroup || "",
        venueTypes: service.requirements?.venueTypes || [],
        packages: service.pricing?.packages || [],
      });
    }
  }, [service, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        image: data.url,
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Key Features Management
  const [currentFeature, setCurrentFeature] = useState("");

  const addFeature = () => {
    if (
      currentFeature.trim() &&
      !formData.keyFeatures.includes(currentFeature.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, currentFeature.trim()],
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  // Venue Types Management
  const handleVenueTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      venueTypes: prev.venueTypes.includes(value)
        ? prev.venueTypes.filter((item) => item !== value)
        : [...prev.venueTypes, value],
    }));
  };

  // Package Management
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

  const removePackage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service?._id) {
      toast.error("Service ID is required");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Service description is required");
      return;
    }

    if (
      !formData.baseRate ||
      isNaN(parseFloat(formData.baseRate)) ||
      parseFloat(formData.baseRate) <= 0
    ) {
      toast.error("Valid base rate is required");
      return;
    }

    setIsLoading(true);

    try {
      const serviceData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        image: formData.image,
        status: formData.status,
        keyFeatures: formData.keyFeatures,
        availability: formData.availability,
        pricing: {
          baseRate: formData.baseRate,
          currency: formData.currency,
          billingType: formData.billingType,
          locationRates:
            formData.type === "tutoring"
              ? {
                  virtual: parseInt(formData.virtualRate) || 11000,
                  physical: parseInt(formData.physicalRate) || 12000,
                }
              : undefined,
          packages: formData.packages.filter((pkg) => pkg.name.trim()),
        },
        requirements: {
          ageGroup: formData.ageGroup,
          venueTypes: formData.venueTypes as Array<
            "indoor" | "outdoor" | "both"
          >,
          minimumParticipants: 1,
          maximumParticipants: 20,
        },
      };

      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service._id,
          serviceData: serviceData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Service updated successfully!");
        // Create updated service object
        const updatedService: ClientServiceInterface = {
          ...service!,
          ...serviceData,
        };
        onServiceUpdated(updatedService);
        onClose();
      } else {
        toast.error(result.error || "Failed to update service");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Edit Service</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Basic Information
              </h4>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Service Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  required
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Service Type *</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Status *</span>
                </label>
                <select
                  name="status"
                  className="select select-bordered"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Short Description</span>
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  className="input input-bordered"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief description (optional)"
                  maxLength={100}
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Description *</span>
                </label>
                <textarea
                  name="description"
                  className="textarea w-full textarea-bordered h-24"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed service description"
                  required
                />
              </div>
            </div>

            {/* Image Upload and Pricing */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Image & Pricing
              </h4>

              {/* Image Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Service Image</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.image ? (
                    <div className="relative">
                      <Image
                        src={formData.image}
                        alt="Service preview"
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-48">
                      <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {uploadingImage
                          ? "Uploading..."
                          : "Click to upload image"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Base Rate *</span>
                  </label>
                  <input
                    type="number"
                    name="baseRate"
                    className="input input-bordered"
                    value={formData.baseRate}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Currency</span>
                  </label>
                  <select
                    name="currency"
                    className="select select-bordered"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Billing Type *</span>
                </label>
                <select
                  name="billingType"
                  className="select select-bordered"
                  value={formData.billingType}
                  onChange={handleInputChange}
                  required
                >
                  {billingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tutoring Location Rates - Show only for tutoring service */}
              {formData.type === "tutoring" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Tutoring Location-Based Rates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Virtual Rate (₦/hour)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="virtualRate"
                        value={formData.virtualRate}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                        placeholder="11000"
                        min="0"
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-600">
                          Rate for online tutoring sessions
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Physical Rate (₦/hour)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="physicalRate"
                        value={formData.physicalRate}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                        placeholder="12000"
                        min="0"
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-600">
                          Rate for in-person tutoring sessions
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-[#A25F97] mb-4">
              Key Features
            </h4>
            <div className="form-control">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder="Add a key feature"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                />
                <button
                  type="button"
                  className="btn btn-[#A25F97]"
                  onClick={addFeature}
                  disabled={!currentFeature.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {formData.keyFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="badge bg-[#A25F97] text-white gap-2"
                    >
                      {feature}
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost btn-circle "
                        onClick={() => removeFeature(index)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-[#A25F97] mb-4">
              Availability
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                className="input input-bordered"
                placeholder="Availability"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              />
            </div>
          </div>

          {/* Age Groups */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-[#A25F97] mb-4">
              Age Groups
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                className="input input-bordered"
                placeholder="Enter age group"
                value={formData.ageGroup}
                onChange={(e) =>
                  setFormData({ ...formData, ageGroup: e.target.value })
                }
              />
            </div>
          </div>

          {/* Venue Types */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-[#A25F97] mb-4">
              Venue Types
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {venueTypeOptions.map((option) => (
                <label key={option.value} className="label cursor-pointer">
                  <span className="label-text">{option.label}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-[#A25F97]"
                    checked={formData.venueTypes.includes(option.value)}
                    onChange={() => handleVenueTypeChange(option.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-base text-[#A25F97]">
                Service Packages
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-[#A25F97]"
                onClick={addPackage}
              >
                Add Package
              </button>
            </div>

            {formData.packages.map((pkg, index) => (
              <div key={index} className="card bg-base-200 p-4 mb-4 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                  onClick={() => removePackage(index)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Package Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={pkg.name}
                      onChange={(e) =>
                        updatePackage(index, "name", e.target.value)
                      }
                      placeholder="e.g., Weekly Package"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Duration</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={pkg.duration}
                      onChange={(e) =>
                        updatePackage(index, "duration", e.target.value)
                      }
                      placeholder="e.g., 1 week, 1 month"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Discount %</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered input-sm"
                      value={pkg.discountPercentage}
                      onChange={(e) =>
                        updatePackage(
                          index,
                          "discountPercentage",
                          e.target.value
                        )
                      }
                      onBlur={(e) =>
                        updatePackage(
                          index,
                          "discountPercentage",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={100}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Min Sessions</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm"
                      value={pkg.minimumSessions || ""}
                      onChange={(e) =>
                        updatePackage(
                          index,
                          "minimumSessions",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      placeholder="1"
                    />
                  </div>

                  <div className="form-control flex flex-col w-full md:col-span-2">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-sm"
                      value={pkg.description}
                      onChange={(e) =>
                        updatePackage(index, "description", e.target.value)
                      }
                      placeholder="Package description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={handleClose}
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
                  Updating...
                </>
              ) : (
                "Update Service"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
