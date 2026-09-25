/** Direct bank transfer details shown on unpaid invoices and payment emails. */
export const BANK_TRANSFER_DETAILS = {
  accountNumber: "0125232203",
  bankName: "Wema Bank",
  accountName: "ParentalPal Ltd",
} as const;

/** Public contact channels parents should use after a bank transfer. */
export const OFFICIAL_CONTACT_CHANNELS = {
  phoneDisplay: "+234 806 539 4795",
  phoneTel: "tel:+2348065394795",
  whatsappUrl: "https://wa.me/2348065394795",
  email: "info@parentalpal.com",
} as const;

export function profilePaymentsUrl(): string {
  const base = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  return `${base}/profile?tab=payments`;
}

export function paymentOptionsHtml(): string {
  const profileUrl = profilePaymentsUrl();
  const { accountNumber, bankName, accountName } = BANK_TRANSFER_DETAILS;
  const { phoneDisplay, phoneTel, whatsappUrl, email } =
    OFFICIAL_CONTACT_CHANNELS;

  return `
    <p style="margin: 0 0 12px 0;">
      Pay online: log in to your ParentalPal account and use Paystack checkout from
      <a href="${profileUrl}" style="color: #E8931A;">Profile → Payments</a>.
    </p>
    <p style="margin: 0 0 8px 0;">Or pay by direct bank transfer:</p>
    <ul style="margin: 0 0 12px 18px; padding: 0; line-height: 1.6;">
      <li><strong>Account number:</strong> ${accountNumber}</li>
      <li><strong>Bank:</strong> ${bankName}</li>
      <li><strong>Account name:</strong> ${accountName}</li>
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

export function paymentOptionsText(): string {
  const { accountNumber, bankName, accountName } = BANK_TRANSFER_DETAILS;
  const { phoneDisplay, whatsappUrl, email } = OFFICIAL_CONTACT_CHANNELS;

  return [
    `Pay online: log in to your ParentalPal account and use Paystack checkout from Profile → Payments: ${profilePaymentsUrl()}`,
    `Or pay by direct bank transfer: Account number ${accountNumber}, ${bankName}, ${accountName}.`,
    `After you make the transfer, notify the admin on our official contact channels: phone ${phoneDisplay}, WhatsApp ${whatsappUrl}, or email ${email}. Include your booking or invoice number so we can match the payment.`,
  ].join("\n");
}
