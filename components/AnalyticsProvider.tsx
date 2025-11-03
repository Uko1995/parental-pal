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
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>
      {children}
    </>
  );
}
