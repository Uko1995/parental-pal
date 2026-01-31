import { NextRequest, NextResponse } from "next/server";
import { WeekendEnrichmentRepository } from "@/lib/WeekendEnrichmentRepository";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollmentId, email } = body as { enrollmentId: string; email: string };

    if (!enrollmentId || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: "enrollmentId and email required" },
        { status: 400 }
      );
    }

    const enrollment = await WeekendEnrichmentRepository.findEnrollmentById(enrollmentId);

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const amount = Number(enrollment.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/weekend-enrichment/payment/callback`;
    const reference = `we-${uuidv4()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        amount: Math.round(amount * 100),
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: { enrollmentId },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { success: false, error: paystackData.message || "Paystack failed" },
        { status: 400 }
      );
    }

    await WeekendEnrichmentRepository.setEnrollmentPaystackReference(enrollmentId, reference);

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference,
    });
  } catch (error) {
    console.error("Weekend enrichment initialize payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
