import { ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
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

      {/* Charts and Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Revenue Analytics</h2>
            <div className="h-64 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <CurrencyDollarIcon className="w-16 h-16 text-[#90AC19] mx-auto mb-4" />
                <p className="font-medium">Chart.js Revenue Chart</p>
                <p className="text-sm text-gray-500">
                  Interactive revenue tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Service Performance</h2>
            <div className="h-64 bg-gradient-to-r from-[#A25F97]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-[#A25F97] mx-auto mb-4" />
                <p className="font-medium">Chart.js Performance Chart</p>
                <p className="text-sm text-gray-500">Service booking trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Analytics Data Tables</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Academic Tutoring</td>
                  <td>125</td>
                  <td>₦1,875,000</td>
                  <td className="text-success">+15%</td>
                </tr>
                <tr>
                  <td>Daily Childcare</td>
                  <td>89</td>
                  <td>₦445,000</td>
                  <td className="text-success">+8%</td>
                </tr>
                <tr>
                  <td>Holiday Camps</td>
                  <td>34</td>
                  <td>₦1,020,000</td>
                  <td className="text-error">-3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
