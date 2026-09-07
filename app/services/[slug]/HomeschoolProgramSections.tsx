import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  ACADEMIC_YEAR_LABEL,
  CRECHE_CADENCE_LABELS,
  DAILY_RHYTHMS,
  HOMESCHOOL_IMPORTANT_DATES,
  HOMESCHOOL_TERMS,
  HOMESCHOOL_TRACKS,
  NEURODIVERGENT_SUPPORT_NOTE,
  PRESCHOOL_TERM_UNITS,
  PYP_THEMES,
  SCHOOL_DAY_LABEL,
  TRACK_PROFILES,
  type CrecheCadence,
  type HomeschoolRates,
} from "@/lib/homeschool-program";
import { formatCurrency } from "@/lib/service-utils";

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function HomeschoolProgramSections({
  rates,
}: {
  rates: HomeschoolRates;
}) {
  const crecheCadences = Object.keys(
    CRECHE_CADENCE_LABELS,
  ) as CrecheCadence[];

  return (
    <div className="space-y-6 mb-10">
      {/* Programme tracks */}
      <Card
        title="Our Programmes"
        icon={<AcademicCapIcon className="w-6 h-6 text-[#90AC19]" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOMESCHOOL_TRACKS.map((trackId) => {
            const track = TRACK_PROFILES[trackId];
            return (
              <div
                key={trackId}
                className="rounded-xl border border-gray-100 p-5 bg-gray-50/60"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{track.label}</h3>
                  <span className="text-xs text-gray-500">
                    {track.ageGroup}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{track.tagline}</p>
                <ul className="space-y-1.5">
                  {track.highlights.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-gray-600 flex gap-2 items-start"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#90AC19] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-[#FFEACF]/40 border border-[#E8931A]/30 p-4 flex gap-2">
          <SparklesIcon className="w-5 h-5 text-[#E8931A] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">{NEURODIVERGENT_SUPPORT_NOTE}</p>
        </div>
      </Card>

      {/* Curriculum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Preschool Curriculum">
          <p className="text-sm text-gray-600 mb-4">
            Inspired by the IB Primary Years Programme, EYFS and Montessori.
            Literacy, numeracy and early science are woven into every unit
            through play, stories, experiments, movement, art and exploration.
          </p>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            First term units
          </h3>
          <ul className="space-y-2">
            {PRESCHOOL_TERM_UNITS.map((unit) => (
              <li
                key={unit.name}
                className="flex items-center justify-between gap-3 text-sm rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-gray-700">{unit.name}</span>
                <span className="text-xs text-gray-500 shrink-0">
                  {unit.duration}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Grade School Curriculum">
          <p className="text-sm text-gray-600 mb-4">
            Learning is organised around six PYP-inspired themes. Rather than
            teaching subjects in isolation, English, reading, writing,
            mathematics, science, history, geography, computing, creative arts,
            physical development and life skills come together in each unit.
          </p>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Core themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {PYP_THEMES.map((theme) => (
              <span
                key={theme}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#90AC19]/10 text-[#5f7211] font-medium"
              >
                {theme}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Daily schedule */}
      <Card
        title={`A Typical Day (${SCHOOL_DAY_LABEL})`}
        icon={<ClockIcon className="w-6 h-6 text-[#90AC19]" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DAILY_RHYTHMS.map((rhythm, index) => (
            <div
              key={rhythm.name}
              className="rounded-xl border border-gray-100 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#90AC19]/10 text-[#90AC19] text-xs font-bold">
                  {index + 1}
                </span>
                <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  {rhythm.name}
                </span>
              </div>
              <p className="text-sm text-gray-600">{rhythm.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Fees */}
      <Card title="Fees">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Term tuition
            </h3>
            <div className="space-y-2">
              <FeeRow
                label="Preschool"
                value={`${formatCurrency(rates.tuitionByBand.preschool)} per term`}
              />
              <FeeRow
                label="Grade School"
                value={`${formatCurrency(rates.tuitionByBand.gradeSchool)} per term`}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Creche
            </h3>
            <div className="space-y-2">
              {crecheCadences.map((cadence) => (
                <FeeRow
                  key={cadence}
                  label={CRECHE_CADENCE_LABELS[cadence]}
                  value={formatCurrency(rates.creche[cadence])}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Afterschool care
            </h3>
            <FeeRow
              label="Per month"
              value={formatCurrency(rates.afterschool.month)}
            />
          </div>

          {rates.fees.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Additional fees (preschool & grade school)
              </h3>
              <div className="space-y-2">
                {rates.fees.map((fee) => (
                  <FeeRow
                    key={fee.code}
                    label={fee.label}
                    note={
                      fee.note ??
                      (fee.cadence === "perTerm" ? "Per term" : undefined)
                    }
                    value={formatCurrency(fee.amount)}
                  />
                ))}
              </div>
            </div>
          )}

          {rates.ecas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Extra-curricular activities
              </h3>
              <div className="space-y-2">
                {rates.ecas.map((eca) => (
                  <FeeRow
                    key={eca.code}
                    label={eca.label}
                    note={eca.day}
                    value={`${formatCurrency(eca.amount)} per term`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Calendar */}
      <Card
        title={`${ACADEMIC_YEAR_LABEL} Calendar`}
        icon={<CalendarDaysIcon className="w-6 h-6 text-[#90AC19]" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Terms</h3>
            <ul className="space-y-2">
              {Object.values(HOMESCHOOL_TERMS).map((term) => (
                <li
                  key={term.id}
                  className="flex items-center justify-between gap-3 text-sm rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="font-medium text-gray-800">
                    {term.label}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {term.dateLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Important dates
            </h3>
            <ul className="space-y-2">
              {HOMESCHOOL_IMPORTANT_DATES.map((item) => (
                <li key={item.label} className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">
                    {item.date}
                  </span>{" "}
                  — {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FeeRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#FFEACF]/30 border border-[#E8931A]/20 px-3 py-2.5">
      <div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        {note && <p className="text-xs text-gray-500">{note}</p>}
      </div>
      <span className="text-[#90AC19] font-bold text-sm shrink-0">{value}</span>
    </div>
  );
}
