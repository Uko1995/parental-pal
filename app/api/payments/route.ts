import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { BookingRepository } from "@/lib/BookingRepository";
import { getSessionUser } from "@/lib/session-user";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's bookings to extract payment information
    const bookings = await BookingRepository.findByUserId(user._id!.toString());

    // Transform bookings into payment records
    const payments = bookings.map((booking) => ({
      _id: booking._id,
      bookingId: booking._id,
      amount: booking.pricing.totalAmount,
      currency: booking.pricing.currency,
      status: booking.payment.status,
      method: booking.payment.method || undefined,
      transactionId: booking.payment.transactionId || undefined,
      paidDate: booking.payment.paymentDate || undefined,
      createdAt: booking.createdAt,
      serviceType: booking.serviceType,
      description: `${
        booking.serviceType.charAt(0).toUpperCase() +
        booking.serviceType.slice(1).replace("-", " ")
      } service for ${booking.children.length} child${
        booking.children.length > 1 ? "ren" : ""
      }`,
    }));

    return NextResponse.json({
      payments: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
