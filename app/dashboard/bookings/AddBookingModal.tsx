"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Child {
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
}

interface Schedule {
  startDate: string;
  endDate?: string;
  weekdays?: Array<{
    day:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    hours: number;
    startTime?: string;
    endTime?: string;
  }>;
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
}

interface BookingData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  serviceType:
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment";
  totalCost: number;
  children: Child[];
  schedule?: Schedule;
  specialRequests?: string;
}

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBookingModal = forwardRef<
  { resetForm: () => void },
  AddBookingModalProps
>(({ isOpen, onClose, onSuccess }, ref) => {
  const [formData, setFormData] = useState<BookingData>({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    serviceType: "childcare",
    totalCost: 0,
    children: [{ name: "", age: 5, gender: "male" }],
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [showInvoiceOption, setShowInvoiceOption] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  const resetForm = () => {
    setFormData({
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      serviceType: "childcare",
      totalCost: 0,
      children: [{ name: "", age: 5, gender: "male" }],
      specialRequests: "",
    });
    setCreatedBookingId(null);
    setShowInvoiceOption(false);
  };

  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalCost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleChildChange = (
    index: number,
    field: keyof Child,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [...prev.children, { name: "", age: 5, gender: "male" }],
    }));
  };

  const removeChild = (index: number) => {
    if (formData.children.length > 1) {
      setFormData((prev) => ({
        ...prev,
        children: prev.children.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateCost = () => {
    const baseCosts = {
      childcare: 5000,
      tutoring: 12000, // Physical tutoring default
      "tutoring-virtual": 11000,
      homeschooling: 10000,
      "holiday-camps": 30000,
      "space-rental": 250000,
      "kiddies-enrichment": 8000,
    };

    let cost = baseCosts[formData.serviceType as keyof typeof baseCosts] || 0;

    // Use location-based rate for tutoring
    if (formData.serviceType === "tutoring") {
      cost = 12000; // Default to physical rate
    }

    const childrenCount = formData.children.length;

    let totalCost = cost;
    if (
      formData.serviceType === "tutoring" ||
      formData.serviceType === "childcare"
    ) {
      totalCost = cost * childrenCount;
    }

    setFormData((prev) => ({ ...prev, totalCost }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceType = e.target.value as BookingData["serviceType"];
    setFormData((prev) => ({ ...prev, serviceType }));

    // Recalculate cost when service type changes
    setTimeout(calculateCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.parentName ||
      !formData.parentEmail ||
      !formData.serviceType
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Booking created successfully!");
        setCreatedBookingId(result._id || result.id);
        setShowInvoiceOption(true);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create booking");
      }
    } catch {
      toast.error("Error creating booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!createdBookingId) {
      toast.error("No booking ID available");
      return;
    }

    setIsSendingInvoice(true);

    try {
      const response = await fetch(
        `/api/bookings/${createdBookingId}/invoice`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Invoice ${result.invoiceNumber} sent to ${result.sentTo}!`
        );
        setShowInvoiceOption(false);
        resetForm();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate invoice");
      }
    } catch {
      toast.error("Error generating invoice");
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleSkipInvoice = () => {
    setShowInvoiceOption(false);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Add New Booking</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Parent Name *</span>
              </label>
              <input
                type="text"
                name="parentName"
                className="input input-bordered"
                value={formData.parentName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Parent Email *</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered"
                value={formData.parentEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Parent Phone</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                className="input input-bordered"
                value={formData.parentPhone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Service Type *</span>
              </label>
              <select
                name="serviceType"
                className="select select-bordered"
                value={formData.serviceType}
                onChange={handleServiceChange}
                required
              >
                <option value="">Select Service</option>
                <option value="childcare">Childcare</option>
                <option value="tutoring">Tutoring</option>
                <option value="homeschooling">Homeschooling</option>
                <option value="holiday-camps">Holiday Camps</option>
                <option value="space-rental">Space Rental</option>
                <option value="kiddies-enrichment">Kiddies Enrichment</option>
              </select>
            </div>
          </div>

          {/* Children Information */}
          <div className="divider">Children Information</div>

          {formData.children.map((child, index) => (
            <div key={index} className="card bg-base-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Child {index + 1}</h4>
                {formData.children.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-error btn-outline"
                    onClick={() => removeChild(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={child.name}
                    onChange={(e) =>
                      handleChildChange(index, "name", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Age</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    min="1"
                    max="18"
                    value={child.age}
                    onChange={(e) =>
                      handleChildChange(index, "age", parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Class</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    placeholder="e.g., Grade 3, JSS 1"
                    value={child.class || ""}
                    onChange={(e) =>
                      handleChildChange(index, "class", e.target.value)
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">School Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    placeholder="Name of school"
                    value={child.schoolName || ""}
                    onChange={(e) =>
                      handleChildChange(index, "schoolName", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addChild}
          >
            Add Another Child
          </button>

          {/* Additional Information */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Cost</span>
            </label>
            <input
              type="number"
              name="totalCost"
              className="input input-bordered"
              value={formData.totalCost}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Special Requests</span>
            </label>
            <textarea
              name="specialRequests"
              className="textarea textarea-bordered"
              rows={3}
              placeholder="Any additional requirements or special requests"
              value={formData.specialRequests}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>

        {/* Invoice Generation Option */}
        {showInvoiceOption && (
          <div className="mt-6 p-4 bg-[#90AC19]/10 border-2 border-[#90AC19] rounded-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg
                  className="w-6 h-6 text-[#90AC19]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">
                  📋 Generate Invoice
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  Would you like to generate and send an invoice to the
                  parent&apos;s email ({formData.parentEmail})?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={isSendingInvoice}
                    className={`btn btn-sm btn-primary ${
                      isSendingInvoice ? "loading" : ""
                    }`}
                  >
                    {isSendingInvoice
                      ? "Sending..."
                      : "Generate & Send Invoice"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipInvoice}
                    disabled={isSendingInvoice}
                    className="btn btn-sm btn-ghost"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
});

AddBookingModal.displayName = "AddBookingModal";

export default AddBookingModal;
