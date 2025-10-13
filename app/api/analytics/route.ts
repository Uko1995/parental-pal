import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsData,
  getMonthlyRevenueData,
  getServicePerformanceData,
  getUserEngagementMetrics,
} from "../../dashboard/analytics/action";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    switch (type) {
      case "overview":
        const overview = await getAnalyticsData();
        return NextResponse.json(overview);

      case "revenue":
        const revenue = await getMonthlyRevenueData();
        return NextResponse.json(revenue);

      case "services":
        const services = await getServicePerformanceData();
        return NextResponse.json(services);

      case "engagement":
        const engagement = await getUserEngagementMetrics();
        return NextResponse.json(engagement);

      default:
        const [allData, monthlyData, serviceData, engagementData] =
          await Promise.all([
            getAnalyticsData(),
            getMonthlyRevenueData(),
            getServicePerformanceData(),
            getUserEngagementMetrics(),
          ]);

        return NextResponse.json({
          overview: allData,
          monthly: monthlyData,
          services: serviceData,
          engagement: engagementData,
        });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
