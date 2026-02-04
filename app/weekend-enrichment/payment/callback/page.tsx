/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

function CallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setLoading(false);
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch("/api/weekend-enrichment/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (data.success && data.paymentStatus === "paid") {
          setStatus("success");
          toast.success("Payment verified! Your slot is confirmed.");

          // Track Purchase event
          if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "Purchase", {
              value: data.amount || 0,
              currency: "NGN",
              content_name: data.programName || "Weekend Enrichment Program",
              content_type: "product",
              transaction_id: reference,
            });
          }
        } else {
          setStatus("failed");
          toast.error("Payment verification failed.");
        }
      } catch {
        setStatus("failed");
        toast.error("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FFEACF]/30 via-white to-[#FFEACF]/20 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/parentalpalLOGO.webp"
              alt="ParentalPal"
              width={200}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body items-center text-center p-8 md:p-12">
            {loading ? (
              <>
                <span className="loading loading-spinner loading-lg text-[#90AC19]" />
                <h1 className="text-xl font-bold text-gray-800 mt-4">
                  Verifying your payment…
                </h1>
              </>
            ) : status === "success" ? (
              <>
                <div className="w-20 h-20 rounded-full bg-[#90AC19]/20 flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-[#90AC19]"
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
                <h1 className="text-2xl font-bold text-[#90AC19] mt-4">
                  Payment successful
                </h1>
                <p className="text-gray-600 mt-2">
                  Your Weekend Enrichment slot is confirmed. We&apos;ll be in
                  touch shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                  <Link
                    href="/weekend-enrichment"
                    className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white border-none flex-1"
                  >
                    Back to Weekend Enrichment
                  </Link>
                  <Link href="/" className="btn btn-outline flex-1">
                    Home
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-red-500"
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
                <h1 className="text-2xl font-bold text-red-500 mt-4">
                  Payment failed
                </h1>
                <p className="text-gray-600 mt-2">
                  We couldn&apos;t verify your payment. Please try again.
                </p>
                <Link
                  href="/weekend-enrichment/enroll"
                  className="btn bg-[#E8931A] hover:bg-[#d07d0a] text-white border-none mt-6"
                >
                  Try again
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WeekendEnrichmentPaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-[#90AC19]" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
