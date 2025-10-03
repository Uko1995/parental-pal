"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { getCollection } from "@/lib/mongodb";

interface ReportData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
  serviceBreakdown: Record<
    string,
    {
      count: number;
      revenue: number;
    }
  >;
  userTypes: Record<string, number>;
}

const fetchReportData = async (): Promise<ReportData> => {
  const [usersCollection, bookingsCollection] = await Promise.all([
    getCollection("users"),
    getCollection("bookings"),
  ]);

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all data
  const [allUsers, allBookings, currentMonthUsers, currentMonthBookings] =
    await Promise.all([
      usersCollection.countDocuments({}),
      bookingsCollection.find({}).toArray(),
      usersCollection.countDocuments({ createdAt: { $gte: currentMonth } }),
      bookingsCollection.countDocuments({ createdAt: { $gte: currentMonth } }),
    ]);

  const [lastMonthUsers, lastMonthBookings] = await Promise.all([
    usersCollection.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth },
    }),
    bookingsCollection.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth },
    }),
  ]);

  // Calculate revenue and service breakdown
  let totalRevenue = 0;
  const serviceBreakdown: Record<string, { count: number; revenue: number }> =
    {};

  interface BookingDoc {
    totalCost?: number;
    serviceType?: string;
  }

  (allBookings as BookingDoc[]).forEach((booking) => {
    const amount = booking.totalCost || 0;
    totalRevenue += amount;

    const service = booking.serviceType || "Other";
    if (!serviceBreakdown[service]) {
      serviceBreakdown[service] = { count: 0, revenue: 0 };
    }
    serviceBreakdown[service].count += 1;
    serviceBreakdown[service].revenue += amount;
  });

  // Get user types breakdown
  const userTypesData = await usersCollection
    .aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  interface UserTypeDoc {
    _id: string;
    count: number;
  }

  const userTypes: Record<string, number> = {};
  (userTypesData as UserTypeDoc[]).forEach((item) => {
    userTypes[item._id || "Unknown"] = item.count;
  });

  return {
    totalUsers: allUsers,
    totalBookings: allBookings.length,
    totalRevenue,
    monthlyGrowth: {
      users:
        lastMonthUsers === 0
          ? 100
          : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100,
      bookings:
        lastMonthBookings === 0
          ? 100
          : ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) *
            100,
      revenue: 0, // Would need historical revenue data
    },
    serviceBreakdown,
    userTypes,
  };
};

/**
 * Get comprehensive report data with caching
 */
export const getReportData = unstable_cache(fetchReportData, ["report-data"], {
  revalidate: CACHE_TIMES.DASHBOARD_STATS,
  tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.USERS, CACHE_TAGS.BOOKINGS],
});

/**
 * Get revenue analytics with caching
 */
export const getRevenueAnalytics = unstable_cache(
  async () => {
    const data = await fetchReportData();
    return {
      totalRevenue: data.totalRevenue,
      serviceBreakdown: data.serviceBreakdown,
      averageBookingValue:
        data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0,
    };
  },
  ["revenue-analytics"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.BOOKINGS],
  }
);

/**
 * Get user growth metrics with caching
 */
export const getUserGrowthMetrics = unstable_cache(
  async () => {
    const data = await fetchReportData();
    return {
      totalUsers: data.totalUsers,
      userTypes: data.userTypes,
      monthlyGrowth: data.monthlyGrowth.users,
    };
  },
  ["user-growth-metrics"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.USERS, CACHE_TAGS.ANALYTICS],
  }
);
