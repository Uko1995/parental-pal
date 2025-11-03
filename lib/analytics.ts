"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

interface TrackEventOptions {
  eventType:
    | "page_view"
    | "signup"
    | "login"
    | "booking"
    | "payment"
    | "click"
    | "form_submit"
    | "custom";
  eventName: string;
  metadata?: Record<string, unknown>;
  duration?: number;
}

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageViewTracked = useRef(false);
  const pageLoadTime = useRef(Date.now());

  const trackPageView = useCallback(
    async (duration?: number) => {
      try {
        const sessionId = getSessionId();
        const path =
          pathname +
          (searchParams.toString() ? `?${searchParams.toString()}` : "");

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "page_view",
            eventName: `Page View: ${pathname}`,
            sessionId,
            path,
            referrer: document.referrer,
            duration,
          }),
        });
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    },
    [pathname, searchParams]
  );

  // Track page views automatically
  useEffect(() => {
    pageViewTracked.current = false;
    const loadTime = pageLoadTime.current;

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      if (!pageViewTracked.current) {
        trackPageView();
        pageViewTracked.current = true;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Track time spent on page when leaving
      const duration = Date.now() - loadTime;
      if (duration > 1000) {
        // Only track if stayed for more than 1 second
        trackPageView(duration);
      }
    };
  }, [pathname, searchParams, trackPageView]);

  const trackEvent = async (options: TrackEventOptions) => {
    try {
      const sessionId = getSessionId();
      const path = pathname;

      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...options,
          sessionId,
          path,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  };

  return { trackEvent };
}

// Convenience functions for common events
export const analytics = {
  trackSignup: (metadata?: Record<string, unknown>) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "signup",
        eventName: "User Signup",
        sessionId,
        path: window.location.pathname,
        metadata,
      }),
    }).catch(console.error);
  },

  trackLogin: (metadata?: Record<string, unknown>) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "login",
        eventName: "User Login",
        sessionId,
        path: window.location.pathname,
        metadata,
      }),
    }).catch(console.error);
  },

  trackBooking: (bookingId: string, metadata?: Record<string, unknown>) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "booking",
        eventName: "Booking Created",
        sessionId,
        path: window.location.pathname,
        metadata: { bookingId, ...metadata },
      }),
    }).catch(console.error);
  },

  trackPayment: (
    paymentId: string,
    amount: number,
    metadata?: Record<string, unknown>
  ) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "payment",
        eventName: "Payment Completed",
        sessionId,
        path: window.location.pathname,
        metadata: { paymentId, amount, ...metadata },
      }),
    }).catch(console.error);
  },

  trackClick: (elementName: string, metadata?: Record<string, unknown>) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "click",
        eventName: `Click: ${elementName}`,
        sessionId,
        path: window.location.pathname,
        metadata,
      }),
    }).catch(console.error);
  },

  trackFormSubmit: (formName: string, metadata?: Record<string, unknown>) => {
    const sessionId = getSessionId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "form_submit",
        eventName: `Form Submit: ${formName}`,
        sessionId,
        path: window.location.pathname,
        metadata,
      }),
    }).catch(console.error);
  },
};
