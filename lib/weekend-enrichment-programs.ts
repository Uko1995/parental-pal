/** Weekend Enrichment program options for enrollment form and pricing */
export const WEEKEND_ENRICHMENT_PROGRAMS = [
  { id: "budding-artist", name: "Budding Artist Course (Ages 5–15)", time: "10am – 1pm", pricePerChildPerMonth: 65000 },
  { id: "arts-crafts-toddlers", name: "Arts & Crafts for Toddlers (Ages 2–5)", time: "10am – 1pm", pricePerChildPerMonth: 55000 },
  { id: "intermediate-tech", name: "Intermediate Tech Class (Ages 7–15)", time: "1pm – 2pm", pricePerChildPerMonth: 60000 },
  { id: "chess-puzzles-scratch", name: "Chess, Puzzles & Scratch (Ages 4–6)", time: "1pm – 2pm", pricePerChildPerMonth: 40000 },
  { id: "dance-drama", name: "Dance & Drama (Ages 7–15)", time: "2pm – 4pm", pricePerChildPerMonth: 50000 },
  { id: "ballet-contemporary", name: "Ballet & Contemporary Dance (Ages 2–6)", time: "2pm – 4pm", pricePerChildPerMonth: 40000 },
] as const;

export type ProgramId = (typeof WEEKEND_ENRICHMENT_PROGRAMS)[number]["id"];

export function getProgramById(id: string) {
  return WEEKEND_ENRICHMENT_PROGRAMS.find((p) => p.id === id);
}

export function calculateTotal(programId: string, numberOfChildren: number): number {
  const program = getProgramById(programId);
  if (!program || numberOfChildren < 1) return 0;
  return program.pricePerChildPerMonth * numberOfChildren;
}
