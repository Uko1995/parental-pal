import { NextRequest, NextResponse } from "next/server";
import {
  getTutors,
  getTutorSubjectDistribution,
  getTutorRegistrationTrends,
} from "../../dashboard/tutors/action";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    switch (type) {
      case "subjects":
        const subjectData = await getTutorSubjectDistribution();
        return NextResponse.json(subjectData);
      case "registration-trends":
        const trendsData = await getTutorRegistrationTrends();
        return NextResponse.json(trendsData);
      default:
        const tutorsData = await getTutors();
        return NextResponse.json(tutorsData);
    }
  } catch (error) {
    console.error("Tutors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor data" },
      { status: 500 }
    );
  }
}
