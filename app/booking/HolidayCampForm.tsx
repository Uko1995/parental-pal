import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
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

interface CampWeek {
  startDate: string;
  endDate: string;
  weekNumber: number;
}

interface ChildCampData {
  id: string;
  index: number;
  campWeeks: CampWeek[];
  currentStartDate: string;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef>((props, ref) => {
  const { data: session } = useSession();
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const [childrenData, setChildrenData] = useState<ChildCampData[]>([
    {
      id: uuidv4(),
      index: 0,
      campWeeks: [],
      currentStartDate: "",
    },
  ]);
  const [weeklyRate, setWeeklyRate] = useState(30000); // Default to ₦30,000/week

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
        if (response.ok) {
          const { data } = await response.json();
          if (data["holiday-camps"]?.baseRate) {
            setWeeklyRate(data["holiday-camps"].baseRate);
          }
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        // Keep default rate if fetch fails
      }
    };
    fetchPricing();
  }, []);

  const handleAddWeek = useCallback((childId: string) => {
    setChildrenData((prev) =>
      prev.map((child) => {
        if (child.id === childId && child.currentStartDate) {
          const startDate = new Date(child.currentStartDate);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);

          const newWeek: CampWeek = {
            startDate: child.currentStartDate,
            endDate: endDate.toISOString().split("T")[0],
            weekNumber: child.campWeeks.length + 1,
          };

          return {
            ...child,
            campWeeks: [...child.campWeeks, newWeek],
            currentStartDate: "",
          };
        }
        return child;
      })
    );
  }, []);

  const handleRemoveWeek = useCallback((childId: string, weekIndex: number) => {
    setChildrenData((prev) =>
      prev.map((child) => {
        if (child.id === childId) {
          const updatedWeeks = child.campWeeks.filter(
            (_, idx) => idx !== weekIndex
          );
          // Renumber the remaining weeks
          return {
            ...child,
            campWeeks: updatedWeeks.map((week, idx) => ({
              ...week,
              weekNumber: idx + 1,
            })),
          };
        }
        return child;
      })
    );
  }, []);

  const handleStartDateChange = useCallback((childId: string, date: string) => {
    setChildrenData((prev) =>
      prev.map((child) =>
        child.id === childId ? { ...child, currentStartDate: date } : child
      )
    );
  }, []);

  const addChild = () => {
    setChildrenData((prev) => [
      ...prev,
      {
        id: uuidv4(),
        index: prev.length,
        campWeeks: [],
        currentStartDate: "",
      },
    ]);
  };

  const removeChild = (id: string) => {
    if (childrenData.length > 1) {
      setChildrenData((prev) => prev.filter((child) => child.id !== id));
    }
  };

  const resetForm = () => {
    setChildrenData([
      {
        id: uuidv4(),
        index: 0,
        campWeeks: [],
        currentStartDate: "",
      },
    ]);
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    childrenData.forEach((child, index) => {
      if (child.campWeeks.length === 0) {
        errors.push(`Child ${index + 1}: Please select at least one camp week`);
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

  // Helper function to format week dates
  const formatWeekRange = (week: CampWeek) => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Calculate total cost for all children
  const calculateTotalCost = () => {
    return childrenData.reduce((total, child) => {
      return total + child.campWeeks.length * weeklyRate;
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

      {/* Header for Children Sections */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Children & Holiday Camp Details
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
              <CalendarIcon className="w-6 h-6 text-gray-700" />
              Child #{index + 1} - Holiday Camp Registration
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

          {/* Camp Week Selection for this child */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              Select Camp Weeks
            </h4>

            {/* Week Selection Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-gray-800 font-medium">
                  Add Camp Week <span className="text-red-600">*</span>
                </span>
                <span className="label-text-alt text-gray-500 text-xs">
                  Select start date • ₦{weeklyRate.toLocaleString()} per week
                </span>
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={child.currentStartDate}
                  onChange={(e) =>
                    handleStartDateChange(child.id, e.target.value)
                  }
                  className="input border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 flex-1"
                  placeholder="Select start date"
                />
                <button
                  type="button"
                  className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
                  onClick={() => handleAddWeek(child.id)}
                  disabled={!child.currentStartDate}
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Week
                </button>
              </div>
            </div>

            {/* Selected Weeks Display */}
            {child.campWeeks.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-800">
                  Selected Weeks ({child.campWeeks.length})
                </p>
                {child.campWeeks.map((week, weekIdx) => (
                  <div
                    key={week.startDate}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="badge bg-gray-600 text-white border-0">
                        Week {week.weekNumber}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {formatWeekRange(week)}
                        </div>
                        <div className="text-xs text-gray-600">
                          7 days • ₦{weeklyRate.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveWeek(child.id, weekIdx)}
                      title="Remove week"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden field for this child's camp weeks */}
            <input
              type="hidden"
              name={`campWeeks_${child.id}`}
              value={JSON.stringify(child.campWeeks)}
            />
          </div>

          {/* Subtotal for this child */}
          {child.campWeeks.length > 0 && (
            <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Subtotal for Child #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {child.campWeeks.length}{" "}
                    {child.campWeeks.length === 1 ? "week" : "weeks"} × ₦
                    {weeklyRate.toLocaleString()}/week
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  ₦{(child.campWeeks.length * weeklyRate).toLocaleString()}
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
      {childrenData.some((child) => child.campWeeks.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-900 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-gray-700" />
            Final Payment Summary
          </h3>

          {/* Individual child costs */}
          <div className="space-y-3 mb-6">
            {childrenData.map((child, index) => {
              if (child.campWeeks.length > 0) {
                const childCost = child.campWeeks.length * weeklyRate;
                return (
                  <div
                    key={child.id}
                    className="bg-white p-4 rounded-lg border-2 border-gray-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Child #{index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          {child.campWeeks.length}{" "}
                          {child.campWeeks.length === 1 ? "week" : "weeks"} of
                          camp
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        ₦{childCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* PaymentSchedule Component */}
          <PaymentSchedule
            holidayCamp={true}
            totalWeeks={childrenData.reduce(
              (total, child) => total + child.campWeeks.length,
              0
            )}
            serviceCost={weeklyRate}
            totalDays={childrenData.reduce(
              (total, child) => total + child.campWeeks.length,
              0
            )}
          />

          <input type="hidden" name="weeklyRate" value={weeklyRate} />
          <input type="hidden" name="totalCost" value={calculateTotalCost()} />

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
            <span className="text-sm text-gray-700">
              Fun, educational holiday camp with supervised activities, meals,
              and excursions included.
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
