"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import EventBookingForm, { EventBookingFormRef } from "./EventBookingForm";
import ChildCareSpecificBookingForm, {
  ChildCareSpecificBookingFormRef,
} from "./ChildCareSpecificBookingForm";
import TutoringForm, { TutoringFormRef } from "./TutoringForm";
import HolidayCampForm, { HolidayCampFormRef } from "./HolidayCampForm";
import HomeschoolingForm, { HomeschoolingFormRef } from "./HomeschoolingForm";
import KiddiesEnrichmentForm, {
  KiddiesEnrichmentFormRef,
} from "./KiddiesEnrichmentForm";
import {
  saveFormData,
  getFormData,
  clearFormData,
  extractFormDataForPersistence,
  snapshotBookingForm,
  serviceFormDataToTemplate,
  restoreFormDataToElements,
  shouldRestoreFormPersistence,
  clearPendingAuthSubmit,
} from "@/lib/form-persistence";
import {
  getRebookTemplate,
  clearRebookTemplate,
  saveRebookTemplate,
} from "@/lib/rebook-persistence";
import {
  getSubmitButtonLabel,
} from "@/lib/booking-payment-policy";
import {
  scrollToField,
  validateBookingForm,
  type ServiceFormValidationRef,
} from "@/lib/booking-form-validation";
import { isRebookEligibleBooking } from "@/lib/booking-rebook-eligibility";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { resolveCampSeasonId, type CampSeasonId } from "@/lib/camp-seasons";
import { formatPaymentDueToastMessage } from "@/lib/booking-payment-due";
import { BookingProfileProvider } from "./BookingProfileContext";

interface AboutUs {
  label: string;
  value: string;
}

const HearAboutUs: AboutUs[] = [
  { label: "Social Media", value: "socialMedia" },
  { label: "Referral", value: "referral" },
  { label: "Walk In", value: "walkIn" },
  { label: "Online Search", value: "onlineSearch" },
  { label: "Signage", value: "signage" },
  { label: "Other", value: "other" },
];

interface BookingFormProps {
  submitAction: (formData: FormData) => Promise<{
    success: boolean;
    bookingId?: string;
    userId?: string;
    amount?: number;
    currency?: string;
    email?: string;
    paymentDueDate?: string;
  }>;
}

interface BookingServiceOption {
  value: string;
  label: string;
}

type SubmitFeedback = {
  type: "error" | "warning" | "info";
  title?: string;
  messages: string[];
  bookingId?: string;
} | null;

function readPersistedBookingFields(
  urlService: string | null,
  actionParam: string | null,
) {
  const data = getFormData();
  if (!data || !shouldRestoreFormPersistence(data, actionParam)) {
    return {
      hasPersisted: false,
      selectedService: urlService || "",
      selectedHearAboutUs: "",
      otherHearAboutUsText: "",
      socialMediaPlatform: "",
      referralName: "",
      priority: "normal" as const,
      followUpRequired: false,
      isRepeatedCustomer: false,
      billingPeriodMonths: 1,
      template: null as RebookFormEntries | null,
    };
  }

  return {
    hasPersisted: true,
    selectedService: urlService || data.selectedService || "",
    selectedHearAboutUs: data.selectedHearAboutUs || "",
    otherHearAboutUsText: data.otherHearAboutUsText || "",
    socialMediaPlatform: data.socialMediaPlatform || "",
    referralName: data.referralName || "",
    priority: data.priority || ("normal" as const),
    followUpRequired: data.followUpRequired || false,
    isRepeatedCustomer: data.isRepeatedCustomer || false,
    billingPeriodMonths: data.billingPeriodMonths ?? 1,
    template: serviceFormDataToTemplate(data.serviceFormData),
  };
}

export default function BookingForm({ submitAction }: BookingFormProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const campParam = searchParams.get("camp");
  const rebookParam = searchParams.get("rebook");
  const actionParam = searchParams.get("action");

  const campSeasonId: CampSeasonId = resolveCampSeasonId(campParam);

  // State management — localStorage is read after mount (SSR has no window)
  const [selectedService, setSelectedService] = useState(urlService || "");
  const [selectedHearAboutUs, setSelectedHearAboutUs] = useState("");
  const [otherHearAboutUsText, setOtherHearAboutUsText] = useState("");
  const [socialMediaPlatform, setSocialMediaPlatform] = useState("");
  const [referralName, setReferralName] = useState("");
  const [priority, setPriority] = useState<
    "low" | "normal" | "high" | "urgent"
  >("normal");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isRepeatedCustomer, setIsRepeatedCustomer] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [billingPeriodMonths, setBillingPeriodMonths] = useState(1);
  const [services, setServices] = useState<BookingServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesLoadFailed, setServicesLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<SubmitFeedback>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [rebookTemplate, setRebookTemplate] =
    useState<RebookFormEntries | null>(null);
  const [rebookSourceId, setRebookSourceId] = useState<string | null>(null);
  const [rebookMonthLabel, setRebookMonthLabel] = useState("");
  const [persistedFormTemplate, setPersistedFormTemplate] =
    useState<RebookFormEntries | null>(null);
  const [formRestoreKey, setFormRestoreKey] = useState(0);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const restoredFromPersistenceRef = useRef(false);
  const skipNextAutoSaveRef = useRef(false);
  const serviceFormTemplate = rebookTemplate ?? persistedFormTemplate;
  const serviceFormKey = `${selectedService}-${formRestoreKey}`;
  const [repeatBooking, setRepeatBooking] = useState<{
    id: string;
    childrenSummary: string;
  } | null>(null);

  // Hydrate booking fields from localStorage after client mount
  useEffect(() => {
    const fields = readPersistedBookingFields(urlService, actionParam);
    if (fields.hasPersisted) {
      if (fields.selectedService) setSelectedService(fields.selectedService);
      setSelectedHearAboutUs(fields.selectedHearAboutUs);
      setOtherHearAboutUsText(fields.otherHearAboutUsText);
      setSocialMediaPlatform(fields.socialMediaPlatform);
      setReferralName(fields.referralName);
      setPriority(fields.priority);
      setFollowUpRequired(fields.followUpRequired);
      setIsRepeatedCustomer(fields.isRepeatedCustomer);
      setBillingPeriodMonths(fields.billingPeriodMonths);
      setPersistedFormTemplate(fields.template);
      setFormRestoreKey(Date.now());
      restoredFromPersistenceRef.current = true;
      skipNextAutoSaveRef.current = true;
      clearPendingAuthSubmit();
    } else if (urlService || campParam === "holidays-that-rock-2026") {
      setSelectedService(urlService || "holiday-camps");
    }
    setStorageHydrated(true);
  }, [urlService, campParam, actionParam]);

  // Scroll to top on initial load (except when returning from sign-in)
  useEffect(() => {
    if (actionParam !== "submit") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [actionParam]);

  // Post-login UX when returning with action=submit
  useEffect(() => {
    if (!storageHydrated || rebookParam || !restoredFromPersistenceRef.current) {
      return;
    }

    if (actionParam === "submit") {
      toast.success(
        "Your form data has been restored. Please review and submit.",
        { duration: 3000 },
      );

      setSubmitFeedback({
        type: "info",
        title: "Sign in required",
        messages: [
          "Please sign in to complete your booking.",
          "Your form details have been restored — review them, then submit again.",
        ],
      });

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        submitButtonRef.current?.focus();
        submitButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 800);
    }
  }, [actionParam, storageHydrated, rebookParam]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await fetch("/api/services");
        const result = await response.json();

        if (!response.ok || !result?.success || !Array.isArray(result?.data)) {
          throw new Error("Failed to fetch booking services");
        }

        const supportedTypes = new Set([
          "childcare",
          "tutoring",
          "space-rental",
          "holiday-camps",
          "homeschooling",
          "kiddies-enrichment",
        ]);

        const options = result.data
          .filter(
            (service: { status?: string; type?: string; name?: string }) =>
              service.status === "active" &&
              typeof service.type === "string" &&
              typeof service.name === "string" &&
              supportedTypes.has(service.type),
          )
          .map((service: { type: string; name: string }) => ({
            value: service.type,
            label: service.name,
          }))
          .filter(
            (service: BookingServiceOption, index: number, arr: BookingServiceOption[]) =>
              arr.findIndex((item) => item.value === service.value) === index,
          );

        setServices(options);
        setServicesLoadFailed(false);
      } catch (error) {
        console.error("Error loading booking services:", error);
        toast.error("Unable to load services right now");
        setServices([]);
        setServicesLoadFailed(true);
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // Refs for form components
  const eventFormRef = useRef<EventBookingFormRef>(null);
  const childCareFormRef = useRef<ChildCareSpecificBookingFormRef>(null);
  const tutoringFormRef = useRef<TutoringFormRef>(null);
  const holidayCampFormRef = useRef<HolidayCampFormRef>(null);
  const homeschoolingFormRef = useRef<HomeschoolingFormRef>(null);
  const kiddiesEnrichmentFormRef = useRef<KiddiesEnrichmentFormRef>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const revalidateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  const showValidationFailure = (
    errors: string[],
    firstInvalidElement?: HTMLElement | null,
    scrollTargetId?: string,
  ) => {
    setHasAttemptedSubmit(true);
    setSubmitFeedback({
      type: "error",
      title: "Please fix the following before continuing:",
      messages: errors,
    });
    toast.error(errors[0]);
    const scrollTarget =
      firstInvalidElement ??
      (scrollTargetId
        ? document.getElementById(scrollTargetId)
        : null) ??
      submitButtonRef.current;
    scrollToField(scrollTarget);
  };

  const runClientValidation = useCallback(() => {
    const formEl = document.getElementById(
      "booking-form",
    ) as HTMLFormElement | null;

    return validateBookingForm({
      form: formEl,
      selectedService,
      hearAboutUs: {
        selected: selectedHearAboutUs,
        otherText: otherHearAboutUsText,
        socialMediaPlatform,
        referralName,
      },
      serviceFormRef: getServiceFormRef(),
      servicesLoaded: !isLoadingServices,
      servicesLoadFailed,
    });
  }, [
    selectedService,
    selectedHearAboutUs,
    otherHearAboutUsText,
    socialMediaPlatform,
    referralName,
    isLoadingServices,
    servicesLoadFailed,
  ]);

  // Re-run validation after a failed submit so errors update as the parent fixes fields
  useEffect(() => {
    if (!hasAttemptedSubmit) return;

    const applyValidationResult = () => {
      const validation = runClientValidation();
      if (validation.ok) {
        setSubmitFeedback(null);
        setHasAttemptedSubmit(false);
        return;
      }

      setSubmitFeedback((prev) =>
        prev?.type === "error"
          ? { ...prev, messages: validation.errors }
          : prev,
      );
    };

    const scheduleRevalidate = () => {
      if (revalidateDebounceRef.current) {
        clearTimeout(revalidateDebounceRef.current);
      }
      // Defer until after React commits controlled input state (avoids wiping keystrokes)
      revalidateDebounceRef.current = setTimeout(applyValidationResult, 100);
    };

    scheduleRevalidate();

    const formEl = document.getElementById("booking-form");
    if (!formEl) return;

    formEl.addEventListener("input", scheduleRevalidate);
    formEl.addEventListener("change", scheduleRevalidate);
    return () => {
      if (revalidateDebounceRef.current) {
        clearTimeout(revalidateDebounceRef.current);
      }
      formEl.removeEventListener("input", scheduleRevalidate);
      formEl.removeEventListener("change", scheduleRevalidate);
    };
  }, [
    hasAttemptedSubmit,
    runClientValidation,
    selectedService,
    selectedHearAboutUs,
    otherHearAboutUsText,
    socialMediaPlatform,
    referralName,
  ]);

  const resetServiceForms = () => {
    if (selectedService === "space-rental") {
      eventFormRef.current?.resetForm();
    } else if (selectedService === "childcare") {
      childCareFormRef.current?.resetForm();
    } else if (selectedService === "holiday-camps") {
      holidayCampFormRef.current?.resetForm();
    } else if (selectedService === "tutoring") {
      tutoringFormRef.current?.resetForm();
    } else if (selectedService === "homeschooling") {
      homeschoolingFormRef.current?.resetForm();
    } else if (selectedService === "kiddies-enrichment") {
      kiddiesEnrichmentFormRef.current?.resetForm();
    }
  };

  // Save form data to localStorage whenever form state changes
  const saveCurrentFormData = useCallback(() => {
    snapshotBookingForm({
      selectedService,
      selectedHearAboutUs,
      otherHearAboutUsText,
      socialMediaPlatform,
      referralName,
      priority,
      followUpRequired,
      isRepeatedCustomer,
      billingPeriodMonths,
    });
  }, [
    selectedService,
    selectedHearAboutUs,
    otherHearAboutUsText,
    socialMediaPlatform,
    referralName,
    priority,
    followUpRequired,
    isRepeatedCustomer,
    billingPeriodMonths,
  ]);

  // Auto-save while the parent fills out the form (after storage hydration)
  useEffect(() => {
    if (!storageHydrated) return;

    const form = document.getElementById("booking-form");
    if (!form) return;

    let timer: ReturnType<typeof setTimeout>;
    const scheduleSave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveCurrentFormData(), 800);
    };

    form.addEventListener("input", scheduleSave, true);
    form.addEventListener("change", scheduleSave, true);

    const handleBeforeUnload = () => saveCurrentFormData();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      form.removeEventListener("input", scheduleSave, true);
      form.removeEventListener("change", scheduleSave, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(timer);
    };
  }, [saveCurrentFormData, selectedService, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    saveCurrentFormData();
  }, [saveCurrentFormData, storageHydrated]);

  // Wrapper function to handle form reset after submission
  const handleFormSubmit = async (formData: FormData) => {
    setSubmitFeedback(null);
    setHasAttemptedSubmit(false);

    const validation = runClientValidation();

    if (!validation.ok) {
      showValidationFailure(
        validation.errors,
        validation.firstInvalidElement,
        validation.scrollTargetId,
      );
      return;
    }

    if (selectedService === "holiday-camps") {
      const boardingCheck =
        await holidayCampFormRef.current?.confirmBoardingFromDb();
      if (boardingCheck && !boardingCheck.ok) {
        showValidationFailure([
          boardingCheck.error ||
            "Boarding is no longer available. Please update your selections.",
        ]);
        return;
      }
    }

    // Save form data before submission in case of auth redirect
    const persistenceData = extractFormDataForPersistence(formData, {
      selectedService,
      selectedHearAboutUs,
      otherHearAboutUsText,
      socialMediaPlatform,
      referralName,
      priority,
      followUpRequired,
      isRepeatedCustomer,
      billingPeriodMonths,
    });
    saveFormData({ ...persistenceData, pendingAuthSubmit: true });

    setIsSubmitting(true);
    toast.loading("Creating your booking...", { id: "booking-submit" });

    try {
      const bookingResult = await submitAction(formData);

      if (!bookingResult.success) {
        toast.dismiss("booking-submit");
        setSubmitFeedback({
          type: "error",
          title: "Booking could not be created",
          messages: ["Something went wrong while saving your booking. Please try again."],
        });
        return;
      }

      toast.dismiss("booking-submit");
      toast.success(
        bookingResult.paymentDueDate
          ? formatPaymentDueToastMessage(bookingResult.paymentDueDate)
          : "Booking confirmed. Pay anytime from Profile → Payments.",
        { duration: 5000 },
      );

      clearFormData();
      clearRebookTemplate();
      resetServiceForms();
      setPersistedFormTemplate(null);

      setSelectedHearAboutUs("");
      setOtherHearAboutUsText("");
      setPriority("normal");
      setFollowUpRequired(false);
      setIsRepeatedCustomer(false);
      setTotalAmount(0);
      setBillingPeriodMonths(1);

      window.location.href = "/profile?tab=bookings&booked=1";
    } catch (error: unknown) {
      toast.dismiss("booking-submit");

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorDigest =
        typeof error === "object" && error !== null && "digest" in error
          ? String((error as { digest: unknown }).digest)
          : "";

      if (
        errorMessage.includes("NEXT_REDIRECT") ||
        errorDigest.includes("NEXT_REDIRECT")
      ) {
        toast.success("Please sign in to complete your booking");
        setSubmitFeedback({
          type: "info",
          title: "Sign in required",
          messages: [
            "Please sign in to complete your booking.",
            "Your form details have been saved and will be restored after sign-in.",
          ],
        });
        return;
      }

      console.error("Booking/Payment error:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to process booking. Please try again.";
      toast.error(message);
      setSubmitFeedback({
        type: "error",
        title: "Booking failed",
        messages: [message],
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const loadRebookTemplate = async () => {
      const persisted = getRebookTemplate();
      const sourceId = rebookParam || persisted?.sourceBookingId;
      if (!sourceId) return;

      try {
        const response = await fetch(
          `/api/bookings/${sourceId}/rebook-template`,
        );
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "Could not load re-book template");
          return;
        }

        setRebookTemplate(data.formEntries);
        setRebookSourceId(sourceId);
        setRebookMonthLabel(data.targetMonthLabel || "");
        setSelectedService(data.serviceType || urlService || "");
        setIsRepeatedCustomer(true);

        if (data.template?.source) {
          setSelectedHearAboutUs(data.template.source);
        }

        setTimeout(() => {
          restoreFormDataToElements({
            selectedService: data.serviceType,
            selectedHearAboutUs: data.template?.source || "",
            otherHearAboutUsText: "",
            socialMediaPlatform: "",
            referralName: "",
            priority: "normal",
            followUpRequired: false,
            isRepeatedCustomer: true,
            timestamp: Date.now(),
            serviceFormData: data.formEntries,
          });
        }, 350);

        toast.success(
          `Form pre-filled for ${data.targetMonthLabel}. Review and submit when ready.`,
          { duration: 3000 },
        );
      } catch (error) {
        console.error("Failed to load rebook template:", error);
        toast.error("Failed to load re-book data");
      }
    };

    loadRebookTemplate();
  }, [rebookParam, urlService]);

  useEffect(() => {
    if (!selectedService) {
      setRepeatBooking(null);
      return;
    }

    const findRepeatable = async () => {
      try {
        const response = await fetch("/api/bookings");
        if (!response.ok) return;
        const data = await response.json();
        const match = (data.bookings || []).find(
          (b: {
            _id: string;
            serviceType: string;
            children: Array<{ name: string }>;
            status: string;
            payment: { status: string };
          }) =>
            b.serviceType === selectedService && isRebookEligibleBooking(b),
        );
        if (match) {
          setRepeatBooking({
            id: match._id,
            childrenSummary: match.children
              .map((c: { name: string }) => c.name)
              .join(", "),
          });
        } else {
          setRepeatBooking(null);
        }
      } catch {
        setRepeatBooking(null);
      }
    };

    findRepeatable();
  }, [selectedService]);

  const openQuickRebook = async (bookingId: string) => {
    toast.loading("Preparing re-book...", { id: "rebook-quick" });
    try {
      const res = await fetch(`/api/bookings/${bookingId}/rebook`, {
        method: "POST",
      });
      const data = await res.json();
      toast.dismiss("rebook-quick");
      if (!res.ok || !data.success) {
        toast.error(data.error || "Re-book failed");
        return;
      }
      toast.success(
        data.paymentDueDate
          ? formatPaymentDueToastMessage(data.paymentDueDate, "Re-book confirmed")
          : "Re-book confirmed. Pay from Profile → Payments.",
        { duration: 5000 },
      );
      window.location.href = "/profile?tab=bookings&rebooked=1";
    } catch (error) {
      console.error(error);
      toast.dismiss("rebook-quick");
      toast.error("Re-book failed");
    }
  };

  const openEditRebook = async (bookingId: string, serviceType: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/rebook-template`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not prepare re-book");
        return;
      }
      saveRebookTemplate({
        sourceBookingId: bookingId,
        selectedService: serviceType,
        formEntries: data.formEntries,
        targetMonthLabel: data.targetMonthLabel,
      });
      window.location.href = `/booking?service=${serviceType}&rebook=${bookingId}`;
    } catch {
      toast.error("Could not prepare re-book");
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextService = e.target.value;
    setSelectedService(nextService);
    if (nextService !== "holiday-camps") {
      setTotalAmount(0);
    }
    saveCurrentFormData();
  };

  const handleHearAboutUsChange = (value: string) => {
    setSelectedHearAboutUs(value);
    // Clear related fields when switching options
    if (value !== "other") {
      setOtherHearAboutUsText("");
    }
    if (value !== "socialMedia") {
      setSocialMediaPlatform("");
    }
    if (value !== "referral") {
      setReferralName("");
    }
    saveCurrentFormData();
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherHearAboutUsText(e.target.value);
    saveCurrentFormData();
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSocialMediaPlatform(e.target.value);
    saveCurrentFormData();
  };

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralName(e.target.value);
    saveCurrentFormData();
  };

  const isHearAboutUsSelected = (value: string) => {
    return selectedHearAboutUs === value;
  };

  const renderFormContent = () => {
    if (selectedService === "space-rental") {
      return (
        <EventBookingForm
          key={serviceFormKey}
          ref={eventFormRef}
          initialTemplate={serviceFormTemplate}
        />
      );
    } else if (selectedService === "childcare") {
      return (
        <ChildCareSpecificBookingForm
          key={serviceFormKey}
          ref={childCareFormRef}
          initialTemplate={serviceFormTemplate}
          billingPeriodMonths={billingPeriodMonths}
          onBillingPeriodMonthsChange={setBillingPeriodMonths}
        />
      );
    } else if (selectedService === "holiday-camps") {
      return (
        <HolidayCampForm
          key={serviceFormKey}
          ref={holidayCampFormRef}
          campSeasonId={campSeasonId}
          onTotalChange={setTotalAmount}
          initialTemplate={serviceFormTemplate}
        />
      );
    } else if (selectedService === "homeschooling") {
      return (
        <HomeschoolingForm
          key={serviceFormKey}
          ref={homeschoolingFormRef}
          initialTemplate={serviceFormTemplate}
        />
      );
    } else if (selectedService === "kiddies-enrichment") {
      return (
        <KiddiesEnrichmentForm
          key={serviceFormKey}
          ref={kiddiesEnrichmentFormRef}
          initialTemplate={serviceFormTemplate}
          billingPeriodMonths={billingPeriodMonths}
          onBillingPeriodMonthsChange={setBillingPeriodMonths}
        />
      );
    } else if (selectedService === "tutoring") {
      return (
        <TutoringForm
          key={serviceFormKey}
          ref={tutoringFormRef}
          initialTemplate={serviceFormTemplate}
          billingPeriodMonths={billingPeriodMonths}
          onBillingPeriodMonthsChange={setBillingPeriodMonths}
        />
      );
    } else {
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm p-12 text-center">
          <p className="text-base-content/70 text-base">
            Please select a service to continue with booking.
          </p>
        </div>
      );
    }
  };

  return (
    <BookingProfileProvider>
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className=" mb-8 p-8 sm:p-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-3">
            Book Our Services
          </h1>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto">
            Choose your service and provide the necessary details for your
            booking
          </p>
        </div>

        <Form
          id="booking-form"
          noValidate
          action={handleFormSubmit}
          className="space-y-8"
        >
          {servicesLoadFailed && services.length === 0 && (
            <div className="alert alert-error">
              <span>
                Services could not be loaded. Please refresh the page before
                booking.
              </span>
            </div>
          )}
          <input
            type="hidden"
            name="billingPeriodMonths"
            value={billingPeriodMonths}
          />
          {!session?.user && (
            <div className="alert alert-info">
              <span>
                You can fill out this form without signing in. You&apos;ll be
                asked to sign in when you submit — your answers are saved
                automatically and restored after login.
              </span>
            </div>
          )}
          {rebookMonthLabel && (
            <div className="alert alert-info">
              <span>
                Re-booking for <strong>{rebookMonthLabel}</strong>. Dates and
                details are pre-filled — review before paying. Promo codes
                require applying on this form (not copied from quick re-book).
              </span>
            </div>
          )}

          {repeatBooking && !rebookSourceId && (
            <div className="bg-[#90AC19]/10 border border-[#90AC19]/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-800">
                Repeat your last booking ({repeatBooking.childrenSummary}) for
                next month.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openQuickRebook(repeatBooking.id)}
                >
                  Re-book next month
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    openEditRebook(repeatBooking.id, selectedService)
                  }
                >
                  Edit &amp; re-book
                </button>
              </div>
            </div>
          )}

          {/* Service Selection */}
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-base-content mb-6">
              Select Your Service
            </h2>

            {/* Mobile Dropdown */}
            <div className="block md:hidden">
              <select
                name="serviceType"
                value={selectedService}
                onChange={(e) => {
                  const nextService = e.target.value;
                  setSelectedService(nextService);
                  if (nextService !== "holiday-camps") {
                    setTotalAmount(0);
                  }
                  saveCurrentFormData();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
                required
                disabled={isLoadingServices}
              >
                <option value="">
                  {isLoadingServices ? "Loading services..." : "Select a service..."}
                </option>
                {services.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop/Tablet Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {!isLoadingServices && services.length === 0 && (
                <p className="col-span-full text-sm text-gray-500">
                  No services are currently available for booking.
                </p>
              )}
              {services.map((service) => {
                return (
                  <label
                    key={service.value}
                    className={`
                        cursor-pointer p-4 sm:p-5 rounded-lg border transition-all duration-200
                        ${
                          selectedService === service.value
                            ? "border-[#90AC19] bg-[#90AC19]/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.value}
                      checked={selectedService === service.value}
                      onChange={handleServiceChange}
                      className="sr-only"
                      required
                    />
                    <div className="text-center">
                      <h3
                        className={`font-semibold text-sm sm:text-base ${
                          selectedService === service.value
                            ? "text-[#90AC19]"
                            : "text-gray-700"
                        }`}
                      >
                        {service.label}
                      </h3>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dynamic Forms Based on Selected Service */}
          {renderFormContent()}

          {/* Additional Booking Information */}
          {selectedService && (
            <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-6">
                Additional Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Priority Level */}
                <div className="form-control">
                  <label className="block mb-2">
                    <span className="text-sm font-medium text-gray-900 block mb-1">
                      Priority Level
                    </span>
                    <span className="text-xs text-gray-500">
                      How urgent is this booking?
                    </span>
                  </label>
                  <select
                    name="priority"
                    value={priority}
                    onChange={(e) => {
                      setPriority(
                        e.target.value as "low" | "normal" | "high" | "urgent",
                      );
                      saveCurrentFormData();
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
                  >
                    <option value="low">Low - Flexible timing</option>
                    <option value="normal">Normal - Standard priority</option>
                    <option value="high">High - Preferred soon</option>
                    <option value="urgent">Urgent - ASAP</option>
                  </select>
                </div>

                {/* Customer Type */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="isRepeatedCustomer"
                    checked={isRepeatedCustomer}
                    onChange={(e) => {
                      setIsRepeatedCustomer(e.target.checked);
                      saveCurrentFormData();
                    }}
                    className="mt-0.5 w-4 h-4 text-[#90AC19] border-gray-300 rounded focus:ring-[#90AC19]"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block">
                      Returning Customer?
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Check if you&apos;ve used our services before
                    </div>
                  </div>
                </div>

                {/* Follow-up Required */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={followUpRequired}
                    onChange={(e) => {
                      setFollowUpRequired(e.target.checked);
                      saveCurrentFormData();
                    }}
                    className="mt-0.5 w-4 h-4 text-[#90AC19] border-gray-300 rounded focus:ring-[#90AC19]"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block">
                      Request Follow-up Contact
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      We&apos;ll call you to confirm details
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How did you hear about us Selection */}
          <div
            id="hear-about-us-section"
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              How did you hear about us? <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-base-content/70 mb-6">
              Choose one option below.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {HearAboutUs.map((option) => (
                <label
                  key={option.value}
                  className={`
                    cursor-pointer p-4 rounded-lg border transition-all duration-200 text-center
                    ${
                      isHearAboutUsSelected(option.value)
                        ? "border-[#90AC19] bg-[#90AC19]/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={isHearAboutUsSelected(option.value)}
                    onChange={() => handleHearAboutUsChange(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm font-medium ${
                      isHearAboutUsSelected(option.value)
                        ? "text-[#90AC19]"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Show textarea when "Other" is selected */}
            {selectedHearAboutUs === "other" && (
              <div className="mt-6">
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Please specify <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="referralSource"
                  value={otherHearAboutUsText}
                  onChange={handleOtherTextChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 resize-none"
                  placeholder="Please tell us how you heard about us..."
                  rows={4}
                />
              </div>
            )}

            {/* Show dropdown when "Social Media" is selected */}
            {selectedHearAboutUs === "socialMedia" && (
              <div className="mt-6">
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Which social media platform?{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  name="socialMediaPlatform"
                  value={socialMediaPlatform}
                  onChange={handleSocialMediaChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">
                    Select platform...
                  </option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Show input when "Referral" is selected */}
            {selectedHearAboutUs === "referral" && (
              <div className="mt-6">
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Who referred you? <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="referralName"
                  value={referralName}
                  onChange={handleReferralChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900"
                  placeholder="Enter the name of the person who referred you..."
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            {submitFeedback && (
              <div
                role="alert"
                className={`mb-4 rounded-lg border p-4 ${
                  submitFeedback.type === "error"
                    ? "border-red-200 bg-red-50 text-red-900"
                    : submitFeedback.type === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-950"
                      : "border-blue-200 bg-blue-50 text-blue-950"
                }`}
              >
                {submitFeedback.title && (
                  <p className="font-semibold mb-2">{submitFeedback.title}</p>
                )}
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {submitFeedback.messages.map((message, index) => (
                    <li key={`${index}-${message}`}>{message}</li>
                  ))}
                </ul>
                {submitFeedback.bookingId && (
                  <p className="mt-3 text-sm">
                    <Link
                      href="/profile?tab=payments"
                      className="font-semibold underline"
                    >
                      Go to Profile → Payments
                    </Link>
                  </p>
                )}
              </div>
            )}

            <button
              ref={submitButtonRef}
              type="submit"
              disabled={isSubmitting || (servicesLoadFailed && services.length === 0)}
              aria-busy={isSubmitting}
              className="w-full bg-[#90AC19] hover:bg-[#7a9315] disabled:opacity-60 disabled:cursor-not-allowed tracking-wider text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-xl md:text-2xl flex items-center justify-center gap-3"
            >
              {isSubmitting && (
                <span className="loading loading-spinner loading-md" />
              )}
              {getSubmitButtonLabel(totalAmount, billingPeriodMonths)}
            </button>
            <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
              By registering, you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#90AC19] font-semibold hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#90AC19] font-semibold hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
    </BookingProfileProvider>
  );
}
