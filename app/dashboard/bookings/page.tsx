"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import BookingsTable from "./BookingsTable";
import BookingCharts from "./BookingCharts";
import AddBookingModal from "./AddBookingModal";

import ViewBookingModal from "./ViewBookingModal";

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
  schedule?: Schedule;
  children?: Child[];
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
    transactionId?: string;
    method?: string;
  };
  pricing?: { totalAmount?: number };
}

interface BookingAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageBookingValue: number;
  serviceStats: { name: string; value: number }[];
  monthlyTrends: { month: string; bookings: number; revenue: number }[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<BookingAnalytics>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    averageBookingValue: 0,
    serviceStats: [],
    monthlyTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const addModalRef = useRef<{ resetForm: () => void } | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched bookings data:", data);
        setBookings(data.bookings || []);
        setAnalytics({
          ...data.analytics,
          averageBookingValue:
            data.analytics.totalBookings > 0
              ? data.analytics.totalRevenue / data.analytics.totalBookings
              : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching bookings data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSuccess = () => {
    fetchData(); // Refresh the data
    setIsAddModalOpen(false);
    if (addModalRef.current) {
      addModalRef.current.resetForm();
    }
  };

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleBookingDeleted = (bookingId: string) => {
    setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      totalBookings: prev.totalBookings - 1,
      // Add more analytics updates as needed
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 w-full"></div>
          ))}
        </div>
        <div className="skeleton h-96 w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage all service bookings and appointments
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalBookings}
                </p>
              </div>
              <div className="p-3 ">
                <CalendarDaysIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-success">
                  {analytics.confirmedBookings}
                </p>
              </div>
              <div className="p-3 ">
                <CheckCircleIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {analytics.pendingBookings}
                </p>
              </div>
              <div className="p-3 ">
                <ClockIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <div className="p-3 ">
                <BanknotesIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <BookingCharts analytics={analytics} />

      {/* Bookings Table */}
      <BookingsTable
        bookings={bookings}
        onView={handleView}
        onBookingDeleted={handleBookingDeleted}
      />

      {/* Modals */}
      <AddBookingModal
        ref={addModalRef}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <ViewBookingModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onPaymentConfirmed={async () => {
          await fetchData();
          if (selectedBooking) {
            const res = await fetch(`/api/bookings/${selectedBooking._id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.booking) {
                setSelectedBooking({
                  ...selectedBooking,
                  ...data.booking,
                  _id: data.booking._id?.toString() || selectedBooking._id,
                  totalCost:
                    data.booking.pricing?.totalAmount ??
                    selectedBooking.totalCost,
                });
              }
            }
          }
        }}
      />
    </div>
  );
}
