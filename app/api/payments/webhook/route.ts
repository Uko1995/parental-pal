import { NextRequest, NextResponse } from "next/server";
import {
  confirmBookingPayment,
  validatePaystackWebhookSignature,
} from "@/lib/booking-payment-confirm";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!validatePaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      channel?: string;
      gateway_response?: string;
      metadata?: { bookingId?: string; userId?: string };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const paystackData = {
    status: true,
    data: {
      status: event.data?.status || "success",
      reference,
      amount: event.data?.amount || 0,
      currency: event.data?.currency || "NGN",
      channel: event.data?.channel,
      gateway_response: event.data?.gateway_response,
      metadata: event.data?.metadata,
    },
  };

  const result = await confirmBookingPayment({
    reference,
    paystackData,
    bookingId: event.data?.metadata?.bookingId,
    source: "webhook",
  });

  if (!result.success && !result.alreadyPaid) {
    console.error("Webhook confirm failed:", result.error, reference);
  }

  return NextResponse.json({ received: true });
}
