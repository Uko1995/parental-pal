"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setLoading(false);
      return;
    }
    const verify = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (data.success && data.payment?.status === "success") {
          setStatus("success");
          toast.success("Payment verified successfully!");
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

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (status === "success" && countdown === 0) {
      router.push("/profile?tab=bookings");
    }
  }, [status, countdown, router]);

  const nextSteps = [
    {
      icon: EnvelopeIcon,
      text: "You'll receive a confirmation email shortly",
    },
    {
      icon: PhoneIcon,
      text: "Our team will contact you within 24 hours",
    },
    {
      icon: CalendarDaysIcon,
      text: "View your booking details in your profile",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFEACF]/40 via-white to-[#FFEACF]/40 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/parentalpalLOGO.webp"
              alt="PARENTALPAL logo"
              width={200}
              height={80}
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="px-8 py-14 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#A25F97]/10">
                <ArrowPathIcon className="h-8 w-8 text-[#A25F97] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </div>
          ) : status === "success" ? (
            <>
              <div className="bg-linear-to-r from-[#90AC19] to-[#7a9116] px-8 py-10 text-center text-white">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                  <CheckCircleIcon className="h-11 w-11 text-white" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
                <p className="text-white/90">Your booking has been confirmed</p>
              </div>

              <div className="px-8 py-8">
                {reference && (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Payment reference
                    </p>
                    <p className="font-mono text-sm font-semibold text-gray-800 break-all">
                      {reference}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                    What happens next
                  </h2>
                  <ul className="space-y-3">
                    {nextSteps.map(({ icon: Icon, text }) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                      >
                        <Icon className="h-5 w-5 text-[#90AC19] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#90AC19]/20 bg-[#90AC19]/5 px-4 py-3 mb-6">
                  <InformationCircleIcon className="h-5 w-5 text-[#90AC19] shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Redirecting to your bookings in {countdown} second
                    {countdown !== 1 ? "s" : ""}...
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/profile?tab=bookings"
                    className="btn flex-1 border-none bg-[#90AC19] hover:bg-[#7a9116] text-white"
                  >
                    View Booking
                  </Link>
                  <Link
                    href="/"
                    className="btn btn-outline flex-1 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white hover:border-[#90AC19]"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="px-8 py-10">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                  <XCircleIcon className="h-11 w-11 text-red-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600">
                  We couldn&apos;t verify your payment. Please try again.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Common issues
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Payment was cancelled or timed out</li>
                  <li>Insufficient funds or card declined</li>
                  <li>Network connection issues</li>
                  <li>Invalid payment reference</li>
                </ul>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">
                  Don&apos;t worry — no charges were made to your account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/booking"
                  className="btn flex-1 border-none bg-[#E8931A] hover:bg-[#d07d0a] text-white"
                >
                  Try Again
                </Link>
                <Link
                  href="/faq"
                  className="btn btn-outline flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Get Help
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          Need assistance?{" "}
          <Link href="/faq" className="text-[#A25F97] hover:underline font-semibold">
            Visit our FAQ
          </Link>{" "}
          or{" "}
          <a
            href="mailto:info@parentalpal.com"
            className="text-[#A25F97] hover:underline font-semibold"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ArrowPathIcon className="h-8 w-8 text-[#A25F97] animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
