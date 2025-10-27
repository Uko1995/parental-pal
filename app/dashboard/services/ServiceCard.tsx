"use client";

import {
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ClientServiceInterface } from "./action";
import toast from "react-hot-toast";
import Image from "next/image";

interface ServiceCardProps {
  service: ClientServiceInterface;
  onEdit: (service: ClientServiceInterface) => void;
  onDelete: (service: ClientServiceInterface) => void;
  onViewDetails: (service: ClientServiceInterface) => void;
}

const ServiceTypeBadgeColors = {
  tutoring: "badge-success",
  childcare: "badge-warning",
  "holiday-camps": "badge-secondary",
  homeschooling: "badge-info",
  "space-rental": "badge-primary",
  "kiddies-enrichment": "badge-accent",
};

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

const getStatusBadge = (status: string) => {
  const statusMap = {
    active: "badge-success",
    inactive: "badge-error",
    draft: "badge-warning",
    seasonal: "badge-info",
    discontinued: "badge-neutral",
  };
  return statusMap[status as keyof typeof statusMap] || "badge-neutral";
};

export default function ServiceCard({
  service,
  onEdit,
  onDelete,
  onViewDetails,
}: ServiceCardProps) {
  const handleCopyServiceId = () => {
    navigator.clipboard.writeText(service._id?.toString() || "");
    toast.success("Service ID copied to clipboard");
  };

  return (
    <div
      className="card bg-gradient-to-br 
        from-gray-100/10 to-gray-100/5 border-gray-200
      shadow-lg border hover:shadow-xl transition-all duration-300 group"
    >
      {/* Service Image */}
      {service.image && (
        <div className=" mb-1 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={service.image}
            alt={service.name}
            width={400}
            height={400}
            className="w-full h-80 object-cover"
            onError={(e) => {
              console.error(`Failed to load image: ${service.image}`);
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="card-title text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <div className="flex gap-2">
            <span
              className={`badge ${
                ServiceTypeBadgeColors[
                  service.type as keyof typeof ServiceTypeBadgeColors
                ] || "badge-neutral"
              } badge-sm`}
            >
              {formatServiceType(service.type)}
            </span>
            <span
              className={`badge ${getStatusBadge(service.status)} badge-sm`}
            >
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-1 line-clamp-2">
          {service.description}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-1">
          <div className="bg-white/50 rounded-lg p-2 ">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500">Rate</p>
                <p className="font-semibold text-sm">
                  {formatCurrency(Number(service.pricing.baseRate))}/
                  {service.pricing.billingType}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-lg p-2 ">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500">Number of bookings</p>
                <p className="font-semibold text-sm">
                  {service.metrics?.totalBookings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-lg p-2 ">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500">Average Rating</p>
                <p className="font-semibold text-sm">
                  {service.metrics?.averageRating?.toFixed(1) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-lg p-2 ">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="font-semibold text-sm">
                  {service.requirements?.minimumParticipants || 1}-
                  {service.requirements?.maximumParticipants || "∞"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-1">
          {/* Revenue Badge */}
          {service.metrics?.totalRevenue && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-full px-3 py-1">
              <span className="text-green-700 font-medium text-sm">
                {formatCurrency(service.metrics.totalRevenue)} total revenue
              </span>
            </div>
          )}

          {/* Last Booking */}
          {service.lastBookedAt && (
            <span className="text-xs text-gray-500">
              Last booked:{" "}
              {new Date(service.lastBookedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="card-actions justify-end space-x-2">
          <div className="dropdown dropdown-top dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline btn-sm"
              title="More actions"
            >
              <ChevronDownIcon className="w-4 h-4" />
              More Actions
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48"
            >
              <li>
                <button
                  className="flex items-center space-x-2"
                  onClick={() => onEdit(service)}
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Service</span>
                </button>
              </li>
              <li>
                <button
                  className="flex items-center space-x-2"
                  onClick={handleCopyServiceId}
                >
                  <span>📋</span>
                  <span>Copy ID</span>
                </button>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button
                  className="flex items-center space-x-2 text-error hover:bg-error/10"
                  onClick={() => onDelete(service)}
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete Service</span>
                </button>
              </li>
            </ul>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(service)}
          >
            <EyeIcon className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
