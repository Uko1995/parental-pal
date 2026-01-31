import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekend Enrichment | ParentalPal",
  description:
    "Give your child a creative, smart & confidence-boosting weekend. Fine Art, STEM & Performing Arts for ages 2–15. Saturdays at ParentalPal Hub, Gbagada.",
  openGraph: {
    title: "Weekend Enrichment | ParentalPal",
    description:
      "Fine Art, STEM & Performing Arts for ages 2–15. Saturdays at ParentalPal Hub.",
  },
};

export default function WeekendEnrichmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
