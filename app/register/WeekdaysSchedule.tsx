"use client";

import { useState, useEffect } from "react";

interface DaySchedule {
  day: string;
  startTime: string;
  hours: number;
}

interface WeekdaysScheduleProps {
  onHoursChange?: (totalHours: number) => void;
}

export default function WeekdaysSchedule({
  onHoursChange,
}: WeekdaysScheduleProps) {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  // Calculate total hours and notify parent
  const calculateTotalHours = (schedules: DaySchedule[]) => {
    return schedules.reduce(
      (total, schedule) => total + (schedule.hours || 0),
      0
    );
  };

  // Use useEffect to call the callback after state updates
  useEffect(() => {
    if (onHoursChange) {
      const totalHours = calculateTotalHours(daySchedules);
      onHoursChange(totalHours);
    }
  }, [daySchedules, onHoursChange]);

  const weekdays = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
  ];

  const toggleDay = (day: string) => {
    setDaySchedules((prev) => {
      const existingIndex = prev.findIndex((schedule) => schedule.day === day);

      if (existingIndex >= 0) {
        // Remove the day if it's already selected
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add the day with empty start time and 1 hour default
        return [...prev, { day, startTime: "", hours: 1 }];
      }
    });
  };

  const updateStartTime = (day: string, startTime: string) => {
    setDaySchedules((prev) =>
      prev.map((schedule) =>
        schedule.day === day ? { ...schedule, startTime } : schedule
      )
    );
  };

  const updateHours = (day: string, hours: number) => {
    setDaySchedules((prev) =>
      prev.map((schedule) =>
        schedule.day === day ? { ...schedule, hours } : schedule
      )
    );
  };

  const isSelected = (day: string) => {
    return daySchedules.some((schedule) => schedule.day === day);
  };

  return (
    <div className="space-y-4">
      {/* Weekdays Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Days *
        </label>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors duration-300 ${
                isSelected(day.value)
                  ? "bg-[#90AC19] border-[#90AC19] text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:border-[#90AC19] hover:text-[#90AC19]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Selection - Only show when days are selected */}
      {daySchedules.length > 0 && (
        <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Set Schedule for Each Day *
          </label>

          <div className="flex items-center justify-start gap-5">
            {daySchedules.map((schedule) => (
              <div
                key={schedule.day}
                className="bg-gray-50 w-fit rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {schedule.day}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {schedule.startTime || "No time"} • {schedule.hours}h
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      step="1800"
                      min="09:00"
                      max="18:00"
                      value={schedule.startTime}
                      onChange={(e) =>
                        updateStartTime(schedule.day, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Hours
                    </label>
                    <select
                      value={schedule.hours}
                      onChange={(e) =>
                        updateHours(schedule.day, parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                      required
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={5}>5 hours</option>
                      <option value={6}>6 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden input for form submission - single array */}
          <input
            type="hidden"
            name="daySchedules"
            value={JSON.stringify(daySchedules)}
          />

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Summary:</strong> {daySchedules.length} day(s) selected •{" "}
            {calculateTotalHours(daySchedules)} total hours
            {daySchedules.length > 0 && (
              <div className="mt-1">
                {daySchedules.map((schedule) => (
                  <div key={schedule.day} className="capitalize">
                    • {schedule.day}: {schedule.startTime || "Time not set"} (
                    {schedule.hours} {schedule.hours === 1 ? "hour" : "hours"})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
