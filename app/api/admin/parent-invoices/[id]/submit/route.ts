import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser, resolveParentByEmail } from "@/lib/admin-parent-invoice";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminResult = await requireAdminUser();
  if (!adminResult.ok) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status },
    );
  }

  const { id } = await params;
  const existing = await ParentInvoiceRepository.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parentEmail = String(body.parentEmail || "").trim();
  if (parentEmail) {
    const parentResult = await resolveParentByEmail(parentEmail);
    if (!parentResult.ok) {
      return NextResponse.json(
        { error: parentResult.error },
        { status: parentResult.status },
      );
    }
  }

  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft invoices can be submitted" },
      { status: 400 },
    );
  }

  if (!existing.lineItems.length) {
    return NextResponse.json(
      { error: "Add at least one session line item" },
      { status: 400 },
    );
  }

  const updated = await ParentInvoiceRepository.update(id, {
    status: "pending_payment",
    approval: {
      submittedAt: new Date(),
    },
    payment: {
      status: "pending",
    },
  });

  return NextResponse.json({
    invoice: updated
      ? {
          ...updated,
          _id: updated._id?.toString(),
          userId: updated.userId.toString(),
          linkedBookingId: updated.linkedBookingId?.toString(),
        }
      : null,
  });
}
