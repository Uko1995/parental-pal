import { NextRequest, NextResponse } from "next/server";
import { PaymentInterface } from "@/models/Payment";
import  { getCollection } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const payment = await getCollection<PaymentInterface>("payment");
  const { reference } = await req.json();

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

  // Update payment record
  const savedPayment = await payment.findOneAndUpdate(
    { reference },
    {
      $set: {
        reference,
        status: paystackData.data.status === "success" ? "success" : "failed",
        gatewayResponse: paystackData.data.gateway_response,
        paystackResponse: paystackData,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return NextResponse.json({
    success: paystackData.status,
    payment: savedPayment,
    paystack: paystackData,
  });
}
