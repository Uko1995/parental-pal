import { NextResponse } from "next/server";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { auth } from "@/auth";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logSecurityEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import {
  buildInvoiceLineItems,
  buildServiceSummary,
} from "@/lib/booking-invoice";
import { buildBookingReceiptDetails } from "@/lib/booking-payment-emails";
import {
  resolveBookingParentEmail,
  resolveBookingParentName,
} from "@/lib/booking-parent-email";
import { resolveBookingScheduleDates } from "@/lib/booking-schedule";
import validator from "validator";

// Generate a unique invoice number
function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${timestamp}-${random}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only admins can generate invoices
    if (currentUser.role !== "admin") {
      logSecurityEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        currentUser._id?.toString(),
        "",
        "Non-admin user attempted to generate invoice"
      );
      return NextResponse.json(
        { error: "Forbidden - Only admins can generate invoices" },
        { status: 403 }
      );
    }

    // Fetch booking details
    const booking = await BookingRepository.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get parent details
    const parent = await UserRepository.findById(booking.userId);
    if (!parent) {
      return NextResponse.json(
        { error: "Parent not found for this booking" },
        { status: 404 }
      );
    }

    // Check if booking is confirmed or payment is completed
    const isPaymentConfirmed =
      booking.status === "confirmed" || booking.payment?.status === "paid";

    // Get parent name and email (booking email matches invoice modal display)
    const parentName = resolveBookingParentName(booking, parent);
    const defaultParentEmail = resolveBookingParentEmail(booking, parent);

    let body: { sendTo?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedEmail = body.sendTo?.trim();
    const parentEmail =
      requestedEmail && validator.isEmail(requestedEmail)
        ? requestedEmail
        : defaultParentEmail;

    if (!parentEmail) {
      return NextResponse.json(
        { error: "Parent email not found" },
        { status: 400 }
      );
    }

    const items = buildInvoiceLineItems(booking);
    const serviceSummary = buildServiceSummary(booking);
    const positiveSubtotal = items
      .filter((item) => item.total > 0)
      .reduce((sum, item) => sum + item.total, 0);
    const subtotal = positiveSubtotal || booking.pricing?.totalAmount || 0;
    const totalAmount = booking.pricing?.totalAmount || 0;

    let emailContent;
    let documentNumber: string;
    let documentType: string;

    const resolvedSchedule = resolveBookingScheduleDates(booking);
    const receiptSchedule = {
      startDate:
        resolvedSchedule.startDate || booking.schedule?.startDate,
      endDate: resolvedSchedule.endDate || booking.schedule?.endDate,
    };

    if (isPaymentConfirmed) {
      // Generate receipt for confirmed bookings
      documentNumber = generateInvoiceNumber().replace("INV", "RCT");
      documentType = "receipt";

      const receiptDetails = buildBookingReceiptDetails(booking, {
        reference: booking.payment?.transactionId || documentNumber,
        amount: booking.payment?.paidAmount || totalAmount,
        currency: booking.pricing?.currency || "NGN",
        method: booking.payment?.method?.replace("_", " ") || "payment",
      });
      documentNumber = receiptDetails.receiptNumber;

      emailContent = emailTemplates.receipt(parentName, receiptDetails);
    } else {
      // Generate invoice for pending bookings
      documentNumber = generateInvoiceNumber();
      documentType = "invoice";
      const invoiceDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

      const invoiceDetails = {
        invoiceNumber: documentNumber,
        bookingId: booking._id?.toString() || id,
        invoiceDate,
        dueDate,
        serviceType: booking.serviceType || "Service",
        children: booking.children || [],
        schedule: receiptSchedule,
        items,
        subtotal,
        totalAmount,
        currency: booking.pricing?.currency || "₦",
        paymentInstructions:
          "Please log in to your ParentalPal account to make payment for this invoice or contact us via WhatsApp. Visit your profile and navigate to the Payments section.",
        serviceSummary,
      };

      emailContent = emailTemplates.invoice(parentName, invoiceDetails);
    }

    // Send email (invoice or receipt)
    console.log(
      `[invoice] Sending ${documentType} ${documentNumber} to ${parentEmail}`,
    );
    const emailResult = await sendEmail({
      to: parentEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: `Failed to send ${documentType} email`,
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    // Log the document generation
    logSecurityEvent(
      AuditEventType.ADMIN_ACTION,
      currentUser._id?.toString(),
      "",
      `${
        documentType === "receipt" ? "Receipt" : "Invoice"
      } ${documentNumber} sent to ${parentEmail} for booking ${id}`,
      { documentType, documentNumber, bookingId: id, sentTo: parentEmail },
      true,
    );

    return NextResponse.json({
      success: true,
      message: `${
        documentType === "receipt" ? "Receipt" : "Invoice"
      } generated and sent successfully`,
      documentType,
      documentNumber,
      sentTo: parentEmail,
      details: {
        documentNumber,
        documentType,
        bookingId: id,
        totalAmount,
        currency: booking.pricing?.currency || "₦",
        isPaymentConfirmed,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      {
        error: "Failed to generate invoice",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
