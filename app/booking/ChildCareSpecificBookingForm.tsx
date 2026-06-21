import {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
  useCallback,
} from "react";
import ChildInfoForm from "./ChildInfoForm";
import WeekdaysSchedule, { WeekdaysScheduleRef } from "./WeekdaysSchedule";
import PhoneInput from "@/components/PhoneInput";
import {
  UserIcon,
  ClockIcon,
  CalendarIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import {
  extractChildIdsFromFormEntries,
  parseJsonField,
  childDefaultsFromFormEntries,
  loadSchedulesWhenReady,
} from "@/lib/rebook-form-utils";
import {
  applyParentContactPrefill,
  buildChildrenRowsFromProfile,
  type ChildInfoDefaults,
} from "@/lib/booking-profile-prefill";
import AddAnotherChildButton from "./AddAnotherChildButton";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";
import {
  countChildcareMonthDays,
  formatLocalDate,
} from "@/lib/booking-calendar";
import { prorateMonthlyChildcareTotal } from "@/lib/booking-proration";

export interface ChildCareSpecificBookingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
  isPricingReady: () => boolean;
}

interface ChildCareData {
  id: string;
  index: number;
  careType: "daily" | "monthly" | "";
  totalDays: number;
  isMonthSelected: boolean;
  dropoffTime: string;
  pickupTime: string;
  specialNeeds: string;
}

interface ChildCareFormProps {
  initialTemplate?: RebookFormEntries | null;
  billingPeriodMonths?: number;
  onBillingPeriodMonthsChange?: (months: number) => void;
}

const ChildCareSpecificBookingForm = forwardRef<
  ChildCareSpecificBookingFormRef,
  ChildCareFormProps
>(({ initialTemplate, billingPeriodMonths = 1, onBillingPeriodMonthsChange }, ref) => {
    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentAddress, setParentAddress] = useState("");
    const [childDefaults, setChildDefaults] = useState<
      Record<string, ChildInfoDefaults>
    >({});

    const [childrenData, setChildrenData] = useState<ChildCareData[]>([
      {
        id: uuidv4(),
        index: 0,
        careType: "",
        totalDays: 0,
        isMonthSelected: false,
        dropoffTime: "",
        pickupTime: "",
        specialNeeds: "",
      },
    ]);
    const [dailyRate, setDailyRate] = useState(5000); // Default to ₦5,000/day
    const [monthlyRate, setMonthlyRate] = useState(110500); // Default to ₦110,500/month (15% discount)
    const [pricingLoadState, setPricingLoadState] = useState<
      "loading" | "ready" | "failed"
    >("loading");
    const [startDate, setStartDate] = useState<string>(formatLocalDate(new Date()));

    // Create refs for each child's WeekdaysSchedule
    const scheduleRefs = useRef<{ [key: string]: WeekdaysScheduleRef | null }>(
      {}
    );
    const templateAppliedRef = useRef(false);
    const scheduleTemplateRef = useRef<RebookFormEntries | null>(null);

    useEffect(() => {
      if (!initialTemplate || templateAppliedRef.current) return;
      templateAppliedRef.current = true;

      const childIds = extractChildIdsFromFormEntries(initialTemplate);
      if (childIds.length > 0) {
        setChildDefaults(childDefaultsFromFormEntries(initialTemplate, childIds));
        setChildrenData(
          childIds.map((id, index) => {
            const careType = (initialTemplate[`careType_${id}`] || "") as
              | "daily"
              | "monthly"
              | "";
            return {
              id,
              index,
              careType,
              totalDays:
                parseInt(initialTemplate[`totalDays_${id}`] || "0", 10) || 0,
              isMonthSelected:
                initialTemplate[`isMonthSelected_${id}`] === "true" ||
                careType === "monthly",
              dropoffTime:
                initialTemplate[`dropoffTime_${id}`] ||
                initialTemplate.dropoffTime ||
                "",
              pickupTime:
                initialTemplate[`pickupTime_${id}`] ||
                initialTemplate.pickupTime ||
                "",
              specialNeeds: initialTemplate[`specialNeeds_${id}`] || "",
            };
          }),
        );
        scheduleTemplateRef.current = initialTemplate;
      }

      if (initialTemplate.parentName) setParentName(initialTemplate.parentName);
      if (initialTemplate.parentEmail) {
        setParentEmail(initialTemplate.parentEmail);
      }
      if (initialTemplate.parentPhone) setParentPhone(initialTemplate.parentPhone);
      if (initialTemplate.parentAddress || initialTemplate.address) {
        setParentAddress(
          initialTemplate.parentAddress || initialTemplate.address || "",
        );
      }
      if (initialTemplate.startDate) setStartDate(initialTemplate.startDate);
      if (initialTemplate.dailyRate) {
        setDailyRate(parseInt(initialTemplate.dailyRate, 10) || 5000);
      }
      if (initialTemplate.monthlyRate) {
        setMonthlyRate(parseInt(initialTemplate.monthlyRate, 10) || 110500);
      }
    }, [initialTemplate]);

    useEffect(() => {
      const template = scheduleTemplateRef.current;
      if (!template) return;

      const childIds = extractChildIdsFromFormEntries(template);
      if (
        childIds.length === 0 ||
        !childIds.every((id) => childrenData.some((child) => child.id === id))
      ) {
        return;
      }

      scheduleTemplateRef.current = null;

      const daySchedules = parseJsonField<
        Array<{ day: string; hours: number; startTime?: string }>
      >(template.daySchedules, []);

      return loadSchedulesWhenReady(
        childIds.slice(0, 1),
        () =>
          daySchedules.map((s) => ({
            day: s.day,
            startTime: s.startTime || "",
            hours: s.hours || 1,
          })),
        scheduleRefs,
      );
    }, [childrenData, initialTemplate]);

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
        const built = buildChildrenRowsFromProfile(
          profile.children,
          (id, index) => ({
            id,
            index,
            careType: "" as "" | "daily" | "monthly",
            totalDays: 0,
            isMonthSelected: false,
            dropoffTime: "",
            pickupTime: "",
            specialNeeds: "",
          }),
        );
        if (built) {
          setChildDefaults(built.defaults);
          setChildrenData(built.rows);
        }
      }
    }, []);

    useBookingProfilePrefill({
      initialTemplate,
      templateAppliedRef,
      onApply: applyProfilePrefill,
    });

    const monthWeekdayCount = countChildcareMonthDays(startDate);

    const recalculateMonthlyRate = useCallback(
      (baseRate: number) => {
        setMonthlyRate(Math.floor(baseRate * monthWeekdayCount * 0.85));
      },
      [monthWeekdayCount],
    );

    // Fetch pricing from database
    useEffect(() => {
      const fetchPricing = async () => {
        try {
          const response = await fetch("/api/services/pricing");
          if (response.ok) {
            const { data } = await response.json();
            if (data["childcare"]?.baseRate) {
              const baseRate = data["childcare"].baseRate;
              setDailyRate(baseRate);
              recalculateMonthlyRate(baseRate);
              setPricingLoadState("ready");
            } else {
              setPricingLoadState("failed");
            }
          } else {
            setPricingLoadState("failed");
          }
        } catch (error) {
          console.error("Error fetching pricing:", error);
          setPricingLoadState("failed");
        }
      };
      fetchPricing();
    }, [recalculateMonthlyRate]);

    useEffect(() => {
      recalculateMonthlyRate(dailyRate);
    }, [dailyRate, recalculateMonthlyRate]);

    useEffect(() => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.careType === "monthly" || child.isMonthSelected
            ? { ...child, totalDays: monthWeekdayCount }
            : child,
        ),
      );
    }, [monthWeekdayCount]);

    const handleCareTypeChange = useCallback(
      (childId: string, type: "daily" | "monthly" | "") => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId
              ? {
                  ...child,
                  careType: type,
                  isMonthSelected: type === "monthly",
                  totalDays:
                    type === "monthly"
                      ? monthWeekdayCount
                      : type === "daily"
                        ? child.totalDays
                        : 0,
                }
              : child
          )
        );
      },
      [monthWeekdayCount]
    );

    const handleDropoffTimeChange = useCallback(
      (childId: string, time: string) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId ? { ...child, dropoffTime: time } : child
          )
        );
      },
      []
    );

    const handlePickupTimeChange = useCallback(
      (childId: string, time: string) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId ? { ...child, pickupTime: time } : child
          )
        );
      },
      []
    );

    const handleSpecialNeedsChange = useCallback(
      (childId: string, needs: string) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId ? { ...child, specialNeeds: needs } : child
          )
        );
      },
      []
    );

    const handleOnDaysChange = useCallback(
      (childId: string, totalDays: number) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId ? { ...child, totalDays } : child
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
          careType: "",
          totalDays: 0,
          isMonthSelected: false,
          dropoffTime: "",
          pickupTime: "",
          specialNeeds: "",
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
          careType: "",
          totalDays: 0,
          isMonthSelected: false,
          dropoffTime: "",
          pickupTime: "",
          specialNeeds: "",
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
        if (!child.careType) {
          errors.push(
            `Child ${index + 1}: Please select a care type (daily or monthly)`
          );
        }
        if (!child.dropoffTime) {
          errors.push(`Child ${index + 1}: Please specify drop-off time`);
        }
        if (!child.pickupTime) {
          errors.push(`Child ${index + 1}: Please specify pickup time`);
        }
        if (child.totalDays === 0) {
          errors.push(`Child ${index + 1}: Please select at least one day`);
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
      isPricingReady: () => pricingLoadState === "ready",
    }));

    // Calculate total cost for all children
    const calculateTotalCost = () => {
      return childrenData.reduce((total, child) => {
        if (child.careType === "monthly") {
          return (
            total +
            prorateMonthlyChildcareTotal(
              monthlyRate,
              startDate,
              billingPeriodMonths,
            )
          );
        }
        if (child.careType === "daily") {
          return total + child.totalDays * dailyRate * billingPeriodMonths;
        }
        return total;
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
                placeholder="Enter your email"
                required
              />
            </div>

            <PhoneInput
              name="parentPhone"
              label="Phone Number"
              required
              placeholder="Enter phone number"
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
                  When should childcare begin?
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

        {/* Header for Children Sections */}
        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Children & Childcare Details
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
                <ClockIcon className="w-6 h-6 text-gray-700" />
                Child #{index + 1} - Childcare Information
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

            {/* Care Type Selection for this child */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Care Type <span className="text-red-500">*</span>
                </label>
                <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-700">
                  Monthly plans include 15% discount
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors flex-1">
                  <input
                    type="radio"
                    name={`careType_${child.id}`}
                    value="daily"
                    checked={child.careType === "daily"}
                    onChange={() => handleCareTypeChange(child.id, "daily")}
                    className="w-4 h-4 text-[#90AC19] border-gray-300 focus:ring-[#90AC19]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Daily Care</div>
                    <div className="text-sm text-gray-600 font-semibold">
                      ₦{dailyRate.toLocaleString()} per day
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors flex-1">
                  <input
                    type="radio"
                    name={`careType_${child.id}`}
                    value="monthly"
                    checked={child.careType === "monthly"}
                    onChange={() => handleCareTypeChange(child.id, "monthly")}
                    className="w-4 h-4 text-[#90AC19] border-gray-300 focus:ring-[#90AC19]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      Monthly Plan
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      ₦{monthlyRate.toLocaleString()} per month
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Time Selection for this child */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-900 block mb-1">
                    Drop-off Time <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-600">e.g., 08:00 AM</span>
                </label>
                <input
                  type="text"
                  name={`dropoffTime_${child.id}`}
                  value={child.dropoffTime}
                  onChange={(e) =>
                    handleDropoffTimeChange(child.id, e.target.value)
                  }
                  placeholder="08:00 AM"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-900 block mb-1">
                    Pick-up Time <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-600">e.g., 05:00 PM</span>
                </label>
                <input
                  type="text"
                  name={`pickupTime_${child.id}`}
                  value={child.pickupTime}
                  onChange={(e) =>
                    handlePickupTimeChange(child.id, e.target.value)
                  }
                  placeholder="05:00 PM"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
                  required
                />
              </div>
            </div>

            {/* Special Needs for this child */}
            <div>
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900 block mb-1">
                  Special Needs or Instructions
                </span>
                <span className="text-xs text-gray-600">
                  Optional - Any allergies, medical conditions, or special care
                  instructions
                </span>
              </label>
              <textarea
                name={`specialNeeds_${child.id}`}
                value={child.specialNeeds}
                onChange={(e) =>
                  handleSpecialNeedsChange(child.id, e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 resize-none"
                placeholder="e.g., Food allergies, medication schedule, behavioral considerations, special activities..."
                rows={4}
              />
            </div>

            {/* Schedule for this child */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-gray-700" />
                Weekly Childcare Schedule
              </h4>
              <WeekdaysSchedule
                ref={(el) => {
                  scheduleRefs.current[child.id] = el;
                }}
                childcare={true}
                startDate={startDate}
                billingPeriodMonths={billingPeriodMonths}
                showBillingPeriodMonths={Boolean(onBillingPeriodMonthsChange)}
                onBillingPeriodMonthsChange={onBillingPeriodMonthsChange}
                onDaysChange={(days) => handleOnDaysChange(child.id, days)}
                onMonthSelected={(isMonth) => {
                  setChildrenData((prev) =>
                    prev.map((c) =>
                      c.id === child.id
                        ? {
                            ...c,
                            isMonthSelected: isMonth,
                            totalDays: isMonth ? monthWeekdayCount : c.totalDays,
                            careType: isMonth ? "monthly" : c.careType,
                          }
                        : c
                    )
                  );
                }}
              />
              <input
                type="hidden"
                name={`totalDays_${child.id}`}
                value={child.totalDays}
              />
              <input
                type="hidden"
                name={`isMonthSelected_${child.id}`}
                value={child.isMonthSelected ? "true" : "false"}
              />
            </div>

            {/* Subtotal for this child */}
            {child.careType && child.totalDays > 0 && (
              <div className="bg-[#90AC19]/5 border border-[#90AC19]/20 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subtotal for Child #{index + 1}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {child.careType === "monthly"
                        ? `Monthly plan (${monthWeekdayCount} days, 15% discount)`
                        : `${
                            child.totalDays
                          } days × ₦${dailyRate.toLocaleString()}/day`}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#90AC19]">
                    ₦
                    {(child.careType === "monthly"
                      ? monthlyRate
                      : child.totalDays * dailyRate
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        <AddAnotherChildButton onClick={addChild} />

        {/* Hidden field for children count */}
        <input type="hidden" name="childrenCount" value={childrenData.length} />

        {/* Final Payment Summary */}
        {childrenData.some(
          (child) => child.careType && child.totalDays > 0
        ) && (
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-base-content mb-6">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-base-content/70" />
              Final Payment Summary
            </h3>

            {/* Individual child costs */}
            <div className="space-y-3 mb-6">
              {childrenData.map((child, index) => {
                if (child.careType && child.totalDays > 0) {
                  const childCost =
                    child.careType === "monthly"
                      ? monthlyRate
                      : child.totalDays * dailyRate;
                  return (
                    <div
                      key={child.id}
                      className="bg-base-200 p-4 rounded-lg border border-base-300"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-base-content">
                            Child #{index + 1}
                          </p>
                          <p className="text-sm text-base-content/70">
                            {child.careType === "monthly"
                              ? `Monthly plan (${monthWeekdayCount} days)`
                              : `${child.totalDays} days/week`}{" "}
                            •
                            {child.dropoffTime &&
                              child.pickupTime &&
                              ` ${child.dropoffTime} - ${child.pickupTime}`}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-base-content">
                          ₦{childCost.toLocaleString()}
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

            <input type="hidden" name="dailyRate" value={dailyRate} />
            <input type="hidden" name="monthlyRate" value={monthlyRate} />
            <input
              type="hidden"
              name="totalCost"
              value={calculateTotalCost()}
            />

            <div className="mt-6 bg-base-200 border border-base-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <span className="text-sm text-base-content">
                  Professional childcare in a safe, nurturing environment with
                  qualified staff. Meals and activities included.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

ChildCareSpecificBookingForm.displayName = "ChildCareSpecificBookingForm";

export default ChildCareSpecificBookingForm;
