import { useState, useImperativeHandle, forwardRef } from "react";
import OptionalChild from "./OptionalChild";
import PaymentSchedule from "./PaymentSchedule";

export interface HolidayCampFormRef {
  resetForm: () => void;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef>((props, ref) => {
  const [selectedWeeks, setSelectedWeeks] = useState<
    {
      startDate: string;
      endDate: string;
      formattedRange: string;
      weekNumber: number;
    }[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [currentStartDate, setCurrentStartDate] = useState<string>("");

  const resetForm = () => {
    setSelectedWeeks([]);
    setSelectedLocation("");
    setCurrentStartDate("");
  };

  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  // Function to calculate the week dates based on start date
  const calculateWeekDates = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // 5-day week (Monday to Friday)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return {
      startDate,
      endDate: end.toISOString().split("T")[0],
      formattedRange: `${formatDate(start)} - ${formatDate(end)}`,
      weekNumber: selectedWeeks.length + 1,
    };
  };

  const handleStartDateChange = (date: string) => {
    setCurrentStartDate(date);

    if (date) {
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();

      // Check if selected date is Monday (dayOfWeek = 1)
      if (dayOfWeek !== 1) {
        alert(
          "Please select a Monday as the start date for your holiday camp week."
        );
        setCurrentStartDate("");
        return;
      }

      const weekDetails = calculateWeekDates(date);

      // Check if this week is already selected
      const isAlreadySelected = selectedWeeks.some(
        (week) => week.startDate === date
      );

      if (!isAlreadySelected) {
        setSelectedWeeks((prev) => [...prev, weekDetails]);
        setCurrentStartDate(""); // Clear the input for next selection
      }
    }
  };

  const removeWeek = (startDate: string) => {
    setSelectedWeeks((prev) =>
      prev.filter((week) => week.startDate !== startDate)
    );
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const totalWeeks = selectedWeeks.length;
  const totalCost = totalWeeks * 30000;

  return (
    <div>
      {/* Parent Information Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#90AC19]"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter your address"
              required
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Child Information Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#E8931A]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
          Child Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child&apos;s Name *
            </label>
            <input
              type="text"
              name="childName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter your child's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child&apos;s Age *
            </label>
            <input
              type="number"
              name="childAge"
              min="1"
              max="18"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
              placeholder="Enter age"
              required
            />
          </div>
        </div>
        <OptionalChild />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Location Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#A25F97]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Camp Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedLocation === "mainland"
                ? "border-[#90AC19] bg-green-50"
                : "border-gray-300 hover:border-[#90AC19]"
            }`}
          >
            <input
              type="radio"
              name="location"
              value="mainland"
              checked={selectedLocation === "mainland"}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                Mainland
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Yaba, Surulere, Ikeja Areas
              </div>
            </div>
          </label>

          <label
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedLocation === "island"
                ? "border-[#90AC19] bg-green-50"
                : "border-gray-300 hover:border-[#90AC19]"
            }`}
          >
            <input
              type="radio"
              name="location"
              value="island"
              checked={selectedLocation === "island"}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">Island</div>
              <div className="text-sm text-gray-600 mt-1">
                Victoria Island, Ikoyi, Lekki Areas
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Week Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#E8931A]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          Select Holiday Camp Weeks
        </h3>

        {/* Date Input for Week Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Week Start Date (Monday) *
          </label>
          <input
            type="date"
            value={currentStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8931A] focus:border-[#E8931A] transition-colors duration-300"
            placeholder="Choose week start date"
          />
          <p className="text-xs text-gray-600 mt-1">
            Select a Monday to start your holiday camp week (Monday-Friday).
            Only future dates are allowed.
          </p>
        </div>

        {/* Selected Weeks Display */}
        {selectedWeeks.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Selected Weeks:
            </h4>
            <div className="space-y-3">
              {selectedWeeks.map((week) => (
                <div
                  key={week.startDate}
                  className="flex items-center justify-between p-4 bg-orange-50 border border-[#E8931A] rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#E8931A] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {week.weekNumber}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Week {week.weekNumber}: {week.formattedRange}
                      </div>
                      <div className="text-xs text-gray-600">
                        ₦30,000 per week
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWeek(week.startDate)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-300"
                    title="Remove week"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Schedule */}
      {totalWeeks > 0 && selectedLocation && (
        <div className="mt-6">
          <PaymentSchedule
            serviceCost={30000}
            totalDays={totalWeeks}
            childcare={false}
            holidayCamp={true}
            totalWeeks={selectedWeeks.length}
          />
        </div>
      )}

      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name="selectedWeeks"
        value={JSON.stringify(selectedWeeks)}
      />
      <input type="hidden" name="campLocation" value={selectedLocation} />
      <input type="hidden" name="totalWeeks" value={totalWeeks} />
      <input type="hidden" name="totalCost" value={totalCost} />

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>
    </div>
  );
});

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
