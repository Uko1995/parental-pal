import { NextRequest, NextResponse } from "next/server";
import {
  getOwnedBooking,
  buildRebookTemplateResponse,
} from "@/lib/booking-rebook-api";
import { buildRebookTemplate } from "@/lib/booking-rebook";
import { createBookingFromFormEntries } from "@/app/booking/action";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const owned = await getOwnedBooking(id);

    if ("error" in owned) {
      return NextResponse.json(
        { error: owned.error },
        { status: owned.status },
      );
    }

    const templateCheck = await buildRebookTemplateResponse(owned.booking);
    if ("error" in templateCheck && !("formEntries" in templateCheck)) {
      return NextResponse.json(
        { error: templateCheck.error },
        { status: templateCheck.status },
      );
    }

    const { formEntries } = buildRebookTemplate(owned.booking);
    const result = await createBookingFromFormEntries(
      formEntries,
      owned.user,
      owned.sessionUser,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quick rebook error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create rebook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
