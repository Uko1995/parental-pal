import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import {
  confirmBookingPayment,
  fetchPaystackTransaction,
} from "@/lib/booking-payment-confirm";
import { confirmParentInvoicePayment } from "@/lib/parent-invoice-payment-confirm";
import { findPaymentByReference } from "@/lib/PaymentRepository";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Payment reference is required" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (session?.user?.email) {
    const user = await UserRepository.findByEmail(session.user.email);
    const existingPayment = await findPaymentByReference(reference);

    if (user && existingPayment?.bookingId) {
      const booking = await BookingRepository.findById(
        existingPayment.bookingId.toString(),
      );
      const isOwner =
        booking?.userId?.toString() === user._id?.toString();
      const isAdmin = user.role === "admin";
      if (booking && !isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const paystackData = await fetchPaystackTransaction(reference);

  if (!paystackData.status) {
    return NextResponse.json(
      {
        success: false,
        error: paystackData.message || "Payment verification failed",
      },
      { status: 400 },
    );
  }

  if (paystackData.data?.metadata?.parentInvoiceId) {
    const invoiceResult = await confirmParentInvoicePayment({
      reference,
      paystackData,
    });

    if (!invoiceResult.success && !invoiceResult.alreadyPaid) {
      return NextResponse.json(
        {
          success: false,
          error: invoiceResult.error || "Invoice payment confirmation failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      alreadyPaid: invoiceResult.alreadyPaid,
      parentInvoiceId: invoiceResult.invoiceId,
    });
  }

  const result = await confirmBookingPayment({
    reference,
    paystackData,
    bookingId: paystackData.data?.metadata?.bookingId,
    source: "verify",
  });

  if (!result.success && !result.alreadyPaid) {
    return NextResponse.json(
      { success: false, error: result.error || "Payment confirmation failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    alreadyPaid: result.alreadyPaid,
    payment: result.payment
      ? { ...result.payment, status: result.payment.status }
      : null,
    booking: result.booking
      ? {
          _id: result.booking._id?.toString(),
          status: result.booking.status,
          payment: result.booking.payment,
        }
      : null,
  });
}
