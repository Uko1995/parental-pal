import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser, resolveParentByEmail } from "@/lib/admin-parent-invoice";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import {
  calculateParentInvoiceTotals,
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

export async function PATCH(
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

  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft invoices can be updated" },
      { status: 400 },
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
  const updated = await ParentInvoiceRepository.update(id, {
    userId: parentResult.parent._id!,
    lineItems,
    ...totals,
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
    parentName: parentResult.parentName,
  });
}
