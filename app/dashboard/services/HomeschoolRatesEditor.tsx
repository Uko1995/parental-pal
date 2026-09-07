"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  CRECHE_CADENCE_LABELS,
  type CrecheCadence,
  type FeeCadence,
  type HomeschoolRates,
} from "@/lib/homeschool-program";

interface HomeschoolRatesEditorProps {
  value: HomeschoolRates;
  onChange: (next: HomeschoolRates) => void;
}

const feeCadences: Array<{ value: FeeCadence; label: string }> = [
  { value: "perTerm", label: "Per term" },
  { value: "oncePerYear", label: "One off per year" },
  { value: "onceNewIntake", label: "One off (new intakes)" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function HomeschoolRatesEditor({
  value,
  onChange,
}: HomeschoolRatesEditorProps) {
  const update = (patch: Partial<HomeschoolRates>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">
          Kiddies Hub Programme Rates
        </h4>
        <p className="text-xs text-gray-600">
          These rates drive the booking form, invoices and the public
          programme page.
        </p>
      </div>

      {/* Term tuition */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
          Term tuition
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Preschool (₦/term)
              </span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full"
              value={value.tuitionByBand.preschool}
              onChange={(e) =>
                update({
                  tuitionByBand: {
                    ...value.tuitionByBand,
                    preschool: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Grade School (₦/term)
              </span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full"
              value={value.tuitionByBand.gradeSchool}
              onChange={(e) =>
                update({
                  tuitionByBand: {
                    ...value.tuitionByBand,
                    gradeSchool: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Creche */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
          Creche
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(CRECHE_CADENCE_LABELS) as CrecheCadence[]).map(
            (cadence) => (
              <div className="form-control" key={cadence}>
                <label className="label">
                  <span className="label-text font-medium">
                    {CRECHE_CADENCE_LABELS[cadence]} (₦)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={value.creche[cadence]}
                  onChange={(e) =>
                    update({
                      creche: {
                        ...value.creche,
                        [cadence]: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Afterschool */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
          Afterschool care
        </h5>
        <div className="form-control md:w-1/3">
          <label className="label">
            <span className="label-text font-medium">Per month (₦)</span>
          </label>
          <input
            type="number"
            min="0"
            className="input input-bordered w-full"
            value={value.afterschool.month}
            onChange={(e) =>
              update({
                afterschool: { month: parseInt(e.target.value, 10) || 0 },
              })
            }
          />
        </div>
      </div>

      {/* Additional fees */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Additional fees
          </h5>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() =>
              update({
                fees: [
                  ...value.fees,
                  {
                    code: `fee-${value.fees.length + 1}`,
                    label: "",
                    amount: 0,
                    cadence: "perTerm",
                    appliesTo: ["preschool", "gradeSchool"],
                  },
                ],
              })
            }
          >
            <PlusIcon className="w-4 h-4" />
            Add fee
          </button>
        </div>

        <div className="space-y-3">
          {value.fees.map((fee, index) => (
            <div
              key={`${fee.code}-${index}`}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white p-3 rounded border border-gray-200"
            >
              <div className="form-control md:col-span-5">
                <label className="label py-1">
                  <span className="label-text text-xs">Label</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={fee.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    update({
                      fees: value.fees.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              label,
                              code: item.code || slugify(label),
                            }
                          : item,
                      ),
                    });
                  }}
                />
              </div>

              <div className="form-control md:col-span-3">
                <label className="label py-1">
                  <span className="label-text text-xs">Amount (₦)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered input-sm w-full"
                  value={fee.amount}
                  onChange={(e) =>
                    update({
                      fees: value.fees.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              amount: parseInt(e.target.value, 10) || 0,
                            }
                          : item,
                      ),
                    })
                  }
                />
              </div>

              <div className="form-control md:col-span-3">
                <label className="label py-1">
                  <span className="label-text text-xs">Cadence</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={fee.cadence}
                  onChange={(e) =>
                    update({
                      fees: value.fees.map((item, i) =>
                        i === index
                          ? { ...item, cadence: e.target.value as FeeCadence }
                          : item,
                      ),
                    })
                  }
                >
                  {feeCadences.map((cadence) => (
                    <option key={cadence.value} value={cadence.value}>
                      {cadence.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-red-600"
                  onClick={() =>
                    update({
                      fees: value.fees.filter((_, i) => i !== index),
                    })
                  }
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ECAs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Extra-curricular activities
          </h5>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() =>
              update({
                ecas: [
                  ...value.ecas,
                  {
                    code: `eca-${value.ecas.length + 1}`,
                    label: "",
                    day: "",
                    amount: 0,
                  },
                ],
              })
            }
          >
            <PlusIcon className="w-4 h-4" />
            Add activity
          </button>
        </div>

        <div className="space-y-3">
          {value.ecas.map((eca, index) => (
            <div
              key={`${eca.code}-${index}`}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white p-3 rounded border border-gray-200"
            >
              <div className="form-control md:col-span-5">
                <label className="label py-1">
                  <span className="label-text text-xs">Activity</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={eca.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    update({
                      ecas: value.ecas.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              label,
                              code: item.code || slugify(label),
                            }
                          : item,
                      ),
                    });
                  }}
                />
              </div>

              <div className="form-control md:col-span-3">
                <label className="label py-1">
                  <span className="label-text text-xs">Day</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={eca.day}
                  placeholder="Monday"
                  onChange={(e) =>
                    update({
                      ecas: value.ecas.map((item, i) =>
                        i === index ? { ...item, day: e.target.value } : item,
                      ),
                    })
                  }
                />
              </div>

              <div className="form-control md:col-span-3">
                <label className="label py-1">
                  <span className="label-text text-xs">₦ per term</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered input-sm w-full"
                  value={eca.amount}
                  onChange={(e) =>
                    update({
                      ecas: value.ecas.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              amount: parseInt(e.target.value, 10) || 0,
                            }
                          : item,
                      ),
                    })
                  }
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-red-600"
                  onClick={() =>
                    update({
                      ecas: value.ecas.filter((_, i) => i !== index),
                    })
                  }
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
