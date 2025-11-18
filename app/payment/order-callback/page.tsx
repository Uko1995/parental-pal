"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber?: string;
    productTitle?: string;
    orderType?: string;
    downloadUrl?: string;
  } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const orderId = searchParams.get("orderId");

      if (!reference || !orderId) {
        toast.error("Invalid payment parameters");
        setStatus("failed");
        return;
      }

      try {
        // Verify payment with Paystack
        const verifyResponse = await fetch(
          `/api/orders/verify-payment?reference=${reference}&orderId=${orderId}`
        );
        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          setStatus("success");
          setOrderDetails({
            orderNumber: verifyData.order.orderNumber,
            productTitle: verifyData.order.productTitle,
            orderType: verifyData.order.orderType,
            downloadUrl: verifyData.downloadUrl,
          });

          toast.success("Payment successful! Order confirmed.");

          // Redirect after 5 seconds
          setTimeout(() => {
            if (verifyData.order.orderType === "softcopy") {
              // Show download page
              router.push(`/products/download?orderId=${orderId}`);
            } else {
              // Show order confirmation
              router.push("/products");
            }
          }, 5000);
        } else {
          setStatus("failed");
          toast.error(verifyData.error || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        toast.error("Failed to verify payment");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#90AC19] mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Your order has been confirmed
              </p>
            </div>

            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.productTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {orderDetails.orderType}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {orderDetails?.orderType === "softcopy" ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    📧 A download link has been sent to your email. Check your
                    inbox!
                  </p>
                </div>
                <Link
                  href={`/products/download?orderId=${searchParams.get(
                    "orderId"
                  )}`}
                  className="block w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Download Now
                </Link>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  📦 Your book will be delivered within 2 business days.
                  We&apos;ll send you shipping updates via email.
                </p>
              </div>
            )}

            <div className="text-center mt-6">
              <Link
                href="/products"
                className="text-[#90AC19] hover:text-[#7A9216] font-medium"
              >
                ← Back to Products
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t verify your payment. Please try again.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/products"
                className="block w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
