"use client";

import { PlusIcon } from "@heroicons/react/24/outline";

interface AddAnotherChildButtonProps {
  onClick: () => void;
  label?: string;
}

export default function AddAnotherChildButton({
  onClick,
  label = "Add Another Child",
}: AddAnotherChildButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-[#90AC19] bg-[#90AC19]/10 text-[#5a7210] font-semibold text-base shadow-sm hover:bg-[#90AC19] hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#90AC19] focus-visible:ring-offset-2 transition-all duration-200 dark:border-[#a8c42a] dark:bg-[#90AC19]/20 dark:text-[#d4e887] dark:hover:bg-[#90AC19] dark:hover:text-white dark:focus-visible:ring-offset-base-100"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#90AC19] text-white shrink-0">
        <PlusIcon className="w-5 h-5" strokeWidth={2.5} />
      </span>
      {label}
    </button>
  );
}
