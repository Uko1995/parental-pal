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
    const interval = searchParams.get("interval") || "month"; // "month", "3months", "year"

    const bookingsCollection = await getCollection<BookingInterface>(
      "bookings"
    );
    const ordersCollection = await getCollection("orders");
    const usersCollection = await getCollection<UserInterface>("users");

    const now = new Date();

    // Calculate date ranges based on interval
    let startDate: Date;
    let previousPeriodStart: Date;

    switch (interval) {
      case "3months":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(
          startDate.getTime() - 90 * 24 * 60 * 60 * 1000
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
    const currentBookingRevenue = currentBookings
      .filter((booking) => booking.payment?.status === "paid")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const previousBookingRevenue = previousBookings
      .filter((booking) => booking.payment?.status === "paid")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    // Get product orders revenue (only paid orders)
    const currentOrders = await ordersCollection
      .find({
        createdAt: { $gte: startDate, $lte: now },
      })
      .toArray();

    const previousOrders = await ordersCollection
      .find({
        createdAt: { $gte: previousPeriodStart, $lte: startDate },
      })
      .toArray();

    const currentOrderRevenue = currentOrders
      .filter((order) => order.payment?.status === "success")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const previousOrderRevenue = previousOrders
      .filter((order) => order.payment?.status === "success")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Combine bookings and orders revenue
    const currentRevenue = currentBookingRevenue + currentOrderRevenue;
    const previousRevenue = previousBookingRevenue + previousOrderRevenue;

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate pending payments (bookings + orders)
    const currentBookingPending = currentBookings
      .filter((booking) => booking.payment?.status === "pending")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const previousBookingPending = previousBookings
      .filter((booking) => booking.payment?.status === "pending")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const currentOrderPending = currentOrders
      .filter((order) => order.payment?.status === "pending")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const previousOrderPending = previousOrders
      .filter((order) => order.payment?.status === "pending")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const currentPending = currentBookingPending + currentOrderPending;
    const previousPending = previousBookingPending + previousOrderPending;

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

    if (interval === "month") {
      // 30 days - show daily revenue
      const dailyRevenue = await bookingsCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now },
              "payment.status": "paid",
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
    } else if (interval === "3months") {
      // 90 days - show weekly revenue
      const dailyRevenue = await bookingsCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now },
              "payment.status": "paid",
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

      for (let w = 0; w < 13; w++) {
        const weekStart = new Date(
          startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000
        );
        if (weekStart > now) break;

        let weekRevenue = 0;
        for (let d = 0; d < 7; d++) {
          const date = new Date(
            weekStart.getTime() + d * 24 * 60 * 60 * 1000
          );
          if (date > now) break;

          const dayData = dailyRevenue.find(
            (item) =>
              item._id.year === date.getFullYear() &&
              item._id.month === date.getMonth() + 1 &&
              item._id.day === date.getDate()
          );
          weekRevenue += dayData?.revenue || 0;
        }

        revenueData.push({
          label: weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: weekRevenue,
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
              "payment.status": "paid",
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

    // Get recent bookings (only paid/confirmed)
    const recentBookingsData = await bookingsCollection
      .find({
        "payment.status": "paid",
        status: { $in: ["confirmed", "completed", "in-progress"] },
      })
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
