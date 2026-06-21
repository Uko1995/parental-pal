interface BillingPeriodMonthsFieldProps {
  value: number;
  onChange: (months: number) => void;
  className?: string;
}

export default function BillingPeriodMonthsField({
  value,
  onChange,
  className = "",
}: BillingPeriodMonthsFieldProps) {
  return (
    <div className={className}>
      <label className="block mb-2">
        <span className="text-sm font-medium text-gray-900">
          How many months? <span className="text-red-500">*</span>
        </span>
        <span className="block text-xs text-gray-600 mt-1">
          Book up to 6 months with pro-rated pricing from your start date.
        </span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
        className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "month" : "months"}
          </option>
        ))}
      </select>
    </div>
  );
}
