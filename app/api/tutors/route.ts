import { NextRequest, NextResponse } from "next/server";
import {
  getTutors,
  getTutorPerformanceData,
  getTutorSubjectDistribution,
  getTutorRegistrationTrends,
} from "../../dashboard/tutors/action";
import { UserRepository } from "@/lib/UserRepository";
import { auth } from "@/auth";
import { rateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";

interface TutorCreateRequest {
  userData?: {
    user?: {
      name?: string;
      email?: string;
      image?: string;
    };
  };
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  tutorProfile?: {
    bio?: string;
    specialty?: string;
    qualifications?: string[];
    subjects?: string[];
    experience?: number | string;
    hourlyRate?: number;
    availability?: {
      days?: string[];
      hours?: {
        start: string;
        end: string;
      };
    };
    documents?: string[];
    hourlyRateAccepted?: boolean;
  };
  bio?: string;
  specialty?: string;
  specialties?: string[];
  qualifications?: string[];
  subjects?: string[];
  experience?: number | string;
  hourlyRate?: number;
  availability?:
    | string[]
    | {
        days?: string[];
        hours?: {
          start: string;
          end: string;
        };
      };
  documents?: string[];
  adminCreated?: boolean;
  preferences?: {
    preferredServices?: string[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    switch (type) {
      case "overview":
        const overview = await getTutors();
        return NextResponse.json(overview);

      case "performance":
        const performance = await getTutorPerformanceData();
        return NextResponse.json(performance);

      case "subjects":
        const subjects = await getTutorSubjectDistribution();
        return NextResponse.json(subjects);

      case "registrations":
        const registrations = await getTutorRegistrationTrends();
        return NextResponse.json(registrations);

      default:
        const [allData, performanceData, subjectData, registrationData] =
          await Promise.all([
            getTutors(),
            getTutorPerformanceData(),
            getTutorSubjectDistribution(),
            getTutorRegistrationTrends(),
          ]);

        return NextResponse.json({
          overview: allData,
          performance: performanceData,
          subjects: subjectData,
          registrations: registrationData,
        });
    }
  } catch (error) {
    console.error("Tutors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutors data" },
      { status: 500 }
    );
  }
}

// Create tutor (Admin)
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`tutor-create:${ip}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized tutor create attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can create tutors
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to create tutor"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody) as TutorCreateRequest;

    // Extract data from nested structure or flat structure (support both)
    const name = body.userData?.user?.name || body.name;
    const email = body.userData?.user?.email || body.email;
    const phone = body.phone;
    const address = body.address;
    const bio = body.tutorProfile?.bio || body.bio;
    const specialty = body.tutorProfile?.specialty || body.specialty;
    const specialties = body.specialties || (specialty ? [specialty] : []);
    const qualifications =
      body.tutorProfile?.qualifications || body.qualifications || [];
    const subjects = body.tutorProfile?.subjects || body.subjects || [];
    const experience = body.tutorProfile?.experience || body.experience;
    const hourlyRate = body.tutorProfile?.hourlyRate || body.hourlyRate;
    const availability = body.tutorProfile?.availability || body.availability;

    if (
      !name ||
      !email ||
      !specialties?.length ||
      !subjects?.length ||
      !experience
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, email, specialties, subjects, and experience are required",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A tutor with this email already exists" },
        { status: 400 }
      );
    }

    // Determine if this is admin-created or self-registration
    const isAdminCreated = body.adminCreated === true;
    const documents = body.tutorProfile?.documents || body.documents || [];

    // Create tutor data
    const tutorData = {
      userData: {
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days OAuth session expiry
        user: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          image: body.profileImage || body.userData?.user?.image || null,
        },
      },
      phone: phone || "",
      address: address || "",
      role: "tutor" as const,
      isActive: true, // Always active - no approval needed
      membershipType: "basic" as const,
      tutorProfile: {
        specialty: specialties[0] || "General",
        experience:
          typeof experience === "string"
            ? parseInt(experience.replace(/[^\d]/g, "")) || 0
            : experience || 0,
        qualifications: qualifications || [],
        subjects: subjects,
        documents: documents,
        rating: 0,
        totalReviews: 0,
        availability: {
          days: (Array.isArray(availability)
            ? availability
            : availability?.days || []) as (
            | "Monday"
            | "Tuesday"
            | "Wednesday"
            | "Thursday"
            | "Friday"
            | "Saturday"
            | "Sunday"
          )[],
          hours: Array.isArray(availability)
            ? { start: "09:00", end: "17:00" }
            : availability?.hours || {
                start: "09:00",
                end: "17:00",
              },
        },
        hourlyRate: hourlyRate || 6000,
        hourlyRateAccepted: body.tutorProfile?.hourlyRateAccepted ?? true,
        bio: bio || "",
        isVerified: true, // Always verified
      },
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        preferredServices: (body.preferences?.preferredServices || [
          "tutoring",
        ]) as ("tutoring" | "homeschooling")[],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await UserRepository.createUser(tutorData);

    // Send welcome email in background (non-blocking)
    if (!isAdminCreated) {
      fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tutor-registration",
          to: email.trim().toLowerCase(),
          userName: name.trim(),
          apiKey: process.env.EMAIL_API_KEY,
          data: {
            tutorId: result._id?.toString(),
            specialty: specialties[0] || "General",
            subjects: subjects,
          },
        }),
      }).catch((error) => {
        console.error("Background email send failed:", error);
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating tutor:", error);
    return NextResponse.json(
      { error: "Failed to submit tutor application" },
      { status: 500 }
    );
  }
}

// Update tutor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tutorId, updateData } = body;

    if (!tutorId || !updateData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await UserRepository.updateUser(tutorId, updateData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating tutor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update tutor" },
      { status: 500 }
    );
  }
}
