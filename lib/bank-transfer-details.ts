import { PlatformSettingsRepository } from "@/lib/PlatformSettingsRepository";
import {
  DEFAULT_BANK_TRANSFER,
  type BankTransferDetails,
} from "@/models/PlatformSettings";

export type { BankTransferDetails };

export async function getBankTransferDetails(): Promise<BankTransferDetails> {
  try {
    const settings = await PlatformSettingsRepository.get();
    return settings.bankTransfer;
  } catch {
    return { ...DEFAULT_BANK_TRANSFER };
  }
}

export function formatNarrationLine(
  bank: BankTransferDetails,
  narrationReference?: string,
): string {
  if (narrationReference?.trim()) {
    return `Use ${narrationReference.trim()} as the transfer narration (booking ID or service).`;
  }
  return (
    bank.narrationHint ||
    "Use the booking ID or service name as the transfer narration"
  );
}

/** Bank transfer block only (HTML). */
export function formatBankTransferHtml(
  bank: BankTransferDetails,
  options?: { narrationReference?: string },
): string {
  const narration = formatNarrationLine(bank, options?.narrationReference);
  return `
    <div style="margin-top: 12px;">
      <strong style="display:block; margin-bottom: 8px;">Option 2: Direct bank transfer</strong>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr>
          <td style="padding:4px 0; color:#666; width:140px;">Account name</td>
          <td style="padding:4px 0; color:#333; font-weight:600;">${escapeHtml(bank.accountName)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#666;">Bank</td>
          <td style="padding:4px 0; color:#333; font-weight:600;">${escapeHtml(bank.bankName)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#666;">Account number</td>
          <td style="padding:4px 0; color:#333; font-weight:600; letter-spacing:0.04em;">${escapeHtml(bank.accountNumber)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#666; vertical-align:top;">Narration</td>
          <td style="padding:4px 0; color:#333;">${escapeHtml(narration)}</td>
        </tr>
      </table>
    </div>
  `.trim();
}

/** Bank transfer block only (plain text). */
export function formatBankTransferText(
  bank: BankTransferDetails,
  options?: { narrationReference?: string },
): string {
  const narration = formatNarrationLine(bank, options?.narrationReference);
  return [
    "Option 2: Direct bank transfer",
    `Account name: ${bank.accountName}`,
    `Bank: ${bank.bankName}`,
    `Account number: ${bank.accountNumber}`,
    `Narration: ${narration}`,
  ].join("\n");
}

export function formatOnlinePayHtml(profileUrl?: string): string {
  const url =
    profileUrl ||
    `${process.env.NEXTAUTH_URL || ""}/profile?tab=payments`;
  return `
    <div>
      <strong style="display:block; margin-bottom: 8px;">Option 1: Pay online from your profile</strong>
      <p style="margin: 0; color: #856404;">
        Log in to your ParentalPal account and pay from
        <a href="${escapeHtml(url)}" style="color: #E8931A;">Profile → Payments</a>
        (card / Paystack checkout).
      </p>
    </div>
  `.trim();
}

export function formatOnlinePayText(profileUrl?: string): string {
  const url =
    profileUrl ||
    `${process.env.NEXTAUTH_URL || ""}/profile?tab=payments`;
  return `Option 1: Pay online from your profile — ${url}`;
}

/** Combined payment instructions (login-to-pay + bank transfer). */
export function formatPaymentOptionsHtml(
  bank: BankTransferDetails,
  options?: { narrationReference?: string; profileUrl?: string },
): string {
  return `
    <div class="payment-section" style="background-color:#fff3cd; border-left:4px solid #E8931A; padding:15px; margin:20px 0; border-radius:4px;">
      <strong style="color:#856404;">Payment options</strong>
      <div style="margin-top:12px; color:#856404;">
        ${formatOnlinePayHtml(options?.profileUrl)}
        <hr style="border:none; border-top:1px solid #f0e0a0; margin:14px 0;" />
        ${formatBankTransferHtml(bank, {
          narrationReference: options?.narrationReference,
        })}
      </div>
    </div>
  `.trim();
}

export function formatPaymentOptionsText(
  bank: BankTransferDetails,
  options?: { narrationReference?: string; profileUrl?: string },
): string {
  return [
    "Payment options:",
    formatOnlinePayText(options?.profileUrl),
    "",
    formatBankTransferText(bank, {
      narrationReference: options?.narrationReference,
    }),
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
