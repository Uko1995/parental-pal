import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import OptionalChild from "./OptionalChild";
import PaymentSchedule from "./PaymentSchedule";
import WeekdaysSchedule, { WeekdaysScheduleRef } from "./WeekdaysSchedule";

export interface ChildCareSpecificBookingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const ChildCareSpecificBookingForm =
  forwardRef<ChildCareSpecificBookingFormRef>((props, ref) => {
    const [totalDays, setTotalDays] = useState(0);
    const [isMonthSelected, setIsMonthSelected] = useState(false);
    const [careType, setCareType] = useState<"daily" | "monthly" | "">("");
    const [dropoffTime, setDropoffTime] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [specialNeeds, setSpecialNeeds] = useState("");
    const weekdaysScheduleRef = useRef<WeekdaysScheduleRef>(null);

    const resetForm = () => {
      setTotalDays(0);
      setIsMonthSelected(false);
      setCareType("");
      setDropoffTime("");
      setPickupTime("");
      setSpecialNeeds("");
      weekdaysScheduleRef.current?.resetSchedule();
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!careType) {
        errors.push("Please select a care type (daily or monthly)");
      }

      if (!dropoffTime) {
        errors.push("Please specify drop-off time");
      }

      if (!pickupTime) {
        errors.push("Please specify pickup time");
      }

      if (totalDays === 0) {
        errors.push("Please select at least one day");
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

    const monthlyChildcareDiscount = 0.15;
    const monthlyChildcareRate =
      5 * 4 * 5000 - 5 * 4 * 5000 * monthlyChildcareDiscount;

    const handleOnDaysChange = (totalDays: number) => {
      setTotalDays(totalDays);
    };

    const handleOnMonthSelected = (isMonthSelected: boolean) => {
      setIsMonthSelected(isMonthSelected);
    };

    return (
      <div className="space-y-8">
        {/* Parent Information Section */}
        <div className="card bg-base-100 shadow-lg">
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
                  className="input input-bordered "
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
            <h3 className="card-title text-xl flex items-center  mb-6">
              Child Information
            </h3>
            <OptionalChild />
          </div>
        </div>

        {/* Childcare Specific Information */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center mb-6">
              Childcare Details
            </h3>

            {/* Care Type Selection */}
            <div className="form-control mb-6">
              <label className="label mb-2">
                <span className="label-text font-medium flex items-center gap-2">
                  Care Type *
                </span>
                <span className="label-text-alt text-xs">
                  Monthly plans include 15% discount
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors flex-1">
                  <input
                    type="radio"
                    name="careType"
                    value="daily"
                    checked={careType === "daily"}
                    onChange={(e) => setCareType(e.target.value as "daily")}
                    className="radio"
                  />
                  <div>
                    <div className="font-medium">Daily Care</div>
                    <div className="text-sm text-base-content/70">
                      ₦5,000 per day
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors flex-1">
                  <input
                    type="radio"
                    name="careType"
                    value="monthly"
                    checked={careType === "monthly"}
                    onChange={(e) => setCareType(e.target.value as "monthly")}
                    className="radio "
                  />
                  <div>
                    <div className="font-medium">Monthly Plan</div>
                    <div className="text-sm text-base-content/70">
                      ₦{monthlyChildcareRate.toLocaleString()} per month
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    Drop-off Time *
                  </span>
                </label>
                <input
                  type="time"
                  name="dropoffTime"
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  className="input input-bordered "
                  required
                />
              </div>

              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    Pick-up Time *
                  </span>
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="input input-bordered "
                  required
                />
              </div>
            </div>

            {/* Special Needs */}
            <div className="form-control mb-6">
              <label className="label mb-2">
                <span className="label-text font-medium flex items-center gap-2">
                  Special Needs or Instructions
                </span>
                <span className="label-text-alt text-xs">
                  Optional - Any allergies, medical conditions, or special care
                  instructions
                </span>
              </label>
              <textarea
                name="specialNeeds"
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                className="textarea textarea-bordered  w-full h-32"
                placeholder="e.g., Food allergies, medication schedule, behavioral considerations, special activities..."
              />
            </div>
          </div>
        </div>

        {/* Schedule Selection */}
        <div className="card bg-base-100 shadow-lg border border-primary/10">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center text-primary mb-6">
              Schedule & Availability
            </h3>
            <WeekdaysSchedule
              ref={weekdaysScheduleRef}
              childcare={true}
              onDaysChange={handleOnDaysChange}
              onMonthSelected={handleOnMonthSelected}
            />
          </div>
        </div>

        {/* Payment Summary */}
        {totalDays > 0 && (
          <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg border border-primary/20">
            <div className="card-body">
              <PaymentSchedule
                serviceCost={5000}
                childcare={true}
                totalDays={totalDays}
                monthlyChildcareRate={monthlyChildcareRate}
                isMonthSelected={isMonthSelected}
              />
            </div>
          </div>
        )}
      </div>
    );
  });

ChildCareSpecificBookingForm.displayName = "ChildCareSpecificBookingForm";

export default ChildCareSpecificBookingForm;
