"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

interface OrderResult {
  orderNumber: string;
  productTitle: string;
  orderType: string;
  downloadUrl?: string;
}

export default function CartCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [hasSoftcopy, setHasSoftcopy] = useState(false);
  const [hasPaperback, setHasPaperback] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        toast.error("Invalid payment parameters");
        setStatus("failed");
        return;
      }

      try {
        // Verify payment with batch reference
        const verifyResponse = await fetch(
          `/api/cart/verify-payment?reference=${reference}`
        );
        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          setStatus("success");
          setOrders(verifyData.orders || []);
          setHasSoftcopy(
            verifyData.orders?.some(
              (o: OrderResult) => o.orderType === "softcopy"
            )
          );
          setHasPaperback(
            verifyData.orders?.some(
              (o: OrderResult) => o.orderType === "paperback"
            )
          );

          // Clear cart after successful payment
          await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          toast.success("Payment successful! Your orders are confirmed.");
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
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#90AC19]/10 ring-4 ring-[#90AC19]/10">
                <CheckCircleIcon className="h-9 w-9 text-[#90AC19]" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful
              </h2>
              <p className="text-gray-600 mb-4">
                {orders.length} order{orders.length > 1 ? "s" : ""} confirmed
              </p>
            </div>

            {/* Order List */}
            <div className="space-y-3 mb-6">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.productTitle}
                    </p>
                    <p className="text-xs text-gray-600">
                      Order #{order.orderNumber} •{" "}
                      <span className="capitalize">{order.orderType}</span>
                    </p>
                  </div>
                  {order.orderType === "softcopy" && (
                    <span className="badge badge-success badge-sm">PDF</span>
                  )}
                  {order.orderType === "paperback" && (
                    <span className="badge badge-info badge-sm">Shipping</span>
                  )}
                </div>
              ))}
            </div>

            {/* Info Messages */}
            {hasSoftcopy && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">
                  Download links for your PDF books have been sent to your email.
                </p>
              </div>
            )}

            {hasPaperback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <TruckIcon className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                  Your paperback orders will be delivered within 2 business days.
                  You&apos;ll receive shipping updates via email.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/profile/orders"
                className="block w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/products"
                className="block w-full border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19]/5 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                <XCircleIcon className="h-9 w-9 text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t verify your payment. Your cart items are still
                saved.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/cart"
                className="block w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Return to Cart
              </Link>
              <button
                onClick={() => router.back()}
                className="block w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
