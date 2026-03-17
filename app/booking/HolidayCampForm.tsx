import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChildInfoForm from "./ChildInfoForm";
import PaymentSchedule from "./PaymentSchedule";
import PhoneInput from "@/components/PhoneInput";
import {
  UserIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";

export interface HolidayCampFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const CAMP_START_DATE = "2026-04-07";
const CAMP_END_DATE = "2026-04-25";
const CAMP_LABEL = "April 7 - April 25, 2026";
const EARLY_BIRD_END_ISO = "2026-04-01T00:00:00";
const EARLY_BIRD_RATE = 25000;
const REGULAR_WEEKLY_RATE = 30000;

const CAMP_WEEKS = [
  {
    weekNumber: 1,
    startDate: "2026-04-07",
    endDate: "2026-04-11",
    label: "Week 1",
    dateLabel: "April 7 - April 11",
  },
  {
    weekNumber: 2,
    startDate: "2026-04-13",
    endDate: "2026-04-18",
    label: "Week 2",
    dateLabel: "April 13 - April 18",
  },
  {
    weekNumber: 3,
    startDate: "2026-04-20",
    endDate: "2026-04-25",
    label: "Week 3",
    dateLabel: "April 20 - April 25",
  },
] as const;

const isEarlyBirdRateActive = () =>
  Date.now() < new Date(EARLY_BIRD_END_ISO).getTime();

const getEffectiveWeeklyRate = (baseRate: number) =>
  isEarlyBirdRateActive() ? EARLY_BIRD_RATE : baseRate;

interface ChildCampData {
  id: string;
}

interface HolidayCampFormProps {
  onTotalChange?: (total: number) => void;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef, HolidayCampFormProps>(
  (props, ref) => {
    const { data: session } = useSession();
    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [childrenData, setChildrenData] = useState<ChildCampData[]>([
      { id: uuidv4() },
    ]);
    const [baseWeeklyRate, setBaseWeeklyRate] = useState(REGULAR_WEEKLY_RATE);
    const [selectedWeeksByChild, setSelectedWeeksByChild] = useState<
      Record<string, number[]>
    >({});

    const weeklyRate = getEffectiveWeeklyRate(baseWeeklyRate);

    useEffect(() => {
      if (session?.user) {
        if (session.user.name) setParentName(session.user.name);
        if (session.user.email) setParentEmail(session.user.email);
      }
    }, [session]);

    useEffect(() => {
      const fetchPricing = async () => {
        try {
          const response = await fetch("/api/services/pricing");
          if (response.ok) {
            const { data } = await response.json();
            if (data["holiday-camps"]?.baseRate) {
              setBaseWeeklyRate(data["holiday-camps"].baseRate);
            }
          }
        } catch (error) {
          console.error("Error fetching pricing:", error);
        }
      };
      fetchPricing();
    }, []);

    useEffect(() => {
      setSelectedWeeksByChild((prev) => {
        const next: Record<string, number[]> = {};

        childrenData.forEach((child) => {
          next[child.id] =
            prev[child.id] || CAMP_WEEKS.map((week) => week.weekNumber);
        });

        return next;
      });
    }, [childrenData]);

    const totalSelectedWeeks = childrenData.reduce((sum, child) => {
      return sum + (selectedWeeksByChild[child.id]?.length || 0);
    }, 0);

    const totalAmount = totalSelectedWeeks * weeklyRate;

    useEffect(() => {
      props.onTotalChange?.(totalAmount);
    }, [props.onTotalChange, totalAmount]);

    const toggleWeekSelection = (childId: string, weekNumber: number) => {
      setSelectedWeeksByChild((prev) => {
        const currentSelection = prev[childId] || [];
        const isSelected = currentSelection.includes(weekNumber);

        const nextSelection = isSelected
          ? currentSelection.filter((week) => week !== weekNumber)
          : [...currentSelection, weekNumber].sort((a, b) => a - b);

        return {
          ...prev,
          [childId]: nextSelection,
        };
      });
    };

    const addChild = () => {
      setChildrenData((prev) => [...prev, { id: uuidv4() }]);
    };

    const removeChild = (id: string) => {
      if (childrenData.length <= 1) return;

      setChildrenData((prev) => prev.filter((child) => child.id !== id));
      setSelectedWeeksByChild((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const resetForm = () => {
      const firstChildId = uuidv4();
      setChildrenData([{ id: firstChildId }]);
      setSelectedWeeksByChild({
        [firstChildId]: CAMP_WEEKS.map((week) => week.weekNumber),
      });
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      for (const [index, child] of childrenData.entries()) {
        if (
          !selectedWeeksByChild[child.id] ||
          selectedWeeksByChild[child.id].length === 0
        ) {
          return {
            isValid: false,
            errors: [`Select at least one camp week for Child #${index + 1}.`],
          };
        }
      }

      return { isValid: true, errors: [] };
    };

    useImperativeHandle(ref, () => ({
      resetForm,
      validate,
    }));

    return (
      <div className="space-y-6">
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
          </div>
        </div>

        <div className="bg-[#90AC19]/10 border-2 border-[#90AC19]/40 rounded-lg p-5 flex items-center gap-4">
          <CalendarIcon className="w-8 h-8 text-[#90AC19] shrink-0" />
          <div>
            <p className="text-base font-bold text-gray-900">
              Alive in Me Easter Camp
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              Easter camp runs from {CAMP_LABEL}. Select from the 3 available
              weeks below for each child.
            </p>
          </div>
        </div>

        <input type="hidden" name="campStartDate" value={CAMP_START_DATE} />
        <input type="hidden" name="campEndDate" value={CAMP_END_DATE} />

        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Children Registered for Camp
          </h2>
          <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
            {childrenData.length}{" "}
            {childrenData.length === 1 ? "Child" : "Children"}
          </div>
        </div>

        {childrenData.map((child, index) => {
          const selectedWeekNumbers = selectedWeeksByChild[child.id] || [];
          const selectedWeeks = CAMP_WEEKS.filter((week) =>
            selectedWeekNumbers.includes(week.weekNumber),
          );
          const childSubtotal = selectedWeeks.length * weeklyRate;

          return (
            <div
              key={child.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-gray-700" />
                  Child #{index + 1} - Easter Camp Registration
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

              <ChildInfoForm
                childIndex={index}
                childId={child.id}
                onRemove={() => removeChild(child.id)}
                showRemoveButton={false}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Select Camp Weeks
                    </p>
                    <p className="text-sm text-gray-600">
                      Weekly rate: ₦{weeklyRate.toLocaleString()} per week
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {selectedWeeks.length}{" "}
                    {selectedWeeks.length === 1 ? "week" : "weeks"} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CAMP_WEEKS.map((week) => {
                    const isSelected = selectedWeekNumbers.includes(
                      week.weekNumber,
                    );

                    return (
                      <label
                        key={week.weekNumber}
                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                          isSelected
                            ? "border-[#90AC19] bg-[#90AC19]/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleWeekSelection(child.id, week.weekNumber)
                          }
                          className="sr-only"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-gray-900">
                              {week.label}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              ₦{weeklyRate.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {week.dateLabel}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <input
                type="hidden"
                name={`campWeeks_${child.id}`}
                value={JSON.stringify(selectedWeeks)}
              />

              <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Subtotal for Child #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedWeeks.length}{" "}
                      {selectedWeeks.length === 1 ? "week" : "weeks"} x ₦
                      {weeklyRate.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    ₦{childSubtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addChild}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-[#90AC19] hover:bg-[#90AC19]/5 hover:text-[#90AC19] transition-all duration-200 font-medium"
        >
          <PlusIcon className="w-6 h-6" />
          Add Another Child
        </button>

        <input type="hidden" name="childrenCount" value={childrenData.length} />
        <input type="hidden" name="weeklyRate" value={weeklyRate} />
        <input type="hidden" name="campFee" value={weeklyRate} />
        <input type="hidden" name="totalWeeks" value={totalSelectedWeeks} />
        <input type="hidden" name="promoCode" value="" />
        <input type="hidden" name="promoDiscount" value={0} />

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-900 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-gray-700" />
            Final Payment Summary
          </h3>

          <p className="text-sm text-gray-700 mb-4">
            Standard pricing is ₦30,000 per week. Early bird pricing is ₦25,000
            per week until March 31, 2026.
          </p>

          <div className="space-y-3 mb-6">
            {childrenData.map((child, index) => {
              const selectedWeekCount =
                selectedWeeksByChild[child.id]?.length || 0;
              const childTotal = selectedWeekCount * weeklyRate;

              return (
                <div
                  key={child.id}
                  className="bg-white p-4 rounded-lg border-2 border-gray-300"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Child #{index + 1}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedWeekCount}{" "}
                        {selectedWeekCount === 1 ? "week" : "weeks"} selected
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      ₦{childTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <PaymentSchedule
            holidayCamp={true}
            numberOfChildren={childrenData.length}
            weeklyRate={weeklyRate}
            totalWeeks={totalSelectedWeeks}
          />

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
            <span className="text-sm text-gray-700">
              Camp pricing is based on the number of weeks selected for each
              child. Only the 3 Easter camp weeks from April 7 to April 25, 2026
              are available.
            </span>
          </div>
        </div>
      </div>
    );
  },
);

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
