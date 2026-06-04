/** Client-safe re-book eligibility (no server / MongoDB imports). */

export function isRebookEligibleBooking(booking: {
  status: string;
  payment?: { status?: string };
  children?: unknown[];
}): boolean {
  if (booking.status === "cancelled") return false;
  if (
    booking.status === "pending" &&
    booking.payment?.status === "pending"
  ) {
    return false;
  }
  if (!booking.children?.length) return false;

  const paid = booking.payment?.status === "paid";
  const activeStatus = ["confirmed", "completed", "in-progress"].includes(
    booking.status,
  );

  return paid || activeStatus;
}
