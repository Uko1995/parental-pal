"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import PaymentSchedule from "./PaymentSchedule";
import OptionalChild from "./OptionalChild";

export interface EventBookingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ExtraService {
  service: "dj" | "mc" | "event-planning" | "extra-carers";
  quantity?: number;
  rate?: number;
}

const EventBookingForm = forwardRef<EventBookingFormRef>((props, ref) => {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venueType, setVenueType] = useState<
    "indoor" | "outdoor" | "both" | ""
  >("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [carersQuantity, setCarersQuantity] = useState(0);

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
      <div className="card bg-base-100 shadow-lg border border-primary/10">
        <div className="card-body">
          <h3 className="card-title text-xl text-primary mb-6">
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                name="parentName"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Email Address *
                </span>
              </label>
              <input
                type="email"
                name="parentEmail"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Phone Number *
                </span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                className="input input-bordered input-primary focus:input-primary"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Event Date *
                </span>
              </label>
              <input
                type="date"
                name="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input input-bordered input-primary focus:input-primary"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information Section */}
      <div className="card bg-base-100 shadow-lg border border-accent/10">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center text-accent mb-6">
            Child Information
          </h3>
          <OptionalChild />
        </div>
      </div>

      {/* Event Details Section */}
      <div className="card bg-base-100 shadow-lg border border-secondary/10">
        <div className="card-body ">
          <h3 className="card-title text-xl flex items-center text-secondary mb-6">
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Event Type */}
            <div className="form-control flex flex-col mb-6">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  Event Type *
                </span>
              </label>
              <select
                name="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="select select-bordered select-primary focus:select-primary"
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
                <span className="label-text font-medium flex items-center gap-2">
                  Event Time *
                </span>
              </label>
              <input
                type="time"
                name="eventTime"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="input input-bordered input-primary focus:input-primary"
                required
              />
            </div>
          </div>

          {/* Expected Guests */}
          <div className="form-control flex flex-col mb-6">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                Expected Number of Guests *
              </span>
              <span className="label-text-alt text-xs">Approximate number</span>
            </label>
            <input
              type="number"
              name="expectedGuests"
              value={expectedGuests}
              onChange={(e) => setExpectedGuests(e.target.value)}
              className="input input-bordered input-primary focus:input-primary"
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>

          {/* Venue Type */}
          <div className="form-control flex flex-col mb-6">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                Venue Type *
              </span>
              <span className="label-text-alt text-xs">
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
                  className="radio radio-primary"
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
                  className="radio radio-primary"
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
                  className="radio radio-primary"
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
      <div className="card bg-base-100 shadow-lg border border-accent/10">
        <div className="card-body">
          <h3 className="card-title text-xl flex items-center text-accent mb-6">
            Additional Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DJ Service */}
            <div className="form-control flex flex-col">
              <label className="label cursor-pointer justify-start gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={extraServices.some((s) => s.service === "dj")}
                  onChange={(e) => handleServiceChange("dj", e.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">DJ Services</div>
                  <div className="text-sm text-base-content/70">
                    Professional DJ with sound system
                  </div>
                  <div className="text-sm font-semibold text-primary">
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
                  className="checkbox checkbox-primary"
                  checked={extraServices.some((s) => s.service === "mc")}
                  onChange={(e) => handleServiceChange("mc", e.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">MC (Master of Ceremonies)</div>
                  <div className="text-sm text-base-content/70">
                    Professional event host
                  </div>
                  <div className="text-sm font-semibold text-primary">
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
                  className="checkbox checkbox-primary"
                  checked={extraServices.some(
                    (s) => s.service === "event-planning"
                  )}
                  onChange={(e) =>
                    handleServiceChange("event-planning", e.target.checked)
                  }
                />
                <div className="flex-1">
                  <div className="font-medium">Event Planning</div>
                  <div className="text-sm text-base-content/70">
                    Full event planning and coordination
                  </div>
                  <div className="text-sm font-semibold text-primary">
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
                  className="checkbox checkbox-primary"
                  checked={extraServices.some(
                    (s) => s.service === "extra-carers"
                  )}
                  onChange={(e) =>
                    handleServiceChange("extra-carers", e.target.checked)
                  }
                />
                <div className="flex-1">
                  <div className="font-medium">Extra Carers</div>
                  <div className="text-sm text-base-content/70">
                    Additional childcare staff
                  </div>
                  <div className="text-sm font-semibold text-primary">
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
                  className="btn btn-circle btn-outline btn-primary btn-sm"
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
                  className="btn btn-circle btn-outline btn-primary btn-sm"
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
