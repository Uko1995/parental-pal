import {
  AcademicCapIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function TutorsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutors</h1>
          <p className="text-gray-600 mt-1">
            Manage tutor profiles, qualifications, and assignments
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Tutor
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-primary">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Active Tutors</div>
          <div className="stat-value text-primary">45</div>
          <div className="stat-desc">12% increase this month</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-secondary">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Pending Applications</div>
          <div className="stat-value text-secondary">8</div>
          <div className="stat-desc">Requires review</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-figure text-accent">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Average Rating</div>
          <div className="stat-value text-accent">4.8</div>
          <div className="stat-desc">Out of 5.0</div>
        </div>
      </div>

      {/* Tutors Management Placeholder */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="h-96 bg-gradient-to-r from-[#90AC19]/10 to-[#A25F97]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <AcademicCapIcon className="w-20 h-20 text-[#90AC19] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tutor Management System
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Complete tutor management with profiles, qualifications
                verification, scheduling, performance tracking, and payment
                management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
