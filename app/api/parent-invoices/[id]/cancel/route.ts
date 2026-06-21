import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import {
  canParentCancelInvoice,
  getParentCancelInvoiceBlockReason,
} from "@/lib/parent-invoice";

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

  const blockReason = getParentCancelInvoiceBlockReason(invoice);
  if (blockReason || !canParentCancelInvoice(invoice)) {
    return NextResponse.json(
      { error: blockReason || "This invoice cannot be cancelled" },
      { status: 400 },
    );
  }

  const updated = await ParentInvoiceRepository.update(id, {
    status: "cancelled",
  });

  return NextResponse.json({
    success: true,
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
