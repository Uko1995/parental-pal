"use client";

import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface Child {
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
}

interface Schedule {
  startDate: string;
  endDate?: string;
  weekdays?: Array<{
    day:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    hours: number;
    startTime?: string;
    endTime?: string;
  }>;
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
}

interface Booking {
  _id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  serviceType:
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalCost: number;
  createdAt: string;
  children?: Child[];
  specialRequests?: string;
  schedule?: Schedule;
}

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function ViewBookingModal({
  isOpen,
  onClose,
  booking,
}: ViewBookingModalProps) {
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      date.toDateString() ===
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "badge-warning",
      confirmed: "badge-success",
      cancelled: "badge-error",
      completed: "badge-info",
    };

    return (
      <div
        className={`badge ${
          statusStyles[status as keyof typeof statusStyles] || "badge-neutral"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">Booking Details</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status and Service */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">{booking.serviceType}</h4>
              <p className="text-gray-600">Booking ID: {booking._id}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Parent Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h5 className="card-title text-lg mb-4">
                <UserIcon className="w-5 h-5" />
                Parent Information
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{booking.parentName}</p>
                    <p className="text-sm text-gray-600">Full Name</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{booking.parentEmail}</p>
                    <p className="text-sm text-gray-600">Email Address</p>
                  </div>
                </div>

                {booking.parentPhone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{booking.parentPhone}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {formatDate(booking.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">Booking Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children Information */}
          {booking.children && booking.children.length > 0 && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Children Information ({booking.children.length})
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.children.map((child, index) => (
                    <div key={index} className="card bg-base-100 p-4">
                      <h6 className="font-semibold mb-2">
                        {child.name || `Child ${index + 1}`}
                      </h6>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Age:</span> {child.age}{" "}
                          years old
                        </p>
                        {child.class && (
                          <p>
                            <span className="font-medium">Class:</span>{" "}
                            {child.class}
                          </p>
                        )}
                        {child.schoolName && (
                          <p>
                            <span className="font-medium">School:</span>{" "}
                            {child.schoolName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service & Cost Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h5 className="card-title text-lg mb-4">
                Service & Cost Details
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="font-semibold mb-2">Service Type</h6>
                  <div className="badge badge-primary badge-lg">
                    {booking.serviceType}
                  </div>
                </div>

                <div>
                  <h6 className="font-semibold mb-2">Total Cost</h6>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(booking.totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          {booking.schedule && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Schedule Information
                </h5>
                <div className="bg-base-100 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-lg">
                          {formatDate(booking.schedule.startDate)}
                        </p>
                        <p className="text-sm text-gray-600">Start Date</p>
                      </div>
                    </div>

                    {booking.schedule.endDate && (
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="font-semibold text-lg">
                            {formatDate(booking.schedule.endDate)}
                          </p>
                          <p className="text-sm text-gray-600">End Date</p>
                        </div>
                      </div>
                    )}

                    {booking.schedule.isRecurring && (
                      <div className="badge badge-info badge-lg">
                        Recurring Service
                        {booking.schedule.frequency &&
                          ` - ${booking.schedule.frequency}`}
                      </div>
                    )}

                    {booking.schedule.weekdays &&
                      booking.schedule.weekdays.length > 0 && (
                        <div>
                          <h6 className="font-semibold mb-2">
                            Weekly Schedule:
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {booking.schedule.weekdays.map((day, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-base-200 rounded"
                              >
                                <span className="font-medium capitalize">
                                  {day.day}
                                </span>
                                <div className="text-sm">
                                  <span className="badge badge-outline">
                                    {day.hours}h
                                  </span>
                                  {day.startTime && day.endTime && (
                                    <span className="ml-2 text-gray-600">
                                      {day.startTime} - {day.endTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">Special Requests</h5>
                <div className="bg-base-100 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {booking.specialRequests}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Timeline */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h5 className="card-title text-lg mb-4">Booking Timeline</h5>

              <div className="timeline timeline-vertical">
                <div className="timeline-start timeline-box">
                  <div className="text-sm font-medium">Booking Created</div>
                  <div className="text-xs text-gray-600">
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
                <div className="timeline-middle">
                  <div className="timeline-marker bg-primary"></div>
                </div>
                <div className="timeline-end"></div>

                {booking.status === "confirmed" && (
                  <>
                    <div className="timeline-start"></div>
                    <div className="timeline-middle">
                      <div className="timeline-marker bg-success"></div>
                    </div>
                    <div className="timeline-end timeline-box">
                      <div className="text-sm font-medium">
                        Booking Confirmed
                      </div>
                      <div className="text-xs text-gray-600">
                        Status updated to confirmed
                      </div>
                    </div>
                  </>
                )}

                {booking.status === "completed" && (
                  <>
                    <div className="timeline-start timeline-box">
                      <div className="text-sm font-medium">
                        Service Completed
                      </div>
                      <div className="text-xs text-gray-600">
                        Booking has been completed
                      </div>
                    </div>
                    <div className="timeline-middle">
                      <div className="timeline-marker bg-info"></div>
                    </div>
                    <div className="timeline-end"></div>
                  </>
                )}

                {booking.status === "cancelled" && (
                  <>
                    <div className="timeline-start"></div>
                    <div className="timeline-middle">
                      <div className="timeline-marker bg-error"></div>
                    </div>
                    <div className="timeline-end timeline-box">
                      <div className="text-sm font-medium">
                        Booking Cancelled
                      </div>
                      <div className="text-xs text-gray-600">
                        Booking was cancelled
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action flex justify-between items-center">
          <div className="flex-1">
            {booking.status === "pending" ? (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm">
                  This booking can be edited or cancelled since it&apos;s still
                  pending.
                </span>
              </div>
            ) : (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  ></path>
                </svg>
                <span className="text-sm">
                  This booking cannot be modified as it&apos;s {booking.status}.
                </span>
              </div>
            )}
          </div>
          <button className="btn btn-primary ml-4" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
