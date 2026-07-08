import { NextRequest, NextResponse } from "next/server";
import { type CampLocation, type CampSeasonId } from "@/lib/camp-seasons";
import { validateHotr26PromoApplication } from "@/lib/camp-promotions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim();
    const campSeasonId = String(body?.campSeasonId || "") as CampSeasonId;
    const campLocation = String(body?.campLocation || "") as CampLocation;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Promo code is required." },
        { status: 400 },
      );
    }

    const result = validateHotr26PromoApplication({
      seasonId: campSeasonId,
      location: campLocation,
      code,
    });

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.message || "Invalid promo code." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        promoCode: result.promoCode,
        message: result.message,
      },
    });
  } catch (error) {
    console.error("HOTR26 promo validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate promo code." },
      { status: 500 },
    );
  }
}
