import { NextRequest, NextResponse } from "next/server";
import { formatLocalDate } from "@/lib/booking-calendar";
import { processPaymentReminders } from "@/lib/booking-payment-reminders";

function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = formatLocalDate(new Date());
    const summary = await processPaymentReminders(new Date());

    console.log("[cron/payment-reminders]", { today, ...summary });

    return NextResponse.json({ ok: true, today, ...summary });
  } catch (error) {
    console.error("[cron/payment-reminders] failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process payment reminders" },
      { status: 500 },
    );
  }
}
