"use client";

import { UserIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ChildInfoDefaults } from "@/lib/booking-profile-prefill";

interface ChildInfoFormProps {
  childIndex: number;
  childId: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  minAge?: number;
  onAgeChange?: (childId: string, age: number) => void;
  defaults?: ChildInfoDefaults;
}

export default function ChildInfoForm({
  childIndex,
  childId,
  onRemove,
  showRemoveButton = true,
  minAge = 1,
  onAgeChange,
  defaults,
}: ChildInfoFormProps) {
  return (
    <div className=" p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-600" />
          <span>Child #{childIndex + 1}</span>
        </h4>
        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-sm btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control flex flex-col">
          <label className="label">
            <span className="label-text font-medium text-gray-800">
              Child&apos;s Name <span className="text-red-600">*</span>
            </span>
          </label>
          <input
            type="text"
            name={`childName_${childId}`}
            defaultValue={defaults?.name}
            className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
            placeholder="Enter child's full name"
            required
          />
        </div>

        <div className="form-control flex flex-col">
          <label className="label">
            <span className="label-text font-medium text-gray-800">
              Age <span className="text-red-600">*</span>
            </span>
          </label>
          <input
            type="number"
            name={`childAge_${childId}`}
            min={minAge}
            max="18"
            defaultValue={defaults?.age}
            className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
            placeholder="Enter age"
            required
            onChange={(e) =>
              onAgeChange?.(childId, parseInt(e.target.value, 10) || 0)
            }
            onBlur={(e) =>
              onAgeChange?.(childId, parseInt(e.target.value, 10) || 0)
            }
          />
        </div>

        <div className="form-control flex flex-col">
          <label className="label">
            <span className="label-text font-medium text-gray-800">
              Gender <span className="text-red-600">*</span>
            </span>
          </label>
          <select
            name={`childGender_${childId}`}
            defaultValue={defaults?.gender || ""}
            className="select select-bordered ps-2 border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
        </div>

        <div className="form-control flex flex-col">
          <label className="label">
            <span className="label-text font-medium text-gray-800">
              Allergies/Medical Info
            </span>
            <span className="label-text-alt text-gray-500 text-xs">
              Optional
            </span>
          </label>
          <input
            type="text"
            name={`childAllergies_${childId}`}
            defaultValue={defaults?.allergies}
            className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
            placeholder="Any allergies or medical conditions"
          />
        </div>
      </div>

      <div className="form-control flex flex-col w-full col-span-2">
        <label className="label">
          <span className="label-text font-medium text-gray-800">
            Special Requirements
          </span>
          <span className="label-text-alt text-gray-500 text-xs">Optional</span>
        </label>
        <textarea
          name={`childSpecialRequirements_${childId}`}
          defaultValue={defaults?.specialRequirements}
          className="textarea textarea-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 w-full h-20"
          placeholder="Any special needs, dietary restrictions, or other important information..."
        ></textarea>
      </div>
    </div>
  );
}
