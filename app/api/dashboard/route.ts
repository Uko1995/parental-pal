import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { BookingInterface } from "@/models/Booking";
import { UserInterface } from "@/models/User";

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  pendingPayments: number;
  pendingChange: number;
  activeBookings: number;
  bookingsChange: number;
  totalParents: number;
  parentsChange: number;
  conversionRate: number;
  conversionChange: number;
}

interface RevenueData {
  label: string;
  revenue: number;
}

interface RecentBooking {
  id: string;
  parentName: string;
  service: string;
  amount: number;
  status: string;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get("interval") || "month"; // "7days", "month", "year"

    const bookingsCollection = await getCollection<BookingInterface>(
      "bookings"
    );
    const usersCollection = await getCollection<UserInterface>("users");

    const now = new Date();

    // Calculate date ranges based on interval
    let startDate: Date;
    let previousPeriodStart: Date;

    switch (interval) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 365 * 24 * 60 * 60 * 1000
        );
        break;
      case "month":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        break;
    }

    // Get current period bookings
    const currentBookings = await bookingsCollection
      .find({
        createdAt: {
          $gte: startDate,
          $lte: now,
        },
      })
      .toArray();

    // Get previous period bookings for comparison
    const previousBookings = await bookingsCollection
      .find({
        createdAt: {
          $gte: previousPeriodStart,
          $lte: startDate,
        },
      })
      .toArray();

    // Calculate total revenue (only paid bookings)
    const currentRevenue = currentBookings
      .filter((booking) => booking.payment?.status === "paid")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const previousRevenue = previousBookings
      .filter((booking) => booking.payment?.status === "paid")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate pending payments
    const currentPending = currentBookings
      .filter((booking) => booking.payment?.status === "pending")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const previousPending = previousBookings
      .filter((booking) => booking.payment?.status === "pending")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const pendingChange =
      previousPending > 0
        ? ((currentPending - previousPending) / previousPending) * 100
        : 0;

    // Calculate active bookings (confirmed and in-progress)
    const activeBookings = currentBookings.filter((booking) =>
      ["confirmed", "in-progress"].includes(booking.status)
    ).length;
    const previousActiveBookings = previousBookings.filter((booking) =>
      ["confirmed", "in-progress"].includes(booking.status)
    ).length;
    const bookingsChange =
      previousActiveBookings > 0
        ? ((activeBookings - previousActiveBookings) / previousActiveBookings) *
          100
        : 0;

    // Get total parents in current period
    const currentParents = await usersCollection.countDocuments({
      role: "parent",
      createdAt: { $gte: startDate, $lte: now },
    });
    const previousParents = await usersCollection.countDocuments({
      role: "parent",
      createdAt: { $gte: previousPeriodStart, $lte: startDate },
    });
    const parentsChange =
      previousParents > 0
        ? ((currentParents - previousParents) / previousParents) * 100
        : 0;

    // Calculate conversion rate (active bookings / total users)
    const totalVisits = currentBookings.length + 50; // Approximation for visits
    const conversionRate =
      totalVisits > 0 ? (activeBookings / totalVisits) * 100 : 0;
    const prevTotalVisits = previousBookings.length + 50;
    const prevConversionRate =
      prevTotalVisits > 0
        ? (previousActiveBookings / prevTotalVisits) * 100
        : 0;
    const conversionChange =
      prevConversionRate > 0
        ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100
        : 0;

    // Get revenue data for chart based on interval
    const revenueData: RevenueData[] = [];

    if (interval === "7days") {
      // 7 days - show daily revenue
      const dailyRevenue = await bookingsCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now },
              status: { $in: ["confirmed", "completed", "in-progress"] },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              revenue: { $sum: "$pricing.totalAmount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ])
        .toArray();

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayData = dailyRevenue.find(
          (item) =>
            item._id.year === date.getFullYear() &&
            item._id.month === date.getMonth() + 1 &&
            item._id.day === date.getDate()
        );

        revenueData.push({
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
          }),
          revenue: dayData?.revenue || 0,
        });
      }
    } else if (interval === "month") {
      // 30 days - show daily revenue
      const dailyRevenue = await bookingsCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now },
              status: { $in: ["confirmed", "completed", "in-progress"] },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              revenue: { $sum: "$pricing.totalAmount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ])
        .toArray();

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayData = dailyRevenue.find(
          (item) =>
            item._id.year === date.getFullYear() &&
            item._id.month === date.getMonth() + 1 &&
            item._id.day === date.getDate()
        );

        revenueData.push({
          label: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayData?.revenue || 0,
        });
      }
    } else if (interval === "year") {
      // 12 months - show monthly revenue
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

      const monthlyRevenue = await bookingsCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: yearStart, $lte: yearEnd },
              status: { $in: ["confirmed", "completed", "in-progress"] },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$pricing.totalAmount" },
            },
          },
          { $sort: { "_id.month": 1 } },
        ])
        .toArray();

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthData = monthlyRevenue.find(
          (item) =>
            item._id.year === currentYear && item._id.month === monthIndex + 1
        );

        revenueData.push({
          label: monthNames[monthIndex],
          revenue: monthData?.revenue || 0,
        });
      }
    }

    // Get recent bookings
    const recentBookingsData = await bookingsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const recentBookings: RecentBooking[] = recentBookingsData.map(
      (booking) => ({
        id: booking._id?.toString() || "",
        parentName: booking.parentName || "Unknown",
        service: getServiceDisplayName(booking.serviceType),
        amount: booking.pricing?.totalAmount || 0,
        status: booking.status,
        date: booking.createdAt.toISOString().split("T")[0],
      })
    );

    const stats: DashboardStats = {
      totalRevenue: currentRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      pendingPayments: currentPending,
      pendingChange: Math.round(pendingChange * 10) / 10,
      activeBookings,
      bookingsChange: Math.round(bookingsChange * 10) / 10,
      totalParents: currentParents,
      parentsChange: Math.round(parentsChange * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      conversionChange: Math.round(conversionChange * 10) / 10,
    };

    return NextResponse.json({
      stats,
      revenueData,
      recentBookings,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

function getServiceDisplayName(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    tutoring: "Academic Tutoring",
    childcare: "Daily Childcare",
    homeschooling: "Homeschooling Support",
    "holiday-camps": "Holiday Camp",
    "space-rental": "Event Space Rental",
    "kiddies-enrichment": "Kids Enrichment",
  };

  return serviceNames[serviceType] || serviceType;
}
