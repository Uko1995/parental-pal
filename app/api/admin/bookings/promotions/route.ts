import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-parent-invoice";
import { listAdminBookingPromotions } from "@/lib/admin-booking";
import type { BookingFormEntries } from "@/app/booking/action";

/**
 * POST /api/admin/bookings/promotions
 * Body: { formEntries } — same shape as admin booking preview/create.
 */
export async function POST(req: NextRequest) {
  const adminResult = await requireAdminUser();
  if (!adminResult.ok) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status },
    );
  }

  const body = await req.json();
  const formEntries = (body.formEntries || body) as BookingFormEntries;
  const result = await listAdminBookingPromotions(formEntries);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    data: {
      baseAmount: result.baseAmount,
      promotions: result.promotions,
    },
  });
}
