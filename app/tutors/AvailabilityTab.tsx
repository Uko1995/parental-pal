"use client";

import { ClockIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { TutorFormData } from "./TutorRegistrationForm";

interface AvailabilityTabProps {
  formData: TutorFormData;
  updateFormData: (updates: Partial<TutorFormData>) => void;
}

export default function AvailabilityTab({
  formData,
  updateFormData,
}: AvailabilityTabProps) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeSlots = [
    { value: "06:00", label: "6:00 AM" },
    { value: "07:00", label: "7:00 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "19:00", label: "7:00 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "21:00", label: "9:00 PM" },
    { value: "22:00", label: "10:00 PM" },
  ];

  const handleDayToggle = (day: string) => {
    const updatedDays = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day];

    updateFormData({
      availability: {
        ...formData.availability,
        days: updatedDays,
      },
    });
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    updateFormData({
      availability: {
        ...formData.availability,
        hours: {
          ...formData.availability.hours,
          [type]: value,
        },
      },
    });
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Availability & Schedule
        </h3>
        <p className="text-gray-600">
          Set your preferred working days and hours
        </p>
      </div>

      {/* Quick Schedule Templates */}
      <div className="divider">Quick Schedule Templates</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          className="card card-compact bg-base-100 border border-gray-200 hover:border-gray-500 transition-all duration-200"
          onClick={() =>
            updateFormData({
              availability: {
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                hours: { start: "09:00", end: "17:00" },
              },
            })
          }
        >
          <div className="card-body items-center text-center">
            <h5 className="font-medium">Weekdays</h5>
            <p className="text-sm text-gray-600">Mon-Fri, 9 AM - 5 PM</p>
          </div>
        </button>

        <button
          type="button"
          className="card card-compact bg-base-100 border border-gray-200 hover:border-gray-500 transition-all duration-200"
          onClick={() =>
            updateFormData({
              availability: {
                days: ["Saturday", "Sunday"],
                hours: { start: "10:00", end: "18:00" },
              },
            })
          }
        >
          <div className="card-body items-center text-center">
            <h5 className="font-medium">Weekends</h5>
            <p className="text-sm text-gray-600">Sat-Sun, 10 AM - 6 PM</p>
          </div>
        </button>

        <button
          type="button"
          className="card card-compact bg-base-100 border border-gray-200 hover:border-gray-500 transition-all duration-200"
          onClick={() =>
            updateFormData({
              availability: {
                days: ["Monday", "Wednesday", "Friday", "Saturday"],
                hours: { start: "14:00", end: "20:00" },
              },
            })
          }
        >
          <div className="card-body items-center text-center">
            <h5 className="font-medium">Evenings</h5>
            <p className="text-sm text-gray-600">Flexible, 2 PM - 8 PM</p>
          </div>
        </button>
      </div>

      {/* Available Days */}
      <div className="form-control">
        <label className="label mb-1">
          <span className="label-text font-medium">
            <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
            Available Days *
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {daysOfWeek.map((day) => (
            <label key={day} className="cursor-pointer">
              <div
                className={`card card-compact ${
                  formData.availability.days.includes(day)
                    ? "bg-gray-200 "
                    : "bg-base-200 hover:bg-base-300"
                } transition-all duration-200`}
              >
                <div className="card-body items-center text-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm hidden"
                    checked={formData.availability.days.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  <span className="text-sm font-medium">{day}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
        {formData.availability.days.length === 0 && (
          <label className="label">
            <span className="label-text-alt text-error">
              Please select at least one available day
            </span>
          </label>
        )}
      </div>

      {/* Working Hours */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            <ClockIcon className="w-4 h-4 inline mr-2" />
            Preferred Working Hours *
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Time */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Time</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.availability.hours.start}
              onChange={(e) => handleTimeChange("start", e.target.value)}
            >
              <option value="">Select start time</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          {/* End Time */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Time</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.availability.hours.end}
              onChange={(e) => handleTimeChange("end", e.target.value)}
            >
              <option value="">Select end time</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(!formData.availability.hours.start ||
          !formData.availability.hours.end) && (
          <label className="label">
            <span className="label-text-alt text-error">
              Both start and end times are required
            </span>
          </label>
        )}
      </div>

      {/* Schedule Preview */}
      {formData.availability.days.length > 0 &&
        formData.availability.hours.start &&
        formData.availability.hours.end && (
          <div className="card bg-base-100 border border-gray-200">
            <div className="card-body">
              <h4 className="card-title text-lg">Schedule Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 " />
                  <span className="font-medium">Available Days:</span>
                  <span>{formData.availability.days.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 " />
                  <span className="font-medium">Working Hours:</span>
                  <span>
                    {formatTime(formData.availability.hours.start)} -{" "}
                    {formatTime(formData.availability.hours.end)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-3">
                  You&apos;ll be available for{" "}
                  {formData.availability.days.length} days per week, for
                  approximately{" "}
                  {Math.abs(
                    parseInt(formData.availability.hours.end.split(":")[0]) -
                      parseInt(formData.availability.hours.start.split(":")[0])
                  )}{" "}
                  hours per day.
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Hourly Rate Information */}
      <div className="card bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">₦</span>
            </div>
            <h4 className="card-title text-lg text-green-800">
              Hourly Rate Information
            </h4>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-gray-700 mb-3">
              Our tutoring hourly rate ranges from{" "}
              <span className="font-bold text-green-600">₦5,000 to ₦9,000</span>{" "}
              per hour, depending on:
            </p>

            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
              <li>Your experience level and qualifications</li>
              <li>Subject complexity and demand</li>
              <li>
                Student&apos;s academic level (primary, secondary, tertiary)
              </li>
              <li>Performance reviews and ratings</li>
            </ul>

            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-green-700">
                <strong>Note:</strong> Your specific rate will be determined
                during the interview process and can increase based on your
                performance and student feedback.
              </p>
            </div>
          </div>

          <div className="form-control mt-4">
            <label className="label cursor-pointer bg-white rounded-lg p-4 border border-green-200 hover:bg-green-50 transition-colors">
              <div className="flex-1">
                <span className="label-text font-medium text-gray-800">
                  I accept the hourly rate range of ₦5,000 - ₦9,000 per hour
                </span>
                <div className="text-xs text-gray-600 mt-1">
                  By checking this box, you acknowledge and accept our hourly
                  rate structure
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox checkbox-success"
                checked={formData.hourlyRateAccepted || false}
                onChange={(e) =>
                  updateFormData({
                    hourlyRateAccepted: e.target.checked,
                  })
                }
              />
            </label>
          </div>

          {formData.hourlyRateAccepted === false && (
            <div className="text-error text-sm mt-2">
              You must accept the hourly rate range to continue
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="alert alert-[#FFEACF]/200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">Flexibility Notice</h3>
          <div className="text-xs">
            You can always update your availability later. This helps us match
            you with families who need tutoring during your preferred times.
          </div>
        </div>
      </div>
    </div>
  );
}
