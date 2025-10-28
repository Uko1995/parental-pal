"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { PaymentAnalytics } from "./page";

interface PaymentChartsProps {
  analytics: PaymentAnalytics;
}

// Chart colors based on ParentalPal brand
const COLORS = {
  primary: "#90AC19",
  secondary: "#E8931A",
  accent: "#A25F97",
  cream: "#FFEACF",
  success: "#16a34a",
  warning: "#ca8a04",
  error: "#dc2626",
  info: "#2563eb",
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.info,
  COLORS.warning,
  COLORS.error,
];

// Custom tooltip formatter
const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString()}`;
};

interface TooltipPayload {
  color: string;
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-3 rounded-lg shadow-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.dataKey}:{" "}
            {entry.dataKey.includes("amount") ||
            entry.dataKey.includes("revenue") ||
            entry.dataKey.includes("Revenue")
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PaymentCharts({ analytics }: PaymentChartsProps) {
  // Prepare status distribution data
  const statusData = analytics.paymentsByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    amount: item.amount,
  }));

  // Prepare service distribution data
  const serviceData = analytics.paymentsByService.map((item) => ({
    name: item.service,
    value: item.count,
    amount: item.amount,
  }));

  // Prepare payment method data
  const methodData = analytics.paymentMethodStats.map((item) => ({
    name: item.method
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
    amount: item.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100  shadow-lg rounded-2xl">
          <div className="stat-figure text-primary">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-2xl text-success">
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <div className="stat-desc">
            {analytics.totalPayments} payments processed
          </div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl">
          <div className="stat-figure text-warning">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Pending Amount</div>
          <div className="stat-value text-2xl text-warning">
            {formatCurrency(analytics.pendingAmount)}
          </div>
          <div className="stat-desc">
            {analytics.totalPayments - analytics.completedPayments} pending
          </div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl">
          <div className="stat-figure text-info">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Completed Payments</div>
          <div className="stat-value text-info">
            {analytics.completedPayments}
          </div>
          <div className="stat-desc">
            {analytics.totalPayments > 0
              ? `${(
                  (analytics.completedPayments / analytics.totalPayments) *
                  100
                ).toFixed(1)}% completion rate`
              : "No payments yet"}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl">
          <div className="stat-figure text-error">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Overdue Payments</div>
          <div className="stat-value text-2xl text-error">
            {analytics.overduePayments}
          </div>
          <div className="stat-desc">Requires immediate attention</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Monthly Revenue Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              Payment Status Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Revenue by Service</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    tickFormatter={formatCurrency}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="amount"
                    name="Revenue"
                    fill={COLORS.secondary}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Payment Methods Usage</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Usage Count"
                    fill={COLORS.accent}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
