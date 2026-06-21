import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import { bookingBelongsToUser } from "@/lib/booking-ownership";
import { resolveBookingScheduleDates } from "@/lib/booking-schedule";
import { fetchServicePricingMap } from "@/lib/service-pricing-server";
import {
  getBookingHourlyRateForLocation,
  resolveBookingPricingContext,
} from "@/lib/parent-invoice-pricing";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const booking = await BookingRepository.findById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (
    user.role !== "admin" &&
    !bookingBelongsToUser(booking, user, {
      email: session.user.email,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const pricing = await fetchServicePricingMap();
  const bookingCtx = resolveBookingPricingContext(booking.serviceData);
  const defaultLocation =
    bookingCtx.tutoringLocation ??
    (booking.serviceData?.tutoringLocation as "virtual" | "physical" | undefined) ??
    "physical";

  const sessions: Array<{
    date: string;
    childName: string;
    serviceType: string;
    description: string;
    hours: number;
    unitPrice: number;
    tutoringLocation?: "virtual" | "physical";
  }> = [];

  const serviceType = booking.serviceType;
  const children = booking.children || [];

  if (booking.schedule?.weekdays?.length) {
    for (const wd of booking.schedule.weekdays) {
      if (wd.dates?.length) {
        for (const sessionDate of wd.dates) {
          if (sessionDate.date >= today) {
            const hours = wd.hours || 1;
            const unitPrice =
              serviceType === "tutoring"
                ? getBookingHourlyRateForLocation(
                    bookingCtx,
                    pricing,
                    defaultLocation,
                  )
                : pricing[serviceType]?.baseRate ?? 0;

            for (const child of children) {
              sessions.push({
                date: sessionDate.date,
                childName: child.name,
                serviceType,
                description: `${wd.day} session (${hours}h)`,
                hours,
                unitPrice,
                tutoringLocation:
                  serviceType === "tutoring" ? defaultLocation : undefined,
              });
            }
          }
        }
      }
    }
  }

  const resolved = resolveBookingScheduleDates(booking);
  if (!sessions.length && resolved.startDate && resolved.startDate >= today) {
    const unitPrice =
      serviceType === "tutoring"
        ? getBookingHourlyRateForLocation(bookingCtx, pricing, defaultLocation)
        : pricing[serviceType]?.baseRate ?? 0;

    for (const child of children) {
      sessions.push({
        date: resolved.startDate,
        childName: child.name,
        serviceType,
        description: "Scheduled session (1h)",
        hours: 1,
        unitPrice,
        tutoringLocation:
          serviceType === "tutoring" ? defaultLocation : undefined,
      });
    }
  }

  return NextResponse.json({ sessions });
}
