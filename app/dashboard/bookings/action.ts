import { BookingRepository } from "@/lib/BookingRepository";
import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";

interface BookingsListParams {
  status?: string;
  serviceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

const fetchBookings = async (params: BookingsListParams = {}) => {
  const { status, serviceType, dateFrom, dateTo } = params;

  let bookings;

  if (status && status !== "all") {
    bookings = await BookingRepository.findByStatus(status);
  } else if (serviceType && serviceType !== "all") {
    bookings = await BookingRepository.findByServiceType(serviceType);
  } else if (dateFrom && dateTo) {
    bookings = await BookingRepository.findByDateRange(
      new Date(dateFrom),
      new Date(dateTo)
    );
  } else {
    // Get pending bookings as default
    bookings = await BookingRepository.findPendingBookings();
  }

  return {
    bookings,
    totalCount: bookings.length,
  };
};

export const getBookings = unstable_cache(fetchBookings, ["bookings-list"], {
  revalidate: CACHE_TIMES.BOOKINGS,
  tags: [CACHE_TAGS.BOOKINGS, CACHE_TAGS.DASHBOARD],
});

export const getBookingById = unstable_cache(
  async (bookingId: string) => {
    return await BookingRepository.findById(bookingId);
  },
  ["booking-detail"],
  {
    revalidate: CACHE_TIMES.BOOKINGS,
    tags: [CACHE_TAGS.BOOKINGS],
  }
);

export const getBookingStats = unstable_cache(
  async () => {
    return await BookingRepository.getBookingStats();
  },
  ["booking-stats"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.BOOKINGS, CACHE_TAGS.ANALYTICS],
  }
);
