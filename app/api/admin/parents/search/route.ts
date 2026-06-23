import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-parent-invoice";
import { UserRepository } from "@/lib/UserRepository";

export async function GET(req: NextRequest) {
  const adminResult = await requireAdminUser();
  if (!adminResult.ok) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status },
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitParam) ? limitParam : 8;

  const parents = await UserRepository.searchParents(q, limit);
  return NextResponse.json({ parents });
}
