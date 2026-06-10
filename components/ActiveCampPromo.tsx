"use client";

import Link from "next/link";
import {
  CAMP_SEASONS,
  getCampBookingUrl,
  type CampSeasonId,
} from "@/lib/camp-seasons";
import { Calendar, Sparkle } from "@phosphor-icons/react";

export default function ActiveCampPromo({
  seasonId,
}: {
  seasonId: CampSeasonId;
}) {
  const season = CAMP_SEASONS[seasonId];
  const isSummer = season.isSummer;
  const href = isSummer ? season.landingPath : getCampBookingUrl(seasonId);

  return (
    <div className="mb-12 rounded-2xl overflow-hidden border border-brand-primary/20 shadow-sm">
      <div className="bg-linear-to-r from-brand-primary/10 via-brand-cream to-brand-accent/10 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-brand-primary/15 shrink-0">
            <Sparkle className="w-7 h-7 text-brand-primary" weight="fill" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-secondary uppercase tracking-wide">
              {isSummer ? "Now registering" : "Holiday camp"}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {season.name}
            </h2>
            <p className="text-gray-600 mt-2 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-brand-primary" weight="regular" />
              {season.dateLabel}
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex justify-center px-8 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:shadow-lg transition-shadow shrink-0"
        >
          {isSummer ? "View camp details" : "Register for Easter camp"}
        </Link>
      </div>
    </div>
  );
}
