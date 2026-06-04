import type { RebookFormEntries } from "@/lib/booking-rebook";

export function extractChildIdsFromFormEntries(
  entries: RebookFormEntries,
): string[] {
  const ids = new Set<string>();
  Object.keys(entries).forEach((key) => {
    const match = key.match(/^child\w+_([a-f0-9-]+)$/);
    if (match) ids.add(match[1]);
  });
  return Array.from(ids);
}

export function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
