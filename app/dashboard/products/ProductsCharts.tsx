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

interface Product {
  category: string;
  metrics?: {
    totalRevenue?: number;
    totalSales?: number;
  };
}

interface ProductsStats {
  categoryBreakdown: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

interface ProductsChartsProps {
  products: Product[];
  stats: ProductsStats;
}

export default function ProductsCharts({ stats }: ProductsChartsProps) {
  // Category breakdown pie chart
  const categoryData = {
    labels: stats.categoryBreakdown.map((cat) =>
      cat.category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    ),
    datasets: [
      {
        label: "Products by Category",
        data: stats.categoryBreakdown.map((cat) => cat.count),
        backgroundColor: [
          "rgba(144, 172, 25, 0.6)",
          "rgba(232, 147, 26, 0.6)",
          "rgba(162, 95, 151, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(144, 172, 25, 1)",
          "rgba(232, 147, 26, 1)",
          "rgba(162, 95, 151, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Revenue by category bar chart
  const revenueData = {
    labels: stats.categoryBreakdown.map((cat) =>
      cat.category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    ),
    datasets: [
      {
        label: "Revenue (₦)",
        data: stats.categoryBreakdown.map((cat) => cat.revenue),
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
          <h3 className="card-title text-lg">Products by Category</h3>
          <div style={{ height: "300px" }}>
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg">Revenue by Category</h3>
          <div style={{ height: "300px" }}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
