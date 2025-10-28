"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Child {
  childId?: string;
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
  subjects?: string[];
  parentId?: string;
  parentName: string | null;
  parentEmail: string | null;
  services: Array<{
    serviceType: string;
    status: string;
    bookingId: string;
    createdAt: Date;
  }>;
}

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildUpdated: () => void;
  child: Child | null;
}

const subjectOptions = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
  "Arts",
  "Music",
  "French",
  "Spanish",
  "Physical Education",
  "Literature",
  "Economics",
  "Government",
  "Agricultural Science",
  "Technical Drawing",
  "Home Economics",
];

export default function EditChildModal({
  isOpen,
  onClose,
  onChildUpdated,
  child,
}: EditChildModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: 5,
    gender: "",
    class: "",
    schoolName: "",
    subjects: [] as string[],
  });
  const [originalName, setOriginalName] = useState("");

  // Populate form data when child prop changes
  useEffect(() => {
    if (child && isOpen) {
      setFormData({
        name: child.name || "",
        age: child.age || 5,
        gender: child.gender || "",
        class: child.class || "",
        schoolName: child.schoolName || "",
        subjects: child.subjects || [],
      });
      setOriginalName(child.name || "");
    }
  }, [child, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!child?.parentId) {
      toast.error("Parent ID is required");
      return;
    }

    if (!originalName) {
      toast.error("Original child name is required");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Child name is required");
      return;
    }

    if (formData.age < 1 || formData.age > 18) {
      toast.error("Please enter a valid age between 1 and 18");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/children", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: child.parentId,
          originalName,
          name: formData.name.trim(),
          age: formData.age,
          gender: formData.gender,
          class: formData.class.trim(),
          schoolName: formData.schoolName.trim(),
          subjects: formData.subjects,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Child updated successfully!");
        onChildUpdated();
        onClose();
      } else {
        toast.error(result.error || "Failed to update child");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update child");
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
      <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Edit Child Profile</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Child Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter child's full name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Age *</span>
                </label>
                <input
                  type="number"
                  name="age"
                  className="input input-bordered"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="18"
                  placeholder="Age"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender *</span>
                </label>
                <select
                  name="gender"
                  className="select select-bordered"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Class/Grade</span>
                </label>
                <input
                  type="text"
                  name="class"
                  className="input input-bordered"
                  value={formData.class}
                  onChange={handleInputChange}
                  placeholder="e.g., Grade 5, JSS 2, SS 1"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">School Name</span>
                </label>
                <input
                  type="text"
                  name="schoolName"
                  className="input input-bordered"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              Subjects of Interest
            </h4>
            <p className="text-sm text-gray-600">
              Select the subjects this child is interested in or needs help
              with:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {subjectOptions.map((subject) => (
                <label key={subject} className="label cursor-pointer">
                  <span className="label-text text-sm">{subject}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                  />
                </label>
              ))}
            </div>

            {formData.subjects.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">Selected Subjects:</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject) => (
                    <div key={subject} className="badge badge-primary badge-sm">
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Parent Information (Read-only) */}
          {child && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-base text-primary">
                Parent Information
              </h4>
              <div className="bg-base-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Parent Name:
                    </span>
                    <p className="text-gray-900">
                      {child.parentName || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Parent Email:
                    </span>
                    <p className="text-gray-900">
                      {child.parentEmail || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Information (Read-only) */}
          {child && child.services.length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-base text-primary">
                Active Services
              </h4>
              <div className="bg-base-200 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-2">
                  {child.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium">{service.serviceType}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge badge-sm ${
                            service.status === "active"
                              ? "badge-success"
                              : service.status === "pending"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {service.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                "Update Child"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
