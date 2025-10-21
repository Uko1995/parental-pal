import {
  UserGroupIcon,
  PlusIcon,
  AcademicCapIcon,
  HeartIcon,
  HomeIcon,
  CalendarIcon,
  SparklesIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { getChildren } from "./action";
import ChildrenTable from "./ChildrenTable";
import ChildrenCharts from "./ChildrenCharts";

export default async function ChildrenPage() {
  const { children, serviceStats, childrenStats } = await getChildren();
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

      {/* Interactive Charts */}
      <ChildrenCharts
        childrenData={children}
        serviceStats={serviceStats}
        childrenStats={childrenStats}
      />

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

      {/* Children Profiles with Filters */}
      <ChildrenTable childrenData={children} />
    </div>
  );
}
