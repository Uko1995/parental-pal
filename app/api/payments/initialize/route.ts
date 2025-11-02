import { NextRequest, NextResponse } from "next/server";
import { PaymentInterface } from "@/models/Payment";
import { getCollection } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const payment = await getCollection<PaymentInterface>("payments");
    const body = await req.json();
    const { bookingId, userId, amount, currency, email } = body;

    // Validation
    if (!bookingId || !userId || !amount || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    const idempotencyKey = body.idempotencyKey || uuidv4();

    // Check for existing payment with same idempotencyKey
    const existing = await payment.findOne({ idempotencyKey });
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        reused: true,
      });
    }

    // Call Paystack initialize endpoint
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Paystack expects kobo
          currency: currency || "NGN",
          metadata: { bookingId, userId },
          reference: idempotencyKey,
          callback_url: `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/payment/callback`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { success: false, error: paystackData.message },
        { status: 400 }
      );
    }

    // Save payment record
    const savedPayment = await payment.insertOne({
      bookingId,
      userId,
      amount,
      currency,
      status: "pending",
      reference: paystackData.data.reference,
      channel: "paystack",
      gatewayResponse: "",
      paystackResponse: paystackData,
      idempotencyKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: paystackData.data,
      paymentId: savedPayment.insertedId,
      idempotencyKey,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
