import type { RebookFormEntries } from "@/lib/booking-rebook";
import type { ChildInfoDefaults } from "@/lib/booking-profile-prefill";

export function extractChildIdsFromFormEntries(
  entries: RebookFormEntries,
): string[] {
  const ids = new Set<string>();
  Object.keys(entries).forEach((key) => {
    const match = key.match(/^child\w+_([\w-]+)$/);
    if (match) ids.add(match[1]);
  });
  return Array.from(ids);
}

/** Map persisted form entries to ChildInfoForm default values. */
export function childDefaultsFromFormEntries(
  entries: RebookFormEntries,
  childIds: string[],
): Record<string, ChildInfoDefaults> {
  const defaults: Record<string, ChildInfoDefaults> = {};
  for (const id of childIds) {
    const ageRaw = entries[`childAge_${id}`];
    defaults[id] = {
      name: entries[`childName_${id}`] || undefined,
      age: ageRaw ? parseInt(ageRaw, 10) : undefined,
      gender: entries[`childGender_${id}`] || undefined,
      allergies: entries[`childAllergies_${id}`] || undefined,
      specialRequirements:
        entries[`childSpecialRequirements_${id}`] || undefined,
    };
  }
  return defaults;
}

export interface ScheduleLoadEntry {
  day: string;
  startTime: string;
  hours: number;
  dates?: Array<{ date: string; startTime: string }>;
}

export interface ScheduleLoaderRef {
  loadSchedule: (schedules: ScheduleLoadEntry[]) => void;
}

/** Retry schedule restore until WeekdaysSchedule refs are mounted. */
export function loadSchedulesWhenReady(
  childIds: string[],
  getSchedule: (childId: string) => ScheduleLoadEntry[],
  scheduleRefs: { current: Record<string, ScheduleLoaderRef | null> },
  maxAttempts = 20,
  onComplete?: (allLoaded: boolean) => void,
): () => void {
  let attempts = 0;
  let cancelled = false;

  const tryLoad = () => {
    if (cancelled) return;

    let pending = false;
    let loadedAny = false;
    for (const id of childIds) {
      const schedule = getSchedule(id);
      if (!schedule.length) continue;
      const ref = scheduleRefs.current[id];
      if (ref) {
        ref.loadSchedule(schedule);
        loadedAny = true;
      } else {
        pending = true;
      }
    }

    if (pending && attempts < maxAttempts) {
      attempts += 1;
      window.setTimeout(tryLoad, 100);
      return;
    }

    onComplete?.(!pending && (loadedAny || childIds.every((id) => !getSchedule(id).length)));
  };

  window.setTimeout(tryLoad, 50);
  return () => {
    cancelled = true;
  };
}

export function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
