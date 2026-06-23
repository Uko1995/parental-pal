import { getDb } from "@/lib/mongodb";
import { HTR26_SEASON_ID, isHtrSummerCampBooking } from "@/lib/htr-camp";
import type { BookingInterface } from "@/models/Booking";

const HTR26_COUNTER_KEY = "htr26-camper-seq";

export { HTR26_SEASON_ID, isHtrSummerCampBooking };

export interface CampChildWithWeeks {
  childId: string;
  campWeeks: Array<{
    startDate: string;
    endDate: string;
    weekNumber: number;
  }>;
  boarding?: boolean;
  camperId?: string;
}

/** Format: HTR26-WBWK{weeks}-{seq} e.g. HTR26-WBWK6-001 */
export function formatHtrCamperId(weekCount: number, sequence: number): string {
  const weeks = Math.min(6, Math.max(1, weekCount));
  const seq = String(sequence).padStart(3, "0");
  return `HTR26-WBWK${weeks}-${seq}`;
}

async function reserveHtrCamperSequence(count: number): Promise<number> {
  const db = await getDb();
  const result = await db.collection<{ _id: string; seq: number }>("counters").findOneAndUpdate(
    { _id: HTR26_COUNTER_KEY },
    { $inc: { seq: count } },
    { upsert: true, returnDocument: "after" },
  );

  const endSeq = result?.seq ?? count;
  return endSeq - count + 1;
}

export interface HtrCamperEmailEntry {
  name: string;
  camperId: string;
}

export function getHtrCamperEmailEntries(
  booking: Pick<BookingInterface, "serviceType" | "children" | "serviceData">,
): HtrCamperEmailEntry[] {
  const campSeasonId = booking.serviceData?.campSeasonId as string | undefined;

  if (!isHtrSummerCampBooking(booking.serviceType, campSeasonId)) {
    return [];
  }

  const childrenData = booking.serviceData?.childrenData;
  if (!Array.isArray(childrenData)) {
    return [];
  }

  return childrenData
    .map((entry, index) => {
      const camperId = (entry as CampChildWithWeeks).camperId;
      if (!camperId) {
        return null;
      }
      return {
        name: booking.children?.[index]?.name || `Camper ${index + 1}`,
        camperId,
      };
    })
    .filter((entry): entry is HtrCamperEmailEntry => entry !== null);
}

export async function assignHtrCamperIds<T extends CampChildWithWeeks>(
  childrenCampData: T[],
): Promise<(T & { camperId: string })[]> {
  if (childrenCampData.length === 0) {
    return [];
  }

  const startSequence = await reserveHtrCamperSequence(childrenCampData.length);

  return childrenCampData.map((child, index) => ({
    ...child,
    camperId: formatHtrCamperId(
      child.campWeeks.length,
      startSequence + index,
    ),
  }));
}

export async function enrichBookingWithHtrCamperIds(
  bookingData: Pick<BookingInterface, "serviceType"> & {
    serviceData?: BookingInterface["serviceData"];
  },
): Promise<void> {
  const campSeasonId = bookingData.serviceData?.campSeasonId as
    | string
    | undefined;

  if (!isHtrSummerCampBooking(bookingData.serviceType, campSeasonId)) {
    return;
  }

  const childrenData = bookingData.serviceData?.childrenData;
  if (!Array.isArray(childrenData) || childrenData.length === 0) {
    return;
  }

  const alreadyAssigned = childrenData.some(
    (child) =>
      typeof child === "object" &&
      child !== null &&
      "camperId" in child &&
      Boolean((child as { camperId?: string }).camperId),
  );
  if (alreadyAssigned) {
    return;
  }

  const withIds = await assignHtrCamperIds(childrenData as CampChildWithWeeks[]);
  bookingData.serviceData!.childrenData = withIds;
  bookingData.serviceData!.camperIds = withIds.map((c) => c.camperId);
}
