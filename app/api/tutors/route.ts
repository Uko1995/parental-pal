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

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validate required fields using nested structure
    const missingFields = [];

    // Check nested user data
    if (!userData.userData?.user?.name) missingFields.push("name");
    if (!userData.userData?.user?.email) missingFields.push("email");

    // Check top-level fields
    if (!userData.phone) missingFields.push("phone");
    if (!userData.address) missingFields.push("address");
    if (!userData.specialty) missingFields.push("specialty");
    if (!userData.experience || userData.experience <= 0)
      missingFields.push("experience");
    if (!userData.subjects || userData.subjects.length === 0)
      missingFields.push("subjects");
    if (!userData.bio) missingFields.push("bio");

    // Check hourly rate acceptance
    if (userData.tutorProfile?.hourlyRateAccepted !== true) {
      return NextResponse.json(
        { error: "You must accept the hourly rate offer to proceed" },
        { status: 400 }
      );
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the user data structure
    const newTutor = {
      userData: userData.userData,
      phone: userData.phone,
      address: userData.address,
      role: "tutor" as const,
      isActive: false, // Pending approval
      membershipType: "none" as const,
      tutorProfile: {
        ...userData.tutorProfile,
        rating: 0,
        totalReviews: 0,
        isVerified: false,
      },
      preferences: userData.preferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(
      userData.userData.user.email
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Create the tutor
    const result = await UserRepository.createUser(newTutor);

    return NextResponse.json(
      {
        success: true,
        message: "Tutor application submitted successfully",
        data: { id: result._id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tutor:", error);
    return NextResponse.json(
      { error: "Failed to submit tutor application" },
      { status: 500 }
    );
  }
}
