"use client";

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

interface ParentChartsProps {
  analytics: {
    registrationTrends: Array<{ month: string; registrations: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  };
}

const COLORS = {
  primary: "#90AC19",
  secondary: "#E8931A",
  accent: "#A25F97",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  neutral: "#6b7280",
};

export default function ParentCharts({ analytics }: ParentChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Registration Trends */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg font-semibold mb-4">
            Parent Registration Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="registrations"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name="Parent Registrations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Revenue from Parents */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg font-semibold mb-4">
            Monthly Revenue from Parents
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    formatCurrency(value || 0),
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.accent}
                  radius={[4, 4, 0, 0]}
                  name="Monthly Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
