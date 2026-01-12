"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface DownloadInfo {
  orderId: string;
  productTitle: string;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
}

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");

  useEffect(() => {
    const validateDownload = async () => {
      if (!orderId || !token) {
        setError("Invalid download link. Please use the link from your email.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/orders/${orderId}/download?token=${token}`
        );
        const data = await response.json();

        if (data.success) {
          setDownloadInfo(data.data);
        } else {
          setError(data.error || "Failed to validate download link");
        }
      } catch {
        setError("Failed to validate download link");
      } finally {
        setLoading(false);
      }
    };

    validateDownload();
  }, [orderId, token]);

  const handleDownload = async () => {
    if (!downloadInfo) return;

    setDownloading(true);
    try {
      // Open download URL in new window
      window.open(downloadInfo.downloadUrl, "_blank");

      // Record download
      await fetch(`/api/orders/${orderId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      toast.success("Download started!");

      // Refresh download count
      const response = await fetch(
        `/api/orders/${orderId}/download?token=${token}`
      );
      const data = await response.json();
      if (data.success) {
        setDownloadInfo(data.data);
      }
    } catch {
      toast.error("Failed to start download");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-[#90AC19]"></span>
          <p className="mt-4 text-gray-600">Validating download link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Download Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support or check
              your order history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/profile/orders"
                className="inline-flex items-center justify-center bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View Orders
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!downloadInfo) {
    router.push("/products");
    return null;
  }

  const remainingDownloads =
    downloadInfo.maxDownloads - downloadInfo.downloadCount;
  const expiryDate = new Date(downloadInfo.expiresAt);
  const isExpired = expiryDate < new Date();
  const canDownload = remainingDownloads > 0 && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Download is Ready!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Click below to download your book.
          </p>

          {/* Book Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <DocumentIcon className="w-12 h-12 text-[#90AC19] mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 text-lg">
              {downloadInfo.productTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">PDF Format</p>
          </div>

          {/* Download Stats */}
          <div className="flex justify-center gap-8 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Downloads Used</p>
              <p className="font-bold text-gray-900">
                {downloadInfo.downloadCount} / {downloadInfo.maxDownloads}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Expires</p>
              <p
                className={`font-bold ${
                  isExpired ? "text-red-500" : "text-gray-900"
                }`}
              >
                {expiryDate.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Download Button */}
          {canDownload ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Preparing Download...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  Download PDF
                </>
              )}
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 font-medium">
                {isExpired
                  ? "This download link has expired."
                  : "You have reached the maximum number of downloads."}
              </p>
              <p className="text-red-600 text-sm mt-2">
                Please contact support if you need assistance.
              </p>
            </div>
          )}

          {/* Remaining Downloads Warning */}
          {canDownload && remainingDownloads <= 2 && (
            <p className="text-amber-600 text-sm mt-4">
              ⚠️ You have {remainingDownloads} download
              {remainingDownloads !== 1 ? "s" : ""} remaining.
            </p>
          )}

          {/* Order Link */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-2">Order ID</p>
            <p className="font-mono text-sm text-gray-700 mb-4">
              {downloadInfo.orderId}
            </p>
            <Link
              href="/profile/orders"
              className="text-[#90AC19] hover:text-[#7A9216] text-sm font-medium"
            >
              View All Your Orders →
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Having trouble?{" "}
            <Link href="/contact" className="text-[#90AC19] hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-[#90AC19]"></span>
        </div>
      }
    >
      <DownloadPageContent />
    </Suspense>
  );
}
