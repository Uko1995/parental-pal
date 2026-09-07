"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { BookingProfilePrefill } from "@/lib/booking-profile-prefill";

interface BookingProfileContextValue {
  profile: BookingProfilePrefill | null;
  loaded: boolean;
}

const BookingProfileContext = createContext<BookingProfileContextValue>({
  profile: null,
  loaded: false,
});

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function BookingProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<BookingProfilePrefill | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      setLoaded(true);
      return;
    }

    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const [profileRes, childrenRes] = await Promise.all([
          fetch("/api/users/profile", {
            credentials: "same-origin",
            signal: controller.signal,
          }),
          fetch("/api/users/children", {
            credentials: "same-origin",
            signal: controller.signal,
          }),
        ]);

        const profileData = profileRes.ok ? await profileRes.json() : null;
        const childrenData = childrenRes.ok ? await childrenRes.json() : null;

        if (controller.signal.aborted) return;

        const apiChildren = Array.isArray(childrenData?.children)
          ? childrenData.children
          : [];

        const hasPriorHomeschoolingBooking =
          typeof childrenData?.hasPriorHomeschoolingBooking === "boolean"
            ? childrenData.hasPriorHomeschoolingBooking
            : apiChildren.some(
                (child: {
                  services?: Array<{ serviceType?: string }>;
                }) =>
                  Array.isArray(child.services) &&
                  child.services.some(
                    (service) => service.serviceType === "homeschooling",
                  ),
              );

        setProfile({
          parentName: profileData?.name || session.user.name || "",
          parentEmail: profileData?.email || session.user.email || "",
          parentPhone: profileData?.phone || "",
          parentAddress: profileData?.address || "",
          children: apiChildren
            .filter(
              (child: { name?: string; age?: number }) =>
                child?.name && typeof child.age === "number",
            )
            .map(
              (child: {
                name: string;
                age: number;
                gender?: string;
                class?: string;
                schoolName?: string;
              }) => ({
                name: child.name,
                age: child.age,
                gender: child.gender,
                class: child.class,
                schoolName: child.schoolName,
              }),
            ),
          hasPriorHomeschoolingBooking,
        });
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) {
          return;
        }
        // Soft fallback — avoid noisy Next overlay for transient network blips
        console.warn("Booking profile prefill unavailable; using session only.");
        setProfile({
          parentName: session.user?.name || "",
          parentEmail: session.user?.email || "",
          parentPhone: "",
          parentAddress: "",
          children: [],
          hasPriorHomeschoolingBooking: false,
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoaded(true);
        }
      }
    };

    loadProfile();

    return () => {
      controller.abort();
    };
  }, [session, status]);

  return (
    <BookingProfileContext.Provider value={{ profile, loaded }}>
      {children}
    </BookingProfileContext.Provider>
  );
}

export function useBookingProfile() {
  return useContext(BookingProfileContext);
}
