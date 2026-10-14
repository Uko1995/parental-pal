import {
  DEFAULT_BANK_TRANSFER,
  type BankTransferDetails,
} from "@/models/PlatformSettings";

/**
 * Fallback bank details. The live values are admin-editable in
 * Dashboard → Settings and loaded via `getBankTransferDetails()`.
 */
export const BANK_TRANSFER_DETAILS: BankTransferDetails = DEFAULT_BANK_TRANSFER;

/** Public contact channels parents should use after a bank transfer. */
export const OFFICIAL_CONTACT_CHANNELS = {
  phoneDisplay: "+234 806 539 4795",
  phoneTel: "tel:+2348065394795",
  whatsappUrl: "https://wa.me/2348065394795",
  email: "info@parentalpal.com",
} as const;

export interface PaymentOptionsInput {
  bank?: BankTransferDetails;
  /** Booking ID / invoice number / service to quote as the transfer narration. */
  narrationReference?: string;
}

export function profilePaymentsUrl(): string {
  const base = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  return `${base}/profile?tab=payments`;
}

export function narrationLine(
  bank: BankTransferDetails,
  narrationReference?: string,
): string {
  const ref = narrationReference?.trim();
  return ref
    ? `Use ${ref} as the transfer narration.`
    : bank.narrationHint ||
        "Use the booking ID or service name as the transfer narration.";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function paymentOptionsHtml(input: PaymentOptionsInput = {}): string {
  const bank = input.bank ?? BANK_TRANSFER_DETAILS;
  const profileUrl = profilePaymentsUrl();
  const { phoneDisplay, phoneTel, whatsappUrl, email } =
    OFFICIAL_CONTACT_CHANNELS;

  return `
    <p style="margin: 0 0 6px 0;"><strong>Option 1: Pay online</strong></p>
    <p style="margin: 0 0 12px 0;">
      Log in to your ParentalPal account and use Paystack checkout from
      <a href="${profileUrl}" style="color: #E8931A;">Profile → Payments</a>.
    </p>
    <p style="margin: 0 0 6px 0;"><strong>Option 2: Direct bank transfer</strong></p>
    <ul style="margin: 0 0 12px 18px; padding: 0; line-height: 1.6;">
      <li><strong>Account number:</strong> ${escapeHtml(bank.accountNumber)}</li>
      <li><strong>Bank:</strong> ${escapeHtml(bank.bankName)}</li>
      <li><strong>Account name:</strong> ${escapeHtml(bank.accountName)}</li>
      <li><strong>Narration:</strong> ${escapeHtml(narrationLine(bank, input.narrationReference))}</li>
    </ul>
    <p style="margin: 0;">
      After you make the transfer, notify the admin on our official contact channels:
      phone <a href="${phoneTel}" style="color: #E8931A;">${phoneDisplay}</a>,
      <a href="${whatsappUrl}" style="color: #E8931A;">WhatsApp</a>,
      or email <a href="mailto:${email}" style="color: #E8931A;">${email}</a>.
      Include your booking or invoice number so we can match the payment.
    </p>
  `;
}

export function paymentOptionsText(input: PaymentOptionsInput = {}): string {
  const bank = input.bank ?? BANK_TRANSFER_DETAILS;
  const { phoneDisplay, whatsappUrl, email } = OFFICIAL_CONTACT_CHANNELS;

  return [
    `Option 1: Pay online — log in to your ParentalPal account and use Paystack checkout from Profile → Payments: ${profilePaymentsUrl()}`,
    `Option 2: Direct bank transfer — Account number ${bank.accountNumber}, ${bank.bankName}, ${bank.accountName}. ${narrationLine(bank, input.narrationReference)}`,
    `After you make the transfer, notify the admin on our official contact channels: phone ${phoneDisplay}, WhatsApp ${whatsappUrl}, or email ${email}. Include your booking or invoice number so we can match the payment.`,
  ].join("\n");
}
