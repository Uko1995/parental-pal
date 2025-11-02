"use client";

import OptionalChild from "./OptionalChild";
import { useState, useImperativeHandle, forwardRef } from "react";

export interface HomeschoolingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const HomeschoolingForm = forwardRef<HomeschoolingFormRef>((props, ref) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [educationalGoals, setEducationalGoals] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<
    "first" | "second" | "third" | ""
  >("");

  const subjects = [
    "Mathematics",
    "English Language",
    "Science",
    "Social Studies",
    "Arts & Crafts",
    "Physical Education",
    "Music",
    "Computer Skills",
    "Life Skills",
    "Religious Education",
  ];

  const gradeLevels = [
    "Pre-School (Ages 3-4)",
    "Kindergarten (Ages 5-6)",
    "Primary 1-3 (Ages 6-9)",
    "Primary 4-6 (Ages 9-12)",
  ];

  const curriculums = [
    "British Curriculum",
    "American Curriculum",
    "Nigerian Curriculum",
    "Montessori",
    "Waldorf",
    "Classical Education",
    "Unschooling",
    "Custom/Eclectic",
  ];

  const learningStyles = [
    "Visual Learner",
    "Auditory Learner",
    "Kinesthetic Learner",
    "Reading/Writing Learner",
    "Mixed Learning Style",
  ];

  const schoolTerms = [
    { value: "first", label: "First Term (September - December)" },
    { value: "second", label: "Second Term (January - April)" },
    { value: "third", label: "Third Term (May - August)" },
  ];

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const resetForm = () => {
    setSelectedSubjects([]);
    setGradeLevel("");
    setCurriculum("");
    setLearningStyle("");
    setSpecialNeeds("");
    setEducationalGoals("");
    setSelectedTerm("");
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (selectedSubjects.length === 0) {
      errors.push("Please select at least one subject");
    }

    if (!gradeLevel) {
      errors.push("Please select a grade level");
    }

    if (!curriculum) {
      errors.push("Please select a curriculum type");
    }

    if (!selectedTerm) {
      errors.push("Please select a school term");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  useImperativeHandle(ref, () => ({
    resetForm,
    validate,
  }));

  return (
    <div className="space-y-8">
      {/* Parent Information Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            <svg
              className="w-6 h-6 mr-2 text-[#90AC19]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Parent/Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                name="parentName"
                className="input input-bordered"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Email Address *</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Phone Number *</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                className="input input-bordered"
                placeholder="+234 XXX XXX XXXX"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Address *</span>
              </label>
              <input
                type="text"
                name="parentAddress"
                className="input input-bordered"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            <svg
              className="w-6 h-6 mr-2 text-[#E8931A]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            Child Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  Child&apos;s Name *
                </span>
              </label>
              <input
                type="text"
                name="childName"
                className="input input-bordered"
                placeholder="Enter child's full name"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Age *</span>
              </label>
              <input
                type="number"
                name="childAge"
                className="input input-bordered"
                placeholder="Enter child's age"
                min="3"
                max="12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Grade Level *</span>
              </label>
              <select
                name="gradeLevel"
                className="select select-bordered"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                required
              >
                <option value="">Select grade level</option>
                {gradeLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Learning Style *</span>
              </label>
              <select
                name="learningStyle"
                className="select select-bordered"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                required
              >
                <option value="">Select learning style</option>
                {learningStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Optional Additional Children */}
          <OptionalChild />
        </div>
      </div>

      {/* Homeschooling Details Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            <svg
              className="w-6 h-6 mr-2 text-[#A25F97]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Homeschooling Program Details
          </h3>

          {/* Curriculum Selection */}
          <div className="form-control flex flex-col gap-2 mb-6">
            <label className="label">
              <span className="label-text font-medium">
                Preferred Curriculum *
              </span>
            </label>
            <select
              name="curriculum"
              className="select select-bordered"
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              required
            >
              <option value="">Select curriculum type</option>
              {curriculums.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500 mt-1">
              Choose the educational approach that best fits your child&apos;s
              needs
            </span>
          </div>

          {/* Subject Selection */}
          <div className="form-control flex flex-col gap-2 mb-6">
            <label className="label">
              <span className="label-text font-medium">
                Subjects to Cover *
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <label
                  key={subject}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                  />
                  <span className="label-text">{subject}</span>
                </label>
              ))}
            </div>
            <input
              type="hidden"
              name="selectedSubjects"
              value={JSON.stringify(selectedSubjects)}
            />
            <span className="text-sm text-gray-500 mt-1">
              Select all subjects you want included in the program
            </span>
          </div>

          {/* Special Needs */}
          <div className="form-control flex flex-col gap-2 mb-6">
            <label className="label">
              <span className="label-text font-medium">
                Special Needs or Accommodations
              </span>
            </label>
            <textarea
              name="specialNeeds"
              className="textarea textarea-bordered h-24"
              placeholder="Please describe any learning challenges, disabilities, or special accommodations needed..."
              value={specialNeeds}
              onChange={(e) => setSpecialNeeds(e.target.value)}
            />
          </div>

          {/* Educational Goals */}
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">
                Educational Goals & Objectives *
              </span>
            </label>
            <textarea
              name="educationalGoals"
              className="textarea textarea-bordered h-32"
              placeholder="What are your goals for this homeschooling program? What do you hope your child will achieve?"
              value={educationalGoals}
              onChange={(e) => setEducationalGoals(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* School Term Selection */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            <svg
              className="w-6 h-6 mr-2 text-[#90AC19]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            School Term Selection
          </h3>

          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">
                Select School Term *
              </span>
            </label>
            <select
              name="schoolTerm"
              className="select select-bordered"
              value={selectedTerm}
              onChange={(e) =>
                setSelectedTerm(
                  e.target.value as "first" | "second" | "third" | ""
                )
              }
              required
            >
              <option value="">Select a term</option>
              {schoolTerms.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>

          <div className="alert alert-info shadow-sm mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-sm">
              Homeschooling is offered on a per-term basis.
            </span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      {selectedTerm && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center text-primary mb-4">
              Payment Summary
            </h3>
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">
                  Homeschooling Program
                </span>
                <span className="text-lg font-semibold text-[#90AC19]">
                  ₦250,000 per term
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Full curriculum coverage for selected subjects</p>
                <p>✓ Professional teaching staff</p>
                <p>✓ Regular assessments and progress reports</p>
                <p>✓ Learning materials included</p>
                <p>
                  ✓{" "}
                  {selectedTerm === "first"
                    ? "First"
                    : selectedTerm === "second"
                    ? "Second"
                    : "Third"}{" "}
                  Term enrollment
                </p>
              </div>
            </div>
            <input type="hidden" name="termCost" value="250000" />
          </div>
        </div>
      )}
    </div>
  );
});

HomeschoolingForm.displayName = "HomeschoolingForm";

export default HomeschoolingForm;
