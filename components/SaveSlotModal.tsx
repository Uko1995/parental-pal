"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface SaveSlotModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SaveSlotModal({ open, onClose }: SaveSlotModalProps) {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !parentEmail.trim() || !childName.trim() || !childAge.trim()) {
      toast.error("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/weekend-enrichment/save-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: parentName.trim(),
          parentEmail: parentEmail.trim(),
          childName: childName.trim(),
          childAge: childAge.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Slot saved! We'll be in touch.");
        setParentName("");
        setParentEmail("");
        setChildName("");
        setChildAge("");
        onClose();
      } else {
        toast.error(data.error || "Failed to save slot.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-slot-title"
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="save-slot-title" className="text-xl font-bold text-gray-900">
            Save a slot
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Leave your details and we&apos;ll reserve a slot and get back to you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent name *
            </label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              onBlur={(e) => setParentName(e.target.value.trim())}
              className="input input-bordered w-full"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              onBlur={(e) => setParentEmail(e.target.value.trim())}
              className="input input-bordered w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child name *
            </label>
            <input
              type="text"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onBlur={(e) => setChildName(e.target.value.trim())}
              className="input input-bordered w-full"
              placeholder="Child's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child age *
            </label>
            <input
              type="text"
              required
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              onBlur={(e) => setChildAge(e.target.value.trim())}
              className="input input-bordered w-full"
              placeholder="e.g. 5"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white border-none flex-1"
            >
              {submitting ? "Saving…" : "Save slot"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline border-gray-300 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
