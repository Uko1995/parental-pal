"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEACF]/30 via-white to-[#FFEACF]/30 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <h1 className="text-8xl font-bold text-[#90AC19] select-none">
              404
            </h1>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! It looks like the page you're looking for doesn't exist. Don't
          worry though - we have plenty of amazing childcare services and
          resources waiting for you on our homepage!
        </p>

        {/* Helpful Links */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.reload()}
              className="block border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block border-2 border-[#E8931A] text-[#E8931A] hover:bg-[#E8931A] hover:text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#90AC19]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8931A]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-48 h-48 bg-[#A25F97]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
}
