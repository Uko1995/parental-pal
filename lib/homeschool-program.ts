/**
 * Kiddies Hub learning programme configuration.
 *
 * Curriculum copy, term calendar and default rates are versioned in code; the
 * live fee catalog is admin-editable on the `homeschooling` service document
 * and falls back to `DEFAULT_HOMESCHOOL_RATES` when unset.
 */

export const HOMESCHOOL_PROGRAM_NAME =
  "Kiddies Hub — Creche, Preschool, Grade School & Afterschool";

export const HOMESCHOOL_PROGRAM_SHORT_NAME = "Kiddies Hub Learning Programme";

export type HomeschoolTrack =
  | "creche"
  | "preschool"
  | "gradeSchool"
  | "afterschool";

export const HOMESCHOOL_TRACKS = [
  "creche",
  "preschool",
  "gradeSchool",
  "afterschool",
] as const;

export type TermTrack = Extract<HomeschoolTrack, "preschool" | "gradeSchool">;

export type CrecheCadence = "day" | "week" | "month";

export type HomeschoolTermId = "first" | "second" | "third";

export type FeeCadence = "onceNewIntake" | "oncePerYear" | "perTerm";

export interface HomeschoolFee {
  code: string;
  label: string;
  amount: number;
  cadence: FeeCadence;
  appliesTo: TermTrack[];
  note?: string;
}

export interface HomeschoolEca {
  code: string;
  label: string;
  day: string;
  amount: number;
}

export interface HomeschoolRates {
  creche: Record<CrecheCadence, number>;
  afterschool: { month: number };
  tuitionByBand: Record<TermTrack, number>;
  fees: HomeschoolFee[];
  ecas: HomeschoolEca[];
}

export interface HomeschoolTerm {
  id: HomeschoolTermId;
  label: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
  resumptionLabel?: string;
  midTermLabel?: string;
}

export interface TrackProfile {
  id: HomeschoolTrack;
  label: string;
  shortLabel: string;
  tagline: string;
  billingLabel: string;
  ageGroup: string;
  highlights: string[];
  supportsTermAddOns: boolean;
}

export const HOMESCHOOL_TERMS: Record<HomeschoolTermId, HomeschoolTerm> = {
  first: {
    id: "first",
    label: "First Term",
    dateLabel: "14 September – 11 December 2026",
    startDate: "2026-09-14",
    endDate: "2026-12-11",
    resumptionLabel: "Resumption: 14 September 2026",
    midTermLabel: "Mid-term break: 2 – 6 November 2026",
  },
  second: {
    id: "second",
    label: "Second Term",
    dateLabel: "January – April 2027",
    startDate: "2027-01-11",
    endDate: "2027-04-09",
  },
  third: {
    id: "third",
    label: "Third Term",
    dateLabel: "May – August 2027",
    startDate: "2027-05-03",
    endDate: "2027-07-30",
  },
};

export const HOMESCHOOL_TERM_ORDER: HomeschoolTermId[] = [
  "first",
  "second",
  "third",
];

export const ACADEMIC_YEAR_LABEL = "2026/2027";

export interface ImportantDate {
  date: string;
  label: string;
}

export const HOMESCHOOL_IMPORTANT_DATES: ImportantDate[] = [
  { date: "14 September 2026", label: "Resumption of 2026/2027 learning session" },
  { date: "1 October 2026", label: "Independence Day celebration (Dress like a Nigerian)" },
  { date: "5 October 2026", label: "World Teachers' Day" },
  { date: "30 October 2026", label: "Open Day" },
  { date: "2 – 6 November 2026", label: "Mid-term break" },
  { date: "11 December 2026", label: "Christmas Presentation and closing date" },
];

export const DAILY_RHYTHMS: Array<{ name: string; body: string }> = [
  { name: "Connect", body: "Arrival, relationships and circle time." },
  {
    name: "Discover",
    body: "Literacy, inquiry, Montessori, maths and science.",
  },
  {
    name: "Move",
    body: "Outdoor play, physical development, music and movement.",
  },
  {
    name: "Reflect",
    body: "Practical life, conversation, story and closing circle.",
  },
];

export const SCHOOL_DAY_LABEL = "8am – 2pm";

export const PYP_THEMES = [
  "Who We Are",
  "Where We Are in Place & Time",
  "How We Express Ourselves",
  "How the World Works",
  "How We Organise Ourselves",
  "Sharing the Planet",
];

export const PRESCHOOL_TERM_UNITS = [
  { name: "Unit 1: Who are we? Me and my feelings", duration: "3 weeks" },
  { name: "Unit 2: My Family and my Home", duration: "3 weeks" },
  { name: "Unit 3: Our Five Senses", duration: "3 weeks" },
];

export const TRACK_PROFILES: Record<HomeschoolTrack, TrackProfile> = {
  creche: {
    id: "creche",
    label: "Creche",
    shortLabel: "Creche",
    tagline: "Warm, flexible day care for our youngest children.",
    billingLabel: "Daily, weekly or monthly",
    ageGroup: "Infants and toddlers",
    highlights: [
      "Book by the day, week or month as your schedule changes",
      "Nurturing routines built around rest, play and feeding",
      "Trained caregivers in a safe, child-ready space",
    ],
    supportsTermAddOns: false,
  },
  preschool: {
    id: "preschool",
    label: "Preschool",
    shortLabel: "Preschool",
    tagline:
      "Play and inquiry-based early years learning inspired by PYP, EYFS and Montessori.",
    billingLabel: "Per term",
    ageGroup: "Ages 3 – 5",
    highlights: [
      "Termly units explored over three weeks each for real mastery",
      "Literacy, numeracy and early science woven into every unit",
      "Home-learning connections so families can extend learning naturally",
    ],
    supportsTermAddOns: true,
  },
  gradeSchool: {
    id: "gradeSchool",
    label: "Grade School",
    shortLabel: "Grade School",
    tagline:
      "PYP-inspired primary learning that develops the whole child — including neuro-divergent learners.",
    billingLabel: "Per term",
    ageGroup: "Ages 6 – 12",
    highlights: [
      "Inclusive classrooms with differentiated support for neuro-divergent children",
      "Six PYP themes connecting English, maths, science, humanities and the arts",
      "Focus on critical thinking, collaboration and confident decision-making",
    ],
    supportsTermAddOns: true,
  },
  afterschool: {
    id: "afterschool",
    label: "Afterschool Care",
    shortLabel: "Afterschool",
    tagline: "Supervised care and homework support after the school day.",
    billingLabel: "Per month",
    ageGroup: "School-age children",
    highlights: [
      "Structured homework and reading time",
      "Snack, play and rest before pick-up",
      "Simple monthly booking that fits the school calendar",
    ],
    supportsTermAddOns: false,
  },
};

export const NEURODIVERGENT_SUPPORT_NOTE =
  "Grade School is designed for neuro-divergent children as well as typical learners. Share any diagnosis, therapy plan or learning need during booking so we can plan the right support.";

export const DEFAULT_HOMESCHOOL_RATES: HomeschoolRates = {
  creche: {
    day: 5000,
    week: 25000,
    month: 60000,
  },
  afterschool: {
    month: 40000,
  },
  tuitionByBand: {
    preschool: 250000,
    gradeSchool: 300000,
  },
  fees: [
    {
      code: "developmentLevy",
      label: "Development levy",
      amount: 50000,
      cadence: "onceNewIntake",
      appliesTo: ["preschool", "gradeSchool"],
      note: "New intakes only",
    },
    {
      code: "learningMaterials",
      label: "Learning materials",
      amount: 80000,
      cadence: "oncePerYear",
      appliesTo: ["preschool", "gradeSchool"],
      note: "One off per year",
    },
    {
      code: "transportGbagada",
      label: "Transport (within Gbagada)",
      amount: 200000,
      cadence: "perTerm",
      appliesTo: ["preschool", "gradeSchool"],
    },
  ],
  ecas: [
    { code: "arts", label: "Arts and Crafts", day: "Monday", amount: 50000 },
    { code: "piano", label: "Piano", day: "Tuesday", amount: 150000 },
    { code: "chess", label: "Chess", day: "Wednesday", amount: 50000 },
    {
      code: "swimming",
      label: "Swimming – 10 sessions with a professional coach",
      day: "Friday",
      amount: 80000,
    },
  ],
};

export const CRECHE_CADENCE_LABELS: Record<CrecheCadence, string> = {
  day: "Per day",
  week: "Per week",
  month: "Per month",
};

export function isHomeschoolTrack(value: unknown): value is HomeschoolTrack {
  return (
    typeof value === "string" &&
    (HOMESCHOOL_TRACKS as readonly string[]).includes(value)
  );
}

export function isCrecheCadence(value: unknown): value is CrecheCadence {
  return value === "day" || value === "week" || value === "month";
}

export function isTermTrack(value: unknown): value is TermTrack {
  return value === "preschool" || value === "gradeSchool";
}

export function getTermLabel(termId: string): string {
  const term = HOMESCHOOL_TERMS[termId as HomeschoolTermId];
  return term ? term.label : termId;
}

export function getTrackLabel(track: string): string {
  return TRACK_PROFILES[track as HomeschoolTrack]?.label ?? "Programme";
}

/** Grade bands offered on the term-based tracks, used by the booking form. */
export const GRADE_LEVELS_BY_TRACK: Record<TermTrack, string[]> = {
  preschool: ["Pre-School (Ages 3-4)", "Kindergarten (Ages 5-6)"],
  gradeSchool: ["Primary 1-3 (Ages 6-9)", "Primary 4-6 (Ages 9-12)"],
};

/** Legacy bookings stored a grade level without a track; infer the band. */
export function inferTrackFromGradeLevel(
  gradeLevel: string | undefined | null,
): TermTrack {
  const value = (gradeLevel || "").toLowerCase();
  if (value.includes("primary")) return "gradeSchool";
  return "preschool";
}
