"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PhoneInput from "@/components/PhoneInput";

interface AddTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTutorAdded: () => void;
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
  "Literature",
  "Economics",
  "Government",
  "Agricultural Science",
  "Technical Drawing",
  "Home Economics",
];

const experienceOptions = [
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "More than 10 years",
];

export default function AddTutorModal({
  isOpen,
  onClose,
  onTutorAdded,
}: AddTutorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    specialties: [] as string[],
    qualifications: [] as string[],
    subjects: [] as string[],
    experience: "",
    hourlyRate: 12000,
    availability: [] as string[],
    languages: [] as string[],
    certifications: [] as Array<{
      name: string;
      issuer: string;
      dateObtained: string;
      expiryDate: string;
    }>,
  });
  const [newLanguage, setNewLanguage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyRate" ? parseInt(value) || 0 : value,
    }));
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          )
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }));
  };

  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !formData.languages.includes(newLanguage.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== language),
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: "",
          issuer: "",
          dateObtained: "",
          expiryDate: "",
        },
      ],
    }));
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
      specialties: [],
      qualifications: [],
      subjects: [],
      experience: "",
      hourlyRate: 12000,
      availability: [],
      languages: [],
      certifications: [],
    });
    setNewLanguage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error("Tutor name is required");
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

      if (formData.specialties.length === 0) {
        toast.error("At least one specialty is required");
        return;
      }

      if (formData.subjects.length === 0) {
        toast.error("At least one subject is required");
        return;
      }

      if (!formData.experience) {
        toast.error("Experience level is required");
        return;
      }

      const response = await fetch("/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          bio: formData.bio.trim(),
          specialties: formData.specialties,
          qualifications: formData.qualifications,
          subjects: formData.subjects,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          availability: formData.availability,
          languages: formData.languages,
          certifications: formData.certifications.filter((cert) =>
            cert.name.trim()
          ),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Tutor added successfully!");
        resetForm();
        onTutorAdded();
        onClose();
      } else {
        throw new Error(result.error || "Failed to add tutor");
      }
    } catch (error) {
      console.error("Error adding tutor:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add tutor"
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
      <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Add New Tutor</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-primary">
                Basic Information
              </h4>

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

              <PhoneInput
                label="Phone Number"
                value={formData.phone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, phone: value }))
                }
                wrapperClassName="form-control"
                inputClassName="input input-bordered rounded-r-lg rounded-l-none"
                selectClassName="select select-bordered rounded-r-none border-r-0"
                showPreview={false}
              />

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Address</span>
                </label>
                <textarea
                  name="address"
                  className="textarea textarea-bordered"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description about the tutor"
                  rows={4}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Experience Level *
                  </span>
                </label>
                <select
                  name="experience"
                  className="select select-bordered"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Hourly Rate (₦)
                  </span>
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  className="input input-bordered"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  min="1000"
                  step="1000"
                  placeholder="12000"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-secondary">
                Professional Information
              </h4>

              {/* Specialties */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Specialties *</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="label cursor-pointer">
                      <span className="label-text text-sm">{specialty}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() =>
                          handleMultiSelectChange("specialties", specialty)
                        }
                      />
                    </label>
                  ))}
                </div>
                {formData.specialties.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Selected: {formData.specialties.length} specialty(s)
                  </div>
                )}
              </div>

              {/* Subjects */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Subjects *</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {subjectOptions.map((subject) => (
                    <label key={subject} className="label cursor-pointer">
                      <span className="label-text text-xs">{subject}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={formData.subjects.includes(subject)}
                        onChange={() =>
                          handleMultiSelectChange("subjects", subject)
                        }
                      />
                    </label>
                  ))}
                </div>
                {formData.subjects.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Selected: {formData.subjects.length} subject(s)
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Qualifications</span>
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-24 overflow-y-auto p-2 border rounded-lg">
                  {qualificationOptions.map((qualification) => (
                    <label key={qualification} className="label cursor-pointer">
                      <span className="label-text text-sm">
                        {qualification}
                      </span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-secondary checkbox-sm"
                        checked={formData.qualifications.includes(
                          qualification
                        )}
                        onChange={() =>
                          handleMultiSelectChange(
                            "qualifications",
                            qualification
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Available Days</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dayOptions.map((day) => (
                    <label key={day} className="label cursor-pointer">
                      <span className="label-text text-sm">{day}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-accent checkbox-sm"
                        checked={formData.availability.includes(day)}
                        onChange={() =>
                          handleMultiSelectChange("availability", day)
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Languages</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Add a language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addLanguage())
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addLanguage}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <div key={index} className="badge badge-primary gap-2">
                        {language}
                        <button
                          type="button"
                          className="btn btn-xs btn-circle btn-ghost"
                          onClick={() => removeLanguage(language)}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-base text-accent">
                Certifications
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-accent"
                onClick={addCertification}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Certification
              </button>
            </div>

            {formData.certifications.map((cert, index) => (
              <div key={index} className="card bg-base-200 p-4 mb-4 relative">
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                  onClick={() => removeCertification(index)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Certification Name
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, "name", e.target.value)
                      }
                      placeholder="Enter certification name"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Issuing Organization
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(index, "issuer", e.target.value)
                      }
                      placeholder="Enter issuing organization"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Date Obtained
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={cert.dateObtained}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "dateObtained",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Expiry Date
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={cert.expiryDate}
                      onChange={(e) =>
                        updateCertification(index, "expiryDate", e.target.value)
                      }
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
                  Adding...
                </>
              ) : (
                "Add Tutor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
