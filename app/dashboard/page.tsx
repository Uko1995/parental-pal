import {
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

// Sample data - will be replaced with real data from API
const stats = [
  {
    name: "Total Revenue",
    value: "₦2,340,000",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: CurrencyDollarIcon,
  },
  {
    name: "Active Bookings",
    value: "156",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: CalendarDaysIcon,
  },
  {
    name: "Registered Parents",
    value: "1,240",
    change: "+15.3%",
    changeType: "positive" as const,
    icon: UsersIcon,
  },
  {
    name: "Conversion Rate",
    value: "68.4%",
    change: "-2.1%",
    changeType: "negative" as const,
    icon: ChartBarIcon,
  },
];

const recentBookings = [
  {
    id: "BK001",
    parentName: "Sarah Johnson",
    service: "Academic Tutoring",
    amount: "₦45,000",
    status: "confirmed",
    date: "2024-10-15",
  },
  {
    id: "BK002",
    parentName: "Michael Chen",
    service: "Daily Childcare",
    amount: "₦150,000",
    status: "pending",
    date: "2024-10-14",
  },
  {
    id: "BK003",
    parentName: "Amaka Okafor",
    service: "Holiday Camp",
    amount: "₦90,000",
    status: "in-progress",
    date: "2024-10-13",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#90AC19] to-[#E8931A] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-white/90 text-lg">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-base-content mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-xl">
                  <stat.icon className="w-6 h-6 text-[#90AC19]" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === "positive" ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-success mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-error mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-base-content/60 ml-2">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Recent Bookings</h2>
              <button className="btn btn-sm btn-outline btn-primary">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-base-50 rounded-lg hover:bg-base-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-base-content">
                        {booking.parentName}
                      </h3>
                      <span className="text-sm font-semibold text-[#90AC19]">
                        {booking.amount}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/60 mt-1">
                      {booking.service}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-base-content/50">
                        {booking.date}
                      </span>
                      <div
                        className={`badge badge-sm ${
                          booking.status === "confirmed"
                            ? "badge-success"
                            : booking.status === "pending"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Quick Actions</h2>

            <div className="grid grid-cols-2 gap-4">
              <button className="btn btn-outline btn-primary justify-start">
                <UsersIcon className="w-5 h-5 mr-2" />
                Add Tutor
              </button>
              <button className="btn btn-outline btn-secondary justify-start">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                New Booking
              </button>
              <button className="btn btn-outline btn-accent justify-start">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Process Payment
              </button>
              <button className="btn btn-outline btn-info justify-start">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                View Analytics
              </button>
            </div>

            {/* Recent Alerts */}
            <div className="mt-6">
              <h3 className="font-medium text-base-content mb-3">
                System Alerts
              </h3>
              <div className="space-y-2">
                <div className="alert alert-warning py-2">
                  <span className="text-sm">
                    3 payments are overdue - requires attention
                  </span>
                </div>
                <div className="alert alert-info py-2">
                  <span className="text-sm">
                    New tutor application received
                  </span>
                </div>
                <div className="alert alert-success py-2">
                  <span className="text-sm">
                    Monthly revenue target achieved!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Preview Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-lg">Revenue Overview</h2>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-outline">7 Days</button>
              <button className="btn btn-sm btn-primary">30 Days</button>
              <button className="btn btn-sm btn-outline">90 Days</button>
            </div>
          </div>

          {/* Placeholder for Chart */}
          <div className="h-64 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-[#90AC19] mx-auto mb-4" />
              <p className="text-lg font-medium text-base-content">
                Revenue Chart
              </p>
              <p className="text-sm text-base-content/60">
                Interactive charts will be displayed here using Chart.js
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
