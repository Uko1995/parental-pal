"use client";

import { useEffect, useRef } from "react";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import type { BookingProfilePrefill } from "@/lib/booking-profile-prefill";
import { useBookingProfile } from "./BookingProfileContext";

export function useBookingProfilePrefill({
  initialTemplate,
  templateAppliedRef,
  onApply,
  skip = false,
}: {
  initialTemplate?: RebookFormEntries | null;
  templateAppliedRef: React.MutableRefObject<boolean>;
  onApply: (profile: BookingProfilePrefill) => void;
  skip?: boolean;
}) {
  const { profile, loaded } = useBookingProfile();
  const prefillAppliedRef = useRef(false);
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;

  useEffect(() => {
    if (skip) return;
    if (initialTemplate || templateAppliedRef.current) return;
    if (!loaded || !profile || prefillAppliedRef.current) return;

    prefillAppliedRef.current = true;
    onApplyRef.current(profile);
  }, [skip, initialTemplate, loaded, profile, templateAppliedRef]);
}
