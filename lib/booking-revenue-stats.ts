import { getCollection } from "@/lib/mongodb";
import type { BookingInterface } from "@/models/Booking";

export interface ServiceRevenueStats {
  totalRevenue: number;
  paidBookings: number;
  totalBookings: number;
  pendingRevenue: number;
}

export function formatServiceTypeLabel(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getPaidAmount(booking: BookingInterface): number {
  if (booking.payment?.status !== "paid") return 0;
  return (
    booking.payment.paidAmount ||
    booking.pricing?.totalAmount ||
    0
  );
}

export async function getBookingRevenueByServiceType(): Promise<
  Map<string, ServiceRevenueStats>
> {
  const bookings = await getCollection<BookingInterface>("bookings");
  const allBookings = await bookings.find({}).toArray();
  const stats = new Map<string, ServiceRevenueStats>();

  for (const booking of allBookings) {
    const type = booking.serviceType || "unknown";
    const current = stats.get(type) || {
      totalRevenue: 0,
      paidBookings: 0,
      totalBookings: 0,
      pendingRevenue: 0,
    };
    const amount = booking.pricing?.totalAmount || 0;

    current.totalBookings += 1;

    if (booking.payment?.status === "paid") {
      current.totalRevenue += getPaidAmount(booking);
      current.paidBookings += 1;
    } else {
      current.pendingRevenue += amount;
    }

    stats.set(type, current);
  }

  return stats;
}

export function aggregateRevenueStats(
  stats: Map<string, ServiceRevenueStats>,
): {
  totalRevenue: number;
  totalBookings: number;
  paymentsByService: Array<{ service: string; amount: number; count: number }>;
} {
  let totalRevenue = 0;
  let totalBookings = 0;
  const paymentsByService: Array<{
    service: string;
    amount: number;
    count: number;
  }> = [];

  for (const [serviceType, serviceStats] of stats.entries()) {
    totalRevenue += serviceStats.totalRevenue;
    totalBookings += serviceStats.totalBookings;

    if (serviceStats.paidBookings > 0) {
      paymentsByService.push({
        service: formatServiceTypeLabel(serviceType),
        amount: serviceStats.totalRevenue,
        count: serviceStats.paidBookings,
      });
    }
  }

  paymentsByService.sort((a, b) => b.amount - a.amount);

  return { totalRevenue, totalBookings, paymentsByService };
}
