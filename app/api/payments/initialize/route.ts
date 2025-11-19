import { NextRequest, NextResponse } from "next/server";
import { PaymentInterface } from "@/models/Payment";
import { getCollection } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import { rateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import { ObjectId } from "mongodb";
import { logSecurityEvent, AuditEventType } from "@/lib/audit-logger-mongodb";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limiting: 10 payment initializations per hour
    const rateLimitResult = rateLimit(`payment-init:${ip}`, 10, 3600000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many payment requests" },
        { status: 429 }
      );
    }

    // Authentication required
    const session = await auth();
    if (!session?.user?.email) {
      logSecurityEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        ip,
        "Unauthenticated payment attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await getCollection<PaymentInterface>("payments");
    const rawBody = await req.json();
    const body = sanitizeObject(rawBody);
    const { bookingId, userId, amount, currency, email } = body as {
      bookingId: string;
      userId: string;
      amount: number;
      currency?: string;
      email: string;
    };

    // Validation
    if (!bookingId || !userId || !amount || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Authorization: Verify userId matches current user or is admin
    if (
      userId !== currentUser._id?.toString() &&
      currentUser.role !== "admin"
    ) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        "User attempted payment for another user"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify booking exists and matches amount
    const booking = await BookingRepository.findById(bookingId as string);
    if (!booking) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        "Payment for non-existent booking"
      );
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Amount validation: prevent tampering
    const expectedAmount = booking.pricing?.totalAmount || 0;
    if (Math.abs(amount - expectedAmount) > 0.01) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        `Payment amount mismatch: ${amount} vs ${expectedAmount}`
      );
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const idempotencyKey =
      (body as { idempotencyKey?: string }).idempotencyKey || uuidv4();

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
      bookingId: new ObjectId(bookingId),
      userId: new ObjectId(userId),
      amount,
      currency: currency || "NGN",
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
