"use client";

import { useAnalytics } from "@/lib/analytics";
import { Suspense } from "react";

function AnalyticsTracking() {
  // This will automatically track page views
  useAnalytics();
  return null;
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only run analytics in production
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <>
      {isProduction && (
        <Suspense fallback={null}>
          <AnalyticsTracking />
        </Suspense>
      )}
      {children}
    </>
  );
}
