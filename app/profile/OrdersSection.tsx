"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Order {
  _id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  orderType: "softcopy" | "paperback";
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discountAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  downloadCount?: number;
  downloadToken?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "softcopy" | "paperback">("all");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders/my-orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownload = async (
    orderId: string,
    orderNumber: string,
    downloadToken?: string
  ) => {
    try {
      if (!downloadToken) {
        toast.error("Download token not available");
        return;
      }

      // Use the existing download API with token
      const downloadUrl = `/api/products/download?token=${downloadToken}&orderId=${orderId}`;

      // Open the download URL in a new window/tab
      window.open(downloadUrl, "_blank");

      toast.success("Download started!");

      // Refresh orders to update download count
      setTimeout(() => {
        fetchOrders();
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const getStatusBadge = (
    status: Order["paymentStatus"] | Order["orderStatus"],
    type: "payment" | "order"
  ) => {
    if (type === "payment") {
      const styles = {
        pending: "badge-warning",
        paid: "badge-success",
        failed: "badge-error",
        refunded: "badge-info",
      };
      return styles[status as Order["paymentStatus"]] || "badge-ghost";
    }
    const styles = {
      pending: "badge-warning",
      processing: "badge-info",
      shipped: "badge-primary",
      delivered: "badge-success",
      cancelled: "badge-error",
    };
    return styles[status as Order["orderStatus"]] || "badge-ghost";
  };

  const getStatusIcon = (status: Order["orderStatus"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.orderType === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-[#90AC19]"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600 mt-1">
            View and manage your order history
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-outline"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter("softcopy")}
            className={`btn btn-sm ${
              filter === "softcopy" ? "btn-primary" : "btn-outline"
            }`}
          >
            PDF ({orders.filter((o) => o.orderType === "softcopy").length})
          </button>
          <button
            onClick={() => setFilter("paperback")}
            className={`btn btn-sm ${
              filter === "paperback" ? "btn-primary" : "btn-outline"
            }`}
          >
            Paperback (
            {orders.filter((o) => o.orderType === "paperback").length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders found.`}
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image */}
                  <div className="shrink-0">
                    <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {order.productThumbnail ? (
                        <Image
                          src={order.productThumbnail}
                          alt={order.productTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {order.productTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          by {order.author}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Order #</p>
                        <p className="font-mono text-sm font-semibold">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.orderStatus)}
                        <span
                          className={`badge ${getStatusBadge(
                            order.orderStatus,
                            "order"
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <span
                        className={`badge ${getStatusBadge(
                          order.paymentStatus,
                          "payment"
                        )}`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Paid"
                          : order.paymentStatus}
                      </span>
                      <span className="badge badge-outline">
                        {order.orderType === "softcopy" ? "PDF" : "Paperback"}
                      </span>
                      {order.quantity > 1 && (
                        <span className="badge badge-ghost">
                          Qty: {order.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t">
                      <div>
                        <p className="text-2xl font-bold text-[#90AC19]">
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {order.orderType === "softcopy" &&
                          order.paymentStatus === "paid" && (
                            <button
                              onClick={() =>
                                handleDownload(
                                  order._id,
                                  order.orderNumber,
                                  order.downloadToken
                                )
                              }
                              className="btn btn-sm btn-primary gap-2"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              Download PDF
                              {order.downloadCount !== undefined &&
                                order.downloadCount > 0 && (
                                  <span className="badge badge-sm">
                                    {order.downloadCount}
                                  </span>
                                )}
                            </button>
                          )}
                        <Link
                          href={`/products/${order.productSlug}`}
                          className="btn btn-sm btn-outline gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Product
                        </Link>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Shipping Address:
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.address},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state},{" "}
                          {order.shippingAddress.country}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Tracking:</span>{" "}
                            {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
