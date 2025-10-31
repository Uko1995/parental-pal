import OptionalChild from "./OptionalChild";
import PaymentSchedule from "./PaymentSchedule";
import WeekdaysSchedule, { WeekdaysScheduleRef } from "./WeekdaysSchedule";
import { useState, useImperativeHandle, forwardRef, useRef } from "react";

export interface TutoringFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const TutoringForm = forwardRef<TutoringFormRef>((props, ref) => {
  const [totalHours, setTotalHours] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [academicLevel, setAcademicLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const weekdaysScheduleRef = useRef<WeekdaysScheduleRef>(null);

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

  const handleHoursChange = (totalHours: number) => {
    setTotalHours(totalHours);
  };

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
    setTotalHours(0);
    setSelectedSubjects([]);
    setAcademicLevel("");
    setLearningGoals("");
    weekdaysScheduleRef.current?.resetSchedule();
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (selectedSubjects.length === 0) {
      errors.push("Please select at least one subject");
    }

    if (!academicLevel) {
      errors.push("Please select an academic level");
    }

    if (totalHours === 0) {
      errors.push("Please select at least one day and specify hours");
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

      {/* Schedule Selection */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center mb-6">
            Schedule & Availability
          </h3>
          <WeekdaysSchedule
            ref={weekdaysScheduleRef}
            onHoursChange={handleHoursChange}
          />
        </div>
      </div>

      {/* Payment Summary */}
      {selectedSubjects.length > 0 && totalHours > 0 && (
        <div className="card bg-linear-to-r from-primary/5 to-secondary/5 shadow-lg border border-primary/20">
          <div className="card-body">
            <PaymentSchedule totalHours={totalHours} serviceCost={15000} />
          </div>
        </div>
      )}
    </div>
  );
});

TutoringForm.displayName = "TutoringForm";

export default TutoringForm;
