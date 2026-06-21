import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoices = await ParentInvoiceRepository.findSubmittedInvoices();
  return NextResponse.json({
    invoices: invoices.map((inv) => ({
      ...inv,
      _id: inv._id?.toString(),
      userId: inv.userId.toString(),
      linkedBookingId: inv.linkedBookingId?.toString(),
    })),
  });
}
