import { auth } from "@/auth";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { getSessionUser } from "@/lib/session-user";
import { getDb } from "@/lib/mongodb";
import {
  buildRebookTemplate,
  isRebookEligible,
} from "@/lib/booking-rebook";
import { previewBookingPrice } from "@/app/booking/action";
import { bookingBelongsToUser } from "@/lib/booking-ownership";
import { BookingInterface } from "@/models/Booking";

type OwnedBookingError = { error: string; status: 401 | 403 | 404 };

type OwnedBookingSuccess = {
  user: NonNullable<Awaited<ReturnType<typeof UserRepository.findByEmail>>>;
  booking: BookingInterface;
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type GetOwnedBookingResult = OwnedBookingError | OwnedBookingSuccess;

export async function getOwnedBooking(
  bookingId: string,
): Promise<GetOwnedBookingResult> {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await getSessionUser(session);
  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const booking = await BookingRepository.findById(bookingId);
  if (!booking) {
    return { error: "Booking not found", status: 404 };
  }

  if (
    !bookingBelongsToUser(booking, user, {
      id: session.user.id,
      email: session.user.email,
    })
  ) {
    return { error: "Access denied", status: 403 };
  }

  return { user, booking, sessionUser: session.user };
}

export async function assertServiceActive(
  serviceType: BookingInterface["serviceType"],
): Promise<{ ok: true } | { error: string; status: 400 }> {
  const db = await getDb();
  const service = await db.collection("services").findOne({
    type: serviceType,
    status: "active",
  });

  if (!service) {
    return {
      error: "This service is no longer available for booking",
      status: 400,
    };
  }

  return { ok: true };
}

export async function buildRebookTemplateResponse(booking: BookingInterface) {
  if (!isRebookEligible(booking)) {
    return {
      error: "This booking is not eligible for re-booking",
      status: 400 as const,
    };
  }

  const serviceCheck = await assertServiceActive(booking.serviceType);
  if (!("ok" in serviceCheck)) {
    return serviceCheck;
  }

  const rebookBuilt = buildRebookTemplate(booking);

  const {
    formEntries,
    targetMonthStart,
    targetMonthLabel,
    childIds,
    booking: shiftedBooking,
  } = rebookBuilt;

  const pricePreview = await previewBookingPrice(formEntries);

  return {
    template: {
      serviceType: booking.serviceType,
      children: booking.children,
      schedule: {
        startDate: targetMonthStart,
        weekdays: shiftedBooking.schedule.weekdays,
      },
      source: booking.source,
    },
    formEntries,
    childIds,
    targetMonthStart,
    targetMonthLabel,
    pricePreview,
    serviceType: booking.serviceType,
    childrenSummary: booking.children.map((c) => c.name).join(", "),
  };
}
