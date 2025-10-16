"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  serviceType: string;
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "on-hold";
  createdAt: string;
  pricing: {
    totalAmount: number;
    currency: string;
  };
  payment: {
    status: "pending" | "paid" | "refunded";
    paidAmount: number;
  };
  children: Array<{
    name: string;
    age: number;
  }>;
  schedule: {
    startDate: string;
    endDate?: string;
    weekdays?: Array<{
      day: string;
      hours: number;
    }>;
  };
  serviceData?: {
    // Tutoring specific
    subjects?: string[];
    academicLevel?: string;
    learningGoals?: string;
    hourlyRate?: number;

    // Childcare specific
    careType?: "daily" | "monthly";
    dropoffTime?: string;
    pickupTime?: string;
    specialNeeds?: string;
    dailyRate?: number;
    monthlyRate?: number;

    // Holiday camp specific
    campWeeks?: Array<{
      startDate: string;
      endDate: string;
      weekNumber: number;
    }>;
    weeklyRate?: number;

    // Event/Space rental specific
    eventType?: string;
    eventDate?: string;
    eventTime?: string;
    venueType?: "indoor" | "outdoor" | "both";
    expectedGuests?: number;
    extraServices?: Array<{
      service: "dj" | "mc" | "event-planning" | "extra-carers";
      quantity?: number;
      rate?: number;
    }>;
    cautionFee?: number;
    baseRate?: number;
  };
}

const SERVICE_TYPE_LABELS = {
  childcare: "Childcare",
  tutoring: "Tutoring",
  homeschooling: "Homeschooling",
  "holiday-camps": "Holiday Camps",
  "space-rental": "Space Rental",
  "kiddies-enrichment": "Kiddies Enrichment",
};

const STATUS_COLORS = {
  pending: "badge-warning",
  confirmed: "badge-info",
  "in-progress": "badge-primary",
  completed: "badge-success",
  cancelled: "badge-error",
  "on-hold": "badge-neutral",
};

export default function BookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking cancelled and deleted successfully");
        setBookingToCancel(null);
        await fetchBookings();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base-content">My Bookings</h2>
        <div className="text-sm text-base-content/70">
          Total Bookings: {bookings.length}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl text-base-content/20 mb-4">📋</div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No bookings yet
          </h3>
          <p className="text-base-content/70 mb-4">
            Book your first service to see it here.
          </p>
          <a href="/booking" className="btn btn-primary">
            Make a Booking
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="card bg-base-100 border shadow-sm"
            >
              <div className="card-body p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {SERVICE_TYPE_LABELS[
                          booking.serviceType as keyof typeof SERVICE_TYPE_LABELS
                        ] || booking.serviceType}
                      </h3>
                      <div
                        className={`badge ${
                          STATUS_COLORS[booking.status]
                        } badge-sm`}
                      >
                        {booking.status.replace("-", " ")}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-base-content/70">
                      <div>
                        <p>
                          <span className="font-medium">Booking Date:</span>{" "}
                          {formatDate(booking.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Start Date:</span>{" "}
                          {formatDate(booking.schedule.startDate)}
                        </p>
                        {booking.schedule.endDate && (
                          <p>
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(booking.schedule.endDate)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Children:</span>{" "}
                          {booking.children.map((c) => c.name).join(", ")}
                        </p>
                        <p>
                          <span className="font-medium">Total Amount:</span>{" "}
                          {formatCurrency(
                            booking.pricing.totalAmount,
                            booking.pricing.currency
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Payment Status:</span>
                          <span
                            className={`ml-2 badge badge-sm ${
                              booking.payment.status === "paid"
                                ? "badge-success"
                                : booking.payment.status === "pending"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {booking.payment.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {booking.schedule.weekdays &&
                      booking.schedule.weekdays.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-base-content/70 mb-1">
                            Schedule:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.schedule.weekdays.map((day, index) => (
                              <span
                                key={index}
                                className="badge badge-outline badge-sm"
                              >
                                {day.day} ({day.hours}h)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="btn btn-ghost btn-sm"
                    >
                      View Details
                    </button>

                    {booking.status === "pending" && (
                      <button
                        onClick={() => setBookingToCancel(booking)}
                        className="btn btn-error btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Cancel Booking</h3>
            <p className="py-4">
              Are you sure you want to cancel and permanently delete this booking for{" "}
              <span className="font-semibold">
                {SERVICE_TYPE_LABELS[
                  bookingToCancel.serviceType as keyof typeof SERVICE_TYPE_LABELS
                ] || bookingToCancel.serviceType}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setBookingToCancel(null)}
                className="btn btn-ghost"
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelBooking(bookingToCancel._id)}
                className="btn btn-error"
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-box w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">
            Booking Details -{" "}
            {
              SERVICE_TYPE_LABELS[
                booking.serviceType as keyof typeof SERVICE_TYPE_LABELS
              ]
            }
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Booking ID:</span> {booking._id}
              </p>
              <p>
                <span className="font-medium">Service Type:</span>{" "}
                {
                  SERVICE_TYPE_LABELS[
                    booking.serviceType as keyof typeof SERVICE_TYPE_LABELS
                  ]
                }
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 badge ${
                    STATUS_COLORS[booking.status]
                  } badge-sm`}
                >
                  {booking.status.replace("-", " ")}
                </span>
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Schedule</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(booking.schedule.startDate).toLocaleDateString()}
              </p>
              {booking.schedule.endDate && (
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(booking.schedule.endDate).toLocaleDateString()}
                </p>
              )}

              {booking.schedule.weekdays &&
                booking.schedule.weekdays.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Weekly Schedule:</p>
                    <div className="grid grid-cols-1 gap-1">
                      {booking.schedule.weekdays.map((day, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-1 px-2 bg-base-200 rounded"
                        >
                          <span className="capitalize">{day.day}</span>
                          <span>{day.hours} hours</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Children Information */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Children</h4>
            <div className="space-y-2">
              {booking.children.map((child, index) => (
                <div key={index} className="p-3 bg-base-200 rounded">
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-base-content/70">
                    Age: {child.age} years
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Payment Details</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Total Amount:</span> ₦
                {booking.pricing.totalAmount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Paid Amount:</span> ₦
                {booking.payment.paidAmount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Outstanding:</span> ₦
                {(
                  booking.pricing.totalAmount - booking.payment.paidAmount
                ).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Payment Status:</span>
                <span
                  className={`ml-2 badge badge-sm ${
                    booking.payment.status === "paid"
                      ? "badge-success"
                      : booking.payment.status === "pending"
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {booking.payment.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Service-Specific Details */}
        {booking.serviceData && Object.keys(booking.serviceData).length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-3">Service Details</h4>
            <div className="bg-base-200 p-4 rounded text-sm">
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(booking.serviceData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
