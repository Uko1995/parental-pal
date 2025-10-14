"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getAnalyticsData,
  getMonthlyRevenueData,
  getServicePerformanceData,
  getUserEngagementMetrics,
} from "./action";

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

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

interface ServicePerformance {
  service: string;
  serviceType: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}

interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  engagementRate: number;
  newUsersThisMonth: number;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [servicePerformance, setServicePerformance] = useState<
    ServicePerformance[]
  >([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [analytics, monthly, services, engagement] = await Promise.all([
          getAnalyticsData(),
          getMonthlyRevenueData(),
          getServicePerformanceData(),
          getUserEngagementMetrics(),
        ]);

        setAnalyticsData(analytics);
        setMonthlyData(monthly);
        setServicePerformance(services);
        setUserEngagement(engagement);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = [
    "#90AC19",
    "#E8931A",
    "#A25F97",
    "#e83884",
    "#8B5CF6",
    "#06B6D4",
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-32"></div>
            <div className="skeleton h-4 w-64 mt-1"></div>
          </div>
          <div className="skeleton h-10 w-32"></div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-8 w-16"></div>
                    <div className="skeleton h-3 w-20"></div>
                  </div>
                  <div className="skeleton w-12 h-12 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="skeleton h-80 w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, tableIndex) => (
            <div key={tableIndex} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-40 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="skeleton h-4 w-32"></div>
                      <div className="skeleton h-4 w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and data visualization
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline btn-primary">Export Data</button>
          <button className="btn btn-primary">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-3 justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3  rounded-full">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.totalBookings || 0}
                </p>
              </div>
              <div className="p-3  rounded-full">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userEngagement?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3  rounded-full">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userEngagement?.engagementRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3  rounded-full">
                <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Monthly Revenue Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#90AC19"
                    radius={[4, 4, 0, 0]}
                    name="Monthly Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Service Performance Pie Chart */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Service Revenue Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicePerformance.map((item) => ({
                      ...item,
                      name: item.service,
                    }))}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {servicePerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name as string,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Service Performance Analytics</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th>Bookings</th>
                  <th>Total Revenue</th>
                  <th>Average Value</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {servicePerformance.map((service, index) => {
                  const isTop3 = index < 3;
                  return (
                    <tr key={service.serviceType}>
                      <td className="font-medium">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          {service.service}
                        </div>
                      </td>
                      <td>{service.bookings}</td>
                      <td className="font-semibold">
                        {formatCurrency(service.revenue)}
                      </td>
                      <td>{formatCurrency(service.averageValue)}</td>
                      <td>
                        <div
                          className={`badge ${
                            isTop3 ? "badge-success" : "badge-neutral"
                          }`}
                        >
                          {isTop3 ? (
                            <>
                              <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                              Top Performer
                            </>
                          ) : (
                            "Standard"
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.clientName}</td>
                    <td>{booking.service}</td>
                    <td className="font-semibold">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
