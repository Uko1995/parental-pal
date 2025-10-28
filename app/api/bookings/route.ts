import { NextResponse, NextRequest } from "next/server";
import { BookingRepository } from "@/lib/BookingRepository";

export async function GET() {
  try {
    // Use existing repository methods
    const pendingBookings = await BookingRepository.findPendingBookings();
    const confirmedBookings = await BookingRepository.findByStatus("confirmed");
    const cancelledBookings = await BookingRepository.findByStatus("cancelled");

    // Combine all bookings and normalize the data structure
    const allBookings = [
      ...pendingBookings,
      ...confirmedBookings,
      ...cancelledBookings,
    ].map((booking) => ({
      ...booking,
      // Ensure totalCost is available - use pricing.totalAmount or fallback to 0
      totalCost: booking.pricing?.totalAmount || 0,
      // Convert ObjectId to string for frontend
      _id: booking._id?.toString() || "",
    }));

    // Calculate analytics manually to ensure correct values
    const totalRevenue = allBookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    const pendingRevenue = allBookings
      .filter((booking) => booking.status === "pending")
      .reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0);

    // Service distribution
    const serviceStats = allBookings.reduce(
      (acc: Record<string, number>, booking) => {
        const service = booking.serviceType || "Unknown";
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      },
      {}
    );

    // Monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });

      const monthBookings = allBookings.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        return (
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        );
      });

      monthlyData.push({
        month,
        bookings: monthBookings.length,
        revenue: monthBookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0),
      });
    }

    return NextResponse.json({
      bookings: allBookings,
      analytics: {
        totalBookings: allBookings.length,
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        cancelledBookings: cancelledBookings.length,
        totalRevenue,
        pendingRevenue,
        serviceStats: Object.entries(serviceStats).map(([name, value]) => ({
          name,
          value,
        })),
        monthlyTrends: monthlyData,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create new booking using the correct method
    const booking = await BookingRepository.createBooking({
      ...data,
      status: "pending",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
