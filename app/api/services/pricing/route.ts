import { NextResponse } from "next/server";
import { fetchServicePricingMap } from "@/lib/service-pricing-server";

export async function GET() {
  try {
    const pricingMap = await fetchServicePricingMap();
    return NextResponse.json({
      success: true,
      data: pricingMap,
    });
  } catch (error) {
    console.error("Error fetching service pricing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service pricing",
      },
      { status: 500 },
    );
  }
}
