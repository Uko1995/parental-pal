import { NextRequest, NextResponse } from "next/server";
import {
  getTutors,
  getTutorPerformanceData,
  getTutorSubjectDistribution,
  getTutorRegistrationTrends,
} from "../../dashboard/tutors/action";
import { UserRepository } from "@/lib/UserRepository";

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
    const body = await request.json();

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
          days: availability?.days || availability || [],
          hours: availability?.hours || {
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
        preferredServices: body.preferences?.preferredServices || [
          "tutoring" as const,
        ],
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
