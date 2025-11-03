import OptionalChild from "./OptionalChild";
import PhoneInput from "./PhoneInput";
import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import {
  AcademicCapIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

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
    <div className="space-y-6">
      {/* Parent Information Section */}
      <div className="card bg-linear-to-br from-white to-[#90AC19]/5 shadow-xl border border-[#90AC19]/10">
        <div className="card-body">
          <h3 className="card-title text-2xl flex items-center text-[#90AC19] mb-6">
            <UserIcon className="w-7 h-7 mr-2" />
            Parent/Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#90AC19]" />
                  Full Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="parentName"
                className="input input-bordered bg-white focus:outline-none focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-[#90AC19]" />
                  Email Address <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered bg-white focus:outline-none focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <PhoneInput
              name="parentPhone"
              label="Phone Number"
              required
              placeholder="8012345678"
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-[#90AC19]" />
                  Address <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="address"
                className="input input-bordered bg-white focus:outline-none focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="card bg-linear-to-br from-white to-[#E8931A]/5 shadow-xl border border-[#E8931A]/10">
        <div className="card-body">
          <h3 className="card-title text-2xl text-[#E8931A] mb-6">
            Child Information
          </h3>
          <OptionalChild />
        </div>
      </div>

      {/* Tutoring Specific Information */}
      <div className="card bg-linear-to-br from-white to-[#A25F97]/5 shadow-xl border border-[#A25F97]/10">
        <div className="card-body">
          <h3 className="card-title text-2xl flex items-center text-[#A25F97] mb-6">
            <AcademicCapIcon className="w-7 h-7 mr-2" />
            Tutoring Details
          </h3>

          {/* Academic Level Selection */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-[#A25F97]" />
                Academic Level <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="academicLevel"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="select select-bordered bg-white focus:outline-none focus:border-[#A25F97] focus:ring-2 focus:ring-[#A25F97]/20"
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
              <span className="label-text font-semibold text-gray-700">
                Subjects Needed <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-xs bg-[#A25F97]/10 px-2 py-1 rounded">
                Select all that apply
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <div key={subject} className="form-control">
                  <label className="label cursor-pointer justify-start gap-3 p-4 rounded-xl border-2 border-base-200 hover:border-[#A25F97] hover:bg-[#A25F97]/5 transition-all duration-200 group">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary border-2"
                      style={{ borderColor: "#A25F97", accentColor: "#A25F97" }}
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                    />
                    <span className="label-text text-sm font-medium group-hover:text-[#A25F97]">
                      {subject}
                    </span>
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
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Learning Goals & Objectives{" "}
                <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-xs text-gray-500">
                Describe what you want to achieve
              </span>
            </label>
            <textarea
              name="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="textarea textarea-bordered bg-white h-28 focus:outline-none focus:border-[#A25F97] focus:ring-2 focus:ring-[#A25F97]/20"
              placeholder="e.g., Improve math grades, prepare for WAEC exams, strengthen reading comprehension..."
              required
            />
          </div>
        </div>
      </div>

      {/* Session Information */}
      <div className="card bg-white shadow-xl border-l-4 border-[#90AC19]">
        <div className="card-body">
          <h3 className="card-title text-2xl flex items-center text-[#90AC19] mb-6">
            <ClockIcon className="w-7 h-7 mr-2" />
            Session Details
          </h3>

          <div className="alert bg-blue-50 border border-blue-200 shadow-sm">
            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">
                Standard Session Duration: 1 Hour
              </p>
              <p className="text-sm mt-1 text-blue-700">
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
        <div className="card bg-linear-to-br from-[#90AC19]/10 via-[#E8931A]/5 to-[#A25F97]/10 shadow-xl border-2 border-[#90AC19]">
          <div className="card-body">
            <h3 className="card-title text-2xl flex items-center text-[#90AC19] mb-4">
              <CurrencyDollarIcon className="w-7 h-7 mr-2" />
              Payment Summary
            </h3>
            <div className="bg-white p-6 rounded-xl border-2 border-[#90AC19]/20 shadow-inner">
              <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-dashed border-[#90AC19]/20">
                <span className="font-bold text-lg text-gray-800">
                  Academic Tutoring (1 hour per session)
                </span>
                <span className="text-2xl font-bold text-[#90AC19]">
                  ₦{hourlyRate.toLocaleString()}/hour
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-[#90AC19] text-lg">✓</span>
                  <span>Professional qualified tutors</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#90AC19] text-lg">✓</span>
                  <span>Personalized learning approach</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#90AC19] text-lg">✓</span>
                  <span>Progress tracking and reporting</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#90AC19] text-lg">✓</span>
                  <span className="font-medium">
                    Subjects: {selectedSubjects.join(", ")}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#90AC19] text-lg">✓</span>
                  <span className="font-medium">Level: {academicLevel}</span>
                </div>
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
