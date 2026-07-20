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
import { INITIAL_CHILD_ID } from "@/lib/booking-child-id";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import {
  extractChildIdsFromFormEntries,
  parseJsonField,
  childDefaultsFromFormEntries,
} from "@/lib/rebook-form-utils";
import {
  type CampLocation,
  type CampSeasonId,
  getCampSeason,
  canChildBoard,
  SUMMER_CAMP_RATES,
  EASTER_CAMP_RATES,
  ENABLED_SUMMER_CAMP_LOCATIONS,
  isEnabledSummerCampLocation,
} from "@/lib/camp-seasons";
import {
  calculateCampPricing,
  getEasterWeeklyRate,
  isEasterEarlyBirdActive,
} from "@/lib/camp-pricing";
import {
  applyParentContactPrefill,
  buildChildrenRowsFromProfile,
  type ChildInfoDefaults,
} from "@/lib/booking-profile-prefill";
import AddAnotherChildButton from "./AddAnotherChildButton";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";

export interface HolidayCampFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
  confirmBoardingFromDb: () => Promise<{ ok: boolean; error?: string }>;
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
    const allSeasonWeekNumbers = season.weeks.map((week) => week.weekNumber);

    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentAddress, setParentAddress] = useState("");
    const [location, setLocation] = useState<CampLocation>("gbagada");
    const [initialChild] = useState(() => ({ id: INITIAL_CHILD_ID }));
    const [childrenData, setChildrenData] = useState<ChildCampData[]>([
      initialChild,
    ]);
    const [childAges, setChildAges] = useState<Record<string, number>>({});
    const [boardingByChild, setBoardingByChild] = useState<
      Record<string, boolean>
    >({});
    const [selectedWeeksByChild, setSelectedWeeksByChild] = useState<
      Record<string, number[]>
    >(() => ({
      [initialChild.id]: allSeasonWeekNumbers,
    }));
    const [childDefaults, setChildDefaults] = useState<
      Record<string, ChildInfoDefaults>
    >({});
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromoCode, setAppliedPromoCode] = useState("");
    const [promoStatus, setPromoStatus] = useState<
      "idle" | "checking" | "applied" | "error"
    >("idle");
    const [promoMessage, setPromoMessage] = useState("");
    const [boardingAvailability, setBoardingAvailability] = useState<{
      capacity: number;
      used: number;
      remaining: number;
      isFull: boolean;
    } | null>(null);
    const [boardingAvailabilityLoading, setBoardingAvailabilityLoading] =
      useState(false);
    const [boardingCapacityMessage, setBoardingCapacityMessage] = useState("");

    const templateAppliedRef = useRef(false);
    const easterWeeklyRate = getEasterWeeklyRate();

    useEffect(() => {
      if (!initialTemplate || templateAppliedRef.current) return;
      templateAppliedRef.current = true;

      const childIds = extractChildIdsFromFormEntries(initialTemplate);
      if (childIds.length > 0) {
        setChildDefaults(childDefaultsFromFormEntries(initialTemplate, childIds));
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

      if (isEnabledSummerCampLocation(initialTemplate.campLocation)) {
        setLocation(initialTemplate.campLocation);
      } else if (initialTemplate.campLocation) {
        // Disabled campuses (e.g. lekki) coerce to Gbagada for rebook
        setLocation("gbagada");
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
        const built = buildChildrenRowsFromProfile(
          profile.children,
          (id) => ({ id }),
        );
        if (built) {
          setChildDefaults(built.defaults);
          setChildAges(built.ages);
          setChildrenData(built.rows);
          setSelectedWeeksByChild(
            Object.fromEntries(
              built.rows.map((child) => [child.id, allSeasonWeekNumbers]),
            ),
          );
        }
      }
    }, [allSeasonWeekNumbers]);

    useBookingProfilePrefill({
      initialTemplate,
      templateAppliedRef,
      onApply: applyProfilePrefill,
    });

    useEffect(() => {
      if (location === "lekki") {
        setBoardingByChild({});
        if (appliedPromoCode) {
          setAppliedPromoCode("");
          setPromoCodeInput("");
          setPromoStatus("idle");
          setPromoMessage("");
        }
      }
    }, [location, appliedPromoCode]);

    const countRequestedBoardingChildren = useCallback(
      (boardingState: Record<string, boolean> = boardingByChild) =>
        childrenData.reduce((count, child) => {
          const age =
            childAges[child.id] ?? childDefaults[child.id]?.age ?? 0;
          if (
            boardingState[child.id] &&
            location === "gbagada" &&
            canChildBoard(age)
          ) {
            return count + 1;
          }
          return count;
        }, 0),
      [childrenData, childAges, childDefaults, boardingByChild, location],
    );

    const refreshBoardingAvailabilityFromDb = useCallback(
      async (requestedBoardingChildren?: number) => {
        if (!isSummer || location !== "gbagada") {
          setBoardingAvailability(null);
          setBoardingCapacityMessage("");
          return null;
        }

        const requested =
          requestedBoardingChildren ?? countRequestedBoardingChildren();

        setBoardingAvailabilityLoading(true);
        try {
          const response = await fetch("/api/camp/boarding-availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              campSeasonId,
              campLocation: location,
              requestedBoardingChildren: requested,
            }),
          });
          const data = await response.json();

          if (!response.ok) {
            setBoardingCapacityMessage(
              data.error || "Unable to confirm boarding availability.",
            );
            return null;
          }

          setBoardingAvailability(data.status);
          setBoardingCapacityMessage(data.error ?? "");

          if (!data.allowed && requested > 0) {
            setBoardingByChild({});
          }

          return data as {
            status: {
              capacity: number;
              used: number;
              remaining: number;
              isFull: boolean;
            };
            allowed: boolean;
            error: string | null;
          };
        } catch {
          setBoardingCapacityMessage("Unable to confirm boarding availability.");
          return null;
        } finally {
          setBoardingAvailabilityLoading(false);
        }
      },
      [
        campSeasonId,
        countRequestedBoardingChildren,
        isSummer,
        location,
      ],
    );

    useEffect(() => {
      if (!isSummer || location !== "gbagada") {
        setBoardingAvailability(null);
        setBoardingCapacityMessage("");
        return;
      }

      void refreshBoardingAvailabilityFromDb(0);
    }, [isSummer, location, campSeasonId, refreshBoardingAvailabilityFromDb]);

    useEffect(() => {
      if (!isSummer || location !== "gbagada") {
        return;
      }

      void refreshBoardingAvailabilityFromDb();
    }, [boardingByChild, isSummer, location, refreshBoardingAvailabilityFromDb]);

    useEffect(() => {
      if (!isSummer || location !== "gbagada") {
        return;
      }

      const handleFocus = () => {
        void refreshBoardingAvailabilityFromDb();
      };

      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }, [isSummer, location, refreshBoardingAvailabilityFromDb]);

    const confirmBoardingFromDb = useCallback(async () => {
      if (!isSummer || location !== "gbagada") {
        return { ok: true as const };
      }

      const requested = countRequestedBoardingChildren();
      const result = await refreshBoardingAvailabilityFromDb(requested);

      if (requested === 0) {
        return { ok: true as const };
      }

      if (!result?.allowed) {
        return {
          ok: false as const,
          error:
            result?.error ||
            "Boarding is no longer available. Please select day camp only.",
        };
      }

      return { ok: true as const };
    }, [
      countRequestedBoardingChildren,
      isSummer,
      location,
      refreshBoardingAvailabilityFromDb,
    ]);

    const handleSelectBoarding = useCallback(
      async (childId: string) => {
        const childAge =
          childAges[childId] ?? childDefaults[childId]?.age ?? 0;

        if (
          boardingAvailabilityLoading ||
          !isSummer ||
          location !== "gbagada" ||
          !canChildBoard(childAge)
        ) {
          return;
        }

        const projectedBoarding = {
          ...boardingByChild,
          [childId]: true,
        };
        const requested = countRequestedBoardingChildren(projectedBoarding);

        setBoardingCapacityMessage("");
        setBoardingAvailabilityLoading(true);
        try {
          const response = await fetch("/api/camp/boarding-availability", {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              campSeasonId,
              campLocation: location,
              requestedBoardingChildren: requested,
            }),
          });
          const data = await response.json();

          if (!response.ok) {
            setBoardingCapacityMessage(
              data.error || "Unable to confirm boarding availability.",
            );
            return;
          }

          setBoardingAvailability(data.status);
          if (data.allowed) {
            setBoardingByChild(projectedBoarding);
            setBoardingCapacityMessage("");
          } else {
            setBoardingCapacityMessage(
              data.error ||
                "Boarding is not available. Please select day camp only.",
            );
          }
        } catch {
          setBoardingCapacityMessage("Unable to confirm boarding availability.");
        } finally {
          setBoardingAvailabilityLoading(false);
        }
      },
      [
        boardingAvailabilityLoading,
        boardingByChild,
        campSeasonId,
        childAges,
        childDefaults,
        countRequestedBoardingChildren,
        isSummer,
        location,
      ],
    );

    const handleDeselectBoarding = useCallback(
      (childId: string) => {
        setBoardingByChild((prev) => ({ ...prev, [childId]: false }));
        setBoardingCapacityMessage("");
        void refreshBoardingAvailabilityFromDb(
          countRequestedBoardingChildren({ ...boardingByChild, [childId]: false }),
        );
      },
      [
        boardingByChild,
        countRequestedBoardingChildren,
        refreshBoardingAvailabilityFromDb,
      ],
    );

    const boardingSelectedInForm = useMemo(
      () => countRequestedBoardingChildren(),
      [countRequestedBoardingChildren],
    );
    const boardingSlotsRemaining = boardingAvailability?.remaining ?? null;

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
          undefined,
          { promoCode: appliedPromoCode },
        ),
      [campSeasonId, isSummer, location, pricingInputs, appliedPromoCode],
    );

    const packageDiscountTotal =
      pricing.packageDiscounts?.reduce((sum, entry) => sum + entry.amount, 0) ??
      0;
    const autoDiscountTotal = pricing.discount - packageDiscountTotal;

    const applyPromoCode = async () => {
      if (!promoCodeInput.trim()) {
        setPromoStatus("error");
        setPromoMessage("Enter a promo code first.");
        return;
      }

      setPromoStatus("checking");
      setPromoMessage("");

      try {
        const response = await fetch("/api/promotions/hotr26/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCodeInput.trim(),
            campSeasonId,
            campLocation: location,
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          setAppliedPromoCode("");
          setPromoStatus("error");
          setPromoMessage(result.error || "Invalid promo code.");
          return;
        }

        setAppliedPromoCode(result.data.promoCode);
        setPromoCodeInput(result.data.promoCode);
        setPromoStatus("applied");
        setPromoMessage(result.data.message || "Promo applied.");
      } catch {
        setAppliedPromoCode("");
        setPromoStatus("error");
        setPromoMessage("Unable to validate promo code right now.");
      }
    };

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
      const newId = uuidv4();
      setChildrenData((prev) => [...prev, { id: newId }]);
      setSelectedWeeksByChild((prev) => ({
        ...prev,
        [newId]: allSeasonWeekNumbers,
      }));
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
      const firstChildId = INITIAL_CHILD_ID;
      setChildrenData([{ id: firstChildId }]);
      setSelectedWeeksByChild({
        [firstChildId]: allSeasonWeekNumbers,
      });
      setChildAges({});
      setBoardingByChild({});
      setLocation("gbagada");
      setPromoCodeInput("");
      setAppliedPromoCode("");
      setPromoStatus("idle");
      setPromoMessage("");
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
      confirmBoardingFromDb,
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
        <input
          type="hidden"
          name="promoCode"
          value={
            pricing.promoCode ||
            (autoDiscountTotal > 0 ? "FULL-SUMMER-7" : appliedPromoCode)
          }
        />
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
            <p className="text-sm text-gray-600">
              Weekly camp fees depend on location and your child&apos;s age. Prices
              below are per child, per week.
            </p>
            <div
              className={`grid grid-cols-1 gap-4 ${
                ENABLED_SUMMER_CAMP_LOCATIONS.length > 1
                  ? "md:grid-cols-2"
                  : "max-w-xl"
              }`}
            >
              {(
                [
                  {
                    id: "gbagada" as CampLocation,
                    title: "Gbagada (Mainland)",
                    tiers: [
                      {
                        label: "Ages 0–5",
                        price: SUMMER_CAMP_RATES.gbagadaYoungWeekly,
                        note: "Day camp",
                      },
                      {
                        label: "Ages 6–14",
                        price: SUMMER_CAMP_RATES.gbagadaOlderWeekly,
                        note: "Day camp",
                      },
                      {
                        label: "Boarding add-on (ages 6–14 only)",
                        price: SUMMER_CAMP_RATES.boardingWeekly,
                        note: "Weekday boarding",
                      },
                    ],
                  },
                  // Lekki campus temporarily unavailable — keep entry for easy re-enable
                  // {
                  //   id: "lekki" as CampLocation,
                  //   title: "Lekki",
                  //   tiers: [
                  //     {
                  //       label: "Ages 0–14",
                  //       price: SUMMER_CAMP_RATES.lekkiWeekly,
                  //       note: "Day camp only — no boarding",
                  //     },
                  //   ],
                  // },
                ] as const
              )
                .filter((option) =>
                  (
                    ENABLED_SUMMER_CAMP_LOCATIONS as readonly CampLocation[]
                  ).includes(option.id),
                )
                .map((option) => (
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
                  <ul className="mt-3 space-y-2">
                    {option.tiers.map((tier) => (
                      <li
                        key={tier.label}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{tier.label}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{tier.note}</p>
                        </div>
                        <p className="font-semibold text-brand-primary whitespace-nowrap">
                          {formatNaira(tier.price)}
                          <span className="text-gray-500 font-normal">/wk</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {isSummer && location === "gbagada" && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Promo Code
              </span>
              <span className="text-xs text-gray-600">
                Apply your promo code for Gbagada package pricing.
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value.toUpperCase());
                  if (promoStatus !== "checking") {
                    setPromoStatus("idle");
                    setPromoMessage("");
                    setAppliedPromoCode("");
                  }
                }}
                className="w-full md:w-80 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-gray-900 bg-white transition-colors"
                placeholder="Enter promo code"
                maxLength={30}
              />
              <button
                type="button"
                onClick={applyPromoCode}
                disabled={promoStatus === "checking"}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {promoStatus === "checking" ? "Applying..." : "Apply Promo"}
              </button>
            </div>
            {promoMessage && (
              <p
                className={`mt-2 text-sm ${
                  promoStatus === "applied" ? "text-green-600" : "text-red-600"
                }`}
              >
                {promoMessage}
              </p>
            )}
          </div>
        )}

        {isSummer && location === "gbagada" && (
          <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-3 text-sm text-base-content">
            {boardingAvailabilityLoading && !boardingAvailability ? (
              <span>Checking boarding availability...</span>
            ) : boardingAvailability ? (
              boardingAvailability.isFull ? (
                <span>
                  Boarding is fully booked ({boardingAvailability.capacity}/
                  {boardingAvailability.capacity}). Day camp is still available.
                </span>
              ) : (
                <span>
                  {boardingAvailability.remaining} boarding spot
                  {boardingAvailability.remaining === 1 ? "" : "s"} remaining
                  (confirmed from current bookings).
                </span>
              )
            ) : (
              <span>Unable to load boarding availability. Try again shortly.</span>
            )}
          </div>
        )}

        {boardingCapacityMessage && (
          <p className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            {boardingCapacityMessage}
          </p>
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
          const otherBoardingSelected =
            boardingSelectedInForm - (boardingSelected ? 1 : 0);
          const canSelectBoarding =
            !boardingAvailabilityLoading &&
            boardingSlotsRemaining !== null &&
            boardingSlotsRemaining > otherBoardingSelected;
          const boardingDisabled =
            boardingAvailabilityLoading ||
            !isSummer ||
            location !== "gbagada" ||
            childAge === 0 ||
            !canChildBoard(childAge) ||
            boardingSlotsRemaining === null ||
            (boardingSlotsRemaining !== null && boardingSlotsRemaining <= 0) ||
            (!boardingSelected && !canSelectBoarding);
          const boardingDisabledReason =
            location !== "gbagada"
              ? "Weekday boarding is only available at Gbagada (Mainland) for children aged 6–14."
              : childAge === 0
                ? "Enter your child's age above to enable boarding."
                : !canChildBoard(childAge)
                  ? "Boarding at Gbagada (Mainland) is for ages 6–14 only. Children aged 0–5 attend day camp."
                  : boardingSlotsRemaining !== null &&
                      boardingSlotsRemaining <= 0
                    ? `Boarding is fully booked (${boardingAvailability?.capacity ?? 20}/${boardingAvailability?.capacity ?? 20}). Day camp is still available.`
                    : boardingSlotsRemaining !== null &&
                        !boardingSelected &&
                        !canSelectBoarding
                      ? `Only ${boardingSlotsRemaining} boarding spot(s) remaining.`
                      : null;

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

              {isSummer && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Day camp or boarding?
                  </p>
                  <p className="text-xs text-gray-600">
                    Boarding is available at Gbagada (Mainland) for ages 6–14.
                    Ages 0–5 are day camp only.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDeselectBoarding(child.id)}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        !boardingSelected
                          ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Day camp only</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Drop-off and pick-up each day at the Gbagada campus
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ages 0–14
                      </p>
                    </button>
                    <button
                      type="button"
                      disabled={boardingDisabled}
                      onClick={() => {
                        void handleSelectBoarding(child.id);
                      }}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        boardingDisabled
                          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                          : boardingSelected
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
                      <p className="text-xs text-gray-500 mt-2">
                        Gbagada (Mainland) · ages 6–14 only
                      </p>
                    </button>
                  </div>
                  {boardingDisabledReason && (
                    <p className="text-sm text-gray-600 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      {boardingDisabledReason}
                    </p>
                  )}
                  <input
                    type="hidden"
                    name={`boarding_${child.id}`}
                    value={boardingSelected && boardingEligible ? "true" : "false"}
                  />
                </div>
              )}

              {!isSummer && (
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

        <AddAnotherChildButton onClick={addChild} />

        <input type="hidden" name="childrenCount" value={childrenData.length} />

        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 sm:p-8">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-base-content mb-6">
            <CurrencyCircleDollar
              className="w-6 h-6 text-brand-primary"
              weight="regular"
            />
            Payment Summary
          </h3>

          <div className="space-y-2 text-sm text-base-content/90 mb-4">
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
            {pricing.packageDiscounts?.map((entry) => (
              <div
                key={`${entry.childId}-${entry.packageName}`}
                className="flex justify-between text-brand-secondary font-medium"
              >
                <span>
                  {entry.packageName === "builder"
                    ? "Builder Package (3 weeks)"
                    : "Champion Package (6 weeks)"}
                </span>
                <span>-{formatNaira(entry.amount)}</span>
              </div>
            ))}
            {autoDiscountTotal > 0 && (
              <div className="flex justify-between text-brand-secondary font-medium">
                <span>
                  {pricing.discountPercent}% full-season discount (6 weeks per
                  child)
                </span>
                <span>-{formatNaira(autoDiscountTotal)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-base-300">
            <span className="text-lg font-semibold text-base-content">Total</span>
            <span className="text-2xl font-bold text-brand-primary">
              {formatNaira(pricing.total)}
            </span>
          </div>

          <div className="mt-4 bg-base-200 border border-base-300 rounded-xl p-4 flex gap-2">
            <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0" />
            <span className="text-sm text-base-content">
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
