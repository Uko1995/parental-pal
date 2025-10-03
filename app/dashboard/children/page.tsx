import {
  UserGroupIcon,
  PlusIcon,
  AcademicCapIcon,
  HeartIcon,
  HomeIcon,
  CalendarIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { getChildrenPaginated } from "./action";
import Link from "next/link";
import ChildActions from "./ChildActions";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ChildrenPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const { children, serviceStats, childrenStats, pagination } =
    await getChildrenPaginated(currentPage, 10);
  return (
    <div className="space-y-6 scroll-smooth">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children</h1>
          <p className="text-gray-600 mt-1">
            Manage children profiles, learning progress, and care preferences
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Child Profile
        </button>
      </div>

      {/* Children Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6">
        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-primary">
            <UserGroupIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Children</div>
          <div className="stat-value text-primary">
            {childrenStats.totalChildren}
          </div>
          <div className="stat-desc">Enrolled in services</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-secondary">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">In Tutoring</div>
          <div className="stat-value text-secondary">
            {serviceStats.find((s) => s.serviceType === "tutoring")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Academic support</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-accent">
            <HeartIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">In Childcare</div>
          <div className="stat-value text-accent">
            {serviceStats.find((s) => s.serviceType === "childcare")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Daily care</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-orange-500">
            <HomeIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Homeschooling</div>
          <div className="stat-value text-orange-500">
            {serviceStats.find((s) => s.serviceType === "homeschooling")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Home education</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-green-500">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Holiday Camps</div>
          <div className="stat-value text-green-500">
            {serviceStats.find((s) => s.serviceType === "holiday-camps")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Seasonal programs</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-purple-500">
            <SparklesIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Enrichment</div>
          <div className="stat-value text-purple-500">
            {serviceStats.find((s) => s.serviceType === "kiddies-enrichment")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Skills & activities</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-cyan-500">
            <BuildingOfficeIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Space Rental</div>
          <div className="stat-value text-cyan-500">
            {serviceStats.find((s) => s.serviceType === "space-rental")
              ?.childrenCount || 0}
          </div>
          <div className="stat-desc">Event hosting</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-info">
            <UserGroupIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Age Groups</div>
          <div className="stat-value text-info">
            {childrenStats.ageRange.youngest} - {childrenStats.ageRange.oldest}
          </div>
          <div className="stat-desc">Years old range</div>
        </div>
      </div>

      {/* Age Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Age Distribution</h2>
            <div className="h-64 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="w-16 h-16 text-[#90AC19] mx-auto mb-4" />
                <p className="font-medium">Age Distribution Chart</p>
                <p className="text-sm text-gray-500">
                  Chart.js pie chart showing age groups
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Service Enrollment Distribution</h2>
            <div className="h-64 bg-gradient-to-r from-[#A25F97]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AcademicCapIcon className="w-16 h-16 text-[#A25F97] mx-auto mb-4" />
                <p className="font-medium">Service Breakdown Chart</p>
                <p className="text-sm text-gray-500">
                  All service types enrollment distribution
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tutoring • Childcare • Homeschooling • Camps • Enrichment •
                  Space Rental
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Enrollment Breakdown */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Service Enrollment Breakdown</h2>
          <p className="text-gray-600 mb-4">
            Children enrollment statistics by service type
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStats.map((stat) => {
              const getServiceConfig = (type: string) => {
                switch (type) {
                  case "tutoring":
                    return {
                      icon: <AcademicCapIcon className="w-6 h-6" />,
                      color: "bg-blue-500",
                      textColor: "text-blue-700",
                      bgColor: "bg-blue-50",
                      label: "Academic Tutoring",
                    };
                  case "childcare":
                    return {
                      icon: <HeartIcon className="w-6 h-6" />,
                      color: "bg-pink-500",
                      textColor: "text-pink-700",
                      bgColor: "bg-pink-50",
                      label: "Daily Childcare",
                    };
                  case "homeschooling":
                    return {
                      icon: <HomeIcon className="w-6 h-6" />,
                      color: "bg-orange-500",
                      textColor: "text-orange-700",
                      bgColor: "bg-orange-50",
                      label: "Home Education",
                    };
                  case "holiday-camps":
                    return {
                      icon: <CalendarIcon className="w-6 h-6" />,
                      color: "bg-green-500",
                      textColor: "text-green-700",
                      bgColor: "bg-green-50",
                      label: "Holiday Programs",
                    };
                  case "kiddies-enrichment":
                    return {
                      icon: <SparklesIcon className="w-6 h-6" />,
                      color: "bg-purple-500",
                      textColor: "text-purple-700",
                      bgColor: "bg-purple-50",
                      label: "Skills Enrichment",
                    };
                  case "space-rental":
                    return {
                      icon: <BuildingOfficeIcon className="w-6 h-6" />,
                      color: "bg-cyan-500",
                      textColor: "text-cyan-700",
                      bgColor: "bg-cyan-50",
                      label: "Space Rental",
                    };
                  default:
                    return {
                      icon: <UserGroupIcon className="w-6 h-6" />,
                      color: "bg-gray-500",
                      textColor: "text-gray-700",
                      bgColor: "bg-gray-50",
                      label: stat.serviceType,
                    };
                }
              };

              const config = getServiceConfig(stat.serviceType);

              return (
                <div
                  key={stat.serviceType}
                  className={`p-4 rounded-lg border ${config.bgColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-2 rounded-lg text-white ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <h3 className={`font-medium ${config.textColor}`}>
                          {config.label}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Children Enrolled:
                      </span>
                      <span className={`font-bold ${config.textColor}`}>
                        {stat.childrenCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Bookings:
                      </span>
                      <span className={`font-bold ${config.textColor}`}>
                        {stat.totalBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Avg. Bookings/Child:
                      </span>
                      <span className={`font-bold ${config.textColor}`}>
                        {stat.childrenCount > 0
                          ? (stat.totalBookings / stat.childrenCount).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {serviceStats.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No service enrollment data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Children Profiles */}
      <div
        id="children-list"
        className="card bg-base-100 shadow-lg scroll-mt-10"
      >
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="card-title">Children Profiles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                {pagination.totalChildren === 0 ? (
                  "0 - 0"
                ) : (
                  <>
                    {(pagination.currentPage - 1) * pagination.childrenPerPage +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      pagination.currentPage * pagination.childrenPerPage,
                      pagination.totalChildren
                    )}
                  </>
                )}{" "}
                of {pagination.totalChildren} children
                {pagination.totalPages > 1 && (
                  <span>
                    {" "}
                    • Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                )}
              </p>
            </div>
            <button className="btn btn-sm btn-outline btn-primary">
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Child
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Parent</th>
                  <th>Services</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        No children found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {pagination.currentPage > 1
                          ? "Try going to a different page or check the first page"
                          : "Add some children profiles to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  children.map((child) => (
                    <tr key={child.childId}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-bold">{child.name}</div>
                            <div className="text-sm opacity-50">
                              {child.class}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{child.age}</td>
                      <td>{child.parentName}</td>
                      <td>
                        <div className="flex space-x-1 flex-wrap gap-1">
                          {child.services && child.services.length > 0 ? (
                            child.services.map((service, index) => (
                              <div
                                key={index}
                                className="badge badge-primary badge-sm"
                              >
                                {service.serviceType}
                              </div>
                            ))
                          ) : (
                            <div className="badge badge-ghost badge-sm">
                              No Services yet
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>
                        <ChildActions child={child} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.childrenPerPage + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.childrenPerPage,
                  pagination.totalChildren
                )}{" "}
                of {pagination.totalChildren} children
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                {pagination.hasPrevPage ? (
                  <Link
                    href={`/dashboard/children?page=${
                      pagination.currentPage - 1
                    }#children-list`}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </Link>
                ) : (
                  <button
                    className="btn btn-sm btn-outline btn-disabled"
                    disabled
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                )}

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      pagination.currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    const endPage = Math.min(
                      pagination.totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    // Adjust start if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <Link
                          key={1}
                          href={`/dashboard/children?page=1#children-list`}
                          className="btn btn-sm btn-outline"
                        >
                          1
                        </Link>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                    }

                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Link
                          key={i}
                          href={`/dashboard/children?page=${i}#children-list`}
                          className={`btn btn-sm ${
                            i === pagination.currentPage
                              ? "btn-primary"
                              : "btn-outline"
                          }`}
                        >
                          {i}
                        </Link>
                      );
                    }

                    // Add last page and ellipsis if needed
                    if (endPage < pagination.totalPages) {
                      if (endPage < pagination.totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <Link
                          key={pagination.totalPages}
                          href={`/dashboard/children?page=${pagination.totalPages}#children-list`}
                          className="btn btn-sm btn-outline"
                        >
                          {pagination.totalPages}
                        </Link>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Button */}
                {pagination.hasNextPage ? (
                  <Link
                    href={`/dashboard/children?page=${
                      pagination.currentPage + 1
                    }#children-list`}
                    className="btn btn-sm btn-outline"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <button
                    className="btn btn-sm btn-outline btn-disabled"
                    disabled
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
