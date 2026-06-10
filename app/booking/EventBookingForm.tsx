"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from "react";
import PaymentSchedule from "./PaymentSchedule";
import OptionalChild from "./OptionalChild";
import PhoneInput from "@/components/PhoneInput";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import { parseJsonField } from "@/lib/rebook-form-utils";
import {
  applyParentContactPrefill,
  type BookingChildPrefill,
} from "@/lib/booking-profile-prefill";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";

export interface EventBookingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ExtraService {
  service: "dj" | "mc" | "event-planning" | "extra-carers";
  quantity?: number;
  rate?: number;
}

interface EventBookingFormProps {
  initialTemplate?: RebookFormEntries | null;
}

const EventBookingForm = forwardRef<EventBookingFormRef, EventBookingFormProps>(
  ({ initialTemplate }, ref) => {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [profileChildren, setProfileChildren] = useState<BookingChildPrefill[]>(
    [],
  );

  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venueType, setVenueType] = useState<
    "indoor" | "outdoor" | "both" | ""
  >("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [carersQuantity, setCarersQuantity] = useState(0);
  const templateAppliedRef = useRef(false);

  useEffect(() => {
    if (!initialTemplate || templateAppliedRef.current) return;
    templateAppliedRef.current = true;

    if (initialTemplate.parentName) setParentName(initialTemplate.parentName);
    if (initialTemplate.parentEmail) setParentEmail(initialTemplate.parentEmail);
    if (initialTemplate.parentPhone) setParentPhone(initialTemplate.parentPhone);
    if (initialTemplate.eventType) setEventType(initialTemplate.eventType);
    if (initialTemplate.eventDate) setEventDate(initialTemplate.eventDate);
    if (initialTemplate.eventTime) setEventTime(initialTemplate.eventTime);
    if (initialTemplate.venueType) {
      setVenueType(
        initialTemplate.venueType as "indoor" | "outdoor" | "both" | "",
      );
    }
    if (initialTemplate.expectedGuests) {
      setExpectedGuests(initialTemplate.expectedGuests);
    }
    const extras = parseJsonField<ExtraService[]>(
      initialTemplate.extraServices,
      [],
    );
    if (extras.length > 0) {
      setExtraServices(extras);
      const carers = extras.find((s) => s.service === "extra-carers");
      if (carers?.quantity) setCarersQuantity(carers.quantity);
    }
  }, [initialTemplate]);

  const applyProfilePrefill = useCallback((profile: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    parentAddress: string;
    children: BookingChildPrefill[];
  }) => {
    applyParentContactPrefill(profile, {
      setParentName,
      setParentEmail,
      setParentPhone,
      setParentAddress: () => {},
    });
    if (profile.children.length > 0) {
      setProfileChildren(profile.children);
    }
  }, []);

  useBookingProfilePrefill({
    initialTemplate,
    templateAppliedRef,
    onApply: applyProfilePrefill,
  });

  const eventTypes = [
    "Birthday Party",
    "Wedding Reception",
    "Corporate Event",
    "Baby Shower",
    "Graduation Party",
    "Anniversary",
    "Holiday Party",
    "Community Event",
    "Other",
  ];

  const baseRates = {
    indoor: 350000,
    outdoor: 350000,
    both: 644000,
  };

  const serviceRates = {
    dj: 150000,
    mc: 60000,
    "event-planning": 150000,
    "extra-carers": 8000,
  };

  const handleServiceChange = (
    serviceName: "dj" | "mc" | "event-planning" | "extra-carers",
    isChecked: boolean
  ) => {
    if (isChecked) {
      setExtraServices((prev) => [
        ...prev,
        {
          service: serviceName,
          quantity: serviceName === "extra-carers" ? 1 : 1,
          rate: serviceRates[serviceName],
        },
      ]);
    } else {
      setExtraServices((prev) => prev.filter((s) => s.service !== serviceName));
      if (serviceName === "extra-carers") {
        setCarersQuantity(0);
      }
    }
  };

  const updateCarersQuantity = (newQuantity: number) => {
    setCarersQuantity(newQuantity);
    setExtraServices((prev) =>
      prev.map((service) =>
        service.service === "extra-carers"
          ? { ...service, quantity: newQuantity }
          : service
      )
    );
  };

  const resetForm = () => {
    setEventType("");
    setEventDate("");
    setEventTime("");
    setVenueType("");
    setExpectedGuests("");
    setExtraServices([]);
    setCarersQuantity(0);
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!eventType) {
      errors.push("Please select an event type");
    }

    if (!eventDate) {
      errors.push("Please select an event date");
    }

    if (!eventTime) {
      errors.push("Please specify event time");
    }

    if (!venueType) {
      errors.push("Please select a venue type");
    }

    if (!expectedGuests || parseInt(expectedGuests) <= 0) {
      errors.push("Please specify the number of expected guests");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  useImperativeHandle(ref, () => ({
    resetForm,
    validate,
  }));
  return (
    <div className="space-y-8">
      {/* General Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
          General Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Full Name <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="text"
              name="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Email Address <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="email"
              name="parentEmail"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
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
                Event Date <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="date"
              name="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              required
            />
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
          Child Information
        </h3>
        <OptionalChild initialChildren={profileChildren} />
      </div>

      {/* Event Details Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Event Type */}
          <div className="form-control flex flex-col mb-6">
            <label className="label">
              <span className="label-text font-medium flex text-gray-800 items-center gap-2">
                Event Type <span className="text-red-600">*</span>
              </span>
            </label>
            <select
              name="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="select select-bordered ps-2 "
              required
            >
              <option value="">Select event type</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Event Time */}
          <div className="form-control flex flex-col mb-6">
            <label className="label">
              <span className="label-text text-gray-800 font-medium flex items-center gap-2">
                Event Time <span className="text-red-600">*</span>
              </span>
            </label>
            <input
              type="text"
              name="eventTime"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              placeholder="e.g., 10:00 AM or 14:30"
              className="input input-bordered "
              required
            />
          </div>

          {/* Expected Guests */}
          <div className="form-control col-span-2 flex flex-col mb-6">
            <label className="label">
              <span className="label-text text-gray-800 font-medium flex items-center gap-2">
                Expected Number of Guests{" "}
                <span className="text-red-600">*</span>
              </span>
              <span className="label-text-alt text-gray-500 text-xs">
                Approximate number
              </span>
            </label>
            <input
              type="number"
              name="expectedGuests"
              value={expectedGuests}
              onChange={(e) => setExpectedGuests(e.target.value)}
              className="input input-bordered "
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>

          {/* Venue Type */}
          <div className="form-control col-span-2  flex flex-col mb-6">
            <label className="label">
              <span className="label-text font-medium text-gray-800 flex items-center gap-2">
                Venue Type <span className="text-red-600">*</span>
              </span>
              <span className="label-text-alt text-gray-500 text-xs">
                Choose your preferred venue setup
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                <input
                  type="radio"
                  name="venueType"
                  value="indoor"
                  checked={venueType === "indoor"}
                  onChange={(e) => setVenueType(e.target.value as "indoor")}
                  className="radio "
                />
                <div>
                  <div className="font-medium">Indoor Only</div>
                  <div className="text-sm text-base-content/70">
                    ₦{baseRates.indoor.toLocaleString()}
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                <input
                  type="radio"
                  name="venueType"
                  value="outdoor"
                  checked={venueType === "outdoor"}
                  onChange={(e) => setVenueType(e.target.value as "outdoor")}
                  className="radio "
                />
                <div>
                  <div className="font-medium">Outdoor Only</div>
                  <div className="text-sm text-base-content/70">
                    ₦{baseRates.outdoor.toLocaleString()}
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                <input
                  type="radio"
                  name="venueType"
                  value="both"
                  checked={venueType === "both"}
                  onChange={(e) => setVenueType(e.target.value as "both")}
                  className="radio"
                />
                <div>
                  <div className="font-medium">Both Indoor & Outdoor</div>
                  <div className="text-sm text-base-content/70">
                    ₦{baseRates.both.toLocaleString()}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Services Section */}
      <div className="card bg-base-100 shadow-lg border border-gray-200">
        <div className="card-body">
          <h3 className="card-title text-lg sm:text-xl flex items-center  mb-6">
            Additional Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DJ Service */}
            <div className="form-control flex flex-col">
              <label className="label cursor-pointer justify-start gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox "
                  checked={extraServices.some((s) => s.service === "dj")}
                  onChange={(e) => handleServiceChange("dj", e.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium text-base-content">
                    DJ Services
                  </div>
                  <div className="text-sm text-base-content">
                    Professional DJ with sound system
                  </div>
                  <div className="text-sm font-semibold ">
                    ₦{serviceRates.dj.toLocaleString()}
                  </div>
                </div>
              </label>
            </div>

            {/* MC Service */}
            <div className="form-control flex flex-col">
              <label className="label cursor-pointer justify-start gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox "
                  checked={extraServices.some((s) => s.service === "mc")}
                  onChange={(e) => handleServiceChange("mc", e.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium text-base-content">
                    MC (Master of Ceremonies)
                  </div>
                  <div className="text-sm text-base-content">
                    Professional event host
                  </div>
                  <div className="text-sm font-semibold ">
                    ₦{serviceRates.mc.toLocaleString()}
                  </div>
                </div>
              </label>
            </div>

            {/* Event Planning */}
            <div className="form-control flex flex-col">
              <label className="label cursor-pointer justify-start gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox "
                  checked={extraServices.some(
                    (s) => s.service === "event-planning"
                  )}
                  onChange={(e) =>
                    handleServiceChange("event-planning", e.target.checked)
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-base-content">
                    Event Planning
                  </div>
                  <div className="text-sm text-base-content">
                    Full event planning and coordination
                  </div>
                  <div className="text-sm font-semibold ">
                    ₦{serviceRates["event-planning"].toLocaleString()}
                  </div>
                </div>
              </label>
            </div>

            {/* Extra Carers */}
            <div className="form-control flex flex-col">
              <label className="label cursor-pointer justify-start gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox "
                  checked={extraServices.some(
                    (s) => s.service === "extra-carers"
                  )}
                  onChange={(e) =>
                    handleServiceChange("extra-carers", e.target.checked)
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-base-content">
                    Extra Carers
                  </div>
                  <div className="text-sm text-base-content">
                    Additional childcare staff
                  </div>
                  <div className="text-sm font-semibold ">
                    ₦{serviceRates["extra-carers"].toLocaleString()} each
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Carers Quantity Selector */}
          {extraServices.some((s) => s.service === "extra-carers") && (
            <div className="form-control mt-6">
              <label className="label">
                <span className="label-text font-medium">
                  Number of Extra Carers
                </span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="btn btn-circle btn-outline btn-sm"
                  onClick={() =>
                    carersQuantity > 0 &&
                    updateCarersQuantity(carersQuantity - 1)
                  }
                  disabled={carersQuantity <= 0}
                >
                  -
                </button>
                <span className="text-lg font-semibold min-w-8 text-center">
                  {carersQuantity}
                </span>
                <button
                  type="button"
                  className="btn btn-circle btn-outline  btn-sm"
                  onClick={() => updateCarersQuantity(carersQuantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <input
            type="hidden"
            name="extraServices"
            value={JSON.stringify(extraServices)}
          />
        </div>
      </div>

      {/* Payment Summary */}
      {venueType && (
        <div className="card bg-linear-to-r from-primary/5 to-secondary/5 shadow-lg border border-primary/20">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center text-primary mb-4">
              Payment Summary
            </h3>
            <PaymentSchedule
              event={true}
              eventMode={venueType}
              selectedServices={extraServices.map((service) => ({
                service: service.service,
                quantity: service.quantity || 1,
              }))}
              serviceCost={venueType ? baseRates[venueType] : 0}
            />
          </div>
        </div>
      )}
    </div>
  );
});

EventBookingForm.displayName = "EventBookingForm";

export default EventBookingForm;
