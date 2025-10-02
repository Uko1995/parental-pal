import { CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage all service bookings and appointments
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Booking
        </button>
      </div>

      {/* Bookings Content Placeholder */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="h-96 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <CalendarDaysIcon className="w-20 h-20 text-[#90AC19] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bookings Management
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Complete booking management system with calendar views, status
                tracking, and automated notifications will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
