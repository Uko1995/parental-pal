import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdminUser, resolveParentByEmail } from "@/lib/admin-parent-invoice";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import {
  calculateParentInvoiceTotals,
  generateParentInvoiceNumber,
  normalizeParentInvoiceLineItem,
  validatePastOnlyLineItems,
} from "@/lib/parent-invoice";
import type { ParentInvoiceLineItem } from "@/models/ParentInvoice";

function normalizeLineItems(raw: unknown): ParentInvoiceLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    normalizeParentInvoiceLineItem(item as Partial<ParentInvoiceLineItem>),
  );
}

export async function POST(req: NextRequest) {
  const adminResult = await requireAdminUser();
  if (!adminResult.ok) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status },
    );
  }

  const body = await req.json();
  const parentEmail = String(body.parentEmail || "").trim();
  const lineItems = normalizeLineItems(body.lineItems);

  const parentResult = await resolveParentByEmail(parentEmail);
  if (!parentResult.ok) {
    return NextResponse.json(
      { error: parentResult.error },
      { status: parentResult.status },
    );
  }

  const validation = validatePastOnlyLineItems(lineItems);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const totals = calculateParentInvoiceTotals(lineItems);
  const invoice = await ParentInvoiceRepository.create({
    userId: new ObjectId(parentResult.parent._id!),
    invoiceNumber: generateParentInvoiceNumber(),
    status: "draft",
    lineItems,
    ...totals,
  });

  return NextResponse.json(
    {
      invoice: {
        ...invoice,
        _id: invoice._id?.toString(),
        userId: invoice.userId.toString(),
      },
      parentName: parentResult.parentName,
    },
    { status: 201 },
  );
}
