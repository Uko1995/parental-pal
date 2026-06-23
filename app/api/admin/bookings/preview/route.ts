import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-parent-invoice";
import { previewAdminBookingPrice } from "@/lib/admin-booking";
import type { BookingFormEntries } from "@/app/booking/action";

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

  const result = await previewAdminBookingPrice(formEntries);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    totalAmount: result.totalAmount,
    currency: result.currency,
  });
}
