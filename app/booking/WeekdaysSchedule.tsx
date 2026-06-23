"use client";

import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import {
  formatLocalDate,
  getWeekdayDatesInMonth,
  parseDateString,
} from "@/lib/booking-calendar";
import {
  getBillingPeriodEnd,
  getWeekdayDatesInRange,
} from "@/lib/booking-proration";
import BillingPeriodMonthsField from "./BillingPeriodMonthsField";

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
  onScheduleChange?: (schedules: DaySchedule[]) => void;
  childcare?: boolean;
  startDate?: string;
  onStartDateChange?: (date: string) => void;
  showStartDate?: boolean;
  startDateInputName?: string;
  minStartDate?: string;
  initialSchedules?: DaySchedule[];
  billingPeriodMonths?: number;
  showBillingPeriodMonths?: boolean;
  onBillingPeriodMonthsChange?: (months: number) => void;
  weekendsOnly?: boolean;
}

export interface WeekdaysScheduleRef {
  resetSchedule: () => void;
  loadSchedule: (schedules: DaySchedule[]) => void;
}

function formatSessionDateLabel(dateStr: string): string {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function weekdayLabel(day: string): string {
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}s`;
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
      onStartDateChange,
      showStartDate,
      startDateInputName = "startDate",
      minStartDate,
      initialSchedules,
      billingPeriodMonths = 1,
      showBillingPeriodMonths,
      onBillingPeriodMonthsChange,
      weekendsOnly,
    },
    ref,
  ) => {
    const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
    const initialSchedulesAppliedRef = useRef<string>("");

    const resetSchedule = () => {
      setDaySchedules([]);
      initialSchedulesAppliedRef.current = "";
    };

    const updateDatesForSchedule = (schedule: DaySchedule): DaySchedule => {
      if (!childcare && startDate && schedule.startTime) {
        const dates =
          billingPeriodMonths > 1
            ? getWeekdayDatesInRange(
                schedule.day,
                startDate,
                getBillingPeriodEnd(startDate, billingPeriodMonths),
              )
            : getWeekdayDatesInMonth(schedule.day, startDate);
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

    useEffect(() => {
      if (!initialSchedules?.length) return;
      const key = JSON.stringify(initialSchedules);
      if (initialSchedulesAppliedRef.current === key) return;
      initialSchedulesAppliedRef.current = key;
      loadSchedule(initialSchedules);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSchedules, startDate, billingPeriodMonths]);

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
    }, [startDate, childcare, billingPeriodMonths]);

    const calculateTotalHours = (schedules: DaySchedule[]) => {
      if (!childcare) {
        return schedules.reduce((total, schedule) => {
          const numDates = schedule.dates?.length || 0;
          return total + numDates * (schedule.hours || 0);
        }, 0);
      }
      return schedules.reduce(
        (total, schedule) => total + (schedule.hours || 0),
        0,
      );
    };

    const calculateTotalDays = (schedules: DaySchedule[]) => {
      return schedules.length;
    };

    useEffect(() => {
      if (onHoursChange) {
        onHoursChange(calculateTotalHours(daySchedules));
      }
      if (onDaysChange) {
        onDaysChange(calculateTotalDays(daySchedules));
      }
      if (onMonthSelected) {
        onMonthSelected(
          daySchedules.some((schedule) => schedule.day === "month"),
        );
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
          (schedule) => schedule.day === day,
        );

        if (existingIndex >= 0) {
          return prev.filter((_, index) => index !== existingIndex);
        }

        if (day === "month") {
          return [{ day: "month", startTime: "", hours: 1 }];
        }

        const filteredSchedules = prev.filter(
          (schedule) => schedule.day !== "month",
        );
        const newSchedule = { day, startTime: "", hours: 1 };
        return [...filteredSchedules, updateDatesForSchedule(newSchedule)];
      });
    };

    const updateStartTime = (day: string, startTime: string) => {
      setDaySchedules((prev) =>
        prev.map((schedule) => {
          if (schedule.day === day) {
            return updateDatesForSchedule({ ...schedule, startTime });
          }
          return schedule;
        }),
      );
    };

    const isSelected = (day: string) => {
      return daySchedules.some((schedule) => schedule.day === day);
    };

    const childcareDays = weekdays
      .slice(0, 6)
      .concat([{ value: "month", label: "Month" }]);

    const weekendDays = weekdays.slice(5, 7);

    const days = weekendsOnly
      ? weekendDays
      : childcare === true
        ? childcareDays
        : weekdays;

    const periodEndLabel =
      !childcare && startDate && billingPeriodMonths > 1
        ? getBillingPeriodEnd(startDate, billingPeriodMonths)
        : null;

    return (
      <div className="space-y-4">
        {showStartDate && onStartDateChange && (
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
              name={startDateInputName}
              value={startDate || ""}
              onChange={(e) => onStartDateChange(e.target.value)}
              min={minStartDate || formatLocalDate(new Date())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              required
            />
          </div>
        )}

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

            <div className="text-sm bg-base-200 text-base-content p-3 rounded-lg border border-base-300">
              <p className="font-semibold text-base-content">
                Summary: {daySchedules.length} day(s) selected •{" "}
                {calculateTotalHours(daySchedules)} total session hours
                {periodEndLabel
                  ? ` (${billingPeriodMonths}-month period through ${formatSessionDateLabel(periodEndLabel)})`
                  : " (this month)"}
              </p>
              {daySchedules.length > 0 && (
                <ul className="mt-3 space-y-3 text-base-content/90">
                  {daySchedules.map((schedule) => (
                    <li key={schedule.day}>
                      <p className="font-medium capitalize">
                        {weekdayLabel(schedule.day)} —{" "}
                        {schedule.startTime || "Time not set"}
                      </p>
                      {schedule.dates && schedule.dates.length > 0 ? (
                        <ul className="mt-1 ml-4 space-y-0.5 text-sm">
                          {schedule.dates.map((session) => (
                            <li key={`${schedule.day}-${session.date}`}>
                              • {formatSessionDateLabel(session.date)} at{" "}
                              {session.startTime || schedule.startTime || "Time not set"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="ml-4 text-xs text-base-content/70 mt-1">
                          Set a start time to see session dates.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {showBillingPeriodMonths && onBillingPeriodMonthsChange && (
              <BillingPeriodMonthsField
                value={billingPeriodMonths}
                onChange={onBillingPeriodMonthsChange}
                className="mt-4"
              />
            )}
          </div>
        )}

        {childcare &&
          showBillingPeriodMonths &&
          onBillingPeriodMonthsChange &&
          daySchedules.length > 0 && (
            <BillingPeriodMonthsField
              value={billingPeriodMonths}
              onChange={onBillingPeriodMonthsChange}
            />
          )}

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
                        .map((ds) => ({ day: ds.day })),
                    )
                : JSON.stringify(daySchedules)
            }
          />
        )}
      </div>
    );
  },
);

WeekdaysSchedule.displayName = "WeekdaysSchedule";

export default WeekdaysSchedule;
