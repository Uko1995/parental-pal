"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  summary: {
    today: { revenue: number; orders: number };
    week: { revenue: number; orders: number };
    month: { revenue: number; orders: number };
    year: { revenue: number; orders: number };
    monthGrowth: number;
    avgOrderValue: number;
    totalCustomers: number;
    newCustomersMonth: number;
    totalDiscountGiven: number;
  };
  orderTypeBreakdown: Array<{ type: string; count: number; revenue: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{
    productId: string;
    title: string;
    soldCount: number;
    revenue: number;
  }>;
  couponUsage: Array<{
    code: string;
    usageCount: number;
    totalDiscount: number;
  }>;
}

const COLORS = ["#90AC19", "#E8931A", "#A25F97", "#3B82F6", "#10B981"];

export default function SalesAnalyticsPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("daily");

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics/sales");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-300 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Failed to load analytics data
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="w-7 h-7 text-[#90AC19]" />
            Sales Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Track your store&apos;s performance
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 sm:mt-0 btn btn-sm btn-outline"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.summary.today.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.today.orders} orders
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.summary.week.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.week.orders} orders
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.summary.month.revenue)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {data.summary.monthGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    data.summary.monthGrowth >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {data.summary.monthGrowth >= 0 ? "+" : ""}
                  {data.summary.monthGrowth}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Year to Date</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.summary.year.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.year.orders} total orders
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <CurrencyDollarIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserGroupIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-xl font-bold text-gray-900">
              {data.summary.totalCustomers}
            </p>
            <p className="text-xs text-green-600">
              +{data.summary.newCustomersMonth} this month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(data.summary.avgOrderValue)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <TagIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Discounts Given</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(data.summary.totalDiscountGiven)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("daily")}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timeRange === "daily"
                    ? "bg-[#90AC19] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timeRange === "monthly"
                    ? "bg-[#90AC19] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={
                timeRange === "daily" ? data.dailyRevenue : data.monthlyRevenue
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={timeRange === "daily" ? "date" : "month"}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeRange === "daily") {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }
                  return value;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value) || 0),
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#90AC19"
                strokeWidth={2}
                dot={{ fill: "#90AC19" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Type Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Order Type Breakdown (This Month)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.orderTypeBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="revenue"
                nameKey="type"
                label={({ name, percent }) =>
                  `${name === "softcopy" ? "PDF" : "Paperback"} ${(
                    (percent || 0) * 100
                  ).toFixed(0)}%`
                }
              >
                {data.orderTypeBreakdown.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value) || 0),
                  name === "softcopy" ? "PDF" : "Paperback",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Top Selling Products
          </h2>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No sales data yet
              </p>
            ) : (
              data.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-amber-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.soldCount} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#90AC19]">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coupon Usage */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Top Coupons (This Month)
          </h2>
          {data.couponUsage.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No coupon usage this month
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.couponUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "usageCount"
                      ? `${value} uses`
                      : formatCurrency(Number(value) || 0),
                    name === "usageCount" ? "Uses" : "Discount Given",
                  ]}
                />
                <Bar dataKey="usageCount" fill="#90AC19" name="Uses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
