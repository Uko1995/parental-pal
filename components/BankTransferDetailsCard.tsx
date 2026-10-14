"use client";

import { useEffect, useState } from "react";
import type { BankTransferDetails } from "@/models/PlatformSettings";

interface BankTransferDetailsCardProps {
  /** Booking ID / invoice number / service to quote as narration. */
  narrationReference?: string;
  className?: string;
}

export default function BankTransferDetailsCard({
  narrationReference,
  className = "",
}: BankTransferDetailsCardProps) {
  const [bank, setBank] = useState<BankTransferDetails | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/bank-transfer", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { bankTransfer?: BankTransferDetails }) => {
        if (data.bankTransfer) setBank(data.bankTransfer);
        else setFailed(true);
      })
      .catch((error) => {
        if ((error as Error)?.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  if (failed) return null;

  const narration = narrationReference?.trim()
    ? `Use ${narrationReference.trim()} as the transfer narration.`
    : bank?.narrationHint;

  return (
    <div className={`rounded-lg border border-base-300 bg-base-200/40 p-4 ${className}`}>
      <p className="font-semibold text-sm mb-2">Option 2: Direct bank transfer</p>
      {!bank ? (
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-xs" />
          Loading bank details…
        </div>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-base-content/70">Account name</dt>
          <dd className="font-semibold">{bank.accountName}</dd>
          <dt className="text-base-content/70">Bank</dt>
          <dd className="font-semibold">{bank.bankName}</dd>
          <dt className="text-base-content/70">Account number</dt>
          <dd className="font-semibold font-mono tracking-wide">
            {bank.accountNumber}
          </dd>
          {narration && (
            <>
              <dt className="text-base-content/70">Narration</dt>
              <dd>{narration}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
