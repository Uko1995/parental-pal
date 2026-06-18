"use client";

import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import PaymentReconciliationSection from "./PaymentReconciliationSection";

interface Child {
  id?: string;
  name: string;
  age: number;
  gender: "male" | "female";
  class?: string;
  schoolName?: string;
  specialNeeds?: string;
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
    dates?: Array<{
      date: string;
      startTime: string;
      endTime?: string;
    }>;
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
      camperId?: string;
      boarding?: boolean;
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

    // General fields (kept for backward compatibility)
    subjects?: string[];
    academicLevel?: string;
    learningGoals?: string;
    hourlyRate?: number;
    tutoringLocation?: "virtual" | "physical";
    virtualRate?: number;
    physicalRate?: number;

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
    campSeasonId?: string;
    campLocation?: string;
    camperIds?: string[];
    camperId?: string;
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
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
    transactionId?: string;
    method?: string;
    paymentDate?: string;
  };
  pricing?: { totalAmount?: number };
}

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentConfirmed?: () => void;
}

export default function ViewBookingModal({
  isOpen,
  onClose,
  booking,
  onPaymentConfirmed,
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

          <PaymentReconciliationSection
            bookingId={booking._id}
            totalAmount={
              booking.pricing?.totalAmount ?? booking.totalCost ?? 0
            }
            payment={booking.payment}
            onSuccess={onPaymentConfirmed}
          />

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

          {/* Per-Child Tutoring Details */}
          {booking.serviceType === "tutoring" &&
            booking.serviceData?.childrenData &&
            Array.isArray(booking.serviceData.childrenData) && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h5 className="card-title text-lg mb-4">
                    Per-Child Tutoring Details
                  </h5>

                  {/* Tutoring Location Badge */}
                  {booking.serviceData.tutoringLocation && (
                    <div className="mb-4">
                      <div className="badge badge-lg badge-info">
                        {booking.serviceData.tutoringLocation === "virtual"
                          ? "Virtual Tutoring (Online)"
                          : "Physical Tutoring (In-Person)"}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Rate: ₦
                        {booking.serviceData.hourlyRate?.toLocaleString()}/hour
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {booking.serviceData.childrenData.map((childData, idx) => {
                      const childInfo = booking.children?.[idx];
                      return (
                        <div
                          key={idx}
                          className="card bg-base-100 p-4 border border-base-300"
                        >
                          <h6 className="font-semibold mb-3">
                            {childInfo?.name || `Child ${idx + 1}`}
                          </h6>
                          <div className="space-y-2 text-sm">
                            {childData.subjects && (
                              <div>
                                <p className="font-medium mb-1">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {childData.subjects.map((subject, sidx) => (
                                    <span
                                      key={sidx}
                                      className="badge badge-primary badge-sm"
                                    >
                                      {subject}
                                    </span>
                                  ))}
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
                                  <p className="font-medium mb-2">Schedule:</p>
                                  <div className="space-y-2">
                                    {childData.schedule.map(
                                      (daySchedule, didx) => (
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
                                            daySchedule.dates.length > 0 && (
                                              <div className="ml-4 mt-1">
                                                <div className="flex flex-wrap gap-1">
                                                  {daySchedule.dates.map(
                                                    (dateInfo, daidx) => (
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
                            {childData.totalHours &&
                              childData.totalHours > 0 &&
                              booking.serviceData?.hourlyRate && (
                                <p className="font-semibold text-base mt-2 pt-2 border-t border-base-300">
                                  Cost: ₦
                                  {(
                                    childData.totalHours *
                                    booking.serviceData.hourlyRate
                                  ).toLocaleString()}{" "}
                                  <span className="text-xs font-normal text-gray-600">
                                    ({childData.totalHours} hours × ₦
                                    {booking.serviceData.hourlyRate.toLocaleString()}
                                    /hour)
                                  </span>
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {booking.serviceData.hourlyRate && (
                    <div className="mt-4 p-3 bg-info/10 rounded">
                      <p className="text-sm font-semibold">
                        Hourly Rate: ₦
                        {booking.serviceData.hourlyRate.toLocaleString()}/hour
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {booking.schedule.weekdays.map((day, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-base-200 rounded">
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
                                {day.dates && day.dates.length > 0 && (
                                  <div className="ml-4 text-xs">
                                    <p className="text-gray-600 mb-1">
                                      Specific dates:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {day.dates.map((dateInfo, dateIdx) => (
                                        <span
                                          key={dateIdx}
                                          className="badge badge-sm badge-ghost"
                                        >
                                          {new Date(
                                            dateInfo.date
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                          })}{" "}
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
              </div>
            </div>
          )}

          {/* Childcare Service Details */}
          {booking.serviceType === "childcare" && booking.serviceData && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Childcare Service Details
                </h5>

                <div className="space-y-4">
                  {/* Care Type */}
                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="font-semibold text-base">Care Type</h6>
                      <div className="badge badge-primary">
                        {booking.serviceData.careType === "daily"
                          ? "Daily Care"
                          : "Monthly Care"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Drop-off Time */}
                      {booking.serviceData.dropoffTime && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Drop-off Time
                          </div>
                          <div className="badge badge-outline badge-lg">
                            {booking.serviceData.dropoffTime}
                          </div>
                        </div>
                      )}

                      {/* Pick-up Time */}
                      {booking.serviceData.pickupTime && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Pick-up Time
                          </div>
                          <div className="badge badge-outline badge-lg">
                            {booking.serviceData.pickupTime}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {booking.serviceData.dailyRate && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Daily Rate
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            ₦{booking.serviceData.dailyRate.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {booking.serviceData.monthlyRate && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Monthly Rate
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            ₦{booking.serviceData.monthlyRate.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Per-Child Information */}
                  {booking.children?.map((child, index) => {
                    // Find matching childData from childrenData array
                    const childData = booking.serviceData?.childrenData?.find(
                      (cd) => cd.childId === child.id
                    );

                    return (
                      <div key={index} className="bg-base-100 p-4 rounded-lg">
                        <h6 className="font-semibold text-base mb-3">
                          {child.name} (Age {child.age})
                        </h6>

                        <div className="space-y-3">
                          {/* Care Type */}
                          {childData?.careType && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Care Type
                              </div>
                              <div className="badge badge-primary">
                                {childData.careType === "daily"
                                  ? "Daily Care"
                                  : "Monthly Care"}
                              </div>
                            </div>
                          )}

                          {/* Drop-off and Pick-up Times */}
                          <div className="grid grid-cols-2 gap-4">
                            {childData?.dropoffTime && (
                              <div>
                                <div className="text-sm text-gray-600 mb-1">
                                  Drop-off Time
                                </div>
                                <div className="badge badge-outline badge-lg">
                                  {childData.dropoffTime}
                                </div>
                              </div>
                            )}

                            {childData?.pickupTime && (
                              <div>
                                <div className="text-sm text-gray-600 mb-1">
                                  Pick-up Time
                                </div>
                                <div className="badge badge-outline badge-lg">
                                  {childData.pickupTime}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Total Days */}
                          {childData?.totalDays && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Total Days
                              </div>
                              <div className="badge badge-secondary badge-lg">
                                {childData.totalDays} days
                              </div>
                            </div>
                          )}

                          {/* Special Needs */}
                          {(childData?.specialNeeds || child.specialNeeds) && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Special Needs
                              </div>
                              <div className="bg-base-200 p-3 rounded">
                                <p className="text-sm whitespace-pre-wrap">
                                  {childData?.specialNeeds ||
                                    child.specialNeeds}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Cost Calculation for this child */}
                          {childData && (
                            <div className="mt-3 pt-3 border-t border-base-300">
                              <div className="text-sm font-semibold text-primary">
                                {childData.isMonthSelected ||
                                childData.careType === "monthly" ? (
                                  <>
                                    Cost: ₦
                                    {(
                                      booking.serviceData?.monthlyRate || 0
                                    ).toLocaleString()}
                                    <span className="text-xs font-normal text-gray-600 ml-2">
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
                                    <span className="text-xs font-normal text-gray-600 ml-2">
                                      ({childData.totalDays || 0}{" "}
                                      {childData.totalDays === 1
                                        ? "day"
                                        : "days"}{" "}
                                      × ₦
                                      {(
                                        booking.serviceData?.dailyRate || 0
                                      ).toLocaleString()}
                                      /day)
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Homeschooling Service Details */}
          {booking.serviceType === "homeschooling" && booking.serviceData && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Homeschooling Service Details
                </h5>

                <div className="space-y-4">
                  {booking.children?.map((child, index) => {
                    // Find matching childData from childrenData array
                    const childData = booking.serviceData?.childrenData?.find(
                      (cd) => cd.childId === child.id
                    );

                    return (
                      <div key={index} className="bg-base-100 p-4 rounded-lg">
                        <h6 className="font-semibold text-base mb-3">
                          {child.name} (Age {child.age})
                        </h6>

                        <div className="space-y-3">
                          {/* Subjects */}
                          {childData?.selectedSubjects &&
                            childData.selectedSubjects.length > 0 && (
                              <div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Subjects
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {childData.selectedSubjects.map(
                                    (subject: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="badge badge-primary"
                                      >
                                        {subject}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Grade Level */}
                          {(childData?.gradeLevel || child.class) && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Grade Level
                              </div>
                              <div className="badge badge-outline badge-lg">
                                {childData?.gradeLevel || child.class}
                              </div>
                            </div>
                          )}

                          {/* Curriculum */}
                          {childData?.curriculum && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Curriculum
                              </div>
                              <div className="badge badge-secondary badge-lg">
                                {childData.curriculum}
                              </div>
                            </div>
                          )}

                          {/* Learning Style */}
                          {childData?.learningStyle && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Learning Style
                              </div>
                              <div className="badge badge-accent badge-lg">
                                {childData.learningStyle}
                              </div>
                            </div>
                          )}

                          {/* Selected Term */}
                          {childData?.selectedTerm && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Selected Term
                              </div>
                              <div className="badge badge-info badge-lg">
                                {childData.selectedTerm}
                              </div>
                            </div>
                          )}

                          {/* Educational Goals */}
                          {childData?.educationalGoals && (
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                Educational Goals
                              </div>
                              <div className="bg-base-200 p-3 rounded">
                                <p className="text-sm whitespace-pre-wrap">
                                  {childData.educationalGoals}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Cost Calculation for this child */}
                          {booking.serviceData?.termRate && (
                            <div className="mt-3 pt-3 border-t border-base-300">
                              <div className="text-sm font-semibold text-primary">
                                Cost: ₦
                                {booking.serviceData.termRate.toLocaleString()}
                                <span className="text-xs font-normal text-gray-600 ml-2">
                                  (per term)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Holiday Camps Service Details */}
          {booking.serviceType === "holiday-camps" && booking.serviceData && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Holiday Camp Service Details
                </h5>

                <div className="space-y-4">
                  {/* Camp Weeks */}
                  {booking.serviceData.campWeeks &&
                    booking.serviceData.campWeeks.length > 0 && (
                      <div className="bg-base-100 p-4 rounded-lg">
                        <h6 className="font-semibold text-base mb-3">
                          Camp Weeks
                        </h6>
                        <div className="space-y-3">
                          {booking.serviceData.campWeeks.map(
                            (
                              week: {
                                startDate: string;
                                endDate: string;
                                weekNumber: number;
                              },
                              index: number
                            ) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-base-200 rounded"
                              >
                                <div>
                                  <div className="font-medium">
                                    Week {week.weekNumber}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(
                                      week.startDate
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {new Date(week.endDate).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </div>
                                </div>
                                {booking.serviceData?.weeklyRate && (
                                  <div className="badge badge-primary badge-lg">
                                    ₦
                                    {booking.serviceData.weeklyRate.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="bg-base-100 p-4 rounded-lg">
                    <h6 className="font-semibold text-base mb-3">
                      Children Enrolled
                    </h6>
                    <div className="space-y-3">
                      {booking.children?.map((child, index) => {
                        // Find matching childData from childrenData array
                        const childData =
                          booking.serviceData?.childrenData?.find(
                            (cd) => cd.childId === child.id
                          );

                        return (
                          <div
                            key={index}
                            className="p-3 bg-base-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10">
                                  <span className="text-sm">
                                    {child.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{child.name}</div>
                                <div className="text-sm text-gray-600">
                                  Age {child.age}
                                </div>
                                {"camperId" in (childData || {}) &&
                                  childData?.camperId && (
                                    <div className="text-xs font-mono font-semibold text-primary mt-1">
                                      Camper ID: {childData.camperId}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Camp Weeks for this child */}
                            {childData?.campWeeks &&
                              childData.campWeeks.length > 0 && (
                                <div className="ml-13 space-y-2">
                                  <div className="text-sm text-gray-600">
                                    Camp Weeks:
                                  </div>
                                  {childData.campWeeks.map((week, wIdx) => (
                                    <div
                                      key={wIdx}
                                      className="flex items-center justify-between p-2 bg-base-100 rounded text-sm"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          Week {week.weekNumber}
                                        </span>
                                        <span className="text-gray-600 ml-2">
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
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Cost Calculation for this child */}
                            {childData?.campWeeks &&
                              booking.serviceData?.weeklyRate && (
                                <div className="mt-3 pt-3 border-t border-base-300">
                                  <div className="text-sm font-semibold text-primary">
                                    Cost: ₦
                                    {(
                                      childData.campWeeks.length *
                                      booking.serviceData.weeklyRate
                                    ).toLocaleString()}
                                    <span className="text-xs font-normal text-gray-600 ml-2">
                                      ({childData.campWeeks.length}{" "}
                                      {childData.campWeeks.length === 1
                                        ? "week"
                                        : "weeks"}{" "}
                                      × ₦
                                      {booking.serviceData.weeklyRate.toLocaleString()}
                                      /week)
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Space Rental / Event Service Details */}
          {booking.serviceType === "space-rental" && booking.serviceData && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h5 className="card-title text-lg mb-4">
                  Event Service Details
                </h5>

                <div className="space-y-4">
                  {/* Event Information */}
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h6 className="font-semibold text-base mb-3">
                      Event Information
                    </h6>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Event Type */}
                      {booking.serviceData.eventType && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Event Type
                          </div>
                          <div className="badge badge-primary badge-lg">
                            {booking.serviceData.eventType}
                          </div>
                        </div>
                      )}

                      {/* Venue Type */}
                      {booking.serviceData.venueType && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Venue Type
                          </div>
                          <div className="badge badge-secondary badge-lg">
                            {booking.serviceData.venueType
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </div>
                        </div>
                      )}

                      {/* Event Date */}
                      {booking.serviceData.eventDate && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Event Date
                          </div>
                          <div className="font-medium">
                            {new Date(
                              booking.serviceData.eventDate
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}

                      {/* Event Time */}
                      {booking.serviceData.eventTime && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Event Time
                          </div>
                          <div className="font-medium">
                            {booking.serviceData.eventTime}
                          </div>
                        </div>
                      )}

                      {/* Expected Guests */}
                      {booking.serviceData.expectedGuests && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Expected Guests
                          </div>
                          <div className="font-medium">
                            {booking.serviceData.expectedGuests} guests
                          </div>
                        </div>
                      )}

                      {/* Base Rate */}
                      {booking.serviceData.baseRate && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Base Rate
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            ₦{booking.serviceData.baseRate.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extra Services */}
                  {booking.serviceData.extraServices &&
                    booking.serviceData.extraServices.length > 0 && (
                      <div className="bg-base-100 p-4 rounded-lg">
                        <h6 className="font-semibold text-base mb-3">
                          Extra Services
                        </h6>
                        <div className="space-y-2">
                          {booking.serviceData.extraServices.map(
                            (
                              service: {
                                service: string;
                                quantity?: number;
                                rate?: number;
                              },
                              index: number
                            ) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-base-200 rounded"
                              >
                                <div>
                                  <div className="font-medium">
                                    {service.service
                                      .split("-")
                                      .map(
                                        (word: string) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}
                                  </div>
                                  {service.quantity && (
                                    <div className="text-sm text-gray-600">
                                      Quantity: {service.quantity}
                                    </div>
                                  )}
                                </div>
                                {service.rate && (
                                  <div className="badge badge-accent badge-lg">
                                    ₦{service.rate.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Caution Fee */}
                  {booking.serviceData.cautionFee && (
                    <div className="bg-base-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-base">
                            Caution Fee
                          </div>
                          <div className="text-sm text-gray-600">
                            Refundable deposit
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-warning">
                          ₦{booking.serviceData.cautionFee.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kiddies Enrichment Service Details */}
          {booking.serviceType === "kiddies-enrichment" &&
            booking.serviceData && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h5 className="card-title text-lg mb-4">
                    Kiddies Enrichment Service Details
                  </h5>

                  <div className="space-y-4">
                    {booking.children?.map((child, index) => {
                      // Find matching childData from childrenData array
                      const childData = booking.serviceData?.childrenData?.find(
                        (cd) => cd.childId === child.id
                      );

                      return (
                        <div key={index} className="bg-base-100 p-4 rounded-lg">
                          <h6 className="font-semibold text-base mb-3">
                            {child.name} (Age {child.age})
                          </h6>

                          <div className="space-y-3">
                            {/* Programs */}
                            {childData?.selectedPrograms &&
                              childData.selectedPrograms.length > 0 && (
                                <div>
                                  <div className="text-sm text-gray-600 mb-2">
                                    Selected Programs
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {childData.selectedPrograms.map(
                                      (program: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="badge badge-primary"
                                        >
                                          {program}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Event Date and Time */}
                            {(childData?.eventDate ||
                              childData?.startTime ||
                              childData?.hours) && (
                              <div className="bg-base-200 p-3 rounded">
                                <div className="text-sm text-gray-600 mb-2 font-medium">
                                  Event Details
                                </div>
                                <div className="space-y-2 text-sm">
                                  {childData?.eventDate && (
                                    <p>
                                      <span className="font-medium">Date:</span>{" "}
                                      {new Date(
                                        childData.eventDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  )}
                                  {childData?.startTime && (
                                    <p>
                                      <span className="font-medium">
                                        Start Time:
                                      </span>{" "}
                                      {childData.startTime}
                                    </p>
                                  )}
                                  {childData?.hours && (
                                    <p>
                                      <span className="font-medium">
                                        Duration:
                                      </span>{" "}
                                      <span className="badge badge-accent badge-sm">
                                        {childData.hours}{" "}
                                        {childData.hours === 1
                                          ? "hour"
                                          : "hours"}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Interests */}
                            {childData?.interests && (
                              <div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Interests
                                </div>
                                <div className="bg-base-200 p-3 rounded">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {childData.interests}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Parent Goals */}
                            {childData?.parentGoals && (
                              <div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Parent Goals
                                </div>
                                <div className="bg-base-200 p-3 rounded">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {childData.parentGoals}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Cost Calculation */}
                            {childData?.hours &&
                              booking.serviceData?.hourlyRate && (
                                <div className="mt-3 pt-3 border-t border-base-300">
                                  <div className="text-sm font-semibold text-primary">
                                    Cost: ₦
                                    {(
                                      childData.hours *
                                      booking.serviceData.hourlyRate
                                    ).toLocaleString()}
                                    <span className="text-xs font-normal text-gray-600 ml-2">
                                      ({childData.hours}{" "}
                                      {childData.hours === 1 ? "hour" : "hours"}{" "}
                                      × ₦
                                      {booking.serviceData.hourlyRate.toLocaleString()}
                                      /hour)
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
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
