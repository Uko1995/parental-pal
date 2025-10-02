import {
  BuildingOfficeIcon,
  PlusIcon,
  AcademicCapIcon,
  HeartIcon,
  CalendarDaysIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">
            Manage all service offerings, pricing, and availability
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline btn-secondary">
            <EyeIcon className="w-5 h-5 mr-2" />
            Preview Catalog
          </button>
          <button className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Service
          </button>
        </div>
      </div>

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-primary">
            <BuildingOfficeIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Services</div>
          <div className="stat-value text-primary">12</div>
          <div className="stat-desc">Active offerings</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-secondary">
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Most Popular</div>
          <div className="stat-value text-secondary text-lg">Tutoring</div>
          <div className="stat-desc">156 bookings this month</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-accent">
            <StarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Avg Rating</div>
          <div className="stat-value text-accent">4.8</div>
          <div className="stat-desc">Out of 5.0 stars</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-success">
            <BuildingOfficeIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Revenue</div>
          <div className="stat-value text-success text-lg">₦2.3M</div>
          <div className="stat-desc">This month</div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-[#90AC19]/10 to-[#90AC19]/5 shadow-lg border border-[#90AC19]/20">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <AcademicCapIcon className="w-12 h-12 text-[#90AC19]" />
              <div className="badge badge-success">Active</div>
            </div>
            <h2 className="card-title text-[#90AC19]">Academic Tutoring</h2>
            <p className="text-gray-600">
              One-on-one personalized tutoring sessions
            </p>
            <div className="card-actions justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold">₦15,000/hour</span>
              </div>
              <div className="flex space-x-1">
                <button className="btn btn-sm btn-ghost">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-ghost">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-[#E8931A]/10 to-[#E8931A]/5 shadow-lg border border-[#E8931A]/20">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <HeartIcon className="w-12 h-12 text-[#E8931A]" />
              <div className="badge badge-success">Active</div>
            </div>
            <h2 className="card-title text-[#E8931A]">Daily Childcare</h2>
            <p className="text-gray-600">
              Professional daily childcare services
            </p>
            <div className="card-actions justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold">₦5,000/day</span>
              </div>
              <div className="flex space-x-1">
                <button className="btn btn-sm btn-ghost">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-ghost">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-[#A25F97]/10 to-[#A25F97]/5 shadow-lg border border-[#A25F97]/20">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <CalendarDaysIcon className="w-12 h-12 text-[#A25F97]" />
              <div className="badge badge-success">Active</div>
            </div>
            <h2 className="card-title text-[#A25F97]">Holiday Camps</h2>
            <p className="text-gray-600">
              Fun and educational holiday programs
            </p>
            <div className="card-actions justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold">₦30,000/week</span>
              </div>
              <div className="flex space-x-1">
                <button className="btn btn-sm btn-ghost">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-ghost">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Management Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">All Services</h2>
            <div className="flex space-x-2">
              <select className="select select-bordered select-sm">
                <option>All Categories</option>
                <option>Tutoring</option>
                <option>Childcare</option>
                <option>Holiday Camps</option>
                <option>Events</option>
              </select>
              <select className="select select-bordered select-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Bookings</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#90AC19]/10 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-[#90AC19]" />
                      </div>
                      <div>
                        <div className="font-bold">Academic Tutoring</div>
                        <div className="text-sm opacity-50">
                          Mathematics, Science, English
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">Tutoring</span>
                  </td>
                  <td>₦15,000/hr</td>
                  <td>156</td>
                  <td>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>4.8</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td>
                    <div className="flex space-x-1">
                      <button className="btn btn-ghost btn-xs">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs text-error">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#E8931A]/10 rounded-lg flex items-center justify-center">
                        <HeartIcon className="w-6 h-6 text-[#E8931A]" />
                      </div>
                      <div>
                        <div className="font-bold">Daily Childcare</div>
                        <div className="text-sm opacity-50">
                          Professional daily care services
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">Childcare</span>
                  </td>
                  <td>₦5,000/day</td>
                  <td>89</td>
                  <td>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>4.7</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td>
                    <div className="flex space-x-1">
                      <button className="btn btn-ghost btn-xs">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs text-error">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#A25F97]/10 rounded-lg flex items-center justify-center">
                        <CalendarDaysIcon className="w-6 h-6 text-[#A25F97]" />
                      </div>
                      <div>
                        <div className="font-bold">Holiday Camps</div>
                        <div className="text-sm opacity-50">
                          Weekly holiday programs
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent">Holiday Camps</span>
                  </td>
                  <td>₦30,000/week</td>
                  <td>34</td>
                  <td>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>4.9</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td>
                    <div className="flex space-x-1">
                      <button className="btn btn-ghost btn-xs">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-xs text-error">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
