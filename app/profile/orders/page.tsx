"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "softcopy" | "paperback">("all");

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders/my-orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/profile/orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const generateDownloadLink = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}/generate-download-link`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        window.open(data.data.downloadPageUrl, "_blank");
      } else {
        toast.error(data.error || "Failed to generate download link");
      }
    } catch {
      toast.error("Failed to generate download link");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderType === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBagIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            No Orders Yet
          </h1>
          <p className="text-gray-600 mb-8">
            You haven&apos;t purchased any books yet. Start exploring!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            My Orders
          </h1>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "softcopy", label: "Digital" },
              { key: "paperback", label: "Paperback" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-[#90AC19] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`badge ${getStatusBadge(
                      order.paymentStatus,
                      "payment"
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                  {order.orderType === "paperback" && (
                    <span
                      className={`badge ${getStatusBadge(
                        order.orderStatus,
                        "order"
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6 flex gap-4">
                {/* Product Image */}
                <div className="relative w-20 h-28 shrink-0">
                  <Image
                    src={order.productThumbnail}
                    alt={order.productTitle}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${order.productSlug}`}
                    className="font-semibold text-gray-900 hover:text-[#90AC19] line-clamp-2"
                  >
                    {order.productTitle}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    by {order.author}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span
                      className={`badge badge-sm ${
                        order.orderType === "softcopy"
                          ? "badge-success"
                          : "badge-info"
                      }`}
                    >
                      {order.orderType === "softcopy" ? "PDF" : "Paperback"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Qty: {order.quantity}
                    </span>
                  </div>

                  {/* Shipping Status for Paperback */}
                  {order.orderType === "paperback" &&
                    order.paymentStatus === "paid" && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        {getStatusIcon(order.orderStatus)}
                        <span className="text-gray-700">
                          {order.orderStatus === "shipped" ? (
                            <>
                              Shipped{" "}
                              {order.trackingNumber && (
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {order.trackingNumber}
                                </span>
                              )}
                            </>
                          ) : order.orderStatus === "delivered" ? (
                            "Delivered"
                          ) : order.orderStatus === "processing" ? (
                            "Being prepared for shipping"
                          ) : (
                            "Awaiting processing"
                          )}
                        </span>
                      </div>
                    )}
                </div>

                {/* Price & Actions */}
                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="text-lg font-bold text-[#90AC19]">
                      ₦{order.totalAmount.toLocaleString()}
                    </p>
                    {order.discountAmount > 0 && (
                      <p className="text-xs text-gray-500">
                        Saved: ₦{order.discountAmount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    {order.orderType === "softcopy" &&
                      order.paymentStatus === "paid" && (
                        <button
                          onClick={() => generateDownloadLink(order._id)}
                          className="flex items-center justify-center gap-1 bg-[#90AC19] hover:bg-[#7A9216] text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Download
                        </button>
                      )}

                    <Link
                      href={`/profile/orders/${order._id}`}
                      className="flex items-center justify-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="text-[#90AC19] hover:text-[#7A9216] font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
