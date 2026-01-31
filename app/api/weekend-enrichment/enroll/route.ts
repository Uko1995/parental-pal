import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { WeekendEnrichmentRepository } from "@/lib/WeekendEnrichmentRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parentName,
      parentEmail,
      parentPhone,
      children,
      programId,
      programName,
      startDate,
      amount,
    } = body as {
      parentName: string;
      parentEmail: string;
      parentPhone: string;
      children: { name: string; age: string }[];
      programId: string;
      programName: string;
      startDate: string;
      amount: number;
    };

    if (
      !parentName?.trim() ||
      !parentEmail?.trim() ||
      !parentPhone?.trim() ||
      !Array.isArray(children) ||
      children.length === 0 ||
      !programId ||
      !programName ||
      !startDate ||
      typeof amount !== "number" ||
      amount <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const { insertedId } = await WeekendEnrichmentRepository.createEnrollment({
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: parentPhone.trim(),
      children: children.map((c) => ({
        name: String(c.name ?? "").trim(),
        age: String(c.age ?? "").trim(),
      })),
      programId,
      programName,
      startDate: startDate.trim(),
      amount,
      currency: "NGN",
      paymentStatus: "pending",
    });

    return NextResponse.json({
      success: true,
      enrollmentId: insertedId,
    });
  } catch (error) {
    console.error("Weekend enrichment enroll error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}

/** GET: list enrollments (admin only) */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await WeekendEnrichmentRepository.listEnrollments();

    const serialized = list.map((d) => ({
      ...d,
      _id: d._id?.toString(),
      createdAt: d.createdAt?.toISOString?.(),
      updatedAt: d.updatedAt?.toISOString?.(),
    }));

    return NextResponse.json({ success: true, enrollments: serialized });
  } catch (error) {
    console.error("Weekend enrichment list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list enrollments" },
      { status: 500 }
    );
  }
}
