import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import {
  calculateParentInvoiceTotals,
  generateParentInvoiceNumber,
  normalizeParentInvoiceLineItem,
  validateParentInvoiceLineItems,
} from "@/lib/parent-invoice";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return UserRepository.findByEmail(session.user.email);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await ParentInvoiceRepository.findByUserId(user._id);
  return NextResponse.json({
    invoices: invoices.map((inv) => ({
      ...inv,
      _id: inv._id?.toString(),
      userId: inv.userId.toString(),
      linkedBookingId: inv.linkedBookingId?.toString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    : undefined;

  const invoice = await ParentInvoiceRepository.create({
    userId: user._id,
    linkedBookingId,
    invoiceNumber: generateParentInvoiceNumber(),
    status: "draft",
    lineItems,
    subtotal: totals.subtotal,
    totalAmount: totals.totalAmount,
    currency: totals.currency,
    paymentDueDate: totals.paymentDueDate,
    payment: { status: "pending" },
  });

  return NextResponse.json({
    invoice: {
      ...invoice,
      _id: invoice._id?.toString(),
      userId: invoice.userId.toString(),
      linkedBookingId: invoice.linkedBookingId?.toString(),
    },
  });
}
