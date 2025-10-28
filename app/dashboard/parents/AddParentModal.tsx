"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface AddParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParentAdded: () => void;
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

export default function AddParentModal({
  isOpen,
  onClose,
  onParentAdded,
}: AddParentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    children: [] as Array<{
      name: string;
      age: number;
      class: string;
      schoolName: string;
      subjects: string[];
    }>,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          name: "",
          age: 5,
          class: "",
          schoolName: "",
          subjects: [],
        },
      ],
    }));
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const updateChild = (
    index: number,
    field: string,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const handleChildSubjectChange = (childIndex: number, subject: string) => {
    const currentSubjects = formData.children[childIndex].subjects;
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];

    updateChild(childIndex, "subjects", newSubjects);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      children: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error("Parent name is required");
        return;
      }

      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Validate children data
      for (let i = 0; i < formData.children.length; i++) {
        const child = formData.children[i];
        if (!child.name.trim()) {
          toast.error(`Child ${i + 1}: Name is required`);
          return;
        }
        if (child.age < 1 || child.age > 18) {
          toast.error(`Child ${i + 1}: Age must be between 1 and 18`);
          return;
        }
      }

      const response = await fetch("/api/parents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          children: formData.children.map((child) => ({
            name: child.name.trim(),
            age: child.age,
            class: child.class.trim(),
            schoolName: child.schoolName.trim(),
            subjects: child.subjects,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Parent added successfully!");
        resetForm();
        onParentAdded();
        onClose();
      } else {
        throw new Error(result.error || "Failed to add parent");
      }
    } catch (error) {
      console.error("Error adding parent:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add parent"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Add New Parent</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Parent Information */}
            <div>
              <h4 className="font-semibold text-base text-primary mb-4">
                Parent Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Email Address *
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Address</span>
                  </label>
                  <textarea
                    name="address"
                    className="textarea textarea-bordered"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter home address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Children Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-base text-secondary">
                  Children Information
                </h4>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={addChild}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Child
                </button>
              </div>

              {formData.children.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    No children added yet. Click &quot;Add Child&quot; to get
                    started.
                  </p>
                </div>
              )}

              {formData.children.map((child, index) => (
                <div key={index} className="card bg-base-200 p-6 mb-4 relative">
                  <button
                    type="button"
                    className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                    onClick={() => removeChild(index)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Child Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={child.name}
                        onChange={(e) =>
                          updateChild(index, "name", e.target.value)
                        }
                        placeholder="Enter child's name"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Age *</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={child.age}
                        onChange={(e) =>
                          updateChild(
                            index,
                            "age",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        max="18"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Class/Grade
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={child.class}
                        onChange={(e) =>
                          updateChild(index, "class", e.target.value)
                        }
                        placeholder="e.g., Grade 5, JSS 2"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          School Name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={child.schoolName}
                        onChange={(e) =>
                          updateChild(index, "schoolName", e.target.value)
                        }
                        placeholder="Enter school name"
                      />
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text font-medium">
                        Subjects of Interest
                      </span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                      {subjectOptions.map((subject) => (
                        <label key={subject} className="label cursor-pointer">
                          <span className="label-text text-xs">{subject}</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={child.subjects.includes(subject)}
                            onChange={() =>
                              handleChildSubjectChange(index, subject)
                            }
                          />
                        </label>
                      ))}
                    </div>
                    {child.subjects.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Selected: {child.subjects.length} subject(s)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                  Adding...
                </>
              ) : (
                "Add Parent"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
