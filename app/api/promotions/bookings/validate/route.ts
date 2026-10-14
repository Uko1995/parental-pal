import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { previewBookingPrice } from "@/app/booking/action";

// POST /api/promotions/bookings/validate
// Body: { formEntries } (the booking form fields, including adminPromoCode).
// Prices the booking exactly as submission would and reports the discount.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please sign in to check promos." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const rawEntries = body?.formEntries;
    if (!rawEntries || typeof rawEntries !== "object") {
      return NextResponse.json(
        { success: false, error: "Booking details are required." },
        { status: 400 },
      );
    }

    const formEntries: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawEntries)) {
      formEntries[key] = typeof value === "string" ? value : String(value);
    }

    let preview;
    try {
      preview = await previewBookingPrice(formEntries);
    } catch {
      // Incomplete form: nothing to price yet.
      return NextResponse.json({ success: true, data: null });
    }

    const enteredCode = (formEntries.adminPromoCode || "").trim().toUpperCase();
    const applied = preview.adminPromotion;

    return NextResponse.json({
      success: true,
      data: {
        baseAmount: preview.baseAmount,
        totalAmount: preview.totalAmount,
        discount: preview.discount ?? null,
        promotion: applied
          ? {
              code: applied.code,
              automatic: applied.automatic,
              discountAmount: applied.discountAmount,
              label: preview.discount?.reason ?? applied.code,
            }
          : null,
        codeApplied: Boolean(enteredCode && applied?.code === enteredCode),
        codeError: preview.adminPromoCodeError ?? null,
      },
    });
  } catch (error) {
    console.error("Booking promo validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check promos." },
      { status: 500 },
    );
  }
}
