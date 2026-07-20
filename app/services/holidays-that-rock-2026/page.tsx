import { Metadata } from "next";
import { redirect } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/metadata";
import { isHolidayCampServiceActive } from "@/app/services/actions";
import HolidaysThatRockContent from "./HolidaysThatRockContent";

export const metadata: Metadata = genMeta({
  title: "Holidays That Rock 2026 — Summer Holiday Camp",
  description:
    "Join Holidays That Rock 2026 in Gbagada. Hands-on learning for ages 0–14. July 20 – August 29, 2026. Register now.",
  path: "/services/holidays-that-rock-2026",
  keywords: [
    "summer camp Lagos",
    "holiday camp Nigeria",
    "Holidays That Rock",
    "Parental Pal camp",
    "children summer programme",
  ],
});

export default async function HolidaysThatRockPage() {
  const isActive = await isHolidayCampServiceActive();
  if (!isActive) {
    redirect("/services");
  }

  return <HolidaysThatRockContent />;
}
