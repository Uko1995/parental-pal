"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import PaymentSchedule from "./PaymentSchedule";

export interface EventBookingFormRef {
  resetForm: () => void;
}

const EventBookingForm = forwardRef<EventBookingFormRef>((props, ref) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [carersQuantity, setCarersQuantity] = useState(1);
  const [eventMode, setEventMode] = useState<string>("");

  const handleServiceChange = (service: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedServices((prev) => [...prev, service]);
    } else {
      setSelectedServices((prev) => prev.filter((s) => s !== service));
      if (service === "carers") {
        setCarersQuantity(1); // Reset carers quantity when unchecked
      }
    }
  };

  // Create the final services array including carers with quantity
  const getServicesWithQuantity = () => {
    const services = [...selectedServices];

    // If carers is selected, replace it with carers object including quantity
    if (selectedServices.includes("carers")) {
      const servicesWithoutCarers = services.filter((s) => s !== "carers");
      return [
        ...servicesWithoutCarers,
        {
          service: "carers",
          quantity: carersQuantity,
        },
      ];
    }

    return services;
  };

  const updateCarersQuantity = (newQuantity: number) => {
    setCarersQuantity(newQuantity);
  };

  const handleEventModeChange = (mode: string) => {
    setEventMode(mode);
  };

  const resetForm = () => {
    setSelectedServices([]);
    setCarersQuantity(1);
    setEventMode("");
  };

  useImperativeHandle(ref, () => ({
    resetForm,
  }));
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-[#90AC19]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
        General Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of your Event *
          </label>
          <input
            type="date"
            name="eventDate"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Choose your event's date"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Event Mode *
        </label>
        <div className="flex items-center gap-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
          <label
            htmlFor="indoor"
            className="flex items-center cursor-pointer text-base font-medium text-gray-700 hover:text-[#90AC19] transition-colors duration-300"
          >
            <input
              type="radio"
              id="indoor"
              name="eventMode"
              value="indoor"
              checked={eventMode === "indoor"}
              onChange={(e) => handleEventModeChange(e.target.value)}
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="select-none">Indoor</span>
          </label>
          <label
            htmlFor="outdoor"
            className="flex items-center cursor-pointer text-base font-medium text-gray-700 hover:text-[#90AC19] transition-colors duration-300"
          >
            <input
              type="radio"
              id="outdoor"
              name="eventMode"
              value="outdoor"
              checked={eventMode === "outdoor"}
              onChange={(e) => handleEventModeChange(e.target.value)}
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="select-none">Outdoor</span>
          </label>
          <label
            htmlFor="indoorAndOutdoor"
            className="flex items-center cursor-pointer text-base font-medium text-gray-700 hover:text-[#90AC19] transition-colors duration-300"
          >
            <input
              type="radio"
              id="indoorAndOutdoor"
              name="eventMode"
              value="indoorAndOutdoor"
              checked={eventMode === "indoorAndOutdoor"}
              onChange={(e) => handleEventModeChange(e.target.value)}
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="select-none">Indoor & Outdoor</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of Event *
          </label>
          <input
            type="text"
            name="eventType"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Enter the type of event (e.g., Birthday, Meeting)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests *
          </label>
          <input
            type="number"
            name="numberOfGuests"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
            placeholder="Enter the expected number of guests"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Extra Services *
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* DJ Service */}
          <label className="flex justify-center items-center p-3 cursor-pointer">
            <input
              type="checkbox"
              value="dj"
              checked={selectedServices.includes("dj")}
              onChange={(e) => handleServiceChange("dj", e.target.checked)}
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 rounded focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="text-sm font-medium text-gray-700">
              DJ Service
            </span>
          </label>

          {/* Carers Service */}
          <div className="p-3 flex justify-center items-center cursor-pointer">
            <div className="flex justify-center items-center mb-3">
              <input
                type="checkbox"
                value="carers"
                id="carersService"
                checked={selectedServices.includes("carers")}
                onChange={(e) =>
                  handleServiceChange("carers", e.target.checked)
                }
                className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 rounded focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
              />
              <label
                htmlFor="carersService"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Carers
              </label>
            </div>
            <div className="flex justify-center items-center border border-gray-300 rounded-lg p-2 ms-2 space-x-2">
              <button
                type="button"
                onClick={() =>
                  updateCarersQuantity(Math.max(1, carersQuantity - 1))
                }
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold transition-colors duration-300 text-sm"
              >
                −
              </button>
              <input
                type="number"
                name="carersQuantity"
                min="1"
                max="10"
                value={carersQuantity}
                onChange={(e) =>
                  updateCarersQuantity(parseInt(e.target.value) || 1)
                }
                className="w-10 px-1 py-1 text-center text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#90AC19] focus:border-[#90AC19]"
              />
              <button
                type="button"
                onClick={() =>
                  updateCarersQuantity(Math.min(10, carersQuantity + 1))
                }
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold transition-colors duration-300 text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* MC Service */}
          <label className="flex justify-center items-center p-3 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              value="mc"
              checked={selectedServices.includes("mc")}
              onChange={(e) => handleServiceChange("mc", e.target.checked)}
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 rounded focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="text-sm font-medium text-gray-700">
              MC (Master of Ceremonies)
            </span>
          </label>

          {/* Event Planning Service */}
          <label className="flex justify-center items-center p-3 cursor-pointer">
            <input
              type="checkbox"
              value="eventPlanning"
              checked={selectedServices.includes("eventPlanning")}
              onChange={(e) =>
                handleServiceChange("eventPlanning", e.target.checked)
              }
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 rounded focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="text-sm font-medium text-gray-700">
              Event Planning
            </span>
          </label>
        </div>

        {/* Payment Schedule */}
        <PaymentSchedule
          event={true}
          eventMode={eventMode}
          selectedServices={getServicesWithQuantity()}
          serviceCost={0}
        />

        {/* Hidden inputs for form submission */}
        <input
          type="hidden"
          name="extraServices"
          value={JSON.stringify(getServicesWithQuantity())}
        />
      </div>
    </div>
  );
});

EventBookingForm.displayName = "EventBookingForm";

export default EventBookingForm;
