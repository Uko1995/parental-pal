import { NextRequest, NextResponse } from "next/server";
import { PaymentInterface } from "@/models/Payment";
import { BookingInterface } from "@/models/Booking";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const payment = await getCollection<PaymentInterface>("payments");
  const bookings = await getCollection<BookingInterface>("bookings");
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Payment reference is required" },
      { status: 400 }
    );
  }

  // Call Paystack verify endpoint
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  const paystackData = await paystackRes.json();

  if (!paystackData.status) {
    return NextResponse.json(
      {
        success: false,
        error: paystackData.message || "Payment verification failed",
      },
      { status: 400 }
    );
  }

  const paymentStatus =
    paystackData.data?.status === "success" ? "success" : "failed";
  const bookingPaymentStatus =
    paystackData.data?.status === "success" ? "paid" : "pending";

  // Update payment record
  const savedPayment = await payment.findOneAndUpdate(
    { reference },
    {
      $set: {
        status: paymentStatus,
        gatewayResponse: paystackData.data?.gateway_response || "",
        paystackResponse: paystackData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  // Also update the booking payment status
  if (savedPayment?.bookingId) {
    const bookingIdString =
      savedPayment.bookingId instanceof ObjectId
        ? savedPayment.bookingId.toString()
        : String(savedPayment.bookingId);

    await bookings.findOneAndUpdate(
      { _id: new ObjectId(bookingIdString) },
      {
        $set: {
          "payment.status": bookingPaymentStatus,
          "payment.transactionId": reference,
          "payment.paymentDate":
            paystackData.data?.status === "success"
              ? new Date().toISOString()
              : undefined,
          "payment.paidAmount":
            paystackData.data?.status === "success"
              ? (paystackData.data?.amount || 0) / 100
              : 0,
          "payment.method": "card",
          status:
            paystackData.data?.status === "success" ? "confirmed" : "pending",
          updatedAt: new Date(),
        },
      }
    );
  }

  return NextResponse.json({
    success: paystackData.status,
    payment: savedPayment,
    paystack: paystackData,
  });
}
