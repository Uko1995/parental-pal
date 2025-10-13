"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#90AC19",
  "#E8931A",
  "#A25F97",
  "#22C55E",
  "#3B82F6",
  "#EF4444",
];

interface RegistrationTrend {
  month: string;
  registrations: number;
}

interface SubjectDistribution {
  subject: string;
  count: number;
}

interface TutorChartsProps {
  registrationData: RegistrationTrend[];
  subjectData: SubjectDistribution[];
}

export default function TutorCharts({
  registrationData,
  subjectData,
}: TutorChartsProps) {
  return (
    <>
      {/* Registration Trends Chart */}
      <div className="col-span-1 lg:col-span-2">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              Tutor Registration Trends (2024)
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="registrations"
                    fill="#90AC19"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Distribution Chart */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Subject Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData.slice(0, 6).map((item) => ({
                    ...item,
                    name: item.subject,
                    value: item.count,
                  }))} // Show top 6 subjects
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {subjectData.slice(0, 6).map((entry, index) => (
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
  );
}
