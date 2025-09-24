import React from "react";

function EventBookingForm() {
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
              className="w-4 h-4 text-[#90AC19] bg-gray-100 border-gray-300 focus:ring-[#90AC19] focus:ring-2 mr-3 accent-[#90AC19]"
            />
            <span className="select-none">Outdoor</span>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra Services *
        </label>
        <input
          type="text"
          name="extraServices"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
          placeholder="Enter any extra services required (e.g., Catering, Equipments, Decorations, Carers etc)"
          required
        />
      </div>
    </div>
  );
}

export default EventBookingForm;
