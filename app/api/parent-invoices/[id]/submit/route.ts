import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import { validateParentInvoiceLineItems } from "@/lib/parent-invoice";
import { notifyAdminInvoicePendingApproval } from "@/lib/booking-admin-notifications";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user?._id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const invoice = await ParentInvoiceRepository.findById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.userId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (invoice.status !== "draft" && invoice.status !== "rejected") {
    return NextResponse.json(
      { error: "Invoice cannot be submitted in its current state" },
      { status: 400 },
    );
  }

  const validation = validateParentInvoiceLineItems(invoice.lineItems);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const updated = await ParentInvoiceRepository.update(id, {
    status: "pending_approval",
    approval: {
      submittedAt: new Date(),
      rejectionReason: undefined,
    },
  });

  if (updated) {
    notifyAdminInvoicePendingApproval(updated).catch((err) =>
      console.error("Admin invoice notification failed:", err),
    );
  }

  return NextResponse.json({ success: true, invoice: updated });
}
