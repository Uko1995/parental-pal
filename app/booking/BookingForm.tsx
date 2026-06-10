"use client";

import { useState, useEffect, useRef } from "react";
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
  hasPersistedFormData,
  getPersistedValueWithFallback,
  restoreFormDataToElements,
} from "@/lib/form-persistence";
import {
  getRebookTemplate,
  clearRebookTemplate,
  saveRebookTemplate,
} from "@/lib/rebook-persistence";
import { initializeBookingPayment } from "@/lib/booking-payment";
import { isRebookEligibleBooking } from "@/lib/booking-rebook-eligibility";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import Link from "next/link";
import { resolveCampSeasonId, type CampSeasonId } from "@/lib/camp-seasons";
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
  }>;
}

interface BookingServiceOption {
  value: string;
  label: string;
}

export default function BookingForm({ submitAction }: BookingFormProps) {
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const campParam = searchParams.get("camp");
  const rebookParam = searchParams.get("rebook");
  const actionParam = searchParams.get("action");

  const campSeasonId: CampSeasonId = resolveCampSeasonId(campParam);

  // State management
  const [selectedService, setSelectedService] = useState("");
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
  const [services, setServices] = useState<BookingServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [rebookTemplate, setRebookTemplate] =
    useState<RebookFormEntries | null>(null);
  const [rebookSourceId, setRebookSourceId] = useState<string | null>(null);
  const [rebookMonthLabel, setRebookMonthLabel] = useState("");
  const [repeatBooking, setRepeatBooking] = useState<{
    id: string;
    childrenSummary: string;
  } | null>(null);

  // Load persisted data on client side and scroll to top on initial load
  useEffect(() => {
    // Scroll to top when page loads (unless returning from auth)
    if (actionParam !== "submit") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setSelectedService(getPersistedValueWithFallback("selectedService", ""));
    setSelectedHearAboutUs(
      getPersistedValueWithFallback("selectedHearAboutUs", ""),
    );
    setOtherHearAboutUsText(
      getPersistedValueWithFallback("otherHearAboutUsText", ""),
    );
    setSocialMediaPlatform(
      getPersistedValueWithFallback("socialMediaPlatform", ""),
    );
    setReferralName(getPersistedValueWithFallback("referralName", ""));
    setPriority(getPersistedValueWithFallback("priority", "normal"));
    setFollowUpRequired(
      getPersistedValueWithFallback("followUpRequired", false),
    );
    setIsRepeatedCustomer(
      getPersistedValueWithFallback("isRepeatedCustomer", false),
    );
  }, [actionParam]);

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
      } catch (error) {
        console.error("Error loading booking services:", error);
        toast.error("Unable to load services right now");
        setServices([]);
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

  // Save form data to localStorage whenever form state changes
  const saveCurrentFormData = () => {
    saveFormData({
      selectedService,
      selectedHearAboutUs,
      otherHearAboutUsText,
      socialMediaPlatform,
      referralName,
      priority,
      followUpRequired,
      isRepeatedCustomer,
    });
  };

  // Wrapper function to handle form reset after submission
  const handleFormSubmit = async (formData: FormData) => {
    // Client-side validation
    if (!selectedService) {
      toast.error("Please select a service before submitting");
      return;
    }

    if (!selectedHearAboutUs) {
      toast.error("Please let us know how you heard about us");
      return;
    }

    if (selectedHearAboutUs === "other" && !otherHearAboutUsText.trim()) {
      toast.error("Please specify how you heard about us");
      return;
    }

    if (selectedHearAboutUs === "socialMedia" && !socialMediaPlatform.trim()) {
      toast.error("Please specify which social media platform");
      return;
    }

    if (selectedHearAboutUs === "referral" && !referralName.trim()) {
      toast.error("Please specify who referred you");
      return;
    }

    // Service-specific validation
    if (selectedService === "tutoring") {
      const validation = tutoringFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
    } else if (selectedService === "childcare") {
      const validation = childCareFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
    } else if (selectedService === "space-rental") {
      const validation = eventFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
    } else if (selectedService === "holiday-camps") {
      const validation = holidayCampFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
    } else if (selectedService === "homeschooling") {
      const validation = homeschoolingFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
    } else if (selectedService === "kiddies-enrichment") {
      const validation = kiddiesEnrichmentFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]);
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
    });
    saveFormData(persistenceData);

    // Show loading state immediately
    toast.loading("Creating your booking...", { id: "booking-submit" });

    try {
      // 1. Submit booking and get booking data
      const bookingResult = await submitAction(formData);

      // Update progress
      toast.loading("Initializing payment...", { id: "booking-submit" });

      // Check if this is an auth redirect (the action will throw/redirect before returning)
      // If we got here, user is authenticated
      if (!bookingResult.success) {
        toast.dismiss("booking-submit");
        toast.error("Booking creation failed");
        return;
      }

      const paid = await initializeBookingPayment(
        {
          bookingId: bookingResult.bookingId!,
          userId: bookingResult.userId,
          amount: bookingResult.amount || 0,
          currency: bookingResult.currency,
          email: bookingResult.email,
        },
        { toastId: "booking-submit" },
      );

      if (!paid) return;

      clearFormData();
      clearRebookTemplate();

      // Reset forms after successful submission
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

      // Reset main form states
      setSelectedHearAboutUs("");
      setOtherHearAboutUsText("");
      setPriority("normal");
      setFollowUpRequired(false);
      setIsRepeatedCustomer(false);
      setTotalAmount(0);

    } catch (error: unknown) {
      toast.dismiss("booking-submit");

      // Check if this is a redirect error (NEXT_REDIRECT)
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
        // This is a redirect to sign in - show appropriate message
        toast.success("Please sign in to complete your booking");
        // The redirect will happen automatically, form data is already saved
        return;
      }

      console.error("Booking/Payment error:", error);
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Failed to process booking. Please try again.",
      );
    }
  };

  // Handle form data restoration and focus management after auth redirect
  useEffect(() => {
    // Check if we're returning from auth with action=submit
    if (actionParam === "submit" && hasPersistedFormData()) {
      // Restore form data from persistence
      const persistedData = getFormData();
      if (persistedData) {
        // Restore form fields that aren't already set by URL
        if (!urlService && persistedData.selectedService) {
          setSelectedService(persistedData.selectedService);
        }
        if (persistedData.selectedHearAboutUs) {
          setSelectedHearAboutUs(persistedData.selectedHearAboutUs);
        }
        if (persistedData.otherHearAboutUsText) {
          setOtherHearAboutUsText(persistedData.otherHearAboutUsText);
        }
        if (persistedData.priority) {
          setPriority(persistedData.priority);
        }
        setFollowUpRequired(persistedData.followUpRequired || false);
        setIsRepeatedCustomer(persistedData.isRepeatedCustomer || false);

        // Restore service-specific form fields
        setTimeout(() => {
          // Use the restoreFormDataToElements utility to restore all form fields
          if (persistedData.serviceFormData) {
            restoreFormDataToElements(persistedData);
          }
        }, 300); // Increased delay to ensure DOM is fully ready

        // Show success toast to inform user their data was preserved
        toast.success(
          "Your form data has been restored. Please review and submit.",
          { duration: 5000 },
        );

        // First scroll to top, then scroll to submit button after delay
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          submitButtonRef.current?.focus();
          submitButtonRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 800); // Increased delay to allow top scroll to complete first
      }
    } else if (urlService || campParam === "holidays-that-rock-2026") {
      setSelectedService(urlService || "holiday-camps");
    }
  }, [urlService, campParam, actionParam]);

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
          { duration: 5000 },
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
      toast.loading("Initializing payment...", { id: "rebook-quick" });
      await initializeBookingPayment(
        {
          bookingId: data.bookingId,
          userId: data.userId,
          amount: data.amount,
          currency: data.currency,
          email: data.email,
        },
        { toastId: "rebook-quick" },
      );
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
          ref={eventFormRef}
          initialTemplate={rebookTemplate}
        />
      );
    } else if (selectedService === "childcare") {
      return (
        <ChildCareSpecificBookingForm
          ref={childCareFormRef}
          initialTemplate={rebookTemplate}
        />
      );
    } else if (selectedService === "holiday-camps") {
      return (
        <HolidayCampForm
          ref={holidayCampFormRef}
          campSeasonId={campSeasonId}
          onTotalChange={setTotalAmount}
          initialTemplate={rebookTemplate}
        />
      );
    } else if (selectedService === "homeschooling") {
      return (
        <HomeschoolingForm
          ref={homeschoolingFormRef}
          initialTemplate={rebookTemplate}
        />
      );
    } else if (selectedService === "kiddies-enrichment") {
      return (
        <KiddiesEnrichmentForm
          ref={kiddiesEnrichmentFormRef}
          initialTemplate={rebookTemplate}
        />
      );
    } else if (selectedService === "tutoring") {
      return (
        <TutoringForm
          ref={tutoringFormRef}
          initialTemplate={rebookTemplate}
        />
      );
    } else {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 text-base">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Book Our Services
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your service and provide the necessary details for your
            booking
          </p>
        </div>

        <Form action={handleFormSubmit} className="space-y-8">
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
              How did you hear about us? <span className="text-red-500">*</span>
            </h2>

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
                    required
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
                  required
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
                  required
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
                  required
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <button
              ref={submitButtonRef}
              type="submit"
              className="w-full bg-[#90AC19] hover:bg-[#7a9315] tracking-wider text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-xl md:text-2xl"
            >
              {totalAmount > 0
                ? `Pay ${" "} ₦${totalAmount.toLocaleString()}`
                : "Complete Booking & Continue to Payment"}
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
