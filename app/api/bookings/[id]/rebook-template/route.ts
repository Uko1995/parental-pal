import { NextRequest, NextResponse } from "next/server";
import { getOwnedBooking, buildRebookTemplateResponse } from "@/lib/booking-rebook-api";

export async function GET(
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

    const result = await buildRebookTemplateResponse(owned.booking);
    if ("error" in result && !("formEntries" in result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Rebook template error:", error);
    return NextResponse.json(
      { error: "Failed to build rebook template" },
      { status: 500 },
    );
  }
}
