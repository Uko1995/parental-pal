"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { isRebookEligibleBooking } from "@/lib/booking-rebook-eligibility";
import { bookingBelongsToUser } from "@/lib/booking-ownership";
import { saveRebookTemplate } from "@/lib/rebook-persistence";
import RebookSummaryModal from "./RebookSummaryModal";

interface Booking {
  _id: string;
  userId?: string;
  parentEmail?: string;
  serviceType: string;
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "on-hold";
  createdAt: string;
  pricing?: {
    totalAmount?: number;
    currency?: string;
  };
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
  };
  children?: Array<{
    id?: string;
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    specialNeeds?: string;
  }>;
  schedule?: {
    startDate?: string;
    endDate?: string;
    weekdays?: Array<{
      day: string;
      hours: number;
      startTime?: string;
      endTime?: string;
      dates?: Array<{
        date: string;
        startTime: string;
        endTime?: string;
      }>;
    }>;
  };
  serviceData?: {
    // Per-child data structure (used by multiple services)
    childrenData?: Array<{
      childId: string;
      // Tutoring specific
      subjects?: string[];
      academicLevel?: string;
      learningGoals?: string;
      totalHours?: number;
      schedule?: Array<{
        day: string;
        hours: number;
        startTime?: string;
        dates?: Array<{
          date: string;
          startTime: string;
        }>;
      }>;
      // Childcare specific
      careType?: "daily" | "monthly";
      totalDays?: number;
      isMonthSelected?: boolean;
      dropoffTime?: string;
      pickupTime?: string;
      specialNeeds?: string;
      // Holiday camp specific
      campWeeks?: Array<{
        startDate: string;
        endDate: string;
        weekNumber: number;
      }>;
      // Homeschooling specific
      selectedSubjects?: string[];
      gradeLevel?: string;
      curriculum?: string;
      learningStyle?: string;
      educationalGoals?: string;
      selectedTerm?: string;
      // Kiddies enrichment specific
      selectedPrograms?: string[];
      interests?: string;
      parentGoals?: string;
      hours?: number;
      eventDate?: string;
      startTime?: string;
    }>;

    // Legacy/general fields (kept for backward compatibility)
    subjects?: string[];
    academicLevel?: string;
    learningGoals?: string;
    hourlyRate?: number;

    // Homeschooling specific
    curriculum?: string;
    learningStyle?: string;
    termRate?: number;

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

interface RebookModalState {
  bookingId: string;
  serviceLabel: string;
  childrenSummary: string;
  targetMonthLabel: string;
  scheduleSummary?: string;
  pricePreview: { totalAmount: number; currency: string };
}

export default function BookingsSection() {
  const router = useRouter();
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [rebookModal, setRebookModal] = useState<RebookModalState | null>(null);
  const [rebookLoadingId, setRebookLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        // Sort bookings by creation date, most recent first
        const sortedBookings = (data.bookings || []).sort(
          (a: Booking, b: Booking) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        );
        setBookings(sortedBookings);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
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

  const getScheduleSummary = (booking: Booking): string | undefined => {
    const weekdays = booking.schedule?.weekdays;
    if (!weekdays?.length) return undefined;
    return weekdays
      .filter((w) => w.day !== "month")
      .map((w) => `${w.day} (${w.hours}h)`)
      .join(", ");
  };

  const handleQuickRebook = async (booking: Booking) => {
    setRebookLoadingId(booking._id);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/rebook-template`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "This booking cannot be re-booked");
        return;
      }
      setRebookModal({
        bookingId: booking._id,
        serviceLabel:
          SERVICE_TYPE_LABELS[
            booking.serviceType as keyof typeof SERVICE_TYPE_LABELS
          ] || booking.serviceType,
        childrenSummary:
          data.childrenSummary ||
          (booking.children ?? []).map((c) => c.name).join(", "),
        targetMonthLabel: data.targetMonthLabel,
        scheduleSummary: getScheduleSummary(booking),
        pricePreview: data.pricePreview,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to prepare re-book");
    } finally {
      setRebookLoadingId(null);
    }
  };

  const handleEditRebook = async (booking: Booking) => {
    setRebookLoadingId(booking._id);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/rebook-template`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "This booking cannot be re-booked");
        return;
      }
      saveRebookTemplate({
        sourceBookingId: booking._id,
        selectedService: booking.serviceType,
        formEntries: data.formEntries,
        targetMonthLabel: data.targetMonthLabel,
      });
      router.push(
        `/booking?service=${booking.serviceType}&rebook=${booking._id}`,
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to prepare re-book");
    } finally {
      setRebookLoadingId(null);
    }
  };

  const canRebook = (booking: Booking) => {
    if (!isRebookEligibleBooking(booking)) return false;

    // Parents only receive their own bookings from /api/bookings
    if (session?.user?.role !== "admin") {
      return true;
    }

    if (!session?.user) return false;

    return bookingBelongsToUser(
      {
        userId: booking.userId,
        parentEmail: booking.parentEmail,
      },
      {
        _id: session.user.id,
        userData: { user: { email: session.user.email } },
      },
      { id: session.user.id, email: session.user.email },
    );
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
                          {formatDate(booking.schedule?.startDate)}
                        </p>
                        {booking.schedule?.endDate && (
                          <p>
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(booking.schedule.endDate)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Children:</span>{" "}
                          {(booking.children ?? [])
                            .map((c) => c.name)
                            .join(", ") || "—"}
                        </p>
                        <p>
                          <span className="font-medium">Total Amount:</span>{" "}
                          {formatCurrency(
                            booking.pricing?.totalAmount ?? 0,
                            booking.pricing?.currency ?? "NGN",
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Payment Status:</span>
                          <span
                            className={`ml-2 badge badge-sm ${
                              booking.payment?.status === "paid"
                                ? "badge-success"
                                : booking.payment?.status === "pending"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {booking.payment?.status ?? "unknown"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {booking.schedule?.weekdays &&
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

                    {canRebook(booking) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleQuickRebook(booking)}
                          className="btn btn-primary btn-sm"
                          disabled={rebookLoadingId === booking._id}
                        >
                          {rebookLoadingId === booking._id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "Re-book next month"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditRebook(booking)}
                          className="btn btn-outline btn-sm"
                          disabled={rebookLoadingId === booking._id}
                        >
                          Edit &amp; re-book
                        </button>
                      </>
                    )}

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

      {rebookModal && (
        <RebookSummaryModal
          bookingId={rebookModal.bookingId}
          serviceLabel={rebookModal.serviceLabel}
          childrenSummary={rebookModal.childrenSummary}
          targetMonthLabel={rebookModal.targetMonthLabel}
          scheduleSummary={rebookModal.scheduleSummary}
          pricePreview={rebookModal.pricePreview}
          onClose={() => setRebookModal(null)}
        />
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
              Are you sure you want to cancel and permanently delete this
              booking for{" "}
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
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl w-11/12 max-h-[90vh]">
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
                {booking.schedule?.startDate
                  ? new Date(booking.schedule.startDate).toLocaleDateString()
                  : "—"}
              </p>
              {booking.schedule?.endDate && (
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(booking.schedule.endDate).toLocaleDateString()}
                </p>
              )}

              {booking.schedule?.weekdays &&
                booking.schedule.weekdays.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Weekly Schedule:</p>
                    <div className="space-y-2">
                      {booking.schedule.weekdays.map((day, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between py-1 px-2 bg-base-200 rounded font-medium">
                            <span className="capitalize">{day.day}</span>
                            <span>
                              {day.startTime && `${day.startTime} • `}
                              {day.hours} hour{day.hours !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {day.dates && day.dates.length > 0 && (
                            <div className="ml-4 text-xs">
                              <p className="text-base-content/70 mb-1">
                                Specific dates:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {day.dates.map((dateInfo, dateIdx) => (
                                  <span
                                    key={dateIdx}
                                    className="badge badge-sm badge-outline"
                                  >
                                    {new Date(dateInfo.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}{" "}
                                    {dateInfo.startTime}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
            <div className="space-y-3">
              {(booking.children ?? []).map((child, index) => (
                <div key={index} className="p-3 bg-base-200 rounded space-y-2">
                  <p className="font-medium text-base">{child.name}</p>
                  <p className="text-sm text-base-content/70">
                    Age: {child.age} years
                  </p>
                  {child.class && (
                    <p className="text-sm text-base-content/70">
                      Class: {child.class}
                    </p>
                  )}
                  {child.schoolName && (
                    <p className="text-sm text-base-content/70">
                      School: {child.schoolName}
                    </p>
                  )}
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
                {(booking.pricing?.totalAmount ?? 0).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Paid Amount:</span> ₦
                {(booking.payment?.paidAmount ?? 0).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Outstanding:</span> ₦
                {(
                  (booking.pricing?.totalAmount ?? 0) -
                  (booking.payment?.paidAmount ?? 0)
                ).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Payment Status:</span>
                <span
                  className={`ml-2 badge badge-sm ${
                    booking.payment?.status === "paid"
                      ? "badge-success"
                      : booking.payment?.status === "pending"
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {booking.payment?.status ?? "unknown"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Service-Specific Details */}
        {booking.serviceData && Object.keys(booking.serviceData).length > 0 && (
          <div className="mt-6 col-span-full">
            <h4 className="font-semibold text-lg mb-3">Service Details</h4>
            <div className="bg-base-200 p-4 rounded space-y-4">
              {/* Tutoring Details - Per Child */}
              {booking.serviceType === "tutoring" &&
                booking.serviceData.childrenData && (
                  <div className="space-y-4">
                    {Array.isArray(booking.serviceData.childrenData) ? (
                      booking.serviceData.childrenData.map(
                        (childData, idx: number) => {
                          // Find the corresponding child info
                          const childInfo = (booking.children ?? [])[idx];
                          return (
                            <div
                              key={idx}
                              className="bg-base-100 p-4 rounded-lg border border-base-300"
                            >
                              <h5 className="font-semibold text-base mb-3">
                                {childInfo?.name || `Child ${idx + 1}`} -
                                Tutoring Details
                              </h5>
                              <div className="space-y-2 text-sm">
                                {childData.subjects && (
                                  <div>
                                    <p className="font-medium mb-1">
                                      Subjects:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {childData.subjects.map(
                                        (subject: string, sidx: number) => (
                                          <span
                                            key={sidx}
                                            className="badge badge-primary badge-sm"
                                          >
                                            {subject}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                                {childData.academicLevel && (
                                  <p>
                                    <span className="font-medium">
                                      Academic Level:
                                    </span>{" "}
                                    {childData.academicLevel}
                                  </p>
                                )}
                                {childData.schedule &&
                                  childData.schedule.length > 0 && (
                                    <div>
                                      <p className="font-medium mb-1">
                                        Schedule:
                                      </p>
                                      <div className="space-y-2">
                                        {childData.schedule.map(
                                          (daySchedule, didx: number) => (
                                            <div key={didx}>
                                              <div className="flex justify-between items-center bg-base-200 p-2 rounded">
                                                <span className="capitalize font-medium">
                                                  {daySchedule.day}
                                                </span>
                                                <span className="text-xs">
                                                  {daySchedule.startTime} •{" "}
                                                  {daySchedule.hours}h
                                                </span>
                                              </div>
                                              {daySchedule.dates &&
                                                daySchedule.dates.length >
                                                  0 && (
                                                  <div className="ml-4 mt-1">
                                                    <div className="flex flex-wrap gap-1">
                                                      {daySchedule.dates.map(
                                                        (
                                                          dateInfo,
                                                          daidx: number
                                                        ) => (
                                                          <span
                                                            key={daidx}
                                                            className="badge badge-ghost badge-xs"
                                                          >
                                                            {new Date(
                                                              dateInfo.date
                                                            ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                month: "short",
                                                                day: "numeric",
                                                              }
                                                            )}{" "}
                                                            {dateInfo.startTime}
                                                          </span>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {childData?.totalHours &&
                                  childData.totalHours > 0 &&
                                  booking.serviceData?.hourlyRate && (
                                    <p className="font-semibold text-base mt-2">
                                      Cost: ₦
                                      {(
                                        childData.totalHours *
                                        (booking.serviceData?.hourlyRate || 0)
                                      ).toLocaleString()}{" "}
                                      <span className="text-xs font-normal text-base-content/70">
                                        ({childData.totalHours} hours × ₦
                                        {(
                                          booking.serviceData?.hourlyRate || 0
                                        ).toLocaleString()}
                                        /hour)
                                      </span>
                                    </p>
                                  )}
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div>
                        <p className="font-medium mb-1">Subjects:</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.serviceData.subjects?.map((subject, idx) => (
                            <span key={idx} className="badge badge-primary">
                              {subject}
                            </span>
                          ))}
                        </div>
                        {booking.serviceData.academicLevel && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Academic Level:</span>{" "}
                            {booking.serviceData.academicLevel}
                          </p>
                        )}
                        {booking.serviceData.learningGoals && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Learning Goals:</span>{" "}
                            {booking.serviceData.learningGoals}
                          </p>
                        )}
                        {booking.serviceData.hourlyRate && (
                          <p className="mt-2 text-sm font-semibold">
                            Rate: ₦
                            {booking.serviceData.hourlyRate.toLocaleString()}
                            /hour
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Childcare Details */}
              {booking.serviceType === "childcare" && booking.serviceData && (
                <div className="space-y-4">
                  {booking.children?.map((child, index) => {
                    // Find matching childData from childrenData array
                    const childData = booking.serviceData?.childrenData?.find(
                      (cd) => cd.childId === child.id
                    );

                    return (
                      <div key={index} className="bg-base-200 p-3 rounded-lg">
                        <h6 className="font-semibold text-sm mb-2">
                          {child.name} (Age {child.age})
                        </h6>
                        <div className="space-y-2">
                          {childData?.careType && (
                            <p className="text-sm">
                              <span className="font-medium">Care Type:</span>{" "}
                              <span className="badge badge-info badge-sm">
                                {childData.careType === "daily"
                                  ? "Daily Care"
                                  : "Monthly Care"}
                              </span>
                            </p>
                          )}
                          {childData?.dropoffTime && childData?.pickupTime && (
                            <p className="text-sm">
                              <span className="font-medium">Time:</span>{" "}
                              {childData.dropoffTime} - {childData.pickupTime}
                            </p>
                          )}
                          {childData?.totalDays && (
                            <p className="text-sm">
                              <span className="font-medium">Total Days:</span>{" "}
                              {childData.totalDays} days
                            </p>
                          )}
                          {childData?.specialNeeds && (
                            <p className="text-sm">
                              <span className="font-medium">
                                Special Needs:
                              </span>{" "}
                              {childData.specialNeeds}
                            </p>
                          )}
                          {childData && (
                            <p className="text-sm font-semibold mt-2 pt-2 border-t border-base-300">
                              {childData.isMonthSelected ||
                              childData.careType === "monthly" ? (
                                <>
                                  Cost: ₦
                                  {(
                                    booking.serviceData?.monthlyRate || 0
                                  ).toLocaleString()}
                                  <span className="text-xs font-normal text-base-content/70 ml-1">
                                    (monthly rate)
                                  </span>
                                </>
                              ) : (
                                <>
                                  Cost: ₦
                                  {(
                                    (childData.totalDays || 0) *
                                    (booking.serviceData?.dailyRate || 0)
                                  ).toLocaleString()}
                                  <span className="text-xs font-normal text-base-content/70 ml-1">
                                    ({childData.totalDays || 0}{" "}
                                    {childData.totalDays === 1 ? "day" : "days"}{" "}
                                    × ₦
                                    {(
                                      booking.serviceData?.dailyRate || 0
                                    ).toLocaleString()}
                                    /day)
                                  </span>
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Holiday Camp Details */}
              {booking.serviceType === "holiday-camps" &&
                booking.serviceData && (
                  <div className="space-y-4">
                    {booking.children?.map((child, index) => {
                      // Find matching childData from childrenData array
                      const childData = booking.serviceData?.childrenData?.find(
                        (cd) => cd.childId === child.id
                      );

                      return (
                        <div key={index} className="bg-base-200 p-3 rounded-lg">
                          <h6 className="font-semibold text-sm mb-2">
                            {child.name} (Age {child.age})
                          </h6>
                          <div className="space-y-2">
                            {childData?.campWeeks &&
                              childData.campWeeks.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Camp Weeks:
                                  </p>
                                  <div className="space-y-1">
                                    {childData.campWeeks.map((week, wIdx) => (
                                      <div
                                        key={wIdx}
                                        className="flex items-center justify-between p-2 bg-base-100 rounded text-sm"
                                      >
                                        <div>
                                          <span className="font-medium">
                                            Week {week.weekNumber}
                                          </span>
                                          <span className="text-xs text-base-content/70 ml-2">
                                            {new Date(
                                              week.startDate
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}{" "}
                                            -{" "}
                                            {new Date(
                                              week.endDate
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        {booking.serviceData?.weeklyRate && (
                                          <span className="badge badge-primary badge-xs">
                                            ₦
                                            {booking.serviceData.weeklyRate.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            {childData?.campWeeks &&
                              booking.serviceData?.weeklyRate && (
                                <p className="text-sm font-semibold mt-2 pt-2 border-t border-base-300">
                                  Cost: ₦
                                  {(
                                    childData.campWeeks.length *
                                    booking.serviceData.weeklyRate
                                  ).toLocaleString()}
                                  <span className="text-xs font-normal text-base-content/70 ml-1">
                                    ({childData.campWeeks.length}{" "}
                                    {childData.campWeeks.length === 1
                                      ? "week"
                                      : "weeks"}{" "}
                                    × ₦
                                    {booking.serviceData.weeklyRate.toLocaleString()}
                                    /week)
                                  </span>
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Homeschooling Details */}
              {booking.serviceType === "homeschooling" &&
                booking.serviceData && (
                  <div className="space-y-4">
                    {booking.children?.map((child, index) => {
                      // Find matching childData from childrenData array
                      const childData = booking.serviceData?.childrenData?.find(
                        (cd) => cd.childId === child.id
                      );

                      return (
                        <div key={index} className="bg-base-200 p-3 rounded-lg">
                          <h6 className="font-semibold text-sm mb-2">
                            {child.name} (Age {child.age})
                          </h6>
                          <div className="space-y-2">
                            {childData?.selectedSubjects &&
                              childData.selectedSubjects.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Subjects:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {childData.selectedSubjects.map(
                                      (subject, idx) => (
                                        <span
                                          key={idx}
                                          className="badge badge-primary badge-sm"
                                        >
                                          {subject}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {(childData?.gradeLevel || child.class) && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Grade Level:
                                </span>{" "}
                                {childData?.gradeLevel || child.class}
                              </p>
                            )}
                            {childData?.curriculum && (
                              <p className="text-sm">
                                <span className="font-medium">Curriculum:</span>{" "}
                                {childData.curriculum}
                              </p>
                            )}
                            {childData?.learningStyle && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Learning Style:
                                </span>{" "}
                                {childData.learningStyle}
                              </p>
                            )}
                            {childData?.selectedTerm && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Selected Term:
                                </span>{" "}
                                {childData.selectedTerm}
                              </p>
                            )}
                            {childData?.educationalGoals && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Educational Goals:
                                </span>{" "}
                                {childData.educationalGoals}
                              </p>
                            )}
                            {booking.serviceData?.termRate && (
                              <p className="text-sm font-semibold mt-2 pt-2 border-t border-base-300">
                                Cost: ₦
                                {booking.serviceData.termRate.toLocaleString()}
                                <span className="text-xs font-normal text-base-content/70 ml-1">
                                  (per term)
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Kiddies Enrichment Details */}
              {booking.serviceType === "kiddies-enrichment" &&
                booking.serviceData && (
                  <div className="space-y-4">
                    {booking.children?.map((child, index) => {
                      // Find matching childData from childrenData array
                      const childData = booking.serviceData?.childrenData?.find(
                        (cd) => cd.childId === child.id
                      );

                      return (
                        <div key={index} className="bg-base-200 p-3 rounded-lg">
                          <h6 className="font-semibold text-sm mb-2">
                            {child.name} (Age {child.age})
                          </h6>
                          <div className="space-y-2">
                            {childData?.selectedPrograms &&
                              childData.selectedPrograms.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Programs:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {childData.selectedPrograms.map(
                                      (program, idx) => (
                                        <span
                                          key={idx}
                                          className="badge badge-primary badge-sm"
                                        >
                                          {program}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {(childData?.eventDate ||
                              childData?.startTime ||
                              childData?.hours) && (
                              <div className="bg-base-100 p-2 rounded mt-2">
                                <p className="font-medium text-sm mb-1">
                                  Event Details:
                                </p>
                                {childData?.eventDate && (
                                  <p className="text-sm">
                                    <span className="font-medium">Date:</span>{" "}
                                    {new Date(
                                      childData.eventDate
                                    ).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                )}
                                {childData?.startTime && (
                                  <p className="text-sm">
                                    <span className="font-medium">Time:</span>{" "}
                                    {childData.startTime}
                                  </p>
                                )}
                                {childData?.hours && (
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Duration:
                                    </span>{" "}
                                    <span className="badge badge-accent badge-xs">
                                      {childData.hours}{" "}
                                      {childData.hours === 1 ? "hour" : "hours"}
                                    </span>
                                  </p>
                                )}
                              </div>
                            )}
                            {childData?.interests && (
                              <p className="text-sm">
                                <span className="font-medium">Interests:</span>{" "}
                                {childData.interests}
                              </p>
                            )}
                            {childData?.parentGoals && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  Parent Goals:
                                </span>{" "}
                                {childData.parentGoals}
                              </p>
                            )}
                            {childData?.hours &&
                              booking.serviceData?.hourlyRate && (
                                <p className="text-sm font-semibold mt-2 pt-2 border-t border-base-300">
                                  Cost: ₦
                                  {(
                                    childData.hours *
                                    booking.serviceData.hourlyRate
                                  ).toLocaleString()}
                                  <span className="text-xs font-normal text-base-content/70 ml-1">
                                    ({childData.hours}h × ₦
                                    {booking.serviceData.hourlyRate.toLocaleString()}
                                    /h)
                                  </span>
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Event/Space Rental Details */}
              {booking.serviceType === "space-rental" && (
                <div>
                  {booking.serviceData.eventType && (
                    <p className="text-sm">
                      <span className="font-medium">Event Type:</span>{" "}
                      {booking.serviceData.eventType}
                    </p>
                  )}
                  {booking.serviceData.venueType && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Venue:</span>{" "}
                      <span className="badge badge-accent">
                        {booking.serviceData.venueType}
                      </span>
                    </p>
                  )}
                  {booking.serviceData.eventDate && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(
                        booking.serviceData.eventDate
                      ).toLocaleDateString()}{" "}
                      {booking.serviceData.eventTime &&
                        `at ${booking.serviceData.eventTime}`}
                    </p>
                  )}
                  {booking.serviceData.expectedGuests && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Expected Guests:</span>{" "}
                      {booking.serviceData.expectedGuests}
                    </p>
                  )}
                  {booking.serviceData.extraServices &&
                    booking.serviceData.extraServices.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Extra Services:</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.serviceData.extraServices.map(
                            (service, idx) => (
                              <span key={idx} className="badge badge-secondary">
                                {service.service}
                                {service.quantity && ` (${service.quantity})`}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </div>
  );
}
