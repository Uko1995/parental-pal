"use client";

import Link from "next/link";

export default function AliveInMeBanner({
  inline = false,
}: {
  inline?: boolean;
}) {
  const wrapperClass = inline
    ? "relative w-full my-6"
    : "absolute top-16 left-0 right-0 z-20 w-full px-4 sm:px-6";

  return (
    <div className={wrapperClass}>
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-white/10 bg-black/40">
        {/* Background image + overlay */}
        <div className="absolute inset-0 bg-[url('/greenBG.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative">
          <Link
            href="/booking?service=holiday-camps"
            className="block"
            aria-label="Register for Alive in Me holiday camp"
          >
            <div className="py-3 sm:py-4">
              <div className="flex items-center justify-center">
                <div className="moving-promo-marquee text-white font-semibold">
                  {/* Duplicate track for seamless loop */}
                  <div className="flex items-center whitespace-nowrap gap-8">
                    <span className="text-sm sm:text-lg">
                      Alive in Me Easter Camp
                    </span>
                    <span className="text-sm sm:text-lg opacity-95">
                      April 7 - April 25, 2026
                    </span>
                    <span className="text-sm sm:text-lg text-[#E8931A]">
                      Register now &rarr;
                    </span>
                  </div>
                  <div className="flex items-center whitespace-nowrap gap-8">
                    <span className="text-sm sm:text-lg">
                      Alive in Me Easter Camp
                    </span>
                    <span className="text-sm sm:text-lg opacity-95">
                      April 7 - April 25, 2026
                    </span>
                    <span className="text-sm sm:text-lg text-[#E8931A]">
                      Register now &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
