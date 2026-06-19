"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

interface PhoneInputProps {
  name?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  defaultCountryCode?: string;
  defaultPhoneNumber?: string;
  value?: string;
  onValueChange?: (fullNumber: string) => void;
  inputClassName?: string;
  selectClassName?: string;
  wrapperClassName?: string;
  showPreview?: boolean;
}

const FALLBACK_COUNTRY_CODE = "+234";

function splitPhoneNumber(fullPhone: string, fallbackCountryCode: string) {
  const normalized = (fullPhone || "").trim();
  if (!normalized) {
    return { countryCode: fallbackCountryCode, phoneNumber: "" };
  }

  if (!normalized.startsWith("+")) {
    return {
      countryCode: fallbackCountryCode,
      phoneNumber: normalized.replace(/[^0-9]/g, ""),
    };
  }

  const countries = getCountries() as CountryCode[];
  let bestMatch = fallbackCountryCode;

  countries.forEach((country) => {
    const code = `+${getCountryCallingCode(country)}`;
    if (normalized.startsWith(code) && code.length > bestMatch.length) {
      bestMatch = code;
    }
  });

  return {
    countryCode: bestMatch,
    phoneNumber: normalized.slice(bestMatch.length).replace(/[^0-9]/g, ""),
  };
}

export default function PhoneInput({
  name,
  label = "Phone Number",
  required = false,
  placeholder = "Enter phone number",
  defaultCountryCode = FALLBACK_COUNTRY_CODE,
  defaultPhoneNumber = "",
  value,
  onValueChange,
  inputClassName,
  selectClassName,
  wrapperClassName,
  showPreview = false,
}: PhoneInputProps) {
  const fallbackCode = defaultCountryCode || FALLBACK_COUNTRY_CODE;
  const [countryCode, setCountryCode] = useState(fallbackCode);
  const [phoneNumber, setPhoneNumber] = useState(
    defaultPhoneNumber.replace(/[^0-9]/g, ""),
  );
  const countryCodes = useMemo(() => {
    const countryNameIntl = new Intl.DisplayNames(["en"], { type: "region" });
    const preferredCountries = new Set(["NG", "IE", "GB", "US", "CA", "ZA"]);

    const options = (getCountries() as CountryCode[]).map((countryCode) => {
      const dialCode = `+${getCountryCallingCode(countryCode)}`;
      const countryName = countryNameIntl.of(countryCode) || countryCode;
      return {
        key: `${countryCode}-${dialCode}`,
        flag: countryCode,
        code: dialCode,
        country: countryName,
      };
    });

    return options.sort((a, b) => {
      const aPreferred = preferredCountries.has(a.flag);
      const bPreferred = preferredCountries.has(b.flag);
      if (aPreferred !== bPreferred) {
        return aPreferred ? -1 : 1;
      }
      return a.country.localeCompare(b.country);
    });
  }, []);

  useEffect(() => {
    if (typeof value !== "string") return;
    const parsed = splitPhoneNumber(value, fallbackCode);
    setCountryCode(parsed.countryCode);
    setPhoneNumber(parsed.phoneNumber);
  }, [value, fallbackCode]);

  // Combine country code and phone number for form submission
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  return (
    <div className={wrapperClassName || "form-control"}>
      {label && (
        <label className="label">
          <span className="label-text text-sm font-semibold text-base-content flex items-center gap-2">
            {label} {required && <span className="text-red-600">*</span>}
          </span>
        </label>
      )}
      <div className="flex gap-0">
        {/* Country Code Selector */}
        <select
          value={countryCode}
          onChange={(e) => {
            const nextCountryCode = e.target.value;
            setCountryCode(nextCountryCode);
            onValueChange?.(`${nextCountryCode}${phoneNumber}`);
          }}
          className={
            selectClassName ||
            "select select-bordered w-25 ps-1 bg-base-100 border-base-300 focus:outline-none focus:border-[#90AC19] focus:ring focus:ring-[#90AC19]/20 text-base-content"
          }
        >
          {countryCodes.map((country) => (
            <option key={country.key} value={country.code}>
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
            onValueChange?.(`${countryCode}${value}`);
          }}
          className={
            inputClassName ||
            "input border-base-300 bg-base-100 focus:border-[#90AC19] focus:ring focus:ring-[#90AC19]/20 text-base-content"
          }
          placeholder={placeholder}
          required={required}
        />
      </div>

      {/* Hidden input with full phone number for form submission */}
      {name && <input type="hidden" name={name} value={fullPhoneNumber} />}

      {/* Display formatted phone number */}
      {showPreview && phoneNumber && (
        <label className="label">
          <span className="label-text-alt text-sm text-base-content/70">
            Full number: {fullPhoneNumber}
          </span>
        </label>
      )}
    </div>
  );
}
