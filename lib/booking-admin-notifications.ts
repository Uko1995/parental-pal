import { UserRepository } from "@/lib/UserRepository";
import { sendEmail } from "@/lib/email-service";
import type { BookingInterface } from "@/models/Booking";
import type { ParentInvoiceInterface } from "@/models/ParentInvoice";
import { formatPaymentDueLabel } from "@/lib/booking-payment-due";
import { getHtrCamperEmailEntries } from "@/lib/camper-id";

async function sendAdminEmail(subject: string, html: string, text: string) {
  try {
    const admins = await UserRepository.findByRole("admin");
    const adminEmails: string[] = [];

    for (const admin of admins) {
      const email = admin.userData?.user?.email;
      if (email) adminEmails.push(email);
    }

    if (!adminEmails.length && process.env.EMAIL_USER) {
      adminEmails.push(process.env.EMAIL_USER);
    }

    for (const to of adminEmails) {
      await sendEmail({ to, subject, html, text });
    }
  } catch (error) {
    console.error("Admin notification email failed:", error);
  }
}

export async function notifyAdminUnpaidBooking(booking: BookingInterface) {
  const dueLabel = formatPaymentDueLabel(booking.payment?.paymentDueDate);
  const campers = getHtrCamperEmailEntries(booking);
  const camperLines =
    campers.length > 0
      ? campers
          .map(
            (camper) =>
              `<li><strong>${camper.name} Camper ID:</strong> ${camper.camperId}</li>`,
          )
          .join("")
      : "";
  const camperText =
    campers.length > 0
      ? ` ${campers.map((c) => `${c.name}: ${c.camperId}`).join("; ")}.`
      : "";
  const subject = `New unpaid booking — ${booking.serviceType}`;
  const html = `
    <p>A new confirmed booking is awaiting payment.</p>
    <ul>
      <li><strong>Service:</strong> ${booking.serviceType}</li>
      <li><strong>Parent:</strong> ${booking.parentName} (${booking.parentEmail})</li>
      <li><strong>Children:</strong> ${(booking.children || []).map((c) => c.name).filter(Boolean).join(", ") || "N/A"}</li>
      <li><strong>Amount:</strong> ₦${booking.pricing?.totalAmount?.toLocaleString()}</li>
      <li><strong>Due:</strong> ${dueLabel}</li>
      <li><strong>Booking ID:</strong> ${booking._id?.toString()}</li>
      ${camperLines}
    </ul>
  `;
  const text = `New unpaid ${booking.serviceType} booking for ${booking.parentName}. Amount ₦${booking.pricing?.totalAmount}. ${dueLabel}.${camperText}`;

  await sendAdminEmail(subject, html, text);
}

export async function notifyAdminInvoicePendingApproval(
  invoice: ParentInvoiceInterface,
) {
  let parentName = "Parent";
  try {
    const parent = await UserRepository.findById(invoice.userId);
    parentName =
      parent?.userData?.user?.name || invoice.userId.toString();
  } catch {
    /* use default */
  }

  const subject = `Parent invoice awaiting approval — ${invoice.invoiceNumber}`;
  const html = `
    <p>${parentName} submitted a session invoice for approval.</p>
    <ul>
      <li><strong>Invoice:</strong> ${invoice.invoiceNumber}</li>
      <li><strong>Lines:</strong> ${invoice.lineItems.length}</li>
      <li><strong>Total:</strong> ₦${invoice.totalAmount.toLocaleString()}</li>
      <li><strong>Due:</strong> ${formatPaymentDueLabel(invoice.paymentDueDate)}</li>
    </ul>
  `;
  const text = `Invoice ${invoice.invoiceNumber} from ${parentName} needs approval. Total ₦${invoice.totalAmount}.`;

  await sendAdminEmail(subject, html, text);
}
