"use client";

import {
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TutorFormData } from "./TutorRegistrationForm";
import { useState } from "react";

interface ProfessionalInfoTabProps {
  formData: TutorFormData;
  updateFormData: (updates: Partial<TutorFormData>) => void;
}

export default function ProfessionalInfoTab({
  formData,
  updateFormData,
}: ProfessionalInfoTabProps) {
  const [newQualification, setNewQualification] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const specialties = [
    "Mathematics",
    "English Language",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Economics",
    "Government",
    "Literature",
    "French",
    "History",
    "Geography",
    "Arts",
    "Music",
    "General Studies",
  ];

  const subjects = [
    "Primary Mathematics",
    "Secondary Mathematics",
    "Further Mathematics",
    "English Language",
    "English Literature",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Economics",
    "Government",
    "Civic Education",
    "Commerce",
    "Accounting",
    "French",
    "Igbo",
    "Hausa",
    "Yoruba",
    "History",
    "Geography",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "Fine Arts",
    "Music",
    "Physical Education",
    "Technical Drawing",
    "Agricultural Science",
    "Home Economics",
    "Basic Science",
    "Social Studies",
    "Creative Arts",
    "Phonics",
    "Reading Comprehension",
    "Essay Writing",
  ];

  const addQualification = () => {
    if (
      newQualification.trim() &&
      !formData.qualifications.includes(newQualification.trim())
    ) {
      updateFormData({
        qualifications: [...formData.qualifications, newQualification.trim()],
      });
      setNewQualification("");
    }
  };

  const removeQualification = (index: number) => {
    updateFormData({
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      updateFormData({
        subjects: [...formData.subjects, newSubject.trim()],
      });
      setNewSubject("");
    }
  };

  const removeSubject = (index: number) => {
    updateFormData({
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const addPresetSubject = (subject: string) => {
    if (!formData.subjects.includes(subject)) {
      updateFormData({
        subjects: [...formData.subjects, subject],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Professional Information
        </h3>
        <p className="text-gray-600">
          Tell us about your teaching expertise and qualifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specialty */}
        <div className="form-control">
          <label className="label mb-1">
            <span className="label-text font-medium">
              <AcademicCapIcon className="w-4 h-4 inline mr-2" />
              Primary Specialty *
            </span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.specialty}
            onChange={(e) => updateFormData({ specialty: e.target.value })}
          >
            <option value="">Select your main specialty</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          {!formData.specialty.trim() && (
            <label className="label">
              <span className="label-text-alt text-error">
                Primary specialty is required
              </span>
            </label>
          )}
        </div>

        {/* Years of Experience */}
        <div className="form-control">
          <label className="label mb-1">
            <span className="label-text font-medium">
              <BriefcaseIcon className="w-4 h-4 inline mr-2" />
              Years of Experience *
            </span>
          </label>
          <input
            type="number"
            min="0"
            max="50"
            placeholder="Years of teaching experience"
            className="input input-bordered w-full"
            value={formData.experience}
            onChange={(e) =>
              updateFormData({ experience: parseInt(e.target.value) || 0 })
            }
          />
          {formData.experience <= 0 && (
            <label className="label">
              <span className="label-text-alt text-error">
                Experience is required
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Qualifications */}
      <div className="form-control">
        <label className="label mb-1">
          <span className="label-text font-medium">
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            Qualifications & Certifications
          </span>
        </label>

        {/* Add New Qualification */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter a qualification (e.g., B.Sc Mathematics, WAEC, JAMB)"
            className="input input-bordered flex-1"
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addQualification()}
          />
          <button
            type="button"
            className="btn btn-outline btn-primary"
            onClick={addQualification}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Display Qualifications */}
        <div className="space-y-2">
          {formData.qualifications.map((qualification, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-base-200 p-3 rounded-lg"
            >
              <span className="text-sm">{qualification}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => removeQualification(index)}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="form-control">
        <label className="label mb-1">
          <span className="label-text font-medium">
            Subjects You Can Teach *
          </span>
        </label>

        {/* Popular Subjects */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                className={`btn  ${
                  formData.subjects.includes(subject)
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => addPresetSubject(subject)}
                disabled={formData.subjects.includes(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Subject */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a subject you can teach"
            className="input input-bordered flex-1"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
          <button
            type="button"
            className="btn btn-outline btn-primary"
            onClick={addSubject}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Display Selected Subjects */}
        <div className="flex flex-wrap gap-3 mb-2">
          {formData.subjects.map((subject, index) => (
            <div
              key={index}
              className="flex items-center w-fit justify-between border border-gray-400 p-3 rounded-lg"
            >
              <span className="text-sm font-medium">{subject}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => removeSubject(index)}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {formData.subjects.length === 0 && (
          <label className="label">
            <span className="label-text-alt text-error">
              At least one subject is required
            </span>
          </label>
        )}
      </div>

      {/* Bio */}
      <div className="form-control">
        <label className="label mb-1">
          <span className="label-text font-medium">Professional Bio *</span>
        </label>
        <textarea
          placeholder="Tell us about your teaching philosophy, approach, and what makes you a great tutor. This will be visible to parents."
          className="textarea textarea-bordered w-full h-32"
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
        />
        <label className="label">
          <span className="label-text-alt text-gray-500">
            {formData.bio.length}/500 characters
          </span>
        </label>
        <br />
        {!formData.bio.trim() && (
          <label className="label">
            <span className="label-text-alt text-error">
              Professional bio is required
            </span>
          </label>
        )}
      </div>

      {/* Service Preferences */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Preferred Service Types
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["tutoring", "homeschooling", "kiddies-enrichment"].map(
            (service) => (
              <label key={service} className="cursor-pointer label">
                <input
                  type="checkbox"
                  className="checkbox "
                  checked={formData.preferredServices.includes(service)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData({
                        preferredServices: [
                          ...formData.preferredServices,
                          service,
                        ],
                      });
                    } else {
                      updateFormData({
                        preferredServices: formData.preferredServices.filter(
                          (s) => s !== service
                        ),
                      });
                    }
                  }}
                />
                <span className="label-text text-gray-900 capitalize ml-2">
                  {service.replace("-", " ")}
                </span>
              </label>
            )
          )}
        </div>
      </div>
    </div>
  );
}
