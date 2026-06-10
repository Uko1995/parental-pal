"use client";

import {
  type CampSeasonId,
} from "@/lib/camp-seasons";
import AliveInMeBanner from "./AliveInMeBanner";
import HolidaysThatRockBanner from "./HolidaysThatRockBanner";

export default function CampPromoBanner({
  activeSeason = null,
  inline = false,
}: {
  activeSeason?: CampSeasonId | null;
  inline?: boolean;
}) {
  if (activeSeason === "alive-in-me-easter-2026") {
    return <AliveInMeBanner inline={inline} />;
  }

  if (activeSeason === "holidays-that-rock-2026") {
    return <HolidaysThatRockBanner inline={inline} />;
  }

  return null;
}
