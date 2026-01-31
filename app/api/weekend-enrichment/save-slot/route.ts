import { NextRequest, NextResponse } from "next/server";
import { WeekendEnrichmentRepository } from "@/lib/WeekendEnrichmentRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentName, parentEmail, childName, childAge } = body as {
      parentName: string;
      parentEmail: string;
      childName: string;
      childAge: string;
    };

    if (!parentName?.trim() || !parentEmail?.trim() || !childName?.trim() || !childAge?.trim()) {
      return NextResponse.json(
        { success: false, error: "Parent name, email, child name and age are required" },
        { status: 400 }
      );
    }

    await WeekendEnrichmentRepository.createSaveSlot({
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      childName: childName.trim(),
      childAge: String(childAge).trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Weekend save slot error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save slot" },
      { status: 500 }
    );
  }
}
