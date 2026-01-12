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
    recentBookingsData,
  ] = await Promise.all([
    usersCollection.countDocuments({}),
    bookingsCollection.countDocuments({}),
    bookingsCollection.find({}).toArray(),
    usersCollection.countDocuments({ isActive: { $ne: false } }),
    bookingsCollection.find({ createdAt: { $gte: startOfMonth } }).toArray(),
    usersCollection.countDocuments({ createdAt: { $gte: startOfMonth } }),
    bookingsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  // Calculate total revenue using our actual schema
  interface BookingDoc {
    pricing?: {
      totalAmount?: number;
    };
    payment?: {
      status?: string;
    };
    serviceType?: string;
    parentName?: string;
    createdAt?: Date;
    status?: string;
    _id: string | object;
  }

  const typedBookings = allBookings as BookingDoc[];
  // Only count PAID bookings for total revenue
  const totalRevenue = typedBookings
    .filter((booking) => booking.payment?.status === "paid")
    .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

  // Calculate monthly revenue - only PAID bookings
  const monthlyRevenue = (monthlyBookings as BookingDoc[])
    .filter((booking) => booking.payment?.status === "paid")
    .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

  // Service breakdown
  const serviceBreakdown: Record<string, number> = {};
  typedBookings.forEach((booking) => {
    const service = booking.serviceType || "Other";
    serviceBreakdown[service] = (serviceBreakdown[service] || 0) + 1;
  });

  // Recent bookings
  const recentBookings = (recentBookingsData as BookingDoc[]).map(
    (booking) => ({
      id: booking._id.toString(),
      clientName: booking.parentName || "Unknown",
      service: booking.serviceType || "Unknown",
      amount: booking.pricing?.totalAmount || 0,
      date: booking.createdAt || new Date(),
    })
  );

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

    const bookings = await collection
      .find({
        createdAt: { $gte: dateFilter },
      })
      .toArray();

    interface TrendBooking {
      pricing?: {
        totalAmount?: number;
      };
      createdAt?: Date;
    }

    return (bookings as TrendBooking[]).reduce(
      (sum, booking) => sum + (booking.pricing?.totalAmount || 0),
      0
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
      engagementRate:
        data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0,
      newUsersThisMonth: data.monthlyStats.newUsers,
    };
  },
  ["user-engagement-metrics"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.USERS, CACHE_TAGS.ANALYTICS],
  }
);

/**
 * Get monthly revenue data for charts
 */
export const getMonthlyRevenueData = unstable_cache(
  async () => {
    const bookingsCollection = await getCollection("bookings");
    const currentYear = new Date().getFullYear();

    interface MonthlyData {
      _id: { month: number };
      revenue: number;
      bookings: number;
    }

    const monthlyData = (await bookingsCollection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
            "payment.status": "paid",
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            revenue: { $sum: "$pricing.totalAmount" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ])
      .toArray()) as MonthlyData[];

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

    return monthNames.map((name, index) => {
      const monthData = monthlyData.find(
        (item) => item._id.month === index + 1
      );
      return {
        month: name,
        revenue: monthData?.revenue || 0,
        bookings: monthData?.bookings || 0,
      };
    });
  },
  ["monthly-revenue-data"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.BOOKINGS],
  }
);

/**
 * Get service performance data
 */
export const getServicePerformanceData = unstable_cache(
  async () => {
    const bookingsCollection = await getCollection("bookings");

    interface ServiceData {
      _id: string;
      revenue: number;
      bookings: number;
      averageValue: number;
    }

    const serviceData = (await bookingsCollection
      .aggregate([
        {
          $match: {
            "payment.status": "paid",
          },
        },
        {
          $group: {
            _id: "$serviceType",
            revenue: { $sum: "$pricing.totalAmount" },
            bookings: { $sum: 1 },
            averageValue: { $avg: "$pricing.totalAmount" },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .toArray()) as ServiceData[];

    const serviceNames: { [key: string]: string } = {
      tutoring: "Academic Tutoring",
      childcare: "Daily Childcare",
      homeschooling: "Homeschooling Support",
      "holiday-camps": "Holiday Camp",
      "space-rental": "Event Space Rental",
      "kiddies-enrichment": "Kids Enrichment",
    };

    return serviceData.map((item) => ({
      service: serviceNames[item._id] || item._id,
      serviceType: item._id,
      revenue: item.revenue || 0,
      bookings: item.bookings || 0,
      averageValue: item.averageValue || 0,
    }));
  },
  ["service-performance-data"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.BOOKINGS],
  }
);

// Site Monitoring - Page Views and Traffic
export const getSiteMonitoringData = unstable_cache(
  async () => {
    const analyticsCollection = await getCollection("analyticsevents");
    const sessionsCollection = await getCollection("analyticssessions");

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Total page views (last 30 days)
    const totalPageViews = await analyticsCollection.countDocuments({
      eventType: "page_view",
      timestamp: { $gte: last30Days },
    });

    // Unique visitors (unique sessions)
    const uniqueVisitors = await sessionsCollection.countDocuments({
      startTime: { $gte: last30Days },
    });

    // Page views by day (last 7 days)
    const pageViewsTrend = await analyticsCollection
      .aggregate([
        {
          $match: {
            eventType: "page_view",
            timestamp: { $gte: last7Days },
          },
        },
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

    // Top pages
    const topPages = await analyticsCollection
      .aggregate([
        {
          $match: {
            eventType: "page_view",
            timestamp: { $gte: last30Days },
          },
        },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    // Device breakdown
    const deviceBreakdown = await sessionsCollection
      .aggregate([
        {
          $match: {
            startTime: { $gte: last30Days },
          },
        },
        {
          $group: {
            _id: "$deviceType",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Signups over time (last 7 days)
    const usersCollection = await getCollection("users");
    const signupsTrend = await usersCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: last7Days },
          },
        },
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

    return {
      totalPageViews,
      uniqueVisitors,
      pageViewsTrend: pageViewsTrend.map((item) => ({
        date: (item as { _id: string; count: number })._id,
        views: (item as { _id: string; count: number }).count,
      })),
      topPages: topPages.map((item) => ({
        page: (item as { _id: string; views: number })._id,
        views: (item as { _id: string; views: number }).views,
      })),
      deviceBreakdown: deviceBreakdown.map((item) => ({
        device:
          (item as { _id: string | null; count: number })._id || "Unknown",
        count: (item as { _id: string | null; count: number }).count,
      })),
      signupsTrend: signupsTrend.map((item) => ({
        date: (item as { _id: string; count: number })._id,
        signups: (item as { _id: string; count: number }).count,
      })),
    };
  },
  ["site-monitoring-data"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.ANALYTICS],
  }
);
