import type { BookingInterface } from "@/models/Booking";
import type { UserInterface } from "@/models/User";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserRepository } from "@/lib/UserRepository";
import { addDays, formatLocalDate } from "@/lib/booking-calendar";
import { formatPaymentDueDateLine } from "@/lib/booking-payment-due";
import {
  resolveBookingParentEmail,
  resolveBookingParentName,
} from "@/lib/booking-parent-email";
import { formatServiceTypeLabel } from "@/lib/booking-revenue-stats";
import { emailTemplates, sendEmail } from "@/lib/email-service";

export type PaymentReminderType = "4_day" | "1_day";

export const REMINDER_OFFSETS: ReadonlyArray<{
  type: PaymentReminderType;
  days: number;
}> = [
  { type: "4_day", days: 4 },
  { type: "1_day", days: 1 },
];

export interface PaymentReminderSummary {
  sent: number;
  skipped: number;
  errors: number;
  details: Array<{ bookingId: string; type: PaymentReminderType; ok: boolean; reason?: string }>;
}

export function getTargetDueDatesForToday(today: Date): {
  fourDayDue: string;
  oneDayDue: string;
} {
  const todayStr = formatLocalDate(today);
  return {
    fourDayDue: addDays(todayStr, 4),
    oneDayDue: addDays(todayStr, 1),
  };
}

export function getDueDateForReminderType(
  today: Date,
  reminderType: PaymentReminderType,
): string {
  const offsets = getTargetDueDatesForToday(today);
  return reminderType === "4_day" ? offsets.fourDayDue : offsets.oneDayDue;
}

export function getDaysRemainingForReminderType(
  reminderType: PaymentReminderType,
): number {
  return reminderType === "4_day" ? 4 : 1;
}

export function wasReminderAlreadySent(
  booking: Pick<BookingInterface, "paymentReminders">,
  reminderType: PaymentReminderType,
): boolean {
  if (reminderType === "4_day") {
    return Boolean(booking.paymentReminders?.fourDaySentAt);
  }
  return Boolean(booking.paymentReminders?.oneDaySentAt);
}

export function isEligibleForPaymentReminder(
  booking: BookingInterface,
  reminderType: PaymentReminderType,
  parentEmail: string,
): { ok: true } | { ok: false; reason: string } {
  if (booking.payment?.status !== "pending") {
    return { ok: false, reason: "payment not pending" };
  }
  if (!booking.payment.paymentDueDate) {
    return { ok: false, reason: "missing due date" };
  }
  if ((booking.pricing?.totalAmount ?? 0) <= 0) {
    return { ok: false, reason: "zero amount" };
  }
  if (booking.status === "cancelled" || booking.status === "completed") {
    return { ok: false, reason: "booking inactive" };
  }
  if (wasReminderAlreadySent(booking, reminderType)) {
    return { ok: false, reason: "already sent" };
  }
  if (!parentEmail) {
    return { ok: false, reason: "missing parent email" };
  }
  return { ok: true };
}

export function buildPaymentReminderEmail(
  booking: BookingInterface,
  parentName: string,
  daysRemaining: number,
): { subject: string; html: string; text: string } {
  const profileUrl = `${process.env.NEXTAUTH_URL || ""}/profile?tab=payments`;
  const serviceLabel = formatServiceTypeLabel(booking.serviceType);
  const amount = booking.pricing?.totalAmount ?? 0;
  const dueDate = booking.payment?.paymentDueDate;
  const dueLine = formatPaymentDueDateLine(dueDate);

  return emailTemplates.paymentReminder({
    parentName,
    serviceLabel,
    amount,
    dueDate: dueDate || "",
    dueLine,
    daysRemaining,
    profileUrl,
  });
}

export async function findBookingsNeedingReminder(
  dueDate: string,
): Promise<BookingInterface[]> {
  return BookingRepository.findUnpaidByPaymentDueDate(dueDate);
}

export async function processPaymentReminders(
  today: Date = new Date(),
): Promise<PaymentReminderSummary> {
  const summary: PaymentReminderSummary = {
    sent: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };
  const sentAt = formatLocalDate(today);
  const userCache = new Map<string, UserInterface | null>();

  for (const { type, days } of REMINDER_OFFSETS) {
    const dueDate = getDueDateForReminderType(today, type);
    const bookings = await findBookingsNeedingReminder(dueDate);

    for (const booking of bookings) {
      const bookingId = booking._id?.toString() || "unknown";
      let user: UserInterface | null = null;
      if (booking.userId) {
        const userId = booking.userId.toString();
        if (!userCache.has(userId)) {
          userCache.set(userId, await UserRepository.findById(userId));
        }
        user = userCache.get(userId) ?? null;
      }

      const parentEmail = resolveBookingParentEmail(booking, user);
      const eligibility = isEligibleForPaymentReminder(
        booking,
        type,
        parentEmail,
      );

      if (!eligibility.ok) {
        summary.skipped += 1;
        summary.details.push({
          bookingId,
          type,
          ok: false,
          reason: eligibility.reason,
        });
        continue;
      }

      const parentName = resolveBookingParentName(booking, user);
      const template = buildPaymentReminderEmail(booking, parentName, days);
      const result = await sendEmail({
        to: parentEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!result.success) {
        summary.errors += 1;
        summary.details.push({
          bookingId,
          type,
          ok: false,
          reason: result.error || "email send failed",
        });
        continue;
      }

      if (booking._id) {
        await BookingRepository.markPaymentReminderSent(
          booking._id,
          type,
          sentAt,
        );
      }

      summary.sent += 1;
      summary.details.push({ bookingId, type, ok: true });
    }
  }

  return summary;
}
