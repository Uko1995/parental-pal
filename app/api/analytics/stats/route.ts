import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import {
  AnalyticsEventInterface,
  AnalyticsSessionInterface,
} from "@/models/Analytics";
import { UserInterface } from "@/models/User";
import { BookingInterface } from "@/models/Booking";
import { PaymentInterface } from "@/models/Payment";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days"; // 7days, 30days, 90days, year, all
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get collections
    const eventsCollection = await getCollection<AnalyticsEventInterface>(
      "analyticsevents"
    );
    const sessionsCollection = await getCollection<AnalyticsSessionInterface>(
      "analyticssessions"
    );
    const usersCollection = await getCollection<UserInterface>("users");
    const bookingsCollection = await getCollection<BookingInterface>(
      "bookings"
    );
    const paymentsCollection = await getCollection<PaymentInterface>(
      "payments"
    );

    // Calculate date range
    interface DateFilter {
      $gte?: Date;
      $lte?: Date;
    }

    let dateFilter: DateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const now = new Date();
      const periodMap: Record<string, number> = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        year: 365,
      };
      const days = periodMap[period];
      if (days) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        dateFilter = { $gte: startDate };
      }
    }

    // Page Views
    const pageViewsQuery: {
      timestamp?: DateFilter;
      eventType: "page_view";
    } = dateFilter.$gte
      ? { timestamp: dateFilter, eventType: "page_view" }
      : { eventType: "page_view" };
    const totalPageViews = await eventsCollection.countDocuments(
      pageViewsQuery
    );

    // Unique Visitors (unique sessions)
    const uniqueVisitorsQuery = dateFilter.$gte
      ? { startTime: dateFilter }
      : {};
    const uniqueVisitors = await sessionsCollection.countDocuments(
      uniqueVisitorsQuery
    );

    // New Signups
    const signupsQuery = dateFilter.$gte ? { createdAt: dateFilter } : {};
    const newSignups = await usersCollection.countDocuments(signupsQuery);

    // New Bookings
    const bookingsQuery = dateFilter.$gte ? { createdAt: dateFilter } : {};
    const newBookings = await bookingsCollection.countDocuments(bookingsQuery);

    // Revenue (successful payments)
    const revenueQuery = dateFilter.$gte
      ? { createdAt: dateFilter, status: "success" }
      : { status: "success" };
    const revenueData = await paymentsCollection
      .aggregate([
        { $match: revenueQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const successfulPayments = revenueData[0]?.count || 0;

    // Conversion Rate (signups / unique visitors)
    const conversionRate =
      uniqueVisitors > 0 ? ((newSignups / uniqueVisitors) * 100).toFixed(2) : 0;

    // Average Session Duration
    const sessionDurations = await sessionsCollection
      .aggregate([
        {
          $match: {
            ...(dateFilter.$gte && { startTime: dateFilter }),
            endTime: { $exists: true },
          },
        },
        {
          $project: {
            duration: {
              $subtract: ["$endTime", "$startTime"],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$duration" },
          },
        },
      ])
      .toArray();
    const avgSessionDuration = sessionDurations[0]?.avgDuration || 0;

    // Page Views Trend (daily for the period)
    const pageViewsTrend = await eventsCollection
      .aggregate([
        { $match: pageViewsQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Signups Trend
    const signupsTrend = await usersCollection
      .aggregate([
        { $match: signupsQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Bookings Trend
    const bookingsTrend = await bookingsCollection
      .aggregate([
        { $match: bookingsQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Revenue Trend
    const revenueTrend = await paymentsCollection
      .aggregate([
        { $match: revenueQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Top Pages
    const topPages = await eventsCollection
      .aggregate([
        { $match: pageViewsQuery },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Device Breakdown
    const deviceBreakdown = await sessionsCollection
      .aggregate([
        { $match: uniqueVisitorsQuery },
        {
          $group: {
            _id: "$deviceType",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Browser Breakdown
    const browserBreakdown = await sessionsCollection
      .aggregate([
        { $match: uniqueVisitorsQuery },
        {
          $group: {
            _id: "$browser",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Referrer Sources
    const referrerSources = await sessionsCollection
      .aggregate([
        {
          $match: {
            ...uniqueVisitorsQuery,
            referrer: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$referrer",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    return NextResponse.json({
      summary: {
        totalPageViews,
        uniqueVisitors,
        newSignups,
        newBookings,
        totalRevenue,
        successfulPayments,
        conversionRate: parseFloat(conversionRate as string),
        avgSessionDuration: Math.round(avgSessionDuration / 1000), // Convert to seconds
      },
      trends: {
        pageViews: pageViewsTrend,
        signups: signupsTrend,
        bookings: bookingsTrend,
        revenue: revenueTrend,
      },
      breakdown: {
        topPages,
        devices: deviceBreakdown,
        browsers: browserBreakdown,
        referrers: referrerSources,
      },
    });
  } catch (error) {
    console.error("Analytics stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
