import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { WeekendEnrichmentRepository } from "@/lib/WeekendEnrichmentRepository";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await WeekendEnrichmentRepository.listSaveSlots();

    const serialized = list.map((d) => ({
      ...d,
      _id: d._id?.toString(),
      createdAt: d.createdAt?.toISOString?.(),
    }));

    return NextResponse.json({ success: true, saveSlots: serialized });
  } catch (error) {
    console.error("Weekend save slots list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list save slots" },
      { status: 500 }
    );
  }
}
