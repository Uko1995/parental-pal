import type { RebookFormEntries } from "@/lib/booking-rebook";

export interface RebookPersistenceData {
  sourceBookingId: string;
  selectedService: string;
  formEntries: RebookFormEntries;
  targetMonthLabel: string;
  timestamp: number;
}

const STORAGE_KEY = "parental-pal-rebook-template";
const EXPIRATION_TIME = 60 * 60 * 1000;

function isClientSide(): boolean {
  return typeof window !== "undefined";
}

export function saveRebookTemplate(data: Omit<RebookPersistenceData, "timestamp">): void {
  if (!isClientSide()) return;

  try {
    const payload: RebookPersistenceData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save rebook template:", error);
  }
}

export function getRebookTemplate(): RebookPersistenceData | null {
  if (!isClientSide()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: RebookPersistenceData = JSON.parse(stored);
    if (Date.now() - data.timestamp > EXPIRATION_TIME) {
      clearRebookTemplate();
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to read rebook template:", error);
    clearRebookTemplate();
    return null;
  }
}

export function clearRebookTemplate(): void {
  if (!isClientSide()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear rebook template:", error);
  }
}
