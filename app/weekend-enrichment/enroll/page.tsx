"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  WEEKEND_ENRICHMENT_PROGRAMS,
  getProgramById,
  calculateTotal,
} from "@/lib/weekend-enrichment-programs";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

/** Generate next N Saturdays as YYYY-MM-DD for the date picker */
function getUpcomingSaturdays(count: number): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  while (out.length < count) {
    if (d.getDay() === 6) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      out.push({
        value: `${y}-${m}-${day}`,
        label: d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function WeekendEnrichmentEnrollPage() {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [children, setChildren] = useState<{ name: string; age: string }[]>([
    { name: "", age: "" },
  ]);
  const [programId, setProgramId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const saturdays = useMemo(() => getUpcomingSaturdays(52), []);

  const program = programId ? getProgramById(programId) : null;
  const childCount = children.filter((c) => c.name.trim() || c.age.trim()).length || 1;
  const total = program ? calculateTotal(programId, childCount) : 0;

  const addChild = () => {
    setChildren((prev) => [...prev, { name: "", age: "" }]);
  };

  const removeChild = (index: number) => {
    if (children.length <= 1) return;
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: "name" | "age", value: string) => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedParentName = parentName.trim();
    const trimmedParentEmail = parentEmail.trim();
    const trimmedParentPhone = parentPhone.trim();
    const trimmedStartDate = startDate.trim();

    if (!program || total <= 0 || !trimmedStartDate) {
      toast.error("Please fill program, date, and at least one child.");
      return;
    }
    const validChildren = children
      .map((c) => ({ name: c.name.trim(), age: c.age.trim() }))
      .filter((c) => c.name);
    if (validChildren.length === 0) {
      toast.error("Please add at least one child with a name.");
      return;
    }
    if (!trimmedParentName || !trimmedParentEmail || !trimmedParentPhone) {
      toast.error("Please fill parent name, email, and phone.");
      return;
    }

    setSubmitting(true);
    try {
      const enrollRes = await fetch("/api/weekend-enrichment/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: trimmedParentName,
          parentEmail: trimmedParentEmail,
          parentPhone: trimmedParentPhone,
          children: validChildren,
          programId,
          programName: program.name,
          startDate: trimmedStartDate,
          amount: total,
        }),
      });

      const enrollData = await enrollRes.json();
      if (!enrollData.success || !enrollData.enrollmentId) {
        toast.error(enrollData.error || "Failed to create enrollment");
        setSubmitting(false);
        return;
      }

      const payRes = await fetch("/api/weekend-enrichment/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollData.enrollmentId,
          email: trimmedParentEmail,
        }),
      });

      const payData = await payRes.json();
      if (!payData.success || !payData.authorization_url) {
        toast.error(payData.error || "Failed to start payment");
        setSubmitting(false);
        return;
      }

      window.location.href = payData.authorization_url;
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#90AC19]/5 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/weekend-enrichment"
            className="text-[#90AC19] hover:underline font-medium"
          >
            ← Back to Weekend Enrichment
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Get Started — Weekend Enrichment
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in your details and proceed to secure your slot with payment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          {/* Parent details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent / Guardian</h2>
            <div className="grid gap-4 sm:grid-cols-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name *
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
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  onBlur={(e) => setParentPhone(e.target.value.trim())}
                  className="input input-bordered w-full"
                  placeholder="08012345678"
                />
              </div>
            </div>
          </div>

          {/* Children */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Child/Children</h2>
              <button
                type="button"
                onClick={addChild}
                className="btn btn-sm btn-outline border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add child
              </button>
            </div>
            <div className="space-y-4">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Child name
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(index, "name", e.target.value)}
                        onBlur={(e) => updateChild(index, "name", e.target.value.trim())}
                        className="input input-bordered w-full input-sm"
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Age
                      </label>
                      <input
                        type="text"
                        value={child.age}
                        onChange={(e) => updateChild(index, "age", e.target.value)}
                        onBlur={(e) => updateChild(index, "age", e.target.value.trim())}
                        className="input input-bordered w-full input-sm"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    disabled={children.length <= 1}
                    className="btn btn-ghost btn-sm text-error mt-6"
                    aria-label="Remove child"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Program & date */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Program & Date</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose program *
                </label>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value.trim())}
                  className="select select-bordered w-full"
                >
                  <option value="">Select a program</option>
                  {WEEKEND_ENRICHMENT_PROGRAMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.time} — ₦{p.pricePerChildPerMonth.toLocaleString()}/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturday (start date) *
                </label>
                <select
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Select a Saturday</option>
                  {saturdays.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Total */}
          {program && total > 0 && (
            <div className="rounded-xl bg-[#90AC19]/10 border border-[#90AC19]/20 p-4">
              <p className="text-sm text-gray-700">
                {program.name} — {program.time}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                × {childCount} child{childCount !== 1 ? "ren" : ""}
              </p>
              <p className="text-2xl font-bold text-[#90AC19] mt-1">
                ₦{total.toLocaleString()} <span className="text-base font-normal text-gray-600">/ month</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !program || total <= 0}
              className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white border-none flex-1"
            >
              {submitting ? "Redirecting to payment…" : "Proceed to Paystack Checkout"}
            </button>
            <Link
              href="/weekend-enrichment"
              className="btn btn-outline border-gray-300 flex-1 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
