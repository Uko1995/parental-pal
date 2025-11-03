/**
 * Form persistence utilities for handling form data across authentication redirects
 */

export interface FormPersistenceData {
  selectedService: string;
  selectedHearAboutUs: string;
  otherHearAboutUsText: string;
  socialMediaPlatform: string;
  referralName: string;
  priority: "low" | "normal" | "high" | "urgent";
  followUpRequired: boolean;
  isRepeatedCustomer: boolean;
  // Service-specific form data
  serviceFormData?: Record<string, string | string[]>;
  // Timestamp to handle expiration
  timestamp: number;
}

const STORAGE_KEY = "parental-pal-booking-form";
const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

/**
 * Check if we're running on the client side
 */
function isClientSide(): boolean {
  return typeof window !== "undefined";
}

/**
 * Save form data to localStorage
 */
export function saveFormData(data: Partial<FormPersistenceData>): void {
  if (!isClientSide()) return;

  try {
    const dataWithTimestamp: FormPersistenceData = {
      selectedService: "",
      selectedHearAboutUs: "",
      otherHearAboutUsText: "",
      socialMediaPlatform: "",
      referralName: "",
      priority: "normal",
      followUpRequired: false,
      isRepeatedCustomer: false,
      timestamp: Date.now(),
      ...data,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error("Failed to save form data:", error);
  }
}

/**
 * Retrieve form data from localStorage
 */
export function getFormData(): FormPersistenceData | null {
  if (!isClientSide()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: FormPersistenceData = JSON.parse(stored);

    // Check if data has expired
    if (Date.now() - data.timestamp > EXPIRATION_TIME) {
      clearFormData();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to retrieve form data:", error);
    clearFormData();
    return null;
  }
}

/**
 * Clear form data from localStorage
 */
export function clearFormData(): void {
  if (!isClientSide()) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear form data:", error);
  }
}

/**
 * Update specific fields in stored form data
 */
export function updateFormData(updates: Partial<FormPersistenceData>): void {
  if (!isClientSide()) return;

  try {
    const existing = getFormData();
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      saveFormData(updates);
    }
  } catch (error) {
    console.error("Failed to update form data:", error);
  }
}

/**
 * Extract form data from FormData object for persistence
 */
export function extractFormDataForPersistence(
  formData: FormData,
  additionalData: Partial<FormPersistenceData> = {}
): Partial<FormPersistenceData> {
  const extracted: Record<string, string | string[]> = {};

  // Convert FormData to plain object
  for (const [key, value] of formData.entries()) {
    // Skip Next.js internal fields
    if (key.startsWith("$ACTION_ID")) continue;

    const stringValue = value.toString();

    // Handle multiple values (checkboxes, etc.)
    if (extracted[key]) {
      if (Array.isArray(extracted[key])) {
        (extracted[key] as string[]).push(stringValue);
      } else {
        extracted[key] = [extracted[key] as string, stringValue];
      }
    } else {
      extracted[key] = stringValue;
    }
  }

  // Also capture all form inputs not in FormData (for controlled inputs)
  if (typeof document !== "undefined") {
    const inputs = document.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");

    inputs.forEach((element) => {
      if (element.name && !element.name.startsWith("$ACTION_ID")) {
        if (element instanceof HTMLInputElement) {
          if (element.type === "checkbox" || element.type === "radio") {
            if (element.checked) {
              if (extracted[element.name]) {
                if (Array.isArray(extracted[element.name])) {
                  (extracted[element.name] as string[]).push(element.value);
                } else {
                  extracted[element.name] = [
                    extracted[element.name] as string,
                    element.value,
                  ];
                }
              } else {
                extracted[element.name] = element.value;
              }
            }
          } else if (!extracted[element.name]) {
            extracted[element.name] = element.value;
          }
        } else if (!extracted[element.name]) {
          extracted[element.name] = element.value;
        }
      }
    });
  }

  return {
    serviceFormData: extracted,
    ...additionalData,
  };
}

/**
 * Restore form data to form elements by name
 * Dispatches input/change events to trigger React state updates
 */
export function restoreFormDataToElements(data: FormPersistenceData): void {
  try {
    if (!data.serviceFormData) return;

    Object.entries(data.serviceFormData).forEach(([key, value]) => {
      const elements = document.getElementsByName(key) as NodeListOf<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >;

      elements.forEach((element) => {
        if (element.type === "checkbox" || element.type === "radio") {
          const inputElement = element as HTMLInputElement;
          const shouldBeChecked = Array.isArray(value)
            ? value.includes(inputElement.value)
            : inputElement.value === String(value);

          if (inputElement.checked !== shouldBeChecked) {
            inputElement.checked = shouldBeChecked;
            // Dispatch change event to trigger React state updates
            inputElement.dispatchEvent(
              new Event("change", { bubbles: true, cancelable: true })
            );
          }
        } else if (element.tagName === "SELECT") {
          const selectElement = element as HTMLSelectElement;
          if (selectElement.value !== String(value)) {
            selectElement.value = String(value);
            // Dispatch change event to trigger React state updates
            selectElement.dispatchEvent(
              new Event("change", { bubbles: true, cancelable: true })
            );
          }
        } else {
          if (element.value !== String(value)) {
            element.value = String(value);
            // Dispatch input event to trigger React state updates
            element.dispatchEvent(
              new Event("input", { bubbles: true, cancelable: true })
            );
          }
        }
      });
    });
  } catch (error) {
    console.error("Failed to restore form data to elements:", error);
  }
}

/**
 * Check if there is persisted form data available
 */
export function hasPersistedFormData(): boolean {
  return getFormData() !== null;
}

/**
 * Get persisted data with fallback values
 */
export function getPersistedValueWithFallback<T>(
  key: keyof FormPersistenceData,
  fallback: T
): T {
  const data = getFormData();
  if (!data || !(key in data)) return fallback;

  return (data[key] as T) || fallback;
}
