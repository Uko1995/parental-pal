import { useState, useImperativeHandle, forwardRef } from "react";
import OptionalChild from "./OptionalChild";
import PaymentSchedule from "./PaymentSchedule";

export interface HolidayCampFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface CampWeek {
  startDate: string;
  endDate: string;
  weekNumber: number;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef>((props, ref) => {
  const [campWeeks, setCampWeeks] = useState<CampWeek[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState<string>("");

  const resetForm = () => {
    setCampWeeks([]);
    setCurrentStartDate("");
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (campWeeks.length === 0) {
      errors.push("Please select at least one camp week");
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

  // Function to calculate the week dates based on start date
  const calculateWeekDates = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // 5-day week (Monday to Friday)

    return {
      startDate,
      endDate: end.toISOString().split("T")[0],
      weekNumber: campWeeks.length + 1,
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
      const isAlreadySelected = campWeeks.some(
        (week) => week.startDate === date
      );

      if (!isAlreadySelected) {
        setCampWeeks((prev) => [...prev, weekDetails]);
        setCurrentStartDate(""); // Clear the input for next selection
      }
    }
  };

  const removeWeek = (startDate: string) => {
    setCampWeeks((prev) => prev.filter((week) => week.startDate !== startDate));
  };

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

  const totalWeeks = campWeeks.length;

  return (
    <div className="space-y-8">
      {/* Parent Information Section */}
      <div className="card bg-base-100 shadow-lg border border-primary/10">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center text-primary mb-6">
            Parent/Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                name="parentName"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Email Address *
                </span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Phone Number *
                </span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Address *
                </span>
              </label>
              <input
                type="text"
                name="address"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="card bg-base-100 shadow-lg border border-secondary/10">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center text-secondary mb-6">
            Child Information
          </h3>
          <OptionalChild />
        </div>
      </div>

      {/* Holiday Camp Scheduling */}
      <div className="card bg-base-100 shadow-lg border border-accent/10">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center text-accent mb-6">
            Camp Weeks Selection
          </h3>

          {/* Week Selection Input */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                Add Camp Week *
              </span>
              <span className="label-text-alt text-xs">
                Select Monday as start date (₦30,000 per week)
              </span>
            </label>
            <div className="flex gap-4">
              <input
                type="date"
                value={currentStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input input-bordered input-primary focus:input-primary flex-1"
                placeholder="Select start date (Monday)"
              />
              <button
                type="button"
                className="btn btn-primary btn-outline"
                onClick={() => handleStartDateChange(currentStartDate)}
                disabled={!currentStartDate}
              >
                Add Week
              </button>
            </div>
          </div>

          {/* Selected Weeks Display */}
          {campWeeks.length > 0 && (
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">
                  Selected Camp Weeks ({campWeeks.length})
                </span>
              </label>
              <div className="space-y-3">
                {campWeeks.map((week) => (
                  <div
                    key={week.startDate}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="badge badge-primary badge-lg">
                        Week {week.weekNumber}
                      </div>
                      <div>
                        <div className="font-medium text-base-content">
                          {formatWeekRange(week)}
                        </div>
                        <div className="text-sm text-base-content/70">
                          5 days • ₦30,000
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/20"
                      onClick={() => removeWeek(week.startDate)}
                      title="Remove week"
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden input for form submission */}
          <input
            type="hidden"
            name="campWeeks"
            value={JSON.stringify(campWeeks)}
          />
        </div>
      </div>

      {/* Payment Summary */}
      {totalWeeks > 0 && (
        <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg border border-primary/20">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center text-primary mb-4">
              Payment Summary
            </h3>
            <PaymentSchedule
              serviceCost={30000}
              totalDays={totalWeeks}
              childcare={false}
              holidayCamp={true}
              totalWeeks={campWeeks.length}
            />
          </div>
        </div>
      )}
    </div>
  );
});

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
