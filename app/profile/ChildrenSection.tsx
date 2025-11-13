"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Child {
  _id?: string; // This will be the array index
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
  subjects?: string[];
  services?: Array<{
    serviceType: string;
    status: string;
    bookingId: string;
    createdAt: Date;
  }>;
}

export default function ChildrenSection() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/users/children");
      if (response.ok) {
        const data = await response.json();
        // Map children with their array index as _id
        const childrenWithIds = (data.children || []).map(
          (child: Child, index: number) => ({
            ...child,
            _id: index.toString(),
          })
        );
        setChildren(childrenWithIds);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
      toast.error("Failed to load children information");
    } finally {
      setLoading(false);
    }
  };

  const saveChild = async (child: Child) => {
    try {
      const method = child._id ? "PATCH" : "POST";
      const url = child._id
        ? `/api/users/children/${child._id}`
        : "/api/users/children";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(child),
      });

      if (response.ok) {
        toast.success(
          child._id
            ? "Child updated successfully!"
            : "Child added successfully!"
        );
        await fetchChildren(); // Refresh the list
        setEditingChild(null);
        setShowAddModal(false);
      } else {
        toast.error("Failed to save child information");
      }
    } catch (error) {
      console.error("Failed to save child:", error);
      toast.error("Failed to save child information");
    }
  };

  const deleteChild = async (childId: string) => {
    if (
      !confirm("Are you sure you want to delete this child&apos;s information?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/children/${childId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Child information deleted successfully!");
        await fetchChildren(); // Refresh the list
      } else {
        toast.error("Failed to delete child information");
      }
    } catch (error) {
      console.error("Failed to delete child:", error);
      toast.error("Failed to delete child information");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">
            Loading children information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base-content">My Children</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Child
        </button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl text-base-content/20 mb-4">
            <UserCircleIcon className="w-24 h-24 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No children added yet
          </h3>
          <p className="text-base-content/70 mb-4">
            Add your children&apos;s information to make booking services
            easier.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <div key={child._id} className="card bg-base-100 border shadow-sm">
              <div className="card-body p-4">
                <h3 className="card-title text-lg">{child.name}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Age:</span> {child.age} years
                    old
                  </p>
                  {child.class && (
                    <p>
                      <span className="font-medium">Class:</span> {child.class}
                    </p>
                  )}
                  {child.schoolName && (
                    <p>
                      <span className="font-medium">School:</span>{" "}
                      {child.schoolName}
                    </p>
                  )}
                  {child.gender && (
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {child.gender.charAt(0).toUpperCase() +
                        child.gender.slice(1)}
                    </p>
                  )}
                  {child.subjects && child.subjects.length > 0 && (
                    <p>
                      <span className="font-medium">Subjects:</span>{" "}
                      {child.subjects.join(", ")}
                    </p>
                  )}
                  {child.services && child.services.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium">Enrolled Services:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {child.services.map((service, idx) => (
                          <span
                            key={idx}
                            className={`badge badge-sm ${
                              service.status === "completed"
                                ? "badge-success"
                                : service.status === "confirmed"
                                ? "badge-info"
                                : service.status === "pending"
                                ? "badge-warning"
                                : "badge-ghost"
                            }`}
                          >
                            {service.serviceType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => setEditingChild(child)}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChild(child._id!)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingChild) && (
        <ChildModal
          child={editingChild}
          onSave={saveChild}
          onClose={() => {
            setShowAddModal(false);
            setEditingChild(null);
          }}
        />
      )}
    </div>
  );
}

// Child Modal Component
interface ChildModalProps {
  child: Child | null;
  onSave: (child: Child) => void;
  onClose: () => void;
}

function ChildModal({ child, onSave, onClose }: ChildModalProps) {
  const [formData, setFormData] = useState<Child>({
    name: child?.name || "",
    age: child?.age || 1,
    gender: child?.gender || "male",
    class: child?.class || "",
    schoolName: child?.schoolName || "",
    subjects: child?.subjects || [],
    _id: child?._id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter the child's name");
      return;
    }
    if (formData.age < 1 || formData.age > 18) {
      toast.error("Please enter a valid age (1-18)");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-box w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <h3 className="font-bold text-lg mb-4">
            {child ? "Edit Child Information" : "Add New Child"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input input-bordered"
                placeholder="Enter child's name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Age *</span>
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    age: parseInt(e.target.value) || 1,
                  }))
                }
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Class/Grade</span>
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, class: e.target.value }))
                }
                className="input input-bordered"
                placeholder="e.g., Grade 5, JSS 1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender *</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: e.target.value as "male" | "female",
                  }))
                }
                className="select select-bordered"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">School Name</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schoolName: e.target.value,
                  }))
                }
                className="input input-bordered"
                placeholder="Enter school name"
              />
            </div>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Subjects (comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.subjects?.join(", ") || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subjects: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              className="input input-bordered"
              placeholder="e.g., Mathematics, English, Science"
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              {child ? "Update Child" : "Add Child"}
            </button>
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
