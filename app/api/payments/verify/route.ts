import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { PaymentInterface } from "@/models/Payment";
import { BookingInterface } from "@/models/Booking";
import { UserInterface } from "@/models/User";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getHtrCamperEmailEntries } from "@/lib/camper-id";
import { CAMP_SEASONS } from "@/lib/camp-seasons";

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

    const updatedBooking = await bookings.findOneAndUpdate(
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
      },
      { returnDocument: "after" }
    );

    // Send payment confirmation email if payment was successful
    if (paystackData.data?.status === "success" && updatedBooking) {
      try {
        // Get user details
        const users = await getCollection<UserInterface>("users");
        const user = await users.findOne({
          _id: new ObjectId(updatedBooking.userId),
        });

        if (user?.userData?.user?.email) {
          const campers = getHtrCamperEmailEntries(updatedBooking);
          const serviceLabel =
            campers.length > 0
              ? CAMP_SEASONS["holidays-that-rock-2026"].name
              : updatedBooking.serviceType;

          const emailResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/email` ||
              "http://localhost:3000/api/email",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "payment-confirmation",
                to: user.userData.user.email,
                userName: user.userData.user.name || "Customer",
                apiKey: process.env.EMAIL_API_KEY,
                data: {
                  transactionId: reference,
                  amount: (paystackData.data?.amount || 0) / 100,
                  currency: paystackData.data?.currency || "NGN",
                  method: "Card Payment",
                  serviceType: serviceLabel,
                  campers: campers.length > 0 ? campers : undefined,
                },
              }),
            }
          );

          if (emailResponse.ok) {
            console.log("✅ Payment confirmation email sent successfully");
          } else {
            console.error(
              "❌ Failed to send payment confirmation email:",
              await emailResponse.text()
            );
          }
        }
      } catch (emailError) {
        console.error(
          "❌ Error sending payment confirmation email:",
          emailError
        );
      }
    }
  }

  // Invalidate relevant caches immediately
  revalidateTag(CACHE_TAGS.PAYMENTS);
  revalidateTag(CACHE_TAGS.BOOKINGS);
  revalidateTag(CACHE_TAGS.DASHBOARD);
  revalidateTag(CACHE_TAGS.ANALYTICS);

  return NextResponse.json({
    success: paystackData.status,
    payment: savedPayment,
    paystack: paystackData,
  });
}
