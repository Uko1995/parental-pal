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

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const [profileRes, childrenRes] = await Promise.all([
          fetch("/api/users/profile"),
          fetch("/api/users/children"),
        ]);

        const profileData = profileRes.ok ? await profileRes.json() : null;
        const childrenData = childrenRes.ok ? await childrenRes.json() : null;

        if (cancelled) return;

        const apiChildren = Array.isArray(childrenData?.children)
          ? childrenData.children
          : [];

        setProfile({
          parentName:
            profileData?.name || session.user.name || "",
          parentEmail:
            profileData?.email || session.user.email || "",
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
        });
      } catch (error) {
        console.error("Failed to load booking profile prefill:", error);
        if (!cancelled) {
          setProfile({
            parentName: session.user?.name || "",
            parentEmail: session.user?.email || "",
            parentPhone: "",
            parentAddress: "",
            children: [],
          });
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
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
