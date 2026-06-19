"use client";

interface FeedbackInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
}

export default function FeedbackInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: FeedbackInputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-base-content">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input input-bordered w-full bg-base-100 border-base-300 text-base-content focus:border-[#90AC19] focus:outline-none"
        required={required}
      />
    </div>
  );
}
