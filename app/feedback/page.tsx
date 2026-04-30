"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import FeedbackInput from "@/components/feedback/FeedbackInput";
import FeedbackSelect from "@/components/feedback/FeedbackSelect";
import FeedbackCheckboxGroup from "@/components/feedback/FeedbackCheckboxGroup";
import FeedbackRadioGroup from "@/components/feedback/FeedbackRadioGroup";

type FeedbackFormState = {
  name: string;
  email: string;
  phone: string;
  childAgeRange: string;
  servicesInterested: string[];
  customService: string;
  interestLevel: string;
  feedback: string;
  consent: boolean;
};

const AGE_RANGE_OPTIONS = [
  { label: "0 - 2 years", value: "0-2 years" },
  { label: "3 - 5 years", value: "3-5 years" },
  { label: "6 - 8 years", value: "6-8 years" },
  { label: "9 - 12 years", value: "9-12 years" },
  { label: "13+ years", value: "13+ years" },
];

interface ServiceOption {
  label: string;
  value: string;
}

const INTEREST_OPTIONS = [
  { label: "Very interested", value: "very-interested" },
  { label: "Somewhat interested", value: "somewhat-interested" },
  { label: "Just exploring", value: "just-exploring" },
];

const INITIAL_FORM: FeedbackFormState = {
  name: "",
  email: "",
  phone: "",
  childAgeRange: "",
  servicesInterested: [],
  customService: "",
  interestLevel: "",
  feedback: "",
  consent: false,
};

export default function FeedbackPage() {
  const [form, setForm] = useState<FeedbackFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedOther = useMemo(
    () => form.servicesInterested.includes("other"),
    [form.servicesInterested]
  );

  const updateField = <K extends keyof FeedbackFormState>(
    key: K,
    value: FeedbackFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (service: string) => {
    setForm((prev) => {
      const exists = prev.servicesInterested.includes(service);
      const servicesInterested = exists
        ? prev.servicesInterested.filter((item) => item !== service)
        : [...prev.servicesInterested, service];

      return {
        ...prev,
        servicesInterested,
        customService: servicesInterested.includes("other")
          ? prev.customService
          : "",
      };
    });
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await fetch("/api/services");
        const result = await response.json();

        if (!response.ok || !result?.success || !Array.isArray(result?.data)) {
          throw new Error("Unable to load services.");
        }

        const activeServices = result.data
          .filter((item: { status?: string }) => item?.status === "active")
          .map((item: { name?: string }) => item?.name?.trim())
          .filter((name: string | undefined): name is string => Boolean(name));

        const uniqueServiceNames = Array.from(new Set(activeServices));
        const mapped = uniqueServiceNames.map((name) => ({
          label: name,
          value: name.toLowerCase(),
        }));

        mapped.push({ label: "Other", value: "other" });
        setServiceOptions(mapped);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load services."
        );
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Parent name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.childAgeRange) return "Please select your child age range.";
    if (form.servicesInterested.length === 0)
      return "Please choose at least one service.";
    if (!form.interestLevel) return "Please select your interest level.";
    if (selectedOther && !form.customService.trim()) {
      return "Please describe the other service you are interested in.";
    }
    if (!form.consent) return "Consent is required to submit this form.";
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit feedback.");
      }

      setIsSubmitted(true);
      setForm(INITIAL_FORM);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit feedback."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-linear-to-b from-[#f8fbef] to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Parent Feedback and Interest
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Help us plan better childcare support at our fair by sharing what
            your family needs.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8f0d2] bg-white p-5 shadow-sm sm:p-8">
          {isSubmitted && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Thank you. Your response has been received.
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeedbackInput
                id="name"
                label="Parent Name"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Enter your full name"
                required
              />
              <FeedbackInput
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <FeedbackInput
              id="phone"
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="Enter your phone number"
              required
            />

            <FeedbackSelect
              id="childAgeRange"
              label="Child Age Range"
              value={form.childAgeRange}
              options={AGE_RANGE_OPTIONS}
              onChange={(value) => updateField("childAgeRange", value)}
              required
            />

            <FeedbackCheckboxGroup
              label="Services Interested In"
              options={serviceOptions}
              selectedValues={form.servicesInterested}
              onToggle={toggleService}
              required
            />
            {isLoadingServices && (
              <p className="text-sm text-gray-500">Loading services...</p>
            )}

            {selectedOther && (
              <FeedbackInput
                id="customService"
                label="Other Service (please specify)"
                value={form.customService}
                onChange={(value) => updateField("customService", value)}
                required
              />
            )}

            <FeedbackRadioGroup
              name="interestLevel"
              label="Interest Level"
              options={INTEREST_OPTIONS}
              selectedValue={form.interestLevel}
              onChange={(value) => updateField("interestLevel", value)}
              required
            />

            <div className="space-y-1">
              <label
                htmlFor="feedback"
                className="block text-sm font-semibold text-gray-800"
              >
                Feedback and Suggestions
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows={4}
                value={form.feedback}
                onChange={(event) => updateField("feedback", event.target.value)}
                className="textarea textarea-bordered w-full bg-white focus:border-[#90AC19] focus:outline-none"
                placeholder="Tell us what would help your family most..."
              />
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                className="checkbox checkbox-sm mt-0.5 border-gray-400 checked:border-[#90AC19] checked:bg-[#90AC19]"
              />
              <span>
                I consent to ParentalPal storing and reviewing this information
                to improve service planning.
              </span>
            </label>

            <button
              type="submit"
              className="btn w-full border-none bg-[#90AC19] text-white hover:bg-[#7e9717] disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
