"use client";

import { useState, useEffect, useRef } from "react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import EventBookingForm, { EventBookingFormRef } from "./EventBookingForm";
import ChildBookingForm from "./ChildBookingForm";
import ChildCareSpecificBookingForm, {
  ChildCareSpecificBookingFormRef,
} from "./ChildCareSpecificBookingForm";
import TutoringForm, { TutoringFormRef } from "./TutoringForm";
import HolidayCampForm, { HolidayCampFormRef } from "./HolidayCampForm";
import {
  saveFormData,
  getFormData,
  clearFormData,
  extractFormDataForPersistence,
  hasPersistedFormData,
  getPersistedValueWithFallback,
} from "@/lib/form-persistence";

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
  submitAction: (formData: FormData) => Promise<void>;
}

export default function BookingForm({ submitAction }: BookingFormProps) {
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const actionParam = searchParams.get("action");

  // State management
  const [selectedService, setSelectedService] = useState("");
  const [selectedHearAboutUs, setSelectedHearAboutUs] = useState("");
  const [otherHearAboutUsText, setOtherHearAboutUsText] = useState("");
  const [priority, setPriority] = useState<
    "low" | "normal" | "high" | "urgent"
  >("normal");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isRepeatedCustomer, setIsRepeatedCustomer] = useState(false);

  // Load persisted data on client side and scroll to top on initial load
  useEffect(() => {
    // Scroll to top when page loads (unless returning from auth)
    if (actionParam !== "submit") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setSelectedService(getPersistedValueWithFallback("selectedService", ""));
    setSelectedHearAboutUs(
      getPersistedValueWithFallback("selectedHearAboutUs", "")
    );
    setOtherHearAboutUsText(
      getPersistedValueWithFallback("otherHearAboutUsText", "")
    );
    setPriority(getPersistedValueWithFallback("priority", "normal"));
    setFollowUpRequired(
      getPersistedValueWithFallback("followUpRequired", false)
    );
    setIsRepeatedCustomer(
      getPersistedValueWithFallback("isRepeatedCustomer", false)
    );
  }, [actionParam]);

  // Refs for form components
  const eventFormRef = useRef<EventBookingFormRef>(null);
  const childCareFormRef = useRef<ChildCareSpecificBookingFormRef>(null);
  const tutoringFormRef = useRef<TutoringFormRef>(null);
  const holidayCampFormRef = useRef<HolidayCampFormRef>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Save form data to localStorage whenever form state changes
  const saveCurrentFormData = () => {
    saveFormData({
      selectedService,
      selectedHearAboutUs,
      otherHearAboutUsText,
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

    // Service-specific validation
    if (selectedService === "tutoring") {
      const validation = tutoringFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        return;
      }
    } else if (selectedService === "childcare") {
      const validation = childCareFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        return;
      }
    } else if (selectedService === "space-rental") {
      const validation = eventFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        return;
      }
    } else if (selectedService === "holiday-camps") {
      const validation = holidayCampFormRef.current?.validate();
      if (validation && !validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        return;
      }
    }

    const submitPromise = async () => {
      // Save form data before submission in case of auth redirect
      const persistenceData = extractFormDataForPersistence(formData, {
        selectedService,
        selectedHearAboutUs,
        otherHearAboutUsText,
        priority,
        followUpRequired,
        isRepeatedCustomer,
      });
      saveFormData(persistenceData);

      await submitAction(formData);

      // Clear persisted data after successful submission
      clearFormData();

      // Reset forms after successful submission
      if (selectedService === "space-rental") {
        eventFormRef.current?.resetForm();
      } else if (selectedService === "childcare") {
        childCareFormRef.current?.resetForm();
      } else if (selectedService === "holiday-camps") {
        holidayCampFormRef.current?.resetForm();
      } else if (selectedService === "tutoring") {
        tutoringFormRef.current?.resetForm();
      }

      // Reset main form states
      setSelectedHearAboutUs("");
      setOtherHearAboutUsText("");
      setPriority("normal");
      setFollowUpRequired(false);
      setIsRepeatedCustomer(false);

      // Scroll to top after successful submission
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Use toast.promise for loading, success, and error states
    toast.promise(submitPromise(), {
      loading: "Submitting your booking request...",
      success: "Booking submitted successfully! We'll get back to you soon.",
      error: "Failed to submit booking. Please try again.",
    });
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
    } else if (urlService) {
      // Normal URL service parameter update
      setSelectedService(urlService);
    }
  }, [urlService, actionParam]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedService(e.target.value);
    saveCurrentFormData();
  };

  const handleHearAboutUsChange = (value: string) => {
    setSelectedHearAboutUs(value);
    // Clear the other text if a different option is selected
    if (value !== "other") {
      setOtherHearAboutUsText("");
    }
    saveCurrentFormData();
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherHearAboutUsText(e.target.value);
    saveCurrentFormData();
  };

  const isHearAboutUsSelected = (value: string) => {
    return selectedHearAboutUs === value;
  };

  const renderFormContent = () => {
    if (selectedService === "space-rental") {
      return <EventBookingForm ref={eventFormRef} />;
    } else if (selectedService === "childcare") {
      return <ChildCareSpecificBookingForm ref={childCareFormRef} />;
    } else if (selectedService === "holiday-camps") {
      return <HolidayCampForm ref={holidayCampFormRef} />;
    } else if (
      selectedService === "kiddies-enrichment" ||
      selectedService === "homeschooling"
    ) {
      return <ChildBookingForm />;
    } else if (selectedService === "tutoring") {
      return <TutoringForm ref={tutoringFormRef} />;
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Please select a service to continue with booking.
          </p>
        </div>
      );
    }
  };

  const services = [
    {
      value: "childcare",
      label: "Childcare Services",
    },
    {
      value: "tutoring",
      label: "Academic Tutoring",
    },
    {
      value: "space-rental",
      label: "Event Space Rentals",
    },
    {
      value: "holiday-camps",
      label: "Holiday Camps",
    },
    {
      value: "homeschooling",
      label: "Homeschooling Program",
    },
    {
      value: "kiddies-enrichment",
      label: "Kids Enrichment",
    },
  ];

  return (
    <div className="bg-base-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card bg-linear-to-r from-primary to-secondary text-primary-content shadow-2xl mb-8">
          <div className="card-body text-center">
            <h1 className="card-title text-3xl font-bold justify-center mb-2">
              Book Our Services
            </h1>
            <p className="text-lg opacity-90">
              Choose your service and provide the necessary details for your
              booking
            </p>
          </div>
        </div>

        <Form action={handleFormSubmit} className="space-y-8">
          {/* Service Selection */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center  mb-6">
                Select Your Service
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => {
                  return (
                    <label
                      key={service.value}
                      className={`
                        cursor-pointer p-2 rounded-xs border transition-all duration-300 hover:shadow-lg
                        ${
                          selectedService === service.value
                            ? " shadow-lg"
                            : "border-base-300 hover:border-base-300/50"
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
                          className={`font-semibold text-base mb-2 ${
                            selectedService === service.value
                              ? ""
                              : "text-base-content"
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
          </div>

          {/* Dynamic Forms Based on Selected Service */}
          {renderFormContent()}

          {/* Additional Booking Information */}
          {selectedService && (
            <div className="card bg-base-100 shadow-lg ">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center mb-6">
                  Additional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Priority Level */}
                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text font-medium">
                        Priority Level
                      </span>
                      <span className="label-text-alt text-xs">
                        How urgent is this booking?
                      </span>
                    </label>
                    <select
                      name="priority"
                      value={priority}
                      onChange={(e) => {
                        setPriority(
                          e.target.value as "low" | "normal" | "high" | "urgent"
                        );
                        saveCurrentFormData();
                      }}
                      className="select select-bordered "
                    >
                      <option value="low">Low - Flexible timing</option>
                      <option value="normal">Normal - Standard priority</option>
                      <option value="high">High - Preferred soon</option>
                      <option value="urgent">Urgent - ASAP</option>
                    </select>
                  </div>

                  {/* Customer Type */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="isRepeatedCustomer"
                        checked={isRepeatedCustomer}
                        onChange={(e) => {
                          setIsRepeatedCustomer(e.target.checked);
                          saveCurrentFormData();
                        }}
                        className="checkbox"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Returning Customer?
                        </span>
                        <div className="text-xs text-base-content/70">
                          Check if you&apos;ve used our services before
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Follow-up Required */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="followUpRequired"
                        checked={followUpRequired}
                        onChange={(e) => {
                          setFollowUpRequired(e.target.checked);
                          saveCurrentFormData();
                        }}
                        className="checkbox"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Request Follow-up Contact
                        </span>
                        <div className="text-xs text-base-content/70">
                          We&apos;ll call you to confirm details
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How did you hear about us Selection */}
          <div className="card bg-base-100 shadow-lg ">
            <div className="card-body">
              <h2 className="card-title text-xl flex items-center  mb-6">
                How did you hear about us? *
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HearAboutUs.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 text-center
                      ${
                        isHearAboutUsSelected(option.value)
                          ? " "
                          : "border-base-300 "
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
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Show textarea when "Other" is selected */}
              {selectedHearAboutUs === "other" && (
                <div className="mt-6">
                  <div className="form-control flex flex-col gap-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Please specify *
                      </span>
                    </label>
                    <textarea
                      name="referralSource"
                      value={otherHearAboutUsText}
                      onChange={handleOtherTextChange}
                      className="textarea w-full textarea-bordered  h-24"
                      placeholder="Please tell us how you heard about us..."
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="card bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg">
            <div className="card-body text-center">
              <button
                ref={submitButtonRef}
                type="submit"
                className="btn btn-lg btn-ghost text-white border-white/30 hover:bg-white/20 hover:border-white/50 w-full transition-all duration-300"
              >
                Complete Registration & Continue to Payment
              </button>
              <p className="text-sm opacity-80 mt-2">
                By registering, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
