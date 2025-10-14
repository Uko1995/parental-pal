import { Suspense } from "react";
import {
  UsersIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  IdentificationIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { getParentsData, getParentAnalytics } from "./action";
import ParentCharts from "./ParentCharts";
import ParentsTable from "./ParentsTable";

export default async function ParentsPage() {
  // Fetch data in parallel
  const [parentsData, analytics] = await Promise.all([
    getParentsData(),
    getParentAnalytics(),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Parents Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage parent accounts, children, and service preferences
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Parent Account
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Parents
                </h3>
                <p className="text-3xl font-bold text-[#90AC19]">
                  {analytics.totalParents}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.activeParents} active
                </p>
              </div>
              <div className="p-3 bg-[#90AC19]/10 rounded-full">
                <UsersIcon className="w-8 h-8 text-[#90AC19]" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Children
                </h3>
                <p className="text-3xl font-bold text-[#E8931A]">
                  {analytics.totalChildren}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {analytics.averageChildrenPerParent} per parent
                </p>
              </div>
              <div className="p-3 bg-[#E8931A]/10 rounded-full">
                <UserGroupIcon className="w-8 h-8 text-[#E8931A]" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold text-[#A25F97]">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  From all parent bookings
                </p>
              </div>
              <div className="p-3 bg-[#A25F97]/10 rounded-full">
                <CurrencyDollarIcon className="w-8 h-8 text-[#A25F97]" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Premium Members
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.membershipDistribution.find(
                    (m: { type: string; count: number }) => m.type === "Premium"
                  )?.count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Premium subscriptions
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <IdentificationIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="skeleton h-6 w-48 mb-4"></div>
                  <div className="skeleton h-80 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ParentCharts analytics={analytics} />
      </Suspense>

      {/* Parents Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Parents</h2>
          <div className="text-sm text-gray-600">
            Manage parent accounts and view detailed information
          </div>
        </div>

        <Suspense
          fallback={
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                {/* Search and filters skeleton */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="skeleton h-12 flex-1"></div>
                  <div className="flex gap-4">
                    <div className="skeleton h-12 w-40"></div>
                    <div className="skeleton h-12 w-32"></div>
                  </div>
                </div>

                {/* Results info skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="skeleton h-4 w-40"></div>
                  <div className="skeleton h-4 w-32"></div>
                </div>

                {/* Table skeleton */}
                <div className="space-y-4">
                  {/* Table header */}
                  <div className="grid grid-cols-6 gap-4 p-4 bg-base-200 rounded">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-16"></div>
                    <div className="skeleton h-4 w-16"></div>
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-16"></div>
                    <div className="skeleton h-4 w-16"></div>
                  </div>

                  {/* Table rows */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-6 gap-4 p-4 border-b"
                    >
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-8 h-8 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="skeleton h-4 w-24"></div>
                          <div className="skeleton h-3 w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="skeleton h-3 w-32"></div>
                        <div className="skeleton h-3 w-24"></div>
                      </div>
                      <div className="skeleton h-4 w-20"></div>
                      <div className="skeleton h-4 w-16"></div>
                      <div className="skeleton h-6 w-16 rounded-full"></div>
                      <div className="skeleton h-6 w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <ParentsTable initialParents={parentsData} />
        </Suspense>
      </div>
    </div>
  );
}
