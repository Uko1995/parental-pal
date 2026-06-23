"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type {
  ParentInvoiceLineItem,
  ParentInvoiceSessionKind,
} from "@/models/ParentInvoice";
import {
  applyServiceDefaultsToLine,
  getBookingHourlyRateForLocation,
  getTutoringRatesFromPricing,
  resolveBookingPricingContext,
  suggestSummerCampDiscountLine,
} from "@/lib/parent-invoice-pricing";
import type { ServicePricingMap } from "@/lib/service-pricing";

const SERVICE_OPTIONS = [
  { value: "tutoring", label: "Tutoring" },
  { value: "childcare", label: "Childcare" },
  { value: "homeschooling", label: "Homeschooling" },
  { value: "holiday-camps", label: "Holiday Camps" },
  { value: "space-rental", label: "Space Rental" },
  { value: "kiddies-enrichment", label: "Kiddies Enrichment" },
];

export interface BookingPricingContext {
  hourlyRate?: number;
  tutoringLocation?: "virtual" | "physical";
  virtualRate?: number;
  physicalRate?: number;
  serviceData?: Record<string, unknown>;
}

function emptyLine(
  sessionKind: ParentInvoiceSessionKind,
  pricing?: ServicePricingMap,
  tutoringLocation?: "virtual" | "physical",
): ParentInvoiceLineItem {
  const base: ParentInvoiceLineItem = {
    date: "",
    childName: "",
    serviceType: "tutoring",
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
    sessionKind,
    tutoringLocation: tutoringLocation ?? "physical",
  };
  if (pricing) {
    return applyServiceDefaultsToLine(base, pricing, {
      tutoringLocation: tutoringLocation ?? "physical",
    });
  }
  return base;
}

interface ParentInvoiceBuilderProps {
  pastOnly?: boolean;
  linkedBookingId?: string;
  bookingContext?: BookingPricingContext;
  initialLineItems?: ParentInvoiceLineItem[];
  onSave: (
    lineItems: ParentInvoiceLineItem[],
    linkedBookingId?: string,
  ) => Promise<void>;
  onSubmitInvoice?: (
    lineItems: ParentInvoiceLineItem[],
    linkedBookingId?: string,
  ) => Promise<void>;
  saving?: boolean;
}

function SessionKindToggle({
  value,
  onChange,
}: {
  value: ParentInvoiceSessionKind;
  onChange: (kind: ParentInvoiceSessionKind) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[9rem]">
      <div className="join join-horizontal w-full">
        <button
          type="button"
          className={`join-item btn btn-xs flex-1 ${
            value === "past" ? "btn-neutral" : "btn-ghost"
          }`}
          onClick={() => onChange("past")}
        >
          Past
        </button>
        <button
          type="button"
          className={`join-item btn btn-xs flex-1 ${
            value === "future" ? "btn-info" : "btn-ghost"
          }`}
          onClick={() => onChange("future")}
        >
          Future
        </button>
      </div>
      <span className="text-[10px] text-base-content/60 leading-tight">
        {value === "past" ? "Already completed" : "Not yet attended"}
      </span>
    </div>
  );
}

function LineRowFields({
  item,
  index,
  pricing,
  bookingCtx,
  tutoringLocation,
  onUpdate,
  onRemove,
  canRemove,
}: {
  item: ParentInvoiceLineItem;
  index: number;
  pricing: ServicePricingMap | null;
  bookingCtx?: BookingPricingContext;
  tutoringLocation: "virtual" | "physical";
  onUpdate: (
    index: number,
    field: keyof ParentInvoiceLineItem,
    value: string | number,
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const isTutoring = item.serviceType === "tutoring";

  return (
  <tr className="align-top">
    <td className="min-w-[8rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Session date
      </label>
      <input
        type="date"
        className="input input-bordered input-sm w-full min-w-0"
        value={item.date}
        onChange={(e) => onUpdate(index, "date", e.target.value)}
      />
    </td>
    <td className="min-w-[8rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Child name
      </label>
      <input
        type="text"
        placeholder="Child name"
        className="input input-bordered input-sm w-full min-w-0"
        value={item.childName}
        onChange={(e) => onUpdate(index, "childName", e.target.value)}
      />
    </td>
    <td className="min-w-[9rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Service
      </label>
      <select
        className="select select-bordered select-sm w-full min-w-0"
        value={item.serviceType}
        onChange={(e) => onUpdate(index, "serviceType", e.target.value)}
      >
        {SERVICE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </td>
    <td className="min-w-[12rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Session details
      </label>
      <input
        type="text"
        placeholder="e.g. Monday session (2h)"
        className="input input-bordered input-sm w-full min-w-0"
        value={item.description}
        onChange={(e) => onUpdate(index, "description", e.target.value)}
      />
    </td>
    <td className="min-w-[5rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Hours / units
      </label>
      <input
        type="number"
        min={1}
        className="input input-bordered input-sm w-full min-w-0"
        value={item.quantity}
        onChange={(e) =>
          onUpdate(index, "quantity", parseInt(e.target.value, 10) || 1)
        }
      />
    </td>
    <td className="min-w-[6rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Price per unit
      </label>
      <input
        type="number"
        min={0}
        className="input input-bordered input-sm w-full min-w-0"
        value={item.unitPrice}
        onChange={(e) =>
          onUpdate(index, "unitPrice", parseInt(e.target.value, 10) || 0)
        }
      />
    </td>
    <td className="min-w-[6rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Line total
      </label>
      <p className="text-sm font-semibold py-2">
        ₦{item.total.toLocaleString()}
      </p>
    </td>
    <td className="min-w-[9rem]">
      <label className="text-xs font-medium text-base-content/70 lg:hidden">
        Timing
      </label>
      <SessionKindToggle
        value={item.sessionKind}
        onChange={(kind) => onUpdate(index, "sessionKind", kind)}
      />
    </td>
    {isTutoring && pricing && (
      <td className="min-w-[8rem] hidden xl:table-cell">
        <label className="text-xs font-medium text-base-content/70">
          Tutoring mode
        </label>
        <select
          className="select select-bordered select-sm w-full min-w-0 mt-1"
          value={item.tutoringLocation ?? tutoringLocation}
          onChange={(e) =>
            onUpdate(
              index,
              "tutoringLocation",
              e.target.value as "virtual" | "physical",
            )
          }
        >
          <option value="virtual">Virtual</option>
          <option value="physical">Physical</option>
        </select>
      </td>
    )}
    <td>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square mt-1"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        aria-label="Remove line"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </td>
  </tr>
  );
}

export default function ParentInvoiceBuilder({
  pastOnly = false,
  linkedBookingId,
  bookingContext,
  initialLineItems,
  onSave,
  onSubmitInvoice,
  saving = false,
}: ParentInvoiceBuilderProps) {
  const [pricing, setPricing] = useState<ServicePricingMap | null>(null);
  const [pricingError, setPricingError] = useState(false);
  const [tutoringLocation, setTutoringLocation] = useState<
    "virtual" | "physical"
  >(bookingContext?.tutoringLocation ?? "physical");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "applied" | "error">(
    "idle",
  );
  const [promoMessage, setPromoMessage] = useState("");
  const [lineItems, setLineItems] = useState<ParentInvoiceLineItem[]>(
    initialLineItems?.length ? initialLineItems : [emptyLine("past")],
  );
  const [loadingSessions, setLoadingSessions] = useState(false);

  const resolvedBookingCtx = resolveBookingPricingContext(
    bookingContext?.serviceData ?? bookingContext,
  );

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/services/pricing");
        const data = await res.json();
        if (data.success && data.data) {
          setPricing(data.data);
          if (!initialLineItems?.length) {
            setLineItems([emptyLine("past", data.data, tutoringLocation)]);
          }
        } else {
          setPricingError(true);
        }
      } catch {
        setPricingError(true);
      }
    };
    fetchPricing();
  }, [initialLineItems?.length, tutoringLocation]);

  useEffect(() => {
    if (bookingContext?.tutoringLocation) {
      setTutoringLocation(bookingContext.tutoringLocation);
    }
  }, [bookingContext?.tutoringLocation]);

  const getBookingHourlyRate = (location: "virtual" | "physical") => {
    if (!pricing) return 0;
    return getBookingHourlyRateForLocation(
      resolvedBookingCtx,
      pricing,
      location,
    );
  };

  const updateLine = (
    index: number,
    field: keyof ParentInvoiceLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        let next = { ...item, [field]: value };

        if (field === "serviceType" && pricing) {
          next = applyServiceDefaultsToLine(next, pricing, {
            tutoringLocation:
              next.tutoringLocation ?? tutoringLocation,
            bookingHourlyRate:
              next.serviceType === "tutoring"
                ? getBookingHourlyRate(
                    (next.tutoringLocation ?? tutoringLocation) as
                      | "virtual"
                      | "physical",
                  )
                : undefined,
          });
        }

        if (
          field === "tutoringLocation" &&
          pricing &&
          next.serviceType === "tutoring"
        ) {
          const loc = value as "virtual" | "physical";
          const rate =
            promoStatus === "applied" && loc === "virtual"
              ? next.unitPrice
              : getBookingHourlyRate(loc);
          next.unitPrice = rate;
          next.total = next.quantity * rate;
        }

        if (field === "quantity" || field === "unitPrice") {
          const qty =
            field === "quantity" ? Number(value) : next.quantity;
          const price =
            field === "unitPrice" ? Number(value) : next.unitPrice;
          next.total = qty * price;
        }

        if (field === "description" && pricing) {
          next = applyServiceDefaultsToLine(next, pricing, {
            tutoringLocation: next.tutoringLocation ?? tutoringLocation,
            bookingHourlyRate:
              next.serviceType === "tutoring"
                ? getBookingHourlyRate(
                    (next.tutoringLocation ?? tutoringLocation) as
                      | "virtual"
                      | "physical",
                  )
                : undefined,
          });
        }

        return next;
      }),
    );
  };

  const addLine = (sessionKind: ParentInvoiceSessionKind) => {
    setLineItems((prev) => [
      ...prev,
      emptyLine(sessionKind, pricing ?? undefined, tutoringLocation),
    ]);
  };

  const removeLine = (index: number) => {
    setLineItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const applyTutoringLocation = (location: "virtual" | "physical") => {
    setTutoringLocation(location);
    if (promoStatus === "applied" && location === "physical") {
      setPromoStatus("idle");
      setPromoMessage("");
    }
    if (!pricing) return;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.serviceType !== "tutoring") return item;
        const rate = getBookingHourlyRate(location);
        return {
          ...item,
          tutoringLocation: location,
          unitPrice: rate,
          total: item.quantity * rate,
        };
      }),
    );
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Enter a promo code first.");
      setPromoStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/promotions/eduvanta/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          tutoringLocation,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setPromoStatus("applied");
        setPromoMessage(result.message || "Promo applied.");
        if (typeof result.data.discountedRate === "number") {
          const rate = result.data.discountedRate;
          setLineItems((prev) =>
            prev.map((item) =>
              item.serviceType === "tutoring"
                ? {
                    ...item,
                    tutoringLocation: "virtual",
                    unitPrice: rate,
                    total: item.quantity * rate,
                  }
                : item,
            ),
          );
          setTutoringLocation("virtual");
        }
      } else {
        setPromoStatus("error");
        setPromoMessage(result.error || "Invalid promo code.");
      }
    } catch {
      setPromoStatus("error");
      setPromoMessage("Unable to validate promo code.");
    }
  };

  const maybeAddCampDiscount = () => {
    const discountLine = suggestSummerCampDiscountLine(lineItems);
    if (discountLine) {
      setLineItems((prev) => [...prev, discountLine]);
    }
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tutoringRates = pricing ? getTutoringRatesFromPricing(pricing) : null;

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
          hours?: number;
          unitPrice?: number;
          tutoringLocation?: "virtual" | "physical";
        }) => {
          const hours = s.hours ?? 1;
          const unitPrice = s.unitPrice ?? 0;
          return {
            date: s.date,
            childName: s.childName,
            serviceType: s.serviceType,
            description: s.description,
            quantity: hours,
            unitPrice,
            total: hours * unitPrice,
            sessionKind: "future" as ParentInvoiceSessionKind,
            tutoringLocation: s.tutoringLocation,
          };
        },
      );

      setLineItems((prev) => {
        const merged = [...prev, ...newLines];
        const discount = suggestSummerCampDiscountLine(merged);
        return discount ? [...merged, discount] : merged;
      });
    } finally {
      setLoadingSessions(false);
    }
  };

  const pastIndices = lineItems
    .map((item, i) => (item.sessionKind === "past" ? i : -1))
    .filter((i) => i >= 0);
  const futureIndices = lineItems
    .map((item, i) => (item.sessionKind === "future" ? i : -1))
    .filter((i) => i >= 0);

  const renderSection = (
    title: string,
    helper: string,
    indices: number[],
    sessionKind: ParentInvoiceSessionKind,
  ) => (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-base-content">{title}</h4>
          <p className="text-xs text-base-content/60">{helper}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => addLine(sessionKind)}
        >
          <PlusIcon className="w-4 h-4" />
          Add {sessionKind} line
        </button>
      </div>

      {indices.length === 0 ? (
        <p className="text-sm text-base-content/50 py-2">
          No {sessionKind} session lines yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="table table-sm w-full min-w-[56rem]">
            <thead>
              <tr className="text-xs text-base-content/70">
                <th>Session date</th>
                <th>Child name</th>
                <th>Service</th>
                <th>Session details</th>
                <th>Hours / units</th>
                <th>Price per unit</th>
                <th>Line total</th>
                <th>Timing</th>
                {pricing && <th className="hidden xl:table-cell">Mode</th>}
                <th />
              </tr>
            </thead>
            <tbody>
              {indices.map((index) => (
                <LineRowFields
                  key={index}
                  item={lineItems[index]}
                  index={index}
                  pricing={pricing}
                  bookingCtx={bookingContext}
                  tutoringLocation={tutoringLocation}
                  onUpdate={updateLine}
                  onRemove={removeLine}
                  canRemove={lineItems.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-full">
      {pricingError && (
        <p className="text-sm text-warning">
          Could not load current rates. You can still enter prices manually.
        </p>
      )}

      {tutoringRates && (
        <div className="bg-base-200 border border-base-300 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Tutoring rates (from your plan)</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm ${
                tutoringLocation === "virtual" ? "btn-info" : "btn-outline"
              }`}
              onClick={() => applyTutoringLocation("virtual")}
            >
              Virtual — ₦{tutoringRates.virtual.toLocaleString()}/hr
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                tutoringLocation === "physical" ? "btn-neutral" : "btn-outline"
              }`}
              onClick={() => applyTutoringLocation("physical")}
            >
              Physical — ₦{tutoringRates.physical.toLocaleString()}/hr
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-base-content/70">
                Promo code (virtual tutoring)
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full mt-1"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Optional promo code"
              />
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={applyPromo}
            >
              Apply promo
            </button>
          </div>
          {promoMessage && (
            <p
              className={`text-xs ${
                promoStatus === "error" ? "text-error" : "text-success"
              }`}
            >
              {promoMessage}
            </p>
          )}
        </div>
      )}

      {linkedBookingId && !pastOnly && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadFutureSessions}
          disabled={loadingSessions}
        >
          {loadingSessions ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Import future sessions from linked booking"
          )}
        </button>
      )}

      {renderSection(
        "Past sessions",
        "Sessions your child has already attended. Add each session manually.",
        pastIndices,
        "past",
      )}

      {!pastOnly &&
        renderSection(
          "Future sessions",
          "Upcoming sessions not yet attended. Link a booking to import, or add manually.",
          futureIndices,
          "future",
        )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={maybeAddCampDiscount}
        >
          Check summer camp discount
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-base-300">
        <div>
          <p className="text-lg font-bold">
            Invoice total: ₦{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-base-content/60">
            Total updates automatically as you add or edit sessions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline"
            disabled={saving}
            onClick={() => onSave(lineItems, linkedBookingId)}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Save draft"
            )}
          </button>
          {onSubmitInvoice && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={() => onSubmitInvoice(lineItems, linkedBookingId)}
            >
              Submit invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
