"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import {
  DEFAULT_PHONE_COUNTRY,
  formatPhoneE164,
  parseStoredPhone,
} from "@/lib/phone";

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

const PREFERRED_COUNTRIES = new Set(["NG", "IE", "GB", "US", "CA", "ZA"]);

function resolveDefaultCountry(code?: string): CountryCode {
  if (!code || code === "+234" || code === "NG") return DEFAULT_PHONE_COUNTRY;
  if (/^[A-Z]{2}$/.test(code) && getCountries().includes(code as CountryCode)) {
    return code as CountryCode;
  }
  return DEFAULT_PHONE_COUNTRY;
}

export default function PhoneInput({
  name,
  label = "Phone Number",
  required = false,
  placeholder = "Enter phone number",
  defaultCountryCode,
  defaultPhoneNumber = "",
  value,
  onValueChange,
  inputClassName,
  selectClassName,
  wrapperClassName,
  showPreview = false,
}: PhoneInputProps) {
  const fallbackCountry = resolveDefaultCountry(defaultCountryCode);
  const [country, setCountry] = useState<CountryCode>(fallbackCountry);
  const [phoneNumber, setPhoneNumber] = useState(
    defaultPhoneNumber.replace(/\D/g, ""),
  );

  const countryCodes = useMemo(() => {
    const countryNameIntl = new Intl.DisplayNames(["en"], { type: "region" });
    const options = (getCountries() as CountryCode[]).map((countryCode) => {
      const dialCode = `+${getCountryCallingCode(countryCode)}`;
      const countryName = countryNameIntl.of(countryCode) || countryCode;
      return {
        key: countryCode,
        flag: countryCode,
        dialCode,
        country: countryName,
      };
    });

    return options.sort((a, b) => {
      const aPreferred = PREFERRED_COUNTRIES.has(a.flag);
      const bPreferred = PREFERRED_COUNTRIES.has(b.flag);
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1;
      return a.country.localeCompare(b.country);
    });
  }, []);

  useEffect(() => {
    if (typeof value !== "string" || !value.trim()) return;
    const parsed = parseStoredPhone(value);
    setCountry(parsed.country);
    setPhoneNumber(parsed.nationalNumber);
  }, [value]);

  const fullPhoneNumber = formatPhoneE164(country, phoneNumber);

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
        <select
          value={country}
          onChange={(e) => {
            const nextCountry = e.target.value as CountryCode;
            setCountry(nextCountry);
            onValueChange?.(formatPhoneE164(nextCountry, phoneNumber));
          }}
          className={
            selectClassName ||
            "select select-bordered w-25 ps-1 bg-base-100 border-base-300 focus:outline-none focus:border-[#90AC19] focus:ring focus:ring-[#90AC19]/20 text-base-content"
          }
        >
          {countryCodes.map((option) => (
            <option key={option.key} value={option.key}>
              {option.flag} {option.dialCode}
            </option>
          ))}
        </select>

        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            const e164 = formatPhoneE164(country, digits);
            const display = e164
              ? parseStoredPhone(e164).nationalNumber
              : digits;
            setPhoneNumber(display);
            onValueChange?.(e164);
          }}
          className={
            inputClassName ||
            "input border-base-300 bg-base-100 focus:border-[#90AC19] focus:ring focus:ring-[#90AC19]/20 text-base-content"
          }
          placeholder={placeholder}
          required={required}
        />
      </div>

      {name && <input type="hidden" name={name} value={fullPhoneNumber} />}

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
