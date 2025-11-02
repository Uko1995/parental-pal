import OptionalChild from "./OptionalChild";
import { useState, useImperativeHandle, forwardRef, useEffect } from "react";

export interface TutoringFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const TutoringForm = forwardRef<TutoringFormRef>((props, ref) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [academicLevel, setAcademicLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [hourlyRate, setHourlyRate] = useState(15000); // Default fallback

  // Fetch pricing from database
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/services/pricing");
        const data = await response.json();
        if (data.success && data.data.tutoring) {
          setHourlyRate(data.data.tutoring.baseRate);
        }
      } catch (error) {
        console.error("Error fetching tutoring pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  const subjects = [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "History",
    "Civic Education",
    "Computer Science",
    "French",
  ];

  const academicLevels = ["Primary 1-3", "Primary 4-6"];

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
    setAcademicLevel("");
    setLearningGoals("");
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (selectedSubjects.length === 0) {
      errors.push("Please select at least one subject");
    }

    if (!academicLevel) {
      errors.push("Please select an academic level");
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
      <div className="card bg-base-100 shadow-lg ">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center  mb-6">
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
                className="input input-bordered "
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Email Address *
                </span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered "
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Phone Number *
                </span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                className="input input-bordered "
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Address *
                </span>
              </label>
              <input
                type="text"
                name="address"
                className="input input-bordered"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="card bg-base-100 shadow-lg ">
        <div className="card-body">
          <h3 className="card-title text-xl mb-6">Child Information</h3>
          <OptionalChild />
        </div>
      </div>

      {/* Tutoring Specific Information */}
      <div className="card bg-base-100 shadow-lg ">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            Tutoring Details
          </h3>

          {/* Academic Level Selection */}
          <div className="form-control flex flex-col gap-2 mb-6">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                Academic Level *
              </span>
            </label>
            <select
              name="academicLevel"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="select select-bordered"
              required
            >
              <option value="">Select academic level</option>
              {academicLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Subjects Selection */}
          <div className="form-control mb-6">
            <label className="label mb-2">
              <span className="label-text font-medium flex items-center gap-2">
                Subjects Needed *
              </span>
              <span className="label-text-alt text-xs">
                Select all that apply
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <div key={subject} className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                    />
                    <span className="label-text text-sm">{subject}</span>
                  </label>
                </div>
              ))}
            </div>
            <input
              type="hidden"
              name="subjects"
              value={JSON.stringify(selectedSubjects)}
            />
          </div>

          {/* Learning Goals */}
          <div className="form-control flex flex-col gap-2 mb-6">
            <label className="label">
              <span className="label-text font-medium">
                Learning Goals & Objectives *
              </span>
              <span className="label-text-alt text-xs">
                Describe what you want to achieve
              </span>
            </label>
            <textarea
              name="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="textarea w-full textarea-bordered  h-24"
              placeholder="e.g., Improve math grades, prepare for WAEC exams, strengthen reading comprehension..."
              required
            />
          </div>
        </div>
      </div>

      {/* Session Information */}
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
            Session Details
          </h3>

          <div className="alert alert-info shadow-sm">
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
            <div>
              <p className="font-semibold">Standard Session Duration: 1 Hour</p>
              <p className="text-sm mt-1">
                Each tutoring session is 1 hour long. Our team will contact you
                to schedule sessions at convenient times for your child.
              </p>
            </div>
          </div>

          {/* Hidden field for session hours */}
          <input type="hidden" name="sessionHours" value="1" />
        </div>
      </div>

      {/* Payment Summary */}
      {selectedSubjects.length > 0 && academicLevel && (
        <div className="card bg-linear-to-r from-primary/5 to-secondary/5 shadow-lg border border-primary/20">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center text-primary mb-4">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              Payment Summary
            </h3>
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">
                  Academic Tutoring (1 hour per session)
                </span>
                <span className="text-lg font-semibold text-[#90AC19]">
                  ₦{hourlyRate.toLocaleString()}/hour
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Professional qualified tutors</p>
                <p>✓ Personalized learning approach</p>
                <p>✓ Progress tracking and reporting</p>
                <p>✓ Subjects: {selectedSubjects.join(", ")}</p>
                <p>✓ Level: {academicLevel}</p>
              </div>
            </div>
            <input type="hidden" name="hourlyRate" value={hourlyRate} />
            <input type="hidden" name="totalCost" value={hourlyRate} />
          </div>
        </div>
      )}
    </div>
  );
});

TutoringForm.displayName = "TutoringForm";

export default TutoringForm;
