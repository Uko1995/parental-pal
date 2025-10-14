"use client";

import { useState, useEffect, useRef } from "react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import EventBookingForm, { EventBookingFormRef } from "./EventBookingForm";
import ChildBookingForm from "./ChildBookingForm";
import ChildCareSpecificBookingForm, {
  ChildCareSpecificBookingFormRef,
} from "./ChildCareSpecificBookingForm";
import TutoringForm, { TutoringFormRef } from "./TutoringForm";
import HolidayCampForm, { HolidayCampFormRef } from "./HolidayCampForm";

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
  const [selectedService, setSelectedService] = useState(urlService || "");
  const [selectedHearAboutUs, setSelectedHearAboutUs] = useState<string>("");
  const [otherHearAboutUsText, setOtherHearAboutUsText] = useState<string>("");
  const [priority, setPriority] = useState<
    "low" | "normal" | "high" | "urgent"
  >("normal");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isRepeatedCustomer, setIsRepeatedCustomer] = useState(false);

  // Refs for form components
  const eventFormRef = useRef<EventBookingFormRef>(null);
  const childCareFormRef = useRef<ChildCareSpecificBookingFormRef>(null);
  const tutoringFormRef = useRef<TutoringFormRef>(null);
  const holidayCampFormRef = useRef<HolidayCampFormRef>(null);

  // Wrapper function to handle form reset after submission
  const handleFormSubmit = async (formData: FormData) => {
    try {
      await submitAction(formData);

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
    } catch (error) {
      // Handle error - don't reset forms if submission failed
      console.error("Form submission failed:", error);
    }
  };

  // Update selected service when URL changes
  useEffect(() => {
    if (urlService) {
      setSelectedService(urlService);
    }
  }, [urlService]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedService(e.target.value);
  };

  const handleHearAboutUsChange = (value: string) => {
    setSelectedHearAboutUs(value);
    // Clear the other text if a different option is selected
    if (value !== "other") {
      setOtherHearAboutUsText("");
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherHearAboutUsText(e.target.value);
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
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-2xl mb-8">
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
                      onChange={(e) =>
                        setPriority(
                          e.target.value as "low" | "normal" | "high" | "urgent"
                        )
                      }
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
                        onChange={(e) =>
                          setIsRepeatedCustomer(e.target.checked)
                        }
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
                        onChange={(e) => setFollowUpRequired(e.target.checked)}
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
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg">
            <div className="card-body text-center">
              <button
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
