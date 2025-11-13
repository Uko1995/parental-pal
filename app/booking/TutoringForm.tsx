import ChildInfoForm from "./ChildInfoForm";
import PhoneInput from "@/components/PhoneInput";
import WeekdaysSchedule from "./WeekdaysSchedule";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

export interface WeekdaysScheduleRef {
  resetSchedule: () => void;
}

import {
  AcademicCapIcon,
  UserIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";

export interface TutoringFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ChildTutoringData {
  id: string;
  index: number;
  selectedSubjects: string[];
  academicLevel: string;
  learningGoals: string;
  totalHours: number;
  schedule: Array<{
    day: string;
    hours: number;
    startTime?: string;
    dates?: Array<{
      date: string;
      startTime: string;
    }>;
  }>;
}

const TutoringForm = forwardRef<TutoringFormRef>((props, ref) => {
  const { data: session } = useSession();
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const [childrenData, setChildrenData] = useState<ChildTutoringData[]>([
    {
      id: uuidv4(),
      index: 0,
      selectedSubjects: [],
      academicLevel: "",
      learningGoals: "",
      totalHours: 0,
      schedule: [],
    },
  ]);
  const [hourlyRate, setHourlyRate] = useState(15000); // Default fallback
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Default to today

  // Create refs for each child's WeekdaysSchedule
  const scheduleRefs = useRef<{ [key: string]: WeekdaysScheduleRef | null }>(
    {}
  );

  // Autofill parent info from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setParentName(session.user.name);
      if (session.user.email) setParentEmail(session.user.email);
    }
  }, [session]);

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

  const handleSubjectChange = useCallback(
    (childId: string, subject: string) => {
      setChildrenData((prev) =>
        prev.map((child) => {
          if (child.id === childId) {
            const updatedSubjects = child.selectedSubjects.includes(subject)
              ? child.selectedSubjects.filter((s) => s !== subject)
              : [...child.selectedSubjects, subject];
            return { ...child, selectedSubjects: updatedSubjects };
          }
          return child;
        })
      );
    },
    []
  );

  const handleAcademicLevelChange = useCallback(
    (childId: string, level: string) => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, academicLevel: level } : child
        )
      );
    },
    []
  );

  const handleLearningGoalsChange = useCallback(
    (childId: string, goals: string) => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, learningGoals: goals } : child
        )
      );
    },
    []
  );

  const handleHoursChange = useCallback((childId: string, hours: number) => {
    setChildrenData((prev) =>
      prev.map((child) =>
        child.id === childId ? { ...child, totalHours: hours } : child
      )
    );
  }, []);

  const handleScheduleChange = useCallback(
    (
      childId: string,
      schedules: Array<{
        day: string;
        hours: number;
        startTime?: string;
        dates?: Array<{ date: string; startTime: string }>;
      }>
    ) => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, schedule: schedules } : child
        )
      );
    },
    []
  );

  const addChild = () => {
    setChildrenData((prev) => [
      ...prev,
      {
        id: uuidv4(),
        index: prev.length,
        selectedSubjects: [],
        academicLevel: "",
        learningGoals: "",
        totalHours: 0,
        schedule: [],
      },
    ]);
  };

  const removeChild = (id: string) => {
    if (childrenData.length > 1) {
      setChildrenData((prev) => prev.filter((child) => child.id !== id));
      // Clean up the schedule ref
      delete scheduleRefs.current[id];
    }
  };

  const resetForm = () => {
    setChildrenData([
      {
        id: uuidv4(),
        index: 0,
        selectedSubjects: [],
        academicLevel: "",
        learningGoals: "",
        totalHours: 0,
        schedule: [],
      },
    ]);
    // Reset all schedule refs
    Object.values(scheduleRefs.current).forEach((scheduleRef) => {
      if (scheduleRef && scheduleRef.resetSchedule) {
        scheduleRef.resetSchedule();
      }
    });
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    childrenData.forEach((child, index) => {
      if (child.selectedSubjects.length === 0) {
        errors.push(`Child ${index + 1}: Please select at least one subject`);
      }
      if (!child.academicLevel) {
        errors.push(`Child ${index + 1}: Please select an academic level`);
      }
      if (child.totalHours === 0) {
        errors.push(`Child ${index + 1}: Please select tutoring schedule`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  useImperativeHandle(ref, () => ({
    resetForm,
    validate,
  }));

  // Calculate total cost for all children
  const calculateTotalCost = () => {
    return childrenData.reduce((total, child) => {
      return total + child.totalHours * hourlyRate;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Parent Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center mb-6 text-gray-900">
          <UserIcon className="w-6 h-6 mr-2 text-gray-700" />
          Parent/Guardian Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Full Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Email Address <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="email"
              name="parentEmail"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
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

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Address <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your address"
              required
            />
          </div>

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-1">
                <CalendarIcon className="w-4 h-4 text-gray-700" />
                Start Date <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-gray-600">
                When should tutoring begin?
              </span>
            </label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              required
            />
          </div>
        </div>
      </div>

      {/* Header for Children Sections */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Children & Tutoring Details
        </h2>
        <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
          {childrenData.length}{" "}
          {childrenData.length === 1 ? "Child" : "Children"}
        </div>
      </div>

      {/* Map through children - each gets complete section */}
      {childrenData.map((child, index) => (
        <div
          key={child.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Child Header with Remove Button */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-gray-700" />
              Child #{index + 1} - Tutoring Information
            </h3>
            {childrenData.length > 1 && (
              <button
                type="button"
                onClick={() => removeChild(child.id)}
                className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium"
              >
                <TrashIcon className="w-4 h-4" />
                Remove Child
              </button>
            )}
          </div>

          {/* Basic Child Info */}
          <ChildInfoForm
            childIndex={index}
            childId={child.id}
            onRemove={() => removeChild(child.id)}
            showRemoveButton={false}
          />

          {/* Academic Level for this child */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Academic Level <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              name={`academicLevel_${child.id}`}
              value={child.academicLevel}
              onChange={(e) =>
                handleAcademicLevelChange(child.id, e.target.value)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
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

          {/* Subjects for this child */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">
                Subjects Needed <span className="text-red-500">*</span>
              </label>
              <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-700">
                Select all that apply
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {subjects.map((subject) => (
                <label
                  key={subject}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#90AC19] border-gray-300 rounded focus:ring-[#90AC19]"
                    checked={child.selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(child.id, subject)}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {subject}
                  </span>
                </label>
              ))}
            </div>
            <input
              type="hidden"
              name={`subjects_${child.id}`}
              value={JSON.stringify(child.selectedSubjects)}
            />
          </div>

          {/* Learning Goals for this child */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Learning Goals & Objectives{" "}
                <span className="text-red-500">*</span>
              </span>
              <span className="text-xs text-gray-600">
                Describe what you want this child to achieve
              </span>
            </label>
            <textarea
              name={`learningGoals_${child.id}`}
              value={child.learningGoals}
              onChange={(e) =>
                handleLearningGoalsChange(child.id, e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 resize-none"
              placeholder="e.g., Improve math grades, prepare for WAEC exams, strengthen reading comprehension..."
              rows={4}
              required
            />
          </div>

          {/* Schedule for this child */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Tutoring Schedule
            </h4>
            <WeekdaysSchedule
              ref={(el) => {
                scheduleRefs.current[child.id] = el;
              }}
              onHoursChange={(hours) => handleHoursChange(child.id, hours)}
              onScheduleChange={(schedules) =>
                handleScheduleChange(child.id, schedules)
              }
              startDate={startDate}
            />
            <input
              type="hidden"
              name={`totalHours_${child.id}`}
              value={child.totalHours}
            />
            <input
              type="hidden"
              name={`schedule_${child.id}`}
              value={JSON.stringify(child.schedule)}
            />
          </div>

          {/* Subtotal for this child */}
          {child.selectedSubjects.length > 0 &&
            child.academicLevel &&
            child.totalHours > 0 && (
              <div className="bg-[#90AC19]/5 border border-[#90AC19]/20 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subtotal for Child #{index + 1}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {child.totalHours} hours × ₦{hourlyRate.toLocaleString()}
                      /hour
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#90AC19]">
                    ₦{(child.totalHours * hourlyRate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
        </div>
      ))}

      {/* Add Another Child Button */}
      <button
        type="button"
        onClick={addChild}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-[#90AC19] hover:bg-[#90AC19]/5 hover:text-[#90AC19] transition-all duration-200 font-medium"
      >
        <PlusIcon className="w-6 h-6" />
        Add Another Child
      </button>

      {/* Hidden field for children count */}
      <input type="hidden" name="childrenCount" value={childrenData.length} />

      {/* Final Payment Summary */}
      {childrenData.some(
        (child) =>
          child.selectedSubjects.length > 0 &&
          child.academicLevel &&
          child.totalHours > 0
      ) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-900 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-gray-700" />
            Final Payment Summary
          </h3>

          {/* Individual child costs */}
          <div className="space-y-3 mb-6">
            {childrenData.map((child, index) => {
              if (
                child.selectedSubjects.length > 0 &&
                child.academicLevel &&
                child.totalHours > 0
              ) {
                return (
                  <div
                    key={child.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Child #{index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          {child.totalHours} hours/week •{" "}
                          {child.selectedSubjects.length} subject(s)
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ₦{(child.totalHours * hourlyRate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Grand Total */}
          <div className="bg-[#90AC19] text-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-sm opacity-90">All children combined</p>
              </div>
              <p className="text-3xl font-bold">
                ₦{calculateTotalCost().toLocaleString()}
              </p>
            </div>
          </div>

          <input type="hidden" name="hourlyRate" value={hourlyRate} />
          <input type="hidden" name="totalCost" value={calculateTotalCost()} />

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">
                Professional qualified tutors with personalized learning
                approach and progress tracking included.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TutoringForm.displayName = "TutoringForm";

export default TutoringForm;
