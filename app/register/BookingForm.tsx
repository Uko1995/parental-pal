"use client";

import { useState, useEffect } from "react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import EventBookingForm from "./EventBookingForm";
import ChildBookingForm from "./ChildBookingForm";
import ChildCareSpecificBookingForm from "./ChildCareSpecificBookingForm";
import TutoringForm from "./TutoringForm";

interface BookingFormProps {
  submitAction: (formData: FormData) => Promise<void>;
}

export default function BookingForm({ submitAction }: BookingFormProps) {
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const [selectedService, setSelectedService] = useState(urlService || "");

  // Update selected service when URL changes
  useEffect(() => {
    if (urlService) {
      setSelectedService(urlService);
    }
  }, [urlService]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };

  const renderFormContent = () => {
    if (selectedService === "space-rental") {
      return <EventBookingForm />;
    } else if (
      selectedService === "childcare" ||
      selectedService === "holiday-camps"
    ) {
      return <ChildCareSpecificBookingForm />;
    } else if (
      selectedService === "kiddies-enrichment" ||
      selectedService === "homeschooling"
    ) {
      return <ChildBookingForm />;
    } else if (selectedService === "tutoring") {
      return <TutoringForm />;
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

      <Form action={submitAction} className="p-8 space-y-6">
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
              <option value="childcare">Professional Childcare Services</option>
              <option value="homeschooling">
                Comprehensive Homeschooling Program
              </option>
              <option value="tutoring">Academic Tutoring Excellence</option>
              <option value="space-rental">Flexible Space Rentals</option>
              <option value="kiddies-enrichment">
                Kids Enrichment Session
              </option>
              <option value="holiday-camps">Exciting Holiday Camps</option>
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Dynamic Forms Based on Selected Service */}
        {renderFormContent()}

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
