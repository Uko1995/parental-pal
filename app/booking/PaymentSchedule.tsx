interface PaymentScheduleProps {
  totalHours?: number;
  serviceCost?: number;
  totalDays?: number;
  childcare?: boolean;
  isMonthSelected?: boolean;
  monthlyChildcareRate?: number;
  event?: boolean;
  eventMode?: string;
  selectedServices?: Array<string | { service: string; quantity: number }>;
  // Holiday camp — new flat-fee props
  holidayCamp?: boolean;
  numberOfChildren?: number; // number of children registered
  campFee?: number; // flat fee per child
  // Legacy weekly props (kept for backwards compat but unused for holiday camp)
  totalWeeks?: number;
  // Shared discount
  discountAmount?: number;
  discountLabel?: string;
}

// Fixed camp dates shown in summary
const CAMP_LABEL = "April 7 – April 25, 2026";

function PaymentSchedule({
  totalHours,
  childcare,
  serviceCost = 0,
  totalDays,
  isMonthSelected,
  monthlyChildcareRate,
  event,
  holidayCamp,
  numberOfChildren = 1,
  campFee = 0,
  eventMode,
  selectedServices,
  discountAmount = 0,
  discountLabel,
}: PaymentScheduleProps) {
  // Helper to format currency
  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  // ─── Holiday Camp: flat one-time calculation ───────────────────────────────
  if (holidayCamp) {
    const subtotal = numberOfChildren * campFee;
    const totalCost = Math.max(0, subtotal - (discountAmount || 0));

    return (
      <div className="mt-4 space-y-2">
        <div className="text-base flex justify-between text-gray-600 bg-green-50 p-5 rounded-lg border border-green-200">
          <span className="font-bold">
            Easter Camp
            <br />
            <span className="text-xs text-gray-500 font-normal">
              {CAMP_LABEL}
            </span>
          </span>
          <span className="text-right">
            <span className="block">
              {numberOfChildren} {numberOfChildren === 1 ? "child" : "children"}{" "}
              × {formatCurrency(campFee)}
            </span>
            {discountAmount > 0 && (
              <span className="block text-sm text-green-700 mt-1">
                {discountLabel || "Discount"}: -{formatCurrency(discountAmount)}
              </span>
            )}
            <span className="block font-semibold mt-1">
              Total: {formatCurrency(totalCost)}
            </span>
          </span>
        </div>
        <input type="hidden" name="totalCost" value={totalCost} />
      </div>
    );
  }

  // ─── All other service types (unchanged logic) ─────────────────────────────
  const totalTime = childcare ? totalDays : totalHours;

  const preDiscountTotalCost =
    isMonthSelected && monthlyChildcareRate
      ? monthlyChildcareRate
      : (totalTime || 0) * serviceCost;

  const totalCost = Math.max(0, preDiscountTotalCost - (discountAmount || 0));

  // Event mode pricing
  const getEventModeCost = () => {
    switch (eventMode) {
      case "indoor":
        return 350000;
      case "outdoor":
        return 350000;
      case "both":
        return 644000;
      default:
        return 0;
    }
  };

  // Extra services pricing
  const servicesPricing: Record<string, number> = {
    dj: 150000,
    mc: 60000,
    "event-planning": 150000,
    "extra-carers": 8000,
  };

  const calculateExtraServicesCost = () => {
    if (!selectedServices) return 0;

    return selectedServices.reduce((total, service) => {
      if (typeof service === "string") {
        return total + (servicesPricing[service] || 0);
      } else {
        const serviceName = service.service;
        const serviceRate = servicesPricing[serviceName] || 0;
        const quantity = service.quantity || 1;
        return total + serviceRate * quantity;
      }
    }, 0);
  };

  const eventModeCost = event ? getEventModeCost() : 0;
  const extraServicesCost = calculateExtraServicesCost();
  const totalEventCost = eventModeCost + extraServicesCost;

  return (
    <>
      {(totalHours || totalDays || event) && (
        <div className="mt-4 text-base flex justify-between text-gray-600 bg-green-50 p-5 rounded-lg border border-green-200">
          <span className="font-bold">
            {event
              ? "Event Services"
              : childcare
                ? isMonthSelected
                  ? ` Childcare (₦${serviceCost.toLocaleString()}/day) 15% discount per month`
                  : ` Childcare (₦${serviceCost.toLocaleString()}/day)`
                : ` Academic tutoring (₦${serviceCost.toLocaleString()}/hour)`}
          </span>
          <span>
            {event
              ? `Event Package • Cost: ₦${totalEventCost.toLocaleString()}`
              : isMonthSelected
                ? "Full Month"
                : `${totalTime}${childcare ? " day" : " hour"}${
                    totalTime !== 1 ? "s" : ""
                  }`}
            {!event && (
              <>
                {"   "}
                {"   "}
                {"   "} • Cost: <b>₦{totalCost.toLocaleString()}</b>
              </>
            )}
          </span>
          <input
            type="hidden"
            name="totalCost"
            value={event ? totalEventCost : totalCost}
          />
        </div>
      )}

      {/* Event Services Breakdown */}
      {event &&
        (eventMode || (selectedServices && selectedServices.length > 0)) && (
          <div className="mt-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3">
              Service Breakdown:
            </h4>

            {eventMode && (
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>
                  {eventMode === "indoor"
                    ? "Indoor Event"
                    : eventMode === "outdoor"
                      ? "Outdoor Event"
                      : "Indoor & Outdoor Event"}
                </span>
                <span>{formatCurrency(getEventModeCost())}</span>
              </div>
            )}

            {selectedServices &&
              selectedServices.map((service, index) => {
                if (typeof service === "string") {
                  const cost = servicesPricing[service] || 0;
                  const serviceName =
                    service === "dj"
                      ? "DJ"
                      : service === "mc"
                        ? "MC (Master of Ceremonies)"
                        : service === "event-planning"
                          ? "Event Planning"
                          : service === "extra-carers"
                            ? "Extra Carers"
                            : service;
                  return (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-700 mb-1"
                    >
                      <span>{serviceName}</span>
                      <span>{formatCurrency(cost)}</span>
                    </div>
                  );
                } else {
                  const serviceName =
                    service.service === "dj"
                      ? "DJ"
                      : service.service === "mc"
                        ? "MC (Master of Ceremonies)"
                        : service.service === "event-planning"
                          ? "Event Planning"
                          : service.service === "extra-carers"
                            ? `Extra Carers (x${service.quantity || 1})`
                            : service.service;
                  const serviceRate = servicesPricing[service.service] || 0;
                  const cost = serviceRate * (service.quantity || 1);
                  return (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-700 mb-1"
                    >
                      <span>{serviceName}</span>
                      <span>{formatCurrency(cost)}</span>
                    </div>
                  );
                }
              })}

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm text-orange-600 font-medium">
                <span>Refundable Caution Fee</span>
                <span>{formatCurrency(50000)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                This fee will be fully refunded after the event if no damages
                occur.
              </p>
            </div>
          </div>
        )}
    </>
  );
}

export default PaymentSchedule;
