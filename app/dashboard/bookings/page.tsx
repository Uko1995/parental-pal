"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import BookingCharts from "./BookingCharts";
import BookingsTable from "./BookingsTable";
import AddBookingModal from "./AddBookingModal";
import ViewBookingModal from "./ViewBookingModal";

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
  payment?: {
    status?: "pending" | "paid" | "refunded";
    paidAmount?: number;
    transactionId?: string;
    method?: string;
  };
  pricing?: { totalAmount?: number };
  driveFolderUrl?: string;
  serviceData?: { campSeasonId?: string };
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
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const addBookingModalRef = useRef<{ resetForm: () => void }>(null);

  const refreshSelectedBooking = useCallback(async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.booking) return;

    setSelectedBooking((current) => {
      if (!current || current._id !== bookingId) return current;
      return {
        ...current,
        ...data.booking,
        _id: data.booking._id?.toString() || current._id,
        totalCost:
          data.booking.pricing?.totalAmount ?? current.totalCost,
      };
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      const nextBookings = (data.bookings || []) as Booking[];
      setBookings(nextBookings);

      const apiAnalytics = data.analytics || {};
      const paidCount = nextBookings.filter(
        (b) => b.payment?.status === "paid",
      ).length;

      setAnalytics({
        totalBookings: apiAnalytics.totalBookings ?? nextBookings.length,
        confirmedBookings: apiAnalytics.confirmedBookings ?? 0,
        pendingBookings: apiAnalytics.pendingBookings ?? 0,
        cancelledBookings: apiAnalytics.cancelledBookings ?? 0,
        totalRevenue: apiAnalytics.totalRevenue ?? 0,
        pendingRevenue: apiAnalytics.pendingRevenue ?? 0,
        averageBookingValue:
          paidCount > 0
            ? (apiAnalytics.totalRevenue ?? 0) / paidCount
            : 0,
        serviceStats: apiAnalytics.serviceStats ?? [],
        monthlyTrends: apiAnalytics.monthlyTrends ?? [],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load bookings";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSuccess = (options?: { keepOpen?: boolean }) => {
    fetchData();
    if (!options?.keepOpen) {
      setIsAddModalOpen(false);
      addBookingModalRef.current?.resetForm();
    }
  };

  const handleBookingDeleted = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    if (selectedBooking?._id === bookingId) {
      setIsViewModalOpen(false);
      setSelectedBooking(null);
    }
    fetchData();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-[#90AC19]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Bookings</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Manage bookings, payments, and invoices
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-outline btn-sm gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/70">
                      Total Bookings
                    </h3>
                    <p className="text-3xl font-bold text-[#90AC19]">
                      {analytics.totalBookings}
                    </p>
                  </div>
                  <CalendarDaysIcon className="w-8 h-8 text-[#90AC19]" />
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/70">
                      Paid Revenue
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/70">
                      Pending
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {analytics.pendingBookings}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {formatCurrency(analytics.pendingRevenue)} unpaid
                    </p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/70">
                      Cancelled
                    </h3>
                    <p className="text-3xl font-bold text-red-600">
                      {analytics.cancelledBookings}
                    </p>
                  </div>
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <BookingCharts analytics={analytics} />
        </>
      )}

      <BookingsTable
        bookings={bookings}
        onView={(booking) => {
          setSelectedBooking(booking);
          setIsViewModalOpen(true);
        }}
        onBookingDeleted={handleBookingDeleted}
      />

      <AddBookingModal
        ref={addBookingModalRef}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          addBookingModalRef.current?.resetForm();
        }}
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
            await refreshSelectedBooking(selectedBooking._id);
          }
        }}
        onBookingUpdated={async () => {
          await fetchData();
          if (selectedBooking) {
            await refreshSelectedBooking(selectedBooking._id);
          }
        }}
      />
    </div>
  );
}
