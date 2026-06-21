import { v4 as uuidv4 } from "uuid";
import { BookingInterface } from "@/models/Booking";
import { isRebookEligibleBooking } from "@/lib/booking-rebook-eligibility";
import {
  addCalendarMonths,
  countChildcareMonthDays,
  getTargetMonthLabel,
  getTargetMonthStart,
  getWeekdayDatesInMonth,
  shiftDateRangeByMonths,
} from "@/lib/booking-calendar";

export { isRebookEligibleBooking };
export { getTargetMonthStart, getTargetMonthLabel };

export type RebookFormEntries = Record<string, string>;

export interface RebookTemplateResult {
  booking: Omit<
    BookingInterface,
    "_id" | "createdAt" | "updatedAt" | "payment" | "assignedAt" | "startedAt" | "completedAt" | "cancelledAt"
  >;
  formEntries: RebookFormEntries;
  childIds: string[];
  targetMonthStart: string;
  targetMonthLabel: string;
}

export function isRebookEligible(booking: BookingInterface): boolean {
  return isRebookEligibleBooking(booking);
}

function deepCloneBooking(booking: BookingInterface): BookingInterface {
  return JSON.parse(JSON.stringify(booking)) as BookingInterface;
}

function shiftScheduleWeekdays(
  weekdays: BookingInterface["schedule"]["weekdays"],
  targetMonthStart: string,
  childcare: boolean,
): BookingInterface["schedule"]["weekdays"] {
  if (!weekdays?.length) return weekdays;

  return weekdays.map((wd) => {
    if ((wd.day as string) === "month") {
      return { ...wd };
    }
    if (!childcare && wd.startTime) {
      const dates = getWeekdayDatesInMonth(wd.day, targetMonthStart);
      return {
        ...wd,
        dates: dates.map((date) => ({
          date,
          startTime: wd.startTime || wd.dates?.[0]?.startTime || "09:00",
          endTime: wd.endTime,
        })),
      };
    }
    return { ...wd };
  });
}

function shiftDatesForService(
  booking: BookingInterface,
  targetMonthStart: string,
): void {
  const serviceType = booking.serviceType;
  const sd = booking.serviceData || {};

  booking.schedule.startDate = targetMonthStart;
  if (booking.schedule.endDate) {
    booking.schedule.endDate = addCalendarMonths(booking.schedule.endDate, 1);
  }

  if (serviceType === "tutoring" || serviceType === "childcare") {
    booking.schedule.weekdays = shiftScheduleWeekdays(
      booking.schedule.weekdays,
      targetMonthStart,
      serviceType === "childcare",
    );
  }

  const childrenData = sd.childrenData as
    | Array<Record<string, unknown>>
    | undefined;

  if (childrenData?.length) {
    childrenData.forEach((childData) => {
      if (serviceType === "tutoring" && Array.isArray(childData.schedule)) {
        childData.schedule = (
          childData.schedule as Array<{
            day: string;
            hours: number;
            startTime?: string;
            dates?: Array<{ date: string; startTime: string }>;
          }>
        ).map((s) => {
          if (s.startTime) {
            const dates = getWeekdayDatesInMonth(s.day, targetMonthStart);
            const hours = s.hours || 1;
            return {
              ...s,
              dates: dates.map((date) => ({
                date,
                startTime: s.startTime || "09:00",
              })),
              hours,
            };
          }
          return s;
        });
        const totalHours = (
          childData.schedule as Array<{ dates?: unknown[]; hours: number }>
        ).reduce((sum, s) => {
          const numDates = s.dates?.length || 0;
          return sum + numDates * (s.hours || 0);
        }, 0);
        childData.totalHours = totalHours;
      }

      if (serviceType === "childcare") {
        if (childData.careType === "monthly" || childData.isMonthSelected) {
          childData.totalDays = countChildcareMonthDays(targetMonthStart);
        } else if (childData.careType === "daily") {
          const weekdays = booking.schedule.weekdays || [];
          childData.totalDays = weekdays.filter(
            (w) => (w.day as string) !== "month",
          ).length;
        }
      }

      if (serviceType === "holiday-camps" && Array.isArray(childData.campWeeks)) {
        childData.campWeeks = (
          childData.campWeeks as Array<{
            startDate: string;
            endDate: string;
            weekNumber: number;
          }>
        ).map((w) => ({
          ...w,
          ...shiftDateRangeByMonths(w.startDate, w.endDate, 1),
        }));
      }

      if (serviceType === "kiddies-enrichment" && childData.eventDate) {
        childData.eventDate = addCalendarMonths(
          childData.eventDate as string,
          1,
        );
      }
    });
  }

  if (serviceType === "space-rental") {
    if (sd.eventDate) {
      sd.eventDate = addCalendarMonths(sd.eventDate as string, 1);
    }
  }
}

function regenerateChildIds(booking: BookingInterface): string[] {
  const newIds: string[] = [];
  const oldIds: string[] = [];

  const childrenData = booking.serviceData?.childrenData as
    | Array<{ childId?: string }>
    | undefined;

  if (childrenData?.length) {
    childrenData.forEach((cd, i) => {
      const oldId = cd.childId || `legacy-${i}`;
      oldIds.push(oldId);
      const newId = uuidv4();
      newIds.push(newId);
      cd.childId = newId;
    });
  } else {
    booking.children.forEach(() => {
      newIds.push(uuidv4());
    });
    return newIds;
  }

  return newIds;
}

export function buildRebookTemplate(
  source: BookingInterface,
  now: Date = new Date(),
): RebookTemplateResult {
  const targetMonthStart = getTargetMonthStart(now);
  const booking = deepCloneBooking(source);

  delete booking._id;
  booking.status = "pending";
  booking.isRepeatedCustomer = true;
  booking.payment = { status: "pending", paidAmount: 0 };
  booking.pricing = {
    ...booking.pricing,
    totalAmount: 0,
    baseAmount: 0,
    discount: undefined,
  };

  shiftDatesForService(booking, targetMonthStart);
  const childIds = regenerateChildIds(booking);

  const formEntries = bookingToFormEntries(booking, childIds, targetMonthStart);

  return {
    booking: booking as RebookTemplateResult["booking"],
    formEntries,
    childIds,
    targetMonthStart,
    targetMonthLabel: getTargetMonthLabel(targetMonthStart),
  };
}

export function bookingToFormEntries(
  booking: BookingInterface,
  childIds: string[],
  targetMonthStart: string,
): RebookFormEntries {
  const entries: RebookFormEntries = {};
  const sd = booking.serviceData || {};

  entries.serviceType = booking.serviceType;
  entries.selectedService = booking.serviceType;
  entries.parentName = booking.parentName || "";
  entries.parentEmail = booking.parentEmail || "";
  entries.parentPhone = booking.parentPhone || "";
  entries.address = booking.parentAddress || "";
  entries.parentAddress = booking.parentAddress || "";
  entries.startDate = targetMonthStart;
  entries.childrenCount = String(booking.children.length);
  if (booking.schedule.billingPeriodMonths) {
    entries.billingPeriodMonths = String(booking.schedule.billingPeriodMonths);
  }
  entries.priority = booking.priority || "normal";
  entries.isRepeatedCustomer = "true";
  entries.followUpRequired = booking.followUpRequired ? "true" : "false";

  if (booking.source) {
    entries.source = booking.source;
    entries.selectedHearAboutUs = booking.source;
  }
  if (booking.referralSource) entries.otherHearAboutUsText = booking.referralSource;
  if (booking.socialMediaPlatform) {
    entries.socialMediaPlatform = booking.socialMediaPlatform;
  }
  if (booking.referralName) entries.referralName = booking.referralName;

  booking.children.forEach((child, i) => {
    const childId = childIds[i] || uuidv4();
    entries[`childName_${childId}`] = child.name;
    entries[`childAge_${childId}`] = String(child.age);
    if (child.class) entries[`childClass_${childId}`] = child.class;
    if (child.schoolName) entries[`childSchool_${childId}`] = child.schoolName;
  });

  const childrenData = sd.childrenData as Array<Record<string, unknown>> | undefined;

  if (booking.serviceType === "tutoring") {
    entries.tutoringLocation = (sd.tutoringLocation as string) || "physical";
    entries.hourlyRate = String(sd.hourlyRate || 12000);
    entries.virtualRate = String(sd.virtualRate || 13000);
    entries.physicalRate = String(sd.physicalRate || 12000);

    childrenData?.forEach((cd, i) => {
      const childId = childIds[i];
      if (!childId) return;
      if (cd.subjects) {
        entries[`subjects_${childId}`] = JSON.stringify(cd.subjects);
      }
      if (cd.academicLevel) {
        entries[`academicLevel_${childId}`] = cd.academicLevel as string;
      }
      if (cd.learningGoals) {
        entries[`learningGoals_${childId}`] = cd.learningGoals as string;
      }
      entries[`totalHours_${childId}`] = String(cd.totalHours || 0);
      if (cd.schedule) {
        entries[`schedule_${childId}`] = JSON.stringify(cd.schedule);
      }
    });
  }

  if (booking.serviceType === "childcare") {
    entries.dailyRate = String(sd.dailyRate || 5000);
    entries.monthlyRate = String(sd.monthlyRate || 127500);
    if (sd.dropoffTime) entries.dropoffTime = sd.dropoffTime as string;
    if (sd.pickupTime) entries.pickupTime = sd.pickupTime as string;

    childrenData?.forEach((cd, i) => {
      const childId = childIds[i];
      if (!childId) return;
      if (cd.careType) entries[`careType_${childId}`] = cd.careType as string;
      entries[`totalDays_${childId}`] = String(cd.totalDays || 0);
      if (cd.dropoffTime) entries[`dropoffTime_${childId}`] = cd.dropoffTime as string;
      if (cd.pickupTime) entries[`pickupTime_${childId}`] = cd.pickupTime as string;
      if (cd.specialNeeds) {
        entries[`specialNeeds_${childId}`] = cd.specialNeeds as string;
      }
    });

    if (booking.schedule.weekdays?.length) {
      entries.daySchedules = JSON.stringify(
        booking.schedule.weekdays.map((w) => ({
          day: w.day,
          hours: w.hours,
          startTime: w.startTime,
          dates: w.dates,
        })),
      );
    }
  }

  if (booking.serviceType === "holiday-camps") {
    const campPricing = sd as { weeklyRate?: number; campFee?: number };
    entries.weeklyRate = String(
      campPricing.weeklyRate || campPricing.campFee || 30000,
    );
    entries.campFee = String(
      campPricing.campFee || campPricing.weeklyRate || 30000,
    );
    childrenData?.forEach((cd, i) => {
      const childId = childIds[i];
      if (!childId || !cd.campWeeks) return;
      entries[`campWeeks_${childId}`] = JSON.stringify(cd.campWeeks);
    });
  }

  if (booking.serviceType === "homeschooling") {
    entries.termRate = String(
      (sd as { termRate?: number }).termRate || 150000,
    );
    childrenData?.forEach((cd, i) => {
      const childId = childIds[i];
      if (!childId) return;
      if (cd.selectedSubjects) {
        entries[`subjects_${childId}`] = JSON.stringify(cd.selectedSubjects);
      }
      if (cd.gradeLevel) entries[`gradeLevel_${childId}`] = cd.gradeLevel as string;
      if (cd.curriculum) entries[`curriculum_${childId}`] = cd.curriculum as string;
      if (cd.learningStyle) {
        entries[`learningStyle_${childId}`] = cd.learningStyle as string;
      }
      if (cd.specialNeeds) {
        entries[`specialNeeds_${childId}`] = cd.specialNeeds as string;
      }
      if (cd.educationalGoals) {
        entries[`educationalGoals_${childId}`] = cd.educationalGoals as string;
      }
      if (cd.selectedTerms && Array.isArray(cd.selectedTerms)) {
        entries[`selectedTerms_${childId}`] = JSON.stringify(cd.selectedTerms);
        if ((cd.selectedTerms as string[])[0]) {
          entries[`schoolTerm_${childId}`] = (cd.selectedTerms as string[])[0];
        }
      } else if (cd.selectedTerm) {
        entries[`schoolTerm_${childId}`] = cd.selectedTerm as string;
        entries[`selectedTerms_${childId}`] = JSON.stringify([cd.selectedTerm]);
      }
    });
  }

  if (booking.serviceType === "kiddies-enrichment") {
    entries.hourlyRate = String(sd.hourlyRate || 8000);
    childrenData?.forEach((cd, i) => {
      const childId = childIds[i];
      if (!childId) return;
      if (cd.selectedPrograms) {
        entries[`selectedPrograms_${childId}`] = JSON.stringify(
          cd.selectedPrograms,
        );
      }
      if (cd.interests) entries[`interests_${childId}`] = cd.interests as string;
      if (cd.parentGoals) {
        entries[`parentGoals_${childId}`] = cd.parentGoals as string;
      }
      entries[`hours_${childId}`] = String(cd.hours || 0);
      if (cd.eventDate) entries[`eventDate_${childId}`] = cd.eventDate as string;
      if (cd.startTime) entries[`startTime_${childId}`] = cd.startTime as string;
    });
  }

  if (booking.serviceType === "space-rental") {
    if (sd.eventType) entries.eventType = sd.eventType as string;
    if (sd.eventDate) entries.eventDate = sd.eventDate as string;
    if (sd.eventTime) entries.eventTime = sd.eventTime as string;
    if (sd.venueType) entries.venueType = sd.venueType as string;
    if (sd.expectedGuests) {
      entries.expectedGuests = String(sd.expectedGuests);
    }
    if (sd.extraServices) {
      entries.extraServices = JSON.stringify(sd.extraServices);
    }
  }

  return entries;
}
