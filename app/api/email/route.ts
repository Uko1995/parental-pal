import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  emailTemplates,
  BookingDetails,
  PaymentDetails,
} from "@/lib/email-service";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin-only access
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, to, userName, data } = await request.json();

    // Validate required fields
    if (!type || !to || !userName) {
      return NextResponse.json(
        { error: "Missing required fields: type, to, userName" },
        { status: 400 }
      );
    }

    let emailContent;

    // Generate email content based on type
    switch (type) {
      case "welcome":
        emailContent = emailTemplates.welcome(userName);
        break;

      case "booking-confirmation":
        if (!data) {
          return NextResponse.json(
            {
              error: "Booking data is required for booking confirmation email",
            },
            { status: 400 }
          );
        }
        emailContent = emailTemplates.bookingConfirmation(
          userName,
          data as BookingDetails
        );
        break;

      case "payment-confirmation":
        if (!data) {
          return NextResponse.json(
            {
              error: "Payment data is required for payment confirmation email",
            },
            { status: 400 }
          );
        }
        emailContent = emailTemplates.paymentConfirmation(
          userName,
          data as PaymentDetails
        );
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid email type. Supported types: welcome, booking-confirmation, payment-confirmation",
          },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.success) {
      return NextResponse.json({
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
