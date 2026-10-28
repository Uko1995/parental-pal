"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import EventBookingForm, { EventBookingFormRef } from "@/app/booking/EventBookingForm";
import ChildCareSpecificBookingForm, {
  ChildCareSpecificBookingFormRef,
} from "@/app/booking/ChildCareSpecificBookingForm";
import TutoringForm, { TutoringFormRef } from "@/app/booking/TutoringForm";
import HolidayCampForm, { HolidayCampFormRef } from "@/app/booking/HolidayCampForm";
import HomeschoolingForm, { HomeschoolingFormRef } from "@/app/booking/HomeschoolingForm";
import KiddiesEnrichmentForm, {
  KiddiesEnrichmentFormRef,
} from "@/app/booking/KiddiesEnrichmentForm";
import { BookingProfileProvider } from "@/app/booking/BookingProfileContext";
import { resolveCampSeasonId } from "@/lib/camp-seasons";
import { collectFormEntriesFromElement } from "@/lib/form-data-entries";
import {
  scrollToField,
  validateBookingForm,
  type ServiceFormValidationRef,
} from "@/lib/booking-form-validation";
import {
  toastErrorOnce,
  toastLoadingOnce,
  toastSuccessOnce,
} from "@/lib/toast-once";
import toast from "react-hot-toast";
import type { ParentSearchOption } from "@/components/admin/ParentSearchCombobox";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import { INITIAL_CHILD_ID } from "@/lib/booking-child-id";
import { HOMESCHOOL_PROGRAM_SHORT_NAME } from "@/lib/homeschool-program";

const SERVICE_OPTIONS = [
  { value: "childcare", label: "Childcare" },
  { value: "tutoring", label: "Tutoring" },
  { value: "homeschooling", label: HOMESCHOOL_PROGRAM_SHORT_NAME },
  { value: "holiday-camps", label: "Holiday Camps" },
  { value: "space-rental", label: "Space Rental" },
  { value: "kiddies-enrichment", label: "Kiddies Enrichment" },
];

interface AdminBookingFormProps {
  parentPrefill: ParentSearchOption | null;
  onSuccess: (options: {
    keepOpen: boolean;
    bookingId: string;
    parentEmail: string;
  }) => void;
  onClose: () => void;
}

function buildParentPrefillTemplate(
  parent: ParentSearchOption,
): RebookFormEntries {
  const entries: RebookFormEntries = {
    parentName: parent.name || "",
    parentEmail: parent.email || "",
    parentPhone: parent.phone || "",
    address: parent.address || "",
  };

  const firstChild = parent.children?.[0];
  if (firstChild) {
    entries[`childName_${INITIAL_CHILD_ID}`] = firstChild.name;
    entries[`childAge_${INITIAL_CHILD_ID}`] = String(firstChild.age);
    entries[`childGender_${INITIAL_CHILD_ID}`] = firstChild.gender;
  }

  return entries;
}

export default function AdminBookingForm({
  parentPrefill,
  onSuccess,
  onClose,
}: AdminBookingFormProps) {
  const [selectedService, setSelectedService] = useState("");
  const [billingPeriodMonths, setBillingPeriodMonths] = useState(1);
  const [applyDiscounts, setApplyDiscounts] = useState(true);
  const [selectedPromoCode, setSelectedPromoCode] = useState("");
  const [eligiblePromos, setEligiblePromos] = useState<
    Array<{
      code: string;
      label: string;
      discountAmount: number;
      automatic: boolean;
    }>
  >([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [campTotal, setCampTotal] = useState(0);
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const parentPrefillTemplate = parentPrefill
    ? buildParentPrefillTemplate(parentPrefill)
    : null;
  const serviceFormKey = `${selectedService}-${formKey}-${parentPrefill?._id ?? "none"}`;

  const submittingRef = useRef(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promosRequestRef = useRef(0);

  const eventFormRef = useRef<EventBookingFormRef>(null);
  const childCareFormRef = useRef<ChildCareSpecificBookingFormRef>(null);
  const tutoringFormRef = useRef<TutoringFormRef>(null);
  const holidayCampFormRef = useRef<HolidayCampFormRef>(null);
  const homeschoolingFormRef = useRef<HomeschoolingFormRef>(null);
  const kiddiesEnrichmentFormRef = useRef<KiddiesEnrichmentFormRef>(null);

  const campSeasonId = resolveCampSeasonId(null);

  const getServiceFormRef = (): ServiceFormValidationRef | null => {
    switch (selectedService) {
      case "tutoring":
        return tutoringFormRef.current;
      case "childcare":
        return childCareFormRef.current;
      case "space-rental":
        return eventFormRef.current;
      case "holiday-camps":
        return holidayCampFormRef.current;
      case "homeschooling":
        return homeschoolingFormRef.current;
      case "kiddies-enrichment":
        return kiddiesEnrichmentFormRef.current;
      default:
        return null;
    }
  };

  const runPreview = useCallback(async () => {
    const formEl = document.getElementById(
      "admin-booking-form",
    ) as HTMLFormElement | null;
    if (!formEl || !selectedService) {
      setPreviewTotal(null);
      setPreviewError(null);
      return;
    }

    const formEntries = collectFormEntriesFromElement(formEl);
    if (!formEntries.parentEmail?.trim()) {
      setPreviewTotal(null);
      setPreviewError(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/bookings/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formEntries }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewTotal(null);
        setPreviewError(data.error || "Could not calculate total");
        return;
      }
      setPreviewTotal(data.totalAmount ?? 0);
      setPreviewError(null);
    } catch {
      setPreviewTotal(null);
      setPreviewError("Could not calculate total");
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedService]);

  const schedulePreview = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    previewTimerRef.current = setTimeout(() => {
      void runPreview();
    }, 600);
  }, [runPreview]);

  const runPromoList = useCallback(async () => {
    const formEl = document.getElementById(
      "admin-booking-form",
    ) as HTMLFormElement | null;
    if (!formEl || !selectedService || !applyDiscounts || !parentPrefill) {
      setEligiblePromos([]);
      return;
    }

    const formEntries = collectFormEntriesFromElement(formEl);
    if (!formEntries.parentEmail?.trim()) {
      setEligiblePromos([]);
      return;
    }

    const requestId = ++promosRequestRef.current;
    setPromosLoading(true);
    try {
      const res = await fetch("/api/admin/bookings/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formEntries }),
      });
      const data = await res.json();
      if (requestId !== promosRequestRef.current) return;
      if (!res.ok || !data.success) {
        setEligiblePromos([]);
        return;
      }
      const next: typeof eligiblePromos = data.data?.promotions ?? [];
      setEligiblePromos(next);
      setSelectedPromoCode((prev) =>
        prev && next.some((p) => p.code === prev) ? prev : "",
      );
    } catch {
      if (requestId === promosRequestRef.current) setEligiblePromos([]);
    } finally {
      if (requestId === promosRequestRef.current) setPromosLoading(false);
    }
  }, [selectedService, applyDiscounts, parentPrefill]);

  const schedulePromoList = useCallback(() => {
    if (promosTimerRef.current) clearTimeout(promosTimerRef.current);
    promosTimerRef.current = setTimeout(() => {
      void runPromoList();
    }, 700);
  }, [runPromoList]);

  useEffect(() => {
    const formEl = document.getElementById("admin-booking-form");
    if (!formEl) return;

    const onFormChange = (event: Event) => {
      const name = (event.target as HTMLInputElement | null)?.name;
      // Promo radio changes only need a price refresh, not a re-list.
      if (name === "adminPromoCode") {
        schedulePreview();
        return;
      }
      schedulePreview();
      schedulePromoList();
    };

    formEl.addEventListener("input", onFormChange);
    formEl.addEventListener("change", onFormChange);
    return () => {
      formEl.removeEventListener("input", onFormChange);
      formEl.removeEventListener("change", onFormChange);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (promosTimerRef.current) clearTimeout(promosTimerRef.current);
    };
  }, [schedulePreview, schedulePromoList, selectedService, formKey]);

  useEffect(() => {
    schedulePreview();
    schedulePromoList();
  }, [
    selectedService,
    billingPeriodMonths,
    campTotal,
    applyDiscounts,
    selectedPromoCode,
    schedulePreview,
    schedulePromoList,
  ]);

  useEffect(() => {
    if (!applyDiscounts) {
      setSelectedPromoCode("");
      setEligiblePromos([]);
    }
  }, [applyDiscounts]);

  // Camp form total is client-side and may include camp promos; when discounts
  // are off, always trust the server preview (full rate).
  const displayTotal =
    applyDiscounts && selectedService === "holiday-camps" && campTotal > 0
      ? campTotal
      : previewTotal;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;

    if (!parentPrefill) {
      toastErrorOnce(
        "Select a parent account first",
        "admin-booking-parent-required",
      );
      return;
    }

    const formEl = e.currentTarget;
    const validation = validateBookingForm({
      form: formEl,
      selectedService,
      hearAboutUs: {
        selected: "walkIn",
        otherText: "",
        socialMediaPlatform: "",
        referralName: "",
      },
      serviceFormRef: getServiceFormRef(),
      servicesLoaded: true,
      servicesLoadFailed: false,
    });

    if (!validation.ok) {
      toastErrorOnce(validation.errors[0], "admin-booking-validation");
      scrollToField(
        validation.firstInvalidElement ??
          (validation.scrollTargetId
            ? document.getElementById(validation.scrollTargetId)
            : null),
      );
      return;
    }

    if (selectedService === "holiday-camps") {
      const boardingCheck =
        await holidayCampFormRef.current?.confirmBoardingFromDb();
      if (boardingCheck && !boardingCheck.ok) {
        toastErrorOnce(
          boardingCheck.error ||
            "Boarding is no longer available. Please update your selections.",
          "admin-booking-boarding-capacity",
        );
        return;
      }
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    toastLoadingOnce("Creating booking...", "admin-booking-create");

    try {
      const formEntries = collectFormEntriesFromElement(formEl);
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formEntries }),
      });
      const data = await res.json();
      toast.dismiss("admin-booking-create");

      if (!res.ok) {
        toastErrorOnce(
          data.error || "Failed to create booking",
          "admin-booking-create-error",
        );
        return;
      }

      toastSuccessOnce(
        "Booking created successfully!",
        "admin-booking-create-success",
      );

      onSuccess({
        keepOpen: true,
        bookingId: data._id || data.id,
        parentEmail: formEntries.parentEmail || "",
      });

      setSelectedService("");
      setBillingPeriodMonths(1);
      setCampTotal(0);
      setPreviewTotal(null);
      setPreviewError(null);
      setFormKey((k) => k + 1);
    } catch {
      toast.dismiss("admin-booking-create");
      toastErrorOnce("Error creating booking", "admin-booking-create-error");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const renderServiceForm = () => {
    const key = serviceFormKey;
    switch (selectedService) {
      case "space-rental":
        return (
          <EventBookingForm
            key={key}
            ref={eventFormRef}
            initialTemplate={parentPrefillTemplate}
          />
        );
      case "childcare":
        return (
          <ChildCareSpecificBookingForm
            key={key}
            ref={childCareFormRef}
            initialTemplate={parentPrefillTemplate}
            billingPeriodMonths={billingPeriodMonths}
            onBillingPeriodMonthsChange={setBillingPeriodMonths}
          />
        );
      case "holiday-camps":
        return (
          <HolidayCampForm
            key={key}
            ref={holidayCampFormRef}
            initialTemplate={parentPrefillTemplate}
            campSeasonId={campSeasonId}
            onTotalChange={setCampTotal}
          />
        );
      case "homeschooling":
        return (
          <HomeschoolingForm
            key={key}
            ref={homeschoolingFormRef}
            initialTemplate={parentPrefillTemplate}
          />
        );
      case "kiddies-enrichment":
        return (
          <KiddiesEnrichmentForm
            key={key}
            ref={kiddiesEnrichmentFormRef}
            initialTemplate={parentPrefillTemplate}
            billingPeriodMonths={billingPeriodMonths}
            onBillingPeriodMonthsChange={setBillingPeriodMonths}
          />
        );
      case "tutoring":
        return (
          <TutoringForm
            key={key}
            ref={tutoringFormRef}
            initialTemplate={parentPrefillTemplate}
            billingPeriodMonths={billingPeriodMonths}
            onBillingPeriodMonthsChange={setBillingPeriodMonths}
          />
        );
      default:
        return (
          <p className="text-sm text-base-content/60 py-6 text-center">
            Select a service to show the booking form.
          </p>
        );
    }
  };

  return (
    <BookingProfileProvider>
      <form
        id="admin-booking-form"
        key={formKey}
        noValidate
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <input type="hidden" name="source" value="walkIn" />
        <input type="hidden" name="priority" value="normal" />
        <input
          type="hidden"
          name="billingPeriodMonths"
          value={billingPeriodMonths}
        />
        <input
          type="hidden"
          name="applyDiscounts"
          value={applyDiscounts ? "true" : "false"}
        />
        {/* Radio group below also uses adminPromoCode; keep a fallback when list is empty */}
        {!applyDiscounts && (
          <input type="hidden" name="adminPromoCode" value="" />
        )}

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
          <h4 className="font-semibold text-base-content mb-1">Service</h4>
          <p className="text-xs text-base-content/60 mb-4">
            Parent contact fields are filled from the account selected above.
          </p>
          <select
            name="serviceType"
            className="select select-bordered w-full max-w-md"
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCampTotal(0);
              setPreviewTotal(null);
              setPreviewError(null);
              setSelectedPromoCode("");
              setEligiblePromos([]);
            }}
            required
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {selectedService && !parentPrefill && (
          <p className="text-sm text-warning px-1">
            Select a parent account above before creating a booking.
          </p>
        )}

        {selectedService && parentPrefill && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-2 sm:p-4 overflow-hidden">
            {renderServiceForm()}
          </div>
        )}

        {selectedService && parentPrefill && (
          <div className="rounded-xl border border-base-300 bg-base-200/60 p-4 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-primary mt-0.5"
                checked={applyDiscounts}
                onChange={(e) => setApplyDiscounts(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-base-content">
                  Apply running discounts / promos
                </span>
                <span className="block text-xs text-base-content/60 mt-0.5 leading-snug">
                  {applyDiscounts
                    ? "Choose exactly one Discounts & Promos coupon below, or none."
                    : "Turned off — this booking will be charged at the full service rate with no discounts."}
                </span>
              </span>
            </label>

            {applyDiscounts && (
              <div className="border-t border-base-300 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-base-content">
                    Select a promo
                  </p>
                  {promosLoading && (
                    <span className="loading loading-spinner loading-xs text-primary" />
                  )}
                </div>
                <p className="text-xs text-base-content/60">
                  Only promos that match this service are listed. Public bookings
                  still auto-pick the largest eligible promo.
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <label className="flex items-start gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 cursor-pointer hover:border-primary/40">
                    <input
                      type="radio"
                      name="adminPromoCode"
                      value=""
                      className="radio radio-primary radio-sm mt-0.5"
                      checked={selectedPromoCode === ""}
                      onChange={() => setSelectedPromoCode("")}
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        No discount
                      </span>
                      <span className="block text-xs text-base-content/60">
                        Charge the full calculated service rate
                      </span>
                    </span>
                  </label>
                  {eligiblePromos.map((promo) => (
                    <label
                      key={promo.code}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer ${
                        selectedPromoCode === promo.code
                          ? "border-primary bg-primary/5"
                          : "border-base-300 bg-base-100 hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="adminPromoCode"
                        value={promo.code}
                        className="radio radio-primary radio-sm mt-0.5"
                        checked={selectedPromoCode === promo.code}
                        onChange={() => setSelectedPromoCode(promo.code)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {promo.code}
                          </span>
                          {promo.automatic && (
                            <span className="badge badge-warning badge-xs">
                              Auto
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-base-content/70 mt-0.5 leading-snug">
                          {promo.label}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-success shrink-0">
                        −{formatCurrency(promo.discountAmount)}
                      </span>
                    </label>
                  ))}
                  {!promosLoading && eligiblePromos.length === 0 && (
                    <p className="text-xs text-base-content/50 px-1">
                      No matching promos for this service right now. Fill in
                      booking details, or create one under Discounts &amp;
                      Promos.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-base-300 pt-4">
              <div>
                <p className="text-sm font-medium text-base-content">
                  Calculated total
                </p>
                <p className="text-xs text-base-content/60">
                  {!applyDiscounts
                    ? "Full rate — discounts and promos are not applied."
                    : selectedPromoCode
                      ? `Includes promo ${selectedPromoCode}.`
                      : "No Discounts & Promos coupon selected."}
                </p>
              </div>
              <div className="text-right">
                {previewLoading ? (
                  <span className="loading loading-spinner loading-sm text-primary" />
                ) : previewError ? (
                  <p className="text-sm text-warning">{previewError}</p>
                ) : displayTotal != null && displayTotal > 0 ? (
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(displayTotal)}
                  </p>
                ) : (
                  <p className="text-sm text-base-content/50">
                    Fill in booking details to see total
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="modal-action mt-2 pt-2 border-t border-base-300">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting || !selectedService || !parentPrefill}
          >
            {isSubmitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </form>
    </BookingProfileProvider>
  );
}
