import ChildInfoForm from "./ChildInfoForm";
import PhoneInput from "@/components/PhoneInput";
import WeekdaysSchedule, {
  WeekdaysScheduleRef,
} from "./WeekdaysSchedule";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import {
  extractChildIdsFromFormEntries,
  parseJsonField,
} from "@/lib/rebook-form-utils";

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
import {
  applyParentContactPrefill,
  createPrefilledChildrenFromProfile,
  type ChildInfoDefaults,
} from "@/lib/booking-profile-prefill";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";
import { formatLocalDate } from "@/lib/booking-calendar";

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

interface TutoringFormProps {
  initialTemplate?: RebookFormEntries | null;
}

const TutoringForm = forwardRef<TutoringFormRef, TutoringFormProps>(
  ({ initialTemplate }, ref) => {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [childDefaults, setChildDefaults] = useState<
    Record<string, ChildInfoDefaults>
  >({});

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
  const [tutoringLocation, setTutoringLocation] = useState<
    "virtual" | "physical"
  >("physical");
  const [virtualRate, setVirtualRate] = useState(13000); // ₦13,000 for virtual
  const [physicalRate, setPhysicalRate] = useState(12000); // ₦12,000 for physical
  const [hourlyRate, setHourlyRate] = useState(12000); // Default to physical rate
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "checking" | "applied" | "invalid"
  >("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [startDate, setStartDate] = useState<string>(formatLocalDate(new Date()));

  // Create refs for each child's WeekdaysSchedule
  const scheduleRefs = useRef<{ [key: string]: WeekdaysScheduleRef | null }>(
    {}
  );
  const previousTutoringLocation = useRef<"virtual" | "physical">("physical");
  const templateAppliedRef = useRef(false);

  useEffect(() => {
    if (!initialTemplate || templateAppliedRef.current) return;
    templateAppliedRef.current = true;

    const childIds = extractChildIdsFromFormEntries(initialTemplate);
    if (childIds.length > 0) {
      setChildrenData(
        childIds.map((id, index) => ({
          id,
          index,
          selectedSubjects: parseJsonField<string[]>(
            initialTemplate[`subjects_${id}`],
            [],
          ),
          academicLevel: initialTemplate[`academicLevel_${id}`] || "",
          learningGoals: initialTemplate[`learningGoals_${id}`] || "",
          totalHours:
            parseInt(initialTemplate[`totalHours_${id}`] || "0", 10) || 0,
          schedule: parseJsonField<
            ChildTutoringData["schedule"]
          >(initialTemplate[`schedule_${id}`], []),
        })),
      );
    }

    if (initialTemplate.parentName) setParentName(initialTemplate.parentName);
    if (initialTemplate.parentEmail) setParentEmail(initialTemplate.parentEmail);
    if (initialTemplate.parentPhone) setParentPhone(initialTemplate.parentPhone);
    if (initialTemplate.parentAddress || initialTemplate.address) {
      setParentAddress(
        initialTemplate.parentAddress || initialTemplate.address || "",
      );
    }
    if (initialTemplate.startDate) setStartDate(initialTemplate.startDate);
    if (initialTemplate.tutoringLocation === "virtual") {
      setTutoringLocation("virtual");
      previousTutoringLocation.current = "virtual";
    }
    if (initialTemplate.virtualRate) {
      setVirtualRate(parseInt(initialTemplate.virtualRate, 10) || 13000);
    }
    if (initialTemplate.physicalRate) {
      setPhysicalRate(parseInt(initialTemplate.physicalRate, 10) || 12000);
    }
    if (initialTemplate.hourlyRate) {
      setHourlyRate(parseInt(initialTemplate.hourlyRate, 10) || 12000);
    }

    const scheduleLoadTimer = window.setTimeout(() => {
      childIds.forEach((id) => {
        const schedule = parseJsonField<ChildTutoringData["schedule"]>(
          initialTemplate[`schedule_${id}`],
          [],
        );
        if (schedule.length > 0) {
          scheduleRefs.current[id]?.loadSchedule(
            schedule.map((s) => ({
              day: s.day,
              startTime: s.startTime || s.dates?.[0]?.startTime || "",
              hours: s.hours || 1,
              dates: s.dates,
            })),
          );
        }
      });
    }, 150);

    return () => window.clearTimeout(scheduleLoadTimer);
  }, [initialTemplate]);

  const applyProfilePrefill = useCallback((profile: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    parentAddress: string;
    children: Array<{ name: string; age: number; gender?: string }>;
  }) => {
    applyParentContactPrefill(profile, {
      setParentName,
      setParentEmail,
      setParentPhone,
      setParentAddress,
    });

    if (profile.children.length > 0) {
      const { ids, defaults } = createPrefilledChildrenFromProfile(
        profile.children,
      );
      setChildrenData(
        ids.map((id, index) => ({
          id,
          index,
          selectedSubjects: [],
          academicLevel: "",
          learningGoals: "",
          totalHours: 0,
          schedule: [],
        })),
      );
      setChildDefaults(defaults);
    }
  }, []);

  useBookingProfilePrefill({
    initialTemplate,
    templateAppliedRef,
    onApply: applyProfilePrefill,
  });

  // Fetch pricing from database
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/services/pricing");
        const data = await response.json();
        if (data.success && data.data.tutoring) {
          // Set rates from database or use defaults
          const vRate = data.data.tutoring.virtualRate || 13000;
          const pRate = data.data.tutoring.physicalRate || 12000;
          setVirtualRate(vRate);
          setPhysicalRate(pRate);
          // Set initial hourly rate based on default location
          setHourlyRate(pRate);
        }
      } catch (error) {
        console.error("Error fetching tutoring pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  // Keep hourly rate synced with selected location unless promo is actively applied
  useEffect(() => {
    if (promoStatus !== "applied") {
      setHourlyRate(tutoringLocation === "virtual" ? virtualRate : physicalRate);
    }
  }, [promoStatus, tutoringLocation, virtualRate, physicalRate]);

  // Reset promo only when the user actually changes location
  useEffect(() => {
    const locationChanged = previousTutoringLocation.current !== tutoringLocation;
    if (locationChanged && promoStatus === "applied") {
      setPromoStatus("idle");
      setPromoMessage(
        "Promo reset after location change. Apply again for virtual sessions.",
      );
      setHourlyRate(tutoringLocation === "virtual" ? virtualRate : physicalRate);
    }
    previousTutoringLocation.current = tutoringLocation;
  }, [promoStatus, tutoringLocation, virtualRate, physicalRate]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoStatus("invalid");
      setPromoMessage("Enter a promo code first.");
      return;
    }

    setPromoStatus("checking");
    setPromoMessage("");

    try {
      const response = await fetch("/api/promotions/eduvanta/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          tutoringLocation,
        }),
      });
      const result = await response.json();

      if (response.ok && result?.success && result?.data?.valid) {
        setPromoStatus("applied");
        setPromoMessage(result.data.message || "Promo code applied.");
        if (typeof result.data.discountedRate === "number") {
          setHourlyRate(result.data.discountedRate);
        }
        return;
      }

      setPromoStatus("invalid");
      setPromoMessage(result?.error || "Promo code is not valid.");
      setHourlyRate(tutoringLocation === "virtual" ? virtualRate : physicalRate);
    } catch (error) {
      console.error("Promo validation failed:", error);
      setPromoStatus("invalid");
      setPromoMessage("Unable to validate promo code right now.");
    }
  };

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
    setPromoCode("");
    setPromoStatus("idle");
    setPromoMessage("");
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
            value={parentPhone}
            onValueChange={setParentPhone}
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
              value={parentAddress}
              onChange={(e) => setParentAddress(e.target.value)}
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
              min={formatLocalDate(new Date())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              required
            />
          </div>
        </div>
      </div>

      {/* Tutoring Location Selection */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Tutoring Location
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose whether you prefer virtual (online) or physical (in-person)
          tutoring sessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Virtual Option */}
          <label
            className={`cursor-pointer flex flex-col p-6 rounded-lg border-2 transition-all duration-200 ${
              tutoringLocation === "virtual"
                ? " "
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <input
                type="radio"
                name="tutoringLocation"
                value="virtual"
                checked={tutoringLocation === "virtual"}
                onChange={(e) =>
                  setTutoringLocation(e.target.value as "virtual" | "physical")
                }
                className="w-5 h-5  border-gray-300 text-gray-700 focus:ring-gray-400"
              />
              <span className="text-base font-semibold text-gray-900">
                Virtual Tutoring
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Online sessions via video call with digital learning tools
            </p>
            <div className="mt-auto pt-3 border-t  border-gray-200">
              <p className="text-lg font-bold ">
                ₦{virtualRate.toLocaleString()}/hour
              </p>
            </div>
          </label>

          {/* Physical Option */}
          <label
            className={`cursor-pointer flex flex-col p-6 rounded-lg border-2 transition-all duration-200 ${
              tutoringLocation === "physical"
                ? ""
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <input
                type="radio"
                name="tutoringLocation"
                value="physical"
                checked={tutoringLocation === "physical"}
                onChange={(e) =>
                  setTutoringLocation(e.target.value as "virtual" | "physical")
                }
                className="w-5 h-5  border-gray-300 text-gray-700 focus:ring-gray-400"
              />
              <span className="text-base font-semibold text-gray-900">
                Physical Tutoring
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              In-person sessions at your home or our center with hands-on
              learning
            </p>
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-lg font-bold ">
                ₦{physicalRate.toLocaleString()}/hour
              </p>
            </div>
          </label>
        </div>

        <input type="hidden" name="tutoringLocation" value={tutoringLocation} />
        <div className="mt-4">
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-900 block mb-1">
              Promo Code (Virtual Sessions)
            </span>
            <span className="text-xs text-gray-600">
              Apply your promo code for June virtual session pricing.
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="promoCode"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                if (promoStatus !== "checking") {
                  setPromoStatus("idle");
                  setPromoMessage("");
                  setHourlyRate(
                    tutoringLocation === "virtual" ? virtualRate : physicalRate,
                  );
                }
              }}
              className="w-full md:w-80 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter promo code"
              maxLength={30}
            />
            <button
              type="button"
              onClick={applyPromoCode}
              disabled={promoStatus === "checking"}
              className="px-5 py-2.5 rounded-lg bg-[#90AC19] text-white font-medium hover:bg-[#7f9917] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {promoStatus === "checking" ? "Applying..." : "Apply Promo"}
            </button>
          </div>
          {promoMessage && (
            <p
              className={`mt-2 text-sm ${
                promoStatus === "applied" ? "text-green-600" : "text-red-600"
              }`}
            >
              {promoMessage}
            </p>
          )}
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
            key={`${child.id}-${childDefaults[child.id]?.name ?? "new"}`}
            childIndex={index}
            childId={child.id}
            onRemove={() => removeChild(child.id)}
            showRemoveButton={false}
            defaults={childDefaults[child.id]}
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
          {child.totalHours > 0 && (
              <div className="bg-[#90AC19]/5 border border-[#90AC19]/20 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subtotal for Child #{index + 1}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {child.schedule.reduce(
                        (sum, block) => sum + (block.dates?.length || 0),
                        0,
                      )}{" "}
                      sessions • {child.totalHours} total session hours • ₦
                      {hourlyRate.toLocaleString()}/hour
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
      <input type="hidden" name="hourlyRate" value={hourlyRate} />
      <input type="hidden" name="virtualRate" value={virtualRate} />
      <input type="hidden" name="physicalRate" value={physicalRate} />
      <input type="hidden" name="promoCode" value={promoCode} />

      {/* Final Payment Summary */}
      {childrenData.some((child) => child.totalHours > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-900 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-gray-700" />
            Final Payment Summary
          </h3>

          {/* Individual child costs */}
          <div className="space-y-3 mb-6">
            {childrenData.map((child, index) => {
              if (child.totalHours > 0) {
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
                          {child.schedule.reduce(
                            (sum, block) => sum + (block.dates?.length || 0),
                            0,
                          )}{" "}
                          sessions • {child.totalHours} total session hours •{" "}
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
