import { NextRequest, NextResponse } from "next/server";
import { WeekendEnrichmentRepository } from "@/lib/WeekendEnrichmentRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body as { reference: string };

    if (!reference?.trim()) {
      return NextResponse.json(
        { success: false, error: "reference required" },
        { status: 400 },
      );
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paystackData = await verifyRes.json();

    if (!paystackData.status || paystackData.data?.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const enrollmentId = paystackData.data?.metadata?.enrollmentId;
    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: "Invalid payment metadata" },
        { status: 400 },
      );
    }

    const updated = await WeekendEnrichmentRepository.updateEnrollmentPayment(
      enrollmentId,
      {
        paymentStatus: "paid",
        paystackReference: reference,
      },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 },
      );
    }

    // Fetch enrollment data for Facebook Pixel Purchase event
    const enrollment =
      await WeekendEnrichmentRepository.findEnrollmentById(enrollmentId);

    return NextResponse.json({
      success: true,
      paymentStatus: "paid",
      amount: enrollment?.amount || 0,
      programName: enrollment?.programName || "Weekend Enrichment Program",
    });
  } catch (error) {
    console.error("Weekend enrichment verify payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
