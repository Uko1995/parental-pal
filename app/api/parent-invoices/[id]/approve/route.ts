import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";

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
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoice = await ParentInvoiceRepository.findById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status !== "pending_approval") {
    return NextResponse.json(
      { error: "Only pending invoices can be approved" },
      { status: 400 },
    );
  }

  const updated = await ParentInvoiceRepository.update(id, {
    status: "pending_payment",
    approval: {
      ...invoice.approval,
      reviewedAt: new Date(),
      reviewedBy: user._id as ObjectId,
      rejectionReason: undefined,
    },
  });

  return NextResponse.json({ success: true, invoice: updated });
}
