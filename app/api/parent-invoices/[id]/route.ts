import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import {
  calculateParentInvoiceTotals,
  normalizeParentInvoiceLineItem,
  validateParentInvoiceLineItems,
} from "@/lib/parent-invoice";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";

export async function PATCH(
  req: NextRequest,
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
      { error: "Only draft or rejected invoices can be edited" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const rawLineItems = (body.lineItems || []) as Partial<ParentInvoiceLineItem>[];
  const lineItems = rawLineItems.map(normalizeParentInvoiceLineItem);
  const validation = validateParentInvoiceLineItems(lineItems);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const totals = calculateParentInvoiceTotals(lineItems);
  const linkedBookingId = body.linkedBookingId
    ? new ObjectId(String(body.linkedBookingId))
    : invoice.linkedBookingId;

  const updated = await ParentInvoiceRepository.update(id, {
    lineItems,
    subtotal: totals.subtotal,
    totalAmount: totals.totalAmount,
    currency: totals.currency,
    paymentDueDate: totals.paymentDueDate,
    linkedBookingId,
    status: invoice.status === "rejected" ? "draft" : invoice.status,
    approval: invoice.status === "rejected" ? {} : invoice.approval,
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
