"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ParentInvoiceLineItem, ParentInvoiceSessionKind } from "@/models/ParentInvoice";

const SERVICE_OPTIONS = [
  { value: "tutoring", label: "Tutoring" },
  { value: "childcare", label: "Childcare" },
  { value: "homeschooling", label: "Homeschooling" },
  { value: "holiday-camps", label: "Holiday Camps" },
  { value: "space-rental", label: "Space Rental" },
  { value: "kiddies-enrichment", label: "Kiddies Enrichment" },
];

function emptyLine(): ParentInvoiceLineItem {
  return {
    date: "",
    childName: "",
    serviceType: "tutoring",
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
    sessionKind: "past",
  };
}

interface ParentInvoiceBuilderProps {
  linkedBookingId?: string;
  initialLineItems?: ParentInvoiceLineItem[];
  onSave: (lineItems: ParentInvoiceLineItem[]) => Promise<void>;
  onSubmitForApproval?: (lineItems: ParentInvoiceLineItem[]) => Promise<void>;
  saving?: boolean;
}

export default function ParentInvoiceBuilder({
  linkedBookingId,
  initialLineItems,
  onSave,
  onSubmitForApproval,
  saving = false,
}: ParentInvoiceBuilderProps) {
  const [lineItems, setLineItems] = useState<ParentInvoiceLineItem[]>(
    initialLineItems?.length ? initialLineItems : [emptyLine()],
  );
  const [loadingSessions, setLoadingSessions] = useState(false);

  const updateLine = (
    index: number,
    field: keyof ParentInvoiceLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity;
          const price = field === "unitPrice" ? Number(value) : item.unitPrice;
          next.total = qty * price;
        }
        return next;
      }),
    );
  };

  const addLine = () => setLineItems((prev) => [...prev, emptyLine()]);

  const removeLine = (index: number) => {
    setLineItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const loadFutureSessions = async () => {
    if (!linkedBookingId) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(
        `/api/bookings/${linkedBookingId}/upcoming-sessions`,
      );
      const data = await res.json();
      if (!res.ok || !data.sessions?.length) return;

      const newLines: ParentInvoiceLineItem[] = data.sessions.map(
        (s: {
          date: string;
          childName: string;
          serviceType: string;
          description: string;
        }) => ({
          date: s.date,
          childName: s.childName,
          serviceType: s.serviceType,
          description: s.description,
          quantity: 1,
          unitPrice: 0,
          total: 0,
          sessionKind: "future" as ParentInvoiceSessionKind,
        }),
      );

      setLineItems((prev) => [...prev, ...newLines]);
    } finally {
      setLoadingSessions(false);
    }
  };

  return (
    <div className="space-y-4">
      {linkedBookingId && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadFutureSessions}
          disabled={loadingSessions}
        >
          {loadingSessions ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Add future sessions from booking"
          )}
        </button>
      )}

      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-base-200 rounded-lg border border-base-300"
          >
            <input
              type="date"
              className="input input-bordered input-sm"
              value={item.date}
              onChange={(e) => updateLine(index, "date", e.target.value)}
            />
            <input
              type="text"
              placeholder="Child name"
              className="input input-bordered input-sm"
              value={item.childName}
              onChange={(e) => updateLine(index, "childName", e.target.value)}
            />
            <select
              className="select select-bordered select-sm"
              value={item.serviceType}
              onChange={(e) =>
                updateLine(index, "serviceType", e.target.value)
              }
            >
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered input-sm md:col-span-2"
              value={item.description}
              onChange={(e) =>
                updateLine(index, "description", e.target.value)
              }
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                className="input input-bordered input-sm w-16"
                value={item.quantity}
                onChange={(e) =>
                  updateLine(index, "quantity", parseInt(e.target.value, 10) || 1)
                }
              />
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm w-24"
                value={item.unitPrice}
                onChange={(e) =>
                  updateLine(index, "unitPrice", parseInt(e.target.value, 10) || 0)
                }
              />
              <select
                className="select select-bordered select-sm"
                value={item.sessionKind}
                onChange={(e) =>
                  updateLine(index, "sessionKind", e.target.value)
                }
              >
                <option value="past">Past</option>
                <option value="future">Future</option>
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => removeLine(index)}
                aria-label="Remove line"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-ghost btn-sm" onClick={addLine}>
        <PlusIcon className="w-4 h-4" />
        Add session line
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-base-300">
        <p className="text-lg font-bold">
          Total: ₦{totalAmount.toLocaleString()}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline"
            disabled={saving}
            onClick={() => onSave(lineItems)}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Save draft"
            )}
          </button>
          {onSubmitForApproval && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={() => onSubmitForApproval(lineItems)}
            >
              Submit for approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
