import { revalidateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { createHmac, timingSafeEqual } from "crypto";
import { getCollection } from "@/lib/mongodb";
import { BookingInterface } from "@/models/Booking";
import { PaymentInterface } from "@/models/Payment";
import { UserInterface } from "@/models/User";
import { CACHE_TAGS } from "@/lib/cache-config";
import {
  createPayment,
  findPaymentByReference,
} from "@/lib/PaymentRepository";
import { sendPostPaymentEmails } from "@/lib/booking-payment-emails";

export type PaymentConfirmSource =
  | "verify"
  | "webhook"
  | "admin_reconcile"
  | "admin_manual";

export interface PaystackVerifyResponse {
  status: boolean;
  message?: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel?: string;
    gateway_response?: string;
    metadata?: {
      bookingId?: string;
      userId?: string;
      [key: string]: unknown;
    };
  };
}

export interface ConfirmBookingPaymentInput {
  reference: string;
  paystackData: PaystackVerifyResponse;
  bookingId?: string;
  source: PaymentConfirmSource;
  sendEmail?: boolean;
}

export interface ConfirmBookingPaymentResult {
  success: boolean;
  alreadyPaid: boolean;
  booking?: BookingInterface;
  payment?: PaymentInterface | null;
  error?: string;
}

const AMOUNT_TOLERANCE = 0.01;

export function paymentAmountMatches(
  paidAmount: number,
  expectedAmount: number,
): boolean {
  return Math.abs(paidAmount - expectedAmount) <= AMOUNT_TOLERANCE;
}

export function validatePaystackReconcileBooking(
  bookingId: string,
  metadataBookingId: string | undefined,
): { valid: boolean; error?: string } {
  if (metadataBookingId && metadataBookingId !== bookingId) {
    return {
      valid: false,
      error: "This Paystack reference belongs to a different booking",
    };
  }
  return { valid: true };
}

export function validatePaystackWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function fetchPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return paystackRes.json();
}

export function resolveBookingId(
  explicitId: string | undefined,
  savedPayment: PaymentInterface | null,
  paystackData: PaystackVerifyResponse,
): string | null {
  if (explicitId) return explicitId;
  if (savedPayment?.bookingId) {
    return savedPayment.bookingId instanceof ObjectId
      ? savedPayment.bookingId.toString()
      : String(savedPayment.bookingId);
  }
  const metadataId = paystackData.data?.metadata?.bookingId;
  return metadataId ? String(metadataId) : null;
}

async function ensurePaymentRecord(
  reference: string,
  bookingId: string,
  userId: ObjectId,
  paystackData: PaystackVerifyResponse,
  existing: PaymentInterface | null,
): Promise<PaymentInterface | null> {
  const isSuccess = paystackData.data?.status === "success";
  const paymentStatus = isSuccess ? "success" : "failed";

  if (existing) {
    const payments = await getCollection<PaymentInterface>("payments");
    return (await payments.findOneAndUpdate(
      { reference },
      {
        $set: {
          status: paymentStatus,
          gatewayResponse: paystackData.data?.gateway_response || "",
          paystackResponse: paystackData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )) as PaymentInterface | null;
  }

  const metadata = paystackData.data?.metadata;
  const resolvedUserId =
    metadata?.userId != null
      ? new ObjectId(String(metadata.userId))
      : userId;

  const created = await createPayment({
    bookingId: new ObjectId(bookingId),
    userId: resolvedUserId,
    amount: (paystackData.data?.amount || 0) / 100,
    currency: paystackData.data?.currency || "NGN",
    status: paymentStatus,
    reference,
    channel: paystackData.data?.channel || "paystack",
    gatewayResponse: paystackData.data?.gateway_response || "",
    paystackResponse: paystackData,
    idempotencyKey: `${reference}-recovered`,
  });

  return created as PaymentInterface;
}

async function dispatchPostPaymentEmails(
  booking: BookingInterface,
  reference: string,
  amount: number,
  currency: string,
  method: string,
): Promise<void> {
  const users = await getCollection<UserInterface>("users");
  const user = await users.findOne({
    _id: new ObjectId(booking.userId),
  });

  const email =
    user?.userData?.user?.email || booking.parentEmail || undefined;
  if (!email) return;

  await sendPostPaymentEmails(
    booking,
    {
      name: user?.userData?.user?.name || booking.parentName || "Customer",
      email,
    },
    {
      reference,
      amount,
      currency,
      method,
    },
  );
}

export function invalidatePaymentCaches(): void {
  revalidateTag(CACHE_TAGS.PAYMENTS);
  revalidateTag(CACHE_TAGS.BOOKINGS);
  revalidateTag(CACHE_TAGS.DASHBOARD);
  revalidateTag(CACHE_TAGS.ANALYTICS);
  revalidateTag(CACHE_TAGS.SERVICES);
}

export async function confirmBookingPayment(
  input: ConfirmBookingPaymentInput,
): Promise<ConfirmBookingPaymentResult> {
  const { reference, paystackData, bookingId: explicitBookingId, sendEmail = true } =
    input;

  if (!paystackData.status || !paystackData.data) {
    return {
      success: false,
      alreadyPaid: false,
      error: paystackData.message || "Payment verification failed",
    };
  }

  const isSuccess = paystackData.data.status === "success";
  const bookings = await getCollection<BookingInterface>("bookings");

  const existingPayment = (await findPaymentByReference(
    reference,
  )) as PaymentInterface | null;

  const bookingId = resolveBookingId(
    explicitBookingId,
    existingPayment,
    paystackData,
  );

  if (!bookingId) {
    return {
      success: false,
      alreadyPaid: false,
      error: "Could not resolve booking for this payment reference",
    };
  }

  const booking = await bookings.findOne({
    _id: new ObjectId(bookingId),
  });

  if (!booking) {
    return {
      success: false,
      alreadyPaid: false,
      error: "Booking not found",
    };
  }

  if (existingPayment?.bookingId) {
    const linkedId =
      existingPayment.bookingId instanceof ObjectId
        ? existingPayment.bookingId.toString()
        : String(existingPayment.bookingId);
    if (linkedId !== bookingId) {
      return {
        success: false,
        alreadyPaid: false,
        error: "Payment reference belongs to a different booking",
      };
    }
  }

  if (booking.payment?.status === "paid") {
    return {
      success: true,
      alreadyPaid: true,
      booking,
      payment: existingPayment,
    };
  }

  if (isSuccess) {
    const paidAmount = (paystackData.data.amount || 0) / 100;
    const expectedAmount = booking.pricing?.totalAmount || 0;
    if (!paymentAmountMatches(paidAmount, expectedAmount)) {
      return {
        success: false,
        alreadyPaid: false,
        error: `Payment amount (₦${paidAmount}) does not match booking total (₦${expectedAmount})`,
      };
    }
  }

  const savedPayment = await ensurePaymentRecord(
    reference,
    bookingId,
    booking.userId instanceof ObjectId
      ? booking.userId
      : new ObjectId(String(booking.userId)),
    paystackData,
    existingPayment,
  );

  const bookingPaymentStatus = isSuccess ? "paid" : "pending";
  const updatedBooking = (await bookings.findOneAndUpdate(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        "payment.status": bookingPaymentStatus,
        "payment.transactionId": reference,
        "payment.paymentDate": isSuccess
          ? new Date().toISOString()
          : booking.payment?.paymentDate,
        "payment.paidAmount": isSuccess
          ? (paystackData.data.amount || 0) / 100
          : booking.payment?.paidAmount || 0,
        "payment.method": "card",
        status: isSuccess ? "confirmed" : booking.status,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )) as BookingInterface | null;

  if (isSuccess && updatedBooking && sendEmail) {
    try {
      await dispatchPostPaymentEmails(
        updatedBooking,
        reference,
        (paystackData.data.amount || 0) / 100,
        paystackData.data.currency || "NGN",
        "Card Payment",
      );
    } catch (emailError) {
      console.error("Error sending post-payment emails:", emailError);
    }
  }

  invalidatePaymentCaches();

  return {
    success: isSuccess,
    alreadyPaid: false,
    booking: updatedBooking || undefined,
    payment: savedPayment,
  };
}

export interface ManualConfirmPaymentInput {
  bookingId: string;
  method: "bank_transfer" | "cash" | "installments" | "card";
  paidAmount: number;
  transactionId?: string;
  notes?: string;
  sendEmail?: boolean;
}

export async function manualConfirmBookingPayment(
  input: ManualConfirmPaymentInput,
): Promise<ConfirmBookingPaymentResult> {
  const bookings = await getCollection<BookingInterface>("bookings");
  const booking = await bookings.findOne({
    _id: new ObjectId(input.bookingId),
  });

  if (!booking) {
    return { success: false, alreadyPaid: false, error: "Booking not found" };
  }

  if (booking.payment?.status === "paid") {
    return {
      success: true,
      alreadyPaid: true,
      booking,
    };
  }

  const expectedAmount = booking.pricing?.totalAmount || 0;
  if (!paymentAmountMatches(input.paidAmount, expectedAmount)) {
    return {
      success: false,
      alreadyPaid: false,
      error: `Paid amount (₦${input.paidAmount}) does not match booking total (₦${expectedAmount})`,
    };
  }

  const transactionId =
    input.transactionId || `manual-${Date.now()}-${input.bookingId.slice(-6)}`;

  const updatedBooking = (await bookings.findOneAndUpdate(
    { _id: new ObjectId(input.bookingId) },
    {
      $set: {
        "payment.status": "paid",
        "payment.method": input.method,
        "payment.paidAmount": input.paidAmount,
        "payment.paymentDate": new Date().toISOString(),
        "payment.transactionId": transactionId,
        ...(input.notes
          ? { "payment.reconciliationNotes": input.notes }
          : {}),
        status: "confirmed",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )) as BookingInterface | null;

  if (input.sendEmail !== false && updatedBooking) {
    try {
      await dispatchPostPaymentEmails(
        updatedBooking,
        transactionId,
        input.paidAmount,
        booking.pricing?.currency || "NGN",
        input.method.replace("_", " "),
      );
    } catch (emailError) {
      console.error("Error sending post-payment emails:", emailError);
    }
  }

  invalidatePaymentCaches();

  return {
    success: true,
    alreadyPaid: false,
    booking: updatedBooking || undefined,
  };
}
