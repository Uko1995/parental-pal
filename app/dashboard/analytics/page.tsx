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
  getSiteMonitoringData,
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

interface SiteMonitoring {
  totalPageViews: number;
  uniqueVisitors: number;
  pageViewsTrend: Array<{ date: string; views: number }>;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  signupsTrend: Array<{ date: string; signups: number }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [servicePerformance, setServicePerformance] = useState<
    ServicePerformance[]
  >([]);
  const [siteMonitoring, setSiteMonitoring] = useState<SiteMonitoring | null>(
    null
  );
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [analytics, monthly, services, engagement, monitoring] =
          await Promise.all([
            getAnalyticsData(),
            getMonthlyRevenueData(),
            getServicePerformanceData(),
            getUserEngagementMetrics(),
            getSiteMonitoringData(),
          ]);

        setAnalyticsData(analytics);
        setMonthlyData(monthly);
        setServicePerformance(services);
        setUserEngagement(engagement);
        setSiteMonitoring(monitoring);
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

      {/* Site Monitoring Section */}
      {siteMonitoring && (
        <>
          <div className="divider">
            <h2 className="text-2xl font-bold text-gray-900">
              Site Monitoring & Traffic
            </h2>
          </div>

          {/* Traffic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Page Views</p>
                    <p className="text-3xl font-bold">
                      {siteMonitoring.totalPageViews.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-75 mt-1">Last 30 days</p>
                  </div>
                  <ChartBarIcon className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>

            <div className="card bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Unique Visitors</p>
                    <p className="text-3xl font-bold">
                      {siteMonitoring.uniqueVisitors.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-75 mt-1">Last 30 days</p>
                  </div>
                  <UsersIcon className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>

            <div className="card bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">New Signups</p>
                    <p className="text-3xl font-bold">
                      {siteMonitoring.signupsTrend
                        .reduce((sum, item) => sum + item.signups, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs opacity-75 mt-1">Last 7 days</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Trends Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Trend */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  Page Views Trend (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={siteMonitoring.pageViewsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#90AC19" name="Page Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signups Trend */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  New Signups Trend (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={siteMonitoring.signupsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="signups" fill="#E8931A" name="Signups" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Pages and Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages Table */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  Top Pages (Last 30 Days)
                </h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th className="text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteMonitoring.topPages.map((page, index) => (
                        <tr key={index}>
                          <td className="font-mono text-xs">{page.page}</td>
                          <td className="text-right font-semibold">
                            {page.views.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Device Breakdown Pie Chart */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                  Device Breakdown (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={siteMonitoring.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => {
                        const { device, percent } = props as unknown as {
                          device: string;
                          percent: number;
                        };
                        return `${device}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="device"
                    >
                      {siteMonitoring.deviceBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

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
