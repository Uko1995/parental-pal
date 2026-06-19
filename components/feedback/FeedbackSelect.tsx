"use client";

interface SelectOption {
  label: string;
  value: string;
}

interface FeedbackSelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function FeedbackSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  required = false,
}: FeedbackSelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-base-content">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select select-bordered w-full bg-base-100 border-base-300 text-base-content focus:border-[#90AC19] focus:outline-none"
        required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
