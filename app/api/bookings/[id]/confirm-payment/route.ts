import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import { logSecurityEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import {
  confirmBookingPayment,
  fetchPaystackTransaction,
  manualConfirmBookingPayment,
  validatePaystackReconcileBooking,
} from "@/lib/booking-payment-confirm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await UserRepository.findByEmail(session.user.email);
    if (!admin || admin.role !== "admin") {
      logSecurityEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        admin?._id?.toString(),
        "",
        "Non-admin attempted to confirm booking payment",
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const body = await request.json();
    const mode = body.mode as "manual" | "paystack_reconcile";

    if (mode === "manual") {
      const method = body.method as
        | "bank_transfer"
        | "cash"
        | "installments"
        | "card";
      const paidAmount = parseFloat(body.paidAmount);
      const notes = body.notes as string | undefined;
      const transactionId = body.transactionId as string | undefined;

      if (!method || Number.isNaN(paidAmount)) {
        return NextResponse.json(
          { error: "method and paidAmount are required" },
          { status: 400 },
        );
      }

      const result = await manualConfirmBookingPayment({
        bookingId,
        method,
        paidAmount,
        transactionId,
        notes,
      });

      if (!result.success && !result.alreadyPaid) {
        return NextResponse.json(
          { error: result.error || "Failed to confirm payment" },
          { status: 400 },
        );
      }

      logSecurityEvent(
        AuditEventType.ADMIN_ACTION,
        admin._id?.toString(),
        "",
        `Manual payment confirmed for booking ${bookingId} (${method}, ₦${paidAmount})${notes ? `: ${notes}` : ""}`,
        undefined,
        true,
      );

      return NextResponse.json({
        success: true,
        alreadyPaid: result.alreadyPaid,
        booking: result.booking,
      });
    }

    if (mode === "paystack_reconcile") {
      const reference = body.reference as string;
      if (!reference) {
        return NextResponse.json(
          { error: "reference is required for paystack_reconcile" },
          { status: 400 },
        );
      }

      const paystackData = await fetchPaystackTransaction(reference);

      if (!paystackData.status || paystackData.data?.status !== "success") {
        return NextResponse.json(
          { error: "Paystack payment not successful or not found" },
          { status: 400 },
        );
      }

      const metadataBookingId = paystackData.data?.metadata?.bookingId;
      const reconcileCheck = validatePaystackReconcileBooking(
        bookingId,
        metadataBookingId,
      );
      if (!reconcileCheck.valid) {
        return NextResponse.json(
          { error: reconcileCheck.error },
          { status: 400 },
        );
      }

      const result = await confirmBookingPayment({
        reference,
        paystackData,
        bookingId,
        source: "admin_reconcile",
      });

      if (!result.success && !result.alreadyPaid) {
        return NextResponse.json(
          { error: result.error || "Reconciliation failed" },
          { status: 400 },
        );
      }

      logSecurityEvent(
        AuditEventType.ADMIN_ACTION,
        admin._id?.toString(),
        "",
        `Paystack payment reconciled for booking ${bookingId} (ref: ${reference})`,
        undefined,
        true,
      );

      return NextResponse.json({
        success: true,
        alreadyPaid: result.alreadyPaid,
        booking: result.booking,
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use "manual" or "paystack_reconcile"' },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
