import {
  BuildingOfficeIcon,
  EyeIcon,
  BanknotesIcon,
  StarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { getServices } from "./action";
import ServicesWrapper from "./ServicesWrapper";

export default async function ServicesPage() {
  // Fetch services data
  const servicesData = await getServices();

  // Calculate additional statistics
  const totalRevenue = servicesData.services.reduce(
    (sum, service) => sum + (service.metrics?.totalRevenue || 0),
    0
  );

  const averageRating =
    servicesData.services.reduce(
      (sum, service) => sum + (service.metrics?.averageRating || 0),
      0
    ) / servicesData.services.length;

  const totalBookings = servicesData.services.reduce(
    (sum, service) => sum + (service.metrics?.totalBookings || 0),
    0
  );

  const mostPopularService = servicesData.services.reduce((prev, current) =>
    (current.metrics?.totalBookings || 0) > (prev.metrics?.totalBookings || 0)
      ? current
      : prev
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">
            Manage all service offerings, pricing, and availability
          </p>
        </div>
      </div>

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow-lg rounded-2xl border border-gray-100">
          <div className="stat-figure text-primary">
            <BuildingOfficeIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-600">Total Services</div>
          <div className="stat-value text-primary text-2xl">
            {servicesData.serviceStats.totalServices}
          </div>
          <div className="stat-desc text-gray-500">
            {servicesData.serviceStats.activeServices} active offerings
          </div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl border border-gray-100">
          <div className="stat-figure text-secondary">
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-600">Most Popular</div>
          <div className="stat-value text-secondary text-lg">
            {mostPopularService?.name?.length > 15
              ? mostPopularService.name.substring(0, 15) + "..."
              : mostPopularService?.name || "N/A"}
          </div>
          <div className="stat-desc text-gray-500">
            {mostPopularService?.metrics?.totalBookings || 0} bookings
          </div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl border border-gray-100">
          <div className="stat-figure text-accent">
            <StarIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-600">Avg Rating</div>
          <div className="stat-value text-accent text-2xl">
            {averageRating ? averageRating.toFixed(1) : "N/A"}
          </div>
          <div className="stat-desc text-gray-500">Out of 5.0 stars</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-2xl border border-gray-100">
          <div className="stat-figure text-success">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-600">Total Revenue</div>
          <div className="stat-value text-success text-lg">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="stat-desc text-gray-500">
            {totalBookings} total bookings
          </div>
        </div>
      </div>

      {/* Services Content */}
      <ServicesWrapper
        services={servicesData.services}
        serviceStats={servicesData.serviceStats}
      />
    </div>
  );
}
