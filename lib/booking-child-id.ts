/** Stable child row id for SSR/hydration-safe form field names. */
export function stableChildId(index: number): string {
  return `child-${index}`;
}

export const INITIAL_CHILD_ID = stableChildId(0);
