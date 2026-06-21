import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { CACHE_TAGS } from "@/lib/cache-config";
import { bookingBelongsToUser } from "@/lib/booking-ownership";
import {
  canParentCancelBooking,
  getParentCancelBlockReason,
} from "@/lib/booking-cancellation";
import {
  AuditEventType,
  logDataEvent,
} from "@/lib/audit-logger-mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get booking
    const booking = await BookingRepository.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user has permission (is admin)
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow access if user is admin or owns the booking
    const isAdmin = user.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get booking
    const booking = await BookingRepository.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user has permission (is admin)
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow access if user is admin
    const isAdmin = user.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse update data
    const updateData = await request.json();

    // Update booking
    const updatedBooking = await BookingRepository.updateBooking(
      id,
      updateData
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.BOOKINGS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.ANALYTICS);

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get booking
    const booking = await BookingRepository.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user has permission (is admin)
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow access if user is admin or owns the booking
    const isAdmin = user.role === "admin";
    const isOwner = bookingBelongsToUser(booking, user, {
      id: session.user.id,
      email: session.user.email,
    });

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!isAdmin) {
      const blockReason = getParentCancelBlockReason(booking);
      if (blockReason) {
        return NextResponse.json({ error: blockReason }, { status: 400 });
      }

      if (!canParentCancelBooking(booking)) {
        return NextResponse.json(
          { error: "This booking cannot be cancelled" },
          { status: 400 },
        );
      }
    } else if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    if (booking.status === "pending") {
      const deleted = await BookingRepository.deleteBooking(id);

      if (!deleted) {
        return NextResponse.json(
          { error: "Failed to cancel booking" },
          { status: 500 },
        );
      }

      await logDataEvent(
        AuditEventType.BOOKING_DELETED,
        user._id!.toString(),
        "booking",
        isAdmin ? "admin_cancel" : "parent_cancel",
        true,
        { bookingId: id, serviceType: booking.serviceType },
      );

      revalidateTag(CACHE_TAGS.BOOKINGS);
      revalidateTag(CACHE_TAGS.DASHBOARD);
      revalidateTag(CACHE_TAGS.ANALYTICS);

      return NextResponse.json({
        message: "Booking cancelled and removed successfully",
        cancelled: true,
        removed: true,
      });
    }

    const cancelledBooking = await BookingRepository.updateStatus(
      id,
      "cancelled",
      isAdmin ? "Cancelled by admin" : "Cancelled by parent",
    );

    if (!cancelledBooking) {
      return NextResponse.json(
        { error: "Failed to cancel booking" },
        { status: 500 },
      );
    }

    await logDataEvent(
      AuditEventType.BOOKING_UPDATED,
      user._id!.toString(),
      "booking",
      isAdmin ? "admin_cancel" : "parent_cancel",
      true,
      { bookingId: id, serviceType: booking.serviceType, status: "cancelled" },
    );

    revalidateTag(CACHE_TAGS.BOOKINGS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.ANALYTICS);

    return NextResponse.json({
      message: "Booking cancelled successfully",
      cancelled: true,
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
