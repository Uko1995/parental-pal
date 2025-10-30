"use client";

import { useEffect } from "react";
// import Image from "next/image";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEACF]/30 via-white to-[#FFEACF]/30 flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <svg
            className="w-26 h-26 text-red-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We&apos;re sorry, but there seems to be a technical issue. Don&apos;t
          worry - our team is working hard to provide the best childcare
          solutions for your family.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Error Details (Development Only):
            </h3>
            <p className="text-xs text-red-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 flex flex-col md:flex-row md:space-y-0 md:space-x-4">
          <button
            onClick={reset}
            className="w-full cursor-pointer bg-[#90AC19] hover:bg-[#7A9216] text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full cursor-pointer border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
          >
            Go to Homepage
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Need Help?
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            If this problem persists, please contact our support team
          </p>
          <div className="flex flex-col md:flex-row gap-2 items-center justify-center text-xs">
            <a
              href="mailto:support@parentalpal.com"
              className="text-[#90AC19] hover:text-[#7A9216] transition-colors"
            >
              support@parentalpal.com
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a
              href="tel:+234-xxx-xxx-xxxx"
              className="text-[#90AC19] hover:text-[#7A9216] transition-colors"
            >
              +234-806-539-4795
            </a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#90AC19]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8931A]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
