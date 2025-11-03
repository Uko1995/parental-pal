"use client";

import { useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";

interface PhoneInputProps {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  defaultCountryCode?: string;
  defaultPhoneNumber?: string;
}

const countryCodes = [
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
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
          <span className="label-text font-semibold text-gray-700 flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-[#90AC19]" />
            {label} {required && <span className="text-error">*</span>}
          </span>
        </label>
      )}
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="select select-bordered w-32 bg-white focus:outline-none focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
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
          className="input input-bordered flex-1 bg-white focus:outline-none focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20"
          placeholder={placeholder}
          required={required}
        />
      </div>

      {/* Hidden input with full phone number for form submission */}
      <input type="hidden" name={name} value={fullPhoneNumber} />

      {/* Display formatted phone number */}
      {phoneNumber && (
        <label className="label">
          <span className="label-text-alt text-gray-500">
            Full number: {fullPhoneNumber}
          </span>
        </label>
      )}
    </div>
  );
}
