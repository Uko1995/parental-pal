import { PlatformSettingsRepository } from "@/lib/PlatformSettingsRepository";
import {
  DEFAULT_BANK_TRANSFER,
  type BankTransferDetails,
} from "@/models/PlatformSettings";

export type { BankTransferDetails };

/** Admin-editable bank details; falls back to defaults if the DB is unreachable. */
export async function getBankTransferDetails(): Promise<BankTransferDetails> {
  try {
    const settings = await PlatformSettingsRepository.get();
    return settings.bankTransfer;
  } catch {
    return { ...DEFAULT_BANK_TRANSFER };
  }
}
