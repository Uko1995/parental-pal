"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PhoneInput from "@/components/PhoneInput";

interface SerializedParentWithStats {
  _id: string | undefined;
  userData: {
    expiresAt: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  phone?: string;
  address?: string;
  image?: string;
  googleId?: string;
  role: "admin" | "parent" | "tutor";
  isActive: boolean;
  lastLoginAt?: string | null;
  membershipType: "basic" | "premium" | "none";
  children?: {
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }[];
  preferences?: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
  stats: {
    totalBookings: number;
    activeBookings: number;
    totalSpent: number;
    childrenCount: number;
    lastBookingDate: number | null;
  };
}

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParentUpdated: (updatedParent: SerializedParentWithStats) => void;
  parent: SerializedParentWithStats | null;
}

const preferredServiceOptions = [
  "childcare",
  "tutoring",
  "homeschooling",
  "holiday-camps",
  "space-rental",
  "kiddies-enrichment",
];

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
];

interface ChildData {
  name: string;
  age: number;
  class?: string;
  schoolName?: string;
  subjects?: string[];
}

export default function EditParentModal({
  isOpen,
  onClose,
  onParentUpdated,
  parent,
}: EditParentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    address: "",

    // Status
    isActive: true,
    membershipType: "basic" as "basic" | "premium" | "none",

    // Children
    children: [] as ChildData[],

    // Preferences
    preferredServices: [] as string[],
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  // Populate form data when parent prop changes
  useEffect(() => {
    if (parent && isOpen) {
      setFormData({
        name: parent.userData?.user?.name || "",
        email: parent.userData?.user?.email || "",
        phone: parent.phone || "",
        address: parent.address || "",

        isActive: parent.isActive,
        membershipType: parent.membershipType,

        children: parent.children || [],

        preferredServices:
          (parent.preferences as { preferredServices?: string[] })
            ?.preferredServices || [],
        emergencyContactName:
          (parent.preferences as { emergencyContact?: { name?: string } })
            ?.emergencyContact?.name || "",
        emergencyContactPhone:
          (parent.preferences as { emergencyContact?: { phone?: string } })
            ?.emergencyContact?.phone || "",
        emergencyContactRelationship:
          (
            parent.preferences as {
              emergencyContact?: { relationship?: string };
            }
          )?.emergencyContact?.relationship || "",
        emailNotifications:
          (parent.preferences as { notifications?: { email?: boolean } })
            ?.notifications?.email ?? true,
        smsNotifications:
          (parent.preferences as { notifications?: { sms?: boolean } })
            ?.notifications?.sms ?? true,
        pushNotifications:
          (parent.preferences as { notifications?: { push?: boolean } })
            ?.notifications?.push ?? true,
      });
    }
  }, [parent, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (
    name: string,
    value: string | boolean,
    isArray = false
  ) => {
    if (isArray && typeof value === "string") {
      setFormData((prev) => ({
        ...prev,
        [name]: (prev[name as keyof typeof prev] as string[]).includes(value)
          ? (prev[name as keyof typeof prev] as string[]).filter(
              (item) => item !== value
            )
          : [...(prev[name as keyof typeof prev] as string[]), value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Child management functions
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

  const updateChild = (
    index: number,
    field: keyof ChildData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const handleChildSubjectChange = (childIndex: number, subject: string) => {
    const child = formData.children[childIndex];
    const currentSubjects = child.subjects || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];

    updateChild(childIndex, "subjects", updatedSubjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parent?._id) {
      toast.error("Parent ID is required");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        userData: {
          expiresAt: parent.userData.expiresAt,
          user: {
            name: formData.name,
            email: formData.email,
            image: parent.userData.user.image,
          },
        },
        phone: formData.phone,
        address: formData.address,
        isActive: formData.isActive,
        membershipType: formData.membershipType,
        children: formData.children,
        preferences: {
          notifications: {
            email: formData.emailNotifications,
            sms: formData.smsNotifications,
            push: formData.pushNotifications,
          },
          preferredServices: formData.preferredServices as Array<
            | "childcare"
            | "tutoring"
            | "homeschooling"
            | "holiday-camps"
            | "space-rental"
            | "kiddies-enrichment"
          >,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
          },
        },
        updatedAt: new Date(),
      };

      const response = await fetch("/api/parents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: parent._id,
          updateData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Parent updated successfully!");
        // Create updated parent object
        const updatedParent: SerializedParentWithStats = {
          ...parent!,
          ...updateData,
          updatedAt: updateData.updatedAt.toISOString(),
        };
        onParentUpdated(updatedParent);
        onClose();
      } else {
        toast.error(result.error || "Failed to update parent");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update parent");
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
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Edit Parent</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Personal Information
              </h4>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Full Name *</span>
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

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Email *</span>
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

              <PhoneInput
                label="Phone Number"
                value={formData.phone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, phone: value }))
                }
                wrapperClassName="form-control flex flex-col"
                inputClassName="input input-bordered rounded-r-lg rounded-l-none"
                selectClassName="select select-bordered rounded-r-none border-r-0"
                showPreview={false}
              />

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="input input-bordered"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Account Settings
              </h4>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Membership Type</span>
                </label>
                <select
                  name="membershipType"
                  className="select select-bordered select-disabled"
                  value={formData.membershipType}
                  disabled={true}
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="none">None</option>
                </select>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    Membership type cannot be changed from this panel
                  </span>
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer opacity-60">
                  <span className="label-text">Active Account</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isActive}
                    disabled={true}
                  />
                </label>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    Account status cannot be changed from this panel
                  </span>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm">
                  Notification Preferences
                </h5>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Email Notifications</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.emailNotifications}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">SMS Notifications</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.smsNotifications}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "smsNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Push Notifications</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.pushNotifications}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "pushNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Children */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-base text-primary">Children</h4>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={addChild}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Child
              </button>
            </div>

            {formData.children.map((child, index) => (
              <div key={index} className="card bg-base-200 p-4 mb-4 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                  onClick={() => removeChild(index)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Child Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={child.name}
                      onChange={(e) =>
                        updateChild(index, "name", e.target.value)
                      }
                      placeholder="Enter child's name"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Age</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered input-sm"
                      value={child.age}
                      onChange={(e) =>
                        updateChild(index, "age", parseInt(e.target.value) || 0)
                      }
                      min="0"
                      max="18"
                      placeholder="Age"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">Class</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={child.class || ""}
                      onChange={(e) =>
                        updateChild(index, "class", e.target.value)
                      }
                      placeholder="e.g., Grade 5, JSS 2"
                    />
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text">School Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={child.schoolName || ""}
                      onChange={(e) =>
                        updateChild(index, "schoolName", e.target.value)
                      }
                      placeholder="Enter school name"
                    />
                  </div>
                </div>

                {/* Child Subjects */}
                <div>
                  <label className="label">
                    <span className="label-text">Subjects of Interest</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {subjectOptions.map((subject) => (
                      <label key={subject} className="label cursor-pointer">
                        <span className="label-text text-xs">{subject}</span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-xs"
                          checked={(child.subjects || []).includes(subject)}
                          onChange={() =>
                            handleChildSubjectChange(index, subject)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preferred Services */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-primary mb-4">
              Preferred Services
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preferredServiceOptions.map((service) => (
                <label key={service} className="label cursor-pointer">
                  <span className="label-text text-sm">
                    {service
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={formData.preferredServices.includes(service)}
                    onChange={() =>
                      handleCheckboxChange("preferredServices", service, true)
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-primary mb-4">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="input input-bordered"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Emergency contact name"
                />
              </div>

              <PhoneInput
                label="Phone"
                value={formData.emergencyContactPhone}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    emergencyContactPhone: value,
                  }))
                }
                wrapperClassName="form-control"
                inputClassName="input input-bordered rounded-r-lg rounded-l-none"
                selectClassName="select select-bordered rounded-r-none border-r-0"
                showPreview={false}
              />

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Relationship</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  className="input input-bordered"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Relative"
                />
              </div>
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
                  Updating...
                </>
              ) : (
                "Update Parent"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
