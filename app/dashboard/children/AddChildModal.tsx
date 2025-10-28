"use client";

import { useState } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Parent {
  _id: string;
  name: string;
  email: string;
}

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: () => void;
  parents: Parent[];
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

export default function AddChildModal({
  isOpen,
  onClose,
  onChildAdded,
  parents,
}: AddChildModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: 5,
    gender: "",
    class: "",
    schoolName: "",
    subjects: [] as string[],
    parentId: "",
    parentName: "",
    parentEmail: "",
  });

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
      parent.email.toLowerCase().includes(parentSearch.toLowerCase())
  );

  const selectParent = (parent: Parent) => {
    setFormData((prev) => ({
      ...prev,
      parentId: parent._id,
      parentName: parent.name,
      parentEmail: parent.email,
    }));
    setParentSearch(`${parent.name} (${parent.email})`);
    setShowParentDropdown(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
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

  const resetForm = () => {
    setFormData({
      name: "",
      age: 5,
      gender: "",
      class: "",
      schoolName: "",
      subjects: [],
      parentId: "",
      parentName: "",
      parentEmail: "",
    });
    setParentSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Child name is required");
        return;
      }

      if (!formData.parentId) {
        toast.error("Please select a parent");
        return;
      }

      if (formData.age < 1 || formData.age > 18) {
        toast.error("Age must be between 1 and 18");
        return;
      }

      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: formData.parentId,
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
        toast.success("Child added successfully!");
        resetForm();
        onChildAdded();
        onClose();
      } else {
        throw new Error(result.error || "Failed to add child");
      }
    } catch (error) {
      console.error("Error adding child:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add child"
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
      <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Add New Child</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Parent Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Select Parent *</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pr-10"
                    placeholder="Search parent by name or email..."
                    value={parentSearch}
                    onChange={(e) => {
                      setParentSearch(e.target.value);
                      setShowParentDropdown(true);
                      if (!e.target.value) {
                        setFormData((prev) => ({
                          ...prev,
                          parentId: "",
                          parentName: "",
                          parentEmail: "",
                        }));
                      }
                    }}
                    onFocus={() => setShowParentDropdown(true)}
                    required
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {showParentDropdown && filteredParents.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredParents.map((parent) => (
                      <div
                        key={parent._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                        onClick={() => selectParent(parent)}
                      >
                        <div className="font-medium">{parent.name}</div>
                        <div className="text-sm text-gray-600">
                          {parent.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showParentDropdown &&
                  filteredParents.length === 0 &&
                  parentSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="px-4 py-2 text-gray-500">
                        No parents found
                      </div>
                    </div>
                  )}
              </div>
              {formData.parentId && (
                <div className="text-sm text-success mt-1">
                  Selected: {formData.parentName}
                </div>
              )}
            </div>

            {/* Child Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Child Name *</span>
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
                  <span className="label-text font-medium">Age *</span>
                </label>
                <input
                  type="number"
                  name="age"
                  className="input input-bordered"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="18"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Gender *</span>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Class/Grade</span>
                </label>
                <input
                  type="text"
                  name="class"
                  className="input input-bordered"
                  value={formData.class}
                  onChange={handleInputChange}
                  placeholder="e.g., Grade 5, Year 9, JSS 2"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">School Name</span>
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

            {/* Subjects */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Subjects of Interest
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
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
                <div className="text-sm text-gray-600 mt-2">
                  Selected: {formData.subjects.length} subject(s)
                </div>
              )}
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
                "Add Child"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
