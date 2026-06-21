import { getCollection } from "@/lib/mongodb";
import { PaymentInterface } from "@/models/Payment";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import { CACHE_TAGS } from "@/lib/cache-config";

export interface ParentInvoicePaymentInput {
  parentInvoiceId: string;
  userId: string;
  amount: number;
  currency?: string;
  email: string;
  idempotencyKey?: string;
}

export async function initializeParentInvoicePayment(
  input: ParentInvoicePaymentInput,
): Promise<{
  success: boolean;
  error?: string;
  data?: { authorization_url: string; reference: string };
}> {
  const invoice = await ParentInvoiceRepository.findById(input.parentInvoiceId);
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.status !== "pending_payment" && invoice.status !== "approved") {
    return { success: false, error: "Invoice must be approved before payment" };
  }

  if (Math.abs(input.amount - invoice.totalAmount) > 0.01) {
    return { success: false, error: "Invalid payment amount" };
  }

  const idempotencyKey = input.idempotencyKey || uuidv4();
  const payment = await getCollection<PaymentInterface>("payments");

  const existing = await payment.findOne({ idempotencyKey });
  if (existing) {
    const paystackAuthUrl =
      (existing.paystackResponse as { data?: { authorization_url?: string } })
        ?.data?.authorization_url;
    if (paystackAuthUrl) {
      return {
        success: true,
        data: {
          authorization_url: paystackAuthUrl,
          reference: existing.reference,
        },
      };
    }
  }

  const paystackRes = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: Math.round(input.amount * 100),
        currency: input.currency || "NGN",
        metadata: {
          parentInvoiceId: input.parentInvoiceId,
          userId: input.userId,
        },
        reference: idempotencyKey,
        callback_url: `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/payment/callback`,
      }),
    },
  );

  const paystackData = await paystackRes.json();
  if (!paystackData.status) {
    return {
      success: false,
      error: paystackData.message || "Payment initialization failed",
    };
  }

  const bookingRef = invoice.linkedBookingId || new ObjectId(input.parentInvoiceId);

  await payment.insertOne({
    bookingId: bookingRef,
    parentInvoiceId: new ObjectId(input.parentInvoiceId),
    userId: new ObjectId(input.userId),
    amount: input.amount,
    currency: input.currency || "NGN",
    status: "pending",
    reference: paystackData.data.reference,
    channel: "paystack",
    gatewayResponse: "",
    paystackResponse: paystackData,
    idempotencyKey,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidateTag(CACHE_TAGS.PAYMENTS);

  return {
    success: true,
    data: {
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    },
  };
}
