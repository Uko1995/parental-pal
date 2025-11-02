"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(
    null
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
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        toast.error("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [reference, router]);

  // Countdown timer for redirect
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/profile?tab=bookings");
    }
  }, [status, countdown, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFEACF] via-white to-[#FFEACF] flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/parentalpalLOGO.webp"
              alt="PARENTALPAL logo"
              width={200}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Content Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body items-center text-center p-8 md:p-12">
            {loading ? (
              <>
                {/* Loading State */}
                <div className="mb-6">
                  <span className="loading loading-spinner loading-lg text-[#A25F97]"></span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                  Verifying Payment
                </h1>
                <p className="text-gray-600 text-lg">
                  Please wait while we confirm your payment...
                </p>
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Connecting to payment gateway...</span>
                  </div>
                </div>
              </>
            ) : status === "success" ? (
              <>
                {/* Success State */}
                <div className="mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#90AC19] bg-opacity-10 flex items-center justify-center mx-auto animate-bounce">
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
                </div>
                <h1 className="text-4xl font-bold text-[#90AC19] mb-3">
                  Payment Successful! 🎉
                </h1>
                <p className="text-gray-700 text-lg mb-2">
                  Your booking has been confirmed
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Reference:{" "}
                  <span className="font-mono font-semibold">{reference}</span>
                </p>

                <div className="divider my-6"></div>

                <div className="bg-[#90AC19] bg-opacity-5 rounded-lg p-6 mb-6 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    What&apos;s Next?
                  </h2>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#90AC19] mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        You&apos;ll receive a confirmation email shortly
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#90AC19] mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Our team will contact you within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#90AC19] mt-0.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>View your booking details in your profile</span>
                    </li>
                  </ul>
                </div>

                <div className="alert alert-info shadow-sm mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-sm">
                    Redirecting to your bookings in {countdown} second
                    {countdown !== 1 ? "s" : ""}...
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link
                    href="/profile?tab=bookings"
                    className="btn btn-primary bg-[#90AC19] hover:bg-[#7a9116] border-none text-white flex-1"
                  >
                    View Booking
                  </Link>
                  <Link
                    href="/"
                    className="btn btn-outline border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white flex-1"
                  >
                    Go Home
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Failed State */}
                <div className="mb-6">
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
                </div>
                <h1 className="text-4xl font-bold text-red-500 mb-3">
                  Payment Failed
                </h1>
                <p className="text-gray-700 text-lg mb-6">
                  We couldn&apos;t verify your payment. Please try again.
                </p>

                <div className="bg-red-50 rounded-lg p-6 mb-6 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Common Issues:
                  </h2>
                  <ul className="text-left space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Payment was cancelled or timed out</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Insufficient funds or card declined</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Network connection issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Invalid payment reference</span>
                    </li>
                  </ul>
                </div>

                <div className="alert alert-warning shadow-sm mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm">
                    Don&apos;t worry! No charges were made to your account.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link
                    href="/booking"
                    className="btn btn-primary bg-[#E8931A] hover:bg-[#d07d0a] border-none text-white flex-1"
                  >
                    Try Again
                  </Link>
                  <Link
                    href="/faq"
                    className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 flex-1"
                  >
                    Get Help
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>
            Need assistance?{" "}
            <Link
              href="/faq"
              className="text-[#A25F97] hover:underline font-semibold"
            >
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
    </div>
  );
}
