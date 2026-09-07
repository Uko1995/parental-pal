import {
  DEFAULT_HOMESCHOOL_RATES,
  getTermLabel,
  getTrackLabel,
  isCrecheCadence,
  isHomeschoolTrack,
  isTermTrack,
  type CrecheCadence,
  type HomeschoolEca,
  type HomeschoolFee,
  type HomeschoolRates,
  type HomeschoolTrack,
} from "@/lib/homeschool-program";

export interface HomeschoolChildSelection {
  childId: string;
  childName?: string;
  track: HomeschoolTrack;
  /** Term tracks */
  selectedTerms?: string[];
  gradeLevel?: string;
  isNewIntake?: boolean;
  learningMaterials?: boolean;
  transport?: boolean;
  selectedEcas?: string[];
  /** Creche */
  crecheCadence?: CrecheCadence;
  crecheQuantity?: number;
  /** Afterschool */
  afterschoolMonths?: number;
}

export interface HomeschoolPriceLine {
  childId: string;
  childName?: string;
  track: HomeschoolTrack;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface HomeschoolPricingResult {
  lines: HomeschoolPriceLine[];
  totalAmount: number;
}

type PartialRates = Partial<{
  creche: Partial<Record<CrecheCadence, number>>;
  afterschool: Partial<{ month: number }>;
  tuitionByBand: Partial<Record<"preschool" | "gradeSchool", number>>;
  fees: HomeschoolFee[];
  ecas: HomeschoolEca[];
}>;

/** Merge admin-managed rates over the code defaults so partial docs stay valid. */
export function resolveHomeschoolRates(
  overrides?: PartialRates | null,
): HomeschoolRates {
  if (!overrides) return DEFAULT_HOMESCHOOL_RATES;

  return {
    creche: {
      ...DEFAULT_HOMESCHOOL_RATES.creche,
      ...(overrides.creche ?? {}),
    },
    afterschool: {
      ...DEFAULT_HOMESCHOOL_RATES.afterschool,
      ...(overrides.afterschool ?? {}),
    },
    tuitionByBand: {
      ...DEFAULT_HOMESCHOOL_RATES.tuitionByBand,
      ...(overrides.tuitionByBand ?? {}),
    },
    fees: overrides.fees?.length ? overrides.fees : DEFAULT_HOMESCHOOL_RATES.fees,
    ecas: overrides.ecas?.length ? overrides.ecas : DEFAULT_HOMESCHOOL_RATES.ecas,
  };
}

function clampQuantity(value: number | undefined, fallback = 1): number {
  if (!value || !Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

function findFee(rates: HomeschoolRates, code: string): HomeschoolFee | undefined {
  return rates.fees.find((fee) => fee.code === code);
}

function childLabel(child: HomeschoolChildSelection, index: number): string {
  return child.childName || `Child ${index + 1}`;
}

function pushFeeLine(
  lines: HomeschoolPriceLine[],
  rates: HomeschoolRates,
  child: HomeschoolChildSelection,
  name: string,
  code: string,
  termCount: number,
) {
  const fee = findFee(rates, code);
  if (!fee || fee.amount <= 0) return;

  const quantity = fee.cadence === "perTerm" ? Math.max(termCount, 1) : 1;

  lines.push({
    childId: child.childId,
    childName: name,
    track: child.track,
    code: fee.code,
    description: `${fee.label} — ${name}`,
    quantity,
    unitPrice: fee.amount,
    total: quantity * fee.amount,
  });
}

export function calculateHomeschoolPricing(
  children: HomeschoolChildSelection[],
  rates: HomeschoolRates = DEFAULT_HOMESCHOOL_RATES,
): HomeschoolPricingResult {
  const lines: HomeschoolPriceLine[] = [];

  children.forEach((child, index) => {
    const name = childLabel(child, index);
    const track = isHomeschoolTrack(child.track) ? child.track : "preschool";

    if (track === "creche") {
      const cadence = isCrecheCadence(child.crecheCadence)
        ? child.crecheCadence
        : "month";
      const quantity = clampQuantity(child.crecheQuantity);
      const unitPrice = rates.creche[cadence] ?? 0;
      const unitLabel = cadence === "day" ? "day" : cadence === "week" ? "week" : "month";

      lines.push({
        childId: child.childId,
        childName: name,
        track,
        code: "crecheCare",
        description: `Creche care — ${name} (${quantity} ${unitLabel}${quantity === 1 ? "" : "s"})`,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      });
      return;
    }

    if (track === "afterschool") {
      const months = clampQuantity(child.afterschoolMonths);
      const unitPrice = rates.afterschool.month ?? 0;

      lines.push({
        childId: child.childId,
        childName: name,
        track,
        code: "afterschoolCare",
        description: `Afterschool care — ${name} (${months} month${months === 1 ? "" : "s"})`,
        quantity: months,
        unitPrice,
        total: months * unitPrice,
      });
      return;
    }

    const band = isTermTrack(track) ? track : "preschool";
    const terms = (child.selectedTerms ?? []).filter(Boolean);
    const termCount = Math.max(terms.length, 1);
    const tuition = rates.tuitionByBand[band] ?? 0;
    const termLabels = terms.map(getTermLabel).join(", ");
    const gradeSuffix = child.gradeLevel ? `, ${child.gradeLevel}` : "";

    lines.push({
      childId: child.childId,
      childName: name,
      track,
      code: "tuition",
      description: `${getTrackLabel(band)} tuition — ${name}${termLabels ? ` (${termLabels}${gradeSuffix})` : gradeSuffix ? ` (${child.gradeLevel})` : ""}`,
      quantity: termCount,
      unitPrice: tuition,
      total: termCount * tuition,
    });

    if (child.isNewIntake) {
      pushFeeLine(lines, rates, child, name, "developmentLevy", termCount);
    }
    if (child.learningMaterials) {
      pushFeeLine(lines, rates, child, name, "learningMaterials", termCount);
    }
    if (child.transport) {
      pushFeeLine(lines, rates, child, name, "transportGbagada", termCount);
    }

    (child.selectedEcas ?? []).forEach((ecaCode) => {
      const eca = rates.ecas.find((item) => item.code === ecaCode);
      if (!eca || eca.amount <= 0) return;

      lines.push({
        childId: child.childId,
        childName: name,
        track,
        code: `eca:${eca.code}`,
        description: `ECA: ${eca.label} — ${name}`,
        quantity: termCount,
        unitPrice: eca.amount,
        total: termCount * eca.amount,
      });
    });
  });

  return {
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.total, 0),
  };
}
