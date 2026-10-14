import type { ObjectId } from "mongodb";

export interface BankTransferDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  /** Admin-editable hint shown with a concrete narration reference. */
  narrationHint: string;
}

export interface PlatformSettingsInterface {
  _id?: ObjectId;
  /** Singleton key — always `"default"`. */
  key: "default";
  bankTransfer: BankTransferDetails;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_BANK_TRANSFER: BankTransferDetails = {
  accountName: "ParentalPal Ltd",
  accountNumber: "0125232203",
  bankName: "Wema Bank",
  narrationHint:
    "Use the booking ID or service name as the transfer narration",
};

export const PLATFORM_SETTINGS_KEY = "default" as const;
