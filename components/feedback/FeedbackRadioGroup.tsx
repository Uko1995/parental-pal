"use client";

interface RadioOption {
  label: string;
  value: string;
}

interface FeedbackRadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function FeedbackRadioGroup({
  name,
  label,
  options,
  selectedValue,
  onChange,
  required = false,
}: FeedbackRadioGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <input
              type="radio"
              name={name}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className="radio radio-sm border-gray-400 checked:border-[#90AC19] checked:bg-[#90AC19]"
              required={required}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
