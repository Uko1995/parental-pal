import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { PlatformSettingsRepository } from "@/lib/PlatformSettingsRepository";
import { DEFAULT_BANK_TRANSFER } from "@/models/PlatformSettings";
import type { BankTransferDetails } from "@/models/PlatformSettings";

function sanitizeBankTransfer(body: unknown): BankTransferDetails | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const accountName =
    typeof raw.accountName === "string" ? raw.accountName.trim() : "";
  const accountNumber =
    typeof raw.accountNumber === "string" ? raw.accountNumber.trim() : "";
  const bankName = typeof raw.bankName === "string" ? raw.bankName.trim() : "";
  const narrationHint =
    typeof raw.narrationHint === "string"
      ? raw.narrationHint.trim()
      : DEFAULT_BANK_TRANSFER.narrationHint;

  if (!accountName || !accountNumber || !bankName) return null;

  return {
    accountName,
    accountNumber,
    bankName,
    narrationHint:
      narrationHint || DEFAULT_BANK_TRANSFER.narrationHint,
  };
}

/** Any authenticated user can read bank details (for invoices / profile). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await PlatformSettingsRepository.get();
  return NextResponse.json({ bankTransfer: settings.bankTransfer });
}

/** Only admins can update bank transfer details. */
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bankTransfer = sanitizeBankTransfer(
    (body as { bankTransfer?: unknown })?.bankTransfer ?? body,
  );
  if (!bankTransfer) {
    return NextResponse.json(
      {
        error:
          "accountName, accountNumber, and bankName are required non-empty strings",
      },
      { status: 400 },
    );
  }

  const settings =
    await PlatformSettingsRepository.updateBankTransfer(bankTransfer);
  return NextResponse.json({ bankTransfer: settings.bankTransfer });
}
