import { BookingInterface } from "@/models/Booking";
import {
  sendEmail,
  emailTemplates,
} from "@/lib/email-service";
import {
  buildInvoiceLineItems,
  buildServiceSummary,
} from "@/lib/booking-invoice";
import { resolveBookingScheduleDates } from "@/lib/booking-schedule";
import { getHtrCamperEmailEntries } from "@/lib/camper-id";
import { CAMP_SEASONS } from "@/lib/camp-seasons";

export interface PaymentEmailRecipient {
  name: string;
  email: string;
}

export interface PaymentEmailContext {
  reference: string;
  amount: number;
  currency: string;
  method: string;
}

function formatServiceLabel(booking: BookingInterface): string {
  const campers = getHtrCamperEmailEntries(booking);
  if (campers.length > 0) {
    return CAMP_SEASONS["holidays-that-rock-2026"].name;
  }
  return (booking.serviceType || "service")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function displayCurrency(currency?: string): string {
  if (!currency || currency === "NGN") return "₦";
  return currency;
}

function generateReceiptNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RCT-${timestamp}-${random}`;
}

export function buildBookingReceiptDetails(
  booking: BookingInterface,
  payment: PaymentEmailContext,
) {
  const items = buildInvoiceLineItems(booking);
  const serviceSummary = buildServiceSummary(booking);
  const resolvedSchedule = resolveBookingScheduleDates(booking);
  const positiveSubtotal = items
    .filter((item) => item.total > 0)
    .reduce((sum, item) => sum + item.total, 0);
  const subtotal = positiveSubtotal || booking.pricing?.totalAmount || 0;
  const totalAmount = booking.pricing?.totalAmount || payment.amount;
  const receiptDate = new Date();
  const paymentDate = booking.payment?.paymentDate
    ? new Date(booking.payment.paymentDate)
    : receiptDate;

  return {
    receiptNumber: generateReceiptNumber(),
    bookingId: booking._id?.toString() || "",
    receiptDate,
    paymentDate,
    serviceType: formatServiceLabel(booking),
    children: booking.children || [],
    schedule: {
      startDate:
        resolvedSchedule.startDate || booking.schedule?.startDate,
      endDate: resolvedSchedule.endDate || booking.schedule?.endDate,
    },
    items,
    subtotal,
    totalAmount,
    currency: displayCurrency(booking.pricing?.currency || payment.currency),
    paymentMethod: payment.method,
    transactionId: payment.reference,
    serviceSummary,
    campers: (() => {
      const campers = getHtrCamperEmailEntries(booking);
      return campers.length > 0 ? campers : undefined;
    })(),
  };
}

async function sendPaymentReceiptEmail(
  booking: BookingInterface,
  recipient: PaymentEmailRecipient,
  payment: PaymentEmailContext,
): Promise<void> {
  const receiptDetails = buildBookingReceiptDetails(booking, payment);
  const emailContent = emailTemplates.receipt(recipient.name, receiptDetails);

  const result = await sendEmail({
    to: recipient.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to send payment receipt email");
  }

  console.log(
    `[payment-receipt] Sent detailed receipt ${receiptDetails.receiptNumber} to ${recipient.email} (${booking.serviceType})`,
  );
}

/** Sends the full itemized payment receipt after successful payment (all services). */
export async function sendPostPaymentEmails(
  booking: BookingInterface,
  recipient: PaymentEmailRecipient,
  payment: PaymentEmailContext,
): Promise<void> {
  try {
    await sendPaymentReceiptEmail(booking, recipient, payment);
  } catch (error) {
    console.error("Failed to send payment receipt email:", error);
  }
}
