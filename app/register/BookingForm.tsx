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

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
            Please select a service to continue with registration.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#90AC19] to-[#7A9216] p-6">
        <h2 className="text-2xl font-semibold text-white">Registration Form</h2>
        <p className="text-white/90 mt-1">
          Please fill in all required information
        </p>
      </div>

      <Form action={handleFormSubmit} className="p-8 space-y-6">
        {/* Service Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-[#A25F97]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                clipRule="evenodd"
              />
            </svg>
            Service Selection
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Service *
            </label>
            <select
              name="service"
              value={selectedService}
              onChange={handleServiceChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300 bg-white"
              required
            >
              <option value="">Select a service</option>
              <option value="childcare">Childcare Services</option>
              <option value="tutoring">Academic Tutoring</option>
              <option value="space-rental">Space Rentals</option>
              <option value="homeschooling">Homeschooling Program</option>
              <option value="kiddies-enrichment">
                Kids Enrichment Session
              </option>
              <option value="holiday-camps">Holiday Camps</option>
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Dynamic Forms Based on Selected Service */}
        {renderFormContent()}

        {/* How did you hear about us Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How did you hear about Us *
          </label>
          <div className="flex flex-wrap gap-2">
            {HearAboutUs.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleHearAboutUsChange(option.value)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors duration-300 ${
                  isHearAboutUsSelected(option.value)
                    ? "bg-[#90AC19] border-[#90AC19] text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-[#90AC19] hover:text-[#90AC19]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Show textarea when "Other" is selected */}
          {selectedHearAboutUs === "other" && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify how you heard about us *
              </label>
              <textarea
                name="otherHearAboutUs"
                value={otherHearAboutUsText}
                onChange={handleOtherTextChange}
                placeholder="Please tell us how you heard about us..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300 resize-none"
                required
              />
            </div>
          )}

          {/* Hidden inputs for form submission */}
          <input
            type="hidden"
            name="hearAboutUs"
            value={selectedHearAboutUs}
            required
          />

          {/* Validation message */}
          {!selectedHearAboutUs && (
            <div className="mt-2">
              <p className="text-sm text-red-500">
                Please select how you heard about us
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full cursor-pointer bg-gradient-to-r from-[#90AC19] to-[#7A9216] hover:from-[#7A9216] hover:to-[#6B8014] text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Complete Registration and Continue to Payment
          </button>
          <p className="text-sm text-gray-500 text-center mt-3">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Form>
    </div>
  );
}
