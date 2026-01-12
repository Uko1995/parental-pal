"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import OrdersTable from "./OrdersTable";
import OrdersCharts from "./OrdersCharts";
import ViewOrderModal from "./ViewOrderModal";

interface Order {
  _id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productThumbnail: string;
  type: "softcopy" | "paperback";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  delivery?: {
    address: string;
    city: string;
    state: string;
    estimatedDate: Date;
    actualDate?: Date;
  };
  payment: {
    amount: number;
    status: "pending" | "paid" | "failed";
    reference: string;
    provider: string;
  };
  download?: {
    token: string;
    expiresAt: Date;
    downloadCount: number;
    maxDownloads: number;
  };
  status: "pending" | "paid" | "shipped" | "delivered" | "failed";
  emailsSent: {
    orderConfirmation: boolean;
    downloadLink: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface OrdersStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  softcopyOrders: number;
  paperbackOrders: number;
  averageOrderValue: number;
  typeBreakdown: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    softcopyOrders: 0,
    paperbackOrders: 0,
    averageOrderValue: 0,
    typeBreakdown: [],
    statusBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateStats = (ordersData: Order[]) => {
    const totalRevenue = ordersData
      ?.filter((o) => o.payment.status === "paid")
      .reduce((sum, order) => sum + order.payment.amount, 0);

    const pendingOrders = ordersData?.filter(
      (o) => o.status === "pending"
    ).length;
    const completedOrders = ordersData?.filter(
      (o) =>
        o.status === "delivered" ||
        (o.type === "softcopy" && o.status === "paid")
    ).length;
    const softcopyOrders = ordersData?.filter(
      (o) => o.type === "softcopy"
    ).length;
    const paperbackOrders = ordersData?.filter(
      (o) => o.type === "paperback"
    ).length;
    const averageOrderValue =
      ordersData?.length > 0 ? totalRevenue / ordersData.length : 0;

    // Type breakdown
    const typeMap = new Map<string, { count: number; revenue: number }>();
    ordersData?.forEach((order) => {
      const existing = typeMap.get(order.type) || { count: 0, revenue: 0 };
      typeMap.set(order.type, {
        count: existing.count + 1,
        revenue:
          existing.revenue +
          (order.payment.status === "paid" ? order.payment.amount : 0),
      });
    });

    const typeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...data,
    }));

    // Status breakdown
    const statusMap = new Map<string, number>();
    ordersData?.forEach((order) => {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        count,
      })
    );

    setStats({
      totalOrders: ordersData?.length,
      pendingOrders,
      completedOrders,
      totalRevenue,
      softcopyOrders,
      paperbackOrders,
      averageOrderValue,
      typeBreakdown,
      statusBreakdown,
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateOrder = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-base-300 rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-base-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-base-300 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-base-300 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-base-300 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-base-300 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="h-6 w-40 bg-base-300 rounded animate-pulse mb-4"></div>
                <div className="h-64 bg-base-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-base-300 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-base-300 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-base-300 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-base-content/70 mt-1">
            Manage product orders and deliveries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Total Orders</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.totalOrders || 0}
                </h3>
                <p className="text-sm text-base-content/70 mt-1">
                  {stats?.completedOrders || 0} completed
                </p>
              </div>
              <ShoppingBagIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-1">
                  ₦{stats?.totalRevenue?.toLocaleString() || "0"}
                </h3>
                <p className="text-sm text-base-content/70 mt-1">
                  ₦
                  {Math.round(stats?.averageOrderValue).toLocaleString() || "0"}{" "}
                  avg
                </p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Pending</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.pendingOrders || 0}
                </h3>
                <p className="text-sm text-warning mt-1">Awaiting payment</p>
              </div>
              <ClockIcon className="w-12 h-12 text-warning" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Order Types</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.softcopyOrders || 0}/{stats?.paperbackOrders || 0}
                </h3>
                <p className="text-sm text-base-content/70 mt-1">
                  PDF / Paperback
                </p>
              </div>
              <TruckIcon className="w-12 h-12 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <OrdersCharts orders={orders} stats={stats} />

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        onViewOrder={handleViewOrder}
        onUpdateOrder={handleUpdateOrder}
      />

      {/* View Modal */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={handleUpdateOrder}
        />
      )}
    </div>
  );
}
