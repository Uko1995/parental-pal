"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { getWeekdayDatesInMonth } from "@/lib/booking-calendar";

interface DaySchedule {
  day: string;
  startTime: string;
  hours: number;
  dates?: Array<{
    date: string;
    startTime: string;
  }>;
}

interface WeekdaysScheduleProps {
  onHoursChange?: (totalHours: number) => void;
  onDaysChange?: (totalDays: number) => void;
  onMonthSelected?: (isMonthSelected: boolean) => void;
  onScheduleChange?: (schedules: DaySchedule[]) => void; // New prop to pass full schedule data
  childcare?: boolean;
  startDate?: string; // Optional start date for calculating dates
  weekendsOnly?: boolean; // New prop to restrict to weekends only
}

export interface WeekdaysScheduleRef {
  resetSchedule: () => void;
  loadSchedule: (schedules: DaySchedule[]) => void;
}

const WeekdaysSchedule = forwardRef<WeekdaysScheduleRef, WeekdaysScheduleProps>(
  (
    {
      onHoursChange,
      onDaysChange,
      onMonthSelected,
      onScheduleChange,
      childcare,
      startDate,
      weekendsOnly,
    },
    ref
  ) => {
    const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

    const resetSchedule = () => {
      setDaySchedules([]);
    };

    // Calculate dates when a day is selected or time is updated
    const updateDatesForSchedule = (schedule: DaySchedule): DaySchedule => {
      if (!childcare && startDate && schedule.startTime) {
        const dates = getWeekdayDatesInMonth(schedule.day, startDate);
        return {
          ...schedule,
          dates: dates.map((date) => ({
            date,
            startTime: schedule.startTime,
          })),
        };
      }
      return schedule;
    };

    const loadSchedule = (schedules: DaySchedule[]) => {
      setDaySchedules(
        schedules.map((schedule) => {
          if (schedule.dates?.length) return schedule;
          return updateDatesForSchedule(schedule);
        }),
      );
    };

    useImperativeHandle(ref, () => ({
      resetSchedule,
      loadSchedule,
    }));

    // Recompute tutoring session dates when the billing month changes
    useEffect(() => {
      if (childcare || !startDate) return;

      setDaySchedules((prev) => {
        if (!prev.length) return prev;
        const next = prev.map((schedule) => {
          if (schedule.day === "month" || !schedule.startTime) return schedule;
          return updateDatesForSchedule(schedule);
        });
        const changed = next.some(
          (schedule, index) =>
            JSON.stringify(schedule.dates) !== JSON.stringify(prev[index]?.dates),
        );
        return changed ? next : prev;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, childcare]);

    // Calculate total hours and notify parent
    // Now calculates based on actual dates if available (for tutoring)
    const calculateTotalHours = (schedules: DaySchedule[]) => {
      if (!childcare) {
        // For tutoring: count total dates * hours per session
        return schedules.reduce((total, schedule) => {
          const numDates = schedule.dates?.length || 0;
          return total + numDates * (schedule.hours || 0);
        }, 0);
      }
      // For childcare: original calculation
      return schedules.reduce(
        (total, schedule) => total + (schedule.hours || 0),
        0
      );
    };
    // Calculate total number of days selected
    const calculateTotalDays = (schedules: DaySchedule[]) => {
      return schedules.length;
    };

    // Use useEffect to call the callback after state updates
    useEffect(() => {
      if (onHoursChange) {
        const totalHours = calculateTotalHours(daySchedules);
        onHoursChange(totalHours);
      }
      if (onDaysChange) {
        const totalDays = calculateTotalDays(daySchedules);
        onDaysChange(totalDays);
      }
      if (onMonthSelected) {
        const isMonthSelected = daySchedules.some(
          (schedule) => schedule.day === "month"
        );
        onMonthSelected(isMonthSelected);
      }
      if (onScheduleChange) {
        onScheduleChange(daySchedules);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [daySchedules]);

    const weekdays = [
      { value: "monday", label: "Mondays" },
      { value: "tuesday", label: "Tuesdays" },
      { value: "wednesday", label: "Wednesdays" },
      { value: "thursday", label: "Thursdays" },
      { value: "friday", label: "Fridays" },
      { value: "saturday", label: "Saturdays" },
      { value: "sunday", label: "Sundays" },
    ];

    const toggleDay = (day: string) => {
      setDaySchedules((prev) => {
        const existingIndex = prev.findIndex(
          (schedule) => schedule.day === day
        );

        if (existingIndex >= 0) {
          // Remove the day if it's already selected
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          // If "month" is clicked, clear all other selections
          if (day === "month") {
            return [{ day: "month", startTime: "", hours: 1 }];
          }

          // If any weekday is clicked, remove "month" if it exists and add the new day
          const filteredSchedules = prev.filter(
            (schedule) => schedule.day !== "month"
          );
          const newSchedule = { day, startTime: "", hours: 1 };
          return [...filteredSchedules, updateDatesForSchedule(newSchedule)];
        }
      });
    };

    const updateStartTime = (day: string, startTime: string) => {
      setDaySchedules((prev) =>
        prev.map((schedule) => {
          if (schedule.day === day) {
            const updatedSchedule = { ...schedule, startTime };
            return updateDatesForSchedule(updatedSchedule);
          }
          return schedule;
        })
      );
    };

    const isSelected = (day: string) => {
      return daySchedules.some((schedule) => schedule.day === day);
    };

    const childcareDays = weekdays
      .slice(0, 6) //monday to saturday
      .concat([{ value: "month", label: "Month" }]);

    const weekendDays = weekdays.slice(5, 7); // Saturday and Sunday only

    const days = weekendsOnly
      ? weekendDays
      : childcare === true
      ? childcareDays
      : weekdays;

    return (
      <div className="space-y-4">
        {/* Weekdays Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Preferred Days *
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors duration-300 ${
                  isSelected(day.value)
                    ? "bg-gray-800 border-gray-800 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Selection - Only show when days are selected */}
        {!childcare && daySchedules.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Set Schedule for Each Day *
            </label>

            <div className="grid md:grid-cols-3 gap-3">
              {daySchedules.map((schedule) => (
                <div
                  key={schedule.day}
                  className="bg-gray-50 w-fit rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {schedule.day}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">
                        Start Time (e.g., 09:00 AM)
                      </label>
                      <input
                        type="text"
                        placeholder="09:00 AM"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateStartTime(schedule.day, e.target.value)
                        }
                        name={`${schedule.day}-startTime`}
                        title="Please enter time in format: HH:MM AM/PM (e.g., 09:00 AM)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-base text-gray-700 mb-1">
                        1 Hour
                      </label>

                      <input type="hidden" value={1} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <strong>Summary:</strong> {daySchedules.length} day(s) selected •{" "}
              {calculateTotalHours(daySchedules)} total session hours (this month)
              {daySchedules.length > 0 && (
                <div className="mt-1">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.day} className="capitalize">
                      • {schedule.day}
                      {"s"}: {schedule.startTime || "Time not set"} (
                      {schedule.dates?.length || 0} session
                      {schedule.dates?.length !== 1 ? "s" : ""} ×{" "}
                      {schedule.hours} {schedule.hours === 1 ? "hour" : "hours"}{" "}
                      = {(schedule.dates?.length || 0) * schedule.hours} hours )
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden input for form submission - always render when days are selected */}
        {daySchedules.length > 0 && (
          <input
            type="hidden"
            name="daySchedules"
            value={
              childcare
                ? daySchedules.some((ds) => ds.day === "month")
                  ? JSON.stringify([{ day: "month" }])
                  : JSON.stringify(
                      daySchedules
                        .filter((ds) => ds.day !== "month")
                        .map((ds) => ({ day: ds.day }))
                    )
                : JSON.stringify(daySchedules)
            }
          />
        )}
      </div>
    );
  }
);

WeekdaysSchedule.displayName = "WeekdaysSchedule";

export default WeekdaysSchedule;
