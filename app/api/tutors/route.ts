import { NextRequest, NextResponse } from "next/server";
import {
  getTutors,
  getTutorPerformanceData,
  getTutorSubjectDistribution,
  getTutorRegistrationTrends,
} from "../../dashboard/tutors/action";

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
