"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PhoneInput from "@/components/PhoneInput";

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

interface Booking {
  _id: string;
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalCost: number;
  createdAt: string;
  children?: Child[];
  specialRequests?: string;
  schedule?: Schedule;
  payment?: {
    status?: "pending" | "paid" | "refunded";
  };
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: EditBookingModalProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        parentName: booking.parentName,
        parentEmail: booking.parentEmail,
        parentPhone: booking.parentPhone,
        serviceType: booking.serviceType,
        status: booking.status,
        payment: booking.payment,
        totalCost: booking.totalCost,
        children: booking.children || [],
        specialRequests: booking.specialRequests || "",
      });
    }
  }, [booking]);

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
      children: (prev.children || []).map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...(prev.children || []),
        { name: "", age: 5, gender: "male" },
      ],
    }));
  };

  const removeChild = (index: number) => {
    if ((formData.children || []).length > 1) {
      setFormData((prev) => ({
        ...prev,
        children: (prev.children || []).filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.parentName ||
      !formData.parentEmail ||
      !formData.serviceType ||
      !booking
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Booking updated successfully!");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update booking");
      }
    } catch {
      toast.error("Error updating booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Booking</h3>
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
                value={formData.parentName || ""}
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
                value={formData.parentEmail || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <PhoneInput
              label="Parent Phone"
              value={formData.parentPhone || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, parentPhone: value }))
              }
              wrapperClassName="form-control"
              inputClassName="input input-bordered rounded-r-lg rounded-l-none"
              selectClassName="select select-bordered rounded-r-none border-r-0"
              showPreview={false}
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text">Service Type *</span>
              </label>
              <select
                name="serviceType"
                className="select select-bordered"
                value={formData.serviceType || ""}
                onChange={handleInputChange}
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

            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                name="status"
                className="select select-bordered"
                value={formData.status || ""}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                {formData.payment?.status === "paid" && (
                  <option value="confirmed">Confirmed</option>
                )}
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formData.payment?.status !== "paid" && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    Use Payment Reconciliation in the booking view to mark paid
                    before setting Confirmed.
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Total Cost</span>
              </label>
              <input
                type="number"
                name="totalCost"
                className="input input-bordered"
                value={formData.totalCost || 0}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Children Information */}
          {formData.children && formData.children.length > 0 && (
            <>
              <div className="divider">Children Information</div>

              {formData.children.map((child, index) => (
                <div key={index} className="card bg-base-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Child {index + 1}</h4>
                    {formData.children!.length > 1 && (
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
                        max="10"
                        value={child.age}
                        onChange={(e) =>
                          handleChildChange(
                            index,
                            "age",
                            parseInt(e.target.value)
                          )
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
            </>
          )}

          {/* Special Requests */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Special Requests</span>
            </label>
            <textarea
              name="specialRequests"
              className="textarea textarea-bordered"
              rows={3}
              placeholder="Any additional requirements or special requests"
              value={formData.specialRequests || ""}
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
              {isSubmitting ? "Updating..." : "Update Booking"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
