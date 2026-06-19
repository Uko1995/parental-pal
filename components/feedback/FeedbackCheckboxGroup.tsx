"use client";

interface CheckboxOption {
  label: string;
  value: string;
}

interface FeedbackCheckboxGroupProps {
  label: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  required?: boolean;
}

export default function FeedbackCheckboxGroup({
  label,
  options,
  selectedValues,
  onToggle,
  required = false,
}: FeedbackCheckboxGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-base-content">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded-md border border-base-300 bg-base-200/40 px-3 py-2 text-sm text-base-content/90"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="checkbox checkbox-sm border-base-300 checked:border-[#90AC19] checked:bg-[#90AC19]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
