import { NextResponse } from "next/server";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { auth } from "@/auth";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logSecurityEvent, AuditEventType } from "@/lib/audit-logger-mongodb";

// Generate a unique invoice number
function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${timestamp}-${random}`;
}

// Generate invoice items from booking data
function generateInvoiceItems(booking: {
  serviceType?: string;
  children?: Array<{ name: string; age: number }>;
  pricing?: { totalAmount?: number };
}) {
  const items = [];
  const serviceType = booking.serviceType || "Service";
  const childrenCount = booking.children?.length || 1;
  const totalAmount = booking.pricing?.totalAmount || 0;

  // Calculate unit price based on service type
  let unitPrice = totalAmount;
  let quantity = 1;
  let description = `${serviceType
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")} Service`;

  // Adjust for services with multiple children
  if (
    (serviceType === "childcare" || serviceType === "tutoring") &&
    childrenCount > 1
  ) {
    unitPrice = totalAmount / childrenCount;
    quantity = childrenCount;
    description = `${serviceType
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} Service (per child)`;
  }

  items.push({
    description,
    quantity,
    unitPrice,
    total: totalAmount,
  });

  return items;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const bookingId = params.id;

    // Fetch booking details
    const booking = await BookingRepository.findById(bookingId);
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

    // Generate invoice details
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const items = generateInvoiceItems(booking);
    const subtotal = booking.pricing?.totalAmount || 0;
    const totalAmount = subtotal;

    const invoiceDetails = {
      invoiceNumber,
      bookingId: booking._id?.toString() || bookingId,
      invoiceDate,
      dueDate,
      serviceType: booking.serviceType || "Service",
      children: booking.children || [],
      schedule: booking.schedule,
      items,
      subtotal,
      totalAmount,
      currency: booking.pricing?.currency || "₦",
      paymentInstructions:
        "Please log in to your ParentalPal account to make payment for this invoice or contact us via WhatsApp. Visit your profile and navigate to the Payments section.",
    };

    // Get parent name and email
    const parentName = parent.userData?.user?.name || "Valued Customer";
    const parentEmail =
      parent.userData?.user?.email || booking.parentEmail || "";

    if (!parentEmail) {
      return NextResponse.json(
        { error: "Parent email not found" },
        { status: 400 }
      );
    }

    // Send invoice email
    const emailContent = emailTemplates.invoice(parentName, invoiceDetails);
    const emailResult = await sendEmail({
      to: parentEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send invoice email", details: emailResult.error },
        { status: 500 }
      );
    }

    // Log the invoice generation
    logSecurityEvent(
      AuditEventType.ADMIN_ACTION,
      currentUser._id?.toString(),
      "",
      `Invoice ${invoiceNumber} generated for booking ${bookingId}`
    );

    return NextResponse.json({
      success: true,
      message: "Invoice generated and sent successfully",
      invoiceNumber,
      sentTo: parentEmail,
      invoiceDetails: {
        invoiceNumber,
        bookingId,
        invoiceDate,
        dueDate,
        totalAmount,
        currency: invoiceDetails.currency,
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
