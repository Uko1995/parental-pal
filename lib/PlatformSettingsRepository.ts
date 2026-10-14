import { getCollection } from "@/lib/mongodb";
import {
  DEFAULT_BANK_TRANSFER,
  PLATFORM_SETTINGS_KEY,
  type BankTransferDetails,
  type PlatformSettingsInterface,
} from "@/models/PlatformSettings";

export class PlatformSettingsRepository {
  private static collectionName = "platform_settings";

  static async get(): Promise<PlatformSettingsInterface> {
    const collection = await getCollection<PlatformSettingsInterface>(
      this.collectionName,
    );
    const existing = await collection.findOne({ key: PLATFORM_SETTINGS_KEY });
    if (existing) {
      return {
        ...existing,
        bankTransfer: {
          ...DEFAULT_BANK_TRANSFER,
          ...existing.bankTransfer,
        },
      };
    }

    const now = new Date();
    const doc: PlatformSettingsInterface = {
      key: PLATFORM_SETTINGS_KEY,
      bankTransfer: { ...DEFAULT_BANK_TRANSFER },
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  static async updateBankTransfer(
    bankTransfer: BankTransferDetails,
  ): Promise<PlatformSettingsInterface> {
    const collection = await getCollection<PlatformSettingsInterface>(
      this.collectionName,
    );
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { key: PLATFORM_SETTINGS_KEY },
      {
        $set: {
          bankTransfer,
          updatedAt: now,
        },
        $setOnInsert: {
          key: PLATFORM_SETTINGS_KEY,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!result) {
      // Extremely unlikely after upsert; re-fetch / seed.
      return this.get();
    }

    return {
      ...result,
      bankTransfer: {
        ...DEFAULT_BANK_TRANSFER,
        ...result.bankTransfer,
      },
    };
  }
}
