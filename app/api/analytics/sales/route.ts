import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

// Get sales analytics data
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get date ranges
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Revenue metrics
    const revenueToday = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const revenueWeek = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const revenueMonth = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const revenueLastMonth = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const revenueYear = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Order type breakdown
    const orderTypeBreakdown = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: "$orderType",
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ])
      .toArray();

    // Daily revenue for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Monthly revenue for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Top selling products
    const topProducts = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: "$productId",
            title: { $first: "$productTitle" },
            soldCount: { $sum: "$quantity" },
            revenue: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: { revenue: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray();

    // Coupon usage stats
    const couponUsageStats = await db
      .collection("coupon_usage")
      .aggregate([
        {
          $match: {
            usedAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: "$couponCode",
            usageCount: { $sum: 1 },
            totalDiscount: { $sum: "$discountAmount" },
          },
        },
        {
          $sort: { usageCount: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    // Total discount given
    const totalDiscount = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            discountAmount: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$discountAmount" },
          },
        },
      ])
      .toArray();

    // Customer stats
    const totalCustomers = await db.collection("orders").distinct("userId", {
      paymentStatus: "paid",
    });

    const newCustomersMonth = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: "$userId",
            firstPurchase: { $min: "$createdAt" },
          },
        },
        {
          $match: {
            firstPurchase: { $gte: startOfMonth },
          },
        },
        {
          $count: "count",
        },
      ])
      .toArray();

    // Average order value
    const avgOrderValue = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            avgValue: { $avg: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Calculate month-over-month growth
    const currentMonthRevenue = revenueMonth[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
    const monthGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 100;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          today: {
            revenue: revenueToday[0]?.total || 0,
            orders: revenueToday[0]?.count || 0,
          },
          week: {
            revenue: revenueWeek[0]?.total || 0,
            orders: revenueWeek[0]?.count || 0,
          },
          month: {
            revenue: revenueMonth[0]?.total || 0,
            orders: revenueMonth[0]?.count || 0,
          },
          year: {
            revenue: revenueYear[0]?.total || 0,
            orders: revenueYear[0]?.count || 0,
          },
          monthGrowth: Math.round(monthGrowth * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue[0]?.avgValue || 0),
          totalCustomers: totalCustomers.length,
          newCustomersMonth: newCustomersMonth[0]?.count || 0,
          totalDiscountGiven: totalDiscount[0]?.total || 0,
        },
        orderTypeBreakdown: orderTypeBreakdown.map((item) => ({
          type: item._id || "unknown",
          count: item.count,
          revenue: item.revenue,
        })),
        dailyRevenue: dailyRevenue.map((item) => ({
          date: item._id,
          revenue: item.revenue,
          orders: item.orders,
        })),
        monthlyRevenue: monthlyRevenue.map((item) => ({
          month: item._id,
          revenue: item.revenue,
          orders: item.orders,
        })),
        topProducts: topProducts.map((item) => ({
          productId: item._id,
          title: item.title || "Unknown Product",
          soldCount: item.soldCount,
          revenue: item.revenue,
        })),
        couponUsage: couponUsageStats.map((item) => ({
          code: item._id,
          usageCount: item.usageCount,
          totalDiscount: item.totalDiscount,
        })),
      },
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
