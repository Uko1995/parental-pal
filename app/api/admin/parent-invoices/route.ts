import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdminUser, resolveParentByEmail } from "@/lib/admin-parent-invoice";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import { UserRepository } from "@/lib/UserRepository";
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

export async function GET() {
  const adminResult = await requireAdminUser();
  if (!adminResult.ok) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status },
    );
  }

  const invoices = await ParentInvoiceRepository.findAll();

  const uniqueUserIds = Array.from(
    new Set(invoices.map((inv) => inv.userId.toString())),
  );
  const parentEntries = await Promise.all(
    uniqueUserIds.map(async (id) => {
      const parent = await UserRepository.findById(id);
      return [
        id,
        {
          name: parent?.userData?.user?.name?.trim() || "",
          email: parent?.userData?.user?.email?.trim() || "",
        },
      ] as const;
    }),
  );
  const parentMap = new Map(parentEntries);

  return NextResponse.json({
    invoices: invoices.map((inv) => {
      const parent = parentMap.get(inv.userId.toString());
      return {
        ...inv,
        _id: inv._id?.toString(),
        userId: inv.userId.toString(),
        linkedBookingId: inv.linkedBookingId?.toString(),
        parentName: parent?.name || "",
        parentEmail: parent?.email || "",
      };
    }),
  });
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
