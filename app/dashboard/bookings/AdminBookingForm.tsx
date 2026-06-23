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

const SERVICE_OPTIONS = [
  { value: "childcare", label: "Childcare" },
  { value: "tutoring", label: "Tutoring" },
  { value: "homeschooling", label: "Homeschooling" },
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

  useEffect(() => {
    const formEl = document.getElementById("admin-booking-form");
    if (!formEl) return;

    formEl.addEventListener("input", schedulePreview);
    formEl.addEventListener("change", schedulePreview);
    return () => {
      formEl.removeEventListener("input", schedulePreview);
      formEl.removeEventListener("change", schedulePreview);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [schedulePreview, selectedService, formKey]);

  useEffect(() => {
    schedulePreview();
  }, [selectedService, billingPeriodMonths, campTotal, schedulePreview]);

  const displayTotal =
    selectedService === "holiday-camps" && campTotal > 0
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
          <div className="rounded-xl border border-base-300 bg-base-200/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-base-content">
                Calculated total
              </p>
              <p className="text-xs text-base-content/60">
                Based on the same pricing rules as the public booking form.
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
