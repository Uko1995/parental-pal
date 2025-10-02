import {
  UserGroupIcon,
  PlusIcon,
  AcademicCapIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { getChildren } from "./action";

export default async function ChildrenPage() {
  const { children, serviceStats, childrenStats } = await getChildren();
  console.log(children, childrenStats);
  console.log(childrenStats.totalChildren);
  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="stat-desc">Children enrolled</div>
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
            <h2 className="card-title">Service Enrollment</h2>
            <div className="h-64 bg-gradient-to-r from-[#A25F97]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AcademicCapIcon className="w-16 h-16 text-[#A25F97] mx-auto mb-4" />
                <p className="font-medium">Service Breakdown Chart</p>
                <p className="text-sm text-gray-500">
                  Children by service type enrollment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Children Activity */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">Recent Children Profiles</h2>
            <button className="btn btn-sm btn-outline btn-primary">
              View All
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
                {children.map((child) => (
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
                      <button className="btn btn-ghost btn-xs">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
