"use client";

import { ClientServiceInterface } from "./action";
import {
  XMarkIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { formatBillingSuffix } from "@/lib/service-utils";

interface ServiceDetailsModalProps {
  service: ClientServiceInterface | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (service: ClientServiceInterface) => void;
}

const formatCurrency = (amount: number, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatServiceType = (type: string) => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ServiceDetailsModal({
  service,
  isOpen,
  onEdit,
  onClose,
}: ServiceDetailsModalProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="modal modal-open">
      <div className="relative modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-2 btn btn-ghost btn-sm btn-circle"
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5 flex items-center justify-center" />
        </button>

        {/* Service Image */}
        {service.image && (
          <div className="mt-6 mb-6 relative">
            <Image
              src={service.image}
              alt={service.name}
              width={600}
              height={300}
              className="w-full h-64 object-cover rounded-lg shadow-sm"
              onError={(e) => {
                // Hide image on error
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Header */}
            <div className="absolute bottom-3 right-3 left-3">
              <div className="flex items-center justify-between ">
                <h2 className="text-2xl font-bold text-gray-50">
                  {service.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="badge badge-primary">
                    {formatServiceType(service.type)}
                  </span>
                  <span
                    className={`badge ${
                      service.status === "active"
                        ? "badge-success"
                        : service.status === "inactive"
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {service.status.charAt(0).toUpperCase() +
                      service.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">{service.description}</p>
        </div>

        {/* Key Features */}
        {service.keyFeatures && service.keyFeatures.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {service.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-600 mr-2 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {service.availability && service.availability.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {service?.availability && <span>{service.availability}</span>}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="stat-figure text-green-600">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-green-800">Base Rate</div>
            <div className="stat-value text-green-900 text-xl">
              {formatCurrency(Number(service.pricing.baseRate))}
            </div>
            <div className="stat-desc text-green-700">
              {formatBillingSuffix(service.pricing.billingType).replace(
                "/",
                "",
              )}
            </div>
          </div>

          {/* Show location rates for tutoring */}
          {service.type === "tutoring" && service.pricing.locationRates && (
            <>
              <div className="stat bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                <div className="stat-figure text-indigo-600">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div className="stat-title text-indigo-800">Virtual Rate</div>
                <div className="stat-value text-indigo-900 text-xl">
                  {formatCurrency(
                    Number(service.pricing.locationRates.virtual),
                  )}
                </div>
                <div className="stat-desc text-indigo-700">
                  per hour (online)
                </div>
              </div>

              <div className="stat bg-linear-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                <div className="stat-figure text-teal-600">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div className="stat-title text-teal-800">Physical Rate</div>
                <div className="stat-value text-teal-900 text-xl">
                  {formatCurrency(
                    Number(service.pricing.locationRates.physical),
                  )}
                </div>
                <div className="stat-desc text-teal-700">
                  per hour (in-person)
                </div>
              </div>
            </>
          )}

          <div className="stat bg-linear-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg">
            <div className="stat-figure text-blue-600">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-blue-800">Total Bookings</div>
            <div className="stat-value text-blue-900 text-xl">
              {service.metrics?.totalBookings || 0}
            </div>
            <div className="stat-desc text-blue-700">all time</div>
          </div>

          <div className="stat bg-linear-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
            <div className="stat-figure text-yellow-600">
              <StarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-yellow-800">Average Rating</div>
            <div className="stat-value text-yellow-900 text-xl">
              {service.metrics?.averageRating?.toFixed(1) || "N/A"}
            </div>
            <div className="stat-desc text-yellow-700">
              from {service.metrics?.totalReviews || 0} reviews
            </div>
          </div>

          <div className="stat bg-linear-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
            <div className="stat-figure text-purple-600">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-purple-800">Total Revenue</div>
            <div className="stat-value text-purple-900 text-xl">
              {service.metrics?.totalRevenue
                ? formatCurrency(service.metrics.totalRevenue)
                : "N/A"}
            </div>
            <div className="stat-desc text-purple-700">lifetime</div>
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing Details */}
          <div className="card bg-base-50 border border-gray-200">
            <div className="card-body">
              <h3 className="card-title text-lg">
                <BanknotesIcon className="w-5 h-5" />
                Pricing Structure
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Rate:</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(service.pricing.baseRate))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing Type:</span>
                  <span className="badge badge-outline">
                    {formatBillingSuffix(service.pricing.billingType).replace(
                      "/",
                      "",
                    ) || service.pricing.billingType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold">
                    {service.pricing.currency}
                  </span>
                </div>

                {/* Packages */}
                {service.pricing.packages &&
                  service.pricing.packages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Available Packages:</h4>
                      <div className="space-y-2">
                        {service.pricing.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{pkg.name}</p>
                                <span className="badge badge-sm badge-success">
                                  {pkg.discountPercentage}% off
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {pkg.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                Duration: {pkg.duration}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          {service.requirements && (
            <div className="card bg-base-50 border border-gray-200">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  <UsersIcon className="w-5 h-5" />
                  Service Requirements
                </h3>
                <div className="space-y-3">
                  {/* Age Group */}
                  {service.requirements.ageGroup && (
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Age Group:
                      </span>
                      <span className="badge badge-info">
                        {service.requirements.ageGroup}
                      </span>
                    </div>
                  )}

                  {/* Equipment */}
                  {service.requirements.equipmentProvided &&
                    service.requirements.equipmentProvided.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Equipment Provided:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {service.requirements.equipmentProvided.map(
                            (equipment, idx) => (
                              <span key={idx} className="badge badge-primary">
                                {equipment}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {service.metrics && (
          <div className="mt-6">
            <div className="card bg-base-50 border border-gray-200">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  <ChartBarIcon className="w-5 h-5" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {service.metrics.conversionRate?.toFixed(1) || "N/A"}%
                    </p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {service.metrics.repeatCustomerRate?.toFixed(1) || "N/A"}%
                    </p>
                    <p className="text-sm text-gray-600">Repeat Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {service.metrics.totalReviews || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {service.metrics.totalBookings || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>
              Created: {new Date(service.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>
              Updated: {new Date(service.updatedAt).toLocaleDateString()}
            </span>
          </div>
          {service.lastBookedAt && (
            <div className="flex items-center space-x-2 text-gray-600">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>
                Last Booked:{" "}
                {new Date(service.lastBookedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button onClick={() => onEdit(service)} className="btn btn-primary">
            Edit Service
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
