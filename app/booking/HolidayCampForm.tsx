import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import ChildInfoForm from "./ChildInfoForm";
import PhoneInput from "@/components/PhoneInput";
import {
  Plus,
  Trash,
  MapPin,
  Bed,
  Calendar,
  User,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import {
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import {
  extractChildIdsFromFormEntries,
  parseJsonField,
} from "@/lib/rebook-form-utils";
import {
  type CampLocation,
  type CampSeasonId,
  getCampSeason,
  canChildBoard,
  SUMMER_CAMP_RATES,
  EASTER_CAMP_RATES,
} from "@/lib/camp-seasons";
import {
  calculateCampPricing,
  getEasterWeeklyRate,
  isEasterEarlyBirdActive,
} from "@/lib/camp-pricing";
import {
  applyParentContactPrefill,
  createPrefilledChildrenFromProfile,
  type ChildInfoDefaults,
} from "@/lib/booking-profile-prefill";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";

export interface HolidayCampFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ChildCampData {
  id: string;
}

interface HolidayCampFormProps {
  campSeasonId: CampSeasonId;
  onTotalChange?: (total: number) => void;
  initialTemplate?: RebookFormEntries | null;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef, HolidayCampFormProps>(
  ({ campSeasonId, onTotalChange, initialTemplate }, ref) => {
    const season = getCampSeason(campSeasonId);
    const isSummer = season.isSummer;

    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentAddress, setParentAddress] = useState("");
    const [location, setLocation] = useState<CampLocation>("gbagada");
    const [childrenData, setChildrenData] = useState<ChildCampData[]>([
      { id: uuidv4() },
    ]);
    const [childAges, setChildAges] = useState<Record<string, number>>({});
    const [boardingByChild, setBoardingByChild] = useState<
      Record<string, boolean>
    >({});
    const [selectedWeeksByChild, setSelectedWeeksByChild] = useState<
      Record<string, number[]>
    >({});
    const [childDefaults, setChildDefaults] = useState<
      Record<string, ChildInfoDefaults>
    >({});

    const templateAppliedRef = useRef(false);
    const easterWeeklyRate = getEasterWeeklyRate();

    useEffect(() => {
      if (!initialTemplate || templateAppliedRef.current) return;
      templateAppliedRef.current = true;

      const childIds = extractChildIdsFromFormEntries(initialTemplate);
      if (childIds.length > 0) {
        setChildrenData(childIds.map((id) => ({ id })));
        const weeksByChild: Record<string, number[]> = {};
        const ages: Record<string, number> = {};
        const boarding: Record<string, boolean> = {};

        childIds.forEach((id) => {
          const weeks = parseJsonField<Array<{ weekNumber: number }>>(
            initialTemplate[`campWeeks_${id}`],
            [],
          );
          weeksByChild[id] = weeks.map((w) => w.weekNumber);
          const age = parseInt(initialTemplate[`childAge_${id}`] || "0", 10);
          if (age) ages[id] = age;
          boarding[id] = initialTemplate[`boarding_${id}`] === "true";
        });

        setSelectedWeeksByChild(weeksByChild);
        setChildAges(ages);
        setBoardingByChild(boarding);
      }

      if (initialTemplate.campLocation === "lekki" ||
        initialTemplate.campLocation === "gbagada") {
        setLocation(initialTemplate.campLocation);
      }
      if (initialTemplate.parentName) setParentName(initialTemplate.parentName);
      if (initialTemplate.parentEmail) setParentEmail(initialTemplate.parentEmail);
      if (initialTemplate.parentPhone) setParentPhone(initialTemplate.parentPhone);
      if (initialTemplate.parentAddress || initialTemplate.address) {
        setParentAddress(
          initialTemplate.parentAddress || initialTemplate.address || "",
        );
      }
    }, [initialTemplate]);

    const applyProfilePrefill = useCallback((profile: {
      parentName: string;
      parentEmail: string;
      parentPhone: string;
      parentAddress: string;
      children: Array<{ name: string; age: number; gender?: string }>;
    }) => {
      applyParentContactPrefill(profile, {
        setParentName,
        setParentEmail,
        setParentPhone,
        setParentAddress,
      });

      if (profile.children.length > 0) {
        const { ids, defaults, ages } = createPrefilledChildrenFromProfile(
          profile.children,
        );
        setChildrenData(ids.map((id) => ({ id })));
        setChildAges(ages);
        setChildDefaults(defaults);
      }
    }, []);

    useBookingProfilePrefill({
      initialTemplate,
      templateAppliedRef,
      onApply: applyProfilePrefill,
    });

    useEffect(() => {
      setSelectedWeeksByChild((prev) => {
        const next: Record<string, number[]> = {};
        childrenData.forEach((child) => {
          next[child.id] =
            prev[child.id] || season.weeks.map((week) => week.weekNumber);
        });
        return next;
      });
    }, [childrenData, season.weeks]);

    useEffect(() => {
      if (location === "lekki") {
        setBoardingByChild({});
      }
    }, [location]);

    const pricingInputs = useMemo(
      () =>
        childrenData.map((child) => ({
          childId: child.id,
          age: childAges[child.id] ?? childDefaults[child.id]?.age ?? 0,
          weekCount: selectedWeeksByChild[child.id]?.length || 0,
          boarding: boardingByChild[child.id] ?? false,
        })),
      [childrenData, childAges, childDefaults, selectedWeeksByChild, boardingByChild],
    );

    const pricing = useMemo(
      () =>
        calculateCampPricing(
          campSeasonId,
          isSummer ? location : null,
          pricingInputs,
        ),
      [campSeasonId, isSummer, location, pricingInputs],
    );

    useEffect(() => {
      onTotalChange?.(pricing.total);
    }, [onTotalChange, pricing.total]);

    const toggleWeekSelection = (childId: string, weekNumber: number) => {
      setSelectedWeeksByChild((prev) => {
        const currentSelection = prev[childId] || [];
        const isSelected = currentSelection.includes(weekNumber);
        const nextSelection = isSelected
          ? currentSelection.filter((week) => week !== weekNumber)
          : [...currentSelection, weekNumber].sort((a, b) => a - b);
        return { ...prev, [childId]: nextSelection };
      });
    };

    const handleAgeChange = useCallback((childId: string, age: number) => {
      setChildAges((prev) =>
        prev[childId] === age ? prev : { ...prev, [childId]: age },
      );
      if (!canChildBoard(age)) {
        setBoardingByChild((prev) => {
          if (!(childId in prev)) return prev;
          const next = { ...prev };
          delete next[childId];
          return next;
        });
      }
    }, []);

    const addChild = () => {
      setChildrenData((prev) => [...prev, { id: uuidv4() }]);
    };

    const removeChild = (id: string) => {
      if (childrenData.length <= 1) return;
      setChildrenData((prev) => prev.filter((child) => child.id !== id));
      setSelectedWeeksByChild((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setChildAges((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setBoardingByChild((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const resetForm = () => {
      const firstChildId = uuidv4();
      setChildrenData([{ id: firstChildId }]);
      setSelectedWeeksByChild({
        [firstChildId]: season.weeks.map((week) => week.weekNumber),
      });
      setChildAges({});
      setBoardingByChild({});
      setLocation("gbagada");
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      if (isSummer && !location) {
        return { isValid: false, errors: ["Please select a camp location."] };
      }

      for (const [index, child] of childrenData.entries()) {
        const age = childAges[child.id];
        if (age === undefined || Number.isNaN(age)) {
          return {
            isValid: false,
            errors: [`Enter age for Child #${index + 1}.`],
          };
        }
        if (age < 0 || age > 14) {
          return {
            isValid: false,
            errors: [`Child #${index + 1} must be between 0 and 14 years.`],
          };
        }
        if (
          !selectedWeeksByChild[child.id] ||
          selectedWeeksByChild[child.id].length === 0
        ) {
          return {
            isValid: false,
            errors: [`Select at least one camp week for Child #${index + 1}.`],
          };
        }
      }

      return { isValid: true, errors: [] };
    };

    useImperativeHandle(ref, () => ({
      resetForm,
      validate,
    }));

    const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`;

    return (
      <div className="space-y-6">
        <input type="hidden" name="campSeasonId" value={campSeasonId} />
        <input type="hidden" name="campStartDate" value={season.startDate} />
        <input type="hidden" name="campEndDate" value={season.endDate} />
        {isSummer && (
          <input type="hidden" name="campLocation" value={location} />
        )}
        <input type="hidden" name="promoCode" value={pricing.discount > 0 ? "MULTI-WEEK-10" : ""} />
        <input type="hidden" name="promoDiscount" value={pricing.discount} />
        <input type="hidden" name="totalWeeks" value={pricing.totalWeeks} />
        <input
          type="hidden"
          name="weeklyRate"
          value={isSummer ? 0 : easterWeeklyRate}
        />
        <input
          type="hidden"
          name="campFee"
          value={isSummer ? 0 : easterWeeklyRate}
        />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-6 text-gray-900">
            <User className="w-6 h-6 text-brand-primary" weight="regular" />
            Parent / Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-gray-900 bg-white transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900 block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="email"
                name="parentEmail"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-gray-900 bg-white transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <PhoneInput
              name="parentPhone"
              label="Phone Number"
              required
              placeholder="Enter phone number"
              value={parentPhone}
              onValueChange={setParentPhone}
            />

            <div>
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900 block mb-1">
                  Address <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="address"
                value={parentAddress}
                onChange={(e) => setParentAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-gray-900 bg-white transition-colors"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-5 flex items-start gap-4">
          <Calendar className="w-8 h-8 text-brand-primary shrink-0" weight="regular" />
          <div>
            <p className="text-base font-bold text-gray-900">{season.name}</p>
            <p className="text-sm text-gray-700 mt-1">
              Camp runs {season.dateLabel}. Select weeks for each child below.
              {season.showcaseDates
                ? ` Showcase & trade fair: ${season.showcaseDates}.`
                : ""}
            </p>
            {!isSummer && isEasterEarlyBirdActive() && (
              <p className="text-sm text-brand-secondary font-medium mt-2">
                Early bird pricing {formatNaira(EASTER_CAMP_RATES.earlyBirdWeekly)}
                /week until March 31, 2026.
              </p>
            )}
          </div>
        </div>

        {isSummer && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" weight="regular" />
              Camp Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  {
                    id: "gbagada" as CampLocation,
                    title: "Gbagada (Mainland)",
                    description:
                      "All ages 0–14. Optional weekday boarding for ages 6–14.",
                    from: formatNaira(SUMMER_CAMP_RATES.gbagadaYoungWeekly),
                  },
                  {
                    id: "lekki" as CampLocation,
                    title: "Lekki",
                    description: "All ages 5–14. Day camp only — no boarding.",
                    from: formatNaira(SUMMER_CAMP_RATES.lekkiWeekly),
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLocation(option.id)}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    location === option.id
                      ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{option.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  <p className="text-sm font-medium text-brand-primary mt-3">
                    From {option.from}/week
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Children Registered for Camp
          </h2>
          <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
            {childrenData.length}{" "}
            {childrenData.length === 1 ? "Child" : "Children"}
          </div>
        </div>

        {childrenData.map((child, index) => {
          const selectedWeekNumbers = selectedWeeksByChild[child.id] || [];
          const selectedWeeks = season.weeks.filter((week) =>
            selectedWeekNumbers.includes(week.weekNumber),
          );
          const line = pricing.lines.find((l) => l.childId === child.id);
          const childAge =
            childAges[child.id] ?? childDefaults[child.id]?.age ?? 0;
          const boardingEligible =
            isSummer && location === "gbagada" && canChildBoard(childAge);
          const boardingSelected = boardingByChild[child.id] ?? false;

          return (
            <div
              key={child.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" weight="regular" />
                  Child #{index + 1}
                </h3>
                {childrenData.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <Trash className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>

              <ChildInfoForm
                key={`${child.id}-${childDefaults[child.id]?.name ?? "new"}`}
                childIndex={index}
                childId={child.id}
                showRemoveButton={false}
                minAge={0}
                onAgeChange={handleAgeChange}
                defaults={childDefaults[child.id]}
              />

              {isSummer && location === "gbagada" && childAge > 0 && !boardingEligible && (
                <p className="text-sm text-gray-600 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  Weekday boarding is available at Gbagada for children aged 6 to
                  14 only. This child is in the day-camp age group.
                </p>
              )}

              {boardingEligible && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Boarding option (Gbagada, ages 6–14)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setBoardingByChild((prev) => ({
                          ...prev,
                          [child.id]: false,
                        }))
                      }
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        !boardingSelected
                          ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Day camp only</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Drop-off and pick-up each day
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBoardingByChild((prev) => ({
                          ...prev,
                          [child.id]: true,
                        }))
                      }
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        boardingSelected
                          ? "border-brand-accent bg-brand-accent/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Bed className="w-4 h-4 text-brand-accent" weight="fill" />
                        Add weekday boarding
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        +{formatNaira(SUMMER_CAMP_RATES.boardingWeekly)}/week on
                        top of camp fee
                      </p>
                    </button>
                  </div>
                  <input
                    type="hidden"
                    name={`boarding_${child.id}`}
                    value={boardingSelected ? "true" : "false"}
                  />
                </div>
              )}

              {!boardingEligible && isSummer && location === "gbagada" && (
                <input
                  type="hidden"
                  name={`boarding_${child.id}`}
                  value="false"
                />
              )}

              {!isSummer && (
                <input
                  type="hidden"
                  name={`boarding_${child.id}`}
                  value="false"
                />
              )}

              {isSummer && location === "lekki" && (
                <input
                  type="hidden"
                  name={`boarding_${child.id}`}
                  value="false"
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Select Camp Weeks
                    </p>
                    {line && (
                      <p className="text-sm text-gray-600">
                        {formatNaira(line.campFeePerWeek)}/week camp fee
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {selectedWeeks.length}{" "}
                    {selectedWeeks.length === 1 ? "week" : "weeks"} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {season.weeks.map((week) => {
                    const isSelected = selectedWeekNumbers.includes(
                      week.weekNumber,
                    );
                    const weekRate = line?.campFeePerWeek ?? 0;

                    return (
                      <label
                        key={week.weekNumber}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleWeekSelection(child.id, week.weekNumber)
                          }
                          className="sr-only"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-gray-900">
                              {week.label}
                            </span>
                            {weekRate > 0 && (
                              <span className="text-sm font-medium text-gray-700">
                                {formatNaira(weekRate)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{week.dateLabel}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <input
                type="hidden"
                name={`campWeeks_${child.id}`}
                value={JSON.stringify(selectedWeeks)}
              />

              {line && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Subtotal for Child #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Camp {formatNaira(line.campSubtotal)}
                        {line.boardingSubtotal > 0
                          ? ` + Boarding ${formatNaira(line.boardingSubtotal)}`
                          : ""}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNaira(line.lineSubtotal)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addChild}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-200 text-gray-700 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all duration-200 font-medium"
        >
          <Plus className="w-6 h-6" />
          Add Another Child
        </button>

        <input type="hidden" name="childrenCount" value={childrenData.length} />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-6">
            <CurrencyCircleDollar
              className="w-6 h-6 text-brand-primary"
              weight="regular"
            />
            Payment Summary
          </h3>

          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex justify-between">
              <span>Camp fees</span>
              <span>{formatNaira(pricing.campFees)}</span>
            </div>
            {pricing.boardingFees > 0 && (
              <div className="flex justify-between">
                <span>Boarding add-on</span>
                <span>{formatNaira(pricing.boardingFees)}</span>
              </div>
            )}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-brand-secondary font-medium">
                <span>
                  {pricing.discountPercent}% multi-week discount (3+ weeks)
                </span>
                <span>-{formatNaira(pricing.discount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-brand-primary">
              {formatNaira(pricing.total)}
            </span>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-sm text-gray-700">
              {isSummer
                ? "Extended care until 5 PM and pick-up/drop-off are included at no extra charge. Meals provided for boarding campers only."
                : "Camp pricing is based on weeks selected per child. Early bird rate applies until March 31, 2026."}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
