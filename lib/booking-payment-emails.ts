import { BookingInterface } from "@/models/Booking";
import {
  sendEmail,
  emailTemplates,
  type BookingDetails,
  type PaymentDetails,
} from "@/lib/email-service";
import {
  buildInvoiceLineItems,
  buildServiceSummary,
} from "@/lib/booking-invoice";
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
    schedule: booking.schedule,
    items,
    subtotal,
    totalAmount,
    currency: displayCurrency(booking.pricing?.currency || payment.currency),
    paymentMethod: payment.method,
    transactionId: payment.reference,
    serviceSummary,
  };
}

async function sendPaymentConfirmationEmail(
  booking: BookingInterface,
  recipient: PaymentEmailRecipient,
  payment: PaymentEmailContext,
): Promise<void> {
  const campers = getHtrCamperEmailEntries(booking);
  const paymentDetails: PaymentDetails = {
    transactionId: payment.reference,
    amount: payment.amount,
    currency: displayCurrency(payment.currency),
    method: payment.method,
    serviceType: formatServiceLabel(booking),
    campers: campers.length > 0 ? campers : undefined,
  };

  const emailContent = emailTemplates.paymentConfirmation(
    recipient.name,
    paymentDetails,
  );

  const result = await sendEmail({
    to: recipient.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to send payment confirmation email");
  }
}

async function sendBookingConfirmationEmail(
  booking: BookingInterface,
  recipient: PaymentEmailRecipient,
): Promise<void> {
  const bookingDetails: BookingDetails = {
    _id: booking._id?.toString(),
    serviceType: formatServiceLabel(booking),
    schedule: booking.schedule,
    children: booking.children,
    status: booking.status || "confirmed",
    pricing: {
      totalAmount: booking.pricing?.totalAmount,
      currency: displayCurrency(booking.pricing?.currency),
    },
  };

  const emailContent = emailTemplates.bookingConfirmation(
    recipient.name,
    bookingDetails,
  );

  const result = await sendEmail({
    to: recipient.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to send booking confirmation email");
  }
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
}

export async function sendPostPaymentEmails(
  booking: BookingInterface,
  recipient: PaymentEmailRecipient,
  payment: PaymentEmailContext,
): Promise<void> {
  const tasks = [
    {
      label: "payment confirmation",
      send: () => sendPaymentConfirmationEmail(booking, recipient, payment),
    },
    {
      label: "booking confirmation",
      send: () => sendBookingConfirmationEmail(booking, recipient),
    },
    {
      label: "payment receipt",
      send: () => sendPaymentReceiptEmail(booking, recipient, payment),
    },
  ];

  for (const task of tasks) {
    try {
      await task.send();
    } catch (error) {
      console.error(`Failed to send ${task.label} email:`, error);
    }
  }
}
