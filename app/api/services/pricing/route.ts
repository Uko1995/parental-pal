import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const servicesCollection = db.collection("services");

    // Fetch all active services with their pricing
    const services = await servicesCollection
      .find(
        { status: "active" },
        {
          projection: {
            type: 1,
            name: 1,
            pricing: 1,
          },
        }
      )
      .toArray();

    // Transform into a pricing map
    const pricingMap: Record<
      string,
      {
        baseRate: number;
        currency: string;
        billingType: string;
      }
    > = {};

    services.forEach((service) => {
      pricingMap[service.type] = {
        baseRate: service.pricing.baseRate,
        currency: service.pricing.currency,
        billingType: service.pricing.billingType,
      };
    });

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
      { status: 500 }
    );
  }
}
