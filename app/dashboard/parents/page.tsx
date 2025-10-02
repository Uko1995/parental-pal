import { UsersIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function ParentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-600 mt-1">
            Manage parent accounts, children, and service preferences
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Parent Account
        </button>
      </div>

      {/* Parents Management Placeholder */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="h-96 bg-gradient-to-r from-[#E8931A]/10 to-[#A25F97]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <UsersIcon className="w-20 h-20 text-[#E8931A] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Parent Management
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Comprehensive parent account management with family profiles,
                booking history, preferences, and communication tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
