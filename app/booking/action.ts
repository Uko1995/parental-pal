"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { ObjectId } from "mongodb";
import { BookingInterface } from "@/models/Booking";

export async function registerChild(formData: FormData) {
  // Check authentication status
  const session = await auth();

  if (!session?.user) {
    // User is not authenticated, redirect to signin with callback URL
    redirect("/auth/signin?callbackUrl=/booking&action=submit");
  }

  console.log("Form Data Received:", Object.fromEntries(formData.entries()));

  // Clean up Next.js internal form data
  const cleanedData = Object.fromEntries(formData.entries());
  Object.keys(cleanedData).forEach((key) => {
    if (key.startsWith("$ACTION_ID")) {
      delete cleanedData[key];
    }
  });

  console.log("Cleaned Data:", cleanedData);
  console.log("Session User Data:", {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });

  // Get or create user in database
  let user = await UserRepository.findByEmail(session.user.email!);
  if (!user) {
    user = await UserRepository.createUser({
      userData: {
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year
        user: {
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || "",
        },
      },
      phone: (cleanedData.parentPhone as string) || "",
      address:
        ((cleanedData.parentAddress || cleanedData.address) as string) || "",
      role: "parent",
      isActive: true,
      membershipType: "basic",
    });
  }

  // Convert form data to string entries
  const formEntries: FormDataEntries = {};
  Object.entries(cleanedData).forEach(([key, value]) => {
    formEntries[key] = typeof value === "string" ? value : String(value);
  });

  // Parse form data into booking format
  const bookingData = await parseFormDataToBooking(
    formEntries,
    user._id!,
    session.user
  );

  // Debug logging to identify missing required fields
  console.log("Booking data validation:");
  console.log("- parentName:", bookingData.parentName);
  console.log("- parentEmail:", bookingData.parentEmail);
  console.log("- serviceType:", bookingData.serviceType);
  console.log("- selectedService from form:", formEntries.selectedService);
  console.log("- serviceType from form:", formEntries.serviceType);

  // Validate required fields before saving
  if (!bookingData.parentName) {
    throw new Error(
      "Parent name is missing. Session name: " +
        session.user.name +
        ", Form parentName: " +
        formEntries.parentName
    );
  }
  if (!bookingData.parentEmail) {
    throw new Error(
      "Parent email is missing. Session email: " +
        session.user.email +
        ", Form parentEmail: " +
        formEntries.parentEmail
    );
  }
  if (!bookingData.serviceType) {
    throw new Error(
      "Service type is missing. Form selectedService: " +
        formEntries.selectedService +
        ", Form serviceType: " +
        formEntries.serviceType
    );
  }

  // Save booking to MongoDB
  if (!user) {
    throw new Error("User not found after creation/retrieval");
  }

  const savedBooking = await BookingRepository.createBooking(bookingData);
  console.log("✅ Booking saved to database:", savedBooking._id);

  // Send booking confirmation email
  try {
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "booking-confirmation",
        to: user.userData.user.email,
        userName: user.userData.user.name || "Parent",
        data: {
          _id: savedBooking._id?.toString(),
          serviceType: savedBooking.serviceType,
          schedule: savedBooking.schedule,
          children: savedBooking.children,
          status: savedBooking.status,
          pricing: savedBooking.pricing,
        },
      }),
    });

    if (emailResponse.ok) {
      console.log("✅ Booking confirmation email sent successfully");
    } else {
      console.error(
        "❌ Failed to send booking confirmation email:",
        await emailResponse.text()
      );
    }
  } catch (emailError) {
    console.error("❌ Error sending booking confirmation email:", emailError);
  }

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
}

// Type for form data
type FormDataEntries = Record<string, string>;

// Helper function to parse form data into BookingInterface format
async function parseFormDataToBooking(
  cleanedData: FormDataEntries,
  userId: ObjectId,
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
): Promise<BookingInterface> {
  // Parse children data - handle both formats
  const children: Array<{
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
  }> = [];

  // First try the expected format (child-0-name, etc.)
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

  // If no children found, try the alternative format (childName1, etc.)
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

  // Parse schedule data - handle both formats
  const weekdays: Array<{
    day: string;
    hours: number;
    startTime?: string;
    endTime?: string;
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
        daySchedules.forEach((schedule: { day: string; hours?: number }) => {
          if (schedule.day) {
            weekdays.push({
              day: schedule.day,
              hours: schedule.hours || 8, // Default 8 hours for childcare
              startTime: cleanedData.dropoffTime || undefined,
              endTime: cleanedData.pickupTime || undefined,
            });
          }
        });
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
        Object.keys(cleanedData).join(", ")
    );
  }

  // Validate that it's a valid service type
  const validServiceTypes = [
    "tutoring",
    "childcare",
    "holiday-camps",
    "space-rental",
  ];
  if (!validServiceTypes.includes(serviceType)) {
    throw new Error(
      `Invalid service type: ${serviceType}. Must be one of: ${validServiceTypes.join(
        ", "
      )}`
    );
  }

  const serviceData: Record<string, string | number | boolean | object> = {};

  if (serviceType === "tutoring") {
    serviceData.subjects = cleanedData.subjects
      ? JSON.parse(cleanedData.subjects)
      : [];
    serviceData.academicLevel = cleanedData.academicLevel;
    serviceData.learningGoals = cleanedData.learningGoals;
    serviceData.hourlyRate = 15000; // ₦15,000 per hour
  } else if (serviceType === "childcare") {
    serviceData.careType = cleanedData.careType;
    serviceData.dropoffTime = cleanedData.dropoffTime;
    serviceData.pickupTime = cleanedData.pickupTime;
    serviceData.specialNeeds = cleanedData.specialNeeds;
    serviceData.dailyRate = 5000; // ₦5,000 per day
    serviceData.monthlyRate = Math.floor(5000 * 30 * 0.85); // 15% monthly discount
  } else if (serviceType === "holiday-camps") {
    serviceData.campWeeks = cleanedData.campWeeks
      ? JSON.parse(cleanedData.campWeeks)
      : [];
    serviceData.weeklyRate = 30000; // ₦30,000 per week
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
    let baseRate = 250000; // Indoor/Outdoor base
    if (cleanedData.venueType === "both") baseRate = 470000;
    serviceData.baseRate = baseRate;
    serviceData.cautionFee = 50000;
  }

  // Calculate total amount
  const totalHours = weekdays.reduce((sum, day) => sum + day.hours, 0);
  let totalAmount = 0;

  if (serviceType === "tutoring") {
    totalAmount = totalHours * 15000;
  } else if (serviceType === "childcare") {
    totalAmount =
      cleanedData.careType === "monthly"
        ? (serviceData.monthlyRate as number)
        : weekdays.length * 5000;
  } else if (serviceType === "holiday-camps") {
    const campWeeks = serviceData.campWeeks as Array<{
      startDate: string;
      endDate: string;
      weekNumber: number;
    }>;
    totalAmount = (campWeeks?.length || 1) * 30000;
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
      "Parent name is required but not found in form data or session"
    );
  }
  if (!parentEmail) {
    throw new Error(
      "Parent email is required but not found in form data or session"
    );
  }

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
      startDate:
        cleanedData.startDate || new Date().toISOString().split("T")[0],
      endDate: cleanedData.endDate || undefined,
      weekdays: weekdays as BookingInterface["schedule"]["weekdays"],
      isRecurring: weekdays.length > 0,
      frequency:
        (cleanedData.frequency as "daily" | "weekly" | "monthly") || "weekly",
    },
    pricing: {
      baseAmount: totalAmount,
      extraServicesAmount: 0,
      cautionFee: (serviceData.cautionFee as number) || 0,
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
    followUpRequired: cleanedData.followUpRequired === "true",
    isRepeatedCustomer: cleanedData.isRepeatedCustomer === "true",
  };

  return booking;
}
