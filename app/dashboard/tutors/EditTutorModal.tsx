"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserInterface } from "@/models/User";
import toast from "react-hot-toast";
import PhoneInput from "@/components/PhoneInput";

interface EditTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTutorUpdated: (updatedTutor: UserInterface) => void;
  tutor: UserInterface | null;
}

const specialtyOptions = [
  "Mathematics",
  "English Language",
  "Science",
  "Social Studies",
  "Computer Science",
  "Arts",
  "Music",
  "Sports",
  "Special Needs Education",
  "Early Childhood Education",
];

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const qualificationOptions = [
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Teaching Certificate",
  "TESOL/TEFL",
  "Montessori Certification",
  "Special Education Certification",
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

const preferredServiceOptions = [
  "childcare",
  "tutoring",
  "homeschooling",
  "holiday-camps",
  "space-rental",
  "kiddies-enrichment",
];

export default function EditTutorModal({
  isOpen,
  onClose,
  onTutorUpdated,
  tutor,
}: EditTutorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    address: "",

    // Professional Information
    specialty: "",
    experience: 0,
    qualifications: [] as string[],
    subjects: [] as string[],
    hourlyRate: 0,
    bio: "",
    isVerified: false,

    // Availability
    availabilityDays: [] as string[],
    availabilityStart: "",
    availabilityEnd: "",
    hourlyRateAccepted: false,

    // Preferences
    preferredServices: [] as string[],
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",

    // Status
    isActive: true,
    membershipType: "basic" as "basic" | "premium" | "none",
  });

  // Populate form data when tutor prop changes
  useEffect(() => {
    if (tutor && isOpen) {
      setFormData({
        name: tutor.userData?.user?.name || "",
        email: tutor.userData?.user?.email || "",
        phone: tutor.phone || "",
        address: tutor.address || "",

        specialty: tutor.tutorProfile?.specialty || "",
        experience: tutor.tutorProfile?.experience || 0,
        qualifications: tutor.tutorProfile?.qualifications || [],
        subjects: tutor.tutorProfile?.subjects || [],
        hourlyRate: tutor.tutorProfile?.hourlyRate || 0,
        bio: tutor.tutorProfile?.bio || "",
        isVerified: tutor.tutorProfile?.isVerified || false,

        availabilityDays: tutor.tutorProfile?.availability?.days || [],
        availabilityStart: tutor.tutorProfile?.availability?.hours?.start || "",
        availabilityEnd: tutor.tutorProfile?.availability?.hours?.end || "",
        hourlyRateAccepted: tutor.tutorProfile?.hourlyRateAccepted || false,

        preferredServices: tutor.preferences?.preferredServices || [],
        emergencyContactName: tutor.preferences?.emergencyContact?.name || "",
        emergencyContactPhone: tutor.preferences?.emergencyContact?.phone || "",
        emergencyContactRelationship:
          tutor.preferences?.emergencyContact?.relationship || "",

        isActive: tutor.isActive,
        membershipType: tutor.membershipType,
      });
    }
  }, [tutor, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tutor?._id) {
      toast.error("Tutor ID is required");
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

    if (!formData.specialty) {
      toast.error("Specialty is required");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        userData: {
          ...tutor.userData,
          user: {
            ...tutor.userData.user,
            name: formData.name,
            email: formData.email,
          },
        },
        phone: formData.phone,
        address: formData.address,
        isActive: formData.isActive,
        membershipType: formData.membershipType,
        tutorProfile: {
          specialty: formData.specialty,
          experience: formData.experience,
          qualifications: formData.qualifications,
          subjects: formData.subjects,
          hourlyRate: formData.hourlyRate,
          bio: formData.bio,
          isVerified: formData.isVerified,
          availability: {
            days: formData.availabilityDays as Array<
              | "Monday"
              | "Tuesday"
              | "Wednesday"
              | "Thursday"
              | "Friday"
              | "Saturday"
              | "Sunday"
            >,
            hours: {
              start: formData.availabilityStart,
              end: formData.availabilityEnd,
            },
          },
          hourlyRateAccepted: formData.hourlyRateAccepted,
          rating: tutor.tutorProfile?.rating || 0,
          totalReviews: tutor.tutorProfile?.totalReviews || 0,
        },
        preferences: {
          notifications: tutor.preferences?.notifications || {
            email: true,
            sms: true,
            push: true,
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

      const response = await fetch("/api/tutors", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: tutor._id.toString(),
          updateData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Tutor updated successfully!");
        // Pass the updated tutor data to the callback
        onTutorUpdated(result.data);
        onClose();
      } else {
        toast.error(result.error || "Failed to update tutor");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update tutor");
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
            <h3 className="font-bold text-lg">Edit Tutor</h3>
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

              {/* Status Controls */}
              <div className="space-y-3">
                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Account Status</span>
                  </label>
                  <select
                    name="membershipType"
                    className="select select-bordered"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Active Account</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleCheckboxChange("isActive", e.target.checked)
                      }
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Verified Tutor</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.isVerified}
                      onChange={(e) =>
                        handleCheckboxChange("isVerified", e.target.checked)
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Professional Information
              </h4>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Specialty *</span>
                </label>
                <select
                  name="specialty"
                  className="select select-bordered"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select specialty</option>
                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Experience (years)</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  className="input input-bordered"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  placeholder="0"
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Hourly Rate (₦)</span>
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  className="input input-bordered input-disabled"
                  value={formData.hourlyRate}
                  readOnly={true}
                  placeholder="0"
                />
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    Hourly rate is read-only and managed by admin
                  </span>
                </div>
              </div>

              <div className="form-control opacity-60">
                <label className="label cursor-pointer">
                  <span className="label-text">Accept Hourly Rate</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.hourlyRateAccepted}
                    disabled={true}
                  />
                </label>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    Rate acceptance is managed by admin
                  </span>
                </div>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered h-20"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-primary mb-4">
              Qualifications
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {qualificationOptions.map((qualification) => (
                <label key={qualification} className="label cursor-pointer">
                  <span className="label-text text-sm">{qualification}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={formData.qualifications.includes(qualification)}
                    onChange={() =>
                      handleCheckboxChange(
                        "qualifications",
                        qualification,
                        true
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-primary mb-4">
              Subjects
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjectOptions.map((subject) => (
                <label key={subject} className="label cursor-pointer">
                  <span className="label-text text-sm">{subject}</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={formData.subjects.includes(subject)}
                    onChange={() =>
                      handleCheckboxChange("subjects", subject, true)
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mt-6">
            <h4 className="font-semibold text-base text-primary mb-4">
              Availability
            </h4>

            <div className="flex flex-col gap-6">
              <div>
                <label className="label">
                  <span className="label-text">Available Days</span>
                </label>
                <div className="space-x-3 ">
                  {dayOptions.map((day) => (
                    <label key={day} className="label cursor-pointer">
                      <span className="label-text">{day}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.availabilityDays.includes(day)}
                        onChange={() =>
                          handleCheckboxChange("availabilityDays", day, true)
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-5 md:flex-row">
                <div className="form-control w-full flex flex-col">
                  <label className="label">
                    <span className="label-text">Start Time</span>
                  </label>
                  <input
                    type="text"
                    name="availabilityStart"
                    placeholder="e.g., 9:00 AM"
                    className="input  input-bordered"
                    value={formData.availabilityStart}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control w-full flex flex-col">
                  <label className="label">
                    <span className="label-text">End Time</span>
                  </label>
                  <input
                    type="text"
                    name="availabilityEnd"
                    placeholder="e.g., 5:00 PM"
                    className="input input-bordered"
                    value={formData.availabilityEnd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
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
                  placeholder="e.g., Parent, Spouse"
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
                "Update Tutor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
