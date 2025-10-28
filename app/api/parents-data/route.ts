import { NextRequest, NextResponse } from "next/server";
import {
  getParentsData,
  getParentAnalytics,
} from "../../dashboard/parents/action";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (type === "analytics") {
      const analyticsData = await getParentAnalytics();
      return NextResponse.json(analyticsData);
    } else {
      const parentsData = await getParentsData();
      return NextResponse.json(parentsData);
    }
  } catch (error) {
    console.error("Parents API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch parent data" },
      { status: 500 }
    );
  }
}
