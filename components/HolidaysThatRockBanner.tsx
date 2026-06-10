"use client";

import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";

export default function HolidaysThatRockBanner({
  inline = false,
}: {
  inline?: boolean;
}) {
  const wrapperClass = inline
    ? "relative w-full my-6"
    : "absolute top-16 left-0 right-0 z-20 w-full px-4 sm:px-6";

  return (
    <div className={wrapperClass}>
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-white/10">
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary via-brand-accent to-brand-secondary opacity-90" />
        <div className="absolute inset-0 bg-black/20" />

        <Link
          href="/services/holidays-that-rock-2026"
          className="relative block group"
          aria-label="Holidays That Rock 2026 summer camp"
        >
          <div className="py-4 sm:py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              {/* <div className="p-2 rounded-xl bg-white/15">
                <Sparkle className="w-6 h-6" weight="fill" />
              </div> */}
              <div className="text-left">
                <p className="font-bold text-sm sm:text-base tracking-wide">
                  Holidays That Rock 2026
                </p>
                <p className="text-xs sm:text-sm text-white/90">
                  July 20 – August 29 · Ages 0–14 · Lekki & Gbagada
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-brand-primary font-semibold text-sm group-hover:scale-105 transition-transform">
              Register now
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
