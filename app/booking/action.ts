"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { ObjectId } from "mongodb";
import { BookingInterface } from "@/models/Booking";
import { getDb } from "@/lib/mongodb";
import { EDUVANTA_SERVICE_NAME } from "@/lib/service-utils";
import {
  type CampLocation,
  resolveCampSeasonId,
} from "@/lib/camp-seasons";
import { calculateCampPricing } from "@/lib/camp-pricing";
import { isHolidayCampServiceActive } from "@/app/services/actions";
import {
  countChildcareMonthDays,
  getWeekdayDatesInMonth,
} from "@/lib/booking-calendar";
import {
  getCampScheduleBounds,
  resolveBookingScheduleDates,
} from "@/lib/booking-schedule";

const EDUVANTA_PROMO_CODE = "ONBOARD";
const EDUVANTA_PROMO_VIRTUAL_RATE = 11000;

function isServerDateInJune(now: Date): boolean {
  return now.getMonth() === 5;
}

async function getTutoringRatesFromService() {
  const db = await getDb();
  const servicesCollection = db.collection("services");

  const eduVantaService = await servicesCollection.findOne(
    {
      type: "tutoring",
      name: { $regex: `^${EDUVANTA_SERVICE_NAME}$`, $options: "i" },
      status: "active",
    },
    {
      projection: {
        name: 1,
        pricing: 1,
      },
    },
  );

  const fallbackTutoringService = eduVantaService
    ? null
    : await servicesCollection.findOne(
        { type: "tutoring", status: "active" },
        {
          projection: {
            name: 1,
            pricing: 1,
          },
        },
      );

  const resolvedService = eduVantaService || fallbackTutoringService;
  const virtualRate =
    resolvedService?.pricing?.locationRates?.virtual ||
    parseInt(String(resolvedService?.pricing?.baseRate || "")) ||
    13000;
  const physicalRate =
    resolvedService?.pricing?.locationRates?.physical ||
    parseInt(String(resolvedService?.pricing?.baseRate || "")) ||
    12000;

  return {
    virtualRate,
    physicalRate,
    isEduvantaService: Boolean(eduVantaService),
  };
}

export async function registerChild(formData: FormData) {
  // Check authentication status
  const session = await auth();

  if (!session?.user) {
    // User is not authenticated, redirect to signin with callback URL
    redirect("/auth/signin?callbackUrl=/booking&action=submit");
  }

  // Clean up Next.js internal form data
  const cleanedData = Object.fromEntries(formData.entries());
  Object.keys(cleanedData).forEach((key) => {
    if (key.startsWith("$ACTION_ID")) {
      delete cleanedData[key];
    }
  });

  // Get or create user in database
  let user = await UserRepository.findByEmail(session.user.email!);
  const bookingPhone = (cleanedData.parentPhone as string) || "";
  const bookingAddress =
    ((cleanedData.parentAddress || cleanedData.address) as string) || "";

  if (!user) {
    user = await UserRepository.createUser({
      userData: {
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 1 year
        user: {
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || "",
        },
      },
      phone: bookingPhone,
      address: bookingAddress,
      role: "parent",
      isActive: true,
      membershipType: "basic",
    });
  } else {
    // Update user's phone and address if provided in booking
    const updateData: { phone?: string; address?: string } = {};

    if (bookingPhone && bookingPhone !== user.phone) {
      updateData.phone = bookingPhone;
    }

    if (bookingAddress && bookingAddress !== user.address) {
      updateData.address = bookingAddress;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await UserRepository.updateUser(user._id!.toString(), updateData);
      // Update local user object
      user = { ...user, ...updateData };
    }
  }

  // Convert form data to string entries
  const formEntries: FormDataEntries = {};
  Object.entries(cleanedData).forEach(([key, value]) => {
    formEntries[key] = typeof value === "string" ? value : String(value);
  });

  return createBookingFromFormEntries(formEntries, user, session.user);
}

export type BookingFormEntries = FormDataEntries;

const HOLIDAY_CAMP_UNAVAILABLE_MESSAGE =
  "Holiday camp registrations are not currently open.";

async function assertHolidayCampBookingAllowed(
  serviceType: string | undefined,
): Promise<void> {
  if (serviceType !== "holiday-camps") {
    return;
  }

  const isActive = await isHolidayCampServiceActive();
  if (!isActive) {
    throw new Error(HOLIDAY_CAMP_UNAVAILABLE_MESSAGE);
  }
}

export async function previewBookingPrice(
  formEntries: BookingFormEntries,
): Promise<{ totalAmount: number; currency: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const serviceType = formEntries.selectedService || formEntries.serviceType;
  await assertHolidayCampBookingAllowed(serviceType);

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user) {
    throw new Error("User not found");
  }

  const bookingData = await parseFormDataToBooking(
    formEntries,
    user._id!,
    session.user,
  );

  return {
    totalAmount: bookingData.pricing?.totalAmount || 0,
    currency: bookingData.pricing?.currency || "NGN",
  };
}

export async function createBookingFromFormEntries(
  formEntries: BookingFormEntries,
  user: NonNullable<Awaited<ReturnType<typeof UserRepository.findByEmail>>>,
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  },
) {
  const serviceType = formEntries.selectedService || formEntries.serviceType;
  await assertHolidayCampBookingAllowed(serviceType);

  const bookingData = await parseFormDataToBooking(
    formEntries,
    user._id!,
    sessionUser,
  );

  if (!bookingData.parentName) {
    throw new Error(
      "Parent name is missing. Session name: " +
        sessionUser.name +
        ", Form parentName: " +
        formEntries.parentName,
    );
  }
  if (!bookingData.parentEmail) {
    throw new Error(
      "Parent email is missing. Session email: " +
        sessionUser.email +
        ", Form parentEmail: " +
        formEntries.parentEmail,
    );
  }
  if (!bookingData.serviceType) {
    throw new Error(
      "Service type is missing. Form selectedService: " +
        formEntries.selectedService +
        ", Form serviceType: " +
        formEntries.serviceType,
    );
  }

  const savedBooking = await BookingRepository.createBooking(bookingData);

  try {
    await syncChildrenFromBooking(user._id!, bookingData);
  } catch (error) {
    console.error("Failed to sync children to user profile:", error);
  }

  fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "booking-confirmation",
      to: user.userData.user.email,
      userName: user.userData.user.name || "Parent",
      apiKey: process.env.EMAIL_API_KEY,
      data: {
        _id: savedBooking._id?.toString(),
        serviceType: savedBooking.serviceType,
        schedule: savedBooking.schedule,
        children: savedBooking.children,
        status: savedBooking.status,
        pricing: savedBooking.pricing,
      },
    }),
  }).catch((error) => {
    console.error("Background email send failed:", error);
  });

  revalidatePath("/booking");

  // Optional: Also save to Google Sheets for backup
  // console.log("Google Script URL:", process.env.GOOGLE_SCRIPT_URL);

  // Send to Google Apps Script endpoint
  // const res = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
  //   method: "POST",
  //   body: JSON.stringify(cleanedData),
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

  // const responseText = await res.text();
  // console.log("Google Sheets API Response Status:", res.status);
  // console.log("Google Sheets API Response:", responseText);

  // if (!res.ok) {
  //   console.error("Google Sheets submission failed:", {
  //     status: res.status,
  //     statusText: res.statusText,
  //     response: responseText.substring(0, 500), // Truncate long HTML responses
  //   });

  //   // Provide specific error messages based on status code
  //   if (res.status === 401) {
  //     console.error(
  //       "GOOGLE SHEETS SETUP ISSUE: The script is not authorized or URL is incorrect."
  //     );
  //     console.error("Please check:");
  //     console.error("1. Your Google Apps Script URL is correct");
  //     console.error("2. The script is published as 'Execute as: Me'");
  //     console.error(
  //       "3. The script has 'Who has access: Anyone' for web app deployment"
  //     );
  //     console.error("4. Current URL:", process.env.GOOGLE_SCRIPT_URL);
  //   } else if (res.status === 403) {
  //     console.error("GOOGLE SHEETS PERMISSION ISSUE: Script access denied");
  //   } else if (res.status === 404) {
  //     console.error("GOOGLE SHEETS URL ISSUE: Script not found at URL");
  //   }

  //   // Don't fail the entire registration, just log the error
  //   console.warn("Continuing with registration despite Google Sheets error");
  // } else {
  //   console.log("✅ Successfully submitted to Google Sheets");
  // }

  revalidatePath("/register");
  console.log("✅ Registration completed successfully");

  // Return booking data for payment integration
  return {
    success: true,
    bookingId: savedBooking._id?.toString(),
    userId: user._id?.toString(),
    amount: savedBooking.pricing?.totalAmount || 0,
    currency: savedBooking.pricing?.currency || "NGN",
    email: user.userData.user.email || undefined,
  };
}

// Type for form data
type FormDataEntries = Record<string, string>;

// Helper function to sync children from booking to user profile
async function syncChildrenFromBooking(
  userId: ObjectId,
  bookingData: BookingInterface,
): Promise<void> {
  // Get the user to check existing children
  const user = await UserRepository.findById(userId);
  if (!user) return;

  const existingChildren = user.children || [];
  const newChildren = bookingData.children || [];

  // For each child in the booking, check if they already exist in user profile
  for (const newChild of newChildren) {
    const exists = existingChildren.some(
      (existingChild) =>
        existingChild.name.toLowerCase() === newChild.name.toLowerCase() &&
        existingChild.age === newChild.age,
    );

    if (!exists) {
      // Add this child to the user profile
      await UserRepository.addChildToParent(userId, {
        name: newChild.name,
        age: newChild.age,
        gender: "male", // Default, can be updated later by parent
        class: newChild.class,
        schoolName: newChild.schoolName,
        subjects: [],
      });
    }
  }
}

// Helper function to parse form data into BookingInterface format
export async function parseFormDataToBooking(
  cleanedData: FormDataEntries,
  userId: ObjectId,
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  },
): Promise<BookingInterface> {
  // Parse children data - NEW per-child architecture
  const children: Array<{
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
  }> = [];

  // Extract all unique child IDs from form fields
  const childIds = new Set<string>();
  Object.keys(cleanedData).forEach((key) => {
    // Match fields like childName_uuid, childAge_uuid, etc.
    const match = key.match(/^child\w+_([a-f0-9-]+)$/);
    if (match) {
      childIds.add(match[1]);
    }
  });

  // Parse each child's basic information
  Array.from(childIds).forEach((childId) => {
    const name = cleanedData[`childName_${childId}`];
    const age = parseInt(cleanedData[`childAge_${childId}`]) || 0;

    if (name) {
      children.push({
        name,
        age,
        class: cleanedData[`childClass_${childId}`] || undefined,
        schoolName: cleanedData[`childSchool_${childId}`] || undefined,
      });
    }
  });

  // Fallback to old format if no children found with new format
  if (children.length === 0) {
    // Try the old format (child-0-name, etc.)
    let childIndex = 0;
    while (cleanedData[`child-${childIndex}-name`]) {
      children.push({
        name: cleanedData[`child-${childIndex}-name`],
        age: parseInt(cleanedData[`child-${childIndex}-age`]) || 0,
        class: cleanedData[`child-${childIndex}-class`] || undefined,
        schoolName: cleanedData[`child-${childIndex}-schoolName`] || undefined,
      });
      childIndex++;
    }

    // If still no children found, try the alternative format (childName1, etc.)
    if (children.length === 0) {
      let altChildIndex = 1;
      while (cleanedData[`childName${altChildIndex}`]) {
        children.push({
          name: cleanedData[`childName${altChildIndex}`],
          age: parseInt(cleanedData[`childAge${altChildIndex}`]) || 0,
          class: cleanedData[`childClass${altChildIndex}`] || undefined,
          schoolName: cleanedData[`childSchool${altChildIndex}`] || undefined,
        });
        altChildIndex++;
      }
    }
  }

  // Parse schedule data - handle both formats
  const weekdays: Array<{
    day: string;
    hours: number;
    startTime?: string;
    endTime?: string;
    dates?: Array<{
      date: string;
      startTime: string;
      endTime?: string;
    }>;
  }> = [];

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // First try the expected format (monday-selected, etc.)
  days.forEach((day) => {
    if (cleanedData[`${day}-selected`] === "true") {
      weekdays.push({
        day,
        hours: parseFloat(cleanedData[`${day}-hours`]) || 1,
        startTime: cleanedData[`${day}-startTime`] || undefined,
        endTime: cleanedData[`${day}-endTime`] || undefined,
      });
    }
  });

  // If no schedule found, try parsing daySchedules JSON
  if (weekdays.length === 0 && cleanedData.daySchedules) {
    try {
      const daySchedules = JSON.parse(cleanedData.daySchedules);
      if (Array.isArray(daySchedules)) {
        daySchedules.forEach(
          (schedule: {
            day: string;
            hours?: number;
            startTime?: string;
            dates?: Array<{ date: string; startTime: string }>;
          }) => {
            if (schedule.day) {
              weekdays.push({
                day: schedule.day,
                hours: schedule.hours || 8, // Default 8 hours for childcare
                startTime:
                  schedule.startTime || cleanedData.dropoffTime || undefined,
                endTime: cleanedData.pickupTime || undefined,
                dates: schedule.dates || undefined,
              });
            }
          },
        );
      }
    } catch (error) {
      console.warn("Failed to parse daySchedules JSON:", error);
    }
  }

  // Parse service-specific data based on service type
  const serviceType = cleanedData.selectedService || cleanedData.serviceType;

  // Validate that a service type was selected
  if (!serviceType) {
    throw new Error(
      "No service type selected in form data. Available fields: " +
        Object.keys(cleanedData).join(", "),
    );
  }

  // Validate that it's a valid service type
  const validServiceTypes = [
    "tutoring",
    "childcare",
    "holiday-camps",
    "space-rental",
    "homeschooling",
    "kiddies-enrichment",
  ];
  if (!validServiceTypes.includes(serviceType)) {
    throw new Error(
      `Invalid service type: ${serviceType}. Must be one of: ${validServiceTypes.join(
        ", ",
      )}`,
    );
  }

  const serviceData: Record<string, string | number | boolean | object> = {};

  if (serviceType === "tutoring") {
    // NEW: Parse per-child tutoring data with individual schedules
    const childrenTutoringData: Array<{
      childId: string;
      subjects: string[];
      academicLevel: string;
      learningGoals: string;
      totalHours: number;
      schedule?: Array<{
        day: string;
        hours: number;
        startTime?: string;
        dates?: Array<{ date: string; startTime: string }>;
      }>;
    }> = [];

    Array.from(childIds).forEach((childId) => {
      const subjects = cleanedData[`subjects_${childId}`];
      const academicLevel = cleanedData[`academicLevel_${childId}`];
      const learningGoals = cleanedData[`learningGoals_${childId}`];
      const totalHours = parseFloat(cleanedData[`totalHours_${childId}`]) || 0;
      const scheduleJson = cleanedData[`schedule_${childId}`];

      if (subjects && academicLevel) {
        const childData: {
          childId: string;
          subjects: string[];
          academicLevel: string;
          learningGoals: string;
          totalHours: number;
          schedule?: Array<{
            day: string;
            hours: number;
            startTime?: string;
            dates?: Array<{ date: string; startTime: string }>;
          }>;
        } = {
          childId,
          subjects: JSON.parse(subjects),
          academicLevel,
          learningGoals: learningGoals || "",
          totalHours,
        };

        // Parse schedule if available
        if (scheduleJson) {
          try {
            childData.schedule = JSON.parse(scheduleJson);
          } catch (error) {
            console.warn(
              `Failed to parse schedule for child ${childId}:`,
              error,
            );
          }
        }

        const bookingStartDate = (cleanedData.startDate as string) || "";
        if (childData.schedule?.length && bookingStartDate) {
          childData.schedule = childData.schedule.map((block) => {
            if (block.startTime && block.day !== "month") {
              const dates = getWeekdayDatesInMonth(block.day, bookingStartDate);
              return {
                ...block,
                dates: dates.map((date) => ({
                  date,
                  startTime: block.startTime || "09:00",
                })),
              };
            }
            return block;
          });
          const recomputedHours = childData.schedule.reduce(
            (sum, block) =>
              sum + (block.dates?.length || 0) * (block.hours || 1),
            0,
          );
          if (recomputedHours > 0) {
            childData.totalHours = recomputedHours;
          }
        }

        childrenTutoringData.push(childData);
      }
    });

    serviceData.childrenData = childrenTutoringData;
    serviceData.hourlyRate = parseInt(cleanedData.hourlyRate) || 12000;
    serviceData.tutoringLocation =
      (cleanedData.tutoringLocation as "virtual" | "physical") || "physical";
    serviceData.virtualRate = parseInt(cleanedData.virtualRate) || 13000;
    serviceData.physicalRate = parseInt(cleanedData.physicalRate) || 12000;
    serviceData.promoCode = (cleanedData.promoCode || "").toString().trim();
  } else if (serviceType === "childcare") {
    // NEW: Parse per-child childcare data
    const childrenCareData: Array<{
      childId: string;
      careType: string;
      totalDays: number;
      isMonthSelected: boolean;
      dropoffTime: string;
      pickupTime: string;
      specialNeeds: string;
    }> = [];

    Array.from(childIds).forEach((childId) => {
      const careType = cleanedData[`careType_${childId}`];
      let totalDays = parseFloat(cleanedData[`totalDays_${childId}`]) || 0;
      const dropoffTime = cleanedData[`dropoffTime_${childId}`];
      const pickupTime = cleanedData[`pickupTime_${childId}`];

      if (careType) {
        const isMonthly =
          careType === "monthly" ||
          cleanedData[`isMonthSelected_${childId}`] === "true";
        if (isMonthly && cleanedData.startDate) {
          totalDays = countChildcareMonthDays(cleanedData.startDate as string);
        }

        childrenCareData.push({
          childId,
          careType,
          totalDays,
          isMonthSelected: isMonthly,
          dropoffTime: dropoffTime || "",
          pickupTime: pickupTime || "",
          specialNeeds: cleanedData[`specialNeeds_${childId}`] || "",
        });
      }
    });

    serviceData.childrenData = childrenCareData;
    serviceData.dailyRate = parseInt(cleanedData.dailyRate) || 5000;
    serviceData.monthlyRate = parseInt(cleanedData.monthlyRate) || 127500;
  } else if (serviceType === "holiday-camps") {
    const campSeasonId = resolveCampSeasonId(
      (cleanedData.campSeasonId as string) || null,
    );
    const campLocation = cleanedData.campLocation as CampLocation | undefined;

    const childrenCampData: Array<{
      childId: string;
      boarding?: boolean;
      campWeeks: Array<{
        startDate: string;
        endDate: string;
        weekNumber: number;
      }>;
    }> = [];

    const campStartDate =
      (cleanedData.campStartDate as string) || "2026-04-07";
    const campEndDate = (cleanedData.campEndDate as string) || "2026-04-25";

    Array.from(childIds).forEach((childId) => {
      const campWeeksRaw = cleanedData[`campWeeks_${childId}`];
      let parsedCampWeeks;

      if (campWeeksRaw) {
        try {
          parsedCampWeeks = JSON.parse(campWeeksRaw);
        } catch (error) {
          console.warn(
            `Failed to parse campWeeks for child ${childId}:`,
            error,
          );
        }
      }

      childrenCampData.push({
        childId,
        boarding: cleanedData[`boarding_${childId}`] === "true",
        campWeeks:
          parsedCampWeeks && parsedCampWeeks.length > 0
            ? parsedCampWeeks
            : [
                {
                  startDate: campStartDate,
                  endDate: campEndDate,
                  weekNumber: 1,
                },
              ],
      });
    });

    serviceData.campSeasonId = campSeasonId;
    if (campLocation) {
      serviceData.campLocation = campLocation;
    }
    serviceData.childrenData = childrenCampData;
    serviceData.totalWeeks = childrenCampData.reduce(
      (sum, child) => sum + child.campWeeks.length,
      0,
    );
    serviceData.promoCode = (cleanedData.promoCode || "").toString();
    serviceData.promoDiscount =
      parseInt(cleanedData.promoDiscount as string) || 0;
  } else if (serviceType === "homeschooling") {
    // NEW: Parse per-child homeschooling data
    const childrenHomeschoolData: Array<{
      childId: string;
      selectedSubjects: string[];
      gradeLevel: string;
      curriculum: string;
      learningStyle: string;
      specialNeeds: string;
      educationalGoals: string;
      selectedTerm: string;
    }> = [];

    Array.from(childIds).forEach((childId) => {
      const subjects = cleanedData[`subjects_${childId}`];
      const gradeLevel = cleanedData[`gradeLevel_${childId}`];
      const curriculum = cleanedData[`curriculum_${childId}`];

      if (subjects && gradeLevel) {
        childrenHomeschoolData.push({
          childId,
          selectedSubjects: JSON.parse(subjects),
          gradeLevel,
          curriculum: curriculum || "",
          learningStyle: cleanedData[`learningStyle_${childId}`] || "",
          specialNeeds: cleanedData[`specialNeeds_${childId}`] || "",
          educationalGoals: cleanedData[`educationalGoals_${childId}`] || "",
          selectedTerm: cleanedData[`schoolTerm_${childId}`] || "",
        });
      }
    });

    serviceData.childrenData = childrenHomeschoolData;
    serviceData.termRate = parseInt(cleanedData.termRate) || 150000;
  } else if (serviceType === "kiddies-enrichment") {
    // Parse per-child enrichment data (single-day events)
    const childrenEnrichmentData: Array<{
      childId: string;
      selectedPrograms: string[];
      interests: string;
      parentGoals: string;
      hours: number;
      eventDate: string;
      startTime: string;
    }> = [];

    Array.from(childIds).forEach((childId) => {
      const programs = cleanedData[`selectedPrograms_${childId}`];
      const hours = parseFloat(cleanedData[`hours_${childId}`]) || 0;
      const eventDate = cleanedData[`eventDate_${childId}`] || "";
      const startTime = cleanedData[`startTime_${childId}`] || "";

      if (programs) {
        childrenEnrichmentData.push({
          childId,
          selectedPrograms: JSON.parse(programs),
          interests: cleanedData[`interests_${childId}`] || "",
          parentGoals: cleanedData[`parentGoals_${childId}`] || "",
          hours,
          eventDate,
          startTime,
        });
      }
    });

    serviceData.childrenData = childrenEnrichmentData;
    serviceData.hourlyRate = parseInt(cleanedData.hourlyRate) || 8000;
  } else if (serviceType === "space-rental") {
    serviceData.eventType = cleanedData.eventType;
    serviceData.eventDate = cleanedData.eventDate;
    serviceData.eventTime = cleanedData.eventTime;
    serviceData.venueType = cleanedData.venueType;
    serviceData.expectedGuests = parseInt(cleanedData.expectedGuests) || 0;
    serviceData.extraServices = cleanedData.extraServices
      ? JSON.parse(cleanedData.extraServices)
      : [];

    // Calculate base rate based on venue type
    let baseRate = 350000; // Indoor/Outdoor base
    if (cleanedData.venueType === "both") baseRate = 650000;
    serviceData.baseRate = baseRate;
    serviceData.cautionFee = 50000;
  }

  // Calculate total amount - NEW per-child calculations
  let totalAmount = 0;
  let pricingBaseAmount = 0;
  let pricingDiscount = 0;
  let pricingDiscountReason: string | undefined;

  if (serviceType === "tutoring") {
    // Sum up hours from all children
    const childrenData = serviceData.childrenData as Array<{
      totalHours: number;
    }>;
    const totalHours = childrenData.reduce(
      (sum, child) => sum + child.totalHours,
      0,
    );
    const submittedPromoCode = (cleanedData.promoCode || "").toString().trim();
    const normalizedPromoCode = submittedPromoCode.toUpperCase();
    const now = new Date();
    const isJunePromoWindow = isServerDateInJune(now);
    const tutoringLocation =
      (cleanedData.tutoringLocation as "virtual" | "physical") || "physical";

    const { virtualRate, physicalRate, isEduvantaService } =
      await getTutoringRatesFromService();
    const baseHourlyRate =
      tutoringLocation === "virtual" ? virtualRate : physicalRate;
    const hasEduvantaPromo =
      isEduvantaService &&
      tutoringLocation === "virtual" &&
      isJunePromoWindow &&
      normalizedPromoCode === EDUVANTA_PROMO_CODE;
    const effectiveHourlyRate = hasEduvantaPromo
      ? EDUVANTA_PROMO_VIRTUAL_RATE
      : baseHourlyRate;

    pricingBaseAmount = totalHours * baseHourlyRate;
    totalAmount = totalHours * effectiveHourlyRate;

    if (hasEduvantaPromo) {
      pricingDiscount = Math.max(0, pricingBaseAmount - totalAmount);
      pricingDiscountReason = `Promo code: ${EDUVANTA_PROMO_CODE} (${EDUVANTA_SERVICE_NAME})`;
    }

    serviceData.virtualRate = virtualRate;
    serviceData.physicalRate = physicalRate;
    serviceData.hourlyRate = effectiveHourlyRate;
  } else if (serviceType === "homeschooling") {
    // Each child pays the term rate
    const childrenData = serviceData.childrenData as Array<{ childId: string }>;
    const termRate = parseInt(cleanedData.termRate) || 150000;
    totalAmount = childrenData.length * termRate;
  } else if (serviceType === "kiddies-enrichment") {
    // Sum up hours from all children (single-day events)
    const childrenData = serviceData.childrenData as Array<{
      hours: number;
    }>;
    const totalHours = childrenData.reduce(
      (sum, child) => sum + child.hours,
      0,
    );
    const hourlyRate = parseInt(cleanedData.hourlyRate) || 8000;
    totalAmount = totalHours * hourlyRate;
  } else if (serviceType === "childcare") {
    // Calculate per child based on care type
    const childrenData = serviceData.childrenData as Array<{
      careType: string;
      totalDays: number;
      isMonthSelected: boolean;
    }>;
    const dailyRate = parseInt(cleanedData.dailyRate) || 5000;
    const monthlyRate = parseInt(cleanedData.monthlyRate) || 127500;

    totalAmount = childrenData.reduce((sum, child) => {
      if (child.isMonthSelected || child.careType === "monthly") {
        return sum + monthlyRate;
      } else {
        return sum + child.totalDays * dailyRate;
      }
    }, 0);
  } else if (serviceType === "holiday-camps") {
    const campSeasonId = resolveCampSeasonId(
      (cleanedData.campSeasonId as string) || null,
    );
    const campLocation = cleanedData.campLocation as CampLocation | undefined;

    const childrenData = serviceData.childrenData as Array<{
      childId: string;
      boarding?: boolean;
      campWeeks?: Array<{
        startDate: string;
        endDate: string;
        weekNumber: number;
      }>;
    }>;

    const pricingInputs = childrenData.map((child) => ({
      childId: child.childId,
      age: parseInt(cleanedData[`childAge_${child.childId}`] as string) || 0,
      weekCount: child.campWeeks?.length || 0,
      boarding: child.boarding ?? false,
    }));

    const campPricing = calculateCampPricing(
      campSeasonId,
      campLocation ?? null,
      pricingInputs,
    );

    pricingBaseAmount = campPricing.subtotal;
    pricingDiscount = campPricing.discount;
    pricingDiscountReason = campPricing.discount
      ? `Multi-week discount (${campPricing.discountPercent}%)`
      : undefined;
    totalAmount = campPricing.total;

    serviceData.weeklyRate = pricingInputs[0]
      ? campPricing.lines[0]?.campFeePerWeek || 0
      : 0;
    serviceData.campFee = serviceData.weeklyRate;
    serviceData.totalWeeks = campPricing.totalWeeks;
    serviceData.promoDiscount = campPricing.discount;
    if (campPricing.discount > 0) {
      serviceData.promoCode = "MULTI-WEEK-10";
    }
  } else if (serviceType === "space-rental") {
    totalAmount =
      (serviceData.baseRate as number) + (serviceData.cautionFee as number);
    // Add extra services cost
    const extraServices = serviceData.extraServices as Array<{
      service: string;
      quantity?: number;
    }>;
    if (extraServices) {
      extraServices.forEach((service) => {
        const rates: Record<string, number> = {
          dj: 150000,
          mc: 60000,
          "event-planning": 150000,
          "extra-carers": 8000,
        };
        totalAmount += (rates[service.service] || 0) * (service.quantity || 1);
      });
    }
  }

  // Determine parent name and email with fallbacks
  const parentName = cleanedData.parentName || sessionUser.name || null;
  const parentEmail = cleanedData.parentEmail || sessionUser.email || null;

  // Validate required fields before creating booking object
  if (!parentName) {
    throw new Error(
      "Parent name is required but not found in form data or session",
    );
  }
  if (!parentEmail) {
    throw new Error(
      "Parent email is required but not found in form data or session",
    );
  }

  const campScheduleBounds =
    serviceType === "holiday-camps"
      ? getCampScheduleBounds(
          (serviceData.childrenData as Array<{
            campWeeks?: Array<{ startDate: string; endDate: string }>;
          }>) ?? [],
        )
      : null;

  const preliminaryStart =
    campScheduleBounds?.startDate ||
    (cleanedData.startDate as string) ||
    new Date().toISOString().split("T")[0];

  const resolvedSchedule = resolveBookingScheduleDates({
    serviceType: serviceType as BookingInterface["serviceType"],
    serviceData,
    schedule: {
      startDate: preliminaryStart,
      endDate:
        campScheduleBounds?.endDate ||
        (cleanedData.endDate as string) ||
        undefined,
      weekdays: weekdays as BookingInterface["schedule"]["weekdays"],
      isRecurring: weekdays.length > 0,
      frequency:
        (cleanedData.frequency as "daily" | "weekly" | "monthly") || "weekly",
    },
  });

  // Create booking object
  const booking: BookingInterface = {
    userId,
    serviceType: serviceType as BookingInterface["serviceType"],
    parentName,
    parentEmail,
    parentPhone: cleanedData.parentPhone,
    parentAddress:
      cleanedData.parentAddress || cleanedData.address || undefined,
    childrenCount: children.length,
    children,
    serviceData,
    schedule: {
      startDate: resolvedSchedule.startDate || preliminaryStart,
      endDate:
        resolvedSchedule.endDate ||
        campScheduleBounds?.endDate ||
        (cleanedData.endDate as string) ||
        undefined,
      weekdays: weekdays as BookingInterface["schedule"]["weekdays"],
      isRecurring: weekdays.length > 0,
      frequency:
        (cleanedData.frequency as "daily" | "weekly" | "monthly") || "weekly",
    },
    pricing: {
      baseAmount: pricingBaseAmount || totalAmount,
      extraServicesAmount: 0,
      cautionFee: (serviceData.cautionFee as number) || 0,
      discount:
        pricingDiscount > 0
          ? {
              type: "fixed",
              value: pricingDiscount,
              reason: pricingDiscountReason,
            }
          : undefined,
      totalAmount,
      currency: "NGN",
    },
    payment: {
      status: "pending",
      paidAmount: 0,
    },
    status: "pending",
    priority:
      (cleanedData.priority as "low" | "normal" | "high" | "urgent") ||
      "normal",
    createdAt: new Date(),
    updatedAt: new Date(),
    source: (cleanedData.selectedHearAboutUs ||
      cleanedData.source ||
      "other") as BookingInterface["source"],
    referralSource: cleanedData.otherHearAboutUsText || undefined,
    socialMediaPlatform: cleanedData.socialMediaPlatform || undefined,
    referralName: cleanedData.referralName || undefined,
    followUpRequired: cleanedData.followUpRequired === "true",
    isRepeatedCustomer: cleanedData.isRepeatedCustomer === "true",
  };

  return booking;
}
