"use client";

import { useState } from "react";

interface PhoneInputProps {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  defaultCountryCode?: string;
  defaultPhoneNumber?: string;
}

const countryCodes = [
  { code: "+234", country: "Nigeria", flag: "NG" },
  { code: "+1", country: "USA/Canada", flag: "US" },
  { code: "+44", country: "UK", flag: "GP" },
  { code: "+27", country: "South Africa", flag: "ZAF" },
  { code: "+254", country: "Kenya", flag: "KEN" },
  { code: "+233", country: "Ghana", flag: "GHA" },
  { code: "+91", country: "India", flag: "IND" },
  { code: "+86", country: "China", flag: "CHN" },
  { code: "+81", country: "Japan", flag: "JPN" },
  { code: "+33", country: "France", flag: "FRA" },
  { code: "+49", country: "Germany", flag: "DEU" },
  { code: "+971", country: "UAE", flag: "ARE" },
  { code: "+966", country: "Saudi Arabia", flag: "SAU" },
  { code: "+61", country: "Australia", flag: "AUS" },
  { code: "+55", country: "Brazil", flag: "BRA" },
];

export default function PhoneInput({
  name,
  label = "Phone Number",
  required = false,
  placeholder = "Enter phone number",
  defaultCountryCode = "+234",
  defaultPhoneNumber = "",
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);

  // Combine country code and phone number for form submission
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  return (
    <div className="form-control">
      {label && (
        <label className="label">
          <span className="label-text text-sm font-semibold text-gray-800 flex items-center gap-2">
            {label} {required && <span className="text-red-600">*</span>}
          </span>
        </label>
      )}
      <div className="flex gap-0">
        {/* Country Code Selector */}
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="select select-bordered w-25 ps-1 bg-white focus:outline-none focus:border-gray-600 focus:ring focus:ring-gray-300 text-gray-800"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag}
              {"  "} {country.code}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/[^0-9]/g, "");
            setPhoneNumber(value);
          }}
          className="input border-gray-500 bg-white focus:border-gray-600 focus:ring focus:ring-gray-300 text-gray-800"
          placeholder={placeholder}
          required={required}
        />
      </div>

      {/* Hidden input with full phone number for form submission */}
      <input type="hidden" name={name} value={fullPhoneNumber} />

      {/* Display formatted phone number */}
      {phoneNumber && (
        <label className="label">
          <span className="label-text-alt text-sm text-gray-700">
            Full number: {fullPhoneNumber}
          </span>
        </label>
      )}
    </div>
  );
}
