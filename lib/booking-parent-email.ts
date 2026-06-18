import type { BookingInterface } from "@/models/Booking";
import type { UserInterface } from "@/models/User";

export function resolveBookingParentEmail(
  booking: Pick<BookingInterface, "parentEmail">,
  user?: UserInterface | null,
): string {
  return (
    booking.parentEmail?.trim() ||
    user?.userData?.user?.email?.trim() ||
    ""
  );
}

export function resolveBookingParentName(
  booking: Pick<BookingInterface, "parentName">,
  user?: UserInterface | null,
): string {
  return (
    booking.parentName?.trim() ||
    user?.userData?.user?.name?.trim() ||
    "Valued Customer"
  );
}
