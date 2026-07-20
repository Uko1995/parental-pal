"use client";

import Link from "next/link";

export default function HolidaysThatRockBanner({
  inline = false,
}: {
  inline?: boolean;
}) {
  const wrapperClass = inline
    ? "relative w-full my-6"
    : "relative z-20 w-full px-3 pb-1 md:absolute md:top-16 md:left-0 md:right-0 md:px-6 md:pb-0";

  return (
    <div className={wrapperClass}>
      <div className="relative overflow-hidden rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg border border-white/10">
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary via-brand-accent to-brand-secondary opacity-95" />
        <div className="absolute inset-0 bg-black/25" />

        <Link
          href="/services/holidays-that-rock-2026"
          className="relative block group"
          aria-label="Holidays That Rock 2026 summer camp — register now"
        >
          {/* Mobile: compact single-row layout */}
          <div className="py-2 px-3 sm:hidden flex items-center gap-2">
            <div className="min-w-0 flex-1 text-white">
              <p className="font-bold text-xs leading-tight truncate">
                Holidays That Rock 2026
              </p>
              <p className="text-[10px] text-white/90 leading-tight truncate mt-0.5">
                Jul 20 – Aug 29 · 7% off 6 weeks
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full bg-white text-brand-primary font-semibold text-[11px] group-active:scale-[0.98] transition-transform">
              Register
            </span>
          </div>

          {/* sm+: roomier layout */}
          <div className="hidden sm:flex py-3 px-4 sm:py-4 sm:px-6 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-bold text-sm sm:text-base tracking-wide leading-tight">
                  Holidays That Rock 2026
                </p>
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
                  7% off 6 weeks
                </span>
              </div>
              <p className="mt-1 text-sm text-white leading-snug">
                July 20 – Aug 29 · Ages 0–14 · Gbagada
              </p>
            </div>
            <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-brand-primary font-semibold text-sm shadow-sm group-hover:scale-[1.02] group-active:scale-[0.98] transition-transform shrink-0">
              Register now
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
