"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
} from "recharts";
import { BanknotesIcon } from "@heroicons/react/24/outline";

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

interface DashboardData {
  stats: DashboardStats;
  revenueData: RevenueData[];
  recentBookings: RecentBooking[];
}

// Memoized Stats Cards Component
const StatsCards = memo(({ stats }: { stats: DashboardStats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const statItems = useMemo(
    () => [
      {
        name: "Total Revenue (Paid)",
        value: formatCurrency(stats.totalRevenue),
        change: formatChange(stats.revenueChange),
        changeType: stats.revenueChange >= 0 ? "positive" : "negative",
        icon: BanknotesIcon,
        color: "text-green-600",
      },
      {
        name: "Pending Payments",
        value: formatCurrency(stats.pendingPayments),
        change: formatChange(stats.pendingChange),
        changeType: stats.pendingChange >= 0 ? "positive" : "negative",
        icon: BanknotesIcon,
        color: "text-orange-600",
      },
      {
        name: "Active Bookings",
        value: stats.activeBookings.toString(),
        change: formatChange(stats.bookingsChange),
        changeType: stats.bookingsChange >= 0 ? "positive" : "negative",
        icon: CalendarDaysIcon,
        color: "text-blue-600",
      },
      {
        name: "New Parents",
        value: stats.totalParents.toString(),
        change: formatChange(stats.parentsChange),
        changeType: stats.parentsChange >= 0 ? "positive" : "negative",
        icon: UsersIcon,
        color: "text-purple-600",
      },
      {
        name: "Conversion Rate",
        value: `${stats.conversionRate.toFixed(1)}%`,
        change: formatChange(stats.conversionChange),
        changeType: stats.conversionChange >= 0 ? "positive" : "negative",
        icon: ChartBarIcon,
        color: "text-yellow-600",
      },
    ],
    [stats]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="card bg-base-100 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center flex-col mt-2">
                    {stat.changeType === "positive" ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      from last period
                    </span>
                  </div>
                </div>
                <div className={`p-3 `}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

StatsCards.displayName = "StatsCards";

// Memoized Revenue Chart Component
const RevenueChart = memo(
  ({
    revenueData,
    selectedInterval,
    onIntervalChange,
  }: {
    revenueData: RevenueData[];
    selectedInterval: string;
    onIntervalChange: (interval: string) => void;
  }) => {
    const intervals = useMemo(
      () => [
        { label: "7 Days", value: "7days" },
        { label: "1 Month", value: "month" },
        { label: "1 Year", value: "year" },
      ],
      []
    );

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Custom tooltip that will show revenue and bookings count from API
    const CustomTooltip = ({
      active,
      payload,
      label,
    }: {
      active?: boolean;
      payload?: Array<{ value: number; name: string }>;
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border">
            <p className="font-medium">{label}</p>
            <p className="text-[#90AC19]">
              Revenue: {formatCurrency(payload[0]?.value || 0)}
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="card bg-base-100 p-2 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-lg">Revenue Overview</h2>
            <div className="flex flex-wrap gap-2">
              {intervals.map((interval) => (
                <button
                  key={interval.value}
                  className={`btn btn-sm ${
                    selectedInterval === interval.value
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  onClick={() => onIntervalChange(interval.value)}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  interval={selectedInterval === "month" ? 2 : 0}
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-NG", {
                      notation: "compact",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#90AC19"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
);

RevenueChart.displayName = "RevenueChart";

// Memoized Recent Bookings Component
const RecentBookingsTable = memo(
  ({ bookings }: { bookings: RecentBooking[] }) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const getStatusBadge = (status: string) => {
      const statusClasses = {
        confirmed: "badge-success",
        pending: "badge-warning",
        completed: "badge-info",
        cancelled: "badge-error",
      };

      return (
        <span
          className={`badge ${
            statusClasses[status as keyof typeof statusClasses] || "badge-ghost"
          }`}
        >
          {status}
        </span>
      );
    };

    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.parentName}</td>
                    <td className="capitalize">{booking.service}</td>
                    <td className="font-semibold">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td className="text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

RecentBookingsTable.displayName = "RecentBookingsTable";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("month");

  const fetchDashboardData = useCallback(
    async (interval?: string) => {
      try {
        setLoading(true);
        const intervalToUse = interval || selectedInterval;
        const response = await fetch(
          `/api/dashboard?interval=${intervalToUse}`
        );
        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedInterval]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle interval change without full re-render
  const handleIntervalChange = useCallback(
    (newInterval: string) => {
      setSelectedInterval(newInterval);
      fetchDashboardData(newInterval);
    },
    [fetchDashboardData]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="skeleton h-8 w-64"></div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-8 w-16"></div>
                    <div className="skeleton h-3 w-24"></div>
                  </div>
                  <div className="skeleton w-12 h-12 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Recent Activity Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="skeleton h-80 w-full"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-40 mb-4"></div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="skeleton w-10 h-10 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-3 w-3/4"></div>
                      </div>
                      <div className="skeleton h-6 w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="alert alert-error">
          <span>
            Failed to load dashboard data. Please try refreshing the page.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base">
              Here&apos;s what&apos;s happening today.
            </p>
          </div>
        </div>
      </div>

      {/* Memoized Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Memoized Revenue Chart */}
      <RevenueChart
        revenueData={dashboardData.revenueData}
        selectedInterval={selectedInterval}
        onIntervalChange={handleIntervalChange}
      />

      {/* Memoized Recent Activity */}
      <RecentBookingsTable bookings={dashboardData.recentBookings} />
    </div>
  );
}
