import type { BookingInterface } from "@/models/Booking";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const SPACE_RENTAL_RATES: Record<string, number> = {
  dj: 150000,
  mc: 60000,
  "event-planning": 150000,
  "extra-carers": 8000,
};

function formatServiceType(serviceType: string): string {
  return serviceType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDateLabel(dateStr: string): string {
  return parseDateString(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function countTutoringSessions(
  schedule?: Array<{ dates?: Array<{ date: string }> }>,
): number {
  if (!schedule?.length) return 0;
  return schedule.reduce((sum, block) => sum + (block.dates?.length || 0), 0);
}

function formatWeekRange(
  week: { startDate: string; endDate: string; weekNumber?: number; dateLabel?: string },
): string {
  if (week.dateLabel) return week.dateLabel;
  const label = week.weekNumber ? `Week ${week.weekNumber}: ` : "";
  return `${label}${formatDateLabel(week.startDate)} – ${formatDateLabel(week.endDate)}`;
}

export function buildInvoiceLineItems(
  booking: BookingInterface,
): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];
  const sd = booking.serviceData || {};
  const children = booking.children || [];
  const childrenData = sd.childrenData || [];

  switch (booking.serviceType) {
    case "tutoring": {
      const hourlyRate = sd.hourlyRate || 0;
      const location =
        sd.tutoringLocation === "virtual" ? "Virtual" : "Physical";

      childrenData.forEach((childData, index) => {
        const childName = children[index]?.name || `Child ${index + 1}`;
        const sessionCount = countTutoringSessions(childData.schedule);
        const quantity =
          sessionCount > 0 ? sessionCount : childData.totalHours || 1;
        const unitPrice = hourlyRate;
        const subjects = childData.subjects?.join(", ") || "Tutoring";
        const scheduleSummary =
          childData.schedule
            ?.map((s) => {
              const days = s.dates?.length || 0;
              return `${s.day} (${days} session${days === 1 ? "" : "s"}, ${s.startTime || "TBD"})`;
            })
            .join("; ") || "";

        items.push({
          description: `${subjects} — ${childName} (${location})${scheduleSummary ? ` — ${scheduleSummary}` : ""}`,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        });
      });

      if (items.length === 0) {
        items.push({
          description: `${formatServiceType(booking.serviceType)} Service`,
          quantity: 1,
          unitPrice: booking.pricing?.totalAmount || 0,
          total: booking.pricing?.totalAmount || 0,
        });
      }
      break;
    }

    case "childcare": {
      const dailyRate = sd.dailyRate || 0;
      const monthlyRate = sd.monthlyRate || 0;

      childrenData.forEach((childData, index) => {
        const childName = children[index]?.name || `Child ${index + 1}`;
        const isMonthly =
          childData.careType === "monthly" || childData.isMonthSelected;

        if (isMonthly) {
          items.push({
            description: `Monthly childcare — ${childName} (${childData.totalDays || "full"} days, drop-off ${childData.dropoffTime || "TBD"})`,
            quantity: 1,
            unitPrice: monthlyRate,
            total: monthlyRate,
          });
        } else {
          const days = childData.totalDays || 0;
          items.push({
            description: `Daily childcare — ${childName} (${days} day${days === 1 ? "" : "s"}/week)`,
            quantity: days,
            unitPrice: dailyRate,
            total: days * dailyRate,
          });
        }
      });

      if (items.length === 0) {
        items.push({
          description: `${formatServiceType(booking.serviceType)} Service`,
          quantity: 1,
          unitPrice: booking.pricing?.totalAmount || 0,
          total: booking.pricing?.totalAmount || 0,
        });
      }
      break;
    }

    case "holiday-camps": {
      const weeklyRate =
        sd.weeklyRate || (sd as { campFee?: number }).campFee || 0;
      const location = sd.campLocation
        ? String(sd.campLocation).charAt(0).toUpperCase() +
          String(sd.campLocation).slice(1)
        : "";

      childrenData.forEach((childData, index) => {
        const childName = children[index]?.name || `Child ${index + 1}`;
        const weeks = childData.campWeeks || [];
        const weekLabels = weeks.map((w) => formatWeekRange(w)).join("; ");
        const boarding = childData.boarding ? " + Boarding" : "";

        items.push({
          description: `Holiday camp — ${childName}${location ? ` (${location})` : ""}${boarding}${weekLabels ? ` — ${weekLabels}` : ""}`,
          quantity: weeks.length || 1,
          unitPrice: weeklyRate,
          total: (weeks.length || 1) * weeklyRate,
        });
      });

      if (items.length === 0) {
        items.push({
          description: `${formatServiceType(booking.serviceType)} Service`,
          quantity: 1,
          unitPrice: booking.pricing?.totalAmount || 0,
          total: booking.pricing?.totalAmount || 0,
        });
      }
      break;
    }

    case "homeschooling": {
      const termRate = (sd as { termRate?: number }).termRate || 0;

      childrenData.forEach((childData, index) => {
        const childName = children[index]?.name || `Child ${index + 1}`;
        const subjects = childData.selectedSubjects?.join(", ") || "Homeschooling";
        const term = childData.selectedTerm || "Term";

        items.push({
          description: `${subjects} — ${childName} (${term}, ${childData.gradeLevel || "Grade N/A"})`,
          quantity: 1,
          unitPrice: termRate,
          total: termRate,
        });
      });

      if (items.length === 0) {
        items.push({
          description: `${formatServiceType(booking.serviceType)} Service`,
          quantity: 1,
          unitPrice: booking.pricing?.totalAmount || 0,
          total: booking.pricing?.totalAmount || 0,
        });
      }
      break;
    }

    case "space-rental": {
      const baseRate = sd.baseRate || 0;
      const venue = sd.venueType
        ? String(sd.venueType).charAt(0).toUpperCase() +
          String(sd.venueType).slice(1)
        : "Venue";
      const eventDate = sd.eventDate
        ? formatDateLabel(sd.eventDate as string)
        : "";

      items.push({
        description: `Space rental — ${sd.eventType || "Event"} (${venue}${eventDate ? `, ${eventDate}` : ""})`,
        quantity: 1,
        unitPrice: baseRate,
        total: baseRate,
      });

      (sd.extraServices || []).forEach((service) => {
        const rate =
          service.rate || SPACE_RENTAL_RATES[service.service] || 0;
        const qty = service.quantity || 1;
        items.push({
          description: `Extra: ${service.service.replace("-", " ")}`,
          quantity: qty,
          unitPrice: rate,
          total: qty * rate,
        });
      });

      if (sd.cautionFee) {
        items.push({
          description: "Caution fee (refundable)",
          quantity: 1,
          unitPrice: sd.cautionFee,
          total: sd.cautionFee,
        });
      }
      break;
    }

    case "kiddies-enrichment": {
      const hourlyRate = sd.hourlyRate || 0;

      childrenData.forEach((childData, index) => {
        const childName = children[index]?.name || `Child ${index + 1}`;
        const enrichment = childData as {
          selectedPrograms?: string[];
          eventDate?: string;
          startTime?: string;
          hours?: number;
        };
        const programs = enrichment.selectedPrograms?.join(", ") || "Enrichment";
        const eventDate = enrichment.eventDate
          ? formatDateLabel(enrichment.eventDate)
          : "";

        items.push({
          description: `${programs} — ${childName}${eventDate ? ` (${eventDate}${enrichment.startTime ? `, ${enrichment.startTime}` : ""})` : ""}`,
          quantity: enrichment.hours || 1,
          unitPrice: hourlyRate,
          total: (enrichment.hours || 1) * hourlyRate,
        });
      });

      if (items.length === 0) {
        items.push({
          description: `${formatServiceType(booking.serviceType)} Service`,
          quantity: 1,
          unitPrice: booking.pricing?.totalAmount || 0,
          total: booking.pricing?.totalAmount || 0,
        });
      }
      break;
    }

    default:
      items.push({
        description: `${formatServiceType(booking.serviceType || "service")} Service`,
        quantity: 1,
        unitPrice: booking.pricing?.totalAmount || 0,
        total: booking.pricing?.totalAmount || 0,
      });
  }

  const discount = booking.pricing?.discount;
  if (discount && discount.value > 0) {
    const discountAmount =
      discount.type === "percentage"
        ? items.reduce((sum, item) => sum + item.total, 0) *
          (discount.value / 100)
        : discount.value;
    items.push({
      description: `Discount${discount.reason ? `: ${discount.reason}` : ""}`,
      quantity: 1,
      unitPrice: -discountAmount,
      total: -discountAmount,
    });
  }

  return items;
}

export function buildServiceSummary(booking: BookingInterface): string {
  const lines: string[] = [];
  const sd = booking.serviceData || {};

  if (booking.schedule?.startDate) {
    let scheduleLine = `Start: ${formatDateLabel(booking.schedule.startDate)}`;
    if (booking.schedule.endDate) {
      scheduleLine += ` — End: ${formatDateLabel(booking.schedule.endDate)}`;
    }
    lines.push(scheduleLine);
  }

  switch (booking.serviceType) {
    case "tutoring":
      (sd.childrenData || []).forEach((childData, index) => {
        const name = booking.children?.[index]?.name || `Child ${index + 1}`;
        const sessions = countTutoringSessions(childData.schedule);
        lines.push(
          `${name}: ${sessions} session${sessions === 1 ? "" : "s"}, ${childData.totalHours || 0} total hours`,
        );
        childData.schedule?.forEach((block) => {
          if (block.dates?.length) {
            const dates = block.dates
              .map((d) => formatDateLabel(d.date))
              .join(", ");
            lines.push(`  ${block.day}: ${dates} @ ${block.startTime || "TBD"}`);
          }
        });
      });
      break;

    case "childcare":
      (sd.childrenData || []).forEach((childData, index) => {
        const name = booking.children?.[index]?.name || `Child ${index + 1}`;
        const plan =
          childData.careType === "monthly" ? "Monthly" : "Daily";
        lines.push(
          `${name}: ${plan} plan, ${childData.totalDays || 0} days, ${childData.dropoffTime || ""} – ${childData.pickupTime || ""}`,
        );
      });
      break;

    case "holiday-camps":
      (sd.childrenData || []).forEach((childData, index) => {
        const name = booking.children?.[index]?.name || `Child ${index + 1}`;
        const weeks = (childData.campWeeks || [])
          .map((w) => formatWeekRange(w))
          .join("; ");
        lines.push(
          `${name}: ${weeks || "No weeks"}${childData.boarding ? " (boarding)" : ""}`,
        );
      });
      break;

    case "homeschooling":
      (sd.childrenData || []).forEach((childData, index) => {
        const name = booking.children?.[index]?.name || `Child ${index + 1}`;
        lines.push(
          `${name}: ${childData.selectedTerm || "Term"}, ${childData.selectedSubjects?.join(", ") || ""}`,
        );
      });
      break;

    case "space-rental":
      if (sd.eventDate) {
        lines.push(
          `Event: ${sd.eventType || "Event"} on ${formatDateLabel(sd.eventDate as string)} ${sd.eventTime || ""}`,
        );
      }
      break;

    case "kiddies-enrichment":
      (sd.childrenData || []).forEach((childData, index) => {
        const name = booking.children?.[index]?.name || `Child ${index + 1}`;
        const enrichment = childData as { hours?: number; eventDate?: string };
        lines.push(
          `${name}: ${enrichment.hours || 0}h on ${enrichment.eventDate ? formatDateLabel(enrichment.eventDate) : "TBD"}`,
        );
      });
      break;
  }

  return lines.join("\n");
}

export function getInvoiceDiscountAmount(
  booking: BookingInterface,
  items: InvoiceLineItem[],
): number {
  const discount = booking.pricing?.discount;
  if (!discount || discount.value <= 0) return 0;

  const positiveTotal = items
    .filter((item) => item.total > 0)
    .reduce((sum, item) => sum + item.total, 0);

  return discount.type === "percentage"
    ? positiveTotal * (discount.value / 100)
    : discount.value;
}
