export interface HearAboutUsState {
  selected: string;
  otherText: string;
  socialMediaPlatform: string;
  referralName: string;
}

export interface ServiceFormValidationRef {
  validate: () => { isValid: boolean; errors: string[] };
  isPricingReady?: () => boolean;
}

export interface BookingFormValidationInput {
  form: HTMLFormElement | null;
  selectedService: string;
  hearAboutUs: HearAboutUsState;
  serviceFormRef: ServiceFormValidationRef | null | undefined;
  servicesLoaded: boolean;
  servicesLoadFailed: boolean;
}

export interface BookingFormValidationResult {
  ok: boolean;
  errors: string[];
  firstInvalidElement?: HTMLElement | null;
  scrollTargetId?: string;
}

function fieldLabel(
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): string {
  const labelText = field.labels?.[0]?.textContent?.replace(/\*/g, "").trim();
  if (labelText) return labelText;
  if ("placeholder" in field && field.placeholder) return field.placeholder;
  if (field.name) return field.name.replace(/_/g, " ");
  return "A required field";
}

function collectInvalidFieldErrors(form: HTMLFormElement): string[] {
  const errors: string[] = [];
  const fields = form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");

  fields.forEach((field) => {
    if (field.disabled || field.type === "hidden") return;
    // Radio groups are validated via React state (one selection required, not every option)
    if (field.type === "radio") return;
    // Textareas in service forms are React-controlled; validate via service ref instead
    if (field.tagName === "TEXTAREA") return;
    if (!field.willValidate) return;
    if (field.validity.valid) return;

    if (field.validity.valueMissing) {
      errors.push(`${fieldLabel(field)} is required`);
      return;
    }

    if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
      errors.push(`${fieldLabel(field)} is out of range`);
      return;
    }

    if (field.validity.typeMismatch || field.validity.badInput) {
      errors.push(`${fieldLabel(field)} has an invalid value`);
      return;
    }

    errors.push(`${fieldLabel(field)} is invalid`);
  });

  return [...new Set(errors)];
}

export function findFirstInvalidField(
  form: HTMLFormElement,
): HTMLElement | null {
  return form.querySelector<HTMLElement>(
    "input:invalid:not([type=hidden]), select:invalid, textarea:invalid",
  );
}

export function scrollToField(element: HTMLElement | null | undefined): void {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.focus({ preventScroll: true });
  }
}

export function validateBookingForm(
  input: BookingFormValidationInput,
): BookingFormValidationResult {
  const errors: string[] = [];
  let firstInvalidElement: HTMLElement | null | undefined;
  let scrollTargetId: string | undefined;

  if (input.servicesLoadFailed) {
    errors.push(
      "Services could not be loaded. Please refresh the page and try again.",
    );
  } else if (!input.servicesLoaded && !input.selectedService) {
    errors.push("Services are still loading. Please wait a moment.");
  }

  if (!input.selectedService) {
    errors.push("Please select a service before submitting");
  }

  if (!input.hearAboutUs.selected) {
    errors.push("Please choose one option for how you heard about us");
    scrollTargetId = "hear-about-us-section";
  } else if (
    input.hearAboutUs.selected === "other" &&
    !input.hearAboutUs.otherText.trim()
  ) {
    errors.push("Please specify how you heard about us");
    scrollTargetId = "hear-about-us-section";
  } else if (
    input.hearAboutUs.selected === "socialMedia" &&
    !input.hearAboutUs.socialMediaPlatform.trim()
  ) {
    errors.push("Please select which social media platform");
    scrollTargetId = "hear-about-us-section";
  } else if (
    input.hearAboutUs.selected === "referral" &&
    !input.hearAboutUs.referralName.trim()
  ) {
    errors.push("Please specify who referred you");
    scrollTargetId = "hear-about-us-section";
  }

  if (input.form) {
    const fieldErrors = collectInvalidFieldErrors(input.form);
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
      firstInvalidElement = findFirstInvalidField(input.form);
      scrollTargetId = undefined;
    }
  }

  if (input.selectedService) {
    if (!input.serviceFormRef) {
      errors.push(
        "The booking form is still loading. Please wait a moment and try again.",
      );
    } else {
      const serviceValidation = input.serviceFormRef.validate();
      if (!serviceValidation.isValid) {
        errors.push(...serviceValidation.errors);
      }

      if (
        input.serviceFormRef.isPricingReady &&
        !input.serviceFormRef.isPricingReady()
      ) {
        errors.push(
          "Pricing could not be loaded. Please refresh the page before submitting.",
        );
      }
    }
  }

  const uniqueErrors = [...new Set(errors)];

  return {
    ok: uniqueErrors.length === 0,
    errors: uniqueErrors,
    firstInvalidElement,
    scrollTargetId,
  };
}
