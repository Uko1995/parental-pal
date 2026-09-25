import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "NG";

const PREFERRED_COUNTRIES: CountryCode[] = ["NG", "IE", "GB", "US", "CA", "ZA"];

export interface ParsedPhone {
  country: CountryCode;
  nationalNumber: string;
}

export function isValidInternationalPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+")) return false;
  return isValidPhoneNumber(trimmed);
}

export function formatPhoneE164(
  country: CountryCode,
  nationalDigits: string,
): string {
  const digits = nationalDigits.replace(/\D/g, "");
  if (!digits) return "";

  const typer = new AsYouType(country);
  typer.input(digits);
  const parsed = typer.getNumber();
  if (parsed?.number && parsed.nationalNumber) {
    return parsed.number;
  }

  const withoutTrunk = digits.replace(/^0/, "");
  if (!withoutTrunk) return "";
  return `+${getCountryCallingCode(country)}${withoutTrunk}`;
}

function countryForCallingCode(e164: string): ParsedPhone | null {
  const ordered = [
    ...PREFERRED_COUNTRIES,
    ...getCountries().filter(
      (country) => !PREFERRED_COUNTRIES.includes(country),
    ),
  ];

  let best: { country: CountryCode; code: string } | null = null;
  for (const country of ordered) {
    const code = `+${getCountryCallingCode(country)}`;
    if (e164.startsWith(code) && (!best || code.length > best.code.length)) {
      best = { country, code };
    }
  }

  if (!best) return null;
  return {
    country: best.country,
    nationalNumber: e164.slice(best.code.length).replace(/\D/g, ""),
  };
}

export function parseStoredPhone(value: string): ParsedPhone {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return { country: DEFAULT_PHONE_COUNTRY, nationalNumber: "" };
  }

  if (!trimmed.startsWith("+")) {
    const national = parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_COUNTRY);
    if (national) {
      return {
        country: national.country || DEFAULT_PHONE_COUNTRY,
        nationalNumber: national.nationalNumber,
      };
    }
    return {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: trimmed.replace(/\D/g, "").replace(/^0/, ""),
    };
  }

  const parsed = parsePhoneNumberFromString(trimmed);
  if (parsed?.country) {
    return {
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
    };
  }

  return (
    countryForCallingCode(trimmed) || {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: trimmed.replace(/\D/g, ""),
    }
  );
}
