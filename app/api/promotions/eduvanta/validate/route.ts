import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { EDUVANTA_SERVICE_NAME } from "@/lib/service-utils";

const EDUVANTA_PROMO_CODE = "ONBOARD";
const EDUVANTA_PROMO_VIRTUAL_RATE = 11000;

function isServerDateInJune(now: Date): boolean {
  return now.getMonth() === 5;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim().toUpperCase();
    const tutoringLocation = String(body?.tutoringLocation || "physical");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Promo code is required." },
        { status: 400 },
      );
    }

    if (tutoringLocation !== "virtual") {
      return NextResponse.json(
        {
          success: false,
          error: "This promo code is valid for virtual sessions only.",
        },
        { status: 400 },
      );
    }

    if (!isServerDateInJune(new Date())) {
      return NextResponse.json(
        { success: false, error: "This promo is only available in June." },
        { status: 400 },
      );
    }

    if (code !== EDUVANTA_PROMO_CODE) {
      return NextResponse.json(
        { success: false, error: "Invalid promo code." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const service = await db.collection("services").findOne({
      type: "tutoring",
      name: { $regex: `^${EDUVANTA_SERVICE_NAME}$`, $options: "i" },
      status: "active",
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Promo is not currently available." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        code: EDUVANTA_PROMO_CODE,
        discountedRate: EDUVANTA_PROMO_VIRTUAL_RATE,
        message: "Promo applied. Virtual hourly rate is now ₦11,000.",
      },
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate promo code." },
      { status: 500 },
    );
  }
}
