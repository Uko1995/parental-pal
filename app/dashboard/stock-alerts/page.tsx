"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface StockProduct {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  stock: number;
  sku?: string;
}

interface StockData {
  threshold: number;
  lowStock: StockProduct[];
  outOfStock: StockProduct[];
}

export default function StockAlertsPage() {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchStockData = useCallback(async () => {
    try {
      const response = await fetch("/api/products/stock-alerts");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const sendAlert = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/products/stock-alerts", {
        method: "POST",
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to send alert");
      }
    } catch {
      toast.error("Failed to send alert");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-300 rounded-xl"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Failed to load stock data
        </div>
      </div>
    );
  }

  const totalAlerts = data.lowStock.length + data.outOfStock.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CubeIcon className="w-7 h-7 text-[#90AC19]" />
            Stock Alerts
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage inventory levels
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={fetchStockData}
            className="flex items-center gap-2 btn btn-outline btn-sm"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={sendAlert}
            disabled={sending || totalAlerts === 0}
            className="flex items-center gap-2 btn btn-primary btn-sm bg-[#90AC19] hover:bg-[#7A9216] border-none disabled:opacity-50"
          >
            <EnvelopeIcon className="w-4 h-4" />
            {sending ? "Sending..." : "Send Alert Email"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {data.outOfStock.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-3xl font-bold text-amber-600">
                {data.lowStock.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <CubeIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Alert Threshold</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.threshold} units
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b bg-red-50 rounded-t-xl">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <XCircleIcon className="w-5 h-5" />
              Out of Stock ({data.outOfStock.length})
            </h2>
            <p className="text-sm text-red-600 mt-1">
              These products cannot be ordered until restocked
            </p>
          </div>
          <div className="p-6">
            {data.outOfStock.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                ✅ All products are in stock
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.outOfStock.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-3 bg-red-50 rounded-lg"
                  >
                    <div className="relative w-12 h-16 shrink-0">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/products/${product._id}`}
                        className="font-medium text-gray-900 hover:text-[#90AC19] line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      {product.sku && (
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-error">Out of Stock</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b bg-amber-50 rounded-t-xl">
            <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Low Stock ({data.lowStock.length})
            </h2>
            <p className="text-sm text-amber-600 mt-1">
              Products with {data.threshold} or fewer units remaining
            </p>
          </div>
          <div className="p-6">
            {data.lowStock.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                ✅ All products are well stocked
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.lowStock.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="relative w-12 h-16 shrink-0">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/products/${product._id}`}
                        className="font-medium text-gray-900 hover:text-[#90AC19] line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      {product.sku && (
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-warning">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/products" className="btn btn-outline btn-sm">
            View All Products
          </Link>
          <Link
            href="/dashboard/products/new"
            className="btn btn-primary btn-sm bg-[#90AC19] hover:bg-[#7A9216] border-none"
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}
