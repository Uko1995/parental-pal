"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PaymentCharts from "./PaymentCharts";
import PaymentTable from "./PaymentTable";

export interface PaymentInterface {
  _id: string;
  bookingId: string;
  childName: string;
  parentName: string;
  parentEmail: string;
  service: string;
  amount: number;
  amountPaid: number;
  paymentMethod: "bank-transfer" | "cash" | "card" | "mobile-money";
  paymentStatus: "pending" | "partial" | "completed" | "failed" | "refunded";
  paymentDate?: Date;
  dueDate: Date;
  installments?: {
    amount: number;
    dueDate: Date;
    status: "pending" | "paid" | "overdue";
    paidDate?: Date;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAnalytics {
  totalPayments: number;
  totalRevenue: number;
  pendingAmount: number;
  completedPayments: number;
  overduePayments: number;
  averagePayment: number;
  monthlyRevenue: { month: string; revenue: number; payments: number }[];
  paymentsByService: { service: string; amount: number; count: number }[];
  paymentsByStatus: { status: string; count: number; amount: number }[];
  paymentMethodStats: { method: string; count: number; amount: number }[];
}

function mapBookingPaymentStatus(
  status?: string,
): PaymentInterface["paymentStatus"] {
  switch (status) {
    case "paid":
      return "completed";
    case "refunded":
      return "refunded";
    case "failed":
      return "failed";
    case "partial":
      return "partial";
    default:
      return "pending";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentInterface[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments and analytics
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payments from bookings API (payments are derived from bookings)
      const paymentsResponse = await fetch("/api/bookings");
      if (!paymentsResponse.ok) {
        throw new Error("Failed to fetch payments data");
      }

      const paymentsData = await paymentsResponse.json();

      // Transform bookings into payment records
      const transformedPayments: PaymentInterface[] =
        paymentsData.bookings?.map((booking: Record<string, unknown>) => {
          // Extract child names from the children array
          const children = (booking.children as Array<{ name: string }>) || [];
          const childNames =
            children.map((child) => child.name).join(", ") || "N/A";

          return {
            _id: booking._id,
            bookingId: booking._id,
            childName: childNames,
            parentName: booking.parentName || "N/A",
            parentEmail: booking.parentEmail || "N/A",
            service: booking.serviceType || "N/A",
            amount:
              (booking.pricing as { totalAmount?: number })?.totalAmount ||
              (booking as { totalCost?: number }).totalCost ||
              0,
            amountPaid:
              (booking.payment as { paidAmount?: number })?.paidAmount || 0,
            paymentMethod:
              (booking.payment as { method?: string })?.method || "bank-transfer",
            paymentStatus: mapBookingPaymentStatus(
              (booking.payment as { status?: string })?.status,
            ),
            paymentDate:
              (booking.payment as { paymentDate?: string })?.paymentDate
                ? new Date(
                    (booking.payment as { paymentDate: string }).paymentDate,
                  )
                : undefined,
            dueDate:
              booking.dueDate && typeof booking.dueDate === "string"
                ? new Date(booking.dueDate)
                : new Date(),
            installments: Array.isArray(booking.installments)
              ? booking.installments
              : [],
            notes:
              typeof booking.paymentNotes === "string"
                ? booking.paymentNotes
                : undefined,
            createdAt:
              booking.createdAt && typeof booking.createdAt === "string"
                ? new Date(booking.createdAt)
                : new Date(),
            updatedAt:
              booking.updatedAt && typeof booking.updatedAt === "string"
                ? new Date(booking.updatedAt)
                : new Date(),
          };
        }) || [];

      setPayments(transformedPayments);

      // Calculate analytics
      const totalPayments = transformedPayments.length;
      // Total revenue = only count bookings with payment.status === 'paid'
      const totalRevenue =
        paymentsData.bookings
          ?.filter(
            (booking: Record<string, unknown>) =>
              (booking.payment as { status?: string })?.status === "paid"
          )
          .reduce(
            (sum: number, booking: Record<string, unknown>) =>
              sum +
              ((booking.pricing as { totalAmount?: number })?.totalAmount || 0),
            0
          ) || 0;
      // Pending amount = only count bookings with payment.status === 'pending'
      const pendingAmount =
        paymentsData.bookings
          ?.filter(
            (booking: Record<string, unknown>) =>
              (booking.payment as { status?: string })?.status === "pending"
          )
          .reduce(
            (sum: number, booking: Record<string, unknown>) =>
              sum +
              ((booking.pricing as { totalAmount?: number })?.totalAmount || 0),
            0
          ) || 0;
      const completedPayments = transformedPayments.filter(
        (p) => p.paymentStatus === "completed"
      ).length;
      const overduePayments = transformedPayments.filter(
        (p) => p.paymentStatus === "pending" && new Date() > new Date(p.dueDate)
      ).length;
      const averagePayment =
        totalPayments > 0 ? totalRevenue / totalPayments : 0;

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        const monthPayments = transformedPayments.filter((p) => {
          if (!p.paymentDate) return false;
          const paymentMonth = p.paymentDate.getMonth();
          const paymentYear = p.paymentDate.getFullYear();
          return (
            paymentMonth === date.getMonth() &&
            paymentYear === date.getFullYear()
          );
        });

        monthlyRevenue.push({
          month: monthStr,
          revenue: monthPayments.reduce(
            (sum, p) => sum + (p.amountPaid || 0),
            0
          ),
          payments: monthPayments.length,
        });
      }

      // Payment by service (paid bookings only)
      const serviceStats = new Map<string, { amount: number; count: number }>();
      transformedPayments
        .filter((p) => p.paymentStatus === "completed")
        .forEach((p) => {
          const revenue = p.amountPaid || p.amount || 0;
          const existing = serviceStats.get(p.service) || {
            amount: 0,
            count: 0,
          };
          serviceStats.set(p.service, {
            amount: existing.amount + revenue,
            count: existing.count + 1,
          });
        });
      const paymentsByService = Array.from(serviceStats.entries()).map(
        ([service, stats]) => ({
          service: service
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          ...stats,
        }),
      );

      // Payments by status
      const statusStats = new Map<string, { count: number; amount: number }>();
      transformedPayments.forEach((p) => {
        const existing = statusStats.get(p.paymentStatus) || {
          count: 0,
          amount: 0,
        };
        statusStats.set(p.paymentStatus, {
          count: existing.count + 1,
          amount: existing.amount + (p.amountPaid || 0),
        });
      });
      const paymentsByStatus = Array.from(statusStats.entries()).map(
        ([status, stats]) => ({
          status,
          ...stats,
        })
      );

      // Payment method stats
      const methodStats = new Map<string, { count: number; amount: number }>();
      transformedPayments.forEach((p) => {
        const existing = methodStats.get(p.paymentMethod) || {
          count: 0,
          amount: 0,
        };
        methodStats.set(p.paymentMethod, {
          count: existing.count + 1,
          amount: existing.amount + (p.amountPaid || 0),
        });
      });
      const paymentMethodStats = Array.from(methodStats.entries()).map(
        ([method, stats]) => ({
          method,
          ...stats,
        })
      );

      setAnalytics({
        totalPayments,
        totalRevenue,
        pendingAmount,
        completedPayments,
        overduePayments,
        averagePayment,
        monthlyRevenue,
        paymentsByService,
        paymentsByStatus,
        paymentMethodStats,
      });
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load payments data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="skeleton h-8 w-48 mb-2"></div>
            <div className="skeleton h-4 w-64"></div>
          </div>
          <div className="skeleton h-10 w-24"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat bg-base-100 shadow-lg rounded-2xl">
              <div className="stat-figure">
                <div className="skeleton w-8 h-8 rounded"></div>
              </div>
              <div className="skeleton h-4 w-20 mb-2"></div>
              <div className="skeleton h-8 w-16 mb-2"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="skeleton h-64 w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-12 w-12 rounded"></div>
                    <div>
                      <div className="skeleton h-4 w-32 mb-2"></div>
                      <div className="skeleton h-3 w-20"></div>
                    </div>
                  </div>
                  <div className="skeleton h-6 w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading payments: {error}</span>
        <button className="btn btn-sm btn-outline" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track and manage all payment records and analytics
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={fetchData}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      {analytics && <PaymentCharts analytics={analytics} />}

      {/* Payments Table */}
      <PaymentTable payments={payments} onRefresh={fetchData} />
    </div>
  );
}
