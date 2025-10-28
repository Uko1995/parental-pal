"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { UserGroupIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

interface Child {
  childId?: string;
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
  subjects?: string[];
  parentId: string;
  parentName: string | null;
  parentEmail: string | null;
  services: Array<{
    serviceType: string;
    status: string;
    bookingId: string;
    createdAt: Date;
  }>;
}

interface ChildrenChartsProps {
  childrenData: Child[];
  serviceStats: Array<{
    serviceType: string;
    childrenCount: number;
    totalBookings: number;
  }>;
  childrenStats: {
    totalChildren: number;
    averageAge: number;
    ageRange: { youngest: number; oldest: number };
    ageGroups: Record<string, number>;
    schoolDistribution: Record<string, number>;
    serviceStats: Array<{
      serviceType: string;
      childrenCount: number;
      totalBookings: number;
    }>;
  };
}

const COLORS = {
  primary: "#90AC19",
  secondary: "#E8931A",
  accent: "#A25F97",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F59E0B",
  cyan: "#06B6D4",
  gray: "#6B7280",
};

const COLOR_PALETTE = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.blue,
  COLORS.green,
  COLORS.purple,
  COLORS.pink,
  COLORS.orange,
  COLORS.cyan,
  COLORS.gray,
];

export default function ChildrenCharts({
  childrenData,
  serviceStats,
  childrenStats,
}: ChildrenChartsProps) {
  // Prepare age distribution data
  const ageDistributionData = useMemo(() => {
    const ageGroups: Record<string, number> = {};

    childrenData.forEach((child) => {
      let ageGroup: string;
      if (child.age <= 2) {
        ageGroup = "0-2 years";
      } else if (child.age <= 5) {
        ageGroup = "3-5 years";
      } else if (child.age <= 10) {
        ageGroup = "6-10 years";
      } else if (child.age <= 15) {
        ageGroup = "11-15 years";
      } else {
        ageGroup = "16+ years";
      }

      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
    });

    return Object.entries(ageGroups).map(([ageGroup, count]) => ({
      name: ageGroup,
      value: count,
      percentage: Math.round((count / childrenData.length) * 100),
    }));
  }, [childrenData]); // Prepare service distribution data
  const serviceDistributionData = useMemo(() => {
    return serviceStats.map((stat, index) => ({
      name:
        stat.serviceType.charAt(0).toUpperCase() +
        stat.serviceType.slice(1).replace("-", " "),
      children: stat.childrenCount,
      bookings: stat.totalBookings,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));
  }, [serviceStats]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution Chart */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Age Distribution
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Distribution of children across different age groups
          </p>

          {ageDistributionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="w-16 h-16 text-[#90AC19] mx-auto mb-4" />
                <p className="font-medium">No Data Available</p>
                <p className="text-sm text-gray-500">
                  Add children to see age distribution
                </p>
              </div>
            </div>
          )}

          {/* Age Statistics */}
          {childrenData.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {Math.round(childrenStats.averageAge * 10) / 10}
                </div>
                <div className="text-xs text-gray-500">Avg Age</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">
                  {childrenStats.ageRange.youngest}
                </div>
                <div className="text-xs text-gray-500">Youngest</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {childrenStats.ageRange.oldest}
                </div>
                <div className="text-xs text-gray-500">Oldest</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Enrollment Distribution Chart */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5" />
            Service Enrollment Distribution
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Children and bookings distribution across service types
          </p>

          {serviceDistributionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceDistributionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="children"
                    fill={COLORS.primary}
                    name="Children"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="bookings"
                    fill={COLORS.secondary}
                    name="Bookings"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-[#A25F97]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AcademicCapIcon className="w-16 h-16 text-[#A25F97] mx-auto mb-4" />
                <p className="font-medium">No Service Data Available</p>
                <p className="text-sm text-gray-500">
                  Services will appear here when children are enrolled
                </p>
              </div>
            </div>
          )}

          {/* Service Statistics */}
          {serviceDistributionData.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Most Popular Service:</span>
                  <div className="text-primary">
                    {
                      serviceDistributionData.reduce((max, service) =>
                        service.children > max.children ? service : max
                      ).name
                    }
                  </div>
                </div>
                <div>
                  <span className="font-medium">Total Services:</span>
                  <div className="text-secondary">
                    {serviceDistributionData.length} types
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
