"use client";

import { useEffect, useState } from "react";
import type { BookingChildPrefill } from "@/lib/booking-profile-prefill";

interface OptionalChildProps {
  initialChildren?: BookingChildPrefill[];
}

export default function OptionalChild({
  initialChildren = [],
}: OptionalChildProps) {
  const [children, setChildren] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || initialChildren.length === 0) return;
    setChildren(initialChildren.map((_, index) => index + 1));
    setInitialized(true);
  }, [initialChildren, initialized]);

  const addChild = () => {
    const newChildId = children.length > 0 ? Math.max(...children) + 1 : 1;
    setChildren([...children, newChildId]);
  };

  const removeChild = (childId: number) => {
    setChildren(children.filter((id) => id !== childId));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          id="addAnotherChild"
          onClick={addChild}
          className="btn btn-outline btn-sm rounded-lg"
        >
          Add child
        </button>
      </div>

      {children.map((childId, index) => {
        const defaults = initialChildren[index];

        return (
          <div
            key={childId}
            className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-800">
                Child #{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeChild(childId)}
                className="text-red-600 cursor-pointer hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Name *
                </label>
                <input
                  type="text"
                  name={`childName${childId}`}
                  defaultValue={defaults?.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                  placeholder="Enter your child's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Age *
                </label>
                <input
                  type="number"
                  name={`childAge${childId}`}
                  min="1"
                  max="10"
                  defaultValue={defaults?.age}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                  placeholder="Enter age"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name={`childGender${childId}`}
                  defaultValue={defaults?.gender || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s School *
                </label>
                <input
                  type="text"
                  name={`childSchool${childId}`}
                  defaultValue={defaults?.schoolName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                  placeholder="Enter child's school"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Class *
                </label>
                <input
                  type="text"
                  name={`childClass${childId}`}
                  defaultValue={defaults?.class}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] transition-colors duration-300"
                  placeholder="Enter class"
                  required
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
