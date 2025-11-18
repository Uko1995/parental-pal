"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface OrdersStats {
  typeBreakdown: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

interface OrdersChartsProps {
  orders: unknown[];
  stats: OrdersStats;
}

export default function OrdersCharts({ stats }: OrdersChartsProps) {
  // Type breakdown pie chart
  const typeData = {
    labels: stats.typeBreakdown.map((t) =>
      t.type === "softcopy" ? "PDF" : "Paperback"
    ),
    datasets: [
      {
        label: "Orders by Type",
        data: stats.typeBreakdown.map((t) => t.count),
        backgroundColor: ["rgba(162, 95, 151, 0.6)", "rgba(144, 172, 25, 0.6)"],
        borderColor: ["rgba(162, 95, 151, 1)", "rgba(144, 172, 25, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Status breakdown bar chart
  const statusData = {
    labels: stats.statusBreakdown.map(
      (s) => s.status.charAt(0).toUpperCase() + s.status.slice(1)
    ),
    datasets: [
      {
        label: "Orders by Status",
        data: stats.statusBreakdown.map((s) => s.count),
        backgroundColor: "rgba(144, 172, 25, 0.6)",
        borderColor: "rgba(144, 172, 25, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg">Orders by Type</h3>
          <div style={{ height: "300px" }}>
            <Pie data={typeData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg">Orders by Status</h3>
          <div style={{ height: "300px" }}>
            <Bar data={statusData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
