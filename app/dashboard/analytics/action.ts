"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { getCollection } from "@/lib/mongodb";

interface AnalyticsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  monthlyStats: {
    bookings: number;
    revenue: number;
    newUsers: number;
  };
  serviceBreakdown: Record<string, number>;
  recentBookings: Array<{
    id: string;
    clientName: string;
    service: string;
    amount: number;
    date: Date;
  }>;
}

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const [usersCollection, bookingsCollection] = await Promise.all([
    getCollection("users"),
    getCollection("bookings"),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalBookingsCount,
    allBookings,
    activeUsers,
    monthlyBookings,
    monthlyUsers,
    recentBookingsData
  ] = await Promise.all([
    usersCollection.countDocuments({}),
    bookingsCollection.countDocuments({}),
    bookingsCollection.find({}).toArray(),
    usersCollection.countDocuments({ isActive: { $ne: false } }),
    bookingsCollection.find({ createdAt: { $gte: startOfMonth } }).toArray(),
    usersCollection.countDocuments({ createdAt: { $gte: startOfMonth } }),
    bookingsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray()
  ]);

  // Calculate total revenue
  interface BookingDoc {
    totalCost?: number;
    serviceType?: string;
    clientName?: string;
    createdAt?: Date;
    _id: string | object;
  }

  const typedBookings = allBookings as BookingDoc[];
  const totalRevenue = typedBookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  
  // Calculate monthly revenue
  const monthlyRevenue = (monthlyBookings as BookingDoc[]).reduce((sum, booking) => sum + (booking.totalCost || 0), 0);

  // Service breakdown
  const serviceBreakdown: Record<string, number> = {};
  typedBookings.forEach((booking) => {
    const service = booking.serviceType || "Other";
    serviceBreakdown[service] = (serviceBreakdown[service] || 0) + 1;
  });

  // Recent bookings
  const recentBookings = (recentBookingsData as BookingDoc[]).map((booking) => ({
    id: booking._id.toString(),
    clientName: booking.clientName || "Unknown",
    service: booking.serviceType || "Unknown",
    amount: booking.totalCost || 0,
    date: booking.createdAt || new Date(),
  }));

  return {
    totalUsers,
    totalBookings: totalBookingsCount,
    totalRevenue,
    activeUsers,
    monthlyStats: {
      bookings: monthlyBookings.length,
      revenue: monthlyRevenue,
      newUsers: monthlyUsers,
    },
    serviceBreakdown,
    recentBookings,
  };
};

/**
 * Get comprehensive analytics data with caching
 */
export const getAnalyticsData = unstable_cache(
  fetchAnalyticsData,
  ["analytics-dashboard"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.USERS, CACHE_TAGS.BOOKINGS],
  }
);

/**
 * Get revenue trends with caching
 */
export const getRevenueTrends = unstable_cache(
  async (period: "week" | "month" | "year" = "month") => {
    const collection = await getCollection("bookings");
    
    let dateFilter: Date;
    const now = new Date();
    
    switch (period) {
      case "week":
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case "year":
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const bookings = await collection.find({
      createdAt: { $gte: dateFilter }
    }).toArray();
    
    interface TrendBooking {
      totalCost?: number;
      createdAt?: Date;
    }
    
    return (bookings as TrendBooking[]).reduce((sum, booking) => 
      sum + (booking.totalCost || 0), 0
    );
  },
  ["revenue-trends"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.BOOKINGS],
  }
);

/**
 * Get user engagement metrics with caching
 */
export const getUserEngagementMetrics = unstable_cache(
  async () => {
    const data = await fetchAnalyticsData();
    return {
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      engagementRate: data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0,
      newUsersThisMonth: data.monthlyStats.newUsers,
    };
  },
  ["user-engagement-metrics"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.USERS, CACHE_TAGS.ANALYTICS],
  }
);