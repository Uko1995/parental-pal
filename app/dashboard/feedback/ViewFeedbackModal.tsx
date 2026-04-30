"use client";

import type { FeedbackItem } from "./types";

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedbackItem | null;
}

export default function ViewFeedbackModal({
  isOpen,
  onClose,
  item,
}: ViewFeedbackModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
        <p className="mt-1 text-xs text-gray-500">
          Submitted {new Date(item.createdAt).toLocaleString()}
        </p>

        <div className="mt-5 space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-gray-800">Parent Name</p>
              <p className="text-gray-600">{item.name || "Not provided"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Email</p>
              <p className="text-gray-600">{item.email || "Not provided"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Phone</p>
              <p className="text-gray-600">{item.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Child Age Range</p>
              <p className="text-gray-600">{item.childAgeRange}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Services Interested</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.servicesInterested.map((service) => (
                <span key={service} className="badge badge-ghost">
                  {service}
                </span>
              ))}
            </div>
            {item.customService && (
              <p className="mt-2 text-gray-600">Other: {item.customService}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-800">Interest Level</p>
            <p className="text-gray-600">{item.interestLevel}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Feedback / Suggestions</p>
            <p className="whitespace-pre-wrap text-gray-600">
              {item.feedback || "No additional feedback"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Consent</p>
            <p className="text-gray-600">{item.consent ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
