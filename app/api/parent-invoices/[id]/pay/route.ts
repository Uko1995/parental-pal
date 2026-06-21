import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import { initializeParentInvoicePayment } from "@/lib/parent-invoice-payment";

export async function POST(
  _req: NextRequest,
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

  if (invoice.status !== "pending_payment" && invoice.status !== "approved") {
    return NextResponse.json(
      { error: "Invoice must be approved before payment" },
      { status: 403 },
    );
  }

  const result = await initializeParentInvoicePayment({
    parentInvoiceId: id,
    userId: user._id.toString(),
    amount: invoice.totalAmount,
    currency: invoice.currency,
    email: user.userData?.user?.email || session.user.email,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
